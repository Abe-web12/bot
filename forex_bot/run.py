"""
run.py
======
Main entry point. Startup sequence:
  1. Logging (JSON structured) configured first.
  2. Database migrations applied.
  3. Startup validation — blocks if any CRITICAL check fails.
  4. metrics_subscriber + persistence_subscriber wired to the event bus
     (must be running before Telegram/MT5 connect so BOT_STARTED etc.
     are captured into metrics/journal/bot_events from the very first event).
  5. Telegram service started.
  6. MT5 connected (demo-only safety gate enforced in connector).
  7. Risk guard initialised.
  8. Heartbeat + execution engine started.
  9. Persistent queue recovery (replay crashed intents).
 10. Signal orchestrator started (Signal Generator -> Scorer -> Risk ->
     Persistent Queue -> Execution Engine — the only path a signal can
     take to become an order).
 11. Equity snapshot scheduler started.
 12. API server (REST + WebSocket) started in background thread.
 13. Bot status -> RUNNING.
 14. Main thread idles, refreshing metrics gauges, waiting for SIGINT/SIGTERM.

Shutdown sequence (reverse):
  - Signal orchestrator stopped (no new signals evaluated).
  - Equity snapshot scheduler stopped.
  - Execution engine stopped (finishes current in-flight order).
  - Heartbeat stopped.
  - MT5 disconnected.
  - Telegram flushed and stopped.
"""

from __future__ import annotations

import logging
import signal
import sys
import threading
import time

from core.logging_setup import configure_logging
configure_logging()

logger = logging.getLogger("run")

import config
from bot.heartbeat import heartbeat
from bot.mt5_client import init_client
from bot.mt5_connector import LiveAccountBlockedError, MT5ConnectionError, connector
from core import metrics_subscriber, persistence_subscriber
from core.equity_snapshot_scheduler import equity_snapshot_scheduler
from core.event_bus import Events, bus
from core.metrics import metrics
from services.email_service import email_service
from core.startup_validator import startup_validator
from core.state_manager import BotStatus, state
from database.connection import init_db
from database.migrations import migration_runner
from execution.execution_engine import execution_engine
from core.bot_controller import bot_controller
from core.background_workers import worker_manager
from execution.persistent_queue import PersistentQueueManager
from notifications.telegram_service import telegram_service
from risk.drawdown_guard import drawdown_guard
from strategy.signal_orchestrator import SignalOrchestrator

_shutdown_requested = False
_persistent_queue: PersistentQueueManager | None = None
_signal_orchestrator: SignalOrchestrator | None = None


def _handle_shutdown_signal(signum, frame) -> None:
    global _shutdown_requested
    logger.info("Shutdown signal received (%s). Stopping gracefully...", signum)
    _shutdown_requested = True


def _start_api_server() -> threading.Thread:
    """Start the API server in a daemon thread.

    Uses Gunicorn with gevent workers when available (production).
    Falls back to Flask's built-in server for local development only.
    Gunicorn is required for concurrent WebSocket + REST in production.
    """
    def _run():
        try:
            from api.app import create_app
            app = create_app()

            # Try Gunicorn first (production)
            try:
                import gunicorn.app.base  # noqa: F401

                class _StandaloneApp(gunicorn.app.base.BaseApplication):
                    def __init__(self, application, options=None):
                        self.options = options or {}
                        self.application = application
                        super().__init__()

                    def load_config(self):
                        for key, value in self.options.items():
                            if key in self.cfg.settings and value is not None:
                                self.cfg.set(key.lower(), value)

                    def load(self):
                        return self.application

                worker_class = "gevent"
                try:
                    import gevent  # noqa: F401
                except ImportError:
                    worker_class = "gthread"
                    logger.warning(
                        "gevent not installed — using gthread workers. "
                        "Install gevent for full WebSocket support."
                    )

                options = {
                    "bind": f"{config.SERVER_HOST}:{config.SERVER_PORT}",
                    "workers": 1,          # single worker — trading state is process-local
                    "worker_class": worker_class,
                    "worker_connections": 1000,
                    "timeout": 120,
                    "keepalive": 5,
                    "loglevel": "warning",
                    "accesslog": "-",
                    "errorlog": "-",
                    "preload_app": False,  # must be False — app uses background threads
                }
                logger.info(
                    "Starting Gunicorn (%s) on %s:%d",
                    worker_class, config.SERVER_HOST, config.SERVER_PORT,
                )
                _StandaloneApp(app, options).run()

            except ImportError:
                logger.warning(
                    "Gunicorn not installed — falling back to Flask dev server. "
                    "Install gunicorn and gevent for production use."
                )
                app.run(
                    host=config.SERVER_HOST,
                    port=config.SERVER_PORT,
                    debug=False,
                    use_reloader=False,
                    threaded=True,
                )
        except Exception:
            logger.exception("API server crashed.")

    t = threading.Thread(target=_run, name="api-server", daemon=True)
    t.start()
    logger.info("API server started on %s:%d", config.SERVER_HOST, config.SERVER_PORT)
    return t


def main() -> int:
    global _persistent_queue

    signal.signal(signal.SIGINT, _handle_shutdown_signal)
    signal.signal(signal.SIGTERM, _handle_shutdown_signal)

    logger.info("=" * 60)
    logger.info("Forex Trading Bot — Starting Up")
    logger.info("=" * 60)

    state.set_bot_status(BotStatus.STARTING)

    # ----------------------------------------------------------------
    # Step 1: Database migrations
    # ----------------------------------------------------------------
    try:
        init_db()
        migration_runner.run_all()
    except Exception as exc:
        logger.critical("Database migration failed: %s", exc)
        return 1

    # ----------------------------------------------------------------
    # Step 2: Startup validation
    # ----------------------------------------------------------------
    report = startup_validator.run()
    if not report.can_start:
        logger.critical("Startup blocked by %d critical failure(s).", len(report.failed_critical))
        return 1

    # ----------------------------------------------------------------
    # Step 2b: Wire event-bus subscribers BEFORE anything can publish
    # BOT_STARTED/MT5_CONNECTED — otherwise the very first events of the
    # session would be missed by metrics/journal/bot_events.
    # ----------------------------------------------------------------
    metrics_subscriber.start()
    persistence_subscriber.start()

    # ----------------------------------------------------------------
    # Step 3: Telegram early start (so startup errors are notified)
    # ----------------------------------------------------------------
    telegram_service.start()

    # ----------------------------------------------------------------
    # Step 3b: Email service (gracefully disabled if SMTP not configured)
    # ----------------------------------------------------------------
    email_service.start()

    # ----------------------------------------------------------------
    # Step 3c: Initialize MT5 client (direct or bridge)
    # ----------------------------------------------------------------
    try:
        init_client(mode=config.MT5_MODE, bridge_url=config.MT5_BRIDGE_URL)
    except Exception as exc:
        logger.critical("MT5 client initialization failed: %s", exc)
        state.set_bot_status(BotStatus.ERROR, reason="mt5_client_init_failed")
        telegram_service.stop()
        return 1

    # ----------------------------------------------------------------
    # Step 4: MT5 connection
    # ----------------------------------------------------------------
    try:
        connector.connect()
    except LiveAccountBlockedError as exc:
        logger.critical("REFUSING TO START: %s", exc)
        state.set_bot_status(BotStatus.ERROR, reason="live_account_blocked")
        telegram_service.send_message_sync(
            "🚨 *Bot REFUSED to start*\nReason: Live account detected \\— demo only\\."
        )
        telegram_service.stop()
        return 1
    except MT5ConnectionError as exc:
        logger.critical("Could not connect to MT5: %s", exc)
        state.set_bot_status(BotStatus.ERROR, reason="mt5_connection_failed")
        telegram_service.send_message_sync(
            f"🚨 *Bot FAILED to start*\nMT5 error: {str(exc)[:200]}"
        )
        telegram_service.stop()
        return 1

    # ----------------------------------------------------------------
    # Step 5: Risk guard init
    # ----------------------------------------------------------------
    drawdown_guard.load_peak_equity()   # restore persisted peak from DB
    drawdown_guard.ensure_daily_stats_current()
    drawdown_guard.update_peak_equity()

    account = state.account
    metrics.set_gauge("balance", account.balance)
    metrics.set_gauge("equity", account.equity)

    # ----------------------------------------------------------------
    # Step 6: Start services
    # ----------------------------------------------------------------
    heartbeat.start()
    execution_engine.start()

    # ----------------------------------------------------------------
    # Step 7: Persistent queue recovery
    # ----------------------------------------------------------------
    _persistent_queue = PersistentQueueManager(execution_engine)
    recovered = _persistent_queue.recover_pending()
    if recovered:
        logger.info("Recovered %d pending trade intent(s) from previous session.", recovered)

    # ----------------------------------------------------------------
    # Step 7b: Signal orchestrator — the ONLY path from a generated
    # signal to a queued order. Built on the same PersistentQueueManager
    # instance used for crash recovery above.
    # ----------------------------------------------------------------
    global _signal_orchestrator
    _signal_orchestrator = SignalOrchestrator(_persistent_queue)
    _signal_orchestrator.start()

    # Bind the bot_controller singleton so api/routes/bot.py (running in
    # the API server thread started below) can reach these components —
    # without this, pause/resume/stop/kill-switch endpoints would have
    # no handle on the actual running orchestrator/engine instances.
    bot_controller.bind(execution_engine, _persistent_queue, _signal_orchestrator)

    # ----------------------------------------------------------------
    # Step 7c: Equity snapshot scheduler
    # ----------------------------------------------------------------
    equity_snapshot_scheduler.start()
    worker_manager.start()

    # ----------------------------------------------------------------
    # Step 8: API server (REST + WebSocket)
    # ----------------------------------------------------------------
    _start_api_server()

    # ----------------------------------------------------------------
    # Step 9: RUNNING
    # ----------------------------------------------------------------
    state.set_bot_status(BotStatus.RUNNING, reason="startup_complete")
    metrics.set_gauge("bot_status", state.bot_status.value)
    metrics.set_gauge("connection_status", state.connection_status.value)

    bus.publish(
        Events.BOT_STARTED,
        {
            "mode": "DEMO" if state.is_demo_account else "LIVE",
            "account": {
                "balance": account.balance,
                "equity": account.equity,
                "currency": account.currency,
            },
            "recovered_intents": recovered,
        },
        source="run",
    )

    logger.info(
        "Bot running. Account=%s | Balance=%.2f %s | Demo=%s | API=http://%s:%d",
        connector._login, account.balance, account.currency,
        state.is_demo_account, config.SERVER_HOST, config.SERVER_PORT,
    )

    # ----------------------------------------------------------------
    # Step 10: Main loop (metrics refresh + idle)
    # ----------------------------------------------------------------
    try:
        while not _shutdown_requested:
            # Update gauges each minute from live state.
            acc = state.account
            metrics.set_gauge("balance", acc.balance)
            metrics.set_gauge("equity", acc.equity)
            metrics.set_gauge("open_trades", state.open_position_count)
            metrics.set_gauge("drawdown_pct", drawdown_guard.current_drawdown_pct())
            metrics.set_gauge("daily_pnl", state.daily_stats.realized_pnl)
            metrics.set_gauge("bot_status", state.bot_status.value)
            metrics.set_gauge("connection_status", state.connection_status.value)
            time.sleep(60)
    finally:
        logger.info("Initiating graceful shutdown...")
        state.set_bot_status(BotStatus.STOPPING)

        if _signal_orchestrator:
            _signal_orchestrator.stop()
        equity_snapshot_scheduler.stop()
        worker_manager.stop()
        execution_engine.stop()
        heartbeat.stop()
        connector.disconnect()

        state.set_bot_status(BotStatus.STOPPED, reason="graceful_shutdown")
        time.sleep(2)  # Allow Telegram BOT_STOPPED notification to flush
        telegram_service.stop()
        logger.info("Shutdown complete.")

    return 0


if __name__ == "__main__":
    sys.exit(main())

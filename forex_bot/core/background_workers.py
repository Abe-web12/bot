"""
background_workers.py
========================
Coordinates background threads that don't belong to any single existing
module:

  1. DashboardTickWorker — periodically polls continuously-valued state
     (account, market ticks, risk, health, metrics) and publishes it as
     synthetic bus events (ACCOUNT_TICK, MARKET_TICK, RISK_TICK,
     HEALTH_TICK, METRICS_TICK) so the WebSocket layer can stream it.

     HONESTY NOTE: this is polling, not true push streaming from MT5.
     The official MetaTrader5 Python package has no callback/subscription
     API — every value it exposes (tick, account_info, positions) is
     read via a synchronous call that returns the current value at the
     moment of the call. "Real-time" MT5 data in any Python integration
     built on this package means "polled frequently enough that the UI
     feels live," not "the broker pushes it to us." This worker is that
     honest implementation — a short poll interval (default 2s) — not a
     websocket-to-broker tick feed, which the MT5 Python API cannot
     provide.

  2. CleanupWorker — periodically calls the cleanup_expired() methods
     that IdempotencyRepository and RefreshTokenRepository already had
     but that nothing was calling. Real gap closed here: without this,
     both tables grow forever.

  3. CacheWarmWorker — periodically triggers the expensive
     analytics/chart queries so their results are already in
     api.cache's TTL cache when a dashboard client actually asks for
     them (removes the "first request after cache expiry is slow"
     latency spike from the user-facing path).
"""

from __future__ import annotations

import logging
import threading

import config
from core.event_bus import bus
from core.state_manager import BotStatus, state

logger = logging.getLogger("background_workers")


class BackgroundWorker:
    """Base class for a simple interval-loop daemon thread."""

    def __init__(self, name: str, interval_seconds: float) -> None:
        self._name = name
        self._interval = interval_seconds
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._loop, name=self._name, daemon=True)
        self._thread.start()
        logger.info("%s started (interval=%.1fs).", self._name, self._interval)

    def stop(self, timeout_seconds: float = 5.0) -> None:
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=timeout_seconds)
        logger.info("%s stopped.", self._name)

    def is_running(self) -> bool:
        return bool(self._thread and self._thread.is_alive())

    def _loop(self) -> None:
        while not self._stop_event.wait(self._interval):
            try:
                self.run_once()
            except Exception:
                logger.exception("%s: unhandled exception in run_once().", self._name)

    def run_once(self) -> None:
        raise NotImplementedError


class DashboardTickWorker(BackgroundWorker):
    def __init__(self, interval_seconds: float = 2.0) -> None:
        super().__init__("dashboard-tick-worker", interval_seconds)

    def run_once(self) -> None:
        if state.bot_status not in (BotStatus.RUNNING, BotStatus.PAUSED):
            return  # don't poll MT5 when the bot isn't even connected/running

        self._publish_account_tick()
        self._publish_market_tick()
        self._publish_risk_tick()
        self._publish_health_tick()
        self._publish_metrics_tick()

    def _publish_account_tick(self) -> None:
        try:
            from services.services import AccountService
            account_dto = AccountService().get_account()
            bus.publish("ACCOUNT_TICK", account_dto.to_dict(), source="dashboard_tick_worker")
        except Exception:
            logger.debug("DashboardTickWorker: account tick failed.", exc_info=True)

    def _publish_market_tick(self) -> None:
        try:
            from services.services import MarketService
            ticks = MarketService().get_all_symbol_ticks()
            bus.publish("MARKET_TICK", ticks, source="dashboard_tick_worker")
        except Exception:
            logger.debug("DashboardTickWorker: market tick failed.", exc_info=True)

    def _publish_risk_tick(self) -> None:
        try:
            from services.services import RiskService
            snapshot = RiskService().get_risk_snapshot()
            bus.publish("RISK_TICK", snapshot, source="dashboard_tick_worker")
        except Exception:
            logger.debug("DashboardTickWorker: risk tick failed.", exc_info=True)

    def _publish_health_tick(self) -> None:
        try:
            from services.services import HealthService
            summary = HealthService().get_health_summary()
            bus.publish("HEALTH_TICK", summary, source="dashboard_tick_worker")
        except Exception:
            logger.debug("DashboardTickWorker: health tick failed.", exc_info=True)

    def _publish_metrics_tick(self) -> None:
        try:
            from core.metrics import metrics
            snapshot = metrics.snapshot()
            bus.publish("METRICS_TICK", snapshot, source="dashboard_tick_worker")
        except Exception:
            logger.debug("DashboardTickWorker: metrics tick failed.", exc_info=True)


class CleanupWorker(BackgroundWorker):
    """Closes a real gap: IdempotencyRepository.cleanup_expired() and
    RefreshTokenRepository.cleanup_expired() existed but nothing called
    them periodically, so both tables would grow without bound."""

    def __init__(self, interval_seconds: float = 3600.0) -> None:
        super().__init__("cleanup-worker", interval_seconds)

    def run_once(self) -> None:
        from database.connection import unit_of_work
        from database.repositories import IdempotencyRepository, RefreshTokenRepository

        with unit_of_work() as session:
            idem_deleted = IdempotencyRepository(session).cleanup_expired()
            token_deleted = RefreshTokenRepository(session).cleanup_expired()

        if idem_deleted or token_deleted:
            logger.info(
                "CleanupWorker: removed %d expired idempotency record(s), %d expired refresh token(s).",
                idem_deleted, token_deleted,
            )


class CacheWarmWorker(BackgroundWorker):
    """Pre-computes expensive analytics so the TTL cache is warm before
    a dashboard client actually requests it."""

    def __init__(self, interval_seconds: float = 8.0) -> None:
        super().__init__("cache-warm-worker", interval_seconds)

    def run_once(self) -> None:
        try:
            from services.services import AnalyticsService
            AnalyticsService().get_statistics()
            AnalyticsService().get_equity_curve()
        except Exception:
            logger.debug("CacheWarmWorker: warm cycle failed.", exc_info=True)


class WorkerManager:
    """Owns the lifecycle of every background worker. run.py calls
    start()/stop() once, symmetrically with every other subsystem."""

    def __init__(self) -> None:
        self.dashboard_tick = DashboardTickWorker()
        self.cleanup = CleanupWorker()
        self.cache_warm = CacheWarmWorker()

    def start(self) -> None:
        self.dashboard_tick.start()
        self.cleanup.start()
        self.cache_warm.start()

    def stop(self) -> None:
        self.dashboard_tick.stop()
        self.cleanup.stop()
        self.cache_warm.stop()

    def status(self) -> dict:
        return {
            "dashboard_tick": self.dashboard_tick.is_running(),
            "cleanup": self.cleanup.is_running(),
            "cache_warm": self.cache_warm.is_running(),
        }


# Single shared instance for the whole process.
worker_manager = WorkerManager()

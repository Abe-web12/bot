"""
bot_controller.py
====================
ARCHITECTURE NOTE (read before modifying): prior to this module,
run.py's main() created the SignalOrchestrator as a local variable,
making it unreachable from anywhere else in the process — including the
API layer, which has no way to pause, resume, or restart signal
evaluation without this fix. This module promotes that lifecycle
ownership into a proper singleton that both run.py and
api/routes/bot.py call into, so there is exactly one place that
starts/stops the trading subsystems, not two independent
implementations that could drift out of sync.

This module does NOT own MT5 connection lifecycle (connector.connect/
disconnect) or the Flask/WebSocket server — those remain in run.py,
started once at process startup and torn down only on full process
shutdown. What this module DOES own is the part of the system that
makes sense to pause/resume/restart independently while the process
keeps running: the execution engine's queue worker + position
management loop, and the signal orchestrator's evaluation loop.

Emergency stop vs kill switch — deliberately different severity:
  - kill_switch(): stops NEW trades from being opened (sets
    BotStatus.KILLED, which both the risk gate and execution engine
    already check). Existing open positions are left alone.
  - emergency_stop(): kill_switch() PLUS immediately closes every open
    position at market. This is the "get out of everything now" button.
"""

from __future__ import annotations

import logging
import threading

from core.event_bus import Events, bus
from core.state_manager import BotStatus, ConnectionStatus, state
from execution.execution_engine import ExecutionEngine
from execution.persistent_queue import PersistentQueueManager
from strategy.signal_orchestrator import SignalOrchestrator

logger = logging.getLogger("bot_controller")


class BotControllerError(Exception):
    pass


class BotController:
    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._execution_engine: ExecutionEngine | None = None
        self._persistent_queue: PersistentQueueManager | None = None
        self._orchestrator: SignalOrchestrator | None = None
        self._is_bound = False

    def bind(self, execution_engine: ExecutionEngine, persistent_queue: PersistentQueueManager,
              orchestrator: SignalOrchestrator) -> None:
        """Called once by run.py after constructing these components at
        process startup. Must happen before any control method is used."""
        with self._lock:
            self._execution_engine = execution_engine
            self._persistent_queue = persistent_queue
            self._orchestrator = orchestrator
            self._is_bound = True
        logger.info("BotController bound to execution engine and signal orchestrator.")

    def _require_bound(self) -> None:
        if not self._is_bound:
            raise BotControllerError("BotController is not bound yet — the bot has not finished starting up.")

    # ------------------------------------------------------------------
    # Lifecycle controls
    # ------------------------------------------------------------------
    def start_trading(self) -> dict:
        self._require_bound()
        with self._lock:
            if state.connection_status != ConnectionStatus.CONNECTED:
                raise BotControllerError("Cannot start trading: MT5 is not connected.")
            if state.bot_status == BotStatus.RUNNING:
                return {"status": "already_running", "bot_status": state.bot_status.value}

            state.set_bot_status(BotStatus.RUNNING, reason="api_start")
            if not self._orchestrator._thread or not self._orchestrator._thread.is_alive():
                self._orchestrator.start()
            if not self._execution_engine.is_running():
                self._execution_engine.start()

        logger.info("Bot trading started via API.")
        return {"status": "started", "bot_status": state.bot_status.value}

    def pause_trading(self, reason: str = "api_pause") -> dict:
        """
        Pauses without tearing down threads — the orchestrator/engine
        loops check state.bot_status == RUNNING on every tick and skip
        work while PAUSED, so pausing/resuming never recreates threads.
        """
        self._require_bound()
        with self._lock:
            state.set_bot_status(BotStatus.PAUSED, reason=reason)
        logger.info("Bot trading paused via API: %s", reason)
        return {"status": "paused", "bot_status": state.bot_status.value}

    def resume_trading(self) -> dict:
        self._require_bound()
        with self._lock:
            if state.connection_status != ConnectionStatus.CONNECTED:
                raise BotControllerError("Cannot resume trading: MT5 is not connected.")
            if state.bot_status == BotStatus.KILLED:
                raise BotControllerError(
                    "Cannot resume: bot is in KILLED state. Use start_trading() after "
                    "manual review, not resume_trading()."
                )
            state.set_bot_status(BotStatus.RUNNING, reason="api_resume")
        logger.info("Bot trading resumed via API.")
        return {"status": "resumed", "bot_status": state.bot_status.value}

    def stop_trading(self) -> dict:
        """
        Graceful stop of the trading subsystems (threads actually joined
        and stopped) while MT5 stays connected and the API/WebSocket
        server stays alive. NOT a process exit — restarting the whole OS
        process from within itself needs an external supervisor
        (systemd/pm2/Task Scheduler), outside this codebase's scope.
        """
        self._require_bound()
        with self._lock:
            state.set_bot_status(BotStatus.STOPPING, reason="api_stop")
            self._orchestrator.stop()
            self._execution_engine.stop()
            state.set_bot_status(BotStatus.STOPPED, reason="api_stop_complete")
        logger.info("Bot trading stopped via API.")
        return {"status": "stopped", "bot_status": state.bot_status.value}

    def restart_trading(self) -> dict:
        """Soft restart of orchestrator/engine threads in-process. Does
        not reconnect MT5 or restart the OS process."""
        self._require_bound()
        with self._lock:
            if state.bot_status != BotStatus.STOPPED:
                self.stop_trading()
        result = self.start_trading()
        logger.info("Bot trading restarted via API.")
        return {"status": "restarted", "bot_status": result.get("bot_status", state.bot_status.value)}

    def kill_switch(self, reason: str = "api_kill_switch") -> dict:
        """
        Stops all NEW trade opening immediately. Existing positions are
        untouched. can_open_new_trade() and the execution engine's
        _process_intent() already refuse to act once bot_status is
        KILLED — this reuses those same gates, not a new parallel check.
        """
        self._require_bound()
        with self._lock:
            state.set_bot_status(BotStatus.KILLED, reason=reason)
        logger.critical("KILL SWITCH triggered via API: %s", reason)
        return {"status": "killed", "bot_status": state.bot_status.value, "positions_closed": 0}

    def emergency_stop(self, reason: str = "api_emergency_stop") -> dict:
        """kill_switch() PLUS closes every open position at market
        immediately. Each close is attempted independently."""
        self._require_bound()
        self.kill_switch(reason=reason)

        from execution.position_manager import position_manager
        from execution.trade_manager import TradeManagerError, execute_full_close

        closed = 0
        failed: list[dict] = []

        try:
            positions = position_manager.get_open_positions()
        except Exception as exc:
            logger.error("Emergency stop: could not fetch open positions: %s", exc)
            positions = []

        for position in positions:
            try:
                execute_full_close(position)
                closed += 1
            except TradeManagerError as exc:
                logger.error("Emergency stop: failed to close position %d: %s", position.ticket, exc)
                failed.append({"ticket": position.ticket, "error": str(exc)})

        bus.publish(
            Events.KILL_SWITCH_TRIGGERED,
            {"reason": reason, "action": "emergency_stop", "positions_closed": closed, "positions_failed": len(failed)},
            source="bot_controller",
        )

        logger.critical("EMERGENCY STOP executed: %d position(s) closed, %d failed.", closed, len(failed))
        return {
            "status": "emergency_stopped",
            "bot_status": state.bot_status.value,
            "positions_closed": closed,
            "positions_failed": failed,
        }

    def status(self) -> dict:
        return {
            "bot_status": state.bot_status.value,
            "connection_status": state.connection_status.value,
            "is_bound": self._is_bound,
            "orchestrator_running": bool(
                self._is_bound and self._orchestrator and self._orchestrator._thread
                and self._orchestrator._thread.is_alive()
            ),
            "execution_engine_running": self._execution_engine.is_running() if self._is_bound else False,
        }


# Single shared instance for the whole process. run.py calls bind()
# once at startup; api/routes/bot.py calls the control methods.
bot_controller = BotController()

"""
execution_engine.py
=====================
Orchestrates the complete pipeline from signal generation to order
execution and ongoing position management. This is the seam between the
strategy layer and the execution layer — strategy modules never call
execution modules directly, and execution modules never call strategy
modules. ExecutionEngine is the only object that crosses that boundary.

Architecture decisions:
  - A bounded queue.Queue serialises all execution attempts through one
    worker thread. This eliminates the race window between "check
    duplicate" and "place order" at the process level (the per-symbol
    lock in position_manager.py handles the in-flight window within the
    worker; the queue prevents two workers ever running concurrently).
  - Connection state is tracked via Events from the bus (published by
    state_manager when heartbeat triggers reconnect) rather than polling
    connector.is_connected() in every loop iteration.
  - Position management (breakeven / trailing) runs on a separate daemon
    thread at BOT_LOOP_INTERVAL cadence, decoupled from signal intake.
  - The engine NEVER calls mt5.order_send() — that is order_executor's
    exclusive responsibility.
"""

from __future__ import annotations

import logging
import queue
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone

import config
from core.event_bus import Events, bus
from core.state_manager import BotStatus, state
from execution.order_executor import (
    ExecutionResult,
    OrderExecutionError,
    OrderRejectedByBrokerError,
    OrderRejectedByRiskError,
    execute_market_order,
)
from execution.order_validator import OrderRequest, OrderSide
from execution.position_manager import DuplicatePositionError, position_manager
from execution.trade_manager import TradeManagerError, manage_open_positions
from market.data_feed import DataFeedError, get_latest_tick
from market.symbols import SymbolUnavailableError, get_validated_symbol_info, pip_size as compute_pip_size
from risk.lot_calculator import LotCalculationError, calculate_lot_size

logger = logging.getLogger("execution_engine")

# Maximum number of pending trade intents in the queue before new ones
# are dropped. Prevents unbounded memory growth if signals are generated
# faster than they can be executed (e.g. strategy scanning many symbols
# rapidly while MT5 is slow).
_QUEUE_MAX_SIZE = 50


class ExecutionEngineError(Exception):
    pass


@dataclass(frozen=True)
class TradeIntent:
    """
    A fully-specified trade decision produced by the strategy layer.
    Carries SL/TP prices already computed by signal_scorer/risk logic;
    execution_engine only decides HOW (lot size, timing) and WHETHER
    (validation, risk gate) to execute it.
    """
    symbol: str
    side: OrderSide
    stop_loss_price: float
    take_profit_price: float
    confidence: float
    magic_number: int
    queued_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    comment: str = ""


@dataclass
class EngineStats:
    intents_received: int = 0
    intents_discarded_low_confidence: int = 0
    intents_discarded_queue_full: int = 0
    executions_attempted: int = 0
    executions_succeeded: int = 0
    executions_rejected_risk: int = 0
    executions_rejected_broker: int = 0
    executions_rejected_duplicate: int = 0
    management_cycles: int = 0


class ExecutionEngine:
    def __init__(self, min_confidence_threshold: float | None = None) -> None:
        self._min_confidence = (
            min_confidence_threshold
            if min_confidence_threshold is not None
            else config.MIN_SIGNAL_SCORE
        )
        self._queue: queue.Queue[TradeIntent] = queue.Queue(maxsize=_QUEUE_MAX_SIZE)
        self._stop_event = threading.Event()
        self._worker_thread: threading.Thread | None = None
        self._management_thread: threading.Thread | None = None
        self._connection_ready = threading.Event()
        self._stats = EngineStats()
        self._stats_lock = threading.Lock()

        # Wire connection state from the event bus so this module does
        # not poll — it reacts.
        bus.subscribe(Events.MT5_CONNECTED, self._on_connected)
        bus.subscribe(Events.MT5_DISCONNECTED, self._on_disconnected)

        # Set connection_ready immediately if already connected at construction
        # time (engine started after successful connect in run.py).
        from core.state_manager import ConnectionStatus
        if state.connection_status == ConnectionStatus.CONNECTED:
            self._connection_ready.set()

    # ------------------------------------------------------------------
    # Event bus handlers
    # ------------------------------------------------------------------
    def _on_connected(self, event) -> None:
        logger.info("ExecutionEngine: MT5 connected — resuming queue processing.")
        self._connection_ready.set()

    def _on_disconnected(self, event) -> None:
        logger.warning("ExecutionEngine: MT5 disconnected — pausing queue processing.")
        self._connection_ready.clear()

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------
    def start(self) -> None:
        if self._worker_thread and self._worker_thread.is_alive():
            logger.warning("ExecutionEngine: worker thread already running, ignoring start().")
            return

        self._stop_event.clear()

        self._worker_thread = threading.Thread(
            target=self._worker_loop,
            name="exec-engine-worker",
            daemon=True,
        )
        self._worker_thread.start()

        self._management_thread = threading.Thread(
            target=self._management_loop,
            name="position-management",
            daemon=True,
        )
        self._management_thread.start()

        logger.info(
            "ExecutionEngine started (min_confidence=%.1f, queue_max=%d).",
            self._min_confidence, _QUEUE_MAX_SIZE,
        )

    def stop(self, timeout_seconds: float = 15.0) -> None:
        """
        Signals both threads to stop and waits for them. The worker
        thread finishes the current in-flight execution attempt before
        checking the stop flag — it is never interrupted mid-send.
        """
        logger.info("ExecutionEngine stopping...")
        self._stop_event.set()

        for thread, name in [
            (self._worker_thread, "worker"),
            (self._management_thread, "management"),
        ]:
            if thread and thread.is_alive():
                thread.join(timeout=timeout_seconds)
                if thread.is_alive():
                    logger.warning(
                        "ExecutionEngine %s thread did not stop within %.1fs.", name, timeout_seconds
                    )

        logger.info("ExecutionEngine stopped. Stats: %s", vars(self._stats))

    def is_running(self) -> bool:
        return bool(self._worker_thread and self._worker_thread.is_alive())

    # ------------------------------------------------------------------
    # Public submission API — called by the signal evaluation loop
    # ------------------------------------------------------------------
    def submit(self, intent: TradeIntent) -> bool:
        """
        Queues a trade intent for processing. Returns True if queued,
        False if discarded (low confidence or queue full). Never blocks
        — the caller's signal loop must not be held up by a slow queue.
        """
        with self._stats_lock:
            self._stats.intents_received += 1

        if intent.confidence < self._min_confidence:
            logger.info(
                "Discarding %s %s intent: confidence %.2f < threshold %.2f.",
                intent.symbol, intent.side.value, intent.confidence, self._min_confidence,
            )
            with self._stats_lock:
                self._stats.intents_discarded_low_confidence += 1
            return False

        try:
            self._queue.put_nowait(intent)
            logger.info(
                "Queued %s %s intent (confidence=%.2f, queue_depth=%d).",
                intent.symbol, intent.side.value, intent.confidence, self._queue.qsize(),
            )
            return True
        except queue.Full:
            logger.warning(
                "Execution queue is full (%d items). Discarding %s %s intent.",
                _QUEUE_MAX_SIZE, intent.symbol, intent.side.value,
            )
            with self._stats_lock:
                self._stats.intents_discarded_queue_full += 1
            return False

    def stats(self) -> dict:
        with self._stats_lock:
            return vars(self._stats).copy()

    # ------------------------------------------------------------------
    # Worker loop
    # ------------------------------------------------------------------
    def _worker_loop(self) -> None:
        while not self._stop_event.is_set():
            try:
                intent = self._queue.get(timeout=1.0)
            except queue.Empty:
                continue

            try:
                self._process_intent(intent)
            except Exception:
                logger.exception(
                    "Unhandled exception processing trade intent for %s — worker continues.",
                    intent.symbol,
                )
            finally:
                self._queue.task_done()

    def _process_intent(self, intent: TradeIntent) -> None:
        # --- Gate 1: bot must be in running state ---
        if state.bot_status not in (BotStatus.RUNNING,):
            logger.info(
                "Discarding %s %s intent: bot status is %s.",
                intent.symbol, intent.side.value, state.bot_status.value,
            )
            return

        # --- Gate 2: MT5 must be connected ---
        if not self._connection_ready.is_set():
            logger.warning(
                "Discarding %s %s intent: MT5 not connected.",
                intent.symbol, intent.side.value,
            )
            return

        # --- Gate 3: compute lot size from risk parameters ---
        try:
            symbol_info = get_validated_symbol_info(intent.symbol)
        except (SymbolUnavailableError, Exception) as exc:
            logger.error("Cannot process intent — symbol unavailable: %s", exc)
            return

        pip = compute_pip_size(symbol_info)
        try:
            entry_price = self._get_entry_estimate(intent)
        except DataFeedError as exc:
            logger.error("Cannot estimate entry price for %s: %s", intent.symbol, exc)
            return

        sl_distance_pips = abs(entry_price - intent.stop_loss_price) / pip
        if sl_distance_pips < 0.5:
            logger.error(
                "SL distance %.2f pips is too small for %s — rejecting intent.",
                sl_distance_pips, intent.symbol,
            )
            return

        try:
            lot_size = calculate_lot_size(intent.symbol, stop_loss_pips=sl_distance_pips)
        except LotCalculationError as exc:
            logger.error("Lot calculation failed for %s: %s", intent.symbol, exc)
            return

        # --- Gate 4: build and execute the request ---
        request = OrderRequest(
            symbol=intent.symbol,
            side=intent.side,
            volume=lot_size,
            stop_loss_price=intent.stop_loss_price,
            take_profit_price=intent.take_profit_price,
            entry_price_estimate=entry_price,
            magic_number=intent.magic_number,
            comment=intent.comment or f"conf_{int(intent.confidence)}",
        )

        with self._stats_lock:
            self._stats.executions_attempted += 1

        try:
            result = execute_market_order(request)
            logger.info(
                "Trade executed: %s %s ticket=%d price=%.5f volume=%.2f retries=%d",
                intent.symbol, intent.side.value, result.ticket,
                result.filled_price, result.volume, result.retry_count,
            )
            with self._stats_lock:
                self._stats.executions_succeeded += 1

        except DuplicatePositionError as exc:
            logger.info("Duplicate position prevented for %s: %s", intent.symbol, exc)
            with self._stats_lock:
                self._stats.executions_rejected_duplicate += 1

        except OrderRejectedByRiskError as exc:
            logger.warning("Risk gate rejected trade for %s: %s", intent.symbol, exc)
            with self._stats_lock:
                self._stats.executions_rejected_risk += 1

        except OrderRejectedByBrokerError as exc:
            logger.error("Broker rejected trade for %s: %s", intent.symbol, exc)
            with self._stats_lock:
                self._stats.executions_rejected_broker += 1

        except OrderExecutionError as exc:
            logger.error("Order execution error for %s: %s", intent.symbol, exc)
            bus.publish(Events.ERROR, {"message": str(exc), "symbol": intent.symbol}, source="execution_engine")

    @staticmethod
    def _get_entry_estimate(intent: TradeIntent) -> float:
        tick = get_latest_tick(intent.symbol)
        return tick["ask"] if intent.side == OrderSide.BUY else tick["bid"]

    # ------------------------------------------------------------------
    # Position management loop
    # ------------------------------------------------------------------
    def _management_loop(self) -> None:
        while not self._stop_event.is_set():
            # Wait for the configured interval before each cycle, but
            # respond to stop signals within 1 second.
            for _ in range(config.BOT_LOOP_INTERVAL):
                if self._stop_event.is_set():
                    return
                time.sleep(1)

            if not self._connection_ready.is_set():
                continue
            if state.bot_status != BotStatus.RUNNING:
                continue

            try:
                self._run_management_cycle()
            except Exception:
                logger.exception("Unhandled exception in position management cycle.")

    def _run_management_cycle(self) -> None:
        with self._stats_lock:
            self._stats.management_cycles += 1

        # Sync authoritative position count from MT5 before making
        # decisions — our internal counter may lag if a SL/TP hit closed
        # a position outside our own close_position() call path.
        try:
            position_manager.sync_position_count()
        except Exception as exc:
            logger.error("Position sync failed: %s", exc)
            return

        for symbol in config.SYMBOLS:
            try:
                symbol_info = get_validated_symbol_info(symbol)
                pip = compute_pip_size(symbol_info)
            except Exception as exc:
                logger.warning("Skipping position management for %s: %s", symbol, exc)
                continue

            try:
                summary = manage_open_positions(
                    symbol=symbol,
                    magic_number=config.MAGIC_NUMBER,
                    pip_size=pip,
                    breakeven_trigger_pips=config.TRAILING_START_PIPS,
                    breakeven_lock_in_pips=2.0,
                    trailing_start_pips=config.TRAILING_START_PIPS,
                    trailing_step_pips=config.TRAILING_STEP_PIPS,
                )
                if summary["positions_checked"] > 0:
                    logger.info("Position management %s: %s", symbol, summary)
            except TradeManagerError as exc:
                logger.error("Position management error for %s: %s", symbol, exc)


# Single shared instance for the whole process.
execution_engine = ExecutionEngine()

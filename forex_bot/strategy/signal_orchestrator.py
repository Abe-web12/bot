"""
signal_orchestrator.py
======================

Implements the complete strategy-layer chain:

    Signal Generator
        -> Signal Scorer
        -> Gemini Advisory
        -> Risk/Reward Validation
        -> AutonomousTradingEngine
        -> Persistent Queue
        -> Execution Engine
        -> Order Executor
        -> Position Manager
        -> Trade Repository
        -> Telegram
        -> Metrics
        -> Dashboard API
        -> Database

This module owns everything up to and including submission to the
PersistentQueueManager.

The PersistentQueueManager remains the only path through which a generated
signal can become an executable TradeIntent. This module never calls
order_executor, MetaTrader5, or ExecutionEngine's in-memory queue directly.

Gemini is advisory only. It is consulted after the deterministic strategy score
has been calculated and can adjust confidence only within the bounded range
defined by _GEMINI_MAX_ADJUSTMENT. Gemini cannot convert a HOLD signal into a
trade and cannot bypass deterministic confidence, risk/reward, autonomous
market-condition, persistent-queue, execution, broker, or risk gates.

AutonomousTradingEngine is the final strategy-layer gate. It evaluates the
already validated MarketSnapshot using RSI, ATR, ADX, directional movement, and
the final confidence score. A rejected autonomous decision never reaches the
persistent queue.
"""

from __future__ import annotations

import logging
import threading
import time

import config
from ai.gemini_client import (
    analyze as gemini_analyze,
    is_enabled as gemini_enabled,
)
from core.event_bus import Events, bus
from core.metrics import metrics
from core.state_manager import BotStatus, state
from execution.execution_engine import ExecutionEngine
from execution.execution_engine import TradeIntent as EngineTradeIntent
from execution.order_validator import OrderSide
from execution.persistent_queue import (
    DuplicateIntentError,
    PersistentQueueManager,
)
from market.data_feed import DataFeedError, get_latest_tick
from risk.drawdown_guard import drawdown_guard
from risk.sl_tp_calculator import (
    SlTpCalculationError,
    calculate_sl_tp,
)
from strategy.autonomous_engine import autonomous_engine
from strategy.indicators import IndicatorError, atr
from strategy.market_snapshot import (
    MarketSnapshotError,
    get_snapshot,
)
from strategy.multi_timeframe import (
    MultiTimeframeError,
    assess_alignment,
)
from strategy.signal_generator import (
    SignalDirection,
    SignalGeneratorError,
    generate_signal,
)
from strategy.signal_scorer import score_signal
from strategy.trend_analyzer import (
    TrendAnalysisError,
    assess_trend,
)

logger = logging.getLogger("signal_orchestrator")

# Gemini may influence the deterministic strategy score only within this
# bounded range. It cannot independently authorize an execution.
_GEMINI_MAX_ADJUSTMENT = 10.0


class SignalOrchestrator:
    """
    Periodically evaluates each configured symbol and submits authorized
    TradeIntent objects to the persistent queue.

    This class owns the strategy worker thread but does not execute orders.
    All approved intents must pass through PersistentQueueManager, which then
    forwards them to ExecutionEngine using the repository's crash-recovery and
    duplicate-intent protections.
    """

    def __init__(self, persistent_queue: PersistentQueueManager) -> None:
        self._queue = persistent_queue
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def start(self) -> None:
        """
        Start the signal evaluation worker.

        Calling start() more than once is safe. If the worker is already alive,
        the duplicate call is ignored.
        """

        if self._thread and self._thread.is_alive():
            logger.warning("SignalOrchestrator already running.")
            return

        self._stop_event.clear()
        self._thread = threading.Thread(
            target=self._run_loop,
            name="signal-orchestrator",
            daemon=True,
        )
        self._thread.start()

        logger.info(
            "SignalOrchestrator started (interval=%ds).",
            config.BOT_LOOP_INTERVAL,
        )

    def stop(self, timeout_seconds: float = 10.0) -> None:
        """
        Request a graceful worker shutdown and wait for the thread.

        The stop event also interrupts the interval wait so shutdown does not
        have to wait for the complete BOT_LOOP_INTERVAL.
        """

        self._stop_event.set()

        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=timeout_seconds)

            if self._thread.is_alive():
                logger.warning(
                    "SignalOrchestrator did not stop within %.1fs.",
                    timeout_seconds,
                )

        logger.info("SignalOrchestrator stopped.")

    def is_running(self) -> bool:
        """Return True when the signal worker thread is alive."""

        return bool(self._thread and self._thread.is_alive())

    # ------------------------------------------------------------------
    # Worker loop
    # ------------------------------------------------------------------

    def _run_loop(self) -> None:
        """
        Evaluate every configured symbol while the bot is RUNNING.

        An exception affecting one symbol is logged and isolated. It cannot
        terminate the worker or prevent the remaining symbols from being
        evaluated.
        """

        while not self._stop_event.is_set():
            if state.bot_status == BotStatus.RUNNING:
                for symbol in config.SYMBOLS:
                    if self._stop_event.is_set():
                        return

                    try:
                        self.evaluate_symbol(symbol)
                    except Exception:
                        logger.exception(
                            "Unhandled exception evaluating %s; continuing.",
                            symbol,
                        )

            self._stop_event.wait(config.BOT_LOOP_INTERVAL)

    # ------------------------------------------------------------------
    # Signal processing pipeline
    # ------------------------------------------------------------------

    def evaluate_symbol(self, symbol: str) -> None:
        """
        Evaluate one symbol through the complete strategy pipeline.

        Gate order:

            1. Account-level drawdown/risk permission
            2. Validated and fresh market snapshot
            3. Deterministic BUY/SELL/HOLD signal generation
            4. Trend and multi-timeframe context
            5. Deterministic confidence scoring
            6. Optional bounded Gemini advisory
            7. Minimum confidence threshold
            8. ATR-based SL/TP calculation
            9. Minimum risk/reward ratio
           10. AutonomousTradingEngine market-condition authorization
           11. PersistentQueueManager submission

        Any failed gate returns immediately. No rejected signal reaches the
        persistent queue.
        """

        signal_started_at = time.monotonic()

        # --------------------------------------------------------------
        # Gate 1: deterministic account-level risk permission
        # --------------------------------------------------------------

        allowed, reason = drawdown_guard.can_open_new_trade()
        if not allowed:
            logger.debug(
                "Skipping %s: risk gate closed (%s).",
                symbol,
                reason,
            )
            return

        # --------------------------------------------------------------
        # Gate 2: validated, fresh market snapshot
        # --------------------------------------------------------------

        try:
            snapshot = get_snapshot(
                symbol=symbol,
                timeframe=config.TIMEFRAME_PRIMARY,
                count=150,
            )
        except MarketSnapshotError as exc:
            logger.warning(
                "Skipping %s: market data unavailable: %s",
                symbol,
                exc,
            )
            return

        # --------------------------------------------------------------
        # Gate 3: deterministic signal generation
        # --------------------------------------------------------------

        try:
            signal = generate_signal(
                snapshot.ohlc,
                symbol,
                config.TIMEFRAME_PRIMARY,
                rsi_period=config.RSI_PERIOD,
                rsi_oversold=config.RSI_OVERSOLD,
                rsi_overbought=config.RSI_OVERBOUGHT,
                macd_fast=config.MACD_FAST,
                macd_slow=config.MACD_SLOW,
                macd_signal=config.MACD_SIGNAL,
                ema_fast_period=config.EMA_FAST,
                ema_slow_period=config.EMA_SLOW,
            )
        except SignalGeneratorError as exc:
            logger.debug(
                "Skipping %s: signal generation failed: %s",
                symbol,
                exc,
            )
            return

        signal_latency_ms = (
            time.monotonic() - signal_started_at
        ) * 1000.0

        metrics.record_signal_latency_ms(signal_latency_ms)
        metrics.increment("signals_generated")

        bus.publish(
            Events.SIGNAL_GENERATED,
            {
                "symbol": symbol,
                "timeframe": config.TIMEFRAME_PRIMARY,
                "direction": signal.direction.value,
                "confidence": None,
                "latency_ms": round(signal_latency_ms, 2),
            },
            source="signal_orchestrator",
        )

        # HOLD signals are informational only and are never scored, authorized,
        # converted into TradeIntent objects, or queued.
        if signal.direction == SignalDirection.HOLD:
            logger.debug(
                "%s: deterministic strategy returned HOLD.",
                symbol,
            )
            return

        # --------------------------------------------------------------
        # Gate 4: trend and multi-timeframe context
        # --------------------------------------------------------------

        trend = None

        try:
            trend = assess_trend(
                snapshot.close,
                snapshot.high,
                snapshot.low,
            )
        except TrendAnalysisError as exc:
            logger.debug(
                "%s: trend assessment unavailable: %s",
                symbol,
                exc,
            )

        alignment = None

        try:
            alignment = assess_alignment(
                symbol,
                [
                    config.TIMEFRAME_CONFIRM,
                    config.TIMEFRAME_PRIMARY,
                ],
            )
        except MultiTimeframeError as exc:
            logger.debug(
                "%s: multi-timeframe alignment unavailable: %s",
                symbol,
                exc,
            )

        # --------------------------------------------------------------
        # Gate 5: deterministic signal scoring
        # --------------------------------------------------------------

        try:
            score = score_signal(
                signal,
                snapshot.high,
                snapshot.low,
                snapshot.close,
                trend=trend,
                multi_timeframe_alignment=alignment,
                atr_period=config.ATR_PERIOD,
            )
        except Exception as exc:
            logger.warning(
                "Skipping %s: signal scoring failed: %s",
                symbol,
                exc,
            )
            return

        final_confidence = float(score.confidence)
        gemini_note = ""

        bus.publish(
            Events.SIGNAL_SCORED,
            {
                "symbol": symbol,
                "timeframe": config.TIMEFRAME_PRIMARY,
                "direction": signal.direction.value,
                "confidence": final_confidence,
            },
            source="signal_orchestrator",
        )

        # --------------------------------------------------------------
        # Gate 6: optional bounded Gemini advisory
        # --------------------------------------------------------------

        if gemini_enabled():
            try:
                advisory = gemini_analyze(
                    symbol=symbol,
                    timeframe=config.TIMEFRAME_PRIMARY,
                    direction=signal.direction.value,
                    our_confidence=score.confidence,
                    market_context={
                        "rsi": signal.evidence.rsi_value,
                        "macd_histogram": (
                            signal.evidence.macd_histogram
                        ),
                        "trend": (
                            trend.direction.value
                            if trend
                            else None
                        ),
                        "adx": (
                            trend.adx_value
                            if trend
                            else None
                        ),
                        "mtf_aligned": (
                            alignment.is_aligned
                            if alignment
                            else None
                        ),
                    },
                )

                if (
                    advisory.advisory_available
                    and advisory.confidence_score is not None
                ):
                    confidence_delta = (
                        advisory.confidence_score
                        - score.confidence
                    )

                    bounded_delta = max(
                        -_GEMINI_MAX_ADJUSTMENT,
                        min(
                            _GEMINI_MAX_ADJUSTMENT,
                            confidence_delta,
                        ),
                    )

                    final_confidence = max(
                        0.0,
                        min(
                            100.0,
                            score.confidence + bounded_delta,
                        ),
                    )

                    gemini_note = advisory.reasoning or ""

                    logger.info(
                        (
                            "%s: Gemini confidence=%.1f reasoning=%s; "
                            "adjusted deterministic confidence %.1f -> %.1f"
                        ),
                        symbol,
                        advisory.confidence_score,
                        advisory.reasoning,
                        score.confidence,
                        final_confidence,
                    )

            except Exception:
                # Gemini is advisory and must never stop deterministic trading.
                logger.exception(
                    "%s: Gemini advisory failed; "
                    "continuing with deterministic score.",
                    symbol,
                )

        # --------------------------------------------------------------
        # Gate 7: minimum confidence
        # --------------------------------------------------------------

        if final_confidence < config.MIN_SIGNAL_SCORE:
            metrics.increment(
                "signals_discarded_low_confidence"
            )

            bus.publish(
                Events.SIGNAL_REJECTED,
                {
                    "symbol": symbol,
                    "timeframe": config.TIMEFRAME_PRIMARY,
                    "direction": signal.direction.value,
                    "confidence": final_confidence,
                    "reason": "below_min_signal_score",
                    "minimum_confidence": (
                        config.MIN_SIGNAL_SCORE
                    ),
                },
                source="signal_orchestrator",
            )

            logger.info(
                (
                    "%s %s signal rejected: confidence %.2f "
                    "is below minimum %.2f."
                ),
                symbol,
                signal.direction.value,
                final_confidence,
                config.MIN_SIGNAL_SCORE,
            )
            return

        # --------------------------------------------------------------
        # Gate 8: ATR and SL/TP calculation
        # --------------------------------------------------------------

        try:
            atr_series = atr(
                snapshot.high,
                snapshot.low,
                snapshot.close,
                period=config.ATR_PERIOD,
            )
            atr_value = float(atr_series.iloc[-1])
        except (IndicatorError, TypeError, ValueError) as exc:
            logger.warning(
                "Skipping %s: ATR unavailable for SL/TP calculation: %s",
                symbol,
                exc,
            )
            return

        try:
            tick = get_latest_tick(symbol)

            entry_estimate = tick[
                "ask"
                if signal.direction == SignalDirection.BUY
                else "bid"
            ]
        except (DataFeedError, KeyError, TypeError) as exc:
            logger.warning(
                "Skipping %s: could not get entry-price estimate: %s",
                symbol,
                exc,
            )
            return

        try:
            levels = calculate_sl_tp(
                signal.direction,
                entry_estimate,
                atr_value,
                config.SL_ATR_MULTIPLIER,
                config.TP1_ATR_MULTIPLIER,
            )
        except SlTpCalculationError as exc:
            logger.warning(
                "Skipping %s: SL/TP calculation failed: %s",
                symbol,
                exc,
            )
            return

        # --------------------------------------------------------------
        # Gate 9: minimum risk/reward ratio
        # --------------------------------------------------------------

        if levels.risk_reward_ratio < config.MIN_RR_RATIO:
            rejection_reason = (
                f"rr_ratio_{levels.risk_reward_ratio:.2f}"
                f"_below_min_{config.MIN_RR_RATIO}"
            )

            bus.publish(
                Events.SIGNAL_REJECTED,
                {
                    "symbol": symbol,
                    "timeframe": config.TIMEFRAME_PRIMARY,
                    "direction": signal.direction.value,
                    "confidence": final_confidence,
                    "reason": rejection_reason,
                    "risk_reward_ratio": (
                        levels.risk_reward_ratio
                    ),
                    "minimum_risk_reward_ratio": (
                        config.MIN_RR_RATIO
                    ),
                },
                source="signal_orchestrator",
            )

            logger.info(
                (
                    "%s %s signal rejected: risk/reward %.2f "
                    "is below minimum %.2f."
                ),
                symbol,
                signal.direction.value,
                levels.risk_reward_ratio,
                config.MIN_RR_RATIO,
            )
            return

        # --------------------------------------------------------------
        # Gate 10: autonomous market-condition authorization
        # --------------------------------------------------------------

        decision = autonomous_engine.analyze_and_authorize(
            snapshot,
            signal.direction,
            final_confidence,
        )

        if not decision.allowed:
            logger.info(
                (
                    "%s %s signal rejected by "
                    "AutonomousTradingEngine: %s"
                ),
                symbol,
                signal.direction.value,
                decision.reason,
            )

            metrics.increment(
                "signals_rejected_autonomous"
            )

            bus.publish(
                Events.SIGNAL_REJECTED,
                {
                    "symbol": symbol,
                    "timeframe": config.TIMEFRAME_PRIMARY,
                    "direction": signal.direction.value,
                    "confidence": final_confidence,
                    "reason": decision.reason,
                    "gate": "autonomous_engine",
                    "checks": list(decision.checks),
                    "indicators": {
                        "rsi": decision.rsi_value,
                        "atr": decision.atr_value,
                        "atr_percent": (
                            decision.atr_percent
                        ),
                        "adx": decision.adx_value,
                        "plus_di": decision.plus_di,
                        "minus_di": decision.minus_di,
                    },
                    "evaluated_at": (
                        decision.evaluated_at.isoformat()
                    ),
                },
                source="signal_orchestrator",
            )
            return

        logger.info(
            (
                "%s %s signal authorized by "
                "AutonomousTradingEngine: %s"
            ),
            symbol,
            signal.direction.value,
            decision.reason,
        )

        # --------------------------------------------------------------
        # Build the executable intent only after every gate has passed
        # --------------------------------------------------------------

        intent = EngineTradeIntent(
            symbol=symbol,
            side=(
                OrderSide.BUY
                if signal.direction == SignalDirection.BUY
                else OrderSide.SELL
            ),
            stop_loss_price=levels.stop_loss_price,
            take_profit_price=levels.take_profit_price,
            confidence=final_confidence,
            magic_number=config.MAGIC_NUMBER,
            comment=(
                gemini_note[:80]
                if gemini_note
                else f"score_{final_confidence:.0f}"
            ),
        )

        # --------------------------------------------------------------
        # Gate 11: persistent queue submission
        # --------------------------------------------------------------

        try:
            execution_id = self._queue.submit(intent)

            logger.info(
                (
                    "%s %s signal queued: execution_id=%s "
                    "confidence=%.1f SL=%.5f TP=%.5f "
                    "RR=%.2f"
                ),
                symbol,
                signal.direction.value,
                execution_id,
                final_confidence,
                levels.stop_loss_price,
                levels.take_profit_price,
                levels.risk_reward_ratio,
            )

        except DuplicateIntentError as exc:
            logger.info(
                "%s: duplicate signal not resubmitted: %s",
                symbol,
                exc,
            )


def build_orchestrator(
    execution_engine: ExecutionEngine,
) -> SignalOrchestrator:
    """
    Construct a PersistentQueueManager and SignalOrchestrator pair bound to an
    ExecutionEngine instance.

    run.py currently creates PersistentQueueManager directly so it can recover
    queued intents before starting the orchestrator. This factory remains useful
    for tests and alternative startup compositions.
    """

    queue_manager = PersistentQueueManager(
        execution_engine
    )
    return SignalOrchestrator(queue_manager)
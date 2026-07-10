"""
signal_orchestrator.py
========================
Implements the required chain from the milestone brief:

  Signal Generator -> Signal Scorer -> Risk Validation -> Persistent
  Queue -> Execution Engine -> Order Executor -> Position Manager ->
  Trade Repository -> Telegram -> Metrics -> Dashboard API -> Database

This module owns everything up to and including "Persistent Queue".
Everything after that (Execution Engine onward) already exists and is
unchanged — this module never calls order_executor or MT5 directly, and
never reaches ExecutionEngine's in-memory queue directly. That is the
"signals must never bypass the execution engine" requirement made
structural: there is exactly one path from a generated signal to an
order, and it runs through PersistentQueueManager.submit(), not around it.

Gemini (ai/gemini_client.py) is consulted AFTER our own deterministic
score is computed, and can only nudge the final confidence within a
bounded range (+/- _GEMINI_MAX_ADJUSTMENT) — it can never turn a HOLD
into a trade and never bypasses the MIN_SIGNAL_SCORE threshold check.
This keeps the existing strategy the final authority, per the
milestone's explicit requirement.
"""

from __future__ import annotations

import logging
import threading
import time

import config
from ai.gemini_client import analyze as gemini_analyze, is_enabled as gemini_enabled
from core.event_bus import Events, bus
from core.metrics import metrics
from core.state_manager import BotStatus, state
from execution.execution_engine import ExecutionEngine
from execution.execution_engine import TradeIntent as EngineTradeIntent
from execution.order_validator import OrderSide
from execution.persistent_queue import DuplicateIntentError, PersistentQueueManager
from market.data_feed import DataFeedError, get_latest_tick
from risk.drawdown_guard import drawdown_guard
from risk.sl_tp_calculator import SlTpCalculationError, calculate_sl_tp
from strategy.indicators import IndicatorError, atr
from strategy.market_snapshot import MarketSnapshotError, get_snapshot
from strategy.multi_timeframe import MultiTimeframeError, assess_alignment
from strategy.signal_generator import SignalDirection, SignalGeneratorError, generate_signal
from strategy.signal_scorer import score_signal
from strategy.trend_analyzer import TrendAnalysisError, assess_trend

logger = logging.getLogger("signal_orchestrator")

_GEMINI_MAX_ADJUSTMENT = 10.0


class SignalOrchestrator:
    def __init__(self, persistent_queue: PersistentQueueManager) -> None:
        self._queue = persistent_queue
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            logger.warning("SignalOrchestrator already running.")
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run_loop, name="signal-orchestrator", daemon=True)
        self._thread.start()
        logger.info("SignalOrchestrator started (interval=%ds).", config.BOT_LOOP_INTERVAL)

    def stop(self, timeout_seconds: float = 10.0) -> None:
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=timeout_seconds)
        logger.info("SignalOrchestrator stopped.")

    def _run_loop(self) -> None:
        while not self._stop_event.is_set():
            if state.bot_status == BotStatus.RUNNING:
                for symbol in config.SYMBOLS:
                    if self._stop_event.is_set():
                        return
                    try:
                        self.evaluate_symbol(symbol)
                    except Exception:
                        logger.exception("Unhandled exception evaluating %s — continuing.", symbol)
            self._stop_event.wait(config.BOT_LOOP_INTERVAL)

    def evaluate_symbol(self, symbol: str) -> None:
        t_signal_start = time.monotonic()

        allowed, reason = drawdown_guard.can_open_new_trade()
        if not allowed:
            logger.debug("Skipping %s: risk gate closed (%s).", symbol, reason)
            return

        try:
            snapshot = get_snapshot(symbol, config.TIMEFRAME_PRIMARY, count=150)
        except MarketSnapshotError as exc:
            logger.warning("Skipping %s: market data unavailable: %s", symbol, exc)
            return

        try:
            signal = generate_signal(
                snapshot.ohlc, symbol, config.TIMEFRAME_PRIMARY,
                rsi_period=config.RSI_PERIOD,
                rsi_oversold=config.RSI_OVERSOLD,
                rsi_overbought=config.RSI_OVERBOUGHT,
                macd_fast=config.MACD_FAST, macd_slow=config.MACD_SLOW, macd_signal=config.MACD_SIGNAL,
                ema_fast_period=config.EMA_FAST, ema_slow_period=config.EMA_SLOW,
            )
        except SignalGeneratorError as exc:
            logger.debug("Skipping %s: signal generation failed: %s", symbol, exc)
            return

        signal_latency_ms = (time.monotonic() - t_signal_start) * 1000
        metrics.record_signal_latency_ms(signal_latency_ms)
        metrics.increment("signals_generated")

        bus.publish(
            Events.SIGNAL_GENERATED,
            {"symbol": symbol, "direction": signal.direction.value, "confidence": None},
            source="signal_orchestrator",
        )

        if signal.direction == SignalDirection.HOLD:
            return

        trend = None
        try:
            trend = assess_trend(snapshot.close, snapshot.high, snapshot.low)
        except TrendAnalysisError as exc:
            logger.debug("%s: trend assessment unavailable: %s", symbol, exc)

        alignment = None
        try:
            alignment = assess_alignment(symbol, [config.TIMEFRAME_CONFIRM, config.TIMEFRAME_PRIMARY])
        except MultiTimeframeError as exc:
            logger.debug("%s: multi-timeframe alignment unavailable: %s", symbol, exc)

        score = score_signal(
            signal, snapshot.high, snapshot.low, snapshot.close,
            trend=trend, multi_timeframe_alignment=alignment,
            atr_period=config.ATR_PERIOD,
        )

        final_confidence = score.confidence
        gemini_note = ""

        if gemini_enabled():
            try:
                advisory = gemini_analyze(
                    symbol=symbol,
                    timeframe=config.TIMEFRAME_PRIMARY,
                    direction=signal.direction.value,
                    our_confidence=score.confidence,
                    market_context={
                        "rsi": signal.evidence.rsi_value,
                        "macd_histogram": signal.evidence.macd_histogram,
                        "trend": trend.direction.value if trend else None,
                        "adx": trend.adx_value if trend else None,
                        "mtf_aligned": alignment.is_aligned if alignment else None,
                    },
                )
                if advisory.advisory_available and advisory.confidence_score is not None:
                    delta = advisory.confidence_score - score.confidence
                    bounded_delta = max(-_GEMINI_MAX_ADJUSTMENT, min(_GEMINI_MAX_ADJUSTMENT, delta))
                    final_confidence = max(0.0, min(100.0, score.confidence + bounded_delta))
                    gemini_note = advisory.reasoning
                    logger.info(
                        "%s: Gemini confidence=%.1f reasoning=%s -> adjusted %.1f -> %.1f",
                        symbol, advisory.confidence_score, advisory.reasoning, score.confidence, final_confidence,
                    )
            except Exception:
                logger.exception("%s: Gemini advisory call failed — continuing without it.", symbol)

        if final_confidence < config.MIN_SIGNAL_SCORE:
            metrics.increment("signals_discarded_low_confidence")
            bus.publish(
                Events.SIGNAL_REJECTED,
                {"symbol": symbol, "direction": signal.direction.value,
                 "confidence": final_confidence, "reason": "below_min_signal_score"},
                source="signal_orchestrator",
            )
            return

        try:
            atr_series = atr(snapshot.high, snapshot.low, snapshot.close, period=config.ATR_PERIOD)
            atr_value = float(atr_series.iloc[-1])
        except IndicatorError as exc:
            logger.warning("Skipping %s: ATR unavailable for SL/TP calc: %s", symbol, exc)
            return

        try:
            entry_estimate = get_latest_tick(symbol)["ask" if signal.direction == SignalDirection.BUY else "bid"]
        except DataFeedError as exc:
            logger.warning("Skipping %s: could not get entry price estimate: %s", symbol, exc)
            return

        try:
            levels = calculate_sl_tp(
                signal.direction, entry_estimate, atr_value,
                config.SL_ATR_MULTIPLIER, config.TP1_ATR_MULTIPLIER,
            )
        except SlTpCalculationError as exc:
            logger.warning("Skipping %s: SL/TP calculation failed: %s", symbol, exc)
            return

        if levels.risk_reward_ratio < config.MIN_RR_RATIO:
            bus.publish(
                Events.SIGNAL_REJECTED,
                {"symbol": symbol, "direction": signal.direction.value, "confidence": final_confidence,
                 "reason": f"rr_ratio_{levels.risk_reward_ratio:.2f}_below_min_{config.MIN_RR_RATIO}"},
                source="signal_orchestrator",
            )
            return

        intent = EngineTradeIntent(
            symbol=symbol,
            side=OrderSide.BUY if signal.direction == SignalDirection.BUY else OrderSide.SELL,
            stop_loss_price=levels.stop_loss_price,
            take_profit_price=levels.take_profit_price,
            confidence=final_confidence,
            magic_number=config.MAGIC_NUMBER,
            comment=(gemini_note[:80] if gemini_note else f"score_{final_confidence:.0f}"),
        )

        try:
            execution_id = self._queue.submit(intent)
            logger.info(
                "%s %s signal queued: execution_id=%s confidence=%.1f SL=%.5f TP=%.5f RR=%.2f",
                symbol, signal.direction.value, execution_id, final_confidence,
                levels.stop_loss_price, levels.take_profit_price, levels.risk_reward_ratio,
            )
        except DuplicateIntentError as exc:
            logger.info("%s: duplicate signal, not resubmitted: %s", symbol, exc)


def build_orchestrator(execution_engine: ExecutionEngine) -> SignalOrchestrator:
    """Factory — constructs the PersistentQueueManager + SignalOrchestrator
    pair bound to a given ExecutionEngine instance. Used by run.py."""
    queue_manager = PersistentQueueManager(execution_engine)
    return SignalOrchestrator(queue_manager)

"""
autonomous_engine.py
====================
Deterministic market-condition gate between SignalOrchestrator and the
persistent execution queue.

The engine does not generate signals, calculate position size, or execute
orders. It receives an existing directional signal and validated
MarketSnapshot, evaluates whether current conditions are suitable, and returns
an immutable ALLOW/REJECT decision.

Pipeline:

    MarketSnapshot
        -> SignalGenerator / SignalScorer
        -> AutonomousTradingEngine.analyze_and_authorize()
        -> PersistentQueueManager
        -> ExecutionEngine
        -> OrderExecutor
        -> mt5.order_send()

Design rules:
    - Fail closed: missing, stale, invalid, or insufficient market data always
      produces REJECT.
    - No fixed-hour filtering: authorization is based on RSI, ATR, ADX,
      volatility, confidence, and directional consistency.
    - No MT5 calls, network calls, database writes, or execution imports.
    - Every decision publishes AUTONOMOUS_DECISION_EVENT through the existing
      synchronous EventBus.
    - Returned decisions are immutable frozen dataclasses.
    - SignalOrchestrator owns this engine and calls it. This module deliberately
      does not import SignalOrchestrator at runtime, preventing a circular import.

The existing strategy/indicators.py module exposes pure functions rather than an
Indicators class. This module therefore imports and uses rsi(), atr(), and adx()
directly, preserving the repository's current architecture.
"""

from __future__ import annotations

import logging
import math
from dataclasses import dataclass
from datetime import datetime, timezone
from enum import Enum
from typing import Any

import pandas as pd

import config
from core.event_bus import Events, bus
from strategy.indicators import IndicatorError, adx, atr, rsi
from strategy.market_snapshot import MarketSnapshot
from strategy.signal_generator import SignalDirection

logger = logging.getLogger("autonomous_engine")

# The canonical constant should also be added to core/event_bus.py:
#
#     AUTONOMOUS_DECISION_EVENT = "AUTONOMOUS_DECISION_EVENT"
#
# getattr keeps this module compatible until that one-line addition is made.
AUTONOMOUS_DECISION_EVENT = getattr(
    Events,
    "AUTONOMOUS_DECISION_EVENT",
    "AUTONOMOUS_DECISION_EVENT",
)


class AutonomousEngineError(Exception):
    """Base exception for autonomous market-analysis failures."""


class InvalidAnalysisInputError(AutonomousEngineError):
    """Raised when the supplied snapshot, direction, or confidence is invalid."""


class DecisionOutcome(str, Enum):
    """Possible immutable authorization outcomes."""

    ALLOW = "ALLOW"
    REJECT = "REJECT"


@dataclass(frozen=True)
class AutonomousDecision:
    """
    Immutable authorization decision produced by AutonomousTradingEngine.

    `allowed` is the only field execution plumbing should use as an execution
    gate. The remaining fields provide auditability, logs, metrics, dashboard
    visibility, and Telegram notification context.
    """

    outcome: DecisionOutcome
    allowed: bool
    symbol: str
    timeframe: str
    direction: SignalDirection
    confidence: float
    reason: str
    checks: tuple[str, ...]
    rsi_value: float | None
    atr_value: float | None
    atr_percent: float | None
    adx_value: float | None
    plus_di: float | None
    minus_di: float | None
    evaluated_at: datetime

    def as_event_payload(self) -> dict[str, Any]:
        """Return a JSON-safe payload for EventBus subscribers."""

        return {
            "outcome": self.outcome.value,
            "allowed": self.allowed,
            "symbol": self.symbol,
            "timeframe": self.timeframe,
            "direction": self.direction.value,
            "confidence": self.confidence,
            "reason": self.reason,
            "checks": list(self.checks),
            "indicators": {
                "rsi": self.rsi_value,
                "atr": self.atr_value,
                "atr_percent": self.atr_percent,
                "adx": self.adx_value,
                "plus_di": self.plus_di,
                "minus_di": self.minus_di,
            },
            "evaluated_at": self.evaluated_at.isoformat(),
        }


@dataclass(frozen=True)
class AutonomousEngineConfig:
    """
    Configuration for deterministic authorization checks.

    Defaults reuse the repository's existing strategy configuration where
    possible. Volatility values are percentages of the latest close, making the
    gate portable across EURUSD, GBPUSD, JPY pairs, metals, and other symbols.
    """

    rsi_period: int = config.RSI_PERIOD
    atr_period: int = config.ATR_PERIOD
    adx_period: int = 14

    rsi_oversold: float = config.RSI_OVERSOLD
    rsi_overbought: float = config.RSI_OVERBOUGHT

    minimum_confidence: float = config.MIN_SIGNAL_SCORE
    minimum_atr_percent: float = 0.02
    maximum_atr_percent: float = 3.00
    minimum_adx: float = 18.0

    require_directional_adx: bool = True

    def __post_init__(self) -> None:
        if self.rsi_period <= 0:
            raise ValueError("rsi_period must be positive.")

        if self.atr_period <= 0:
            raise ValueError("atr_period must be positive.")

        if self.adx_period <= 0:
            raise ValueError("adx_period must be positive.")

        if not 0.0 <= self.rsi_oversold < self.rsi_overbought <= 100.0:
            raise ValueError(
                "RSI thresholds must satisfy "
                "0 <= rsi_oversold < rsi_overbought <= 100."
            )

        if not 0.0 <= self.minimum_confidence <= 100.0:
            raise ValueError("minimum_confidence must be between 0 and 100.")

        if self.minimum_atr_percent < 0.0:
            raise ValueError("minimum_atr_percent cannot be negative.")

        if self.maximum_atr_percent <= self.minimum_atr_percent:
            raise ValueError(
                "maximum_atr_percent must be greater than "
                "minimum_atr_percent."
            )

        if not 0.0 <= self.minimum_adx <= 100.0:
            raise ValueError("minimum_adx must be between 0 and 100.")


class AutonomousTradingEngine:
    """
    Market-condition authorization gate for the existing SignalOrchestrator.

    The orchestrator should call `analyze_and_authorize()` after producing and
    scoring a BUY/SELL signal, but before submitting a TradeIntent to
    PersistentQueueManager.

    This engine is deliberately stateless and thread-safe. Each analysis uses
    only its arguments and immutable configuration, making one shared instance
    safe for the repository's signal-orchestrator worker thread.
    """

    def __init__(
        self,
        engine_config: AutonomousEngineConfig | None = None,
    ) -> None:
        self._config = engine_config or AutonomousEngineConfig()

    @property
    def configuration(self) -> AutonomousEngineConfig:
        """Expose immutable configuration for diagnostics and tests."""

        return self._config

    def analyze_and_authorize(
        self,
        snapshot: MarketSnapshot,
        direction: SignalDirection | str,
        confidence: float,
    ) -> AutonomousDecision:
        """
        Analyze current market conditions and return ALLOW or REJECT.

        Authorization requirements:
            1. Snapshot identity and OHLC data must be valid.
            2. Direction must be BUY or SELL. HOLD is never executable.
            3. Existing signal confidence must meet the configured threshold.
            4. RSI must not directly contradict the proposed direction.
            5. ATR percentage must be high enough for movement but below the
               configured abnormal-volatility ceiling.
            6. ADX must indicate adequate trend strength.
            7. When directional ADX is enabled, +DI/-DI must agree with the
               proposed BUY/SELL direction.

        Any unexpected analysis error produces a published REJECT decision.
        The method does not raise for ordinary market-analysis failures.
        """

        evaluated_at = datetime.now(timezone.utc)

        symbol = self._safe_text(getattr(snapshot, "symbol", None), "UNKNOWN")
        timeframe = self._safe_text(
            getattr(snapshot, "timeframe", None),
            "UNKNOWN",
        )
        parsed_direction = self._normalize_direction(direction)
        parsed_confidence = self._normalize_confidence(confidence)

        try:
            self._validate_snapshot(snapshot)

            if parsed_direction == SignalDirection.HOLD:
                return self._reject(
                    symbol=symbol,
                    timeframe=timeframe,
                    direction=parsed_direction,
                    confidence=parsed_confidence,
                    reason="HOLD signals cannot authorize an order.",
                    checks=("direction:reject_hold",),
                    evaluated_at=evaluated_at,
                )

            if parsed_confidence < self._config.minimum_confidence:
                return self._reject(
                    symbol=symbol,
                    timeframe=timeframe,
                    direction=parsed_direction,
                    confidence=parsed_confidence,
                    reason=(
                        f"Confidence {parsed_confidence:.2f} is below minimum "
                        f"{self._config.minimum_confidence:.2f}."
                    ),
                    checks=(
                        "direction:pass",
                        "confidence:reject_below_threshold",
                    ),
                    evaluated_at=evaluated_at,
                )

            indicator_values = self._calculate_indicators(snapshot)

            rsi_value = indicator_values["rsi"]
            atr_value = indicator_values["atr"]
            atr_percent = indicator_values["atr_percent"]
            adx_value = indicator_values["adx"]
            plus_di = indicator_values["plus_di"]
            minus_di = indicator_values["minus_di"]

            checks: list[str] = [
                "snapshot:pass",
                "direction:pass",
                "confidence:pass",
            ]

            rsi_rejection = self._evaluate_rsi(
                direction=parsed_direction,
                rsi_value=rsi_value,
            )
            if rsi_rejection is not None:
                checks.append("rsi:reject_directional_conflict")
                return self._reject(
                    symbol=symbol,
                    timeframe=timeframe,
                    direction=parsed_direction,
                    confidence=parsed_confidence,
                    reason=rsi_rejection,
                    checks=tuple(checks),
                    rsi_value=rsi_value,
                    atr_value=atr_value,
                    atr_percent=atr_percent,
                    adx_value=adx_value,
                    plus_di=plus_di,
                    minus_di=minus_di,
                    evaluated_at=evaluated_at,
                )

            checks.append("rsi:pass")

            volatility_rejection = self._evaluate_volatility(atr_percent)
            if volatility_rejection is not None:
                checks.append("atr:reject")
                return self._reject(
                    symbol=symbol,
                    timeframe=timeframe,
                    direction=parsed_direction,
                    confidence=parsed_confidence,
                    reason=volatility_rejection,
                    checks=tuple(checks),
                    rsi_value=rsi_value,
                    atr_value=atr_value,
                    atr_percent=atr_percent,
                    adx_value=adx_value,
                    plus_di=plus_di,
                    minus_di=minus_di,
                    evaluated_at=evaluated_at,
                )

            checks.append("atr:pass")

            trend_rejection = self._evaluate_trend(
                direction=parsed_direction,
                adx_value=adx_value,
                plus_di=plus_di,
                minus_di=minus_di,
            )
            if trend_rejection is not None:
                checks.append("adx:reject")
                return self._reject(
                    symbol=symbol,
                    timeframe=timeframe,
                    direction=parsed_direction,
                    confidence=parsed_confidence,
                    reason=trend_rejection,
                    checks=tuple(checks),
                    rsi_value=rsi_value,
                    atr_value=atr_value,
                    atr_percent=atr_percent,
                    adx_value=adx_value,
                    plus_di=plus_di,
                    minus_di=minus_di,
                    evaluated_at=evaluated_at,
                )

            checks.append("adx:pass")

            decision = AutonomousDecision(
                outcome=DecisionOutcome.ALLOW,
                allowed=True,
                symbol=symbol,
                timeframe=timeframe,
                direction=parsed_direction,
                confidence=round(parsed_confidence, 2),
                reason=(
                    "Market conditions authorize execution: confidence, RSI, "
                    "ATR volatility, ADX strength, and directional movement "
                    "checks passed."
                ),
                checks=tuple(checks),
                rsi_value=round(rsi_value, 2),
                atr_value=round(atr_value, 8),
                atr_percent=round(atr_percent, 4),
                adx_value=round(adx_value, 2),
                plus_di=round(plus_di, 2),
                minus_di=round(minus_di, 2),
                evaluated_at=evaluated_at,
            )

            self._publish(decision)

            logger.info(
                (
                    "%s %s autonomous authorization ALLOWED: "
                    "confidence=%.2f RSI=%.2f ATR%%=%.4f "
                    "ADX=%.2f +DI=%.2f -DI=%.2f"
                ),
                symbol,
                parsed_direction.value,
                parsed_confidence,
                rsi_value,
                atr_percent,
                adx_value,
                plus_di,
                minus_di,
            )

            return decision

        except (AutonomousEngineError, IndicatorError, KeyError, TypeError) as exc:
            logger.warning(
                "%s autonomous analysis rejected safely: %s",
                symbol,
                exc,
            )
            return self._reject(
                symbol=symbol,
                timeframe=timeframe,
                direction=parsed_direction,
                confidence=parsed_confidence,
                reason=f"Market analysis failed closed: {exc}",
                checks=("analysis:reject_error",),
                evaluated_at=evaluated_at,
            )

        except Exception as exc:
            logger.exception(
                "Unexpected autonomous-analysis failure for %s.",
                symbol,
            )
            return self._reject(
                symbol=symbol,
                timeframe=timeframe,
                direction=parsed_direction,
                confidence=parsed_confidence,
                reason=(
                    "Unexpected autonomous-analysis error; execution denied: "
                    f"{exc.__class__.__name__}: {exc}"
                ),
                checks=("analysis:reject_unexpected_error",),
                evaluated_at=evaluated_at,
            )

    def _validate_snapshot(self, snapshot: MarketSnapshot) -> None:
        if not isinstance(snapshot, MarketSnapshot):
            raise InvalidAnalysisInputError(
                "snapshot must be a MarketSnapshot instance."
            )

        if not snapshot.symbol or not snapshot.symbol.strip():
            raise InvalidAnalysisInputError("snapshot symbol is empty.")

        if not snapshot.timeframe or not snapshot.timeframe.strip():
            raise InvalidAnalysisInputError("snapshot timeframe is empty.")

        if snapshot.ohlc is None or snapshot.ohlc.empty:
            raise InvalidAnalysisInputError("snapshot OHLC data is empty.")

        required_columns = {"high", "low", "close"}
        missing = required_columns.difference(snapshot.ohlc.columns)
        if missing:
            raise InvalidAnalysisInputError(
                f"snapshot is missing required columns: {sorted(missing)}."
            )

        minimum_bars = max(
            self._config.rsi_period + 1,
            self._config.atr_period + 1,
            self._config.adx_period * 2,
        )
        if snapshot.bar_count < minimum_bars:
            raise InvalidAnalysisInputError(
                f"snapshot requires at least {minimum_bars} bars, "
                f"received {snapshot.bar_count}."
            )

        latest_close = snapshot.latest_close
        if not math.isfinite(latest_close) or latest_close <= 0.0:
            raise InvalidAnalysisInputError(
                f"latest close must be positive and finite, got {latest_close}."
            )

    def _calculate_indicators(
        self,
        snapshot: MarketSnapshot,
    ) -> dict[str, float]:
        rsi_series = rsi(
            snapshot.close,
            period=self._config.rsi_period,
        )
        atr_series = atr(
            snapshot.high,
            snapshot.low,
            snapshot.close,
            period=self._config.atr_period,
        )
        adx_result = adx(
            snapshot.high,
            snapshot.low,
            snapshot.close,
            period=self._config.adx_period,
        )

        rsi_value = self._last_finite(rsi_series, "RSI")
        atr_value = self._last_finite(atr_series, "ATR")
        adx_value = self._last_finite(adx_result.adx, "ADX")
        plus_di = self._last_finite(adx_result.plus_di, "+DI")
        minus_di = self._last_finite(adx_result.minus_di, "-DI")

        latest_close = snapshot.latest_close
        atr_percent = (atr_value / latest_close) * 100.0

        if not math.isfinite(atr_percent):
            raise AutonomousEngineError(
                "ATR percentage is not finite."
            )

        return {
            "rsi": rsi_value,
            "atr": atr_value,
            "atr_percent": atr_percent,
            "adx": adx_value,
            "plus_di": plus_di,
            "minus_di": minus_di,
        }

    def _evaluate_rsi(
        self,
        direction: SignalDirection,
        rsi_value: float,
    ) -> str | None:
        """
        Reject only when RSI directly contradicts the proposed direction.

        A BUY generated from oversold conditions remains valid. It is rejected
        only when the market is already overbought. A SELL uses the mirror rule.
        """

        if (
            direction == SignalDirection.BUY
            and rsi_value >= self._config.rsi_overbought
        ):
            return (
                f"BUY rejected because RSI {rsi_value:.2f} is overbought "
                f"(threshold {self._config.rsi_overbought:.2f})."
            )

        if (
            direction == SignalDirection.SELL
            and rsi_value <= self._config.rsi_oversold
        ):
            return (
                f"SELL rejected because RSI {rsi_value:.2f} is oversold "
                f"(threshold {self._config.rsi_oversold:.2f})."
            )

        return None

    def _evaluate_volatility(self, atr_percent: float) -> str | None:
        if atr_percent < self._config.minimum_atr_percent:
            return (
                f"Trade rejected because ATR volatility {atr_percent:.4f}% "
                f"is below minimum {self._config.minimum_atr_percent:.4f}%."
            )

        if atr_percent > self._config.maximum_atr_percent:
            return (
                f"Trade rejected because ATR volatility {atr_percent:.4f}% "
                f"exceeds maximum {self._config.maximum_atr_percent:.4f}%."
            )

        return None

    def _evaluate_trend(
        self,
        direction: SignalDirection,
        adx_value: float,
        plus_di: float,
        minus_di: float,
    ) -> str | None:
        if adx_value < self._config.minimum_adx:
            return (
                f"Trade rejected because ADX {adx_value:.2f} is below "
                f"minimum trend strength {self._config.minimum_adx:.2f}."
            )

        if not self._config.require_directional_adx:
            return None

        if direction == SignalDirection.BUY and plus_di <= minus_di:
            return (
                f"BUY rejected because +DI {plus_di:.2f} does not exceed "
                f"-DI {minus_di:.2f}."
            )

        if direction == SignalDirection.SELL and minus_di <= plus_di:
            return (
                f"SELL rejected because -DI {minus_di:.2f} does not exceed "
                f"+DI {plus_di:.2f}."
            )

        return None

    def _reject(
        self,
        *,
        symbol: str,
        timeframe: str,
        direction: SignalDirection,
        confidence: float,
        reason: str,
        checks: tuple[str, ...],
        evaluated_at: datetime,
        rsi_value: float | None = None,
        atr_value: float | None = None,
        atr_percent: float | None = None,
        adx_value: float | None = None,
        plus_di: float | None = None,
        minus_di: float | None = None,
    ) -> AutonomousDecision:
        decision = AutonomousDecision(
            outcome=DecisionOutcome.REJECT,
            allowed=False,
            symbol=symbol,
            timeframe=timeframe,
            direction=direction,
            confidence=round(confidence, 2),
            reason=reason,
            checks=checks,
            rsi_value=self._optional_round(rsi_value, 2),
            atr_value=self._optional_round(atr_value, 8),
            atr_percent=self._optional_round(atr_percent, 4),
            adx_value=self._optional_round(adx_value, 2),
            plus_di=self._optional_round(plus_di, 2),
            minus_di=self._optional_round(minus_di, 2),
            evaluated_at=evaluated_at,
        )

        self._publish(decision)

        logger.info(
            "%s %s autonomous authorization REJECTED: %s",
            symbol,
            direction.value,
            reason,
        )

        return decision

    @staticmethod
    def _publish(decision: AutonomousDecision) -> None:
        bus.publish(
            AUTONOMOUS_DECISION_EVENT,
            decision.as_event_payload(),
            source="autonomous_engine",
        )

    @staticmethod
    def _normalize_direction(
        direction: SignalDirection | str,
    ) -> SignalDirection:
        if isinstance(direction, SignalDirection):
            return direction

        try:
            return SignalDirection(str(direction).upper())
        except (TypeError, ValueError) as exc:
            raise InvalidAnalysisInputError(
                f"Unsupported signal direction: {direction!r}."
            ) from exc

    @staticmethod
    def _normalize_confidence(confidence: float) -> float:
        try:
            parsed = float(confidence)
        except (TypeError, ValueError) as exc:
            raise InvalidAnalysisInputError(
                f"Confidence must be numeric, got {confidence!r}."
            ) from exc

        if not math.isfinite(parsed):
            raise InvalidAnalysisInputError(
                "Confidence must be finite."
            )

        if parsed < 0.0 or parsed > 100.0:
            raise InvalidAnalysisInputError(
                f"Confidence must be between 0 and 100, got {parsed}."
            )

        return parsed

    @staticmethod
    def _last_finite(series: pd.Series, name: str) -> float:
        if series is None or series.empty:
            raise AutonomousEngineError(f"{name} series is empty.")

        value = series.iloc[-1]
        if pd.isna(value):
            raise AutonomousEngineError(
                f"Latest {name} value is unavailable after indicator warm-up."
            )

        parsed = float(value)
        if not math.isfinite(parsed):
            raise AutonomousEngineError(
                f"Latest {name} value is not finite."
            )

        return parsed

    @staticmethod
    def _safe_text(value: Any, fallback: str) -> str:
        if isinstance(value, str) and value.strip():
            return value.strip()
        return fallback

    @staticmethod
    def _optional_round(
        value: float | None,
        digits: int,
    ) -> float | None:
        return None if value is None else round(value, digits)


# Shared stateless instance, consistent with execution_engine, telegram_service,
# drawdown_guard, and other process-wide services in this repository.
autonomous_engine = AutonomousTradingEngine()
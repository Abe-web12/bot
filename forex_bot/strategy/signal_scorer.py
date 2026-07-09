"""
signal_scorer.py
=================
Computes a deterministic 0-100 confidence score for a SignalResult by
combining four independently-weighted factors:

  1. Indicator confluence (from signal_generator's SignalEvidence) —
     how many of RSI/MACD/EMA/candle-pattern conditions actually fired,
     and how strongly.
  2. Trend weighting — does the higher-timeframe trend support this
     signal's direction, and how strong is that trend (ADX)?
  3. Volatility weighting — is current volatility (ATR relative to its
     own recent history) in a range where this strategy's assumptions
     hold, or is it abnormally quiet/extreme?
  4. Multi-timeframe alignment — from multi_timeframe.assess_alignment,
     how many timeframes agree?

This module is intentionally NOT "optimized for profitability" per the
milestone instructions — there is no parameter search, no backtesting
feedback loop, no curve-fitting here. Weights are fixed, documented
constants representing a defensible default judgment (trend and
multi-timeframe alignment matter more than a single candle pattern),
not a value tuned against historical results. That tuning, if ever
done, belongs in a separate backtesting/optimization milestone with its
own validation discipline (out-of-sample testing, walk-forward
analysis) — bolting it into the scorer itself would make this module
both non-deterministic across "versions" of itself and untestable in
the way the unit tests below require.

Determinism contract: calling score_signal() twice with identical
inputs MUST produce an identical SignalScore. No randomness, no
wall-clock time, no hidden global state is read here.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import pandas as pd

from strategy.indicators import IndicatorError, atr
from strategy.multi_timeframe import MultiTimeframeAlignment
from strategy.signal_generator import SignalDirection, SignalResult
from strategy.trend_analyzer import TrendAnalysisError, TrendAssessment, TrendDirection, assess_trend


class SignalScorerError(Exception):
    pass


# ---------------------------------------------------------------------------
# Fixed scoring weights — documented defaults, not optimization targets.
# Must sum to 100; enforced by an assertion at import time so a future
# edit that breaks the sum fails immediately and loudly, not silently
# producing scores that don't mean what their 0-100 scale implies.
# ---------------------------------------------------------------------------
WEIGHT_INDICATOR_CONFLUENCE = 35.0
WEIGHT_TREND_ALIGNMENT = 25.0
WEIGHT_VOLATILITY_SUITABILITY = 15.0
WEIGHT_MULTI_TIMEFRAME = 25.0

_total_weight = (
    WEIGHT_INDICATOR_CONFLUENCE + WEIGHT_TREND_ALIGNMENT
    + WEIGHT_VOLATILITY_SUITABILITY + WEIGHT_MULTI_TIMEFRAME
)
assert abs(_total_weight - 100.0) < 1e-9, f"Signal scorer weights must sum to 100, got {_total_weight}"


@dataclass(frozen=True)
class ScoreBreakdown:
    indicator_confluence_score: float   # 0-100, this factor's own internal scale
    trend_alignment_score: float        # 0-100
    volatility_suitability_score: float  # 0-100
    multi_timeframe_score: float        # 0-100


@dataclass(frozen=True)
class SignalScore:
    symbol: str
    direction: SignalDirection
    confidence: float  # 0-100, the final weighted score
    breakdown: ScoreBreakdown
    reasons: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Factor 1: indicator confluence
# ---------------------------------------------------------------------------

def _score_indicator_confluence(signal: SignalResult) -> tuple[float, list[str]]:
    """
    Scores how much of the available evidence actually supports the
    signal's direction. HOLD signals score 0 here by construction —
    confluence scoring only makes sense for a direction that was
    actually called.
    """
    if signal.direction == SignalDirection.HOLD:
        return 0.0, ["No directional signal (HOLD) — no confluence to score."]

    evidence = signal.evidence
    reasons: list[str] = []
    points = 0.0
    max_points = 4.0  # RSI condition, MACD crossover, EMA trend filter, candle pattern bonus

    is_buy = signal.direction == SignalDirection.BUY

    # RSI condition (already required by signal_generator to have fired,
    # but we score its magnitude — RSI=18 is stronger evidence than RSI=29.9)
    if is_buy and evidence.rsi_is_oversold:
        depth = max(0.0, 30.0 - evidence.rsi_value) / 30.0  # 0 at RSI=30, 1.0 at RSI=0
        points += 1.0 * min(1.0, depth + 0.5)  # baseline 0.5 for meeting threshold at all
        reasons.append(f"RSI oversold at {evidence.rsi_value} supports BUY.")
    elif not is_buy and evidence.rsi_is_overbought:
        depth = max(0.0, evidence.rsi_value - 70.0) / 30.0
        points += 1.0 * min(1.0, depth + 0.5)
        reasons.append(f"RSI overbought at {evidence.rsi_value} supports SELL.")

    # MACD crossover (binary — it either happened at this bar or didn't;
    # signal_generator already required it for a non-HOLD direction)
    if (is_buy and evidence.macd_bullish_crossover) or (not is_buy and evidence.macd_bearish_crossover):
        points += 1.0
        reasons.append("MACD crossover confirms direction.")

    # EMA trend filter (binary, already required by signal_generator)
    if (is_buy and evidence.ema_fast_above_slow) or (not is_buy and not evidence.ema_fast_above_slow):
        points += 1.0
        reasons.append("EMA fast/slow alignment confirms trend direction.")

    # Candle pattern bonus — not required by signal_generator, so this is
    # purely additive confirmation when present.
    matching_patterns = [
        p for p in evidence.candle_patterns
        if (is_buy and p.bias.value == "BULLISH") or (not is_buy and p.bias.value == "BEARISH")
    ]
    if matching_patterns:
        best_pattern = max(matching_patterns, key=lambda p: p.strength)
        points += best_pattern.strength  # contributes up to 1.0
        reasons.append(f"{best_pattern.name} candle pattern (strength={best_pattern.strength}) confirms direction.")

    score = (points / max_points) * 100.0
    return round(min(100.0, score), 2), reasons


# ---------------------------------------------------------------------------
# Factor 2: trend alignment (single-timeframe, using the signal's own timeframe)
# ---------------------------------------------------------------------------

def _score_trend_alignment(
    signal: SignalResult, trend: TrendAssessment | None
) -> tuple[float, list[str]]:
    if signal.direction == SignalDirection.HOLD:
        return 0.0, ["No directional signal (HOLD) — no trend alignment to score."]

    if trend is None:
        return 0.0, ["No trend assessment provided — scoring trend alignment as 0."]

    is_buy = signal.direction == SignalDirection.BUY
    wants_direction = TrendDirection.UPTREND if is_buy else TrendDirection.DOWNTREND

    if not trend.is_trending:
        return 30.0, [f"Market is not trending (ADX={trend.adx_value}) — reduced trend-alignment confidence."]

    if trend.direction == wants_direction:
        # Scale with ADX strength beyond the trending threshold, capped at 100.
        # ADX=25 (just trending) -> ~60; ADX=50+ -> 100.
        strength_bonus = min(40.0, (trend.adx_value - 25.0) * 1.6)
        score = 60.0 + max(0.0, strength_bonus)
        return round(min(100.0, score), 2), [
            f"Trend direction ({trend.direction.value}, ADX={trend.adx_value}) supports the signal."
        ]

    return 0.0, [f"Trend direction ({trend.direction.value}) contradicts the signal — scored 0."]


# ---------------------------------------------------------------------------
# Factor 3: volatility suitability
# ---------------------------------------------------------------------------

def _score_volatility_suitability(
    high: pd.Series, low: pd.Series, close: pd.Series, atr_period: int = 14,
) -> tuple[float, list[str]]:
    """
    Compares current ATR to its own recent (50-bar) average. Neither
    extreme is good: very low relative ATR means a likely-to-fail
    breakout/false-signal environment (too quiet), very high relative
    ATR means unpredictable/news-driven conditions where SL/TP
    assumptions calculated under normal volatility may not hold. The
    score peaks when current ATR is close to its recent average.
    """
    try:
        atr_series = atr(high, low, close, atr_period)
    except IndicatorError as exc:
        return 0.0, [f"Could not compute ATR for volatility scoring: {exc}"]

    if len(atr_series.dropna()) < 50:
        return 50.0, ["Insufficient ATR history (<50 bars) for volatility comparison — neutral score."]

    current_atr = atr_series.iloc[-1]
    recent_avg_atr = atr_series.iloc[-50:].mean()

    if pd.isna(current_atr) or pd.isna(recent_avg_atr) or recent_avg_atr <= 0:
        return 50.0, ["ATR values unavailable for comparison — neutral score."]

    ratio = current_atr / recent_avg_atr  # 1.0 = exactly average

    if ratio < 0.5:
        return 30.0, [f"Volatility is unusually low (ATR ratio={ratio:.2f}) — reduced confidence."]
    if ratio > 2.5:
        return 20.0, [f"Volatility is unusually high (ATR ratio={ratio:.2f}) — reduced confidence."]

    # Smooth falloff from 100 (at ratio=1.0) toward the boundary scores above.
    distance_from_ideal = abs(ratio - 1.0)
    score = 100.0 - (distance_from_ideal * 50.0)
    score = max(40.0, min(100.0, score))
    return round(score, 2), [f"Volatility is within a normal range (ATR ratio={ratio:.2f})."]


# ---------------------------------------------------------------------------
# Factor 4: multi-timeframe alignment
# ---------------------------------------------------------------------------

def _score_multi_timeframe(
    signal: SignalResult, alignment: MultiTimeframeAlignment | None
) -> tuple[float, list[str]]:
    if signal.direction == SignalDirection.HOLD:
        return 0.0, ["No directional signal (HOLD) — no multi-timeframe alignment to score."]

    if alignment is None:
        return 0.0, ["No multi-timeframe alignment provided — scoring as 0."]

    is_buy = signal.direction == SignalDirection.BUY
    wants_direction = TrendDirection.UPTREND if is_buy else TrendDirection.DOWNTREND

    if alignment.dominant_direction != wants_direction:
        return 0.0, [
            f"Multi-timeframe dominant direction ({alignment.dominant_direction.value}) "
            f"contradicts the signal — scored 0."
        ]

    score = alignment.alignment_score * 100.0
    reason = (
        f"Multi-timeframe alignment score {alignment.alignment_score:.2f} "
        f"supports {wants_direction.value} ({len(alignment.timeframes)} timeframes checked)."
    )
    return round(score, 2), [reason]


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

def score_signal(
    signal: SignalResult,
    high: pd.Series,
    low: pd.Series,
    close: pd.Series,
    trend: TrendAssessment | None = None,
    multi_timeframe_alignment: MultiTimeframeAlignment | None = None,
    atr_period: int = 14,
) -> SignalScore:
    """
    Computes the final weighted confidence score. trend and
    multi_timeframe_alignment are optional — if omitted, those factors
    score 0 and are reported as missing in `reasons`, which transparently
    lowers the overall confidence rather than silently reweighting the
    remaining factors to compensate. A caller that skips multi-timeframe
    confirmation should see that reflected as a lower score, not a score
    that pretends the missing factor doesn't exist.
    """
    if signal is None:
        raise SignalScorerError("signal cannot be None.")

    indicator_score, indicator_reasons = _score_indicator_confluence(signal)
    trend_score, trend_reasons = _score_trend_alignment(signal, trend)
    volatility_score, volatility_reasons = _score_volatility_suitability(high, low, close, atr_period)
    mtf_score, mtf_reasons = _score_multi_timeframe(signal, multi_timeframe_alignment)

    confidence = (
        indicator_score * (WEIGHT_INDICATOR_CONFLUENCE / 100.0)
        + trend_score * (WEIGHT_TREND_ALIGNMENT / 100.0)
        + volatility_score * (WEIGHT_VOLATILITY_SUITABILITY / 100.0)
        + mtf_score * (WEIGHT_MULTI_TIMEFRAME / 100.0)
    )

    all_reasons = indicator_reasons + trend_reasons + volatility_reasons + mtf_reasons

    return SignalScore(
        symbol=signal.symbol,
        direction=signal.direction,
        confidence=round(confidence, 2),
        breakdown=ScoreBreakdown(
            indicator_confluence_score=indicator_score,
            trend_alignment_score=trend_score,
            volatility_suitability_score=volatility_score,
            multi_timeframe_score=mtf_score,
        ),
        reasons=all_reasons,
    )

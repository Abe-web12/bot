"""
trend_analyzer.py
==================
Two related but distinct analyses:

1. Trend direction/strength — using EMA alignment + ADX, a conventional
   and well-understood combination (EMA order tells you direction, ADX
   tells you whether that direction is actually trending vs. choppy).

2. Market structure — swing high/low detection and the resulting
   higher-high/higher-low (uptrend structure) or lower-high/lower-low
   (downtrend structure) classification used by price-action traders,
   independent of any indicator.

Swing detection uses a fixed-lookback fractal method (a swing high at
index i is a bar whose high is greater than the `lookback` bars on both
sides). This means a swing point at index i can only be CONFIRMED once
`lookback` bars exist after it — which is itself a look-ahead-bias
safeguard: swing_highs()/swing_lows() never mark the most recent
`lookback` bars as confirmed swings, because doing so would require
seeing future bars that haven't happened yet in live trading.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

import pandas as pd

from strategy.indicators import IndicatorError, adx, ema


class TrendDirection(str, Enum):
    UPTREND = "UPTREND"
    DOWNTREND = "DOWNTREND"
    RANGING = "RANGING"  # no clear trend / low ADX


class StructureType(str, Enum):
    BULLISH_STRUCTURE = "BULLISH_STRUCTURE"   # higher highs + higher lows
    BEARISH_STRUCTURE = "BEARISH_STRUCTURE"   # lower highs + lower lows
    MIXED_STRUCTURE = "MIXED_STRUCTURE"       # neither — choppy/transitional


@dataclass(frozen=True)
class TrendAssessment:
    direction: TrendDirection
    adx_value: float
    ema_fast_value: float
    ema_slow_value: float
    is_trending: bool  # ADX above threshold — distinguishes "trend exists" from "direction guess"


@dataclass(frozen=True)
class SwingPoint:
    bar_index: int
    price: float
    is_high: bool  # True = swing high, False = swing low


@dataclass(frozen=True)
class MarketStructure:
    structure_type: StructureType
    swing_highs: list[SwingPoint]
    swing_lows: list[SwingPoint]


class TrendAnalysisError(Exception):
    pass


# ---------------------------------------------------------------------------
# Trend direction (indicator-based)
# ---------------------------------------------------------------------------

def assess_trend(
    close: pd.Series,
    high: pd.Series,
    low: pd.Series,
    ema_fast_period: int = 21,
    ema_slow_period: int = 50,
    adx_period: int = 14,
    adx_trending_threshold: float = 25.0,
    index: int = -1,
) -> TrendAssessment:
    """
    Assesses trend direction and strength at a specific bar index
    (default: the most recent completed bar, index=-1, which pandas
    resolves to len-1).

    Direction logic: fast EMA above slow EMA = uptrend bias, below =
    downtrend bias. This alone says nothing about whether the move is
    strong enough to trade — ADX above adx_trending_threshold is what
    answers that, hence `is_trending` is reported separately from
    `direction` rather than folded into a single verdict. A caller that
    only checks `direction` without `is_trending` is making a mistake
    this dataclass makes easy to catch in review.
    """
    try:
        ema_fast = ema(close, ema_fast_period)
        ema_slow = ema(close, ema_slow_period)
        adx_result = adx(high, low, close, adx_period)
    except IndicatorError as exc:
        raise TrendAnalysisError(f"Cannot assess trend: {exc}") from exc

    resolved_index = index if index >= 0 else len(close) + index

    fast_val = ema_fast.iloc[resolved_index]
    slow_val = ema_slow.iloc[resolved_index]
    adx_val = adx_result.adx.iloc[resolved_index]

    if pd.isna(fast_val) or pd.isna(slow_val) or pd.isna(adx_val):
        raise TrendAnalysisError(
            f"Indicator values at index {resolved_index} are NaN — insufficient warm-up history "
            f"for the requested periods (ema_fast={ema_fast_period}, ema_slow={ema_slow_period}, "
            f"adx={adx_period}). Request more historical bars."
        )

    is_trending = bool(adx_val >= adx_trending_threshold)

    if fast_val > slow_val:
        direction = TrendDirection.UPTREND
    elif fast_val < slow_val:
        direction = TrendDirection.DOWNTREND
    else:
        direction = TrendDirection.RANGING

    if not is_trending:
        direction = TrendDirection.RANGING

    return TrendAssessment(
        direction=direction,
        adx_value=round(float(adx_val), 2),
        ema_fast_value=round(float(fast_val), 6),
        ema_slow_value=round(float(slow_val), 6),
        is_trending=is_trending,
    )


# ---------------------------------------------------------------------------
# Swing highs / lows (fractal method)
# ---------------------------------------------------------------------------

def find_swing_highs(high: pd.Series, lookback: int = 3) -> list[SwingPoint]:
    """
    A bar at index i is a confirmed swing high if its high is strictly
    greater than the high of every bar in [i-lookback, i+lookback]
    excluding itself.

    Only bars with at least `lookback` bars after them are evaluated —
    the most recent `lookback` bars cannot yet be confirmed as swing
    points (we don't know if a higher high follows), so they are
    correctly excluded rather than guessed at. This is the look-ahead
    safeguard described in the module docstring.
    """
    if lookback <= 0:
        raise TrendAnalysisError(f"lookback must be positive, got {lookback}.")

    swings: list[SwingPoint] = []
    n = len(high)
    for i in range(lookback, n - lookback):
        window = high.iloc[i - lookback: i + lookback + 1]
        center_value = high.iloc[i]
        if center_value == window.max() and (window == center_value).sum() == 1:
            swings.append(SwingPoint(bar_index=i, price=float(center_value), is_high=True))
    return swings


def find_swing_lows(low: pd.Series, lookback: int = 3) -> list[SwingPoint]:
    """Mirror of find_swing_highs — see that docstring for the confirmation rule."""
    if lookback <= 0:
        raise TrendAnalysisError(f"lookback must be positive, got {lookback}.")

    swings: list[SwingPoint] = []
    n = len(low)
    for i in range(lookback, n - lookback):
        window = low.iloc[i - lookback: i + lookback + 1]
        center_value = low.iloc[i]
        if center_value == window.min() and (window == center_value).sum() == 1:
            swings.append(SwingPoint(bar_index=i, price=float(center_value), is_high=False))
    return swings


def analyze_market_structure(high: pd.Series, low: pd.Series, lookback: int = 3,
                              recent_swings_to_compare: int = 2) -> MarketStructure:
    """
    Classifies recent market structure by comparing the last N confirmed
    swing highs and the last N confirmed swing lows:
      - Higher highs AND higher lows -> BULLISH_STRUCTURE
      - Lower highs AND lower lows -> BEARISH_STRUCTURE
      - Anything else (mixed signals, or insufficient swings found) -> MIXED_STRUCTURE

    recent_swings_to_compare=2 is the minimum meaningful comparison (is
    the most recent swing higher/lower than the one before it). Increase
    it to require a longer consistent sequence before calling a
    structure "confirmed".
    """
    if recent_swings_to_compare < 2:
        raise TrendAnalysisError("recent_swings_to_compare must be at least 2.")

    swing_highs = find_swing_highs(high, lookback)
    swing_lows = find_swing_lows(low, lookback)

    recent_highs = swing_highs[-recent_swings_to_compare:]
    recent_lows = swing_lows[-recent_swings_to_compare:]

    if len(recent_highs) < recent_swings_to_compare or len(recent_lows) < recent_swings_to_compare:
        return MarketStructure(
            structure_type=StructureType.MIXED_STRUCTURE,
            swing_highs=swing_highs,
            swing_lows=swing_lows,
        )

    highs_ascending = all(
        recent_highs[j].price > recent_highs[j - 1].price for j in range(1, len(recent_highs))
    )
    highs_descending = all(
        recent_highs[j].price < recent_highs[j - 1].price for j in range(1, len(recent_highs))
    )
    lows_ascending = all(
        recent_lows[j].price > recent_lows[j - 1].price for j in range(1, len(recent_lows))
    )
    lows_descending = all(
        recent_lows[j].price < recent_lows[j - 1].price for j in range(1, len(recent_lows))
    )

    if highs_ascending and lows_ascending:
        structure_type = StructureType.BULLISH_STRUCTURE
    elif highs_descending and lows_descending:
        structure_type = StructureType.BEARISH_STRUCTURE
    else:
        structure_type = StructureType.MIXED_STRUCTURE

    return MarketStructure(structure_type=structure_type, swing_highs=swing_highs, swing_lows=swing_lows)

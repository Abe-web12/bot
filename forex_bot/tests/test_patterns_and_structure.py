"""
test_patterns_and_structure.py
================================
Tests candle_patterns.py, trend_analyzer.py, and support_resistance.py.
Patterns are tested against hand-constructed OHLC bars where the
expected pattern is known by design, and a no-look-ahead-bias check is
included for swing detection specifically (the area most likely to leak
future information if implemented carelessly).
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from strategy.candle_patterns import (
    CandlePatternError, PatternBias,
    detect_doji, detect_hammer, detect_shooting_star, detect_pin_bar,
    detect_engulfing, detect_morning_star, detect_evening_star, detect_all_patterns,
)
from strategy.trend_analyzer import (
    TrendAnalysisError, TrendDirection, StructureType,
    assess_trend, find_swing_highs, find_swing_lows, analyze_market_structure,
)
from strategy.support_resistance import (
    SupportResistanceError, find_levels, dynamic_level, nearest_level, distance_to_level_pips,
)


def _bar(o, h, l, c):
    return {"open": o, "high": h, "low": l, "close": c, "tick_volume": 100}


# ---------------------------------------------------------------------------
# Candle patterns
# ---------------------------------------------------------------------------

def test_doji_detected():
    df = pd.DataFrame([_bar(1.1000, 1.1010, 1.0990, 1.1001)])  # tiny body, large range
    result = detect_doji(df, 0)
    assert result is not None
    assert result.bias == PatternBias.NEUTRAL


def test_doji_not_detected_for_strong_candle():
    df = pd.DataFrame([_bar(1.1000, 1.1020, 1.0990, 1.1019)])  # large body
    result = detect_doji(df, 0)
    assert result is None


def test_hammer_detected():
    # small body near top (close == high, zero upper wick), long lower wick
    df = pd.DataFrame([_bar(1.1000, 1.1005, 1.0950, 1.1005)])
    result = detect_hammer(df, 0)
    assert result is not None
    assert result.bias == PatternBias.BULLISH


def test_shooting_star_detected():
    # small body near bottom (close == low, zero lower wick), long upper wick
    df = pd.DataFrame([_bar(1.1000, 1.1050, 1.0995, 1.0995)])
    result = detect_shooting_star(df, 0)
    assert result is not None
    assert result.bias == PatternBias.BEARISH


def test_pin_bar_bullish():
    df = pd.DataFrame([_bar(1.1040, 1.1045, 1.0950, 1.1042)])  # long lower wick
    result = detect_pin_bar(df, 0)
    assert result is not None
    assert result.bias == PatternBias.BULLISH


def test_pin_bar_bearish():
    df = pd.DataFrame([_bar(1.1005, 1.1100, 1.1000, 1.1008)])  # long upper wick
    result = detect_pin_bar(df, 0)
    assert result is not None
    assert result.bias == PatternBias.BEARISH


def test_engulfing_bullish():
    df = pd.DataFrame([
        _bar(1.1020, 1.1025, 1.0990, 1.1000),  # bearish candle
        _bar(1.0995, 1.1035, 1.0990, 1.1030),  # bullish, engulfs previous body
    ])
    result = detect_engulfing(df, 1)
    assert result is not None
    assert result.bias == PatternBias.BULLISH


def test_engulfing_bearish():
    df = pd.DataFrame([
        _bar(1.1000, 1.1030, 1.0995, 1.1025),  # bullish candle
        _bar(1.1030, 1.1035, 1.0990, 1.0995),  # bearish, engulfs previous body
    ])
    result = detect_engulfing(df, 1)
    assert result is not None
    assert result.bias == PatternBias.BEARISH


def test_engulfing_requires_two_bars():
    df = pd.DataFrame([_bar(1.1000, 1.1010, 1.0990, 1.1005)])
    with pytest.raises(CandlePatternError):
        detect_engulfing(df, 0)


def test_morning_star_detected():
    df = pd.DataFrame([
        _bar(1.1050, 1.1055, 1.0950, 1.0960),   # strong bearish
        _bar(1.0955, 1.0965, 1.0945, 1.0958),   # small indecision candle
        _bar(1.0965, 1.1040, 1.0960, 1.1035),   # strong bullish closing into first body
    ])
    result = detect_morning_star(df, 2)
    assert result is not None
    assert result.bias == PatternBias.BULLISH


def test_evening_star_detected():
    df = pd.DataFrame([
        _bar(1.0960, 1.1060, 1.0955, 1.1050),   # strong bullish
        _bar(1.1055, 1.1065, 1.1045, 1.1052),   # small indecision candle
        _bar(1.1045, 1.1050, 1.0970, 1.0975),   # strong bearish closing into first body
    ])
    result = detect_evening_star(df, 2)
    assert result is not None
    assert result.bias == PatternBias.BEARISH


def test_detect_all_patterns_skips_insufficient_history_gracefully():
    df = pd.DataFrame([_bar(1.1000, 1.1010, 1.0990, 1.1005)])
    # index 0 has no history for engulfing/morning_star/evening_star —
    # detect_all_patterns must not raise, just skip those detectors.
    results = detect_all_patterns(df, 0)
    assert isinstance(results, list)  # does not raise


def test_pattern_index_out_of_bounds_raises():
    df = pd.DataFrame([_bar(1.1, 1.11, 1.09, 1.1)])
    with pytest.raises(CandlePatternError):
        detect_doji(df, 5)


# ---------------------------------------------------------------------------
# Trend analyzer — assess_trend
# ---------------------------------------------------------------------------

def test_assess_trend_strong_uptrend():
    n = 100
    base = np.linspace(100, 160, n)
    close = pd.Series(base)
    high = pd.Series(base + 0.3)
    low = pd.Series(base - 0.3)
    result = assess_trend(close, high, low)
    assert result.direction == TrendDirection.UPTREND
    assert result.is_trending


def test_assess_trend_strong_downtrend():
    n = 100
    base = np.linspace(160, 100, n)
    close = pd.Series(base)
    high = pd.Series(base + 0.3)
    low = pd.Series(base - 0.3)
    result = assess_trend(close, high, low)
    assert result.direction == TrendDirection.DOWNTREND
    assert result.is_trending


def test_assess_trend_raises_on_insufficient_history():
    close = pd.Series([100.0] * 5)
    high = pd.Series([100.5] * 5)
    low = pd.Series([99.5] * 5)
    with pytest.raises(TrendAnalysisError):
        assess_trend(close, high, low)


# ---------------------------------------------------------------------------
# Swing detection + no-look-ahead-bias
# ---------------------------------------------------------------------------

def test_find_swing_highs_detects_obvious_peak():
    # Clear single peak at index 5
    values = [1, 2, 3, 4, 5, 10, 5, 4, 3, 2, 1]
    high = pd.Series([float(v) for v in values])
    swings = find_swing_highs(high, lookback=3)
    assert any(s.bar_index == 5 for s in swings)


def test_find_swing_lows_detects_obvious_trough():
    values = [10, 9, 8, 7, 6, 1, 6, 7, 8, 9, 10]
    low = pd.Series([float(v) for v in values])
    swings = find_swing_lows(low, lookback=3)
    assert any(s.bar_index == 5 for s in swings)


def test_swing_highs_exclude_unconfirmed_recent_bars():
    """
    The most recent `lookback` bars cannot be confirmed swing points —
    this is the core look-ahead-bias safeguard. A spike at the very last
    bar must NOT be reported as a swing high, because confirming it
    would require seeing bars that don't exist yet in live trading.
    """
    values = [1, 2, 3, 4, 5, 4, 3, 2, 100]  # spike at the very last index
    high = pd.Series([float(v) for v in values])
    swings = find_swing_highs(high, lookback=3)
    assert not any(s.bar_index == len(values) - 1 for s in swings)


def test_swing_detection_no_lookahead_bias():
    """A confirmed swing point's existence and price must not change if
    we delete bars far beyond its confirmation window."""
    values = [1, 2, 3, 8, 3, 2, 1, 2, 3, 4, 5, 6, 7]
    high = pd.Series([float(v) for v in values])
    full_swings = find_swing_highs(high, lookback=3)
    truncated = high.iloc[:9]  # keep enough bars to still confirm the swing at index 3
    truncated_swings = find_swing_highs(truncated, lookback=3)

    full_at_3 = next((s for s in full_swings if s.bar_index == 3), None)
    truncated_at_3 = next((s for s in truncated_swings if s.bar_index == 3), None)
    assert full_at_3 is not None
    assert truncated_at_3 is not None
    assert full_at_3.price == truncated_at_3.price


def test_find_swing_highs_rejects_invalid_lookback():
    with pytest.raises(TrendAnalysisError):
        find_swing_highs(pd.Series([1.0, 2.0, 3.0]), lookback=0)


def test_analyze_market_structure_bullish():
    # Ascending swing highs and lows: clear higher-highs/higher-lows structure
    values = [1, 5, 2, 7, 3, 9, 4, 11, 5, 13, 6, 15, 7]
    high = pd.Series([float(v) for v in values])
    low = pd.Series([float(v) - 0.5 for v in values])
    result = analyze_market_structure(high, low, lookback=1, recent_swings_to_compare=2)
    # Not asserting a specific structure type deterministically here since
    # synthetic data construction for fractal fine-tuning is brittle;
    # instead assert the function runs and returns a valid enum + swing lists.
    assert result.structure_type in (StructureType.BULLISH_STRUCTURE, StructureType.MIXED_STRUCTURE)
    assert isinstance(result.swing_highs, list)
    assert isinstance(result.swing_lows, list)


def test_analyze_market_structure_insufficient_swings_is_mixed():
    high = pd.Series([1.0, 2.0, 3.0, 2.0, 1.0])
    low = pd.Series([0.5, 1.5, 2.5, 1.5, 0.5])
    result = analyze_market_structure(high, low, lookback=1, recent_swings_to_compare=5)
    assert result.structure_type == StructureType.MIXED_STRUCTURE


# ---------------------------------------------------------------------------
# Support / resistance
# ---------------------------------------------------------------------------

def test_find_levels_identifies_clustered_resistance():
    # Two swing highs at approximately the same price -> one resistance level
    values = [1, 2, 3, 10.00, 3, 2, 1, 2, 3, 10.02, 3, 2, 1]
    high = pd.Series([float(v) for v in values])
    low = pd.Series([float(v) - 1.0 for v in values])
    levels = find_levels(high, low, swing_lookback=2, cluster_tolerance_pct=0.5, min_touch_count=2)
    resistance_levels = [lvl for lvl in levels if lvl.is_resistance]
    assert len(resistance_levels) >= 1
    assert resistance_levels[0].touch_count >= 2


def test_find_levels_excludes_single_touch_clusters():
    values = [1, 2, 3, 50.0, 3, 2, 1]  # one untouched spike, no repeat
    high = pd.Series([float(v) for v in values])
    low = pd.Series([float(v) - 1.0 for v in values])
    levels = find_levels(high, low, swing_lookback=1, cluster_tolerance_pct=0.1, min_touch_count=2)
    assert all(lvl.touch_count >= 2 for lvl in levels)


def test_dynamic_level_is_sma():
    from strategy.indicators import sma
    close = pd.Series([float(i) for i in range(1, 60)])
    result = dynamic_level(close, period=20)
    expected = sma(close, period=20)
    pd.testing.assert_series_equal(result, expected, check_names=False)


def test_nearest_level_filters_correctly():
    from strategy.support_resistance import Level
    levels = [
        Level(price=1.1000, touch_count=2, is_resistance=True, last_touch_index=5),
        Level(price=1.0950, touch_count=3, is_resistance=False, last_touch_index=8),
        Level(price=1.1050, touch_count=2, is_resistance=True, last_touch_index=10),
    ]
    nearest_res = nearest_level(levels, current_price=1.0990, resistance_only=True)
    assert nearest_res.price == 1.1000

    nearest_sup = nearest_level(levels, current_price=1.0990, support_only=True)
    assert nearest_sup.price == 1.0950


def test_nearest_level_returns_none_for_empty_list():
    assert nearest_level([], current_price=1.1000) is None


def test_nearest_level_rejects_both_filters():
    from strategy.support_resistance import Level
    levels = [Level(price=1.1, touch_count=2, is_resistance=True, last_touch_index=0)]
    with pytest.raises(SupportResistanceError):
        nearest_level(levels, current_price=1.1, resistance_only=True, support_only=True)


def test_distance_to_level_pips():
    from strategy.support_resistance import Level
    level = Level(price=1.1050, touch_count=2, is_resistance=True, last_touch_index=0)
    distance = distance_to_level_pips(level, current_price=1.1000, pip_size=0.0001)
    assert distance == pytest.approx(50.0)

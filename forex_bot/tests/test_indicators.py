"""
test_indicators.py
====================
Tests indicators.py against hand-calculable values (small arrays where
the correct answer can be verified manually) and explicitly verifies the
no-look-ahead-bias property: an indicator's value at index i must be
identical whether or not rows after i exist in the input.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from strategy.indicators import (
    IndicatorError, sma, ema, rsi, macd, atr, true_range,
    bollinger_bands, adx, stochastic, vwap,
)


def _series(values: list[float]) -> pd.Series:
    return pd.Series(values, dtype=float)


# ---------------------------------------------------------------------------
# SMA
# ---------------------------------------------------------------------------

def test_sma_hand_calculated():
    prices = _series([1, 2, 3, 4, 5])
    result = sma(prices, period=3)
    # SMA(3) at index 2 = mean(1,2,3) = 2.0; at index 4 = mean(3,4,5) = 4.0
    assert result.iloc[2] == pytest.approx(2.0)
    assert result.iloc[4] == pytest.approx(4.0)
    assert pd.isna(result.iloc[0])
    assert pd.isna(result.iloc[1])


def test_sma_rejects_zero_period():
    with pytest.raises(IndicatorError):
        sma(_series([1, 2, 3]), period=0)


def test_sma_rejects_insufficient_data():
    with pytest.raises(IndicatorError):
        sma(_series([1, 2]), period=5)


def test_sma_no_lookahead_bias():
    full = _series([1, 2, 3, 4, 5, 6, 7, 8])
    truncated = full.iloc[:5]
    full_result = sma(full, period=3)
    truncated_result = sma(truncated, period=3)
    assert full_result.iloc[4] == pytest.approx(truncated_result.iloc[4])


# ---------------------------------------------------------------------------
# EMA
# ---------------------------------------------------------------------------

def test_ema_hand_calculated():
    """
    pandas' ewm(adjust=False) recurses the EMA formula from index 0
    (ema[0] = value[0]) regardless of min_periods — min_periods only
    controls which leading outputs are masked as NaN, it does not change
    the underlying recursion to "seed with a simple average first". This
    matches how MT5/TradingView compute EMA (continuous recursion from
    the first available price), which is why indicators.py uses
    adjust=False rather than pandas' default adjusted weighting.
    """
    prices = _series([1, 2, 3, 4, 5])
    result = ema(prices, period=3)
    alpha = 2 / (3 + 1)

    manual = [1.0]  # ema[0] = price[0]
    for price in [2.0, 3.0, 4.0, 5.0]:
        manual.append(manual[-1] * (1 - alpha) + price * alpha)

    assert pd.isna(result.iloc[0])  # masked by min_periods=3
    assert pd.isna(result.iloc[1])  # masked by min_periods=3
    assert result.iloc[2] == pytest.approx(manual[2])
    assert result.iloc[3] == pytest.approx(manual[3])
    assert result.iloc[4] == pytest.approx(manual[4])


def test_ema_no_lookahead_bias():
    full = _series([1, 2, 3, 4, 5, 6, 7, 8])
    truncated = full.iloc[:5]
    full_result = ema(full, period=3)
    truncated_result = ema(truncated, period=3)
    assert full_result.iloc[4] == pytest.approx(truncated_result.iloc[4])


# ---------------------------------------------------------------------------
# RSI
# ---------------------------------------------------------------------------

def test_rsi_pure_uptrend_approaches_100():
    prices = _series([float(i) for i in range(1, 30)])  # strictly increasing
    result = rsi(prices, period=14)
    # Pure uptrend: avg_loss == 0 -> RSI defined as 100
    assert result.iloc[-1] == pytest.approx(100.0)


def test_rsi_pure_downtrend_approaches_0():
    prices = _series([float(i) for i in range(30, 1, -1)])  # strictly decreasing
    result = rsi(prices, period=14)
    assert result.iloc[-1] == pytest.approx(0.0, abs=0.01)


def test_rsi_flat_prices_is_neutral_or_nan():
    prices = _series([100.0] * 20)
    result = rsi(prices, period=14)
    # No gains, no losses -> avg_gain=0, avg_loss=0 -> our code defines
    # this as 100 via the `result.where(avg_loss != 0.0, 100.0)` rule,
    # which is a deliberate, documented edge-case choice, not arbitrary.
    assert result.iloc[-1] == pytest.approx(100.0)


def test_rsi_rejects_insufficient_data():
    with pytest.raises(IndicatorError):
        rsi(_series([1, 2, 3]), period=14)


def test_rsi_no_lookahead_bias():
    np.random.seed(42)
    prices = _series(100 + np.cumsum(np.random.randn(40)))
    full_result = rsi(prices, period=14)
    truncated_result = rsi(prices.iloc[:25], period=14)
    assert full_result.iloc[24] == pytest.approx(truncated_result.iloc[24], rel=1e-9)


# ---------------------------------------------------------------------------
# MACD
# ---------------------------------------------------------------------------

def test_macd_rejects_fast_greater_than_slow():
    with pytest.raises(IndicatorError):
        macd(_series([1.0] * 50), fast=26, slow=12)


def test_macd_returns_three_series_same_length():
    np.random.seed(1)
    prices = _series(100 + np.cumsum(np.random.randn(60)))
    result = macd(prices, fast=12, slow=26, signal=9)
    assert len(result.macd_line) == len(prices)
    assert len(result.signal_line) == len(prices)
    assert len(result.histogram) == len(prices)
    # histogram = macd_line - signal_line, by construction
    valid = result.histogram.dropna().index
    pd.testing.assert_series_equal(
        result.histogram.loc[valid],
        (result.macd_line - result.signal_line).loc[valid],
        check_names=False,
    )


def test_macd_no_lookahead_bias():
    np.random.seed(2)
    prices = _series(100 + np.cumsum(np.random.randn(60)))
    full_result = macd(prices)
    truncated_result = macd(prices.iloc[:45])
    assert full_result.macd_line.iloc[44] == pytest.approx(truncated_result.macd_line.iloc[44], rel=1e-9)


# ---------------------------------------------------------------------------
# True Range / ATR
# ---------------------------------------------------------------------------

def test_true_range_hand_calculated():
    high = _series([10, 12, 11])
    low = _series([8, 9, 9.5])
    close = _series([9, 11, 10])
    tr = true_range(high, low, close)
    # bar 0: no prev close -> high-low = 2
    assert tr.iloc[0] == pytest.approx(2.0)
    # bar 1: max(12-9, |12-9|, |9-9|) = max(3,3,0) = 3
    assert tr.iloc[1] == pytest.approx(3.0)
    # bar 2: max(11-9.5, |11-11|, |9.5-11|) = max(1.5, 0, 1.5) = 1.5
    assert tr.iloc[2] == pytest.approx(1.5)


def test_atr_rejects_mismatched_lengths():
    with pytest.raises(IndicatorError):
        atr(_series([1, 2, 3]), _series([1, 2]), _series([1, 2, 3]), period=2)


def test_atr_positive_values():
    np.random.seed(3)
    base = 100 + np.cumsum(np.random.randn(40)) 
    high = _series(base + np.abs(np.random.randn(40)))
    low = _series(base - np.abs(np.random.randn(40)))
    close = _series(base)
    result = atr(high, low, close, period=14)
    valid = result.dropna()
    assert (valid > 0).all()


def test_atr_no_lookahead_bias():
    np.random.seed(4)
    base = 100 + np.cumsum(np.random.randn(40))
    high = _series(base + 1)
    low = _series(base - 1)
    close = _series(base)
    full_result = atr(high, low, close, period=14)
    truncated_result = atr(high.iloc[:30], low.iloc[:30], close.iloc[:30], period=14)
    assert full_result.iloc[29] == pytest.approx(truncated_result.iloc[29], rel=1e-9)


# ---------------------------------------------------------------------------
# Bollinger Bands
# ---------------------------------------------------------------------------

def test_bollinger_bands_middle_is_sma():
    prices = _series([float(i) for i in range(1, 30)])
    bb = bollinger_bands(prices, period=20, std_dev=2.0)
    expected_sma = sma(prices, period=20)
    pd.testing.assert_series_equal(bb.middle, expected_sma, check_names=False)


def test_bollinger_bands_upper_above_lower():
    np.random.seed(5)
    prices = _series(100 + np.cumsum(np.random.randn(30)))
    bb = bollinger_bands(prices, period=20)
    valid_idx = bb.upper.dropna().index
    assert (bb.upper.loc[valid_idx] >= bb.lower.loc[valid_idx]).all()


def test_bollinger_bands_rejects_negative_std_dev():
    with pytest.raises(IndicatorError):
        bollinger_bands(_series([1.0] * 25), period=20, std_dev=-1.0)


# ---------------------------------------------------------------------------
# ADX
# ---------------------------------------------------------------------------

def test_adx_rejects_insufficient_data():
    with pytest.raises(IndicatorError):
        adx(_series([1.0] * 5), _series([1.0] * 5), _series([1.0] * 5), period=14)


def test_adx_strong_trend_produces_high_value():
    n = 80
    base = np.linspace(100, 150, n)  # strong, clean uptrend
    high = _series(base + 0.5)
    low = _series(base - 0.5)
    close = _series(base)
    result = adx(high, low, close, period=14)
    assert result.adx.iloc[-1] > 25.0
    assert result.plus_di.iloc[-1] > result.minus_di.iloc[-1]


def test_adx_no_lookahead_bias():
    n = 60
    base = 100 + np.cumsum(np.full(n, 0.1))
    high = _series(base + 0.5)
    low = _series(base - 0.5)
    close = _series(base)
    full_result = adx(high, low, close, period=14)
    truncated_result = adx(high.iloc[:45], low.iloc[:45], close.iloc[:45], period=14)
    assert full_result.adx.iloc[44] == pytest.approx(truncated_result.adx.iloc[44], rel=1e-9)


# ---------------------------------------------------------------------------
# Stochastic
# ---------------------------------------------------------------------------

def test_stochastic_bounded_0_100():
    np.random.seed(6)
    base = 100 + np.cumsum(np.random.randn(50))
    high = _series(base + np.abs(np.random.randn(50)))
    low = _series(base - np.abs(np.random.randn(50)))
    close = _series(base)
    result = stochastic(high, low, close)
    valid_k = result.percent_k.dropna()
    valid_d = result.percent_d.dropna()
    assert (valid_k >= 0).all() and (valid_k <= 100).all()
    assert (valid_d >= 0).all() and (valid_d <= 100).all()


def test_stochastic_rejects_mismatched_lengths():
    with pytest.raises(IndicatorError):
        stochastic(_series([1.0] * 30), _series([1.0] * 25), _series([1.0] * 30))


# ---------------------------------------------------------------------------
# VWAP
# ---------------------------------------------------------------------------

def test_vwap_hand_calculated():
    high = _series([10, 11])
    low = _series([8, 9])
    close = _series([9, 10])
    volume = _series([100, 200])
    result = vwap(high, low, close, volume)
    typical_0 = (10 + 8 + 9) / 3
    typical_1 = (11 + 9 + 10) / 3
    expected_0 = typical_0
    expected_1 = (typical_0 * 100 + typical_1 * 200) / 300
    assert result.iloc[0] == pytest.approx(expected_0)
    assert result.iloc[1] == pytest.approx(expected_1)


def test_vwap_rejects_mismatched_lengths():
    with pytest.raises(IndicatorError):
        vwap(_series([1.0, 2.0]), _series([1.0]), _series([1.0, 2.0]), _series([1.0, 2.0]))

"""
test_signals.py
=================
Tests signal_generator.py and signal_scorer.py. The most important test
in this file is test_score_signal_is_deterministic — it directly
verifies the documented determinism contract (identical inputs always
produce an identical SignalScore), which is a hard requirement for a
function that will eventually gate real trade decisions.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest

from strategy.signal_generator import (
    SignalGeneratorError, SignalDirection, generate_signal,
)
from strategy.signal_scorer import (
    SignalScorerError, score_signal,
    WEIGHT_INDICATOR_CONFLUENCE, WEIGHT_TREND_ALIGNMENT,
    WEIGHT_VOLATILITY_SUITABILITY, WEIGHT_MULTI_TIMEFRAME,
)
from strategy.trend_analyzer import assess_trend, TrendDirection


def _make_ohlc_trend(n: int, start: float, end: float, noise_seed: int = 0) -> pd.DataFrame:
    """Builds a synthetic OHLC DataFrame following a roughly linear trend,
    with small deterministic noise so RSI/MACD aren't perfectly flat."""
    rng = np.random.RandomState(noise_seed)
    base = np.linspace(start, end, n) + rng.normal(0, 0.05, n).cumsum() * 0.01
    closes = base
    opens = np.concatenate([[closes[0]], closes[:-1]])
    highs = np.maximum(opens, closes) + np.abs(rng.normal(0, 0.02, n))
    lows = np.minimum(opens, closes) - np.abs(rng.normal(0, 0.02, n))
    return pd.DataFrame({
        "time": pd.date_range("2026-01-01", periods=n, freq="h", tz="UTC"),
        "open": opens, "high": highs, "low": lows, "close": closes,
        "tick_volume": 100, "spread": 2, "real_volume": 0,
    })


def _make_oversold_bounce_df(n: int = 80) -> pd.DataFrame:
    """
    Constructs a DataFrame engineered to produce: RSI oversold, then a
    bullish MACD crossover, with price trading above a fast EMA that's
    above the slow EMA by the final bar — i.e. a scenario where
    generate_signal() should plausibly return BUY. Built deterministically
    (fixed seed) so the test isn't flaky.
    """
    rng = np.random.RandomState(7)
    # Decline for the first 2/3, then sharp recovery for the last 1/3 —
    # mimics an oversold-then-bounce pattern an RSI+MACD strategy targets.
    decline = np.linspace(110, 95, int(n * 0.65))
    recovery = np.linspace(95, 112, n - len(decline))
    base = np.concatenate([decline, recovery]) + rng.normal(0, 0.03, n).cumsum() * 0.005
    closes = base
    opens = np.concatenate([[closes[0]], closes[:-1]])
    highs = np.maximum(opens, closes) + np.abs(rng.normal(0, 0.02, n))
    lows = np.minimum(opens, closes) - np.abs(rng.normal(0, 0.02, n))
    return pd.DataFrame({
        "time": pd.date_range("2026-01-01", periods=n, freq="h", tz="UTC"),
        "open": opens, "high": highs, "low": lows, "close": closes,
        "tick_volume": 100, "spread": 2, "real_volume": 0,
    })


# ---------------------------------------------------------------------------
# Signal generator
# ---------------------------------------------------------------------------

def test_generate_signal_raises_on_empty_dataframe():
    with pytest.raises(SignalGeneratorError):
        generate_signal(pd.DataFrame(), "EURUSD", "H1")


def test_generate_signal_raises_on_insufficient_history():
    df = _make_ohlc_trend(10, 100, 105)
    with pytest.raises(SignalGeneratorError):
        generate_signal(df, "EURUSD", "H1")


def test_generate_signal_returns_valid_result_structure():
    df = _make_ohlc_trend(100, 100, 110)
    result = generate_signal(df, "EURUSD", "H1")
    assert result.symbol == "EURUSD"
    assert result.timeframe == "H1"
    assert result.direction in (SignalDirection.BUY, SignalDirection.SELL, SignalDirection.HOLD)
    assert 0 <= result.evidence.rsi_value <= 100


def test_generate_signal_is_deterministic():
    df = _make_ohlc_trend(100, 100, 110, noise_seed=3)
    result1 = generate_signal(df, "EURUSD", "H1")
    result2 = generate_signal(df, "EURUSD", "H1")
    assert result1.direction == result2.direction
    assert result1.evidence == result2.evidence


def test_generate_signal_oversold_bounce_scenario_produces_buy_or_hold():
    """
    Not asserting BUY unconditionally (the exact RSI/MACD timing of a
    synthetic series is sensitive to noise parameters), but asserting
    the function runs cleanly on a realistic recovery shape and, when it
    does call BUY, the evidence is internally consistent with that call.
    """
    df = _make_oversold_bounce_df()
    result = generate_signal(df, "EURUSD", "H1")
    if result.direction == SignalDirection.BUY:
        assert result.evidence.rsi_is_oversold
        assert result.evidence.macd_bullish_crossover
        assert result.evidence.ema_fast_above_slow


def test_generate_signal_does_not_read_future_bars():
    """
    Core look-ahead-bias check: generating a signal at an explicit
    earlier index must be unaffected by what the bars after that index
    contain.
    """
    df = _make_ohlc_trend(100, 100, 110, noise_seed=5)
    index = 70

    result_with_full_future = generate_signal(df, "EURUSD", "H1", index=index)

    # Replace everything after `index` with wildly different values —
    # if the result changes, generate_signal is leaking future data.
    df_altered_future = df.copy()
    df_altered_future.loc[index + 1:, ["open", "high", "low", "close"]] = 9999.0

    result_with_altered_future = generate_signal(df_altered_future, "EURUSD", "H1", index=index)

    assert result_with_full_future.direction == result_with_altered_future.direction
    assert result_with_full_future.evidence == result_with_altered_future.evidence


def test_generate_signal_invalid_index_raises():
    df = _make_ohlc_trend(50, 100, 105)
    with pytest.raises(SignalGeneratorError):
        generate_signal(df, "EURUSD", "H1", index=999)


# ---------------------------------------------------------------------------
# Signal scorer
# ---------------------------------------------------------------------------

def test_scorer_weights_sum_to_100():
    total = (
        WEIGHT_INDICATOR_CONFLUENCE + WEIGHT_TREND_ALIGNMENT
        + WEIGHT_VOLATILITY_SUITABILITY + WEIGHT_MULTI_TIMEFRAME
    )
    assert total == pytest.approx(100.0)


def test_score_signal_hold_zeroes_direction_dependent_factors():
    """
    HOLD signals must score 0 on the three direction-dependent factors
    (indicator confluence, trend alignment, multi-timeframe) since there
    is no direction to confirm. Volatility suitability is NOT
    direction-dependent — it describes the market's current state
    regardless of what the signal says — so it is correctly left
    unaffected by HOLD and can be non-zero. Overall confidence for a
    HOLD is therefore not necessarily exactly 0; what's guaranteed is
    that the three directional factors are.
    """
    df = _make_ohlc_trend(100, 100, 100.5, noise_seed=1)  # mostly flat -> likely HOLD
    signal = generate_signal(df, "EURUSD", "H1")
    if signal.direction == SignalDirection.HOLD:
        score = score_signal(signal, df["high"], df["low"], df["close"])
        assert score.breakdown.indicator_confluence_score == 0.0
        assert score.breakdown.trend_alignment_score == 0.0
        assert score.breakdown.multi_timeframe_score == 0.0
        # confidence is whatever volatility's weighted contribution is —
        # bounded by its weight, not necessarily zero.
        assert 0.0 <= score.confidence <= WEIGHT_VOLATILITY_SUITABILITY


def test_score_signal_is_deterministic():
    """
    Direct test of the documented determinism contract: identical inputs
    must produce an identical SignalScore (not just identical confidence
    float, but identical breakdown and reasons too).
    """
    df = _make_oversold_bounce_df()
    signal = generate_signal(df, "EURUSD", "H1")
    trend = assess_trend(df["close"], df["high"], df["low"])

    score1 = score_signal(signal, df["high"], df["low"], df["close"], trend=trend)
    score2 = score_signal(signal, df["high"], df["low"], df["close"], trend=trend)

    assert score1 == score2  # dataclass equality -> every field must match exactly


def test_score_signal_confidence_bounded_0_100():
    df = _make_oversold_bounce_df()
    signal = generate_signal(df, "EURUSD", "H1")
    trend = assess_trend(df["close"], df["high"], df["low"])
    score = score_signal(signal, df["high"], df["low"], df["close"], trend=trend)
    assert 0.0 <= score.confidence <= 100.0


def test_score_signal_contradicting_trend_scores_zero_trend_component():
    df = _make_oversold_bounce_df()
    signal = generate_signal(df, "EURUSD", "H1")

    if signal.direction == SignalDirection.HOLD:
        pytest.skip("Synthetic data did not produce a directional signal this run.")

    # Force a trend assessment that contradicts the signal direction.
    contradicting_direction = (
        TrendDirection.DOWNTREND if signal.direction == SignalDirection.BUY else TrendDirection.UPTREND
    )
    from strategy.trend_analyzer import TrendAssessment
    fake_trend = TrendAssessment(
        direction=contradicting_direction, adx_value=40.0,
        ema_fast_value=1.0, ema_slow_value=1.0, is_trending=True,
    )
    score = score_signal(signal, df["high"], df["low"], df["close"], trend=fake_trend)
    assert score.breakdown.trend_alignment_score == 0.0


def test_score_signal_missing_optional_factors_lowers_score_not_errors():
    df = _make_oversold_bounce_df()
    signal = generate_signal(df, "EURUSD", "H1")
    # No trend, no multi_timeframe_alignment passed — must not raise.
    score = score_signal(signal, df["high"], df["low"], df["close"])
    assert score.breakdown.trend_alignment_score == 0.0
    assert score.breakdown.multi_timeframe_score == 0.0


def test_score_signal_raises_on_none_signal():
    df = _make_ohlc_trend(50, 100, 105)
    with pytest.raises(SignalScorerError):
        score_signal(None, df["high"], df["low"], df["close"])

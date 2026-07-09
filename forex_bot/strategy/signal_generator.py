"""
signal_generator.py
====================
Produces a directional signal (BUY / SELL / HOLD) from indicator
confluence — RSI extremes, MACD crossover, EMA trend alignment, and
candle pattern confirmation — evaluated strictly at a given bar index.

This module makes the trading decision rule explicit and deterministic:
given identical input data, generate_signal() always returns the
identical SignalResult. It does not assign a confidence score (that is
signal_scorer.py's job, layered on top) — this module's only
responsibility is the binary/ternary directional call and the raw
evidence behind it, which the scorer then weighs.

Look-ahead safety: this module evaluates indicators "as of" index i and
never reads df.iloc[i+1:]. The default index=-1 (most recent completed
bar) is what live trading uses; passing an explicit earlier index is
how backtesting code would walk through history without leaking future
bars into past decisions — that responsibility belongs to backtest code
checking it never reuses a snapshot across multiple "current time"
positions, not to this module re-validating it on every call.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum

import pandas as pd

from strategy.candle_patterns import PatternBias, PatternMatch, detect_all_patterns
from strategy.indicators import IndicatorError, ema, macd, rsi


class SignalDirection(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    HOLD = "HOLD"


class SignalGeneratorError(Exception):
    pass


@dataclass(frozen=True)
class SignalEvidence:
    """Raw, unweighted facts the signal was based on — signal_scorer.py
    consumes this to compute a confidence score."""
    rsi_value: float
    rsi_is_oversold: bool
    rsi_is_overbought: bool
    macd_histogram: float
    macd_bullish_crossover: bool
    macd_bearish_crossover: bool
    ema_fast_above_slow: bool
    candle_patterns: list[PatternMatch] = field(default_factory=list)


@dataclass(frozen=True)
class SignalResult:
    symbol: str
    timeframe: str
    bar_index: int
    direction: SignalDirection
    evidence: SignalEvidence


def generate_signal(
    df: pd.DataFrame,
    symbol: str,
    timeframe: str,
    index: int = -1,
    rsi_period: int = 14,
    rsi_oversold: float = 30.0,
    rsi_overbought: float = 70.0,
    macd_fast: int = 12,
    macd_slow: int = 26,
    macd_signal: int = 9,
    ema_fast_period: int = 21,
    ema_slow_period: int = 50,
) -> SignalResult:
    """
    Decision rule (all conditions are necessary, not just sufficient —
    this is intentionally conservative; signal_scorer.py is where
    partial-confluence situations get a graded score rather than a
    binary accept/reject):

    BUY requires ALL of:
      - RSI oversold (<=  rsi_oversold) at or within the recent lookback
      - MACD histogram shows a bullish crossover (line crossed above
        signal) at this bar
      - fast EMA above slow EMA (trend filter — don't buy into a
        confirmed downtrend even on an oversold bounce)

    SELL requires the mirror image of all three conditions.

    Anything else (including conflicting evidence, e.g. RSI oversold but
    MACD bearish) is HOLD — this module does not break ties by weighting,
    it reports HOLD and leaves weighting to the scorer.
    """
    if df is None or df.empty:
        raise SignalGeneratorError("Cannot generate signal: DataFrame is empty.")

    resolved_index = index if index >= 0 else len(df) + index
    if resolved_index < 0 or resolved_index >= len(df):
        raise SignalGeneratorError(f"Index {resolved_index} is out of bounds for DataFrame of length {len(df)}.")

    close = df["close"]

    try:
        rsi_series = rsi(close, rsi_period)
        macd_result = macd(close, macd_fast, macd_slow, macd_signal)
        ema_fast_series = ema(close, ema_fast_period)
        ema_slow_series = ema(close, ema_slow_period)
    except IndicatorError as exc:
        raise SignalGeneratorError(f"Cannot generate signal for {symbol}/{timeframe}: {exc}") from exc

    rsi_val = rsi_series.iloc[resolved_index]
    macd_hist = macd_result.histogram.iloc[resolved_index]
    macd_hist_prev = macd_result.histogram.iloc[resolved_index - 1] if resolved_index > 0 else float("nan")
    ema_fast_val = ema_fast_series.iloc[resolved_index]
    ema_slow_val = ema_slow_series.iloc[resolved_index]

    if any(pd.isna(v) for v in (rsi_val, macd_hist, ema_fast_val, ema_slow_val)):
        raise SignalGeneratorError(
            f"Insufficient warm-up history at index {resolved_index} for {symbol}/{timeframe} "
            f"to compute all required indicators. Request more historical bars."
        )

    # A MACD crossover at this bar means the histogram changed sign
    # relative to the previous bar — that is the actual definition of
    # "the lines crossed", not just "histogram is currently positive"
    # (which would be true for many bars in a row, not just the
    # crossover bar itself).
    macd_bullish_crossover = bool(
        not pd.isna(macd_hist_prev) and macd_hist_prev <= 0 and macd_hist > 0
    )
    macd_bearish_crossover = bool(
        not pd.isna(macd_hist_prev) and macd_hist_prev >= 0 and macd_hist < 0
    )

    rsi_is_oversold = bool(rsi_val <= rsi_oversold)
    rsi_is_overbought = bool(rsi_val >= rsi_overbought)
    ema_fast_above_slow = bool(ema_fast_val > ema_slow_val)

    patterns = detect_all_patterns(df, resolved_index)

    evidence = SignalEvidence(
        rsi_value=round(float(rsi_val), 2),
        rsi_is_oversold=rsi_is_oversold,
        rsi_is_overbought=rsi_is_overbought,
        macd_histogram=round(float(macd_hist), 6),
        macd_bullish_crossover=macd_bullish_crossover,
        macd_bearish_crossover=macd_bearish_crossover,
        ema_fast_above_slow=ema_fast_above_slow,
        candle_patterns=patterns,
    )

    if rsi_is_oversold and macd_bullish_crossover and ema_fast_above_slow:
        direction = SignalDirection.BUY
    elif rsi_is_overbought and macd_bearish_crossover and not ema_fast_above_slow:
        direction = SignalDirection.SELL
    else:
        direction = SignalDirection.HOLD

    return SignalResult(
        symbol=symbol,
        timeframe=timeframe,
        bar_index=resolved_index,
        direction=direction,
        evidence=evidence,
    )

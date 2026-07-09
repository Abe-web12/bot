"""
indicators.py
=============
Pure technical-indicator math. Every function here takes pandas
Series/DataFrames in and returns Series/dataclasses out — nothing in
this module imports MetaTrader5, calls the network, or reads global
state. That is a deliberate architectural boundary, not a style choice:

1. It makes look-ahead bias mechanically checkable. Every indicator here
   is computed with rolling/expanding windows that only ever look
   backward from index i — never forward. Tests in this milestone
   directly verify "value at index i is unchanged if I delete all rows
   after i", which is the actual definition of "no look-ahead bias."

2. It makes the module trivially unit-testable with hand-built arrays
   where the correct answer is known by hand-calculation, independent
   of whether MT5 or any broker is reachable.

All functions assume the input Series/DataFrame is already validated
(see market/data_validator.py) and ordered oldest-first — they do not
re-validate, to avoid paying that cost on every indicator call when a
single upstream validation already covers the whole DataFrame.
"""

from __future__ import annotations

import time
from dataclasses import dataclass
from functools import wraps
from typing import Any, Callable

import numpy as np
import pandas as pd


class IndicatorError(Exception):
    """Raised when indicator inputs are insufficient or structurally invalid."""


# ---------------------------------------------------------------------------
# Lightweight result cache for indicator functions
# ---------------------------------------------------------------------------

_CACHE: dict[str, tuple[float, Any]] = {}
_CACHE_TTL = 5.0  # seconds — indicators computed on the same data within a
                   # single evaluation cycle benefit without stale-data risk


def _cache_key(func_name: str, *args_hashes: int, **kwargs_hashes) -> str:
    parts = [func_name]
    parts.extend(str(h) for h in args_hashes)
    parts.extend(f"{k}={v}" for k, v in sorted(kwargs_hashes.items()))
    return ":".join(parts)


def _cached(func: Callable) -> Callable:
    """Decorator: caches the last result of `func` per distinct input set
    within _CACHE_TTL seconds. When the same data is passed again (e.g.
    indicators called multiple times on the same close series within a
    single evaluation cycle), the cached result is returned."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        key = _cache_key(
            func.__name__,
            *[id(a) for a in args],
            **{k: id(v) for k, v in kwargs.items()},
        )
        now = time.monotonic()
        cached = _CACHE.get(key)
        if cached is not None and (now - cached[0]) < _CACHE_TTL:
            return cached[1]
        result = func(*args, **kwargs)
        _CACHE[key] = (now, result)
        # Evict stale entries periodically
        if len(_CACHE) > 128:
            stale = [k for k, (t, _) in _CACHE.items() if (now - t) >= _CACHE_TTL]
            for k in stale:
                del _CACHE[k]
        return result
    return wrapper


def _require_min_length(series: pd.Series, min_length: int, name: str) -> None:
    if series is None or len(series) < min_length:
        got = 0 if series is None else len(series)
        raise IndicatorError(f"{name} requires at least {min_length} data points, got {got}.")


# ---------------------------------------------------------------------------
# Moving averages
# ---------------------------------------------------------------------------

def sma(prices: pd.Series, period: int) -> pd.Series:
    """Simple Moving Average. First (period - 1) values are NaN by construction."""
    if period <= 0:
        raise IndicatorError(f"SMA period must be positive, got {period}.")
    _require_min_length(prices, period, "SMA")
    return prices.rolling(window=period, min_periods=period).mean()


def ema(prices: pd.Series, period: int) -> pd.Series:
    """
    Exponential Moving Average using Wilder/standard EMA smoothing
    (alpha = 2 / (period + 1)). adjust=False matches the recursive
    definition used by trading platforms (MT5, TradingView), not
    pandas' default "adjusted" weighting — using adjust=True here would
    produce values that don't match what a trader sees on their chart.
    """
    if period <= 0:
        raise IndicatorError(f"EMA period must be positive, got {period}.")
    _require_min_length(prices, period, "EMA")
    return prices.ewm(span=period, adjust=False, min_periods=period).mean()


# ---------------------------------------------------------------------------
# RSI
# ---------------------------------------------------------------------------

def rsi(prices: pd.Series, period: int = 14) -> pd.Series:
    """
    Relative Strength Index using Wilder's smoothing method (the
    standard RSI definition — note this differs from a plain EMA of
    gains/losses, which is a common but subtly incorrect shortcut that
    produces values that drift from platform RSI over time).
    """
    if period <= 0:
        raise IndicatorError(f"RSI period must be positive, got {period}.")
    _require_min_length(prices, period + 1, "RSI")

    delta = prices.diff()
    gain = delta.clip(lower=0.0)
    loss = -delta.clip(upper=0.0)

    # Wilder's smoothing = EMA with alpha = 1/period, not 2/(period+1)
    avg_gain = gain.ewm(alpha=1.0 / period, adjust=False, min_periods=period).mean()
    avg_loss = loss.ewm(alpha=1.0 / period, adjust=False, min_periods=period).mean()

    rs = avg_gain / avg_loss.replace(0.0, np.nan)
    result = 100.0 - (100.0 / (1.0 + rs))
    # Where avg_loss is exactly 0 (pure uptrend), RSI is defined as 100.
    result = result.where(avg_loss != 0.0, 100.0)
    return result


# ---------------------------------------------------------------------------
# MACD
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class MACDResult:
    macd_line: pd.Series
    signal_line: pd.Series
    histogram: pd.Series


def macd(prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> MACDResult:
    if fast <= 0 or slow <= 0 or signal <= 0:
        raise IndicatorError(f"MACD periods must be positive (fast={fast}, slow={slow}, signal={signal}).")
    if fast >= slow:
        raise IndicatorError(f"MACD fast period ({fast}) must be less than slow period ({slow}).")
    _require_min_length(prices, slow + signal, "MACD")

    ema_fast = ema(prices, fast)
    ema_slow = ema(prices, slow)
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False, min_periods=signal).mean()
    histogram = macd_line - signal_line

    return MACDResult(macd_line=macd_line, signal_line=signal_line, histogram=histogram)


# ---------------------------------------------------------------------------
# ATR (Average True Range)
# ---------------------------------------------------------------------------

def true_range(high: pd.Series, low: pd.Series, close: pd.Series) -> pd.Series:
    """
    True Range = max(high-low, |high-prev_close|, |low-prev_close|).
    First value uses high-low only since there is no previous close.
    """
    prev_close = close.shift(1)
    tr1 = high - low
    tr2 = (high - prev_close).abs()
    tr3 = (low - prev_close).abs()
    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    tr.iloc[0] = tr1.iloc[0]  # no previous close for the first bar
    return tr


def atr(high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> pd.Series:
    """Average True Range using Wilder's smoothing (alpha = 1/period)."""
    if period <= 0:
        raise IndicatorError(f"ATR period must be positive, got {period}.")
    _require_min_length(close, period + 1, "ATR")
    if not (len(high) == len(low) == len(close)):
        raise IndicatorError("ATR requires high, low, close to be the same length.")

    tr = true_range(high, low, close)
    return tr.ewm(alpha=1.0 / period, adjust=False, min_periods=period).mean()


# ---------------------------------------------------------------------------
# Bollinger Bands
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class BollingerBandsResult:
    middle: pd.Series   # SMA
    upper: pd.Series
    lower: pd.Series
    bandwidth: pd.Series  # (upper - lower) / middle — useful for squeeze detection


def bollinger_bands(prices: pd.Series, period: int = 20, std_dev: float = 2.0) -> BollingerBandsResult:
    if period <= 0:
        raise IndicatorError(f"Bollinger Bands period must be positive, got {period}.")
    if std_dev <= 0:
        raise IndicatorError(f"Bollinger Bands std_dev must be positive, got {std_dev}.")
    _require_min_length(prices, period, "Bollinger Bands")

    middle = sma(prices, period)
    rolling_std = prices.rolling(window=period, min_periods=period).std(ddof=0)
    upper = middle + (rolling_std * std_dev)
    lower = middle - (rolling_std * std_dev)
    bandwidth = (upper - lower) / middle.replace(0.0, np.nan)

    return BollingerBandsResult(middle=middle, upper=upper, lower=lower, bandwidth=bandwidth)


# ---------------------------------------------------------------------------
# ADX (Average Directional Index)
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class ADXResult:
    adx: pd.Series
    plus_di: pd.Series
    minus_di: pd.Series


def adx(high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> ADXResult:
    """
    Average Directional Index (Wilder's original method). Measures trend
    *strength* (not direction) on a 0-100 scale; +DI/-DI indicate
    direction. ADX > 25 is the conventional "trending market" threshold,
    used by trend_analyzer.py.
    """
    if period <= 0:
        raise IndicatorError(f"ADX period must be positive, got {period}.")
    _require_min_length(close, period * 2, "ADX")  # needs warm-up for the double-smoothing
    if not (len(high) == len(low) == len(close)):
        raise IndicatorError("ADX requires high, low, close to be the same length.")

    up_move = high.diff()
    down_move = -low.diff()

    plus_dm = pd.Series(np.where((up_move > down_move) & (up_move > 0), up_move, 0.0), index=high.index)
    minus_dm = pd.Series(np.where((down_move > up_move) & (down_move > 0), down_move, 0.0), index=low.index)

    tr = true_range(high, low, close)
    atr_smoothed = tr.ewm(alpha=1.0 / period, adjust=False, min_periods=period).mean()

    plus_di = 100.0 * (plus_dm.ewm(alpha=1.0 / period, adjust=False, min_periods=period).mean() / atr_smoothed)
    minus_di = 100.0 * (minus_dm.ewm(alpha=1.0 / period, adjust=False, min_periods=period).mean() / atr_smoothed)

    di_sum = (plus_di + minus_di).replace(0.0, np.nan)
    dx = 100.0 * (plus_di - minus_di).abs() / di_sum
    adx_line = dx.ewm(alpha=1.0 / period, adjust=False, min_periods=period).mean()

    return ADXResult(adx=adx_line, plus_di=plus_di, minus_di=minus_di)


# ---------------------------------------------------------------------------
# Stochastic Oscillator
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class StochasticResult:
    percent_k: pd.Series
    percent_d: pd.Series


def stochastic(
    high: pd.Series,
    low: pd.Series,
    close: pd.Series,
    k_period: int = 14,
    d_period: int = 3,
    smooth_k: int = 3,
) -> StochasticResult:
    """
    Stochastic Oscillator (slow stochastic, the conventional charting
    default): %K is smoothed by smooth_k before %D is calculated from it,
    matching MT5's default Stochastic Oscillator indicator behavior.
    """
    if k_period <= 0 or d_period <= 0 or smooth_k <= 0:
        raise IndicatorError("Stochastic periods must all be positive.")
    _require_min_length(close, k_period + smooth_k + d_period, "Stochastic")
    if not (len(high) == len(low) == len(close)):
        raise IndicatorError("Stochastic requires high, low, close to be the same length.")

    lowest_low = low.rolling(window=k_period, min_periods=k_period).min()
    highest_high = high.rolling(window=k_period, min_periods=k_period).max()

    range_ = (highest_high - lowest_low).replace(0.0, np.nan)
    raw_k = 100.0 * (close - lowest_low) / range_

    percent_k = raw_k.rolling(window=smooth_k, min_periods=smooth_k).mean()
    percent_d = percent_k.rolling(window=d_period, min_periods=d_period).mean()

    return StochasticResult(percent_k=percent_k, percent_d=percent_d)


# ---------------------------------------------------------------------------
# VWAP
# ---------------------------------------------------------------------------

def vwap(high: pd.Series, low: pd.Series, close: pd.Series, volume: pd.Series) -> pd.Series:
    """
    Volume Weighted Average Price, cumulative from the start of the
    provided series. VWAP is session-anchored by convention — callers
    must pass only the bars belonging to the session/day they want VWAP
    computed over (e.g. today's bars only), not an arbitrary lookback
    window, or the result will not mean what a trader expects "VWAP" to
    mean.

    NOTE: forex has no centralized exchange volume — MT5's tick_volume
    is a proxy (count of price changes), not true traded volume. VWAP
    computed from tick_volume is directionally useful but should not be
    treated as equivalent to true-volume VWAP from an exchange-traded
    instrument. This is documented here so multi_timeframe.py and
    signal_scorer.py don't overweight it.
    """
    if not (len(high) == len(low) == len(close) == len(volume)):
        raise IndicatorError("VWAP requires high, low, close, volume to be the same length.")
    _require_min_length(close, 1, "VWAP")

    typical_price = (high + low + close) / 3.0
    cumulative_pv = (typical_price * volume).cumsum()
    cumulative_volume = volume.cumsum().replace(0.0, np.nan)
    return cumulative_pv / cumulative_volume

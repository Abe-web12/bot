"""
candle_patterns.py
===================
Candlestick pattern detection. Every detector function takes a DataFrame
and an index `i`, and is contractually only allowed to read rows at
index <= i — this is enforced by convention (each function slices
df.iloc[:i+1] or explicit row lookups by position <= i) and verified by
tests that confirm a detector's result at index i is unchanged when rows
after i are deleted.

Patterns return a PatternMatch (or None) rather than a bare bool, because
"this is a hammer" is only useful to a caller alongside its bullish/
bearish bias and a rough strength score — signal_scorer.py needs that,
not just a yes/no.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

import pandas as pd


class PatternBias(str, Enum):
    BULLISH = "BULLISH"
    BEARISH = "BEARISH"
    NEUTRAL = "NEUTRAL"  # e.g. doji — signals indecision, not direction


@dataclass(frozen=True)
class PatternMatch:
    name: str
    bias: PatternBias
    strength: float  # 0.0-1.0, relative confidence in the pattern's formation quality
    bar_index: int


class CandlePatternError(Exception):
    pass


def _validate_index(df: pd.DataFrame, i: int, bars_needed: int) -> None:
    if i < bars_needed - 1:
        raise CandlePatternError(
            f"Index {i} requires at least {bars_needed} prior bar(s) (indices "
            f"{i - bars_needed + 1}..{i}), but data starts at index 0."
        )
    if i >= len(df):
        raise CandlePatternError(f"Index {i} is out of bounds for DataFrame of length {len(df)}.")


def _body(row: pd.Series) -> float:
    return abs(row["close"] - row["open"])


def _range(row: pd.Series) -> float:
    return row["high"] - row["low"]


def _upper_wick(row: pd.Series) -> float:
    return row["high"] - max(row["open"], row["close"])


def _lower_wick(row: pd.Series) -> float:
    return min(row["open"], row["close"]) - row["low"]


def _is_bullish(row: pd.Series) -> bool:
    return row["close"] > row["open"]


def _is_bearish(row: pd.Series) -> bool:
    return row["close"] < row["open"]


# ---------------------------------------------------------------------------
# Single-candle patterns
# ---------------------------------------------------------------------------

def detect_doji(df: pd.DataFrame, i: int, body_to_range_max: float = 0.10) -> PatternMatch | None:
    """
    Doji: body is a very small fraction of the bar's total range,
    indicating indecision. body_to_range_max is the maximum body/range
    ratio still considered "doji" (default 10%).
    """
    _validate_index(df, i, 1)
    row = df.iloc[i]
    bar_range = _range(row)
    if bar_range <= 0:
        return None

    body_ratio = _body(row) / bar_range
    if body_ratio <= body_to_range_max:
        strength = 1.0 - (body_ratio / body_to_range_max)
        return PatternMatch(name="DOJI", bias=PatternBias.NEUTRAL, strength=round(strength, 3), bar_index=i)
    return None


def detect_hammer(df: pd.DataFrame, i: int) -> PatternMatch | None:
    """
    Hammer: small body near the top of the range, long lower wick
    (>= 2x body), little/no upper wick. Bullish reversal signal —
    interpretation as "reversal" depends on prior trend context, which
    this function does not assess (see trend_analyzer.py for that).
    """
    _validate_index(df, i, 1)
    row = df.iloc[i]
    bar_range = _range(row)
    if bar_range <= 0:
        return None

    body = _body(row)
    lower_wick = _lower_wick(row)
    upper_wick = _upper_wick(row)

    if body <= 0:
        return None

    is_small_body = body <= bar_range * 0.35
    has_long_lower_wick = lower_wick >= body * 2.0
    has_small_upper_wick = upper_wick <= body * 0.5

    if is_small_body and has_long_lower_wick and has_small_upper_wick:
        strength = min(1.0, lower_wick / (body * 3.0))
        return PatternMatch(name="HAMMER", bias=PatternBias.BULLISH, strength=round(strength, 3), bar_index=i)
    return None


def detect_shooting_star(df: pd.DataFrame, i: int) -> PatternMatch | None:
    """
    Shooting Star: small body near the bottom of the range, long upper
    wick (>= 2x body), little/no lower wick. Bearish reversal signal.
    Structurally the mirror image of detect_hammer.
    """
    _validate_index(df, i, 1)
    row = df.iloc[i]
    bar_range = _range(row)
    if bar_range <= 0:
        return None

    body = _body(row)
    lower_wick = _lower_wick(row)
    upper_wick = _upper_wick(row)

    if body <= 0:
        return None

    is_small_body = body <= bar_range * 0.35
    has_long_upper_wick = upper_wick >= body * 2.0
    has_small_lower_wick = lower_wick <= body * 0.5

    if is_small_body and has_long_upper_wick and has_small_lower_wick:
        strength = min(1.0, upper_wick / (body * 3.0))
        return PatternMatch(name="SHOOTING_STAR", bias=PatternBias.BEARISH, strength=round(strength, 3), bar_index=i)
    return None


def detect_pin_bar(df: pd.DataFrame, i: int) -> PatternMatch | None:
    """
    Pin Bar: a generalization of hammer/shooting star — a single long
    wick (either direction) at least 2/3 of the total bar range, with a
    small body at the opposite end. Bias follows the direction the long
    wick rejected (long lower wick = bullish rejection of lower prices;
    long upper wick = bearish rejection of higher prices).
    """
    _validate_index(df, i, 1)
    row = df.iloc[i]
    bar_range = _range(row)
    if bar_range <= 0:
        return None

    lower_wick = _lower_wick(row)
    upper_wick = _upper_wick(row)
    body = _body(row)

    if lower_wick >= bar_range * 0.66 and body <= bar_range * 0.25:
        strength = min(1.0, lower_wick / bar_range)
        return PatternMatch(name="PIN_BAR", bias=PatternBias.BULLISH, strength=round(strength, 3), bar_index=i)

    if upper_wick >= bar_range * 0.66 and body <= bar_range * 0.25:
        strength = min(1.0, upper_wick / bar_range)
        return PatternMatch(name="PIN_BAR", bias=PatternBias.BEARISH, strength=round(strength, 3), bar_index=i)

    return None


# ---------------------------------------------------------------------------
# Two-candle patterns
# ---------------------------------------------------------------------------

def detect_engulfing(df: pd.DataFrame, i: int) -> PatternMatch | None:
    """
    Engulfing: current candle's body completely engulfs the prior
    candle's body, with opposite direction. Bullish engulfing = bearish
    candle followed by a larger bullish candle that engulfs it (and
    vice versa for bearish engulfing).
    """
    _validate_index(df, i, 2)
    prev = df.iloc[i - 1]
    curr = df.iloc[i]

    prev_body_top = max(prev["open"], prev["close"])
    prev_body_bottom = min(prev["open"], prev["close"])
    curr_body_top = max(curr["open"], curr["close"])
    curr_body_bottom = min(curr["open"], curr["close"])

    prev_body = _body(prev)
    curr_body = _body(curr)
    if prev_body <= 0 or curr_body <= 0:
        return None

    engulfs = curr_body_top >= prev_body_top and curr_body_bottom <= prev_body_bottom

    if _is_bearish(prev) and _is_bullish(curr) and engulfs:
        strength = min(1.0, curr_body / (prev_body * 1.5))
        return PatternMatch(name="ENGULFING", bias=PatternBias.BULLISH, strength=round(strength, 3), bar_index=i)

    if _is_bullish(prev) and _is_bearish(curr) and engulfs:
        strength = min(1.0, curr_body / (prev_body * 1.5))
        return PatternMatch(name="ENGULFING", bias=PatternBias.BEARISH, strength=round(strength, 3), bar_index=i)

    return None


# ---------------------------------------------------------------------------
# Three-candle patterns
# ---------------------------------------------------------------------------

def detect_morning_star(df: pd.DataFrame, i: int) -> PatternMatch | None:
    """
    Morning Star (3-bar bullish reversal):
      bar i-2: long bearish candle
      bar i-1: small-bodied candle (indecision), gapping down or near
               the prior close
      bar i:   bullish candle closing well into bar i-2's body
    """
    _validate_index(df, i, 3)
    first = df.iloc[i - 2]
    middle = df.iloc[i - 1]
    last = df.iloc[i]

    first_body = _body(first)
    middle_range = _range(middle)
    last_body = _body(last)

    if first_body <= 0 or last_body <= 0:
        return None

    first_is_strong_bearish = _is_bearish(first) and first_body >= _range(first) * 0.6
    middle_is_small = middle_range <= 0 or _body(middle) <= first_body * 0.4
    last_is_strong_bullish = _is_bullish(last) and last_body >= _range(last) * 0.6
    last_closes_into_first_body = last["close"] >= (first["open"] + first["close"]) / 2.0

    if first_is_strong_bearish and middle_is_small and last_is_strong_bullish and last_closes_into_first_body:
        penetration = (last["close"] - first["close"]) / first_body if first_body > 0 else 0.0
        strength = max(0.0, min(1.0, penetration))
        return PatternMatch(name="MORNING_STAR", bias=PatternBias.BULLISH, strength=round(strength, 3), bar_index=i)
    return None


def detect_evening_star(df: pd.DataFrame, i: int) -> PatternMatch | None:
    """
    Evening Star (3-bar bearish reversal) — mirror image of Morning Star:
      bar i-2: long bullish candle
      bar i-1: small-bodied candle (indecision)
      bar i:   bearish candle closing well into bar i-2's body
    """
    _validate_index(df, i, 3)
    first = df.iloc[i - 2]
    middle = df.iloc[i - 1]
    last = df.iloc[i]

    first_body = _body(first)
    middle_range = _range(middle)
    last_body = _body(last)

    if first_body <= 0 or last_body <= 0:
        return None

    first_is_strong_bullish = _is_bullish(first) and first_body >= _range(first) * 0.6
    middle_is_small = middle_range <= 0 or _body(middle) <= first_body * 0.4
    last_is_strong_bearish = _is_bearish(last) and last_body >= _range(last) * 0.6
    last_closes_into_first_body = last["close"] <= (first["open"] + first["close"]) / 2.0

    if first_is_strong_bullish and middle_is_small and last_is_strong_bearish and last_closes_into_first_body:
        penetration = (first["close"] - last["close"]) / first_body if first_body > 0 else 0.0
        strength = max(0.0, min(1.0, penetration))
        return PatternMatch(name="EVENING_STAR", bias=PatternBias.BEARISH, strength=round(strength, 3), bar_index=i)
    return None


# ---------------------------------------------------------------------------
# Convenience: run all detectors at a given index
# ---------------------------------------------------------------------------

_ALL_DETECTORS = [
    detect_doji,
    detect_hammer,
    detect_shooting_star,
    detect_pin_bar,
    detect_engulfing,
    detect_morning_star,
    detect_evening_star,
]


def detect_all_patterns(df: pd.DataFrame, i: int) -> list[PatternMatch]:
    """
    Runs every detector at index i and returns all matches (a bar can
    legitimately match more than one pattern, e.g. both pin_bar and
    hammer). Detectors that raise CandlePatternError due to insufficient
    history (e.g. morning star needs 3 bars, called at index 1) are
    silently skipped rather than propagating — that's an expected,
    normal condition near the start of a series, not an error condition
    for the caller.
    """
    matches: list[PatternMatch] = []
    for detector in _ALL_DETECTORS:
        try:
            result = detector(df, i)
        except CandlePatternError:
            continue
        if result is not None:
            matches.append(result)
    return matches

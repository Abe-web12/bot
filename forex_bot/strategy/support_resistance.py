"""
support_resistance.py
======================
Derives support/resistance levels from clustered swing highs/lows
(static levels — price zones that have been respected multiple times)
and provides a "dynamic" level using a moving average, which several
price-action strategies treat as a trailing support/resistance line in
trending markets.

Built on trend_analyzer's swing detection rather than reimplementing
swing-finding here — one definition of "swing point" used consistently
across the strategy layer.
"""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from strategy.indicators import IndicatorError, sma
from strategy.trend_analyzer import SwingPoint, TrendAnalysisError, find_swing_highs, find_swing_lows


class SupportResistanceError(Exception):
    pass


@dataclass(frozen=True)
class Level:
    price: float
    touch_count: int        # how many swing points cluster at this level
    is_resistance: bool      # True = resistance (from swing highs), False = support (from swing lows)
    last_touch_index: int    # most recent bar index that touched this level


def _cluster_swings(swings: list[SwingPoint], cluster_tolerance_pct: float) -> list[tuple[float, list[SwingPoint]]]:
    """
    Groups swing points whose prices are within cluster_tolerance_pct of
    each other into the same level. Uses a simple greedy single-pass
    clustering on sorted prices — adequate for the swing counts typical
    of a few hundred bars of forex data, and deterministic (same input
    always produces the same clusters, required for testability).
    """
    if not swings:
        return []

    sorted_swings = sorted(swings, key=lambda s: s.price)
    clusters: list[list[SwingPoint]] = [[sorted_swings[0]]]

    for swing in sorted_swings[1:]:
        cluster_anchor_price = clusters[-1][0].price
        tolerance = cluster_anchor_price * (cluster_tolerance_pct / 100.0)
        if abs(swing.price - cluster_anchor_price) <= tolerance:
            clusters[-1].append(swing)
        else:
            clusters.append([swing])

    result = []
    for cluster in clusters:
        avg_price = sum(s.price for s in cluster) / len(cluster)
        result.append((avg_price, cluster))
    return result


def find_levels(
    high: pd.Series,
    low: pd.Series,
    swing_lookback: int = 3,
    cluster_tolerance_pct: float = 0.05,
    min_touch_count: int = 2,
) -> list[Level]:
    """
    Identifies support/resistance levels from clustered swing points.
    Only clusters with at least min_touch_count swing points are
    returned — a single untested swing high/low is not yet a "level"
    in the sense of price having respected it multiple times.

    cluster_tolerance_pct=0.05 means swing points within 0.05% of each
    other's price are considered the same level — appropriate for major
    forex pairs; widen it for less precise instruments.
    """
    try:
        swing_highs = find_swing_highs(high, swing_lookback)
        swing_lows = find_swing_lows(low, swing_lookback)
    except TrendAnalysisError as exc:
        raise SupportResistanceError(f"Cannot find levels: {exc}") from exc

    levels: list[Level] = []

    for avg_price, cluster in _cluster_swings(swing_highs, cluster_tolerance_pct):
        if len(cluster) >= min_touch_count:
            last_touch = max(s.bar_index for s in cluster)
            levels.append(Level(price=round(avg_price, 6), touch_count=len(cluster),
                                 is_resistance=True, last_touch_index=last_touch))

    for avg_price, cluster in _cluster_swings(swing_lows, cluster_tolerance_pct):
        if len(cluster) >= min_touch_count:
            last_touch = max(s.bar_index for s in cluster)
            levels.append(Level(price=round(avg_price, 6), touch_count=len(cluster),
                                 is_resistance=False, last_touch_index=last_touch))

    return sorted(levels, key=lambda lvl: lvl.price)


def dynamic_level(close: pd.Series, period: int = 50) -> pd.Series:
    """
    A moving-average-based dynamic support/resistance line. In an
    uptrend, price holding above this line is read as dynamic support;
    in a downtrend, price holding below it is read as dynamic
    resistance. The direction interpretation is the caller's
    responsibility (combine with trend_analyzer.assess_trend) — this
    function only returns the line itself.
    """
    try:
        return sma(close, period)
    except IndicatorError as exc:
        raise SupportResistanceError(f"Cannot compute dynamic level: {exc}") from exc


def nearest_level(levels: list[Level], current_price: float, resistance_only: bool = False,
                   support_only: bool = False) -> Level | None:
    """
    Returns the level closest to current_price, optionally filtered to
    only resistance or only support levels. Returns None if no levels
    match the filter or the list is empty.
    """
    if resistance_only and support_only:
        raise SupportResistanceError("Cannot filter for both resistance_only and support_only.")

    candidates = levels
    if resistance_only:
        candidates = [lvl for lvl in levels if lvl.is_resistance]
    elif support_only:
        candidates = [lvl for lvl in levels if not lvl.is_resistance]

    if not candidates:
        return None

    return min(candidates, key=lambda lvl: abs(lvl.price - current_price))


def distance_to_level_pips(level: Level, current_price: float, pip_size: float) -> float:
    """Absolute distance from current_price to a level, expressed in pips."""
    if pip_size <= 0:
        raise SupportResistanceError(f"pip_size must be positive, got {pip_size}.")
    return abs(level.price - current_price) / pip_size

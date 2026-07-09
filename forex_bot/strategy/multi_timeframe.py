"""
multi_timeframe.py
===================
Confirms whether a trading signal on the primary timeframe is aligned
with the trend on a higher timeframe. This implements the standard
multi-timeframe discipline: the higher timeframe sets the dominant
bias, the primary/entry timeframe times the entry — trading against the
higher-timeframe trend is a materially different (riskier) bet than
trading with it, and signal_scorer.py needs to know which situation it's
scoring.

Depends on market_snapshot (for fetching+validating each timeframe's
data) and trend_analyzer (for the actual trend assessment), so this
module's only real job is the *alignment comparison* across timeframes,
not re-implementing trend detection per timeframe.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

from strategy.market_snapshot import MarketSnapshotError, get_snapshot
from strategy.trend_analyzer import TrendAnalysisError, TrendAssessment, TrendDirection, assess_trend

logger = logging.getLogger("multi_timeframe")


class MultiTimeframeError(Exception):
    pass


@dataclass(frozen=True)
class TimeframeTrend:
    timeframe: str
    assessment: TrendAssessment


@dataclass(frozen=True)
class MultiTimeframeAlignment:
    symbol: str
    timeframes: list[TimeframeTrend]
    is_aligned: bool          # all timeframes agree on a non-RANGING direction
    dominant_direction: TrendDirection
    alignment_score: float    # 0.0-1.0, fraction of timeframes agreeing with the dominant direction


def assess_alignment(
    symbol: str,
    timeframes: list[str],
    bars_per_timeframe: int = 100,
    ema_fast_period: int = 21,
    ema_slow_period: int = 50,
    adx_period: int = 14,
    adx_trending_threshold: float = 25.0,
) -> MultiTimeframeAlignment:
    """
    Fetches data and assesses trend independently on each requested
    timeframe (e.g. ["H4", "H1", "M15"]), then determines whether they
    agree.

    dominant_direction is chosen by majority vote among non-RANGING
    assessments (ties broken toward the FIRST timeframe in the list,
    which by convention should be the highest/most important timeframe
    — callers should order timeframes from highest to lowest).

    is_aligned is True only if every timeframe's direction matches
    dominant_direction AND none of them are RANGING — a partial
    agreement is reported via alignment_score, not silently rounded up
    to "aligned".

    Raises MultiTimeframeError if data cannot be fetched/validated or
    trend cannot be assessed (e.g. insufficient history) for ANY
    requested timeframe — a multi-timeframe confirmation with a missing
    timeframe is not a partial answer, it's not an answer.
    """
    if len(timeframes) < 2:
        raise MultiTimeframeError(f"Multi-timeframe alignment requires at least 2 timeframes, got {timeframes}.")

    results: list[TimeframeTrend] = []

    for tf in timeframes:
        try:
            snapshot = get_snapshot(symbol, tf, bars_per_timeframe)
            assessment = assess_trend(
                close=snapshot.close,
                high=snapshot.high,
                low=snapshot.low,
                ema_fast_period=ema_fast_period,
                ema_slow_period=ema_slow_period,
                adx_period=adx_period,
                adx_trending_threshold=adx_trending_threshold,
            )
        except MarketSnapshotError as exc:
            raise MultiTimeframeError(f"Cannot assess {symbol}/{tf}: data unavailable — {exc}") from exc
        except TrendAnalysisError as exc:
            raise MultiTimeframeError(f"Cannot assess {symbol}/{tf}: trend analysis failed — {exc}") from exc

        results.append(TimeframeTrend(timeframe=tf, assessment=assessment))

    direction_counts: dict[TrendDirection, int] = {}
    for tf_trend in results:
        d = tf_trend.assessment.direction
        direction_counts[d] = direction_counts.get(d, 0) + 1

    non_ranging_counts = {d: c for d, c in direction_counts.items() if d != TrendDirection.RANGING}

    if not non_ranging_counts:
        dominant_direction = TrendDirection.RANGING
    else:
        max_count = max(non_ranging_counts.values())
        # Tie-break toward the first (highest-priority) timeframe's direction.
        tied_directions = [d for d, c in non_ranging_counts.items() if c == max_count]
        if len(tied_directions) == 1:
            dominant_direction = tied_directions[0]
        else:
            dominant_direction = results[0].assessment.direction

    agreeing = sum(1 for tf_trend in results if tf_trend.assessment.direction == dominant_direction)
    alignment_score = agreeing / len(results)

    is_aligned = (
        dominant_direction != TrendDirection.RANGING
        and all(tf_trend.assessment.direction == dominant_direction for tf_trend in results)
    )

    logger.info(
        "Multi-timeframe alignment for %s [%s]: dominant=%s, score=%.2f, aligned=%s",
        symbol, ",".join(timeframes), dominant_direction.value, alignment_score, is_aligned,
    )

    return MultiTimeframeAlignment(
        symbol=symbol,
        timeframes=results,
        is_aligned=is_aligned,
        dominant_direction=dominant_direction,
        alignment_score=round(alignment_score, 3),
    )

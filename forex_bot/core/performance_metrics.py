"""
performance_metrics.py
=========================
Pure calculation functions for statistics that need a return series
rather than a single aggregate query — kept separate from
TradeRepository (which owns SQL aggregates) because these operate on
already-fetched EquitySnapshot values, not on raw SQL.

Sharpe ratio here is computed from period-over-period equity returns
using whatever EquitySnapshot cadence exists (config.EQUITY_SNAPSHOT_INTERVAL,
typically hourly). This is an approximation of "Sharpe ratio" in the
strict sense (which classically uses daily or monthly returns against a
risk-free rate) — we treat risk-free rate as 0 for a forex demo account
context, and annualize using the actual snapshot cadence rather than
assuming daily bars. This assumption is stated explicitly in the
returned payload so it's never mistaken for a textbook-standard
daily-return Sharpe ratio.
"""

from __future__ import annotations

import math
from dataclasses import dataclass


@dataclass(frozen=True)
class SharpeResult:
    sharpe_ratio: float | None
    sample_count: int
    periods_per_year: float
    note: str


def calculate_sharpe_ratio(equity_values: list[float], snapshot_interval_seconds: int) -> SharpeResult:
    """
    equity_values must be in chronological order (oldest first).
    Returns sharpe_ratio=None if fewer than 2 return observations exist
    (need at least 2 equity points to compute 1 return, and at least 2
    returns to compute a meaningful standard deviation) or if the
    standard deviation of returns is exactly zero (undefined ratio, not
    infinite).
    """
    if snapshot_interval_seconds <= 0:
        raise ValueError(f"snapshot_interval_seconds must be positive, got {snapshot_interval_seconds}")

    seconds_per_year = 365.25 * 24 * 3600
    periods_per_year = seconds_per_year / snapshot_interval_seconds

    if len(equity_values) < 3:
        return SharpeResult(
            sharpe_ratio=None, sample_count=len(equity_values), periods_per_year=periods_per_year,
            note="Need at least 3 equity snapshots to compute a meaningful Sharpe ratio.",
        )

    returns: list[float] = []
    for i in range(1, len(equity_values)):
        prev = equity_values[i - 1]
        curr = equity_values[i]
        if prev == 0:
            continue
        returns.append((curr - prev) / prev)

    if len(returns) < 2:
        return SharpeResult(
            sharpe_ratio=None, sample_count=len(equity_values), periods_per_year=periods_per_year,
            note="Insufficient non-zero-baseline returns to compute Sharpe ratio.",
        )

    mean_return = sum(returns) / len(returns)
    variance = sum((r - mean_return) ** 2 for r in returns) / (len(returns) - 1)
    std_dev = math.sqrt(variance)

    if std_dev == 0:
        return SharpeResult(
            sharpe_ratio=None, sample_count=len(equity_values), periods_per_year=periods_per_year,
            note="Standard deviation of returns is zero — Sharpe ratio is undefined, not infinite.",
        )

    sharpe = (mean_return / std_dev) * math.sqrt(periods_per_year)

    return SharpeResult(
        sharpe_ratio=round(sharpe, 3),
        sample_count=len(equity_values),
        periods_per_year=round(periods_per_year, 1),
        note=(
            f"Approximated using {snapshot_interval_seconds}s equity snapshot intervals "
            f"(not classical daily returns), risk-free rate assumed to be 0."
        ),
    )

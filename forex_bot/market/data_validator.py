"""
data_validator.py
==================
Validates OHLC DataFrames before they reach strategy/indicator code.

Why this is a separate module from data_feed.py: data_feed's job is "get
data from MT5 correctly." This module's job is "decide whether that data
is trustworthy enough to trade on." Keeping them separate means we can
unit test validation rules (gap thresholds, spike detection, staleness
windows) with synthetic DataFrames, without needing a live MT5 connection.

Validation rules implemented:
- structural: required columns present, no NaN/None values, no negative
  or zero OHLC prices
- staleness: most recent bar's timestamp isn't older than expected for
  the timeframe (accounts for weekend market closure)
- internal consistency: high >= max(open, close, low), low <= min(open,
  close, high) for every bar — a violated OHLC relationship means
  corrupted data, not a real candle
- spike detection: a bar's range is not absurdly larger than the recent
  average true range, which usually indicates a bad tick/print rather
  than real volatility
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone

import pandas as pd

from market.timeframes import seconds_per_bar

logger = logging.getLogger("data_validator")


@dataclass
class ValidationResult:
    is_valid: bool
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def raise_if_invalid(self, context: str = "") -> None:
        if not self.is_valid:
            raise DataValidationError(f"{context}: {'; '.join(self.errors)}")


class DataValidationError(Exception):
    pass


REQUIRED_COLUMNS = ["time", "open", "high", "low", "close", "tick_volume"]

# How many bar-durations old the latest bar is allowed to be before we
# call it stale. >1 because brokers can be a bit behind real-time, and
# during low-liquidity periods (e.g. Sunday open) bars can be sparse.
_STALENESS_MULTIPLIER = 3

# A bar's (high - low) range more than this many times the recent average
# range is flagged as a likely bad print rather than real volatility.
_SPIKE_RANGE_MULTIPLIER = 8.0


def validate_ohlc(df: pd.DataFrame, timeframe: str, symbol: str = "") -> ValidationResult:
    """
    Runs all structural + consistency checks. Does NOT check staleness —
    use validate_freshness() separately, since "fresh" depends on whether
    the market is currently open (weekends are expected gaps, not errors).
    """
    errors: list[str] = []
    warnings: list[str] = []

    if df is None or df.empty:
        return ValidationResult(is_valid=False, errors=["DataFrame is None or empty."])

    missing = set(REQUIRED_COLUMNS) - set(df.columns)
    if missing:
        return ValidationResult(is_valid=False, errors=[f"Missing required columns: {missing}"])

    price_cols = ["open", "high", "low", "close"]

    if df[price_cols].isnull().any().any():
        errors.append("OHLC data contains NaN/null price values.")

    if (df[price_cols] <= 0).any().any():
        errors.append("OHLC data contains zero or negative prices.")

    # OHLC internal consistency: high must be >= every other price in the
    # bar, low must be <= every other price. A violation means the data
    # is corrupted, not just unusual.
    bad_high = df["high"] < df[["open", "close", "low"]].max(axis=1)
    bad_low = df["low"] > df[["open", "close", "high"]].min(axis=1)
    if bad_high.any():
        errors.append(f"{int(bad_high.sum())} bar(s) have high < max(open, close, low).")
    if bad_low.any():
        errors.append(f"{int(bad_low.sum())} bar(s) have low > min(open, close, high).")

    # Spike detection — compare each bar's range to the trailing average
    # of the bars BEFORE it (shifted by 1, so a bar is never compared
    # against a window that includes itself — that would dilute its own
    # spike and make detection less sensitive the more extreme the spike).
    # Only meaningful with enough bars to establish a baseline.
    if len(df) >= 20 and not errors:
        ranges = df["high"] - df["low"]
        avg_range = ranges.shift(1).rolling(window=14, min_periods=5).mean()
        spike_mask = ranges > (avg_range * _SPIKE_RANGE_MULTIPLIER)
        spike_count = int(spike_mask.fillna(False).sum())
        if spike_count > 0:
            warnings.append(
                f"{spike_count} bar(s) have a range more than {_SPIKE_RANGE_MULTIPLIER}x the "
                f"trailing average — possible bad print. Inspect before trusting signals near these bars."
            )

    # Monotonic time — bars must be in chronological order with no
    # duplicate timestamps (duplicates can indicate a broken refetch).
    if not df["time"].is_monotonic_increasing:
        errors.append("Bar timestamps are not strictly increasing — data may be out of order.")
    elif df["time"].duplicated().any():
        errors.append("Duplicate bar timestamps found.")

    is_valid = len(errors) == 0
    if warnings:
        logger.warning("Data quality warnings for %s/%s: %s", symbol, timeframe, "; ".join(warnings))
    if not is_valid:
        logger.error("Data validation FAILED for %s/%s: %s", symbol, timeframe, "; ".join(errors))

    return ValidationResult(is_valid=is_valid, errors=errors, warnings=warnings)


def validate_freshness(df: pd.DataFrame, timeframe: str, now: datetime | None = None) -> ValidationResult:
    """
    Checks the most recent bar isn't older than expected. Separate from
    validate_ohlc() because "is this fresh" requires knowing the current
    time and depends on the timeframe's expected cadence, not just the
    data's internal structure.

    NOTE: This intentionally does NOT special-case weekend closures by
    skipping the check — it returns a warning (not an error) for any gap
    detected, and callers (e.g. market_hours module, in a later increment)
    are responsible for deciding whether trading should even be attempted
    right now. This module's job is to report facts about the data, not
    to make trading-session decisions.
    """
    if df is None or df.empty:
        return ValidationResult(is_valid=False, errors=["Cannot check freshness of empty data."])

    now = now or datetime.now(timezone.utc)
    latest_bar_time = df["time"].iloc[-1]
    if latest_bar_time.tzinfo is None:
        latest_bar_time = latest_bar_time.tz_localize("UTC")

    age_seconds = (now - latest_bar_time).total_seconds()
    expected_seconds = seconds_per_bar(timeframe)
    max_allowed_age = expected_seconds * _STALENESS_MULTIPLIER

    if age_seconds > max_allowed_age:
        warning = (
            f"Latest bar for timeframe {timeframe} is {age_seconds / 60:.1f} minutes old "
            f"(threshold: {max_allowed_age / 60:.1f} minutes). This may be a normal market closure "
            f"(weekend/holiday) or a stale data feed — verify before trading."
        )
        return ValidationResult(is_valid=False, errors=[warning])

    return ValidationResult(is_valid=True)

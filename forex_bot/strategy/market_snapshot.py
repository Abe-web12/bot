"""
market_snapshot.py
===================
The single boundary where strategy-layer code touches the market layer.
Fetches OHLC via market.data_feed, validates it via
market.data_validator, and returns an immutable, already-validated
DataFrame. Every other strategy module (multi_timeframe, signal_generator,
support_resistance via its callers, etc.) should obtain data through
this function rather than calling data_feed.get_ohlc() directly — that
makes it structurally impossible to accidentally feed unvalidated data
into an indicator calculation.

This module is allowed to depend on the market layer (data_feed,
data_validator); indicators.py, candle_patterns.py, and trend_analyzer.py
deliberately are not, per the architectural boundary established in
indicators.py's docstring.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

import pandas as pd

from market.data_feed import DataFeedError, get_ohlc
from market.data_validator import validate_freshness, validate_ohlc

logger = logging.getLogger("market_snapshot")


class MarketSnapshotError(Exception):
    """Raised when validated market data cannot be obtained for a symbol/timeframe."""


@dataclass(frozen=True)
class MarketSnapshot:
    symbol: str
    timeframe: str
    ohlc: pd.DataFrame  # validated, oldest-first

    @property
    def close(self) -> pd.Series:
        return self.ohlc["close"]

    @property
    def high(self) -> pd.Series:
        return self.ohlc["high"]

    @property
    def low(self) -> pd.Series:
        return self.ohlc["low"]

    @property
    def open(self) -> pd.Series:
        return self.ohlc["open"]

    @property
    def volume(self) -> pd.Series:
        return self.ohlc["tick_volume"]

    @property
    def latest_close(self) -> float:
        return float(self.ohlc["close"].iloc[-1])

    @property
    def bar_count(self) -> int:
        return len(self.ohlc)


def get_snapshot(symbol: str, timeframe: str, count: int, require_fresh: bool = True) -> MarketSnapshot:
    """
    Fetches and validates OHLC data for symbol/timeframe. Raises
    MarketSnapshotError (never returns partially-valid data) if either
    structural validation or freshness validation fails.

    require_fresh=False is intended only for backtesting/research code
    that intentionally requests historical (non-current) data — live
    trading code paths must use the default True.
    """
    try:
        df = get_ohlc(symbol, timeframe, count)
    except DataFeedError as exc:
        raise MarketSnapshotError(f"Failed to fetch data for {symbol}/{timeframe}: {exc}") from exc

    structural_result = validate_ohlc(df, timeframe, symbol)
    if not structural_result.is_valid:
        raise MarketSnapshotError(
            f"Data validation failed for {symbol}/{timeframe}: {'; '.join(structural_result.errors)}"
        )

    if require_fresh:
        freshness_result = validate_freshness(df, timeframe)
        if not freshness_result.is_valid:
            raise MarketSnapshotError(
                f"Data freshness check failed for {symbol}/{timeframe}: {'; '.join(freshness_result.errors)}"
            )

    if structural_result.warnings:
        logger.warning(
            "Snapshot for %s/%s has data quality warnings: %s",
            symbol, timeframe, "; ".join(structural_result.warnings),
        )

    return MarketSnapshot(symbol=symbol, timeframe=timeframe, ohlc=df)

"""
data_feed.py
============
Retrieves real OHLC bar history and live tick data from MT5. This is the
only module that calls mt5.copy_rates_*() / mt5.copy_ticks_*() — every
other module gets market data through here, never directly from the
MT5 package. That gives us exactly one place to fix if the broker's
data behaves unexpectedly, and exactly one place data_validator needs
to be wired into.

Returns pandas DataFrames with explicit, named columns rather than raw
MT5 numpy structured arrays — strategy code should never need to know
that MT5's tick_volume field exists, or index into a record array by
position.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

import MetaTrader5 as mt5
import pandas as pd

from bot.mt5_connector import MT5ConnectionError, connector
from market.timeframes import to_mt5

logger = logging.getLogger("data_feed")


class DataFeedError(Exception):
    """Raised when MT5 market data cannot be retrieved or is structurally invalid."""


# OHLC column names, explicit and stable — downstream code depends on these
# exact names, not on whatever MT5's numpy dtype happens to call them.
OHLC_COLUMNS = ["time", "open", "high", "low", "close", "tick_volume", "spread", "real_volume"]


def get_ohlc(symbol: str, timeframe: str, count: int) -> pd.DataFrame:
    """
    Fetch the most recent `count` completed bars for symbol/timeframe.

    Returns a DataFrame indexed by integer position (oldest first, most
    recent last — matches MT5's natural order), with a 'time' column as
    timezone-aware UTC datetimes.

    Raises DataFeedError if MT5 returns nothing, fewer bars than
    requested were available this early in the session, or the result
    fails basic structural sanity checks.
    """
    if count <= 0:
        raise DataFeedError(f"count must be positive, got {count}")

    if not connector.is_connected():
        raise DataFeedError(f"Cannot fetch OHLC for {symbol}: MT5 is not connected.")

    mt5_timeframe = to_mt5(timeframe)

    # copy_rates_from_pos(symbol, timeframe, start_pos, count)
    # start_pos=0 means "most recent completed bar going backward" —
    # this excludes the still-forming current bar, which is what we want
    # for indicator calculations (an incomplete bar would make every
    # indicator value unstable until the bar closes).
    rates = mt5.copy_rates_from_pos(symbol, mt5_timeframe, 1, count)

    if rates is None:
        error = mt5.last_error()
        raise DataFeedError(f"copy_rates_from_pos({symbol}, {timeframe}) returned None. MT5 error: {error}")

    if len(rates) == 0:
        raise DataFeedError(f"copy_rates_from_pos({symbol}, {timeframe}) returned 0 bars.")

    df = pd.DataFrame(rates)
    df["time"] = pd.to_datetime(df["time"], unit="s", utc=True)

    missing_cols = set(OHLC_COLUMNS) - set(df.columns)
    if missing_cols:
        raise DataFeedError(f"OHLC data for {symbol} is missing expected columns: {missing_cols}")

    if len(df) < count:
        logger.warning(
            "Requested %d bars for %s/%s but only %d available (likely near session/history start).",
            count, symbol, timeframe, len(df),
        )

    return df[OHLC_COLUMNS].reset_index(drop=True)


def get_latest_tick(symbol: str) -> dict:
    """
    Fetch the current bid/ask tick for symbol.

    Returns a dict: {time, bid, ask, last, volume}. Raises DataFeedError
    if the symbol is unknown or MT5 has no tick data yet (e.g. market
    just opened and broker hasn't streamed a tick).
    """
    if not connector.is_connected():
        raise DataFeedError(f"Cannot fetch tick for {symbol}: MT5 is not connected.")

    tick = mt5.symbol_info_tick(symbol)
    if tick is None:
        error = mt5.last_error()
        raise DataFeedError(f"symbol_info_tick({symbol}) returned None. MT5 error: {error}")

    if tick.bid <= 0 or tick.ask <= 0:
        raise DataFeedError(
            f"Tick for {symbol} has non-positive price (bid={tick.bid}, ask={tick.ask}). "
            f"Symbol may be closed for trading or broker feed is broken."
        )

    return {
        "time": datetime.fromtimestamp(tick.time, tz=timezone.utc),
        "bid": tick.bid,
        "ask": tick.ask,
        "last": tick.last,
        "volume": tick.volume,
    }


def get_current_spread_pips(symbol: str) -> float:
    """
    Live spread in pips, computed from the current bid/ask tick (not the
    symbol_info.spread field, which can lag slightly behind real ticks
    on some brokers). Delegates pip-size logic to mt5_connector so there
    is exactly one definition of "what is a pip for this symbol".
    """
    tick = get_latest_tick(symbol)
    symbol_info = connector.get_symbol_info(symbol)

    pip_divisor = 10 if symbol_info.digits in (3, 5) else 1
    pip_size = symbol_info.point * pip_divisor

    spread_price = tick["ask"] - tick["bid"]
    if pip_size <= 0:
        raise DataFeedError(f"Invalid pip_size for {symbol}: point={symbol_info.point}, digits={symbol_info.digits}")

    return round(spread_price / pip_size, 1)

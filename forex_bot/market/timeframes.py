"""
timeframes.py
=============
Single source of truth mapping our string timeframe identifiers
("M1", "M15", "H1", "H4", "D1", ...) to MT5's TIMEFRAME_* constants.

Why this exists as its own module: config.py, strategy code, and the
dashboard all refer to timeframes as strings (easier to log, store in
SQLite, and put in a JSON API response than raw MT5 ints). If each
module did its own string->MT5 mapping, a typo in one place would
silently resolve to the wrong timeframe or crash with a confusing
KeyError deep in a strategy calculation. Centralizing it means a typo
fails immediately and loudly, at the point of lookup, every time.
"""

from __future__ import annotations

from bot.mt5_client import (
    TIMEFRAME_D1,
    TIMEFRAME_H1,
    TIMEFRAME_H4,
    TIMEFRAME_M1,
    TIMEFRAME_M15,
    TIMEFRAME_M30,
    TIMEFRAME_M5,
    TIMEFRAME_W1,
)

_TIMEFRAME_MAP: dict[str, int] = {
    "M1": TIMEFRAME_M1,
    "M5": TIMEFRAME_M5,
    "M15": TIMEFRAME_M15,
    "M30": TIMEFRAME_M30,
    "H1": TIMEFRAME_H1,
    "H4": TIMEFRAME_H4,
    "D1": TIMEFRAME_D1,
    "W1": TIMEFRAME_W1,
}

# Approximate seconds per bar — used for staleness checks (data_validator)
# and for scheduler timing decisions later. "Approximate" because months
# vary, but we don't use MN1 here.
_TIMEFRAME_SECONDS: dict[str, int] = {
    "M1": 60,
    "M5": 300,
    "M15": 900,
    "M30": 1800,
    "H1": 3600,
    "H4": 14400,
    "D1": 86400,
    "W1": 604800,
}


class UnknownTimeframeError(ValueError):
    pass


def to_mt5(timeframe: str) -> int:
    """Convert a string timeframe ('H1') to its MT5 constant. Raises loudly on typos."""
    try:
        return _TIMEFRAME_MAP[timeframe.upper()]
    except KeyError as exc:
        valid = ", ".join(sorted(_TIMEFRAME_MAP.keys()))
        raise UnknownTimeframeError(
            f"Unknown timeframe '{timeframe}'. Valid values: {valid}"
        ) from exc


def seconds_per_bar(timeframe: str) -> int:
    """Approximate bar duration in seconds — used for staleness checks."""
    try:
        return _TIMEFRAME_SECONDS[timeframe.upper()]
    except KeyError as exc:
        valid = ", ".join(sorted(_TIMEFRAME_SECONDS.keys()))
        raise UnknownTimeframeError(
            f"Unknown timeframe '{timeframe}'. Valid values: {valid}"
        ) from exc


def all_timeframes() -> list[str]:
    return list(_TIMEFRAME_MAP.keys())

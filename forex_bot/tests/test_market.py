"""
test_market.py
===============
Tests for market/timeframes.py and market/data_validator.py — both are
pure-logic modules that don't require a live MT5 connection, so they run
anywhere. data_feed.py's actual MT5 calls are exercised manually against
the live demo terminal per README.md, since mocking MT5's C-extension
behavior would test our mock, not real broker behavior.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pandas as pd
import pytest

from market.timeframes import to_mt5, seconds_per_bar, all_timeframes, UnknownTimeframeError
from market.data_validator import validate_ohlc, validate_freshness, DataValidationError


# ---------------------------------------------------------------------------
# Timeframes
# ---------------------------------------------------------------------------

def test_to_mt5_known_timeframes_resolve():
    for tf in ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1"]:
        assert isinstance(to_mt5(tf), int)


def test_to_mt5_is_case_insensitive():
    assert to_mt5("h1") == to_mt5("H1")


def test_to_mt5_unknown_timeframe_raises():
    with pytest.raises(UnknownTimeframeError):
        to_mt5("H2")  # not a real MT5 timeframe — common typo for H4


def test_seconds_per_bar_values():
    assert seconds_per_bar("M1") == 60
    assert seconds_per_bar("H1") == 3600
    assert seconds_per_bar("H4") == 14400
    assert seconds_per_bar("D1") == 86400


def test_all_timeframes_returns_list():
    tfs = all_timeframes()
    assert "H1" in tfs
    assert "M15" in tfs


# ---------------------------------------------------------------------------
# Data validator — structural checks
# ---------------------------------------------------------------------------

def _make_valid_ohlc(n: int = 30) -> pd.DataFrame:
    base_time = datetime(2026, 6, 1, tzinfo=timezone.utc)
    rows = []
    price = 1.1000
    for i in range(n):
        o = price
        h = price + 0.0010
        l = price - 0.0010
        c = price + 0.0002
        rows.append({
            "time": base_time + timedelta(hours=i),
            "open": o, "high": h, "low": l, "close": c,
            "tick_volume": 100, "spread": 2, "real_volume": 0,
        })
        price = c
    return pd.DataFrame(rows)


def test_validate_ohlc_accepts_clean_data():
    df = _make_valid_ohlc()
    result = validate_ohlc(df, "H1", "EURUSD")
    assert result.is_valid
    assert result.errors == []


def test_validate_ohlc_rejects_empty_dataframe():
    result = validate_ohlc(pd.DataFrame(), "H1", "EURUSD")
    assert not result.is_valid


def test_validate_ohlc_rejects_missing_columns():
    df = _make_valid_ohlc().drop(columns=["close"])
    result = validate_ohlc(df, "H1", "EURUSD")
    assert not result.is_valid
    assert any("Missing required columns" in e for e in result.errors)


def test_validate_ohlc_rejects_zero_price():
    df = _make_valid_ohlc()
    df.loc[5, "close"] = 0.0
    result = validate_ohlc(df, "H1", "EURUSD")
    assert not result.is_valid
    assert any("zero or negative" in e for e in result.errors)


def test_validate_ohlc_rejects_negative_price():
    df = _make_valid_ohlc()
    df.loc[3, "low"] = -1.0
    result = validate_ohlc(df, "H1", "EURUSD")
    assert not result.is_valid


def test_validate_ohlc_rejects_nan_price():
    df = _make_valid_ohlc()
    df.loc[10, "open"] = float("nan")
    result = validate_ohlc(df, "H1", "EURUSD")
    assert not result.is_valid
    assert any("NaN" in e for e in result.errors)


def test_validate_ohlc_rejects_inconsistent_high():
    """high must be >= max(open, close, low) for every bar."""
    df = _make_valid_ohlc()
    df.loc[7, "high"] = df.loc[7, "low"]  # high collapsed below open/close
    result = validate_ohlc(df, "H1", "EURUSD")
    assert not result.is_valid
    assert any("high < max" in e for e in result.errors)


def test_validate_ohlc_rejects_inconsistent_low():
    df = _make_valid_ohlc()
    df.loc[7, "low"] = df.loc[7, "high"] + 0.01  # low above the high
    result = validate_ohlc(df, "H1", "EURUSD")
    assert not result.is_valid
    assert any("low > min" in e for e in result.errors)


def test_validate_ohlc_rejects_out_of_order_timestamps():
    df = _make_valid_ohlc()
    # Swap two timestamps to break monotonic order
    df.loc[0, "time"], df.loc[1, "time"] = df.loc[1, "time"], df.loc[0, "time"]
    result = validate_ohlc(df, "H1", "EURUSD")
    assert not result.is_valid


def test_validate_ohlc_rejects_duplicate_timestamps():
    df = _make_valid_ohlc()
    df.loc[1, "time"] = df.loc[0, "time"]
    result = validate_ohlc(df, "H1", "EURUSD")
    assert not result.is_valid


def test_validate_ohlc_flags_spike_as_warning_not_error():
    """A single absurd-range bar should warn (so it's logged/visible)
    but not necessarily invalidate the entire dataset — the rest of the
    bars are still structurally fine."""
    df = _make_valid_ohlc(n=30)
    df.loc[25, "high"] = df.loc[25, "open"] + 5.0  # absurd 5.0 price spike
    result = validate_ohlc(df, "H1", "EURUSD")
    assert result.is_valid  # structurally still consistent (high >= others)
    assert len(result.warnings) > 0


def test_raise_if_invalid_raises_with_context():
    result = validate_ohlc(pd.DataFrame(), "H1", "EURUSD")
    with pytest.raises(DataValidationError):
        result.raise_if_invalid(context="test context")


# ---------------------------------------------------------------------------
# Data validator — freshness checks
# ---------------------------------------------------------------------------

def test_validate_freshness_accepts_recent_bar():
    df = _make_valid_ohlc(n=5)
    now = df["time"].iloc[-1] + timedelta(minutes=30)  # within H1 staleness window
    result = validate_freshness(df, "H1", now=now)
    assert result.is_valid


def test_validate_freshness_rejects_stale_bar():
    df = _make_valid_ohlc(n=5)
    now = df["time"].iloc[-1] + timedelta(hours=10)  # way past H1 staleness threshold
    result = validate_freshness(df, "H1", now=now)
    assert not result.is_valid


def test_validate_freshness_rejects_empty_dataframe():
    result = validate_freshness(pd.DataFrame(), "H1")
    assert not result.is_valid

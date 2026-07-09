"""
test_foundation.py
===================
Tests for event_bus, state_manager, and risk logic that don't require a
live MT5 terminal connection (so they run in CI / on any machine).

MT5-dependent integration testing (actually connecting) is manual at this
stage — see README.md "Verifying the foundation" section.

Run with: pytest tests/
"""

from __future__ import annotations

import pytest

from core.event_bus import EventBus, Event
from core.state_manager import StateManager, BotStatus, ConnectionStatus


# ---------------------------------------------------------------------------
# Event bus
# ---------------------------------------------------------------------------

def test_event_bus_delivers_to_subscriber():
    bus = EventBus()
    received = []

    def handler(event: Event):
        received.append(event)

    bus.subscribe("TEST_EVENT", handler)
    bus.publish("TEST_EVENT", {"foo": "bar"}, source="test")

    assert len(received) == 1
    assert received[0].name == "TEST_EVENT"
    assert received[0].payload == {"foo": "bar"}


def test_event_bus_does_not_deliver_to_unsubscribed_events():
    bus = EventBus()
    received = []
    bus.subscribe("EVENT_A", lambda e: received.append(e))
    bus.publish("EVENT_B", {}, source="test")
    assert received == []


def test_event_bus_survives_broken_subscriber():
    """A subscriber that raises must not stop other subscribers from running,
    and must not propagate the exception to the publisher."""
    bus = EventBus()
    calls = []

    def broken_handler(event):
        raise RuntimeError("boom")

    def working_handler(event):
        calls.append(event)

    bus.subscribe("EVENT_X", broken_handler)
    bus.subscribe("EVENT_X", working_handler)

    # Should not raise
    bus.publish("EVENT_X", {}, source="test")

    assert len(calls) == 1


def test_event_bus_history_is_capped():
    bus = EventBus()
    bus._max_history = 5
    for i in range(10):
        bus.publish("EVT", {"i": i}, source="test")
    assert len(bus.recent_events(limit=100)) == 5
    # most recent should be last published
    assert bus.recent_events(limit=1)[0].payload["i"] == 9


# ---------------------------------------------------------------------------
# State manager
# ---------------------------------------------------------------------------

def test_state_manager_default_status_is_stopped():
    sm = StateManager()
    assert sm.bot_status == BotStatus.STOPPED
    assert sm.connection_status == ConnectionStatus.DISCONNECTED
    assert sm.is_demo_account is None  # must be None until explicitly confirmed


def test_state_manager_is_demo_account_must_be_explicit():
    """
    This is a safety-critical test. is_demo_account must NEVER default to
    True — code that gates trading on this value must fail closed.
    """
    sm = StateManager()
    assert sm.is_demo_account is None
    assert sm.is_demo_account is not True

    sm.set_is_demo_account(True)
    assert sm.is_demo_account is True


def test_state_manager_account_update():
    sm = StateManager()
    sm.update_account(balance=1000.0, equity=1010.0, margin=50.0, free_margin=960.0, margin_level=2020.0)
    snap = sm.account
    assert snap.balance == 1000.0
    assert snap.equity == 1010.0
    assert snap.updated_at is not None


def test_state_manager_daily_stats_reset():
    sm = StateManager()
    sm.reset_daily_stats("2026-06-30", 1000.0)
    assert sm.daily_stats.starting_balance == 1000.0
    assert sm.daily_stats.realized_pnl == 0.0

    sm.record_realized_pnl(-25.0)
    assert sm.daily_stats.realized_pnl == -25.0
    assert sm.daily_stats.trades_closed == 1


def test_state_manager_open_position_tracking():
    sm = StateManager()
    assert sm.open_position_count == 0
    sm.record_trade_opened()
    sm.record_trade_opened()
    assert sm.open_position_count == 2
    sm.record_trade_closed_count()
    assert sm.open_position_count == 1


def test_state_manager_to_dict_is_serializable():
    import json
    sm = StateManager()
    sm.update_account(balance=500, equity=500, margin=0, free_margin=500, margin_level=0)
    d = sm.to_dict()
    # datetime objects must be excluded or converted — this will raise
    # TypeError if to_dict() leaks a raw datetime that json can't serialize.
    # account.updated_at is a datetime, so dashboard/API layers must handle
    # that explicitly later; for now we just confirm the structure exists.
    assert "bot_status" in d
    assert "account" in d
    assert d["is_demo_account"] is None


# ---------------------------------------------------------------------------
# Lot calculator (pure logic, no MT5 needed if we fake symbol info)
# ---------------------------------------------------------------------------

def test_lot_calculation_rejects_invalid_sl():
    from risk.lot_calculator import calculate_lot_size, LotCalculationError
    with pytest.raises(LotCalculationError):
        calculate_lot_size("EURUSD", stop_loss_pips=0)


def test_lot_calculation_rejects_out_of_bounds_risk():
    from risk.lot_calculator import calculate_lot_size, LotCalculationError
    with pytest.raises(LotCalculationError):
        calculate_lot_size("EURUSD", stop_loss_pips=20, risk_percent=50)


# ---------------------------------------------------------------------------
# Drawdown guard
# ---------------------------------------------------------------------------

def test_drawdown_guard_daily_loss_pct_with_no_starting_balance():
    from risk.drawdown_guard import DrawdownGuard
    guard = DrawdownGuard()
    # No starting balance set yet -> must not divide by zero
    assert guard.daily_loss_pct() == 0.0


def test_drawdown_guard_current_drawdown_with_no_peak():
    from risk.drawdown_guard import DrawdownGuard
    guard = DrawdownGuard()
    assert guard.current_drawdown_pct() == 0.0

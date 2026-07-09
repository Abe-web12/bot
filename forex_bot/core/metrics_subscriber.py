"""
metrics_subscriber.py
=======================
Subscribes to the event bus once, at start(), and keeps metrics.py and
the JournalRepository automatically in sync with everything that
happens — trade opens/closes, rejections, SL/TP hits, breakeven,
trailing, circuit breaker trips, reconnects.

This is deliberately the ONLY place that translates "an event happened"
into "a metric changed" or "a journal row was written". Execution/
strategy modules publish events; they do not call metrics.increment()
or JournalRepository.record() themselves. That keeps metrics/journal
consistent no matter how many new event producers get added later —
each new producer only has to publish the right event, not remember to
also update metrics and the journal at every call site.
"""

from __future__ import annotations

import logging

from core.event_bus import Event, Events, bus
from core.metrics import metrics

logger = logging.getLogger("metrics_subscriber")

_started = False


def _journal(entry_type: str, **kwargs) -> None:
    """Write a journal entry, swallowing DB errors so a broken database
    connection never takes down the event-bus dispatch path (event_bus
    already isolates subscriber exceptions from each other, but we log
    with context here for faster debugging)."""
    try:
        from database.connection import unit_of_work
        from database.repositories import JournalRepository

        with unit_of_work() as session:
            JournalRepository(session).record(entry_type=entry_type, **kwargs)
    except Exception:
        logger.exception("Failed to write journal entry for %s", entry_type)


def _on_signal_generated(event: Event) -> None:
    p = event.payload
    metrics.increment("signals_generated")
    _journal(
        "SIGNAL_GENERATED",
        symbol=p.get("symbol"),
        side=p.get("direction"),
        confidence=p.get("confidence"),
        reason=p.get("reason"),
        payload=p,
    )


def _on_signal_rejected(event: Event) -> None:
    p = event.payload
    metrics.increment("signals_discarded_low_confidence")
    _journal(
        "SIGNAL_REJECTED",
        symbol=p.get("symbol"),
        side=p.get("direction"),
        confidence=p.get("confidence"),
        reason=p.get("reason"),
        payload=p,
    )


def _on_trade_opened(event: Event) -> None:
    p = event.payload
    metrics.increment("trades_opened")
    # open_trades gauge is kept authoritative by run.py's main loop via
    # position_manager.sync_position_count() against real MT5 state — not
    # derived here, to avoid this counter drifting from the broker's truth.
    _journal(
        "TRADE_OPENED",
        symbol=p.get("symbol"),
        side=p.get("side"),
        price=p.get("price"),
        execution_id=p.get("request_id"),
        mt5_ticket=p.get("ticket"),
        payload=p,
    )


def _on_trade_closed(event: Event) -> None:
    p = event.payload
    metrics.increment("trades_closed")
    profit = p.get("profit")
    if isinstance(profit, (int, float)):
        if profit > 0:
            metrics.record_trade_win()
        else:
            metrics.record_trade_loss()
    _journal(
        "TRADE_CLOSED",
        symbol=p.get("symbol"),
        price=p.get("price"),
        mt5_ticket=p.get("ticket"),
        reason="partial" if not p.get("full_close", True) else "full",
        payload=p,
    )


def _on_trade_rejected(event: Event) -> None:
    p = event.payload
    metrics.increment("trades_rejected_risk")
    _journal(
        "TRADE_REJECTED",
        symbol=p.get("symbol"),
        reason=p.get("reason"),
        payload=p,
    )


def _on_sl_hit(event: Event) -> None:
    p = event.payload
    _journal("SL_HIT", symbol=p.get("symbol"), price=p.get("price"),
              mt5_ticket=p.get("ticket"), payload=p)


def _on_tp_hit(event: Event) -> None:
    p = event.payload
    _journal("TP_HIT", symbol=p.get("symbol"), price=p.get("price"),
              mt5_ticket=p.get("ticket"), payload=p)


def _on_breakeven(event: Event) -> None:
    p = event.payload
    _journal("BREAKEVEN", symbol=p.get("symbol"), price=p.get("new_sl"),
              mt5_ticket=p.get("ticket"), payload=p)


def _on_trailing(event: Event) -> None:
    p = event.payload
    _journal("TRAILING_STOP", symbol=p.get("symbol"), price=p.get("new_sl"),
              mt5_ticket=p.get("ticket"), payload=p)


def _on_partial_close(event: Event) -> None:
    p = event.payload
    _journal("PARTIAL_CLOSE", symbol=p.get("symbol"), price=p.get("price"),
              mt5_ticket=p.get("ticket"), payload=p)


def _on_mt5_reconnected(event: Event) -> None:
    metrics.increment("mt5_reconnects")


def _on_circuit_tripped(event: Event) -> None:
    metrics.increment("circuit_breaker_trips")
    p = event.payload
    logger.warning("Circuit breaker tripped: %s", p)


def _on_daily_loss_limit(event: Event) -> None:
    _journal("RISK_DAILY_LOSS_LIMIT", reason="daily loss limit reached", payload=event.payload)


def _on_drawdown_limit(event: Event) -> None:
    _journal("RISK_DRAWDOWN_LIMIT", reason="max drawdown exceeded", payload=event.payload)


def start() -> None:
    """Subscribe all handlers. Idempotent — safe to call more than once."""
    global _started
    if _started:
        logger.warning("metrics_subscriber already started, ignoring duplicate start().")
        return

    bus.subscribe(Events.SIGNAL_GENERATED, _on_signal_generated)
    bus.subscribe(Events.SIGNAL_REJECTED, _on_signal_rejected)
    bus.subscribe(Events.TRADE_OPENED, _on_trade_opened)
    bus.subscribe(Events.TRADE_CLOSED, _on_trade_closed)
    bus.subscribe(Events.TRADE_REJECTED, _on_trade_rejected)
    bus.subscribe(Events.SL_HIT, _on_sl_hit)
    bus.subscribe(Events.TP_HIT, _on_tp_hit)
    bus.subscribe(Events.POSITION_BREAKEVEN, _on_breakeven)
    bus.subscribe(Events.POSITION_TRAILING_UPDATED, _on_trailing)
    bus.subscribe(Events.POSITION_PARTIAL_CLOSED, _on_partial_close)
    bus.subscribe(Events.MT5_CONNECTED, _on_mt5_reconnected)
    bus.subscribe(Events.CIRCUIT_BREAKER_TRIPPED, _on_circuit_tripped)
    bus.subscribe(Events.DAILY_LOSS_LIMIT_HIT, _on_daily_loss_limit)
    bus.subscribe(Events.DRAWDOWN_LIMIT_HIT, _on_drawdown_limit)

    _started = True
    logger.info("metrics_subscriber started — metrics and journal now update automatically from events.")

"""
persistence_subscriber.py
===========================
Subscribes to TRADE_OPENED / TRADE_CLOSED and writes the authoritative
`trades` table row via TradeRepository. Also records a BotEvent row for
every notification-relevant event (the raw system event log that
api/routes/dashboard.py's /api/notifications endpoint reads) — distinct
from metrics_subscriber.py's JournalEntry writes, which are the
narrative "why did this happen" decision log. BotEvent is "what
happened, verbatim payload, for audit/notification history";
JournalEntry is "what did the strategy/execution decide, and why".

Execution modules (order_executor.py, trade_manager.py) do not call
TradeRepository or BotEventRepository directly — they publish events;
this is the only module that turns those events into these two kinds
of database writes.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from core.event_bus import Event, Events, bus

logger = logging.getLogger("persistence_subscriber")

_started = False

# Events recorded verbatim to bot_events for the notification history API.
_NOTIFICATION_EVENTS = [
    Events.BOT_STARTED, Events.BOT_STOPPED,
    Events.TRADE_OPENED, Events.TRADE_CLOSED,
    Events.SL_HIT, Events.TP_HIT,
    Events.DAILY_LOSS_LIMIT_HIT, Events.DRAWDOWN_LIMIT_HIT,
    Events.MT5_DISCONNECTED, Events.MT5_CONNECTED,
    Events.CRITICAL_ERROR,
]


def _record_bot_event(event: Event) -> None:
    try:
        from database.connection import unit_of_work
        from database.repositories import BotEventRepository

        with unit_of_work() as session:
            BotEventRepository(session).append(
                event_name=event.name,
                source=event.source,
                payload=event.payload,
                correlation_id="",
            )
    except Exception:
        logger.exception("Failed to record bot_event for %s", event.name)


def _on_trade_opened(event: Event) -> None:
    p = event.payload
    ticket = p.get("ticket")
    if ticket is None:
        logger.warning("TRADE_OPENED event missing ticket — cannot persist. Payload: %s", p)
        return

    try:
        from database.connection import unit_of_work
        from database.models import Trade
        from database.repositories import DuplicateKeyError, TradeRepository

        with unit_of_work() as session:
            repo = TradeRepository(session)
            if repo.get_by_ticket(ticket) is not None:
                # Already recorded (e.g. duplicate event delivery) — not an
                # error, just a no-op. TRADE_OPENED must be safe to process
                # more than once without creating duplicate trade rows.
                return

            trade = Trade(
                id=str(uuid.uuid4()),
                execution_id=p.get("request_id"),
                mt5_ticket=ticket,
                symbol=p.get("symbol", ""),
                side=p.get("side", ""),
                open_price=p.get("price", 0.0),
                volume=p.get("volume", 0.0),
                stop_loss=p.get("sl"),
                take_profit=p.get("tp"),
                magic_number=p.get("magic_number", 0),
                comment=p.get("comment", ""),
                open_time=datetime.now(timezone.utc),
                is_closed=False,
            )
            try:
                repo.save(trade)
            except DuplicateKeyError:
                pass  # race with another delivery of the same event — fine
        logger.info("Persisted trade open: ticket=%s symbol=%s", ticket, p.get("symbol"))
    except Exception:
        logger.exception("Failed to persist TRADE_OPENED for ticket=%s", ticket)


def _on_trade_closed(event: Event) -> None:
    p = event.payload
    ticket = p.get("ticket")
    if ticket is None:
        logger.warning("TRADE_CLOSED event missing ticket — cannot persist. Payload: %s", p)
        return

    try:
        from database.connection import unit_of_work
        from database.repositories import TradeRepository

        with unit_of_work() as session:
            repo = TradeRepository(session)
            close_reason = "PARTIAL" if not p.get("full_close", True) else p.get("close_reason", "MANUAL")
            updated = repo.close_trade(
                mt5_ticket=ticket,
                close_price=p.get("price", 0.0),
                profit=p.get("profit", 0.0),
                close_time=datetime.now(timezone.utc),
                close_reason=close_reason,
            )
            if updated is None:
                logger.warning(
                    "TRADE_CLOSED for ticket=%s but no matching open trade row found "
                    "(may predate this session's persistence layer).",
                    ticket,
                )
        logger.info("Persisted trade close: ticket=%s", ticket)
    except Exception:
        logger.exception("Failed to persist TRADE_CLOSED for ticket=%s", ticket)


def start() -> None:
    """Subscribe handlers. Idempotent — safe to call more than once."""
    global _started
    if _started:
        logger.warning("persistence_subscriber already started, ignoring duplicate start().")
        return

    bus.subscribe(Events.TRADE_OPENED, _on_trade_opened)
    bus.subscribe(Events.TRADE_CLOSED, _on_trade_closed)

    for event_name in _NOTIFICATION_EVENTS:
        bus.subscribe(event_name, _record_bot_event)

    _started = True
    logger.info(
        "persistence_subscriber started — trades table and bot_events (%d event types) now update automatically.",
        len(_NOTIFICATION_EVENTS),
    )

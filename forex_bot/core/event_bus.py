"""
event_bus.py
============
Central publish/subscribe event bus.

Why this exists:
Modules (mt5_connector, risk engine, strategy engine, dashboard, etc.)
should never call each other directly. Instead they publish events
("CONNECTION_LOST", "TRADE_OPENED", "DRAWDOWN_LIMIT_HIT", ...) and
subscribe to the events they care about. This keeps modules independently
testable and lets us add new modules (AI analyzer, TradingView webhook,
dashboard websocket) later without touching existing code.

This is intentionally synchronous and in-process (no Redis/RabbitMQ) —
appropriate for a single-process desktop bot. If this ever needs to scale
to multiple processes, only this file changes; subscribers don't.
"""

from __future__ import annotations

import logging
import threading
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable, DefaultDict, List

logger = logging.getLogger("event_bus")


@dataclass
class Event:
    name: str
    payload: dict = field(default_factory=dict)
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    source: str = "unknown"

    def __repr__(self) -> str:
        return f"<Event {self.name} from={self.source} payload_keys={list(self.payload.keys())}>"


Subscriber = Callable[[Event], None]


class EventBus:
    """
    Thread-safe synchronous event bus.

    Usage:
        bus = EventBus()
        bus.subscribe("TRADE_OPENED", my_handler)
        bus.publish("TRADE_OPENED", {"symbol": "EURUSD"}, source="trade_manager")
    """

    def __init__(self) -> None:
        self._subscribers: DefaultDict[str, List[Subscriber]] = defaultdict(list)
        self._lock = threading.RLock()
        self._history: List[Event] = []
        self._max_history = 500

    def subscribe(self, event_name: str, handler: Subscriber) -> None:
        with self._lock:
            self._subscribers[event_name].append(handler)
        logger.debug("Subscribed %s to %s", getattr(handler, "__name__", handler), event_name)

    def unsubscribe(self, event_name: str, handler: Subscriber) -> None:
        with self._lock:
            handlers = self._subscribers.get(event_name, [])
            if handler in handlers:
                handlers.remove(handler)

    def publish(self, event_name: str, payload: dict | None = None, source: str = "unknown") -> Event:
        event = Event(name=event_name, payload=payload or {}, source=source)

        with self._lock:
            self._history.append(event)
            if len(self._history) > self._max_history:
                self._history.pop(0)
            handlers = list(self._subscribers.get(event_name, []))

        logger.info("EVENT %s | source=%s | payload=%s", event_name, source, event.payload)

        for handler in handlers:
            try:
                handler(event)
            except Exception:
                # A broken subscriber must never crash the publisher or
                # take down other subscribers. Trading-critical code paths
                # (risk checks, kill switch) cannot be silently skipped
                # because a dashboard handler threw an exception.
                logger.exception(
                    "Subscriber %s raised an exception handling event %s",
                    getattr(handler, "__name__", handler),
                    event_name,
                )
        return event

    def recent_events(self, limit: int = 50) -> List[Event]:
        with self._lock:
            return self._history[-limit:]


# Single shared instance for the whole process.
# Modules import this directly: `from core.event_bus import bus`
bus = EventBus()


# ---------------------------------------------------------------------------
# Canonical event names — defined centrally so modules don't use ad-hoc
# string literals that can silently drift out of sync (typo = silent bug).
# ---------------------------------------------------------------------------
class Events:
    # Connection lifecycle
    MT5_CONNECTED = "MT5_CONNECTED"
    MT5_DISCONNECTED = "MT5_DISCONNECTED"
    MT5_RECONNECT_FAILED = "MT5_RECONNECT_FAILED"

    # Bot lifecycle
    BOT_STARTED = "BOT_STARTED"
    BOT_STOPPED = "BOT_STOPPED"
    BOT_PAUSED = "BOT_PAUSED"
    KILL_SWITCH_TRIGGERED = "KILL_SWITCH_TRIGGERED"

    # Risk
    DAILY_LOSS_LIMIT_HIT = "DAILY_LOSS_LIMIT_HIT"
    DRAWDOWN_LIMIT_HIT = "DRAWDOWN_LIMIT_HIT"
    DRAWDOWN_WARNING = "DRAWDOWN_WARNING"     # non-fatal, informational warning
    MARGIN_WARNING = "MARGIN_WARNING"

    # Trading
    SIGNAL_GENERATED = "SIGNAL_GENERATED"
    SIGNAL_SCORED = "SIGNAL_SCORED"
    SIGNAL_REJECTED = "SIGNAL_REJECTED"       # scored but did not pass risk/threshold gates
    TRADE_OPENED = "TRADE_OPENED"
    TRADE_CLOSED = "TRADE_CLOSED"
    TRADE_REJECTED = "TRADE_REJECTED"
    SL_HIT = "SL_HIT"                        # stop loss hit notification
    TP_HIT = "TP_HIT"                        # take profit hit notification
    POSITION_BREAKEVEN = "POSITION_BREAKEVEN"
    POSITION_TRAILING_UPDATED = "POSITION_TRAILING_UPDATED"
    POSITION_PARTIAL_CLOSED = "POSITION_PARTIAL_CLOSED"

    # System
    HEARTBEAT = "HEARTBEAT"
    ERROR = "ERROR"
    CRITICAL_ERROR = "CRITICAL_ERROR"        # severity distinct from ERROR for alerting
    CIRCUIT_BREAKER_TRIPPED = "CIRCUIT_BREAKER_TRIPPED"
    CIRCUIT_BREAKER_RECOVERED = "CIRCUIT_BREAKER_RECOVERED"
    CONFIG_RELOADED = "CONFIG_RELOADED"

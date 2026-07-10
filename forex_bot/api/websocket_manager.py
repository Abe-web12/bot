"""
websocket_manager.py
======================
Production connection management for the WebSocket layer, kept separate
from api/websocket.py (which owns the Flask/flask-sock route wiring and
delegates connection bookkeeping here). This split means channels,
sequencing, replay, heartbeat, and backpressure are independently unit
testable without a real WebSocket transport.

Channels/rooms: every broadcast event belongs to a channel (e.g.
"trades", "account", "market:EURUSD", "health"). Clients subscribe to
only the channels they want; a client with zero subscriptions receives
nothing — no channel means no interest, not "give me everything."

Sequencing + replay: every broadcast is wrapped in an EventDTO carrying
a monotonically increasing `sequence` number, and a bounded ring buffer
of recent events is kept per channel so a reconnecting client can send
{"action":"replay","channel":"trades","since_sequence":41} and receive
everything after 41 still in the buffer. If part of that range already
aged out, the server reports replay_incomplete=true explicitly rather
than silently returning a partial history that looks complete.

Heartbeat: server pings every connection every HEARTBEAT_INTERVAL_S; a
connection that hasn't been seen within HEARTBEAT_TIMEOUT_S is dropped —
catches half-open TCP connections that never sent a close frame.

Backpressure: each connection is dropped after 3 consecutive send
failures — a slow/dead client must never cause unbounded memory growth
or block broadcasts to everyone else.

Acknowledgement: clients MAY send {"action":"ack","event_id":"..."} —
recorded for diagnostics only. This is at-most-once broadcast, not a
guaranteed-delivery queue.
"""

from __future__ import annotations

import logging
import threading
import time
import uuid
from collections import deque
from dataclasses import dataclass, field
from typing import Callable

from api.dto import EventDTO

logger = logging.getLogger("api.websocket_manager")

HEARTBEAT_INTERVAL_S = 20
HEARTBEAT_TIMEOUT_S = 45
MAX_PENDING_MESSAGES = 200
REPLAY_BUFFER_SIZE = 500


class WebSocketManagerError(Exception):
    pass


@dataclass
class ConnectionMetrics:
    messages_sent: int = 0
    messages_failed: int = 0
    subscriptions: set = field(default_factory=set)
    last_ack_event_id: str | None = None
    connected_at: float = field(default_factory=time.monotonic)
    last_seen: float = field(default_factory=time.monotonic)


@dataclass
class Connection:
    conn_id: str
    ws: object
    role: str
    send_fn: Callable[[str], None]
    metrics: ConnectionMetrics = field(default_factory=ConnectionMetrics)
    consecutive_send_failures: int = 0


class EventSequencer:
    """Assigns monotonically increasing sequence numbers to outbound
    events and keeps a bounded per-channel replay buffer. Thread-safe."""

    def __init__(self, buffer_size: int = REPLAY_BUFFER_SIZE) -> None:
        self._lock = threading.Lock()
        self._next_sequence = 1
        self._buffers: dict[str, deque] = {}
        self._buffer_size = buffer_size
        self._seen_event_ids: deque = deque(maxlen=5000)

    def emit(self, event_name: str, channel: str, payload: dict) -> EventDTO:
        with self._lock:
            seq = self._next_sequence
            self._next_sequence += 1
            dto = EventDTO.new(sequence=seq, event=event_name, channel=channel, payload=payload)
            buf = self._buffers.setdefault(channel, deque(maxlen=self._buffer_size))
            buf.append(dto)
            self._seen_event_ids.append(dto.event_id)
            return dto

    def is_duplicate(self, event_id: str) -> bool:
        with self._lock:
            return event_id in self._seen_event_ids

    def replay(self, channel: str, since_sequence: int) -> tuple[list, bool]:
        with self._lock:
            buf = self._buffers.get(channel)
            if not buf:
                return [], False
            events_after = [e for e in buf if e.sequence > since_sequence]
            oldest_in_buffer = buf[0].sequence
            replay_incomplete = oldest_in_buffer > since_sequence + 1
            return events_after, replay_incomplete

    def current_sequence(self) -> int:
        with self._lock:
            return self._next_sequence - 1


class ConnectionManager:
    """Thread-safe registry of connected clients with channel
    subscriptions, sequencing, replay, heartbeat, backpressure."""

    def __init__(self) -> None:
        self._connections: dict[str, Connection] = {}
        self._lock = threading.RLock()
        self.sequencer = EventSequencer()
        self._heartbeat_thread: threading.Thread | None = None
        self._stop_event = threading.Event()

    def connect(self, ws, role: str, send_fn: Callable[[str], None]) -> str:
        conn_id = str(uuid.uuid4())
        conn = Connection(conn_id=conn_id, ws=ws, role=role, send_fn=send_fn)
        with self._lock:
            self._connections[conn_id] = conn
        logger.info("WebSocket connected: conn_id=%s role=%s (total=%d)", conn_id, role, len(self._connections))
        return conn_id

    def disconnect(self, conn_id: str) -> None:
        with self._lock:
            conn = self._connections.pop(conn_id, None)
        if conn:
            logger.info(
                "WebSocket disconnected: conn_id=%s (sent=%d, failed=%d)",
                conn_id, conn.metrics.messages_sent, conn.metrics.messages_failed,
            )

    def connection_count(self) -> int:
        with self._lock:
            return len(self._connections)

    def subscribe(self, conn_id: str, channel: str) -> bool:
        with self._lock:
            conn = self._connections.get(conn_id)
            if conn is None:
                return False
            conn.metrics.subscriptions.add(channel)
            return True

    def unsubscribe(self, conn_id: str, channel: str) -> bool:
        with self._lock:
            conn = self._connections.get(conn_id)
            if conn is None:
                return False
            conn.metrics.subscriptions.discard(channel)
            return True

    def subscriptions_of(self, conn_id: str) -> set:
        with self._lock:
            conn = self._connections.get(conn_id)
            return set(conn.metrics.subscriptions) if conn else set()

    def broadcast(self, event_name: str, channel: str, payload: dict) -> EventDTO:
        """Sequences + buffers the event, then sends to every connection
        subscribed to that channel. Always sequences/buffers even with
        zero current subscribers so a client subscribing moments later
        can still replay it within the buffer window."""
        dto = self.sequencer.emit(event_name, channel, payload)
        message = _serialize(dto)

        with self._lock:
            targets = [c for c in self._connections.values() if channel in c.metrics.subscriptions]

        for conn in targets:
            self._send_to(conn, message)

        return dto

    def send_replay(self, conn_id: str, channel: str, since_sequence: int) -> dict:
        events, incomplete = self.sequencer.replay(channel, since_sequence)
        with self._lock:
            conn = self._connections.get(conn_id)
        if conn is None:
            raise WebSocketManagerError(f"Cannot replay to unknown connection {conn_id}.")

        for dto in events:
            self._send_to(conn, _serialize(dto))

        summary = {
            "action": "replay_complete", "channel": channel,
            "events_sent": len(events), "replay_incomplete": incomplete,
        }
        self._send_to(conn, _serialize_raw(summary))
        return summary

    def acknowledge(self, conn_id: str, event_id: str) -> None:
        with self._lock:
            conn = self._connections.get(conn_id)
            if conn:
                conn.metrics.last_ack_event_id = event_id
                conn.metrics.last_seen = time.monotonic()

    def touch(self, conn_id: str) -> None:
        with self._lock:
            conn = self._connections.get(conn_id)
            if conn:
                conn.metrics.last_seen = time.monotonic()

    def _send_to(self, conn: Connection, message: str) -> None:
        try:
            conn.send_fn(message)
            conn.metrics.messages_sent += 1
            conn.consecutive_send_failures = 0
        except Exception as exc:
            conn.metrics.messages_failed += 1
            conn.consecutive_send_failures += 1
            logger.warning(
                "Send failed for conn_id=%s (%d consecutive failures): %s",
                conn.conn_id, conn.consecutive_send_failures, exc,
            )
            if conn.consecutive_send_failures >= 3:
                logger.warning(
                    "Dropping conn_id=%s after %d consecutive send failures (backpressure).",
                    conn.conn_id, conn.consecutive_send_failures,
                )
                self.disconnect(conn.conn_id)

    def start_heartbeat(self) -> None:
        if self._heartbeat_thread and self._heartbeat_thread.is_alive():
            return
        self._stop_event.clear()
        self._heartbeat_thread = threading.Thread(target=self._heartbeat_loop, name="ws-heartbeat", daemon=True)
        self._heartbeat_thread.start()

    def stop_heartbeat(self) -> None:
        self._stop_event.set()
        if self._heartbeat_thread:
            self._heartbeat_thread.join(timeout=5)

    def _heartbeat_loop(self) -> None:
        while not self._stop_event.wait(HEARTBEAT_INTERVAL_S):
            self._run_heartbeat_cycle()

    def _run_heartbeat_cycle(self) -> None:
        now = time.monotonic()
        with self._lock:
            connections = list(self._connections.values())

        dead: list[str] = []
        for conn in connections:
            if now - conn.metrics.last_seen > HEARTBEAT_TIMEOUT_S:
                dead.append(conn.conn_id)
                continue
            try:
                conn.send_fn(_serialize_raw({"action": "ping", "server_time": time.time()}))
            except Exception:
                dead.append(conn.conn_id)

        for conn_id in dead:
            logger.info("Heartbeat: dropping stale connection %s.", conn_id)
            self.disconnect(conn_id)

    def connection_metrics(self) -> dict:
        with self._lock:
            per_channel: dict[str, int] = {}
            for conn in self._connections.values():
                for channel in conn.metrics.subscriptions:
                    per_channel[channel] = per_channel.get(channel, 0) + 1

            return {
                "total_connections": len(self._connections),
                "subscriptions_per_channel": per_channel,
                "current_sequence": self.sequencer.current_sequence(),
                "connections": [
                    {
                        "conn_id": c.conn_id, "role": c.role,
                        "subscriptions": sorted(c.metrics.subscriptions),
                        "messages_sent": c.metrics.messages_sent,
                        "messages_failed": c.metrics.messages_failed,
                        "connected_seconds": round(time.monotonic() - c.metrics.connected_at, 1),
                        "idle_seconds": round(time.monotonic() - c.metrics.last_seen, 1),
                    }
                    for c in self._connections.values()
                ],
            }


def _serialize(dto: EventDTO) -> str:
    import json
    return json.dumps(dto.to_dict(), default=str)


def _serialize_raw(obj: dict) -> str:
    import json
    return json.dumps(obj, default=str)


# Single shared instance for the whole process.
connection_manager = ConnectionManager()

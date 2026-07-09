"""
websocket.py
=============
Flask/flask-sock route wiring for the WebSocket endpoint. Connection
bookkeeping (channels, sequencing, replay, heartbeat, backpressure) is
delegated to api.websocket_manager.connection_manager - this file only
owns the transport (accepting the socket, reading/writing frames,
translating client JSON actions into connection_manager calls).

PUBLIC INTERFACE PRESERVED: api/app.py calls init_websocket(app) and
nothing else from this module. `registry` is kept as a module-level
alias of connection_manager so code written against the previous
ConnectionRegistry-based version keeps working unmodified.

Protocol (client -> server JSON):
  {"token": "<jwt>"}                                   - required first message (auth)
  {"action": "subscribe", "channel": "trades"}
  {"action": "unsubscribe", "channel": "trades"}
  {"action": "replay", "channel": "trades", "since_sequence": 41}
  {"action": "ack", "event_id": "..."}
  {"action": "pong"}                                   - heartbeat response (optional)

Server -> client JSON:
  {"event_id","sequence","event","channel","payload","occurred_at"}    - a broadcast EventDTO
  {"action": "ping", "server_time": ...}                                - heartbeat probe
  {"action": "replay_complete", "channel", "events_sent", "replay_incomplete"}
  {"action": "subscribed"/"unsubscribed", "channel": ...}
  {"error": "..."}
"""

from __future__ import annotations

import json
import logging
import time

from flask_sock import Sock

from api.auth import AuthError, decode_access_token
from api.websocket_manager import connection_manager
from core.event_bus import Events, bus

logger = logging.getLogger("api.websocket")

sock = Sock()

_AUTH_TIMEOUT_SECONDS = 10

_EVENT_CHANNEL_MAP: dict[str, str] = {
    Events.BOT_STARTED: "bot", Events.BOT_STOPPED: "bot", Events.BOT_PAUSED: "bot",
    Events.KILL_SWITCH_TRIGGERED: "bot",
    Events.TRADE_OPENED: "trades", Events.TRADE_CLOSED: "trades", Events.TRADE_REJECTED: "trades",
    Events.SL_HIT: "trades", Events.TP_HIT: "trades",
    Events.POSITION_BREAKEVEN: "trades", Events.POSITION_TRAILING_UPDATED: "trades",
    Events.POSITION_PARTIAL_CLOSED: "trades",
    Events.SIGNAL_GENERATED: "signals", Events.SIGNAL_SCORED: "signals", Events.SIGNAL_REJECTED: "signals",
    Events.MT5_CONNECTED: "health", Events.MT5_DISCONNECTED: "health", Events.MT5_RECONNECT_FAILED: "health",
    Events.DAILY_LOSS_LIMIT_HIT: "risk", Events.DRAWDOWN_LIMIT_HIT: "risk", Events.DRAWDOWN_WARNING: "risk",
    Events.MARGIN_WARNING: "risk",
    Events.CIRCUIT_BREAKER_TRIPPED: "health", Events.CIRCUIT_BREAKER_RECOVERED: "health",
    Events.CONFIG_RELOADED: "config", Events.CRITICAL_ERROR: "health",
    "ACCOUNT_TICK": "account", "MARKET_TICK": "market", "RISK_TICK": "risk",
    "HEALTH_TICK": "health", "METRICS_TICK": "metrics", "EXECUTION_TICK": "execution",
}

# Channel authorization: which roles can subscribe to each channel.
# viewer has no channel subscriptions by default (read-only dashboard only).
_CHANNEL_ROLES: dict[str, set[str]] = {
    "account": {"owner", "admin", "trader"},
    "bot": {"owner", "admin"},
    "trades": {"owner", "admin", "trader"},
    "signals": {"owner", "admin", "trader"},
    "risk": {"owner", "admin", "trader"},
    "health": {"owner", "admin", "trader", "viewer"},
    "config": {"owner", "admin"},
    "metrics": {"owner", "admin", "trader", "viewer"},
    "market": {"owner", "admin", "trader", "viewer"},
    "execution": {"owner", "admin"},
}


def _can_subscribe(role: str, channel: str) -> bool:
    allowed = _CHANNEL_ROLES.get(channel)
    if allowed is None:
        return role in {"owner", "admin"}
    return role in allowed


_subscribed_to_bus = False


def _on_domain_event(event) -> None:
    channel = _EVENT_CHANNEL_MAP.get(event.name)
    if channel is None:
        return
    connection_manager.broadcast(event.name, channel, event.payload)


def start_broadcasting() -> None:
    global _subscribed_to_bus
    if _subscribed_to_bus:
        return
    for event_name in _EVENT_CHANNEL_MAP:
        bus.subscribe(event_name, _on_domain_event)
    _subscribed_to_bus = True
    connection_manager.start_heartbeat()
    logger.info("WebSocket broadcaster subscribed to %d event types.", len(_EVENT_CHANNEL_MAP))


registry = connection_manager


def init_websocket(app) -> None:
    sock.init_app(app)
    start_broadcasting()

    @sock.route("/ws")
    def ws_handler(ws):
        auth_result = _authenticate(ws)
        if auth_result is None:
            try:
                ws.send(json.dumps({"error": "unauthorized"}))
            except Exception:
                pass
            return

        role = auth_result.get("role", "viewer")
        user_id = auth_result.get("user_id")
        conn_id = connection_manager.connect(ws, role, send_fn=ws.send, user_id=user_id)
        try:
            ws.send(json.dumps({
                "action": "connected", "conn_id": conn_id, "role": role,
                "current_sequence": connection_manager.sequencer.current_sequence(),
            }))
            _message_loop(ws, conn_id)
        finally:
            connection_manager.disconnect(conn_id)

    def _authenticate(ws):
        deadline = time.monotonic() + _AUTH_TIMEOUT_SECONDS
        while time.monotonic() < deadline:
            try:
                raw = ws.receive(timeout=_AUTH_TIMEOUT_SECONDS)
            except Exception:
                return None
            if raw is None:
                return None
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue

            token = data.get("token", "")
            if not token:
                continue
            try:
                payload = decode_access_token(token)
                return payload
            except AuthError:
                return None
        return None

    def _message_loop(ws, conn_id):
        while True:
            raw = ws.receive()
            if raw is None:
                break

            connection_manager.touch(conn_id)

            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                _safe_send(ws, {"error": "Invalid JSON."})
                continue

            action = data.get("action")

            if action == "subscribe":
                channel = data.get("channel", "")
                if not channel:
                    _safe_send(ws, {"error": "subscribe requires a 'channel'."})
                    continue
                if not _can_subscribe(role, channel):
                    _safe_send(ws, {"error": f"Role '{role}' is not authorized for channel '{channel}'."})
                    continue
                connection_manager.subscribe(conn_id, channel)
                _safe_send(ws, {"action": "subscribed", "channel": channel})

            elif action == "unsubscribe":
                channel = data.get("channel", "")
                connection_manager.unsubscribe(conn_id, channel)
                _safe_send(ws, {"action": "unsubscribed", "channel": channel})

            elif action == "replay":
                channel = data.get("channel", "")
                since_sequence = int(data.get("since_sequence", 0))
                try:
                    connection_manager.send_replay(conn_id, channel, since_sequence)
                except Exception as exc:
                    _safe_send(ws, {"error": str(exc)})

            elif action == "ack":
                event_id = data.get("event_id", "")
                if event_id:
                    connection_manager.acknowledge(conn_id, event_id)

            elif action == "pong":
                pass

            else:
                _safe_send(ws, {"error": f"Unknown action '{action}'."})

    def _safe_send(ws, obj):
        try:
            ws.send(json.dumps(obj, default=str))
        except Exception:
            pass

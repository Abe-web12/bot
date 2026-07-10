"""
telegram_service.py
====================
Real Telegram Bot API integration. Subscribes to the event bus and
sends formatted notifications for every significant trading event.

Design decisions:
  - Uses httpx (sync client) rather than the python-telegram-bot
    library, because we only need sendMessage — a 150-line HTTP client
    is far less surface area than a full bot framework for what is
    essentially fire-and-forget alerting.
  - All sends happen on a background thread via an internal queue so
    a slow or failing Telegram API never blocks the event bus handler
    (which runs synchronously on whichever thread published the event).
  - Retry with exponential backoff up to MAX_SEND_RETRIES. Telegram's
    API returns 429 (Too Many Requests) with a retry_after field when
    rate-limited — we respect it.
  - If TELEGRAM_TOKEN or TELEGRAM_CHAT_ID is empty, the service logs a
    warning at startup and silently drops all messages rather than
    crashing the bot — Telegram notifications are important but not
    safety-critical; the bot should trade even if Telegram is down.
  - Message formatting uses Markdown V2 (Telegram's recommended format)
    with proper escaping for special characters.
"""

from __future__ import annotations

import logging
import queue
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

import config
from core.event_bus import Event, Events, bus

logger = logging.getLogger("telegram_service")

_TELEGRAM_API_BASE = "https://api.telegram.org/bot{token}/sendMessage"
_MAX_SEND_RETRIES = 3
_SEND_QUEUE_MAX = 200     # drop oldest if flooded — prevents OOM during broker outage
_REQUEST_TIMEOUT = 10.0   # seconds

# Characters that must be escaped in Telegram MarkdownV2
_MDV2_ESCAPE_CHARS = r"\_*[]()~`>#+-=|{}.!"


def _escape_mdv2(text: str) -> str:
    """Escape special characters for Telegram MarkdownV2 format."""
    for ch in _MDV2_ESCAPE_CHARS:
        text = text.replace(ch, f"\\{ch}")
    return text


def _now_utc_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")


@dataclass
class _OutboundMessage:
    text: str
    parse_mode: str = "MarkdownV2"
    enqueued_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class TelegramService:
    """
    Subscribes to the event bus and forwards significant events to a
    Telegram chat. Disabled gracefully if credentials are absent.
    """

    def __init__(self) -> None:
        self._token = config.TELEGRAM_TOKEN
        self._chat_id = config.TELEGRAM_CHAT_ID
        self._enabled = bool(self._token and self._chat_id)

        if not self._enabled:
            logger.warning(
                "TelegramService: TELEGRAM_TOKEN or TELEGRAM_CHAT_ID not set in .env. "
                "Telegram notifications are DISABLED. Bot will still trade normally."
            )

        self._queue: queue.Queue[_OutboundMessage] = queue.Queue(maxsize=_SEND_QUEUE_MAX)
        self._stop_event = threading.Event()
        self._sender_thread: Optional[threading.Thread] = None
        self._api_url = _TELEGRAM_API_BASE.format(token=self._token) if self._token else ""

    def start(self) -> None:
        if not self._enabled:
            return
        self._stop_event.clear()
        self._sender_thread = threading.Thread(
            target=self._sender_loop,
            name="telegram-sender",
            daemon=True,
        )
        self._sender_thread.start()
        self._subscribe_to_events()
        logger.info("TelegramService started (chat_id=%s).", self._chat_id)

    def stop(self, timeout_seconds: float = 5.0) -> None:
        self._stop_event.set()
        if self._sender_thread and self._sender_thread.is_alive():
            self._sender_thread.join(timeout=timeout_seconds)

    def _subscribe_to_events(self) -> None:
        subscriptions = [
            (Events.BOT_STARTED,          self._on_bot_started),
            (Events.BOT_STOPPED,          self._on_bot_stopped),
            (Events.BOT_PAUSED,           self._on_bot_paused),
            (Events.KILL_SWITCH_TRIGGERED, self._on_kill_switch),
            (Events.TRADE_OPENED,         self._on_trade_opened),
            (Events.TRADE_CLOSED,         self._on_trade_closed),
            (Events.TRADE_REJECTED,       self._on_trade_rejected),
            (Events.SL_HIT,               self._on_sl_hit),
            (Events.TP_HIT,               self._on_tp_hit),
            (Events.DAILY_LOSS_LIMIT_HIT, self._on_daily_loss_limit),
            (Events.DRAWDOWN_LIMIT_HIT,   self._on_drawdown_limit),
            (Events.DRAWDOWN_WARNING,     self._on_drawdown_warning),
            (Events.MT5_DISCONNECTED,     self._on_disconnected),
            (Events.MT5_CONNECTED,        self._on_reconnected),
            (Events.MT5_RECONNECT_FAILED, self._on_reconnect_failed),
            (Events.CRITICAL_ERROR,       self._on_critical_error),
            (Events.ERROR,                self._on_error),
        ]
        for event_name, handler in subscriptions:
            bus.subscribe(event_name, handler)

    # ------------------------------------------------------------------
    # Event handlers — build message text, enqueue, return immediately
    # ------------------------------------------------------------------

    def _on_bot_started(self, event: Event) -> None:
        p = event.payload
        account = p.get("account", {})
        balance = account.get("balance", "?")
        currency = account.get("currency", "USD")
        text = (
            f"🟢 *Bot Started*\n"
            f"Time: {_escape_mdv2(_now_utc_str())}\n"
            f"Balance: {_escape_mdv2(str(balance))} {_escape_mdv2(currency)}\n"
            f"Mode: {_escape_mdv2(p.get('mode', 'DEMO'))}"
        )
        self._enqueue(text)

    def _on_bot_stopped(self, event: Event) -> None:
        p = event.payload
        text = (
            f"🔴 *Bot Stopped*\n"
            f"Time: {_escape_mdv2(_now_utc_str())}\n"
            f"Reason: {_escape_mdv2(p.get('reason', 'manual'))}"
        )
        self._enqueue(text)

    def _on_bot_paused(self, event: Event) -> None:
        text = (
            f"⏸ *Bot Paused*\n"
            f"Time: {_escape_mdv2(_now_utc_str())}\n"
            f"Reason: {_escape_mdv2(event.payload.get('reason', ''))}"
        )
        self._enqueue(text)

    def _on_kill_switch(self, event: Event) -> None:
        p = event.payload
        text = (
            f"🚨 *KILL SWITCH TRIGGERED*\n"
            f"Time: {_escape_mdv2(_now_utc_str())}\n"
            f"Reason: {_escape_mdv2(p.get('reason', 'unknown'))}\n"
            f"All trading halted\\. Manual review required\\."
        )
        self._enqueue(text)

    def _on_trade_opened(self, event: Event) -> None:
        p = event.payload
        symbol = _escape_mdv2(str(p.get("symbol", "?")))
        side = _escape_mdv2(str(p.get("side", "?")))
        ticket = _escape_mdv2(str(p.get("ticket", "?")))
        price = _escape_mdv2(f"{p.get('price', 0):.5f}")
        volume = _escape_mdv2(f"{p.get('volume', 0):.2f}")
        sl = _escape_mdv2(f"{p.get('sl', 0):.5f}")
        tp = _escape_mdv2(f"{p.get('tp', 0):.5f}")
        text = (
            f"📈 *Trade Opened* \\| {symbol} {side}\n"
            f"Ticket: `{ticket}`\n"
            f"Price: `{price}` | Lots: `{volume}`\n"
            f"SL: `{sl}` | TP: `{tp}`\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )
        self._enqueue(text)

    def _on_trade_closed(self, event: Event) -> None:
        p = event.payload
        symbol = _escape_mdv2(str(p.get("symbol", "?")))
        ticket = _escape_mdv2(str(p.get("ticket", "?")))
        price = _escape_mdv2(f"{p.get('price', 0):.5f}")
        profit = p.get("profit", 0)
        profit_str = _escape_mdv2(f"{profit:+.2f}")
        emoji = "💰" if profit >= 0 else "📉"
        full = "Full" if p.get("full_close", True) else "Partial"
        text = (
            f"{emoji} *Trade Closed* \\({full}\\) \\| {symbol}\n"
            f"Ticket: `{ticket}`\n"
            f"Close Price: `{price}`\n"
            f"Profit: `{profit_str}` USD\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )
        self._enqueue(text)

    def _on_trade_rejected(self, event: Event) -> None:
        p = event.payload
        symbol = _escape_mdv2(str(p.get("symbol", "?")))
        reason = _escape_mdv2(str(p.get("reason", "unknown")))
        text = (
            f"⚠️ *Trade Rejected* \\| {symbol}\n"
            f"Reason: {reason}\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )
        self._enqueue(text)

    def _on_sl_hit(self, event: Event) -> None:
        p = event.payload
        symbol = _escape_mdv2(str(p.get("symbol", "?")))
        ticket = _escape_mdv2(str(p.get("ticket", "?")))
        price = _escape_mdv2(f"{p.get('price', 0):.5f}")
        loss = p.get("profit", 0)
        loss_str = _escape_mdv2(f"{loss:+.2f}")
        text = (
            f"🛑 *Stop Loss Hit* \\| {symbol}\n"
            f"Ticket: `{ticket}`\n"
            f"SL Price: `{price}`\n"
            f"P&L: `{loss_str}` USD\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )
        self._enqueue(text)

    def _on_tp_hit(self, event: Event) -> None:
        p = event.payload
        symbol = _escape_mdv2(str(p.get("symbol", "?")))
        ticket = _escape_mdv2(str(p.get("ticket", "?")))
        price = _escape_mdv2(f"{p.get('price', 0):.5f}")
        profit = p.get("profit", 0)
        profit_str = _escape_mdv2(f"{profit:+.2f}")
        text = (
            f"🎯 *Take Profit Hit* \\| {symbol}\n"
            f"Ticket: `{ticket}`\n"
            f"TP Price: `{price}`\n"
            f"Profit: `{profit_str}` USD\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )
        self._enqueue(text)

    def _on_daily_loss_limit(self, event: Event) -> None:
        p = event.payload
        daily_loss_pct = _escape_mdv2(f"{p.get('daily_loss_pct', 0):.2f}")
        limit_pct = _escape_mdv2(f"{p.get('limit_pct', 0):.2f}")
        text = (
            f"⛔ *Daily Loss Limit Reached*\n"
            f"Loss: `{daily_loss_pct}%` \\(limit: `{limit_pct}%`\\)\n"
            f"No new trades until next trading day\\.\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )
        self._enqueue(text)

    def _on_drawdown_limit(self, event: Event) -> None:
        p = event.payload
        dd_pct = _escape_mdv2(f"{p.get('drawdown_pct', 0):.2f}")
        limit_pct = _escape_mdv2(f"{p.get('limit_pct', 0):.2f}")
        text = (
            f"🚨 *MAX DRAWDOWN EXCEEDED*\n"
            f"Drawdown: `{dd_pct}%` \\(limit: `{limit_pct}%`\\)\n"
            f"Bot has been STOPPED\\. Manual review required\\.\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )
        self._enqueue(text)

    def _on_drawdown_warning(self, event: Event) -> None:
        p = event.payload
        dd_pct = _escape_mdv2(f"{p.get('drawdown_pct', 0):.2f}")
        limit_pct = _escape_mdv2(f"{p.get('limit_pct', 0):.2f}")
        text = (
            f"⚠️ *Drawdown Warning*\n"
            f"Current drawdown: `{dd_pct}%` \\(limit: `{limit_pct}%`\\)\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )
        self._enqueue(text)

    def _on_disconnected(self, event: Event) -> None:
        text = (
            f"📡 *MT5 Disconnected*\n"
            f"Attempting to reconnect\\.\\.\\.\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )
        self._enqueue(text)

    def _on_reconnected(self, event: Event) -> None:
        text = (
            f"✅ *MT5 Reconnected*\n"
            f"Trading resumed\\.\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )
        self._enqueue(text)

    def _on_reconnect_failed(self, event: Event) -> None:
        p = event.payload
        reason = _escape_mdv2(str(p.get("reason", "unknown")))
        text = (
            f"🔴 *MT5 Reconnect Failed*\n"
            f"Reason: {reason}\n"
            f"Manual intervention may be required\\.\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )
        self._enqueue(text)

    def _on_critical_error(self, event: Event) -> None:
        message = _escape_mdv2(str(event.payload.get("message", "Unknown critical error")))
        text = (
            f"💥 *CRITICAL ERROR*\n"
            f"{message}\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )
        self._enqueue(text)

    def _on_error(self, event: Event) -> None:
        # Regular errors are NOT forwarded to Telegram by default — they
        # would create too much noise. Only CRITICAL_ERROR triggers a
        # notification. Callers that want a specific error Telegammed
        # should publish CRITICAL_ERROR instead of ERROR.
        pass

    # ------------------------------------------------------------------
    # Send a message directly (bypassing the queue) — for testing or
    # urgent out-of-band messages from external callers like the API layer.
    # ------------------------------------------------------------------
    def send_message(self, text: str, parse_mode: str = "MarkdownV2") -> bool:
        """
        Enqueues a message for sending. Returns True if queued, False if
        disabled or queue full. The message is sent asynchronously; this
        method returns immediately.
        """
        if not self._enabled:
            return False
        return self._enqueue(text, parse_mode=parse_mode)

    def send_message_sync(self, text: str, parse_mode: str = "MarkdownV2") -> bool:
        """
        Sends a message synchronously (blocking). Used by the API layer
        for /test-notification endpoints where immediate confirmation is
        needed. Returns True on success.
        """
        if not self._enabled:
            logger.warning("send_message_sync called but Telegram is not configured.")
            return False
        return self._send_now(_OutboundMessage(text=text, parse_mode=parse_mode))

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------
    def _enqueue(self, text: str, parse_mode: str = "MarkdownV2") -> bool:
        if not self._enabled:
            return False
        msg = _OutboundMessage(text=text, parse_mode=parse_mode)
        try:
            self._queue.put_nowait(msg)
            return True
        except queue.Full:
            logger.warning("Telegram send queue full — dropping message.")
            return False

    def _sender_loop(self) -> None:
        while not self._stop_event.is_set():
            try:
                msg = self._queue.get(timeout=1.0)
            except queue.Empty:
                continue
            try:
                self._send_now(msg)
            except Exception:
                logger.exception("Unexpected error in Telegram sender loop.")
            finally:
                self._queue.task_done()

    def _send_now(self, msg: _OutboundMessage) -> bool:
        """
        Performs the actual HTTP POST to the Telegram Bot API with
        exponential backoff retry. Returns True on success, False after
        exhausting all retries. Never raises — a failed Telegram send
        must not crash the sender thread.
        """
        import httpx  # imported here so the module loads even if httpx isn't installed
        from core.circuit_breaker import CircuitOpenError, telegram_circuit

        payload = {
            "chat_id": self._chat_id,
            "text": msg.text,
            "parse_mode": msg.parse_mode,
        }

        for attempt in range(1, _MAX_SEND_RETRIES + 1):
            try:
                response = telegram_circuit.execute(
                    httpx.post, self._api_url, json=payload, timeout=_REQUEST_TIMEOUT,
                )
                if response.status_code == 200:
                    return True

                if response.status_code == 429:
                    # Rate-limited — Telegram tells us how long to wait.
                    retry_after = response.json().get("parameters", {}).get("retry_after", 5)
                    logger.warning(
                        "Telegram rate-limited. Waiting %ds before retry.", retry_after
                    )
                    time.sleep(retry_after)
                    continue

                logger.error(
                    "Telegram API error (attempt %d/%d): HTTP %d — %s",
                    attempt, _MAX_SEND_RETRIES, response.status_code, response.text[:200],
                )
                # Non-429 HTTP errors: back off and retry (server errors
                # are often transient; 400 Bad Request is not, but we
                # still retry up to MAX_SEND_RETRIES since the message
                # may have been escaped incorrectly and we want the log
                # to capture the full retry sequence).
                time.sleep(2 ** attempt)

            except CircuitOpenError as exc:
                logger.warning(
                    "Telegram circuit breaker is OPEN — skipping send without retry. %s", exc
                )
                return False
            except httpx.TimeoutException:
                logger.warning("Telegram send timed out (attempt %d/%d).", attempt, _MAX_SEND_RETRIES)
                time.sleep(2 ** attempt)
            except httpx.RequestError as exc:
                logger.error("Telegram send network error (attempt %d/%d): %s", attempt, _MAX_SEND_RETRIES, exc)
                time.sleep(2 ** attempt)
            except Exception as exc:
                logger.exception("Unexpected error sending Telegram message (attempt %d/%d).", attempt, _MAX_SEND_RETRIES)
                break

        logger.error("Telegram message could not be delivered after %d attempts.", _MAX_SEND_RETRIES)
        return False


# Single shared instance for the whole process.
telegram_service = TelegramService()

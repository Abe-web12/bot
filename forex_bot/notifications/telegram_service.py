"""
telegram_service.py
====================

Real Telegram Bot API integration. Subscribes to the event bus and sends
formatted notifications for significant trading and system events.

Design decisions:
    - Uses httpx rather than python-telegram-bot because this service only needs
      Telegram's sendMessage endpoint.
    - All routine sends happen on a background thread through a bounded queue.
      A slow or unavailable Telegram API therefore never blocks trading logic or
      synchronous EventBus publishers.
    - Retries transient failures with exponential backoff.
    - Honors Telegram's retry_after value when rate-limited.
    - Uses the existing Telegram circuit breaker.
    - Missing TELEGRAM_TOKEN or TELEGRAM_CHAT_ID disables notifications without
      stopping the trading bot.
    - Uses MarkdownV2 with proper escaping.
    - AutonomousTradingEngine decisions are delivered through the existing
      EventBus and notification queue, preserving the repository's established
      event-driven architecture.
"""

from __future__ import annotations

import logging
import queue
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Optional

import config
from core.event_bus import Event, Events, bus

logger = logging.getLogger("telegram_service")

_TELEGRAM_API_BASE = "https://api.telegram.org/bot{token}/sendMessage"
_MAX_SEND_RETRIES = 3
_SEND_QUEUE_MAX = 200
_REQUEST_TIMEOUT = 10.0

# Characters that must be escaped in Telegram MarkdownV2.
_MDV2_ESCAPE_CHARS = r"\_*[]()~`>#+-=|{}.!"


def _escape_mdv2(text: Any) -> str:
    """Escape special characters for Telegram MarkdownV2."""

    escaped = str(text)

    for character in _MDV2_ESCAPE_CHARS:
        escaped = escaped.replace(character, f"\\{character}")

    return escaped


def _now_utc_str() -> str:
    """Return the current UTC timestamp in a human-readable format."""

    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")


def _format_optional_number(
    value: Any,
    decimal_places: int,
    suffix: str = "",
) -> str:
    """
    Format an optional numeric value for Telegram.

    Missing or invalid values are rendered as N/A instead of raising from an
    EventBus handler.
    """

    if value is None:
        return "N/A"

    try:
        formatted = f"{float(value):.{decimal_places}f}{suffix}"
    except (TypeError, ValueError, OverflowError):
        return "N/A"

    return _escape_mdv2(formatted)


@dataclass
class _OutboundMessage:
    """A queued Telegram message awaiting delivery."""

    text: str
    parse_mode: str = "MarkdownV2"
    enqueued_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class TelegramService:
    """
    Subscribes to the process EventBus and forwards significant events to a
    configured Telegram chat.

    The service is disabled gracefully when credentials are unavailable.
    Event handlers only format and enqueue messages. Actual HTTP delivery runs
    on the dedicated telegram-sender background thread.
    """

    def __init__(self) -> None:
        self._token = config.TELEGRAM_TOKEN
        self._chat_id = config.TELEGRAM_CHAT_ID
        self._enabled = bool(self._token and self._chat_id)

        if not self._enabled:
            logger.warning(
                "TelegramService: TELEGRAM_TOKEN or TELEGRAM_CHAT_ID is not "
                "configured. Telegram notifications are disabled; the bot "
                "will continue operating."
            )

        self._queue: queue.Queue[_OutboundMessage] = queue.Queue(
            maxsize=_SEND_QUEUE_MAX
        )
        self._stop_event = threading.Event()
        self._sender_thread: Optional[threading.Thread] = None
        self._subscriptions_registered = False

        self._api_url = (
            _TELEGRAM_API_BASE.format(token=self._token)
            if self._token
            else ""
        )

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def start(self) -> None:
        """
        Start the Telegram sender thread and register EventBus subscriptions.

        Calling start more than once is safe.
        """

        if not self._enabled:
            return

        if self._sender_thread and self._sender_thread.is_alive():
            logger.warning(
                "TelegramService sender thread is already running."
            )
            return

        self._subscribe_to_events()
        self._stop_event.clear()

        self._sender_thread = threading.Thread(
            target=self._sender_loop,
            name="telegram-sender",
            daemon=True,
        )
        self._sender_thread.start()

        logger.info(
            "TelegramService started (chat_id=%s).",
            self._chat_id,
        )

    def stop(self, timeout_seconds: float = 5.0) -> None:
        """
        Stop the sender thread gracefully.

        Messages already being sent are allowed to finish. Remaining queued
        messages may be discarded after the timeout because Telegram delivery
        must never block process shutdown indefinitely.
        """

        self._stop_event.set()

        if self._sender_thread and self._sender_thread.is_alive():
            self._sender_thread.join(timeout=timeout_seconds)

            if self._sender_thread.is_alive():
                logger.warning(
                    "Telegram sender thread did not stop within %.1f seconds.",
                    timeout_seconds,
                )

        logger.info(
            "TelegramService stopped (remaining_queue_depth=%d).",
            self._queue.qsize(),
        )

    def is_enabled(self) -> bool:
        """Return whether Telegram credentials are configured."""

        return self._enabled

    def is_running(self) -> bool:
        """Return whether the sender thread is active."""

        return bool(
            self._sender_thread
            and self._sender_thread.is_alive()
        )

    # ------------------------------------------------------------------
    # EventBus integration
    # ------------------------------------------------------------------

    def _subscribe_to_events(self) -> None:
        """
        Register all Telegram EventBus handlers exactly once.

        EventBus subscriptions are process-global, so registering repeatedly
        would cause duplicate Telegram messages after a service restart.
        """

        if self._subscriptions_registered:
            return

        subscriptions = [
            (Events.BOT_STARTED, self._on_bot_started),
            (Events.BOT_STOPPED, self._on_bot_stopped),
            (Events.BOT_PAUSED, self._on_bot_paused),
            (Events.KILL_SWITCH_TRIGGERED, self._on_kill_switch),
            (Events.TRADE_OPENED, self._on_trade_opened),
            (Events.TRADE_CLOSED, self._on_trade_closed),
            (Events.TRADE_REJECTED, self._on_trade_rejected),
            (Events.SL_HIT, self._on_sl_hit),
            (Events.TP_HIT, self._on_tp_hit),
            (
                Events.DAILY_LOSS_LIMIT_HIT,
                self._on_daily_loss_limit,
            ),
            (
                Events.DRAWDOWN_LIMIT_HIT,
                self._on_drawdown_limit,
            ),
            (
                Events.DRAWDOWN_WARNING,
                self._on_drawdown_warning,
            ),
            (Events.MT5_DISCONNECTED, self._on_disconnected),
            (Events.MT5_CONNECTED, self._on_reconnected),
            (
                Events.MT5_RECONNECT_FAILED,
                self._on_reconnect_failed,
            ),
            (Events.CRITICAL_ERROR, self._on_critical_error),
            (Events.ERROR, self._on_error),
            (
                Events.AUTONOMOUS_DECISION_EVENT,
                self._handle_autonomous_decision,
            ),
        ]

        for event_name, handler in subscriptions:
            bus.subscribe(event_name, handler)

        self._subscriptions_registered = True

        logger.debug(
            "TelegramService registered %d EventBus subscriptions.",
            len(subscriptions),
        )

    # ------------------------------------------------------------------
    # Bot lifecycle handlers
    # ------------------------------------------------------------------

    def _on_bot_started(self, event: Event) -> None:
        payload = event.payload
        account = payload.get("account", {})

        balance = account.get("balance", "?")
        currency = account.get("currency", "USD")
        mode = payload.get("mode", "DEMO")

        text = (
            "🟢 *Bot Started*\n"
            f"Time: {_escape_mdv2(_now_utc_str())}\n"
            f"Balance: {_escape_mdv2(balance)} "
            f"{_escape_mdv2(currency)}\n"
            f"Mode: {_escape_mdv2(mode)}"
        )

        self._enqueue(text)

    def _on_bot_stopped(self, event: Event) -> None:
        reason = event.payload.get("reason", "manual")

        text = (
            "🔴 *Bot Stopped*\n"
            f"Time: {_escape_mdv2(_now_utc_str())}\n"
            f"Reason: {_escape_mdv2(reason)}"
        )

        self._enqueue(text)

    def _on_bot_paused(self, event: Event) -> None:
        reason = event.payload.get("reason", "")

        text = (
            "⏸ *Bot Paused*\n"
            f"Time: {_escape_mdv2(_now_utc_str())}\n"
            f"Reason: {_escape_mdv2(reason)}"
        )

        self._enqueue(text)

    def _on_kill_switch(self, event: Event) -> None:
        reason = event.payload.get("reason", "unknown")

        text = (
            "🚨 *KILL SWITCH TRIGGERED*\n"
            f"Time: {_escape_mdv2(_now_utc_str())}\n"
            f"Reason: {_escape_mdv2(reason)}\n"
            "All trading halted\\. Manual review required\\."
        )

        self._enqueue(text)

    # ------------------------------------------------------------------
    # AutonomousTradingEngine decision handler
    # ------------------------------------------------------------------

    def _handle_autonomous_decision(self, event: Event) -> None:
        """
        Format and enqueue an AutonomousTradingEngine authorization decision.

        Expected payload from AutonomousDecision.as_event_payload():

            {
                "outcome": "ALLOW" | "REJECT",
                "allowed": bool,
                "symbol": str,
                "direction": "BUY" | "SELL" | "HOLD",
                "confidence": float,
                "reason": str,
                "indicators": {
                    "rsi": float | None,
                    "atr": float | None,
                    "atr_percent": float | None,
                    "adx": float | None,
                    "plus_di": float | None,
                    "minus_di": float | None
                }
            }

        Malformed or incomplete payloads are tolerated. Notification formatting
        must never raise back into the synchronous EventBus publisher.
        """

        try:
            payload = event.payload or {}
            indicators = payload.get("indicators") or {}

            allowed = bool(payload.get("allowed", False))
            outcome = str(
                payload.get(
                    "outcome",
                    "ALLOW" if allowed else "REJECT",
                )
            ).upper()

            symbol = payload.get("symbol", "?")
            direction = payload.get("direction", "?")
            reason = payload.get(
                "reason",
                "No decision reason supplied.",
            )
            confidence = payload.get("confidence")

            rsi_value = indicators.get(
                "rsi",
                payload.get("rsi_value"),
            )
            atr_percent = indicators.get(
                "atr_percent",
                payload.get("atr_percent"),
            )
            adx_value = indicators.get(
                "adx",
                payload.get("adx_value"),
            )

            if allowed or outcome == "ALLOW":
                emoji = "✅"
                heading = "Autonomous Trade Authorized"
                status = "ALLOW"
            else:
                emoji = "⛔"
                heading = "Autonomous Trade Rejected"
                status = "REJECT"

            confidence_text = _format_optional_number(
                confidence,
                decimal_places=1,
                suffix="%",
            )
            rsi_text = _format_optional_number(
                rsi_value,
                decimal_places=2,
            )
            atr_percent_text = _format_optional_number(
                atr_percent,
                decimal_places=4,
                suffix="%",
            )
            adx_text = _format_optional_number(
                adx_value,
                decimal_places=2,
            )

            text = (
                f"{emoji} *{heading}*\n"
                f"Status: `{_escape_mdv2(status)}`\n"
                f"Symbol: `{_escape_mdv2(symbol)}`\n"
                f"Direction: `{_escape_mdv2(direction)}`\n"
                f"Confidence: `{confidence_text}`\n"
                f"Reason: {_escape_mdv2(reason)}\n"
                "\n"
                "*Market Indicators*\n"
                f"RSI: `{rsi_text}`\n"
                f"ATR%: `{atr_percent_text}`\n"
                f"ADX: `{adx_text}`\n"
                f"Time: {_escape_mdv2(_now_utc_str())}"
            )

            self._enqueue(text)

        except Exception:
            logger.exception(
                "Failed to format AUTONOMOUS_DECISION_EVENT payload."
            )

    # ------------------------------------------------------------------
    # Trade handlers
    # ------------------------------------------------------------------

    def _on_trade_opened(self, event: Event) -> None:
        payload = event.payload

        symbol = _escape_mdv2(payload.get("symbol", "?"))
        side = _escape_mdv2(payload.get("side", "?"))
        ticket = _escape_mdv2(payload.get("ticket", "?"))

        price = _format_optional_number(
            payload.get("price", 0),
            decimal_places=5,
        )
        volume = _format_optional_number(
            payload.get("volume", 0),
            decimal_places=2,
        )
        stop_loss = _format_optional_number(
            payload.get("sl", 0),
            decimal_places=5,
        )
        take_profit = _format_optional_number(
            payload.get("tp", 0),
            decimal_places=5,
        )

        text = (
            f"📈 *Trade Opened* \\| {symbol} {side}\n"
            f"Ticket: `{ticket}`\n"
            f"Price: `{price}` \\| Lots: `{volume}`\n"
            f"SL: `{stop_loss}` \\| TP: `{take_profit}`\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )

        self._enqueue(text)

    def _on_trade_closed(self, event: Event) -> None:
        payload = event.payload

        symbol = _escape_mdv2(payload.get("symbol", "?"))
        ticket = _escape_mdv2(payload.get("ticket", "?"))
        price = _format_optional_number(
            payload.get("price", 0),
            decimal_places=5,
        )

        try:
            profit = float(payload.get("profit", 0))
        except (TypeError, ValueError, OverflowError):
            profit = 0.0

        profit_text = _escape_mdv2(f"{profit:+.2f}")
        emoji = "💰" if profit >= 0 else "📉"

        full_close = bool(payload.get("full_close", True))
        close_type = "Full" if full_close else "Partial"

        text = (
            f"{emoji} *Trade Closed* "
            f"\\({_escape_mdv2(close_type)}\\) \\| {symbol}\n"
            f"Ticket: `{ticket}`\n"
            f"Close Price: `{price}`\n"
            f"Profit: `{profit_text}` USD\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )

        self._enqueue(text)

    def _on_trade_rejected(self, event: Event) -> None:
        payload = event.payload

        symbol = _escape_mdv2(payload.get("symbol", "?"))
        reason = _escape_mdv2(payload.get("reason", "unknown"))

        text = (
            f"⚠️ *Trade Rejected* \\| {symbol}\n"
            f"Reason: {reason}\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )

        self._enqueue(text)

    def _on_sl_hit(self, event: Event) -> None:
        payload = event.payload

        symbol = _escape_mdv2(payload.get("symbol", "?"))
        ticket = _escape_mdv2(payload.get("ticket", "?"))

        price = _format_optional_number(
            payload.get("price", 0),
            decimal_places=5,
        )

        try:
            profit = float(payload.get("profit", 0))
        except (TypeError, ValueError, OverflowError):
            profit = 0.0

        profit_text = _escape_mdv2(f"{profit:+.2f}")

        text = (
            f"🛑 *Stop Loss Hit* \\| {symbol}\n"
            f"Ticket: `{ticket}`\n"
            f"SL Price: `{price}`\n"
            f"P\\&L: `{profit_text}` USD\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )

        self._enqueue(text)

    def _on_tp_hit(self, event: Event) -> None:
        payload = event.payload

        symbol = _escape_mdv2(payload.get("symbol", "?"))
        ticket = _escape_mdv2(payload.get("ticket", "?"))

        price = _format_optional_number(
            payload.get("price", 0),
            decimal_places=5,
        )

        try:
            profit = float(payload.get("profit", 0))
        except (TypeError, ValueError, OverflowError):
            profit = 0.0

        profit_text = _escape_mdv2(f"{profit:+.2f}")

        text = (
            f"🎯 *Take Profit Hit* \\| {symbol}\n"
            f"Ticket: `{ticket}`\n"
            f"TP Price: `{price}`\n"
            f"Profit: `{profit_text}` USD\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )

        self._enqueue(text)

    # ------------------------------------------------------------------
    # Risk handlers
    # ------------------------------------------------------------------

    def _on_daily_loss_limit(self, event: Event) -> None:
        payload = event.payload

        daily_loss_pct = _format_optional_number(
            payload.get("daily_loss_pct", 0),
            decimal_places=2,
        )
        limit_pct = _format_optional_number(
            payload.get("limit_pct", 0),
            decimal_places=2,
        )

        text = (
            "⛔ *Daily Loss Limit Reached*\n"
            f"Loss: `{daily_loss_pct}%` "
            f"\\(limit: `{limit_pct}%`\\)\n"
            "No new trades until the next trading day\\.\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )

        self._enqueue(text)

    def _on_drawdown_limit(self, event: Event) -> None:
        payload = event.payload

        drawdown_pct = _format_optional_number(
            payload.get("drawdown_pct", 0),
            decimal_places=2,
        )
        limit_pct = _format_optional_number(
            payload.get("limit_pct", 0),
            decimal_places=2,
        )

        text = (
            "🚨 *MAX DRAWDOWN EXCEEDED*\n"
            f"Drawdown: `{drawdown_pct}%` "
            f"\\(limit: `{limit_pct}%`\\)\n"
            "Bot has been stopped\\. Manual review required\\.\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )

        self._enqueue(text)

    def _on_drawdown_warning(self, event: Event) -> None:
        payload = event.payload

        drawdown_pct = _format_optional_number(
            payload.get("drawdown_pct", 0),
            decimal_places=2,
        )
        limit_pct = _format_optional_number(
            payload.get("limit_pct", 0),
            decimal_places=2,
        )

        text = (
            "⚠️ *Drawdown Warning*\n"
            f"Current drawdown: `{drawdown_pct}%` "
            f"\\(limit: `{limit_pct}%`\\)\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )

        self._enqueue(text)

    # ------------------------------------------------------------------
    # MT5 connection handlers
    # ------------------------------------------------------------------

    def _on_disconnected(self, event: Event) -> None:
        text = (
            "📡 *MT5 Disconnected*\n"
            "Attempting to reconnect\\.\\.\\.\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )

        self._enqueue(text)

    def _on_reconnected(self, event: Event) -> None:
        text = (
            "✅ *MT5 Reconnected*\n"
            "Trading resumed\\.\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )

        self._enqueue(text)

    def _on_reconnect_failed(self, event: Event) -> None:
        reason = _escape_mdv2(
            event.payload.get("reason", "unknown")
        )

        text = (
            "🔴 *MT5 Reconnect Failed*\n"
            f"Reason: {reason}\n"
            "Manual intervention may be required\\.\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )

        self._enqueue(text)

    # ------------------------------------------------------------------
    # Error handlers
    # ------------------------------------------------------------------

    def _on_critical_error(self, event: Event) -> None:
        message = _escape_mdv2(
            event.payload.get(
                "message",
                "Unknown critical error",
            )
        )

        text = (
            "💥 *CRITICAL ERROR*\n"
            f"{message}\n"
            f"Time: {_escape_mdv2(_now_utc_str())}"
        )

        self._enqueue(text)

    def _on_error(self, event: Event) -> None:
        """
        Regular errors are deliberately not forwarded to Telegram.

        Forwarding every noncritical error would create excessive noise. Code
        requiring an operator alert should publish Events.CRITICAL_ERROR or a
        dedicated alert-worthy event.
        """

        return

    # ------------------------------------------------------------------
    # Public direct-message API
    # ------------------------------------------------------------------

    def send_message(
        self,
        text: str,
        parse_mode: str = "MarkdownV2",
    ) -> bool:
        """
        Enqueue a custom message.

        Returns True when queued, or False when Telegram is disabled or the
        bounded queue is full. This method never blocks on network I/O.
        """

        if not self._enabled:
            return False

        return self._enqueue(
            text,
            parse_mode=parse_mode,
        )

    def send_message_sync(
        self,
        text: str,
        parse_mode: str = "MarkdownV2",
    ) -> bool:
        """
        Send a custom message synchronously.

        Intended for startup failures and API test-notification endpoints that
        require an immediate success/failure result.
        """

        if not self._enabled:
            logger.warning(
                "send_message_sync called but Telegram is not configured."
            )
            return False

        return self._send_now(
            _OutboundMessage(
                text=text,
                parse_mode=parse_mode,
            )
        )

    # ------------------------------------------------------------------
    # Queue management
    # ------------------------------------------------------------------

    def _enqueue(
        self,
        text: str,
        parse_mode: str = "MarkdownV2",
    ) -> bool:
        """
        Add a message to the bounded outbound queue without blocking.

        When flooded, the oldest queued message is discarded once to make room
        for the newest event. Recent risk and execution events are generally
        more operationally useful than stale queued messages.
        """

        if not self._enabled:
            return False

        message = _OutboundMessage(
            text=text,
            parse_mode=parse_mode,
        )

        try:
            self._queue.put_nowait(message)
            return True

        except queue.Full:
            logger.warning(
                "Telegram send queue is full; dropping the oldest message."
            )

            try:
                self._queue.get_nowait()
                self._queue.task_done()
            except queue.Empty:
                return False

            try:
                self._queue.put_nowait(message)
                return True
            except queue.Full:
                logger.error(
                    "Telegram send queue remained full after dropping "
                    "the oldest message."
                )
                return False

    def _sender_loop(self) -> None:
        """
        Drain queued messages until stop is requested.

        A failure sending one message is isolated and cannot terminate the
        sender thread.
        """

        while not self._stop_event.is_set():
            try:
                message = self._queue.get(timeout=1.0)
            except queue.Empty:
                continue

            try:
                self._send_now(message)
            except Exception:
                logger.exception(
                    "Unexpected error in Telegram sender loop."
                )
            finally:
                self._queue.task_done()

    # ------------------------------------------------------------------
    # HTTP delivery
    # ------------------------------------------------------------------

    def _send_now(self, message: _OutboundMessage) -> bool:
        """
        Perform the Telegram Bot API request with bounded retries.

        Returns True after confirmed delivery and False after exhausting retry
        attempts. This method never propagates an exception to trading code.
        """

        import httpx

        from core.circuit_breaker import (
            CircuitOpenError,
            telegram_circuit,
        )

        payload = {
            "chat_id": self._chat_id,
            "text": message.text,
            "parse_mode": message.parse_mode,
            "disable_web_page_preview": True,
        }

        for attempt in range(1, _MAX_SEND_RETRIES + 1):
            try:
                response = telegram_circuit.execute(
                    httpx.post,
                    self._api_url,
                    json=payload,
                    timeout=_REQUEST_TIMEOUT,
                )

                if response.status_code == 200:
                    logger.debug(
                        "Telegram message delivered "
                        "(queue_latency_ms=%.1f).",
                        (
                            datetime.now(timezone.utc)
                            - message.enqueued_at
                        ).total_seconds()
                        * 1000.0,
                    )
                    return True

                if response.status_code == 429:
                    retry_after = 5

                    try:
                        response_body = response.json()
                        retry_after = int(
                            response_body
                            .get("parameters", {})
                            .get("retry_after", 5)
                        )
                    except (
                        TypeError,
                        ValueError,
                        AttributeError,
                    ):
                        retry_after = 5

                    logger.warning(
                        "Telegram rate-limited the request. "
                        "Waiting %d seconds before retry.",
                        retry_after,
                    )
                    time.sleep(max(1, retry_after))
                    continue

                logger.error(
                    (
                        "Telegram API error on attempt %d/%d: "
                        "HTTP %d, body=%s"
                    ),
                    attempt,
                    _MAX_SEND_RETRIES,
                    response.status_code,
                    response.text[:200],
                )

                # A malformed MarkdownV2 message will not improve on retry, but
                # preserving the existing bounded retry behavior keeps delivery
                # semantics consistent for transient Telegram failures.
                if attempt < _MAX_SEND_RETRIES:
                    time.sleep(2 ** attempt)

            except CircuitOpenError as exc:
                logger.warning(
                    "Telegram circuit breaker is open; skipping send: %s",
                    exc,
                )
                return False

            except httpx.TimeoutException:
                logger.warning(
                    "Telegram send timed out on attempt %d/%d.",
                    attempt,
                    _MAX_SEND_RETRIES,
                )

                if attempt < _MAX_SEND_RETRIES:
                    time.sleep(2 ** attempt)

            except httpx.RequestError as exc:
                logger.error(
                    "Telegram network error on attempt %d/%d: %s",
                    attempt,
                    _MAX_SEND_RETRIES,
                    exc,
                )

                if attempt < _MAX_SEND_RETRIES:
                    time.sleep(2 ** attempt)

            except Exception:
                logger.exception(
                    "Unexpected Telegram delivery error on attempt %d/%d.",
                    attempt,
                    _MAX_SEND_RETRIES,
                )
                break

        logger.error(
            "Telegram message could not be delivered after %d attempts.",
            _MAX_SEND_RETRIES,
        )
        return False


# Single shared instance for the complete bot process.
telegram_service = TelegramService()
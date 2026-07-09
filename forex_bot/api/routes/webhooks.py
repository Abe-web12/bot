"""
webhooks.py
============
Real webhook endpoints for TradingView alerts and Make.com automation.

Security model (applies to both endpoints):
  1. HMAC-SHA256 signature verification using config.WEBHOOK_SECRET.
     Signature = HMAC-SHA256(secret, raw_request_body), sent in the
     X-Webhook-Signature header, hex-encoded.
  2. Replay protection: the payload must include a "timestamp" (unix
     seconds). Requests older than config.WEBHOOK_REPLAY_WINDOW_SECONDS
     are rejected.
  3. Duplicate protection: every payload should include a unique "id"
     (or one is derived from a hash of the body) — IdempotencyRepository
     rejects a second delivery of the same id.
  4. Rate limiting: per-source-IP token bucket
     (config.WEBHOOK_RATE_LIMIT_PER_MINUTE).

TradingView webhooks do NOT execute trades directly. A verified,
non-duplicate TradingView alert triggers signal_orchestrator to
re-evaluate the named symbol through the exact same Signal Generator ->
Scorer -> Risk -> Persistent Queue chain the scheduled loop uses,
keeping the deterministic strategy as the sole trade decision-maker.

Make.com webhooks handle inbound control commands (pause/resume/status)
— never direct trade placement, for the same reason.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import logging
import time
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

import config
from core.rate_limiter import RateLimiter

logger = logging.getLogger("api.webhooks")

webhooks_bp = Blueprint("webhooks", __name__, url_prefix="/webhooks")

_rate_limiter = RateLimiter(max_per_minute=config.WEBHOOK_RATE_LIMIT_PER_MINUTE)


class WebhookRejected(Exception):
    def __init__(self, message: str, status: int = 400) -> None:
        super().__init__(message)
        self.status = status


def _client_ip() -> str:
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or "unknown"


def _verify_hmac(raw_body: bytes, signature_header: str) -> None:
    if not config.WEBHOOK_SECRET:
        raise WebhookRejected("Webhook secret is not configured on the server.", status=503)
    if not signature_header:
        raise WebhookRejected("Missing X-Webhook-Signature header.", status=401)

    expected = hmac.new(
        config.WEBHOOK_SECRET.encode("utf-8"), raw_body, hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, signature_header.strip()):
        raise WebhookRejected("Invalid signature.", status=401)


def _verify_replay_window(payload: dict) -> None:
    ts = payload.get("timestamp")
    if ts is None:
        raise WebhookRejected("Payload missing 'timestamp' field (required for replay protection).")
    try:
        ts = float(ts)
    except (TypeError, ValueError):
        raise WebhookRejected("'timestamp' must be a numeric unix timestamp.")

    age = time.time() - ts
    if age < 0:
        raise WebhookRejected("Payload timestamp is in the future.")
    if age > config.WEBHOOK_REPLAY_WINDOW_SECONDS:
        raise WebhookRejected(
            f"Payload timestamp is {age:.0f}s old, exceeds replay window "
            f"of {config.WEBHOOK_REPLAY_WINDOW_SECONDS}s."
        )


def _derive_idempotency_key(source: str, raw_body: bytes, payload: dict) -> str:
    explicit_id = payload.get("id") or payload.get("alert_id")
    if explicit_id:
        return f"webhook:{source}:{explicit_id}"
    digest = hashlib.sha256(raw_body).hexdigest()[:32]
    return f"webhook:{source}:{digest}"


def _claim_idempotency(key: str) -> bool:
    from database.connection import unit_of_work
    from database.repositories import IdempotencyRepository

    with unit_of_work() as session:
        return IdempotencyRepository(session).try_acquire(
            key=key, operation="webhook", expires_at=None,
        )


def _rate_limit_or_raise() -> None:
    ip = _client_ip()
    if not _rate_limiter.allow(ip):
        raise WebhookRejected(f"Rate limit exceeded for {ip}.", status=429)


def _process_webhook(source: str):
    """Shared verification pipeline. Returns (payload, idempotency_key) on
    success, raises WebhookRejected on any failure."""
    _rate_limit_or_raise()

    raw_body = request.get_data()
    signature = request.headers.get("X-Webhook-Signature", "")
    _verify_hmac(raw_body, signature)

    try:
        payload = json.loads(raw_body)
    except json.JSONDecodeError:
        raise WebhookRejected("Request body is not valid JSON.")

    if not isinstance(payload, dict):
        raise WebhookRejected("Request body must be a JSON object.")

    _verify_replay_window(payload)

    idem_key = _derive_idempotency_key(source, raw_body, payload)
    claimed = _claim_idempotency(idem_key)
    if not claimed:
        raise WebhookRejected("Duplicate request (already processed).", status=409)

    return payload, idem_key


def _mark_webhook_result(idem_key: str, success: bool, summary: str) -> None:
    from database.connection import unit_of_work
    from database.repositories import IdempotencyRepository

    with unit_of_work() as session:
        repo = IdempotencyRepository(session)
        if success:
            repo.mark_completed(idem_key, summary)
        else:
            repo.mark_failed(idem_key, summary)


# ---------------------------------------------------------------------------
# TradingView webhook
# ---------------------------------------------------------------------------

@webhooks_bp.post("/tradingview")
def tradingview_webhook():
    """
    Expected payload:
    {"id": "<unique alert id>", "timestamp": 1735689600, "symbol": "EURUSD"}
    Header: X-Webhook-Signature: hex(HMAC-SHA256(WEBHOOK_SECRET, raw_body))
    """
    try:
        payload, idem_key = _process_webhook("tradingview")
    except WebhookRejected as exc:
        logger.warning("TradingView webhook rejected: %s", exc)
        return jsonify({"error": str(exc)}), exc.status

    symbol = payload.get("symbol")
    if not symbol or not isinstance(symbol, str):
        _mark_webhook_result(idem_key, False, "missing symbol")
        return jsonify({"error": "Payload must include 'symbol'."}), 400

    if symbol not in config.SYMBOLS:
        _mark_webhook_result(idem_key, False, f"symbol {symbol} not tracked")
        return jsonify({"error": f"Symbol '{symbol}' is not in the configured trading symbols."}), 422

    try:
        from execution.execution_engine import execution_engine
        from strategy.signal_orchestrator import build_orchestrator

        orchestrator = build_orchestrator(execution_engine)
        orchestrator.evaluate_symbol(symbol)
        _mark_webhook_result(idem_key, True, f"re-evaluated {symbol}")
        logger.info("TradingView webhook triggered re-evaluation of %s.", symbol)
        return jsonify({"status": "accepted", "symbol": symbol, "action": "re-evaluated"}), 200

    except Exception as exc:
        logger.exception("TradingView webhook processing failed for %s.", symbol)
        _mark_webhook_result(idem_key, False, str(exc)[:500])
        return jsonify({"error": "Internal processing error."}), 500


# ---------------------------------------------------------------------------
# Make.com webhook
# ---------------------------------------------------------------------------

_ALLOWED_COMMANDS = {"pause", "resume", "status"}


@webhooks_bp.post("/makecom")
def makecom_webhook():
    """
    Expected payload:
    {"id": "<unique request id>", "timestamp": 1735689600, "command": "pause"}
    Header: X-Webhook-Signature: hex(HMAC-SHA256(WEBHOOK_SECRET, raw_body))
    """
    try:
        payload, idem_key = _process_webhook("makecom")
    except WebhookRejected as exc:
        logger.warning("Make.com webhook rejected: %s", exc)
        return jsonify({"error": str(exc)}), exc.status

    command = str(payload.get("command", "")).lower()
    if command not in _ALLOWED_COMMANDS:
        _mark_webhook_result(idem_key, False, f"invalid command '{command}'")
        return jsonify({"error": f"'command' must be one of {sorted(_ALLOWED_COMMANDS)}."}), 400

    from core.state_manager import BotStatus, state

    try:
        if command == "pause":
            state.set_bot_status(BotStatus.PAUSED, reason="makecom_webhook")
            result = "paused"
        elif command == "resume":
            state.set_bot_status(BotStatus.RUNNING, reason="makecom_webhook")
            result = "resumed"
        else:
            result = state.bot_status.value

        _mark_webhook_result(idem_key, True, result)
        return jsonify({
            "status": "accepted",
            "command": command,
            "result": result,
            "bot_status": state.bot_status.value,
            "connection_status": state.connection_status.value,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }), 200

    except Exception as exc:
        logger.exception("Make.com webhook processing failed for command=%s.", command)
        _mark_webhook_result(idem_key, False, str(exc)[:500])
        return jsonify({"error": "Internal processing error."}), 500

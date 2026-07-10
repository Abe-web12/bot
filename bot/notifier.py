# bot/notifier.py
"""
Async Telegram notifier.

Reads TELEGRAM_TOKEN and TELEGRAM_CHAT_ID from the environment. If either is
missing, every call is a silent no-op (so local/dev runs don't error and the
trading loop never depends on notifications being configured).

Never raises to the caller: a notification failure must not affect trading.
"""

from __future__ import annotations

import logging
import os
from typing import Optional

import httpx

logger = logging.getLogger("bot.notifier")

_TELEGRAM_API = "https://api.telegram.org/bot{token}/sendMessage"

# Simple level -> emoji prefix for at-a-glance severity in the chat.
_LEVEL_PREFIX = {
    "DEBUG": "🔍",
    "INFO": "ℹ️",
    "WARNING": "⚠️",
    "ERROR": "🚨",
    "CRITICAL": "🔥",
}


def _config() -> tuple[Optional[str], Optional[str]]:
    """Return (token, chat_id) from the environment, or (None, None)-ish."""
    token = os.getenv("TELEGRAM_TOKEN") or None
    chat_id = os.getenv("TELEGRAM_CHAT_ID") or None
    return token, chat_id


def is_configured() -> bool:
    """True only if both token and chat id are present."""
    token, chat_id = _config()
    return bool(token and chat_id)


async def notify_async(
    message: str,
    level: str = "INFO",
    *,
    timeout: float = 10.0,
    client: Optional[httpx.AsyncClient] = None,
) -> bool:
    """
    Send a Telegram message. Returns True on success, False on any failure or if
    not configured. Never raises.

    Args:
        message: the text body.
        level:   severity label; controls the emoji prefix.
        timeout: per-request timeout (ignored if a client is supplied).
        client:  optional shared httpx.AsyncClient to reuse a connection pool.
                 If None, a short-lived client is created for this call.
    """
    token, chat_id = _config()
    if not token or not chat_id:
        # Silent no-op when unconfigured.
        logger.debug("Telegram not configured; skipping notify (level=%s).", level)
        return False

    prefix = _LEVEL_PREFIX.get(level.upper(), "")
    text = f"{prefix} *{level.upper()}*\n{message}".strip()

    url = _TELEGRAM_API.format(token=token)
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "Markdown",
        "disable_web_page_preview": True,
    }

    async def _send(c: httpx.AsyncClient) -> bool:
        try:
            resp = await c.post(url, json=payload)
        except httpx.HTTPError as exc:
            logger.warning("Telegram send failed (%s): %s", exc.__class__.__name__, exc)
            return False

        if resp.status_code == 200:
            return True

        # Log Telegram's error body (e.g. bad chat_id) without raising.
        body = ""
        try:
            body = resp.text[:300]
        except Exception:
            pass
        logger.warning("Telegram returned %d: %s", resp.status_code, body)
        return False

    try:
        if client is not None:
            return await _send(client)
        async with httpx.AsyncClient(timeout=timeout) as owned:
            return await _send(owned)
    except Exception as exc:  # absolute safety net
        logger.warning("Telegram notify errored (%s): %s", exc.__class__.__name__, exc)
        return False
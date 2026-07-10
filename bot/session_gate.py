"""
Session gating: decide whether trading is currently allowed based on the
enabled SessionWindow rows.

Times are stored as minutes-from-UTC-midnight (0..1439). A window may wrap past
midnight (endMinuteUtc < startMinuteUtc), which means an overnight session such
as 22:00 -> 06:00. This module handles that wrap correctly.

Pure logic + read-only DB access. No side effects, no execution.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional, Sequence

logger = logging.getLogger("bot.session_gate")


@dataclass(frozen=True)
class SessionCheck:
    """Result of a session evaluation."""
    is_trading_allowed: bool
    active_session: Optional[str]      # name of the matched window, if any
    reason: str                        # human-readable explanation for logs


def _minute_of_day_utc(now: datetime) -> int:
    """Convert an aware UTC datetime to minutes since UTC midnight (0..1439)."""
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)
    now = now.astimezone(timezone.utc)
    return now.hour * 60 + now.minute


def _in_window(minute_now: int, start: int, end: int) -> bool:
    """
    True if minute_now falls within [start, end).

    Non-wrapping window (start <= end):   start <= now < end
    Wrapping window   (start >  end):      now >= start OR now < end
      e.g. 22:00 (1320) -> 06:00 (360): active if now>=1320 or now<360.

    Edge case start == end is treated as a full-day (always-on) window.
    """
    if start == end:
        return True
    if start < end:
        return start <= minute_now < end
    # wrap past midnight
    return minute_now >= start or minute_now < end


def evaluate_sessions(
    windows: Sequence[dict],
    now: Optional[datetime] = None,
    symbol: Optional[str] = None,
) -> SessionCheck:
    """
    Evaluate a list of session-window dicts against the current UTC time.

    Each window dict is expected to have:
      sessionName: str
      startMinuteUtc: int
      endMinuteUtc: int
      enabled: bool
      tradingEnabled: bool
      symbols: list[str]   # empty => all symbols

    Rules:
      - Only `enabled` windows are considered.
      - A window matches if `now` is inside it AND (symbols empty OR symbol in symbols).
      - If a matching window has tradingEnabled=False, trading is BLOCKED
        (an explicit no-trade window wins over a permissive one).
      - If any matching window has tradingEnabled=True and none block, allowed.
      - If no window matches, trading is NOT allowed (default-deny).
    """
    now = now or datetime.now(timezone.utc)
    minute_now = _minute_of_day_utc(now)

    matched: list[str] = []
    blocked_by: Optional[str] = None
    allowed_by: Optional[str] = None

    for w in windows:
        if not w.get("enabled", False):
            continue

        syms = w.get("symbols") or []
        if symbol is not None and syms and symbol not in syms:
            continue

        if not _in_window(minute_now, w["startMinuteUtc"], w["endMinuteUtc"]):
            continue

        name = w.get("sessionName", "?")
        matched.append(name)

        if not w.get("tradingEnabled", True):
            blocked_by = name  # explicit block wins
        elif allowed_by is None:
            allowed_by = name

    if blocked_by is not None:
        return SessionCheck(
            is_trading_allowed=False,
            active_session=blocked_by,
            reason=f"Inside no-trade window '{blocked_by}' (tradingEnabled=false)",
        )
    if allowed_by is not None:
        return SessionCheck(
            is_trading_allowed=True,
            active_session=allowed_by,
            reason=f"Inside trading window '{allowed_by}'",
        )
    if matched:
        # matched windows existed but none permitted trading
        return SessionCheck(
            is_trading_allowed=False,
            active_session=matched[0],
            reason=f"Matched window(s) {matched} but none allow trading",
        )
    return SessionCheck(
        is_trading_allowed=False,
        active_session=None,
        reason="No session window matches current UTC time (default-deny)",
    )

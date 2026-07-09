"""
news_filter.py
===============
Economic news calendar filter. Fetches high-impact events from the
ForexFactory JSON feed (free, no API key required) and blocks trading
in the configured window around each event.

Design:
  - Fetches the ForexFactory calendar JSON once per hour (cached in memory).
  - Parses event time, currency, and impact from the feed.
  - is_news_blackout(symbol) returns True if any high-impact event for
    the symbol's currencies falls within NEWS_PAUSE_MINUTES before or
    NEWS_RESUME_MINUTES after the current UTC time.
  - Fails OPEN (returns False) on any fetch/parse error — a broken
    news feed must never silently block trading.
  - config.FILTER_NEWS=False disables the filter entirely.
  - config.HIGH_IMPACT_ONLY=True (default) only blocks on High-impact
    events; False also blocks on Medium-impact events.

Currency mapping: EURUSD -> [EUR, USD], GBPUSD -> [GBP, USD], etc.
"""

from __future__ import annotations

import logging
import threading
import time
from datetime import datetime, timedelta, timezone
from typing import NamedTuple

import config

logger = logging.getLogger("market.news_filter")

_FF_CALENDAR_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json"
_CACHE_TTL_SECONDS = 3600   # refresh once per hour
_FETCH_TIMEOUT_SECONDS = 10


class NewsEvent(NamedTuple):
    title: str
    currency: str       # e.g. "USD", "EUR"
    impact: str         # "High", "Medium", "Low"
    event_time: datetime


class NewsFilter:
    def __init__(self) -> None:
        self._events: list[NewsEvent] = []
        self._last_fetch: float = 0.0
        self._lock = threading.Lock()
        self._fetch_error: str = ""

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def is_news_blackout(self, symbol: str) -> bool:
        """
        Returns True if trading should be paused for this symbol due to
        an upcoming or recent high-impact news event.

        Fails OPEN (returns False) on any error — a broken news feed
        must never silently block trading.
        """
        if not config.FILTER_NEWS:
            return False

        try:
            self._refresh_if_stale()
        except Exception as exc:
            logger.warning(
                "News filter: fetch failed (%s) — failing open (trading allowed).", exc
            )
            return False

        currencies = _symbol_to_currencies(symbol)
        if not currencies:
            return False

        now = datetime.now(timezone.utc)
        pause_before = timedelta(minutes=config.NEWS_PAUSE_MINUTES)
        resume_after = timedelta(minutes=config.NEWS_RESUME_MINUTES)

        with self._lock:
            for event in self._events:
                if event.currency not in currencies:
                    continue
                if config.HIGH_IMPACT_ONLY and event.impact != "High":
                    continue
                window_start = event.event_time - pause_before
                window_end = event.event_time + resume_after
                if window_start <= now <= window_end:
                    logger.info(
                        "News blackout active for %s: '%s' (%s %s) at %s",
                        symbol, event.title, event.currency, event.impact,
                        event.event_time.isoformat(),
                    )
                    return True

        return False

    def next_events(self, symbol: str, limit: int = 5) -> list[dict]:
        """Return the next N upcoming events for the symbol's currencies."""
        try:
            self._refresh_if_stale()
        except Exception:
            return []

        currencies = _symbol_to_currencies(symbol)
        now = datetime.now(timezone.utc)

        with self._lock:
            upcoming = [
                {
                    "title": e.title,
                    "currency": e.currency,
                    "impact": e.impact,
                    "event_time": e.event_time.isoformat(),
                    "minutes_until": round(
                        (e.event_time - now).total_seconds() / 60, 1
                    ),
                }
                for e in self._events
                if e.currency in currencies and e.event_time >= now
            ]

        upcoming.sort(key=lambda x: x["event_time"])
        return upcoming[:limit]

    @property
    def is_configured(self) -> bool:
        if not config.FILTER_NEWS:
            return False
        with self._lock:
            return len(self._events) > 0

    @property
    def last_fetch_error(self) -> str:
        return self._fetch_error

    @property
    def cached_event_count(self) -> int:
        with self._lock:
            return len(self._events)

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    def _refresh_if_stale(self) -> None:
        if time.monotonic() - self._last_fetch < _CACHE_TTL_SECONDS:
            return
        self._fetch_and_parse()

    def _fetch_and_parse(self) -> None:
        try:
            import httpx
            resp = httpx.get(
                _FF_CALENDAR_URL,
                timeout=_FETCH_TIMEOUT_SECONDS,
                follow_redirects=True,
            )
            resp.raise_for_status()
            raw = resp.json()
        except Exception as exc:
            self._fetch_error = str(exc)
            logger.warning("News filter: could not fetch calendar: %s", exc)
            # Back off for another hour rather than hammering a broken endpoint.
            self._last_fetch = time.monotonic()
            return

        events: list[NewsEvent] = []
        for item in raw:
            try:
                impact = item.get("impact", "").strip()
                if impact not in ("High", "Medium", "Low"):
                    continue
                currency = item.get("country", "").strip().upper()
                if not currency:
                    continue
                title = item.get("title", "").strip()
                date_str = item.get("date", "")
                time_str = item.get("time", "")
                if not date_str:
                    continue
                dt = _parse_ff_datetime(date_str, time_str)
                if dt is None:
                    continue
                events.append(NewsEvent(
                    title=title,
                    currency=currency,
                    impact=impact,
                    event_time=dt,
                ))
            except Exception:
                continue

        with self._lock:
            self._events = events
            self._fetch_error = ""
        self._last_fetch = time.monotonic()
        logger.info(
            "News filter: loaded %d events from ForexFactory calendar.", len(events)
        )


def _parse_ff_datetime(date_str: str, time_str: str) -> datetime | None:
    """
    Parse ForexFactory JSON date/time strings into a UTC datetime.
    date_str format: "01-06-2025"  (MM-DD-YYYY)
    time_str format: "8:30am" | "12:00pm" | "All Day" | "Tentative" | ""
    """
    try:
        date_part = datetime.strptime(date_str.strip(), "%m-%d-%Y")
        ts = time_str.strip().lower()
        if not ts or ts in ("all day", "tentative"):
            return date_part.replace(tzinfo=timezone.utc)
        t = datetime.strptime(ts, "%I:%M%p")
        return date_part.replace(
            hour=t.hour, minute=t.minute, second=0, microsecond=0,
            tzinfo=timezone.utc,
        )
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Symbol → currency mapping
# ---------------------------------------------------------------------------

_SYMBOL_CURRENCY_MAP: dict[str, list[str]] = {
    "EURUSD": ["EUR", "USD"],
    "GBPUSD": ["GBP", "USD"],
    "USDJPY": ["USD", "JPY"],
    "USDCHF": ["USD", "CHF"],
    "AUDUSD": ["AUD", "USD"],
    "NZDUSD": ["NZD", "USD"],
    "USDCAD": ["USD", "CAD"],
    "EURGBP": ["EUR", "GBP"],
    "EURJPY": ["EUR", "JPY"],
    "GBPJPY": ["GBP", "JPY"],
    "EURAUD": ["EUR", "AUD"],
    "EURCHF": ["EUR", "CHF"],
    "GBPCHF": ["GBP", "CHF"],
    "AUDJPY": ["AUD", "JPY"],
    "CADJPY": ["CAD", "JPY"],
    "CHFJPY": ["CHF", "JPY"],
    "AUDCAD": ["AUD", "CAD"],
    "AUDCHF": ["AUD", "CHF"],
    "AUDNZD": ["AUD", "NZD"],
    "NZDJPY": ["NZD", "JPY"],
    "NZDCAD": ["NZD", "CAD"],
    "NZDCHF": ["NZD", "CHF"],
    "CADCHF": ["CAD", "CHF"],
    "GBPAUD": ["GBP", "AUD"],
    "GBPCAD": ["GBP", "CAD"],
    "GBPNZD": ["GBP", "NZD"],
    "EURCAD": ["EUR", "CAD"],
    "EURNZD": ["EUR", "NZD"],
}


def _symbol_to_currencies(symbol: str) -> list[str]:
    """Extract the two currency codes from a symbol string."""
    clean = symbol.upper().replace(".", "").replace("_", "")
    if clean in _SYMBOL_CURRENCY_MAP:
        return _SYMBOL_CURRENCY_MAP[clean]
    # Generic fallback: first 3 chars = base, next 3 = quote
    if len(clean) >= 6:
        return [clean[:3], clean[3:6]]
    return []


# Single shared instance.
news_filter = NewsFilter()

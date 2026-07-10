# forex_bot/writer.py
"""
DataWriter: secure-ish HTTP client that streams live MT5 data from the bot into
the Next.js + Prisma dashboard API.

Design goals:
  - One method per domain (trades, positions, signals, account, risk), each
    matching the exact JSON shape the corresponding Zod schema / Route Handler
    expects.
  - Never crash the trading loop. Every call returns a bool (ok/failed); network
    errors are caught, logged, and retried with backoff, never raised to caller.
  - Retries with exponential backoff on transient failures (timeouts, 5xx,
    connection errors). No retry on 4xx (client/validation errors are permanent).
  - A cheap connectivity check so the bot can gate pushes when the dashboard is
    down instead of hammering it.

Payload contracts (mirror the Next.js Zod schemas):
  POST /api/trades          -> CreateTradeSchema
  PUT  /api/positions       -> SyncPositionsSchema  (full open-set reconcile)
  POST /api/positions       -> UpsertPositionSchema (single incremental)
  POST /api/signals         -> CreateSignalSchema
  POST /api/account         -> CreateAccountSnapshotSchema
  POST /api/risk/current    -> CreateRiskSnapshotSchema

Datetimes are sent as ISO-8601 strings (UTC). The API accepts ISO strings and
normalizes them.
"""

from __future__ import annotations

import logging
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Iterable, Optional

import requests
from requests.adapters import HTTPAdapter

try:
    # urllib3 ships with requests; Retry lives here.
    from urllib3.util.retry import Retry
except Exception:  # pragma: no cover - extremely unlikely
    Retry = None  # type: ignore


logger = logging.getLogger("forex_bot.writer")


# ─────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────

@dataclass
class WriterConfig:
    """Connection + behavior configuration for DataWriter."""

    # Base URL of the Next.js app, e.g. "http://localhost:3000" or
    # "https://dashboard.internal". No trailing slash required (stripped anyway).
    base_url: str = "http://localhost:3000"

    # Optional API key. Sent as X-API-Key. No-op until the Next side enforces it.
    api_key: Optional[str] = None

    # Per-request timeout in seconds: (connect_timeout, read_timeout).
    timeout: tuple[float, float] = (3.05, 10.0)

    # Retry policy for transient failures.
    max_retries: int = 3
    backoff_factor: float = 0.5  # sleep = backoff_factor * (2 ** (attempt - 1))

    # Status codes that are worth retrying (transient/server-side).
    retry_statuses: tuple[int, ...] = (408, 429, 500, 502, 503, 504)

    # How long a successful connectivity check is trusted before re-probing.
    health_cache_seconds: float = 5.0

    # Optional health endpoint. If your Next app exposes one, point here; else
    # the writer falls back to a HEAD on base_url.
    health_path: str = "/api/health"

    # Extra static headers if you need them (e.g. behind a proxy).
    extra_headers: dict[str, str] = field(default_factory=dict)


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

def _iso(dt: Optional[datetime]) -> Optional[str]:
    """Serialize a datetime to a UTC ISO-8601 string. None passes through."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat()


def _clean(payload: dict[str, Any]) -> dict[str, Any]:
    """Drop keys whose value is None so optional fields fall back to API defaults."""
    return {k: v for k, v in payload.items() if v is not None}


# ─────────────────────────────────────────────────────────────
# DataWriter
# ─────────────────────────────────────────────────────────────

class DataWriter:
    """
    Thread-safe-ish synchronous client. A single DataWriter instance can be
    shared across the bot; the underlying requests.Session is thread-safe for
    typical use, and we guard the health cache with a lock.
    """

    def __init__(self, config: Optional[WriterConfig] = None) -> None:
        self.config = config or WriterConfig()
        self.base_url = self.config.base_url.rstrip("/")

        self._session = self._build_session()
        self._health_lock = threading.Lock()
        self._last_health_ok: bool = False
        self._last_health_at: float = 0.0

    # ── Session construction ────────────────────────────────

    def _build_session(self) -> requests.Session:
        session = requests.Session()

        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "forex-bot-writer/1.0",
        }
        if self.config.api_key:
            headers["X-API-Key"] = self.config.api_key
        headers.update(self.config.extra_headers)
        session.headers.update(headers)

        # Transport-level retries (connection resets, DNS blips, retryable
        # statuses). Application-level retry loop below handles logging + jitter.
        if Retry is not None:
            retry = Retry(
                total=self.config.max_retries,
                connect=self.config.max_retries,
                read=self.config.max_retries,
                status=self.config.max_retries,
                backoff_factor=self.config.backoff_factor,
                status_forcelist=self.config.retry_statuses,
                allowed_methods=frozenset({"GET", "POST", "PUT", "HEAD"}),
                raise_on_status=False,
            )
            adapter = HTTPAdapter(max_retries=retry, pool_connections=10, pool_maxsize=20)
        else:  # pragma: no cover
            adapter = HTTPAdapter(pool_connections=10, pool_maxsize=20)

        session.mount("http://", adapter)
        session.mount("https://", adapter)
        return session

    # ── Core request with app-level retry/backoff + logging ──

    def _request(
        self,
        method: str,
        path: str,
        json_body: Optional[dict[str, Any]] = None,
    ) -> bool:
        """
        Perform a request. Returns True on 2xx, False otherwise. Never raises.
        Retries transient failures up to max_retries with exponential backoff.
        4xx responses are treated as permanent (no retry) since they indicate a
        payload/validation problem the bot must fix, not wait out.
        """
        url = f"{self.base_url}{path}"
        attempts = self.config.max_retries + 1

        for attempt in range(1, attempts + 1):
            try:
                resp = self._session.request(
                    method,
                    url,
                    json=json_body,
                    timeout=self.config.timeout,
                )
            except requests.RequestException as exc:
                # Connection error, timeout, DNS, etc. -> transient, retry.
                if attempt < attempts:
                    delay = self.config.backoff_factor * (2 ** (attempt - 1))
                    logger.warning(
                        "%s %s failed (%s). Retry %d/%d in %.2fs",
                        method, path, exc.__class__.__name__, attempt, attempts - 1, delay,
                    )
                    time.sleep(delay)
                    continue
                logger.error("%s %s failed permanently after %d attempts: %s",
                             method, path, attempts, exc)
                return False

            # Got an HTTP response.
            if 200 <= resp.status_code < 300:
                return True

            # Permanent client error -> don't retry, log the validation detail.
            if 400 <= resp.status_code < 500 and resp.status_code not in self.config.retry_statuses:
                logger.error(
                    "%s %s rejected (%d): %s",
                    method, path, resp.status_code, _safe_body(resp),
                )
                return False

            # Retryable status (5xx / 408 / 429).
            if attempt < attempts:
                delay = self.config.backoff_factor * (2 ** (attempt - 1))
                logger.warning(
                    "%s %s returned %d. Retry %d/%d in %.2fs",
                    method, path, resp.status_code, attempt, attempts - 1, delay,
                )
                time.sleep(delay)
                continue

            logger.error(
                "%s %s failed after %d attempts (last status %d): %s",
                method, path, attempts, resp.status_code, _safe_body(resp),
            )
            return False

        return False

    # ── Connectivity ────────────────────────────────────────

    def is_online(self, force: bool = False) -> bool:
        """
        Cheap cached connectivity probe. Returns True if the dashboard appears
        reachable. Result is cached for health_cache_seconds to avoid probing on
        every tick. Set force=True to bypass the cache.
        """
        now = time.monotonic()
        with self._health_lock:
            if not force and (now - self._last_health_at) < self.config.health_cache_seconds:
                return self._last_health_ok

        ok = self._probe()
        with self._health_lock:
            self._last_health_ok = ok
            self._last_health_at = time.monotonic()
        return ok

    def _probe(self) -> bool:
        # Try the configured health path first; fall back to HEAD on base.
        for method, path in (("GET", self.config.health_path), ("HEAD", "/")):
            try:
                resp = self._session.request(
                    method, f"{self.base_url}{path}", timeout=self.config.timeout
                )
                if resp.status_code < 500:
                    return True
            except requests.RequestException:
                continue
        logger.warning("Dashboard appears unreachable at %s", self.base_url)
        return False

    # ── Domain methods ──────────────────────────────────────

    def post_trade(
        self,
        *,
        ticket: int,
        symbol: str,
        side: str,                      # "BUY" | "SELL"
        volume: float,
        open_price: float,
        opened_at: datetime,
        close_price: Optional[float] = None,
        stop_loss: Optional[float] = None,
        take_profit: Optional[float] = None,
        commission: Optional[float] = None,
        swap: Optional[float] = None,
        gross_profit: Optional[float] = None,
        net_profit: Optional[float] = None,
        pips: Optional[float] = None,
        strategy: Optional[str] = None,
        magic: Optional[int] = None,
        comment: Optional[str] = None,
        status: str = "CLOSED",         # "OPEN" | "CLOSED"
        closed_at: Optional[datetime] = None,
    ) -> bool:
        """POST a closed (or open) trade. Idempotent on ticket server-side."""
        payload = _clean({
            "ticket": ticket,
            "symbol": symbol,
            "side": side,
            "volume": volume,
            "openPrice": open_price,
            "closePrice": close_price,
            "stopLoss": stop_loss,
            "takeProfit": take_profit,
            "commission": commission,
            "swap": swap,
            "grossProfit": gross_profit,
            "netProfit": net_profit,
            "pips": pips,
            "strategy": strategy,
            "magic": magic,
            "comment": comment,
            "status": status,
            "openedAt": _iso(opened_at),
            "closedAt": _iso(closed_at),
        })
        return self._request("POST", "/api/trades", payload)

    def sync_positions(self, positions: Iterable[dict[str, Any]]) -> bool:
        """
        Full-snapshot reconcile of ALL open positions (PUT). The API upserts
        every ticket present and deletes any that are absent. Pass an iterable
        of dicts; each dict uses the same keys as build_position() output.
        Send an empty list when the account is flat to clear the table.
        """
        body = {"positions": [self._normalize_position(p) for p in positions]}
        return self._request("PUT", "/api/positions", body)

    def upsert_position(self, **kwargs: Any) -> bool:
        """Incremental single-position upsert (POST). See build_position kwargs."""
        return self._request("POST", "/api/positions", self.build_position(**kwargs))

    @staticmethod
    def build_position(
        *,
        ticket: int,
        symbol: str,
        side: str,
        volume: float,
        open_price: float,
        current_price: float,
        opened_at: datetime,
        stop_loss: Optional[float] = None,
        take_profit: Optional[float] = None,
        swap: Optional[float] = None,
        commission: Optional[float] = None,
        unrealized_profit: Optional[float] = None,
    ) -> dict[str, Any]:
        """Build a single position payload dict (for sync_positions / upsert)."""
        return _clean({
            "ticket": ticket,
            "symbol": symbol,
            "side": side,
            "volume": volume,
            "openPrice": open_price,
            "currentPrice": current_price,
            "stopLoss": stop_loss,
            "takeProfit": take_profit,
            "swap": swap,
            "commission": commission,
            "unrealizedProfit": unrealized_profit,
            "openedAt": _iso(opened_at),
        })

    @staticmethod
    def _normalize_position(p: dict[str, Any]) -> dict[str, Any]:
        """
        Accept either already-camelCased payloads (from build_position) or raw
        dicts using build_position kwarg names. If it looks raw, rebuild it.
        """
        if "openPrice" in p or "currentPrice" in p:
            return _clean(p)
        return DataWriter.build_position(**p)

    def post_signal(
        self,
        *,
        symbol: str,
        timeframe: str,
        score: float,
        direction: str = "NEUTRAL",     # "BUY" | "SELL" | "NEUTRAL"
        acted: Optional[bool] = None,
        indicators: Optional[dict[str, Any]] = None,
        evaluation: Optional[dict[str, Any]] = None,
        generated_at: Optional[datetime] = None,
    ) -> bool:
        """POST a strategy signal (append-only)."""
        payload = _clean({
            "symbol": symbol,
            "timeframe": timeframe,
            "direction": direction,
            "score": score,
            "acted": acted,
            "indicators": indicators,
            "evaluation": evaluation,
            "generatedAt": _iso(generated_at),
        })
        return self._request("POST", "/api/signals", payload)

    def post_account(
        self,
        *,
        balance: float,
        equity: float,
        margin: Optional[float] = None,
        free_margin: Optional[float] = None,
        margin_level: Optional[float] = None,
        currency: Optional[str] = None,
        leverage: Optional[int] = None,
        captured_at: Optional[datetime] = None,
    ) -> bool:
        """POST an account snapshot (append-only time series)."""
        payload = _clean({
            "balance": balance,
            "equity": equity,
            "margin": margin,
            "freeMargin": free_margin,
            "marginLevel": margin_level,
            "currency": currency,
            "leverage": leverage,
            "capturedAt": _iso(captured_at),
        })
        return self._request("POST", "/api/account", payload)

    def post_risk(
        self,
        *,
        daily_pnl: Optional[float] = None,
        daily_drawdown_pct: Optional[float] = None,
        max_drawdown_pct: Optional[float] = None,
        open_risk_pct: Optional[float] = None,
        exposure_pct: Optional[float] = None,
        risk_per_trade_pct: Optional[float] = None,
        open_positions: Optional[int] = None,
        margin_level: Optional[float] = None,
        captured_at: Optional[datetime] = None,
    ) -> bool:
        """POST a risk snapshot (append-only time series)."""
        payload = _clean({
            "dailyPnl": daily_pnl,
            "dailyDrawdownPct": daily_drawdown_pct,
            "maxDrawdownPct": max_drawdown_pct,
            "openRiskPct": open_risk_pct,
            "exposurePct": exposure_pct,
            "riskPerTradePct": risk_per_trade_pct,
            "openPositions": open_positions,
            "marginLevel": margin_level,
            "capturedAt": _iso(captured_at),
        })
        return self._request("POST", "/api/risk/current", payload)

    # ── Lifecycle ───────────────────────────────────────────

    def close(self) -> None:
        """Close the underlying session. Call on bot shutdown."""
        try:
            self._session.close()
        except Exception:  # pragma: no cover
            pass

    def __enter__(self) -> "DataWriter":
        return self

    def __exit__(self, *exc: Any) -> None:
        self.close()


def _safe_body(resp: requests.Response, limit: int = 500) -> str:
    """Extract a short, log-safe snippet of a response body."""
    try:
        text = resp.text or ""
    except Exception:
        return "<unreadable body>"
    text = text.strip().replace("\n", " ")
    return text[:limit] + ("…" if len(text) > limit else "")
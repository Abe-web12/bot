"""
metrics.py
===========
Thread-safe in-process metrics collector. All metrics are stored in
memory and exposed via metrics.snapshot() for the health/API layer.

No external metrics server (Prometheus, StatsD) is required — the
dashboard reads metrics through the REST API, which reads them from
here. If a future milestone adds Prometheus, this module is the adapter
point; nothing else changes.

Usage:
    from core.metrics import metrics
    metrics.record_execution_latency_ms(42.5)
    metrics.increment("trades_opened")
    snapshot = metrics.snapshot()
"""

from __future__ import annotations

import os
import threading
import time
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Deque

import psutil


@dataclass
class _LatencySeries:
    """Keeps the last N latency samples and computes p50/p95/p99."""

    _samples: Deque[float] = field(default_factory=lambda: deque(maxlen=500))

    def record(self, ms: float) -> None:
        self._samples.append(ms)

    def stats(self) -> dict:
        if not self._samples:
            return {"count": 0, "p50": None, "p95": None, "p99": None, "avg": None, "last": None}
        import statistics
        s = sorted(self._samples)
        n = len(s)

        def pct(p: float) -> float:
            idx = max(0, int(n * p / 100) - 1)
            return round(s[idx], 3)

        return {
            "count": n,
            "p50": pct(50),
            "p95": pct(95),
            "p99": pct(99),
            "avg": round(statistics.mean(s), 3),
            "last": round(s[-1], 3),
        }


class MetricsCollector:
    """
    Central metrics registry for the bot process.
    All methods are thread-safe.
    """

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._process = psutil.Process(os.getpid())
        self._started_at = datetime.now(timezone.utc)

        # --- Counters ---
        self._counters: dict[str, int] = {
            "trades_opened": 0,
            "trades_closed": 0,
            "trades_rejected_risk": 0,
            "trades_rejected_broker": 0,
            "trades_rejected_duplicate": 0,
            "signals_generated": 0,
            "signals_discarded_low_confidence": 0,
            "telegram_messages_sent": 0,
            "telegram_messages_failed": 0,
            "mt5_reconnects": 0,
            "webhook_received": 0,
            "webhook_rejected": 0,
            "queue_overflows": 0,
        }

        # --- Gauges (current values) ---
        self._gauges: dict[str, float | int | None] = {
            "open_trades": 0,
            "daily_pnl": 0.0,
            "monthly_pnl": 0.0,
            "drawdown_pct": 0.0,
            "win_rate_pct": 0.0,
            "equity": 0.0,
            "balance": 0.0,
            "queue_depth": 0,
            "active_threads": 0,
            "connection_status": None,
            "bot_status": None,
        }

        # --- Latency series ---
        self._mt5_latency = _LatencySeries()
        self._api_latency = _LatencySeries()
        self._gemini_latency = _LatencySeries()
        self._telegram_latency = _LatencySeries()
        self._signal_generation_latency = _LatencySeries()
        self._order_execution_latency = _LatencySeries()

        # --- Win/loss tracking for win rate ---
        self._wins: int = 0
        self._losses: int = 0

    # ------------------------------------------------------------------
    # Counter operations
    # ------------------------------------------------------------------
    def increment(self, name: str, amount: int = 1) -> None:
        with self._lock:
            if name in self._counters:
                self._counters[name] += amount
            else:
                self._counters[name] = amount

    def counter(self, name: str) -> int:
        with self._lock:
            return self._counters.get(name, 0)

    # ------------------------------------------------------------------
    # Gauge operations
    # ------------------------------------------------------------------
    def set_gauge(self, name: str, value: float | int | None) -> None:
        with self._lock:
            self._gauges[name] = value

    def gauge(self, name: str) -> float | int | None:
        with self._lock:
            return self._gauges.get(name)

    # ------------------------------------------------------------------
    # Latency recording
    # ------------------------------------------------------------------
    def record_mt5_latency_ms(self, ms: float) -> None:
        with self._lock:
            self._mt5_latency.record(ms)

    def record_api_latency_ms(self, ms: float) -> None:
        with self._lock:
            self._api_latency.record(ms)

    def record_gemini_latency_ms(self, ms: float) -> None:
        with self._lock:
            self._gemini_latency.record(ms)

    def record_telegram_latency_ms(self, ms: float) -> None:
        with self._lock:
            self._telegram_latency.record(ms)

    def record_signal_latency_ms(self, ms: float) -> None:
        with self._lock:
            self._signal_generation_latency.record(ms)

    def record_execution_latency_ms(self, ms: float) -> None:
        with self._lock:
            self._order_execution_latency.record(ms)

    # ------------------------------------------------------------------
    # Trade outcome tracking
    # ------------------------------------------------------------------
    def record_trade_win(self) -> None:
        with self._lock:
            self._wins += 1
            total = self._wins + self._losses
            self._gauges["win_rate_pct"] = round(self._wins / total * 100, 2) if total else 0.0

    def record_trade_loss(self) -> None:
        with self._lock:
            self._losses += 1
            total = self._wins + self._losses
            self._gauges["win_rate_pct"] = round(self._wins / total * 100, 2) if total else 0.0

    # ------------------------------------------------------------------
    # System resource snapshot (read live from OS each time)
    # ------------------------------------------------------------------
    def _system_stats(self) -> dict:
        try:
            cpu = self._process.cpu_percent(interval=None)
            mem = self._process.memory_info()
            ram_mb = round(mem.rss / 1024 / 1024, 2)
        except psutil.Error:
            cpu = None
            ram_mb = None
        return {
            "cpu_pct": cpu,
            "ram_mb": ram_mb,
            "active_threads": threading.active_count(),
            "uptime_seconds": round((datetime.now(timezone.utc) - self._started_at).total_seconds(), 0),
        }

    # ------------------------------------------------------------------
    # Full snapshot — called by health/API endpoints
    # ------------------------------------------------------------------
    def snapshot(self) -> dict:
        with self._lock:
            counters = self._counters.copy()
            gauges = self._gauges.copy()
            mt5_lat = self._mt5_latency.stats()
            api_lat = self._api_latency.stats()
            gemini_lat = self._gemini_latency.stats()
            telegram_lat = self._telegram_latency.stats()
            signal_lat = self._signal_generation_latency.stats()
            execution_lat = self._order_execution_latency.stats()
            wins = self._wins
            losses = self._losses

        system = self._system_stats()

        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "counters": counters,
            "gauges": gauges,
            "win_loss": {"wins": wins, "losses": losses},
            "latency": {
                "mt5_ms": mt5_lat,
                "api_ms": api_lat,
                "gemini_ms": gemini_lat,
                "telegram_ms": telegram_lat,
                "signal_generation_ms": signal_lat,
                "order_execution_ms": execution_lat,
            },
            "system": system,
        }


# Single shared instance for the whole process.
metrics = MetricsCollector()

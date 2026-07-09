"""
rate_limiter.py
=================
Simple thread-safe token bucket rate limiter, keyed by an arbitrary
string (source IP, API key, webhook source name). No external
dependency (Redis, etc.) — appropriate for a single-process bot. If this
process is ever horizontally scaled, this becomes shared-state-unaware
and would need a Redis-backed implementation instead; documented here
so that limitation isn't silently assumed away later.
"""

from __future__ import annotations

import threading
import time
from dataclasses import dataclass, field


@dataclass
class _Bucket:
    tokens: float
    last_refill: float = field(default_factory=time.monotonic)


class RateLimiter:
    def __init__(self, max_per_minute: int) -> None:
        if max_per_minute <= 0:
            raise ValueError(f"max_per_minute must be positive, got {max_per_minute}")
        self._max_per_minute = max_per_minute
        self._refill_rate_per_second = max_per_minute / 60.0
        self._buckets: dict[str, _Bucket] = {}
        self._lock = threading.Lock()

    def allow(self, key: str) -> bool:
        """
        Returns True if a request from `key` is allowed right now
        (consumes one token), False if the caller is rate-limited.
        """
        now = time.monotonic()
        with self._lock:
            bucket = self._buckets.get(key)
            if bucket is None:
                # Pass the already-captured `now` explicitly rather than
                # letting the dataclass default_factory call
                # time.monotonic() again microseconds later — otherwise
                # the elapsed-time calculation below sees a small
                # negative duration (now < bucket.last_refill) on a
                # brand-new bucket, which nudges tokens just under the
                # full capacity and can cause the very first request for
                # a new key to be incorrectly rejected.
                bucket = _Bucket(tokens=float(self._max_per_minute), last_refill=now)
                self._buckets[key] = bucket

            elapsed = now - bucket.last_refill
            bucket.tokens = min(
                float(self._max_per_minute),
                bucket.tokens + elapsed * self._refill_rate_per_second,
            )
            bucket.last_refill = now

            if bucket.tokens >= 1.0:
                bucket.tokens -= 1.0
                return True
            return False

    def remaining(self, key: str) -> float:
        with self._lock:
            bucket = self._buckets.get(key)
            return bucket.tokens if bucket else float(self._max_per_minute)

    def reset(self, key: str) -> None:
        with self._lock:
            self._buckets.pop(key, None)

    def reset_all(self) -> None:
        with self._lock:
            self._buckets.clear()

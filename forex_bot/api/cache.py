"""
cache.py
=========
Short-TTL in-memory cache decorator for expensive read endpoints
(analytics aggregation queries, market candle fetches). Not a general
HTTP cache — deliberately short (config.API_CACHE_TTL_SECONDS, default
5s) so cached data going stale is never a real concern for a dashboard
that also has WebSocket push for anything truly live; this cache only
smooths out repeated rapid polling of the same expensive endpoint.

Cache key includes the full request path + query string, so different
filter/pagination parameters never collide.
"""

from __future__ import annotations

import threading
import time
from functools import wraps
from typing import Callable

from flask import request

import config


class TTLCache:
    def __init__(self) -> None:
        self._store: dict[str, tuple[float, object]] = {}
        self._lock = threading.Lock()

    def get(self, key: str):
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            expires_at, value = entry
            if time.monotonic() >= expires_at:
                del self._store[key]
                return None
            return value

    def set(self, key: str, value, ttl_seconds: float) -> None:
        with self._lock:
            self._store[key] = (time.monotonic() + ttl_seconds, value)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()

    def size(self) -> int:
        with self._lock:
            return len(self._store)


_cache = TTLCache()


def cached(ttl_seconds: float | None = None) -> Callable:
    """
    Decorator for Flask view functions. Caches the raw return value
    keyed by function identity + full request path/query string.
    Bypassed if the request includes 'no_cache=1' — used by the
    dashboard's manual refresh action.
    """
    effective_ttl = ttl_seconds if ttl_seconds is not None else config.API_CACHE_TTL_SECONDS

    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def wrapper(*args, **kwargs):
            if request.args.get("no_cache") == "1":
                return f(*args, **kwargs)

            key = f"{f.__module__}.{f.__name__}:{request.full_path}"
            hit = _cache.get(key)
            if hit is not None:
                return hit

            result = f(*args, **kwargs)
            _cache.set(key, result, effective_ttl)
            return result
        return wrapper
    return decorator


def clear_cache() -> None:
    """Exposed for tests and for config-reload handlers that want to
    force-invalidate stale cached analytics after a settings change."""
    _cache.clear()

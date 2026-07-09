"""
rate_limit.py
===============
Flask decorator applying core.rate_limiter.RateLimiter to individual
API endpoints. Separate limiter instance from api/routes/webhooks.py's
(which is keyed by source IP for unauthenticated inbound webhooks) —
this one is keyed by "role:ip" so an authenticated admin and an
authenticated viewer don't share a bucket.

IMPORTANT: the default/login limiters are resolved at CALL time, not at
decoration time. If they were captured once when @rate_limited() /
@login_rate_limited decorate a view function (which happens exactly
once, at module import), reassigning module.default_limiter later
(e.g. for hot-reload of API_RATE_LIMIT_PER_MINUTE, or in tests) would
have no effect on already-decorated routes — they'd keep using
whatever limiter object existed at import time forever. Resolving the
module attribute fresh on every request avoids that trap.
"""

from __future__ import annotations

from functools import wraps
from typing import Callable

from flask import g, jsonify, request

import config
from core.rate_limiter import RateLimiter

_default_limiter = RateLimiter(max_per_minute=config.API_RATE_LIMIT_PER_MINUTE)
_login_limiter = RateLimiter(max_per_minute=config.API_LOGIN_RATE_LIMIT_PER_MINUTE)


def _client_ip() -> str:
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or "unknown"


def rate_limited(limiter: RateLimiter | None = None) -> Callable:
    """
    Decorator: @rate_limited() resolves the module-level _default_limiter
    fresh on every request (so reassigning it later, e.g. in tests or via
    hot-reload, takes effect immediately). Pass an explicit `limiter` to
    pin a specific instance instead of the dynamic default.
    """
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def wrapper(*args, **kwargs):
            active_limiter = limiter if limiter is not None else _default_limiter
            role = getattr(g, "auth_role", "anonymous")
            key = f"{role}:{_client_ip()}"
            if not active_limiter.allow(key):
                return jsonify({"error": "Rate limit exceeded. Please slow down."}), 429
            return f(*args, **kwargs)
        return wrapper
    return decorator


def login_rate_limited(f: Callable) -> Callable:
    """Like @rate_limited() but always resolves the module-level
    _login_limiter fresh on every request, for the same reason."""
    @wraps(f)
    def wrapper(*args, **kwargs):
        role = getattr(g, "auth_role", "anonymous")
        key = f"{role}:{_client_ip()}"
        if not _login_limiter.allow(key):
            return jsonify({"error": "Rate limit exceeded. Please slow down."}), 429
        return f(*args, **kwargs)
    return wrapper

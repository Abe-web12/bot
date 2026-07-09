"""
security.py (routes)
=======================
Admin-only security monitoring.

  GET /api/security/audit-log       - recent audit trail entries
  GET /api/security/failed-logins   - failed login count in the last hour, by IP
  GET /api/security/rate-limits     - current rate limiter bucket stats
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, request

from api.auth import require_role
from api.rate_limit import rate_limited

logger = logging.getLogger("api.routes.security")

security_bp = Blueprint("security", __name__, url_prefix="/api/security")


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


@security_bp.get("/audit-log")
@require_role("admin")
@rate_limited()
def audit_log():
    limit = min(int(request.args.get("limit", 100)), 1000)
    action = request.args.get("action")

    from database.connection import unit_of_work
    from database.repositories import AuditLogRepository

    with unit_of_work() as session:
        entries = AuditLogRepository(session).get_recent(limit=limit, action=action)

    return jsonify({
        "timestamp": _ts(),
        "count": len(entries),
        "entries": [
            {
                "id": e.id, "action": e.action, "role": e.role, "success": e.success,
                "ip_address": e.ip_address, "detail": e.detail, "occurred_at": e.occurred_at.isoformat(),
            }
            for e in entries
        ],
    })


@security_bp.get("/failed-logins")
@require_role("admin")
@rate_limited()
def failed_logins():
    window_minutes = min(int(request.args.get("window_minutes", 60)), 1440)
    since = datetime.now(timezone.utc) - timedelta(minutes=window_minutes)

    from database.connection import unit_of_work
    from database.repositories import AuditLogRepository

    with unit_of_work() as session:
        repo = AuditLogRepository(session)
        total = repo.count_failed_logins_since(since)

    return jsonify({"timestamp": _ts(), "window_minutes": window_minutes, "failed_login_count": total})


@security_bp.get("/rate-limits")
@require_role("admin")
@rate_limited()
def rate_limit_status():
    import api.rate_limit as rl

    return jsonify({
        "timestamp": _ts(),
        "default_limit_per_minute": rl._default_limiter._max_per_minute,
        "login_limit_per_minute": rl._login_limiter._max_per_minute,
        "tracked_buckets_default": len(rl._default_limiter._buckets),
        "tracked_buckets_login": len(rl._login_limiter._buckets),
    })

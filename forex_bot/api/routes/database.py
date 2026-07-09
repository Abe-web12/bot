"""
database.py (routes)
=======================
  GET /api/database/status
"""

from __future__ import annotations

import logging
import time
from datetime import datetime, timezone

from flask import Blueprint, jsonify

from api.auth import require_role
from api.rate_limit import rate_limited

logger = logging.getLogger("api.routes.database")

database_bp = Blueprint("database_status", __name__, url_prefix="/api/database")


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


@database_bp.get("/status")
@require_role("admin", "viewer")
@rate_limited()
def status():
    from database.connection import check_connection, unit_of_work
    from database.migrations import migration_runner
    from database.repositories import TradeIntentRepository

    t0 = time.monotonic()
    connected, message = check_connection()
    latency_ms = round((time.monotonic() - t0) * 1000, 2)

    body = {
        "timestamp": _ts(), "connected": connected, "message": message, "latency_ms": latency_ms,
    }

    if connected:
        try:
            body["migration_version"] = migration_runner.current_version()
            body["integrity_errors"] = migration_runner.integrity_check()
        except Exception as exc:
            body["migration_error"] = str(exc)

        try:
            with unit_of_work() as session:
                body["pending_queue"] = TradeIntentRepository(session).count_by_status()
        except Exception as exc:
            body["pending_queue_error"] = str(exc)

    return jsonify(body), 200 if connected else 503

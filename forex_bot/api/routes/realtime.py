"""
realtime.py (routes)
=======================
  GET /api/dashboard/snapshot   - full aggregated first-paint payload (services.DashboardService)
  GET /api/websocket/status     - connection manager metrics (rooms, subscribers, sequence)
  GET /api/cache/stats          - dashboard TTL cache statistics
  GET /api/workers/status       - background worker running status
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from flask import Blueprint, jsonify

from api.auth import require_role
from api.cache import _cache
from api.rate_limit import rate_limited

logger = logging.getLogger("api.routes.realtime")

realtime_bp = Blueprint("realtime", __name__, url_prefix="/api")


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


@realtime_bp.get("/dashboard/snapshot")
@require_role("admin", "viewer")
@rate_limited()
def dashboard_snapshot():
    from services.services import DashboardService
    try:
        snapshot = DashboardService().get_dashboard_snapshot()
        return jsonify({"timestamp": _ts(), **snapshot})
    except Exception as exc:
        logger.error("Failed to build dashboard snapshot: %s", exc)
        return jsonify({"error": str(exc)}), 503


@realtime_bp.get("/websocket/status")
@require_role("admin", "viewer")
@rate_limited()
def websocket_status():
    from api.websocket_manager import connection_manager
    return jsonify({"timestamp": _ts(), **connection_manager.connection_metrics()})


@realtime_bp.get("/cache/stats")
@require_role("admin")
@rate_limited()
def cache_stats():
    return jsonify({"timestamp": _ts(), "cached_entries": _cache.size()})


@realtime_bp.get("/workers/status")
@require_role("admin", "viewer")
@rate_limited()
def workers_status():
    from core.background_workers import worker_manager
    return jsonify({"timestamp": _ts(), "workers": worker_manager.status()})

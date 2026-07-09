"""
health.py
==========
Production health check endpoints. Every endpoint performs real
diagnostics — no hardcoded "healthy" responses.

Endpoints:
  GET /health   — Combined summary (liveness + readiness)
  GET /live     — Kubernetes liveness: is the process alive?
  GET /ready    — Kubernetes readiness: can it handle requests?
  GET /system   — CPU, RAM, threads, uptime
  GET /database — Database connection and schema version
  GET /mt5      — MT5 connection status and latency
  GET /telegram — Telegram bot reachability
  GET /gemini   — Gemini API key presence and reachability
  GET /metrics  — Full metrics snapshot
  GET /config   — Current hot-reloadable config values (non-secret)
  POST /config  — Apply hot-reload changes (requires auth)

Authentication: All write endpoints and /metrics require the
X-Bot-Token header matching config.DASHBOARD_PASSWORD. Read-only
health endpoints are unauthenticated (standard practice for load
balancers and monitoring systems).
"""

from __future__ import annotations

import time
import logging
from datetime import datetime, timezone
from functools import wraps
from typing import Callable

from flask import Blueprint, jsonify, request, Response

import config
from core.circuit_breaker import all_circuit_stats
from core.metrics import metrics
from core.state_manager import state

logger = logging.getLogger("api.health")

health_bp = Blueprint("health", __name__)


# ---------------------------------------------------------------------------
# Auth guard for write endpoints and sensitive read endpoints
# ---------------------------------------------------------------------------

def _require_token(f: Callable) -> Callable:
    @wraps(f)
    def wrapper(*args, **kwargs):
        token = request.headers.get("X-Bot-Token", "")
        expected = config.DASHBOARD_PASSWORD
        if not expected or token != expected:
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return wrapper


def _json_response(data: dict, status: int = 200) -> Response:
    return jsonify(data), status


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# /live — liveness probe
# ---------------------------------------------------------------------------

@health_bp.get("/live")
def liveness():
    """
    Kubernetes liveness: returns 200 if the process is alive.
    If this endpoint is unreachable, the container should be restarted.
    """
    return _json_response({"status": "alive", "timestamp": _ts()})


# ---------------------------------------------------------------------------
# /ready — readiness probe
# ---------------------------------------------------------------------------

@health_bp.get("/ready")
def readiness():
    """
    Kubernetes readiness: returns 200 only if the bot is ready to
    receive traffic and process signals. Returns 503 if not ready.
    """
    from core.state_manager import BotStatus, ConnectionStatus

    bot_ok = state.bot_status == BotStatus.RUNNING
    conn_ok = state.connection_status == ConnectionStatus.CONNECTED

    ready = bot_ok and conn_ok
    body = {
        "ready": ready,
        "timestamp": _ts(),
        "checks": {
            "bot_running": bot_ok,
            "mt5_connected": conn_ok,
        },
    }
    return _json_response(body, 200 if ready else 503)


# ---------------------------------------------------------------------------
# /health — combined summary
# ---------------------------------------------------------------------------

@health_bp.get("/health")
def health_summary():
    """Combined health summary. Aggregates all subsystems."""
    t0 = time.monotonic()

    from core.state_manager import BotStatus, ConnectionStatus
    from database.connection import check_connection

    db_ok, db_msg = check_connection()
    bot_ok = state.bot_status == BotStatus.RUNNING
    conn_ok = state.connection_status == ConnectionStatus.CONNECTED

    snap = metrics.snapshot()
    system = snap["system"]

    overall_ok = db_ok and bot_ok and conn_ok

    body = {
        "status": "healthy" if overall_ok else "degraded",
        "timestamp": _ts(),
        "latency_ms": round((time.monotonic() - t0) * 1000, 2),
        "subsystems": {
            "bot": {"status": state.bot_status.value, "ok": bot_ok},
            "mt5": {"status": state.connection_status.value, "ok": conn_ok},
            "database": {"ok": db_ok, "message": db_msg},
        },
        "system": system,
    }
    return _json_response(body, 200 if overall_ok else 503)


# ---------------------------------------------------------------------------
# /system — CPU, RAM, threads, uptime
# ---------------------------------------------------------------------------

@health_bp.get("/system")
def system_info():
    snap = metrics.snapshot()
    return _json_response({
        "timestamp": _ts(),
        **snap["system"],
        "counters": snap["counters"],
        "gauges": snap["gauges"],
    })


# ---------------------------------------------------------------------------
# /database — real connection check + schema version
# ---------------------------------------------------------------------------

@health_bp.get("/database")
def database_health():
    t0 = time.monotonic()
    from database.connection import check_connection
    from database.migrations import migration_runner

    ok, msg = check_connection()
    latency_ms = round((time.monotonic() - t0) * 1000, 2)

    body: dict = {
        "timestamp": _ts(),
        "connected": ok,
        "message": msg,
        "latency_ms": latency_ms,
    }

    if ok:
        try:
            body["schema_version"] = migration_runner.current_version()
            errors = migration_runner.integrity_check()
            body["integrity_ok"] = len(errors) == 0
            if errors:
                body["integrity_errors"] = errors
        except Exception as exc:
            body["schema_error"] = str(exc)

    metrics.record_api_latency_ms(latency_ms)
    return _json_response(body, 200 if ok else 503)


# ---------------------------------------------------------------------------
# /mt5 — MT5 connection status
# ---------------------------------------------------------------------------

@health_bp.get("/mt5")
def mt5_health():
    from core.state_manager import ConnectionStatus

    connected = state.connection_status == ConnectionStatus.CONNECTED
    account = state.account
    snap = metrics.snapshot()
    mt5_lat = snap["latency"]["mt5_ms"]

    body = {
        "timestamp": _ts(),
        "connected": connected,
        "connection_status": state.connection_status.value,
        "is_demo": state.is_demo_account,
        "latency_ms": mt5_lat,
    }

    if connected and account.balance > 0:
        body["account"] = {
            "balance": account.balance,
            "equity": account.equity,
            "free_margin": account.free_margin,
            "currency": account.currency,
        }

    return _json_response(body, 200 if connected else 503)


# ---------------------------------------------------------------------------
# /telegram — real bot API ping
# ---------------------------------------------------------------------------

@health_bp.get("/telegram")
def telegram_health():
    t0 = time.monotonic()
    token = config.TELEGRAM_TOKEN

    if not token:
        return _json_response({
            "timestamp": _ts(),
            "configured": False,
            "message": "TELEGRAM_TOKEN not set.",
        }, 503)

    try:
        import httpx
        response = httpx.get(
            f"https://api.telegram.org/bot{token}/getMe",
            timeout=5.0,
        )
        latency_ms = round((time.monotonic() - t0) * 1000, 2)

        if response.status_code == 200:
            data = response.json().get("result", {})
            metrics.record_telegram_latency_ms(latency_ms)
            return _json_response({
                "timestamp": _ts(),
                "configured": True,
                "reachable": True,
                "bot_username": data.get("username"),
                "latency_ms": latency_ms,
            })

        return _json_response({
            "timestamp": _ts(),
            "configured": True,
            "reachable": False,
            "http_status": response.status_code,
            "latency_ms": latency_ms,
        }, 503)

    except Exception as exc:
        latency_ms = round((time.monotonic() - t0) * 1000, 2)
        return _json_response({
            "timestamp": _ts(),
            "configured": True,
            "reachable": False,
            "error": str(exc),
            "latency_ms": latency_ms,
        }, 503)


# ---------------------------------------------------------------------------
# /gemini — API key presence + optional live ping
# ---------------------------------------------------------------------------

@health_bp.get("/gemini")
def gemini_health():
    api_key = config.GEMINI_API_KEY

    if not api_key:
        return _json_response({
            "timestamp": _ts(),
            "configured": False,
            "message": "GEMINI_API_KEY not set — AI features disabled.",
        })

    # Perform a lightweight models list call to verify the key is valid.
    t0 = time.monotonic()
    try:
        import httpx
        response = httpx.get(
            "https://generativelanguage.googleapis.com/v1beta/models",
            params={"key": api_key},
            timeout=5.0,
        )
        latency_ms = round((time.monotonic() - t0) * 1000, 2)
        metrics.record_gemini_latency_ms(latency_ms)

        ok = response.status_code == 200
        return _json_response({
            "timestamp": _ts(),
            "configured": True,
            "reachable": ok,
            "http_status": response.status_code,
            "latency_ms": latency_ms,
        }, 200 if ok else 503)

    except Exception as exc:
        latency_ms = round((time.monotonic() - t0) * 1000, 2)
        return _json_response({
            "timestamp": _ts(),
            "configured": True,
            "reachable": False,
            "error": str(exc),
            "latency_ms": latency_ms,
        }, 503)


# ---------------------------------------------------------------------------
# /metrics — full metrics snapshot (requires auth)
# ---------------------------------------------------------------------------

@health_bp.get("/metrics")
@_require_token
def get_metrics():
    snap = metrics.snapshot()
    snap["circuit_breakers"] = all_circuit_stats()
    return _json_response(snap)


# ---------------------------------------------------------------------------
# /metrics/prometheus — Prometheus exposition format (no dependency needed)
# ---------------------------------------------------------------------------

def _prometheus_metric(name: str, value, labels: dict | None = None,
                       help_text: str = "", metric_type: str = "gauge") -> str:
    lines = []
    if help_text:
        lines.append(f"# HELP {name} {help_text}")
    lines.append(f"# TYPE {name} {metric_type}")
    if labels:
        label_str = ",".join(f'{k}="{v}"' for k, v in labels.items())
        lines.append(f'{name}{{{label_str}}} {value}')
    else:
        lines.append(f"{name} {value}")
    return "\n".join(lines) + "\n"


@health_bp.get("/metrics/prometheus")
def get_metrics_prometheus():
    """Prometheus exposition format for the /metrics endpoint.
    Scrape this endpoint with: prometheus.yml -> targets: ['host:5000']"""
    snap = metrics.snapshot()
    lines = []
    lines.append("# Forex Trading Bot metrics — Prometheus exposition format")
    lines.append(f"# Generated at {snap['timestamp']}")
    lines.append("")

    # System
    lines.append(_prometheus_metric("bot_uptime_seconds", snap["system"]["uptime_seconds"],
                                    help_text="Process uptime in seconds."))
    lines.append(_prometheus_metric("bot_cpu_percent", snap["system"]["cpu_pct"] or 0,
                                    help_text="Current CPU usage of the bot process."))
    lines.append(_prometheus_metric("bot_memory_mb", snap["system"]["ram_mb"] or 0,
                                    help_text="Current RSS memory in MB."))
    lines.append(_prometheus_metric("bot_threads", snap["system"]["active_threads"],
                                    help_text="Number of active threads."))

    # Counters
    for name, val in snap["counters"].items():
        lines.append(_prometheus_metric(f"bot_{name}_total", val, metric_type="counter",
                                        help_text=f"Total count of {name.replace('_', ' ')}."))

    # Gauges
    for name, val in snap["gauges"].items():
        if val is not None:
            lines.append(_prometheus_metric(f"bot_{name}", val,
                                            help_text=f"Current {name.replace('_', ' ')}."))

    # Latency (last values)
    for name, lat in snap["latency"].items():
        if lat and lat.get("last") is not None:
            lines.append(_prometheus_metric(f"bot_{name}_last_ms", lat["last"],
                                            help_text=f"Last recorded {name} latency in ms."))
            lines.append(_prometheus_metric(f"bot_{name}_avg_ms", lat["avg"] or 0,
                                            help_text=f"Average {name} latency in ms."))

    # Circuit breakers
    for cb in all_circuit_stats():
        states = {"CLOSED": 0, "OPEN": 1, "HALF_OPEN": 2}
        lines.append(_prometheus_metric(
            "bot_circuit_breaker_state",
            states.get(cb["state"], -1),
            labels={"name": cb["name"]},
            help_text="Circuit breaker state: 0=CLOSED, 1=OPEN, 2=HALF_OPEN.",
        ))
        lines.append(_prometheus_metric(
            "bot_circuit_breaker_rejected_calls_total",
            cb["rejected_calls"],
            labels={"name": cb["name"]},
            metric_type="counter",
            help_text="Total calls rejected while circuit was open.",
        ))

    body = "".join(lines)
    return Response(body, mimetype="text/plain; charset=utf-8")


# ---------------------------------------------------------------------------
# /config — read current hot-reloadable values (requires auth)
# ---------------------------------------------------------------------------

@health_bp.get("/config")
@_require_token
def get_config():
    from core.config_manager import config_manager
    return _json_response({
        "timestamp": _ts(),
        "overrides": config_manager.current_overrides(),
        "history": config_manager.change_history(),
        "reloadable_keys": config_manager.hot_reloadable_keys(),
    })


@health_bp.post("/config")
@_require_token
def update_config():
    """
    Apply hot-reload configuration changes.
    Body: {"key": "RISK_PER_TRADE_PCT", "value": 1.5}
    or:   {"changes": {"RISK_PER_TRADE_PCT": 1.5, "MAX_SPREAD_PIPS": 2.0}}
    """
    from core.config_manager import ConfigValidationError, config_manager

    body = request.get_json(silent=True)
    if not body:
        return _json_response({"error": "Request body must be JSON."}, 400)

    try:
        if "changes" in body:
            applied = config_manager.set_many(body["changes"])
            return _json_response({
                "applied": [{"key": c.key, "old": c.old_value, "new": c.new_value} for c in applied]
            })
        elif "key" in body and "value" in body:
            change = config_manager.set(body["key"], body["value"])
            return _json_response({
                "key": change.key,
                "old_value": change.old_value,
                "new_value": change.new_value,
            })
        else:
            return _json_response({"error": "Provide 'key'+'value' or 'changes' dict."}, 400)

    except ConfigValidationError as exc:
        return _json_response({"error": str(exc)}, 422)
    except Exception as exc:
        logger.exception("Unexpected error in config update.")
        return _json_response({"error": "Internal server error."}, 500)

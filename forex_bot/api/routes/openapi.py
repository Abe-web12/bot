"""
openapi.py (routes)
======================
Serves a real OpenAPI 3.0 spec and a Swagger UI page. Documents the
authentication flow and the major endpoint groups in detail.

  GET /api/openapi.json - the spec itself
  GET /api/docs         - Swagger UI (CDN-hosted, no new dependency)
"""

from __future__ import annotations

from flask import Blueprint, Response, jsonify

openapi_bp = Blueprint("openapi", __name__, url_prefix="/api")

_PAGINATION_PARAMS = [
    {"name": "page", "in": "query", "schema": {"type": "integer", "default": 1}},
    {"name": "page_size", "in": "query", "schema": {"type": "integer", "default": 50, "maximum": 500}},
    {"name": "sort", "in": "query", "schema": {"type": "string"}, "description": "field:asc or field:desc"},
]

_BEARER_AUTH = [{"BearerAuth": []}]


def _spec() -> dict:
    return {
        "openapi": "3.0.3",
        "info": {
            "title": "Forex Trading Bot API",
            "version": "1.0.0",
            "description": (
                "Backend API for the trading bot dashboard. All data is read from a live "
                "MT5 demo account and the bot's own database - nothing here is mock data.\n\n"
                "## Authentication\n"
                "1. POST /api/auth/login with {\"password\": \"...\"} - the password matches either "
                "DASHBOARD_PASSWORD (role=admin) or VIEWER_PASSWORD (role=viewer) from .env.\n"
                "2. Use the returned access_token as `Authorization: Bearer <token>` on every "
                "subsequent request. Access tokens expire in 15 minutes.\n"
                "3. POST /api/auth/refresh with the refresh_token to get a new pair before the "
                "access token expires. Refresh tokens are single-use.\n"
                "4. WebSocket: connect to /ws, then send {\"token\": \"<access_token>\"} as the "
                "first message within 10 seconds, or the connection is closed."
            ),
        },
        "servers": [{"url": "/"}],
        "components": {
            "securitySchemes": {
                "BearerAuth": {"type": "http", "scheme": "bearer", "bearerFormat": "JWT"},
            }
        },
        "paths": {
            "/api/auth/login": {
                "post": {
                    "summary": "Log in and receive a token pair",
                    "requestBody": {"content": {"application/json": {"schema": {
                        "type": "object", "properties": {"password": {"type": "string"}}, "required": ["password"],
                    }}}},
                    "responses": {
                        "200": {"description": "Token pair issued"},
                        "400": {"description": "Missing password"},
                        "401": {"description": "Invalid credentials"},
                        "429": {"description": "Rate limited"},
                    },
                }
            },
            "/api/auth/refresh": {
                "post": {
                    "summary": "Rotate a refresh token for a new token pair",
                    "requestBody": {"content": {"application/json": {"schema": {
                        "type": "object", "properties": {"refresh_token": {"type": "string"}},
                    }}}},
                    "responses": {"200": {"description": "New token pair"}, "401": {"description": "Invalid/expired/reused token"}},
                }
            },
            "/api/auth/logout": {"post": {"summary": "Revoke a refresh token", "responses": {"200": {"description": "OK"}}}},
            "/api/auth/me": {"get": {"summary": "Current authenticated role", "security": _BEARER_AUTH, "responses": {"200": {"description": "OK"}}}},

            "/api/bot/status": {"get": {"summary": "Bot lifecycle status", "security": _BEARER_AUTH, "responses": {"200": {"description": "OK"}}}},
            "/api/bot/start": {"post": {"summary": "Start trading (admin)", "security": _BEARER_AUTH, "responses": {"200": {"description": "Started"}, "409": {"description": "Not connected / already running"}}}},
            "/api/bot/stop": {"post": {"summary": "Stop trading, graceful (admin)", "security": _BEARER_AUTH, "responses": {"200": {"description": "Stopped"}}}},
            "/api/bot/pause": {"post": {"summary": "Pause trading, no thread teardown (admin)", "security": _BEARER_AUTH, "responses": {"200": {"description": "Paused"}}}},
            "/api/bot/resume": {"post": {"summary": "Resume trading (admin)", "security": _BEARER_AUTH, "responses": {"200": {"description": "Resumed"}}}},
            "/api/bot/restart": {"post": {"summary": "Soft restart of trading subsystems (admin)", "security": _BEARER_AUTH, "responses": {"200": {"description": "Restarted"}}}},
            "/api/bot/kill-switch": {"post": {"summary": "Block new trades immediately, keep existing positions (admin)", "security": _BEARER_AUTH, "responses": {"200": {"description": "Killed"}}}},
            "/api/bot/emergency-stop": {"post": {"summary": "Kill switch + close every open position at market (admin)", "security": _BEARER_AUTH, "responses": {"200": {"description": "Emergency stopped"}}}},

            "/api/account": {"get": {"summary": "Live account snapshot", "security": _BEARER_AUTH, "responses": {"200": {"description": "OK"}}}},
            "/api/positions": {"get": {"summary": "Open positions (live MT5 read)", "security": _BEARER_AUTH, "responses": {"200": {"description": "OK"}}}},
            "/api/trades": {"get": {"summary": "Closed trades, paginated/sortable", "security": _BEARER_AUTH, "parameters": _PAGINATION_PARAMS, "responses": {"200": {"description": "OK"}}}},
            "/api/trades/export.csv": {"get": {"summary": "CSV export of closed trades", "security": _BEARER_AUTH, "responses": {"200": {"description": "text/csv file"}}}},
            "/api/trades/export.xlsx": {"get": {"summary": "Excel export of closed trades", "security": _BEARER_AUTH, "responses": {"200": {"description": "xlsx file"}}}},
            "/api/trades/{ticket}/close": {"post": {"summary": "Manual close of an open position (admin)", "security": _BEARER_AUTH, "parameters": [{"name": "ticket", "in": "path", "required": True, "schema": {"type": "integer"}}], "responses": {"200": {"description": "Closed"}, "404": {"description": "No such open position"}}}},

            "/api/dashboard/snapshot": {"get": {"summary": "Aggregated first-paint payload for the dashboard", "security": _BEARER_AUTH, "responses": {"200": {"description": "OK"}}}},

            "/api/charts/equity-curve": {"get": {"summary": "Equity over time", "security": _BEARER_AUTH, "responses": {"200": {"description": "OK"}}}},
            "/api/charts/balance-curve": {"get": {"summary": "Balance over time", "security": _BEARER_AUTH, "responses": {"200": {"description": "OK"}}}},
            "/api/charts/drawdown-curve": {"get": {"summary": "Drawdown % over time", "security": _BEARER_AUTH, "responses": {"200": {"description": "OK"}}}},
            "/api/charts/profit-curve": {"get": {"summary": "Cumulative realized P&L over closed trades", "security": _BEARER_AUTH, "responses": {"200": {"description": "OK"}}}},
            "/api/charts/heatmap": {"get": {"summary": "Day-of-week x hour-of-day win rate", "security": _BEARER_AUTH, "responses": {"200": {"description": "OK"}}}},
            "/api/charts/session-performance": {"get": {"summary": "Performance bucketed by trading session", "security": _BEARER_AUTH, "responses": {"200": {"description": "OK"}}}},

            "/api/market/price/{symbol}": {"get": {"summary": "Live bid/ask/spread for a symbol", "security": _BEARER_AUTH, "parameters": [{"name": "symbol", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}, "400": {"description": "Symbol not configured"}}}},
            "/api/strategy/signal/{symbol}": {"get": {"summary": "Read-only signal evaluation (does NOT place a trade)", "security": _BEARER_AUTH, "parameters": [{"name": "symbol", "in": "path", "required": True, "schema": {"type": "string"}}], "responses": {"200": {"description": "OK"}}}},
            "/api/risk/current": {"get": {"summary": "Real-time risk snapshot", "security": _BEARER_AUTH, "responses": {"200": {"description": "OK"}}}},
            "/api/database/status": {"get": {"summary": "DB connectivity, migration version, pending queue", "security": _BEARER_AUTH, "responses": {"200": {"description": "OK"}}}},

            "/api/security/audit-log": {"get": {"summary": "Recent audit trail entries (admin)", "security": _BEARER_AUTH, "responses": {"200": {"description": "OK"}}}},
            "/api/security/rate-limits": {"get": {"summary": "Current rate limiter bucket stats (admin)", "security": _BEARER_AUTH, "responses": {"200": {"description": "OK"}}}},

            "/api/websocket/status": {"get": {"summary": "Connection manager metrics", "security": _BEARER_AUTH, "responses": {"200": {"description": "OK"}}}},

            "/live": {"get": {"summary": "Liveness probe (unauthenticated)", "responses": {"200": {"description": "Alive"}}}},
            "/ready": {"get": {"summary": "Readiness probe (unauthenticated)", "responses": {"200": {"description": "Ready"}, "503": {"description": "Not ready"}}}},
            "/health": {"get": {"summary": "Combined health summary (unauthenticated)", "responses": {"200": {"description": "Healthy"}, "503": {"description": "Degraded"}}}},
        },
        "x-websocket": {
            "url": "/ws",
            "description": "Connect, then send {\"token\":\"<access_token>\"} within 10s. "
                           "Then send {\"action\":\"subscribe\",\"channel\":\"trades\"} etc.",
            "channels": ["bot", "trades", "signals", "health", "risk", "config",
                         "account", "market", "metrics", "execution"],
            "events_sent_by_server": [
                "{event_id,sequence,event,channel,payload,occurred_at} - a broadcast event",
                "{action:'ping', server_time} - heartbeat probe",
                "{action:'replay_complete', channel, events_sent, replay_incomplete}",
            ],
        },
    }


@openapi_bp.get("/openapi.json")
def openapi_spec():
    return jsonify(_spec())


@openapi_bp.get("/docs")
def swagger_ui():
    html = """<!DOCTYPE html>
<html><head><title>Forex Bot API Docs</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
</head><body>
<div id="swagger-ui"></div>
<script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>
window.onload = () => {
  SwaggerUIBundle({url: '/api/openapi.json', dom_id: '#swagger-ui'});
};
</script>
</body></html>"""
    return Response(html, mimetype="text/html")

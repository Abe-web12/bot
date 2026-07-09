"""
app.py
=======
Flask application factory. Creates and configures the Flask app with
all blueprints, CORS, compression, request logging, error handlers, and
request-level metrics timing.

Usage:
    from api.app import create_app
    app = create_app()
    app.run(host=config.SERVER_HOST, port=config.SERVER_PORT)
"""

from __future__ import annotations

import gzip
import logging
import time

from flask import Flask, g, jsonify, request
from flask_cors import CORS

import config

logger = logging.getLogger("api.app")

_COMPRESSIBLE_MIN_BYTES = 500  # don't bother compressing tiny responses


def create_app() -> Flask:
    app = Flask(__name__, instance_relative_config=False)
    app.config["SECRET_KEY"] = config.SECRET_KEY or "dev-secret-change-in-production"
    app.config["JSON_SORT_KEYS"] = False

    # CORS — restrict origins to the configured dashboard URL.
    # Falls back to localhost:3000 for local development only.
    # Set SITE_URL in .env to your production frontend domain.
    allowed_origins = [
        config.SITE_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    # Deduplicate and remove empty strings
    allowed_origins = list({o for o in allowed_origins if o})
    CORS(
        app,
        resources={r"/*": {"origins": allowed_origins}},
        supports_credentials=True,
    )

    # ---------------------------------------------------------------
    # Request logging + timing — every request logged with method,
    # path, status, and latency; latency also recorded into metrics.
    # ---------------------------------------------------------------
    @app.before_request
    def _start_timer():
        g.request_start = time.monotonic()

    @app.after_request
    def _log_and_time(response):
        latency_ms = (time.monotonic() - g.request_start) * 1000 if hasattr(g, "request_start") else 0.0

        from core.metrics import metrics
        metrics.record_api_latency_ms(latency_ms)
        response.headers["X-Response-Time-Ms"] = f"{latency_ms:.2f}"

        logger.info(
            "%s %s -> %d (%.1fms) ip=%s",
            request.method, request.path, response.status_code, latency_ms,
            request.remote_addr or "unknown",
            extra={"latency_ms": round(latency_ms, 2)},
        )

        # --- Security headers: applied to every response. ---
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        # CSRF note: this API is bearer-token (Authorization header) only,
        # never cookie-based session auth. CSRF is a cookie-auth attack —
        # a forged cross-site request cannot attach an Authorization
        # header a browser doesn't have. A CSRF token mechanism here
        # would be theater for an attack vector that doesn't apply to
        # this auth model, so it is deliberately not added; documented
        # here rather than silently omitted.

        # --- Auto-audit security-relevant response codes. ---
        if response.status_code in (401, 403):
            try:
                from core.audit import record_action
                role = getattr(g, "auth_role", None)
                record_action(
                    "PERMISSION_DENIED" if response.status_code == 403 else "UNAUTHORIZED",
                    role=role, success=False, ip_address=request.remote_addr or "unknown",
                    detail=f"{request.method} {request.path}",
                )
            except Exception:
                pass  # auditing must never break the actual response

        # --- Compression: gzip the body if the client accepts it and the
        # response is large enough to be worth compressing. ---
        accept_encoding = request.headers.get("Accept-Encoding", "")
        if (
            "gzip" in accept_encoding
            and response.direct_passthrough is False
            and len(response.get_data()) >= _COMPRESSIBLE_MIN_BYTES
            and "Content-Encoding" not in response.headers
        ):
            compressed = gzip.compress(response.get_data())
            response.set_data(compressed)
            response.headers["Content-Encoding"] = "gzip"
            response.headers["Content-Length"] = str(len(compressed))

        return response

    # ---------------------------------------------------------------
    # Blueprints
    # ---------------------------------------------------------------
    from api.routes.auth import auth_bp
    from api.routes.bot import bot_bp
    from api.routes.charts import charts_bp
    from api.routes.dashboard import dashboard_bp
    from api.routes.database import database_bp
    from api.routes.health import health_bp
    from api.routes.market import market_bp
    from api.routes.openapi import openapi_bp
    from api.routes.realtime import realtime_bp
    from api.routes.risk import risk_bp
    from api.routes.security import security_bp
    from api.routes.strategy import strategy_bp
    from api.routes.subscriptions import subscriptions_bp
    from api.routes.users import users_bp
    from api.routes.webhooks import webhooks_bp
    from api.routes.workspaces import workspaces_bp

    app.register_blueprint(health_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(bot_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(database_bp)
    app.register_blueprint(market_bp)
    app.register_blueprint(risk_bp)
    app.register_blueprint(strategy_bp)
    app.register_blueprint(webhooks_bp)
    app.register_blueprint(charts_bp)
    app.register_blueprint(security_bp)
    app.register_blueprint(realtime_bp)
    app.register_blueprint(openapi_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(workspaces_bp)
    app.register_blueprint(subscriptions_bp)

    # ---------------------------------------------------------------
    # WebSocket — live push, no polling. Subscribes the event bus ->
    # WS bridge and mounts the /ws route.
    # ---------------------------------------------------------------
    from api.websocket import init_websocket
    init_websocket(app)

    # ---------------------------------------------------------------
    # Global error handlers
    # ---------------------------------------------------------------
    @app.errorhandler(404)
    def _not_found(e):
        return jsonify({"error": "Not found", "path": request.path}), 404

    @app.errorhandler(405)
    def _method_not_allowed(e):
        return jsonify({"error": "Method not allowed"}), 405

    @app.errorhandler(500)
    def _internal_error(e):
        logger.exception("Unhandled API error on %s %s", request.method, request.path)
        return jsonify({"error": "Internal server error"}), 500

    logger.info("Flask API app created with %d blueprint(s).", len(app.blueprints))
    return app

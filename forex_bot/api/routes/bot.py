"""
bot.py (routes)
=================
Bot lifecycle control. Every endpoint here is admin-only (mutating,
safety-relevant) and delegates entirely to core.bot_controller —
this file has no lifecycle logic of its own, only HTTP plumbing and
error-to-status-code mapping.

  POST /api/bot/start
  POST /api/bot/stop
  POST /api/bot/pause
  POST /api/bot/resume
  POST /api/bot/restart
  POST /api/bot/kill-switch
  POST /api/bot/emergency-stop
  GET  /api/bot/status
"""

from __future__ import annotations

import logging
from functools import wraps

from flask import Blueprint, jsonify, request

from api.auth import require_role
from api.rate_limit import rate_limited
from core.bot_controller import BotControllerError, bot_controller

logger = logging.getLogger("api.routes.bot")

bot_bp = Blueprint("bot", __name__, url_prefix="/api/bot")


def _audited(action: str):
    """Decorator: records an AuditLog entry for a bot-control action,
    success or failure, without every route function repeating the
    same unit_of_work boilerplate."""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            from flask import g
            role = getattr(g, "auth_role", None)
            ip = request.remote_addr or "unknown"
            try:
                response = f(*args, **kwargs)
                from core.audit import record_action
                record_action(action, role=role, success=True, ip_address=ip)
                return response
            except Exception:
                from core.audit import record_action
                record_action(action, role=role, success=False, ip_address=ip)
                raise
        return wrapper
    return decorator


@bot_bp.get("/status")
@require_role("admin", "viewer")
@rate_limited()
def status():
    return jsonify(bot_controller.status())


@bot_bp.post("/start")
@require_role("admin")
@rate_limited()
@_audited("BOT_START")
def start():
    try:
        return jsonify(bot_controller.start_trading())
    except BotControllerError as exc:
        return jsonify({"error": str(exc)}), 409


@bot_bp.post("/stop")
@require_role("admin")
@rate_limited()
@_audited("BOT_STOP")
def stop():
    try:
        return jsonify(bot_controller.stop_trading())
    except BotControllerError as exc:
        return jsonify({"error": str(exc)}), 409


@bot_bp.post("/pause")
@require_role("admin")
@rate_limited()
@_audited("BOT_PAUSE")
def pause():
    body = request.get_json(silent=True) or {}
    try:
        return jsonify(bot_controller.pause_trading(reason=body.get("reason", "api_pause")))
    except BotControllerError as exc:
        return jsonify({"error": str(exc)}), 409


@bot_bp.post("/resume")
@require_role("admin")
@rate_limited()
@_audited("BOT_RESUME")
def resume():
    try:
        return jsonify(bot_controller.resume_trading())
    except BotControllerError as exc:
        return jsonify({"error": str(exc)}), 409


@bot_bp.post("/restart")
@require_role("admin")
@rate_limited()
@_audited("BOT_RESTART")
def restart():
    try:
        return jsonify(bot_controller.restart_trading())
    except BotControllerError as exc:
        return jsonify({"error": str(exc)}), 409


@bot_bp.post("/kill-switch")
@require_role("admin")
@rate_limited()
@_audited("KILL_SWITCH")
def kill_switch():
    body = request.get_json(silent=True) or {}
    try:
        result = bot_controller.kill_switch(reason=body.get("reason", "api_kill_switch"))
        logger.critical("Kill switch triggered via API by an admin.")
        return jsonify(result)
    except BotControllerError as exc:
        return jsonify({"error": str(exc)}), 409


@bot_bp.post("/emergency-stop")
@require_role("admin")
@rate_limited()
@_audited("EMERGENCY_STOP")
def emergency_stop():
    body = request.get_json(silent=True) or {}
    try:
        result = bot_controller.emergency_stop(reason=body.get("reason", "api_emergency_stop"))
        logger.critical("EMERGENCY STOP triggered via API by an admin.")
        return jsonify(result)
    except BotControllerError as exc:
        return jsonify({"error": str(exc)}), 409

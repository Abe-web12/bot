"""
auth.py (routes)
==================
POST /api/auth/login    — exchange DASHBOARD_PASSWORD or VIEWER_PASSWORD for a token pair
POST /api/auth/refresh  — exchange a refresh token for a new token pair (rotates the old one)
POST /api/auth/logout   — revoke a refresh token
GET  /api/auth/me       — current authenticated role
"""

from __future__ import annotations

import logging

from flask import Blueprint, jsonify, request

from api.auth import AuthError, authenticate_credentials, decode_access_token, issue_token_pair, \
    refresh_access_token, require_role, revoke_refresh_token
from api.rate_limit import login_rate_limited, rate_limited

logger = logging.getLogger("api.routes.auth")

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.post("/login")
@login_rate_limited
def login():
    body = request.get_json(silent=True) or {}
    password = body.get("password", "")
    ip = request.remote_addr or "unknown"

    if not password:
        return jsonify({"error": "Missing 'password'."}), 400

    role = authenticate_credentials(password)
    if role is None:
        logger.warning("Failed login attempt from %s.", ip)
        from core.audit import record_action
        record_action("LOGIN", role=None, success=False, ip_address=ip, detail="invalid credentials")
        return jsonify({"error": "Invalid credentials."}), 401

    try:
        tokens = issue_token_pair(role)
    except AuthError as exc:
        return jsonify({"error": str(exc)}), exc.status

    logger.info("Login successful, role=%s.", role)
    from core.audit import record_action
    record_action("LOGIN", role=role, success=True, ip_address=ip)

    return jsonify({
        "access_token": tokens.access_token,
        "refresh_token": tokens.refresh_token,
        "token_type": "Bearer",
        "expires_in": tokens.access_expires_in,
        "refresh_expires_in": tokens.refresh_expires_in,
        "role": role,
    })


@auth_bp.post("/refresh")
@rate_limited()
def refresh():
    body = request.get_json(silent=True) or {}
    refresh_token = body.get("refresh_token", "")
    if not refresh_token:
        return jsonify({"error": "Missing 'refresh_token'."}), 400

    try:
        tokens = refresh_access_token(refresh_token)
    except AuthError as exc:
        return jsonify({"error": str(exc)}), exc.status

    return jsonify({
        "access_token": tokens.access_token,
        "refresh_token": tokens.refresh_token,
        "token_type": "Bearer",
        "expires_in": tokens.access_expires_in,
        "refresh_expires_in": tokens.refresh_expires_in,
    })


@auth_bp.post("/logout")
def logout():
    body = request.get_json(silent=True) or {}
    refresh_token = body.get("refresh_token", "")
    if refresh_token:
        revoke_refresh_token(refresh_token)
    from core.audit import record_action
    record_action("LOGOUT", ip_address=request.remote_addr or "unknown")
    return jsonify({"status": "logged_out"})


@auth_bp.get("/me")
@require_role("admin", "viewer")
def me():
    from flask import g
    return jsonify({"role": g.auth_role})

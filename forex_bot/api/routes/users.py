"""
users.py (routes)
====================
Multi-user profile and account management.

  GET    /api/users/me          — current user profile
  PUT    /api/users/me          — update profile (display_name, preferences)
  POST   /api/users/change-password — change password (requires current password)
  GET    /api/users/me/api-keys   — list API keys
  POST   /api/users/me/api-keys   — create an API key
  DELETE /api/users/me/api-keys/<key_id> — revoke an API key
"""

from __future__ import annotations

import hashlib
import logging
import secrets
from datetime import datetime, timezone

from flask import Blueprint, jsonify, g, request

import config
from api.auth import (
    AuthError, create_user_token_pair, hash_password, require_role, verify_password,
)
from api.rate_limit import rate_limited

logger = logging.getLogger("api.routes.users")

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


def _require_user():
    """Ensure the request is from a user token, not legacy."""
    if getattr(g, "is_legacy", True):
        return jsonify({"error": "This endpoint requires a user account."}), 401
    return None


@users_bp.get("/me")
@require_role("owner", "admin", "trader", "viewer")
@rate_limited()
def get_profile():
    err = _require_user()
    if err:
        return err

    from database.connection import unit_of_work
    from database.repositories import (
        SubscriptionPlanRepository, UserRepository, UserSubscriptionRepository,
        WorkspaceRepository,
    )

    with unit_of_work() as session:
        user = UserRepository(session).get_by_id(g.user_id)
        if user is None:
            return jsonify({"error": "User not found."}), 404

        sub = UserSubscriptionRepository(session).get_active_by_user_id(g.user_id)
        plan_id = "free"
        if sub:
            plan = SubscriptionPlanRepository(session).get_by_id(sub.plan_id)
            if plan:
                plan_id = plan.plan_id

        workspaces = WorkspaceRepository(session).get_user_workspaces(g.user_id)

    return jsonify({
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "display_name": user.display_name,
        "role": user.role,
        "is_verified": user.is_verified,
        "is_active": user.is_active,
        "plan_id": plan_id,
        "preferences": user.preferences_json,
        "login_count": user.login_count,
        "last_login_at": user.last_login_at.isoformat() if user.last_login_at else None,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "workspaces": [
            {"id": w.id, "name": w.name, "slug": w.slug, "is_default": w.is_default}
            for w in workspaces
        ],
    })


@users_bp.put("/me")
@require_role("owner", "admin", "trader", "viewer")
@rate_limited()
def update_profile():
    err = _require_user()
    if err:
        return err

    body = request.get_json(silent=True) or {}
    allowed_fields = {"display_name", "preferences"}
    updates = {k: v for k, v in body.items() if k in allowed_fields}

    if not updates:
        return jsonify({"error": "No valid fields to update. Allowed: display_name, preferences"}), 400

    from database.connection import unit_of_work
    from database.repositories import UserRepository

    with unit_of_work() as session:
        user = UserRepository(session).get_by_id(g.user_id)
        if user is None:
            return jsonify({"error": "User not found."}), 404

        if "display_name" in updates:
            user.display_name = str(updates["display_name"])[:100]
        if "preferences" in updates:
            import json
            user.preferences_json = json.dumps(updates["preferences"], default=str)

        session.flush()

    return jsonify({"status": "updated", "message": "Profile updated."})


@users_bp.post("/change-password")
@require_role("owner", "admin", "trader", "viewer")
@rate_limited()
def change_password():
    err = _require_user()
    if err:
        return err

    body = request.get_json(silent=True) or {}
    current_password = body.get("current_password", "")
    new_password = body.get("new_password", "")

    if not current_password:
        return jsonify({"error": "Missing 'current_password'."}), 400
    if not new_password:
        return jsonify({"error": "Missing 'new_password'."}), 400
    if len(new_password) < 8:
        return jsonify({"error": "New password must be at least 8 characters."}), 400

    from database.connection import unit_of_work
    from database.repositories import UserRepository, UserSessionRepository

    with unit_of_work() as session:
        user = UserRepository(session).get_by_id(g.user_id)
        if user is None:
            return jsonify({"error": "User not found."}), 404

        if not verify_password(current_password, user.password_hash):
            return jsonify({"error": "Current password is incorrect."}), 403

        user.password_hash = hash_password(new_password)

        # Revoke all other sessions except current one
        UserSessionRepository(session).revoke_all_user_sessions(user.id)

    logger.info("Password changed for user_id=%s", g.user_id)
    return jsonify({"status": "changed", "message": "Password changed successfully."})


# ---------------------------------------------------------------------------
# Session Management
# ---------------------------------------------------------------------------


@users_bp.get("/sessions")
@require_role("owner", "admin", "trader", "viewer")
@rate_limited()
def list_sessions():
    err = _require_user()
    if err:
        return err

    from database.connection import unit_of_work
    from database.repositories import UserSessionRepository

    now = datetime.now(timezone.utc)

    with unit_of_work() as session:
        all_sessions = UserSessionRepository(session).get_user_sessions(g.user_id)

    active = []
    for s in all_sessions:
        expires_at = s.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if s.is_revoked or expires_at <= now:
            continue
        active.append({
            "id": s.id,
            "ip_address": s.ip_address,
            "user_agent": s.user_agent,
            "device_name": s.device_name,
            "created_at": s.created_at.isoformat() if s.created_at else None,
            "last_activity_at": s.last_activity_at.isoformat() if s.last_activity_at else None,
            "expires_at": s.expires_at.isoformat() if s.expires_at else None,
        })

    return jsonify({"sessions": active})


@users_bp.delete("/sessions/<session_id>")
@require_role("owner", "admin")
@rate_limited()
def revoke_session(session_id: str):
    err = _require_user()
    if err:
        return err

    from database.connection import unit_of_work
    from database.repositories import UserSessionRepository

    with unit_of_work() as session:
        repo = UserSessionRepository(session)
        user_sessions = repo.get_user_sessions(g.user_id)

        target = None
        for s in user_sessions:
            if s.id == session_id:
                target = s
                break

        if target is None or target.user_id != g.user_id:
            return jsonify({"error": "Session not found."}), 404

        if target.refresh_jti == getattr(g, "refresh_jti", None):
            return jsonify({"error": "Cannot revoke the current session."}), 400

        repo.revoke_by_jti(target.refresh_jti)

    from core.audit import record_action
    record_action("SESSION_REVOKED", role=g.auth_role, success=True,
                  ip_address=request.remote_addr or "unknown",
                  detail=f"user_id={g.user_id} session_id={session_id}")

    logger.info("Session %s revoked for user_id=%s", session_id, g.user_id)
    return jsonify({"status": "revoked"}), 200


# ---------------------------------------------------------------------------
# Avatar Upload
# ---------------------------------------------------------------------------


@users_bp.post("/me/avatar")
@require_role("owner", "admin", "trader")
@rate_limited()
def upload_avatar():
    err = _require_user()
    if err:
        return err

    if "avatar" not in request.files:
        return jsonify({"error": "Missing 'avatar' file."}), 400

    file = request.files["avatar"]
    if not file.filename:
        return jsonify({"error": "Empty filename."}), 400

    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        return jsonify({"error": "Uploaded file must be an image."}), 400

    import os
    upload_dir = os.path.join(os.path.dirname(config.DATABASE_PATH), "avatars")
    os.makedirs(upload_dir, exist_ok=True)

    import hashlib
    _, ext = os.path.splitext(file.filename)
    safe_ext = ext if ext in (".png", ".jpg", ".jpeg", ".gif", ".webp") else ".png"
    filename = f"{hashlib.sha256(g.user_id.encode()).hexdigest()}{safe_ext}"
    filepath = os.path.join(upload_dir, filename)
    file.save(filepath)

    avatar_url = f"/avatars/{filename}"

    from database.connection import unit_of_work
    from database.repositories import UserRepository

    with unit_of_work() as session:
        user = UserRepository(session).get_by_id(g.user_id)
        if user is None:
            return jsonify({"error": "User not found."}), 404
        user.avatar_url = avatar_url
        session.flush()

    from core.audit import record_action
    record_action("AVATAR_UPLOAD", role=g.auth_role, success=True,
                  ip_address=request.remote_addr or "unknown",
                  detail=f"user_id={g.user_id}")

    logger.info("Avatar uploaded for user_id=%s: %s", g.user_id, avatar_url)
    return jsonify({"avatar_url": avatar_url}), 200


# ---------------------------------------------------------------------------
# API Keys
# ---------------------------------------------------------------------------


@users_bp.get("/me/api-keys")
@require_role("owner", "admin", "trader")
@rate_limited()
def list_api_keys():
    err = _require_user()
    if err:
        return err

    from database.connection import unit_of_work
    from database.repositories import ApiKeyRepository

    with unit_of_work() as session:
        keys = ApiKeyRepository(session).get_user_keys(g.user_id)

    return jsonify({
        "api_keys": [
            {
                "id": k.id,
                "name": k.name,
                "key_prefix": k.key_prefix,
                "created_at": k.created_at.isoformat() if k.created_at else None,
                "last_used_at": k.last_used_at.isoformat() if k.last_used_at else None,
                "is_active": k.is_active,
            }
            for k in keys
        ],
    })


@users_bp.post("/me/api-keys")
@require_role("owner", "admin", "trader")
@rate_limited()
def create_api_key():
    err = _require_user()
    if err:
        return err

    body = request.get_json(silent=True) or {}
    name = body.get("name", "").strip()
    if not name:
        return jsonify({"error": "Missing 'name' for the API key."}), 400

    # Enforce plan limits on number of keys
    from database.connection import unit_of_work
    from database.repositories import (
        ApiKeyRepository, SubscriptionPlanRepository, UserSubscriptionRepository,
    )

    with unit_of_work() as session:
        sub = UserSubscriptionRepository(session).get_active_by_user_id(g.user_id)
        max_keys = 0
        if sub:
            plan = SubscriptionPlanRepository(session).get_by_id(sub.plan_id)
            if plan and plan.features_json:
                import json
                features = json.loads(plan.features_json)
                max_keys = features.get("max_api_keys", 0)
        else:
            max_keys = config.SUBSCRIPTION_PLANS.get("free", {}).get("max_api_keys", 0)

        existing = ApiKeyRepository(session).get_user_keys(g.user_id, active_only=True)
        if len(existing) >= max_keys:
            return jsonify({
                "error": f"API key limit reached ({max_keys}). Upgrade your plan to create more keys."
            }), 403

    # Generate key
    raw_key = f"fbot_{secrets.token_urlsafe(32)}"
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    key_prefix = raw_key[-4:]

    from database.models import ApiKey

    with unit_of_work() as session:
        repo = ApiKeyRepository(session)
        api_key = ApiKey(
            user_id=g.user_id,
            name=name,
            key_hash=key_hash,
            key_prefix=key_prefix,
        )
        repo.save(api_key)

    logger.info("API key created for user_id=%s name=%s", g.user_id, name)

    return jsonify({
        "status": "created",
        "api_key": {
            "id": api_key.id,
            "name": name,
            "key_prefix": key_prefix,
            "raw_key": raw_key,  # Only shown once!
        },
        "message": "Save this key now — it will not be shown again.",
    }), 201


@users_bp.delete("/me/api-keys/<key_id>")
@require_role("owner", "admin", "trader")
@rate_limited()
def revoke_api_key(key_id: str):
    err = _require_user()
    if err:
        return err

    from database.connection import unit_of_work
    from database.repositories import ApiKeyRepository

    with unit_of_work() as session:
        key = ApiKeyRepository(session).get_by_id(key_id)
        if key is None or key.user_id != g.user_id:
            return jsonify({"error": "API key not found."}), 404

        ApiKeyRepository(session).revoke(key_id)

    return jsonify({"status": "revoked", "message": "API key revoked."})

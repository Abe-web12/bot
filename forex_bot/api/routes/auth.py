"""
auth.py (routes)
==================
Legacy (single-operator):
  POST /api/auth/login    — exchange DASHBOARD_PASSWORD or VIEWER_PASSWORD for a token pair
  POST /api/auth/refresh  — exchange a refresh token for a new token pair (rotates the old one)
  POST /api/auth/logout   — revoke a refresh token
  GET  /api/auth/me       — current authenticated role

Multi-user (SaaS):
  POST /api/auth/register              — create a new user account
  POST /api/auth/login                 — email + password login (returns token pair)
  POST /api/auth/refresh               — refresh a user token pair
  POST /api/auth/logout                — revoke a user session
  POST /api/auth/verify-email          — verify email with token
  POST /api/auth/resend-verification   — resend verification email
  POST /api/auth/forgot-password       — send password reset email
  POST /api/auth/reset-password        — reset password with token
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, request

import config
from api.auth import (
    AuthError, authenticate_credentials, create_user_token_pair, decode_access_token,
    generate_token, hash_password, is_user_token, issue_token_pair, refresh_access_token,
    refresh_user_token, require_role, revoke_refresh_token, revoke_user_session,
    verify_password,
)
from api.rate_limit import login_rate_limited, rate_limited

logger = logging.getLogger("api.routes.auth")

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# =========================================================================
# Legacy single-operator endpoints (unchanged behavior)
# =========================================================================


@auth_bp.post("/login")
@login_rate_limited
def login():
    """
    Login endpoint supports BOTH legacy and user-based auth.
    1. If body has "email" and "password": authenticate against User table
    2. If body has only "password": authenticate against legacy DASHBOARD_PASSWORD
    """
    body = request.get_json(silent=True) or {}
    ip = request.remote_addr or "unknown"

    email = body.get("email", "")
    password = body.get("password", "")

    if not password:
        return jsonify({"error": "Missing 'password'."}), 400

    # ---- Multi-user (email + password) ----
    if email:
        from database.connection import unit_of_work
        from database.repositories import UserRepository

        with unit_of_work() as session:
            repo = UserRepository(session)
            user = repo.get_by_email(email.strip().lower())

        if user is None or not verify_password(password, user.password_hash):
            logger.warning("Failed user login attempt for %s from %s.", email, ip)
            from core.audit import record_action
            record_action("LOGIN", role=None, success=False, ip_address=ip, detail=f"invalid email/password for {email}")
            return jsonify({"error": "Invalid email or password."}), 401

        if not user.is_active:
            return jsonify({"error": "Account is deactivated."}), 403

        try:
            tokens = create_user_token_pair(user.id, user.role)
        except AuthError as exc:
            return jsonify({"error": str(exc)}), exc.status

        with unit_of_work() as session:
            UserRepository(session).update_last_login(user.id, ip)

        logger.info("User login successful: email=%s role=%s", email, user.role)
        from core.audit import record_action
        record_action("LOGIN", role=user.role, success=True, ip_address=ip, detail=email)

        return jsonify({
            "access_token": tokens.access_token,
            "refresh_token": tokens.refresh_token,
            "token_type": "Bearer",
            "expires_in": tokens.access_expires_in,
            "refresh_expires_in": tokens.refresh_expires_in,
            "role": user.role,
            "user_id": user.id,
            "email": user.email,
            "username": user.username,
            "display_name": user.display_name,
            "is_verified": user.is_verified,
        })

    # ---- Legacy (password only) ----
    role = authenticate_credentials(password)
    if role is None:
        logger.warning("Failed legacy login attempt from %s.", ip)
        from core.audit import record_action
        record_action("LOGIN", role=None, success=False, ip_address=ip, detail="invalid credentials")
        return jsonify({"error": "Invalid credentials."}), 401

    try:
        tokens = issue_token_pair(role)
    except AuthError as exc:
        return jsonify({"error": str(exc)}), exc.status

    logger.info("Legacy login successful, role=%s.", role)
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

    # Try user refresh first, fall back to legacy
    try:
        tokens = refresh_user_token(refresh_token)
        return jsonify({
            "access_token": tokens.access_token,
            "refresh_token": tokens.refresh_token,
            "token_type": "Bearer",
            "expires_in": tokens.access_expires_in,
            "refresh_expires_in": tokens.refresh_expires_in,
        })
    except AuthError:
        pass

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
        revoke_user_session(refresh_token)
        revoke_refresh_token(refresh_token)
    from core.audit import record_action
    record_action("LOGOUT", ip_address=request.remote_addr or "unknown")
    return jsonify({"status": "logged_out"})


@auth_bp.get("/me")
@require_role("owner", "admin", "trader", "viewer")
def me():
    from flask import g

    if g.is_legacy:
        return jsonify({"role": g.auth_role, "is_legacy": True})

    from database.connection import unit_of_work
    from database.repositories import UserSubscriptionRepository, UserRepository, WorkspaceRepository

    try:
        with unit_of_work() as session:
            user = UserRepository(session).get_by_id(g.user_id)
            sub = UserSubscriptionRepository(session).get_active_by_user_id(g.user_id)
            workspaces = WorkspaceRepository(session).get_user_workspaces(g.user_id)
    except Exception as exc:
        logger.error("Failed to fetch user data for /me: %s", exc)
        return jsonify({"role": g.auth_role, "user_id": g.user_id})

    plan_id = None
    if sub:
        from database.repositories import SubscriptionPlanRepository
        try:
            with unit_of_work() as session2:
                plan = SubscriptionPlanRepository(session2).get_by_id(sub.plan_id)
                if plan:
                    plan_id = plan.plan_id
        except Exception:
            pass

    return jsonify({
        "role": g.auth_role,
        "user_id": g.user_id,
        "is_legacy": False,
        "email": user.email if user else None,
        "username": user.username if user else None,
        "display_name": user.display_name if user else None,
        "is_verified": user.is_verified if user else None,
        "is_active": user.is_active if user else None,
        "plan_id": plan_id or "free",
        "workspaces": [
            {"id": w.id, "name": w.name, "slug": w.slug, "is_default": w.is_default}
            for w in (workspaces or [])
        ],
    })


# =========================================================================
# Multi-user registration & email verification
# =========================================================================


def _validate_email(email: str) -> str | None:
    """Basic email validation. Returns error message or None."""
    try:
        from email_validator import validate_email as ve
        result = ve(email, check_deliverability=False)
        return result.normalized
    except ImportError:
        pass
    import re
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return None
    return email.strip().lower()


@auth_bp.post("/register")
@login_rate_limited
def register():
    """
    Create a new user account. Automatically creates a default workspace
    and assigns the Free subscription plan.
    Body: {"email": "...", "password": "...", "username": "..."}
    """
    body = request.get_json(silent=True) or {}
    email = _validate_email(body.get("email", ""))
    password = body.get("password", "")
    username = body.get("username", "").strip()

    if not email:
        return jsonify({"error": "A valid email is required."}), 400
    if not password:
        return jsonify({"error": "Password is required."}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400
    if not username or len(username) < 3:
        return jsonify({"error": "Username must be at least 3 characters."}), 400
    if not username.isalnum() and "_" not in username:
        return jsonify({"error": "Username may only contain letters, numbers, and underscores."}), 400

    from database.connection import unit_of_work
    from database.repositories import (
        SubscriptionPlanRepository, UserRepository, UserSubscriptionRepository,
        WorkspaceMemberRepository, WorkspaceRepository,
    )
    from database.models import User, UserSubscription, Workspace, WorkspaceMember

    ip = request.remote_addr or "unknown"

    with unit_of_work() as session:
        user_repo = UserRepository(session)

        if user_repo.email_exists(email):
            return jsonify({"error": "An account with this email already exists."}), 409
        if user_repo.username_exists(username):
            return jsonify({"error": "This username is already taken."}), 409

        user = User(
            email=email,
            username=username,
            password_hash=hash_password(password),
            role="owner",
            is_active=True,
            is_verified=False,
        )
        user_repo.save(user)

        # Create default workspace
        import re
        slug = re.sub(r"[^a-z0-9-]", "", username.lower().replace(" ", "-"))[:80]
        base_slug = slug
        ws_repo = WorkspaceRepository(session)
        counter = 1
        while ws_repo.slug_exists(slug):
            slug = f"{base_slug}-{counter}"
            counter += 1

        workspace = Workspace(
            name=f"{username}'s Workspace",
            slug=slug,
            owner_id=user.id,
            is_default=True,
        )
        ws_repo.save(workspace)

        # Add owner as workspace member
        member = WorkspaceMember(
            workspace_id=workspace.id,
            user_id=user.id,
            role="owner",
        )
        WorkspaceMemberRepository(session).save(member)

        # Assign Free subscription plan
        plan = SubscriptionPlanRepository(session).get_by_plan_id("free")
        if plan:
            now = datetime.now(timezone.utc)
            UserSubscriptionRepository(session).save(UserSubscription(
                user_id=user.id,
                plan_id=plan.id,
                status="active",
                current_period_start=now,
                current_period_end=now + timedelta(days=36500),  # ~100 years for free
            ))

    # Try to send verification email (gracefully ignore failures)
    try:
        _send_verification_email(user.id, email)
    except Exception:
        logger.warning("Could not send verification email to %s (SMTP may not be configured).", email)

    # Try to send welcome email (gracefully ignore failures)
    try:
        from services.email_service import email_service
        if email_service.is_enabled:
            email_service.send(email, "welcome", {
                "dashboard_url": f"{config.SITE_URL}/dashboard",
            })
    except Exception:
        logger.warning("Could not send welcome email to %s", email)

    logger.info("New user registered: email=%s username=%s ip=%s", email, username, ip)
    from core.audit import record_action
    record_action("REGISTER", role="owner", success=True, ip_address=ip, detail=email)

    return jsonify({
        "status": "registered",
        "message": "Account created successfully. Please check your email to verify your account.",
        "email": email,
        "username": username,
    }), 201


def _send_verification_email(user_id: str, email: str) -> None:
    """Create a verification token and send the email."""
    from database.connection import unit_of_work
    from database.repositories import EmailVerificationRepository
    from database.models import EmailVerification

    token = generate_token()
    now = datetime.now(timezone.utc)

    with unit_of_work() as session:
        repo = EmailVerificationRepository(session)
        repo.save(EmailVerification(
            user_id=user_id,
            email=email,
            token=token,
            expires_at=now + timedelta(hours=24),
        ))

    from services.email_service import email_service
    verify_url = f"{config.SITE_URL}/verify-email?token={token}"
    success, msg = email_service.send(email, "verify_email", {
        "verify_url": verify_url,
    })
    if not success:
        logger.warning("Verification email to %s: %s", email, msg)


@auth_bp.post("/verify-email")
@rate_limited()
def verify_email():
    """
    Verify email address with a token sent via email.
    Body: {"token": "..."}
    """
    body = request.get_json(silent=True) or {}
    token = body.get("token", "")
    if not token:
        return jsonify({"error": "Missing 'token'."}), 400

    from database.connection import unit_of_work
    from database.repositories import EmailVerificationRepository, UserRepository

    now = datetime.now(timezone.utc)

    with unit_of_work() as session:
        ver_repo = EmailVerificationRepository(session)
        verification = ver_repo.get_by_token(token)

        if verification is None:
            return jsonify({"error": "Invalid verification token."}), 404
        if verification.is_used or verification.verified_at is not None:
            return jsonify({"error": "This verification link has already been used."}), 400
        if verification.expires_at.tzinfo is None:
            expires = verification.expires_at.replace(tzinfo=timezone.utc)
        else:
            expires = verification.expires_at
        if expires <= now:
            return jsonify({"error": "Verification token has expired. Request a new one."}), 400

        ver_repo.mark_verified(verification.id)

        # Mark user as verified
        user_repo = UserRepository(session)
        user = user_repo.get_by_id(verification.user_id)
        if user:
            user.is_verified = True
            session.flush()

    from core.audit import record_action
    record_action("VERIFY_EMAIL", success=True, ip_address=request.remote_addr or "unknown",
                  detail=f"user_id={verification.user_id}")

    return jsonify({"status": "verified", "message": "Email verified successfully."})


@auth_bp.post("/resend-verification")
@login_rate_limited
def resend_verification():
    """
    Resend the verification email.
    Body: {"email": "..."}
    """
    body = request.get_json(silent=True) or {}
    email = _validate_email(body.get("email", ""))
    if not email:
        return jsonify({"error": "A valid email is required."}), 400

    from database.connection import unit_of_work
    from database.repositories import UserRepository

    with unit_of_work() as session:
        user = UserRepository(session).get_by_email(email)

    if user is None:
        # Don't reveal whether the email exists
        return jsonify({"status": "sent", "message": "If the account exists, a verification email has been sent."})

    if user.is_verified:
        return jsonify({"status": "already_verified", "message": "This email is already verified."})

    try:
        _send_verification_email(user.id, email)
    except Exception as exc:
        logger.error("Failed to resend verification email: %s", exc)
        return jsonify({"error": "Failed to send verification email. SMTP may not be configured."}), 503

    return jsonify({"status": "sent", "message": "Verification email sent."})


# =========================================================================
# Password reset
# =========================================================================


@auth_bp.post("/forgot-password")
@login_rate_limited
def forgot_password():
    """
    Send a password reset email.
    Body: {"email": "..."}
    """
    body = request.get_json(silent=True) or {}
    email = _validate_email(body.get("email", ""))
    if not email:
        return jsonify({"error": "A valid email is required."}), 400

    from database.connection import unit_of_work
    from database.repositories import PasswordResetRepository, UserRepository
    from database.models import PasswordReset

    with unit_of_work() as session:
        user = UserRepository(session).get_by_email(email)

    if user is None:
        return jsonify({"status": "sent", "message": "If the account exists, a password reset email has been sent."})

    if not user.is_active:
        return jsonify({"error": "Account is deactivated."}), 403

    token = generate_token()
    now = datetime.now(timezone.utc)

    with unit_of_work() as session:
        PasswordResetRepository(session).save(PasswordReset(
            user_id=user.id,
            email=email,
            token=token,
            expires_at=now + timedelta(hours=1),
        ))

    from services.email_service import email_service
    reset_url = f"{config.SITE_URL}/reset-password?token={token}"
    success, msg = email_service.send(email, "password_reset", {
        "reset_url": reset_url,
    })

    if not success:
        logger.warning("Password reset email to %s: %s", email, msg)
        return jsonify({"error": msg}), 503

    return jsonify({"status": "sent", "message": "Password reset email sent."})


@auth_bp.post("/reset-password")
@rate_limited()
def reset_password():
    """
    Reset password using a token from the forgot-password email.
    Body: {"token": "...", "password": "..."}
    """
    body = request.get_json(silent=True) or {}
    token = body.get("token", "")
    password = body.get("password", "")

    if not token:
        return jsonify({"error": "Missing 'token'."}), 400
    if not password:
        return jsonify({"error": "Missing 'password'."}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400

    from database.connection import unit_of_work
    from database.repositories import PasswordResetRepository, UserRepository

    now = datetime.now(timezone.utc)

    with unit_of_work() as session:
        reset_repo = PasswordResetRepository(session)
        reset = reset_repo.get_by_token(token)

        if reset is None:
            return jsonify({"error": "Invalid reset token."}), 404
        if reset.is_used:
            return jsonify({"error": "This reset link has already been used."}), 400
        if reset.expires_at.tzinfo is None:
            expires = reset.expires_at.replace(tzinfo=timezone.utc)
        else:
            expires = reset.expires_at
        if expires <= now:
            return jsonify({"error": "Reset token has expired. Request a new one."}), 400

        user_repo = UserRepository(session)
        user = user_repo.get_by_id(reset.user_id)
        if user is None:
            return jsonify({"error": "User not found."}), 404

        user.password_hash = hash_password(password)
        reset_repo.mark_used(reset.id)

        # Revoke all existing sessions for security
        from database.repositories import UserSessionRepository
        UserSessionRepository(session).revoke_all_user_sessions(user.id)

    logger.info("Password reset successful for user_id=%s", reset.user_id)
    from core.audit import record_action
    record_action("PASSWORD_RESET", success=True, ip_address=request.remote_addr or "unknown",
                  detail=f"user_id={reset.user_id}")

    return jsonify({"status": "reset", "message": "Password reset successfully. Please log in with your new password."})

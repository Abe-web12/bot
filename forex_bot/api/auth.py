"""
auth.py
========
JWT authentication and role-based access control for the API layer.
Supports both the legacy single-operator mode (DASHBOARD_PASSWORD /
VIEWER_PASSWORD) and the new multi-user SaaS mode (email + password
with User table, workspaces, subscriptions).

Design — dual auth mode:
  1. Legacy single-operator: role="admin" or "viewer", no user_id.
     Authenticated by matching DASHBOARD_PASSWORD or VIEWER_PASSWORD.
     g.auth_role = "admin" | "viewer"
  2. Multi-user SaaS: role from User.role (owner/admin/trader/viewer),
     authenticated by email+password against bcrypt hash in User table.
     g.auth_role = user.role, g.user_id = user.id, g.current_workspace_id

Tokens:
  - Legacy tokens use JWT_SECRET/SECRET_KEY, embed role in "sub" + "role"
  - User tokens use USER_JWT_SECRET (fallback to JWT_SECRET), embed
    user_id in "sub" and role in "role"
  - Both issue access (short-lived) + refresh (long-lived, single-use)
  - User refresh tokens create UserSession records for audit/revocation
"""

from __future__ import annotations

import logging
import secrets
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Callable

import bcrypt
import jwt
from flask import g, jsonify, request

import config

logger = logging.getLogger("api.auth")

_ALGORITHM = "HS256"

_ROLE_HIERARCHY = {"owner": 0, "admin": 1, "trader": 2, "viewer": 3}

# ---------------------------------------------------------------------------
# Exceptions
# ---------------------------------------------------------------------------

class AuthError(Exception):
    def __init__(self, message: str, status: int = 401) -> None:
        super().__init__(message)
        self.status = status


# ---------------------------------------------------------------------------
# DTOs
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class TokenPair:
    access_token: str
    refresh_token: str
    access_expires_in: int
    refresh_expires_in: int


# ---------------------------------------------------------------------------
# Password helpers
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=config.BCRYPT_ROUNDS)).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception:
        return False


def generate_token(length: int = 64) -> str:
    """Generate a cryptographically secure random token for email verification
    or password reset."""
    return secrets.token_urlsafe(length)


# ---------------------------------------------------------------------------
# Secret resolution
# ---------------------------------------------------------------------------

def _legacy_secret() -> str:
    """Secret for legacy single-operator JWT tokens."""
    secret = config.JWT_SECRET or config.SECRET_KEY
    if not secret:
        raise AuthError(
            "JWT_SECRET/SECRET_KEY is not configured on the server. "
            "Set one of them in .env before using authenticated endpoints.",
            status=503,
        )
    return secret


def _user_secret() -> str:
    """Secret for multi-user SaaS JWT tokens. Falls back to legacy secret."""
    return config.USER_JWT_SECRET or _legacy_secret()


# ---------------------------------------------------------------------------
# Legacy single-operator auth
# ---------------------------------------------------------------------------

def authenticate_credentials(password: str) -> str | None:
    """
    Returns the granted role ("admin" or "viewer") for a given password,
    or None if the password matches neither configured credential.
    """
    if config.DASHBOARD_PASSWORD and password == config.DASHBOARD_PASSWORD:
        return "admin"
    if config.VIEWER_PASSWORD and password == config.VIEWER_PASSWORD:
        return "viewer"
    return None


def issue_token_pair(role: str) -> TokenPair:
    """Issue a legacy token pair (single-operator mode)."""
    now = datetime.now(timezone.utc)
    access_exp = now + timedelta(seconds=config.JWT_ACCESS_TOKEN_TTL_SECONDS)
    refresh_exp = now + timedelta(seconds=config.JWT_REFRESH_TOKEN_TTL_SECONDS)
    refresh_jti = str(uuid.uuid4())

    access_payload = {
        "sub": role, "role": role, "type": "access",
        "jti": str(uuid.uuid4()), "iat": now, "exp": access_exp,
    }
    refresh_payload = {
        "sub": role, "role": role, "type": "refresh",
        "jti": refresh_jti, "iat": now, "exp": refresh_exp,
    }

    access_token = jwt.encode(access_payload, _legacy_secret(), algorithm=_ALGORITHM)
    refresh_token = jwt.encode(refresh_payload, _legacy_secret(), algorithm=_ALGORITHM)

    _register_refresh_token(refresh_jti, role, refresh_exp)

    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        access_expires_in=config.JWT_ACCESS_TOKEN_TTL_SECONDS,
        refresh_expires_in=config.JWT_REFRESH_TOKEN_TTL_SECONDS,
    )


def _register_refresh_token(jti: str, role: str, expires_at: datetime) -> None:
    from database.connection import unit_of_work
    from database.repositories import RefreshTokenRepository

    with unit_of_work() as session:
        RefreshTokenRepository(session).register(jti=jti, role=role, expires_at=expires_at)


def refresh_access_token(refresh_token: str) -> TokenPair:
    """Legacy refresh: validates, revokes old, issues new pair."""
    try:
        payload = jwt.decode(refresh_token, _legacy_secret(), algorithms=[_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise AuthError("Refresh token has expired. Please log in again.")
    except jwt.InvalidTokenError as exc:
        raise AuthError(f"Invalid refresh token: {exc}")

    if payload.get("type") != "refresh":
        raise AuthError("Token is not a refresh token.")

    jti = payload.get("jti")
    role = payload.get("role")
    if not jti or not role:
        raise AuthError("Refresh token payload is malformed.")

    from database.connection import unit_of_work
    from database.repositories import RefreshTokenRepository

    with unit_of_work() as session:
        repo = RefreshTokenRepository(session)
        if not repo.is_valid(jti):
            raise AuthError(
                "Refresh token has already been used or revoked. "
                "This may indicate token theft — all sessions should be re-authenticated."
            )
        repo.revoke(jti)

    return issue_token_pair(role)


def revoke_refresh_token(refresh_token: str) -> None:
    """Legacy logout — revokes a refresh token immediately."""
    try:
        payload = jwt.decode(refresh_token, _legacy_secret(), algorithms=[_ALGORITHM], options={"verify_exp": False})
    except jwt.InvalidTokenError:
        return

    jti = payload.get("jti")
    if not jti:
        return

    from database.connection import unit_of_work
    from database.repositories import RefreshTokenRepository

    with unit_of_work() as session:
        RefreshTokenRepository(session).revoke(jti)


# ---------------------------------------------------------------------------
# Multi-user SaaS auth
# ---------------------------------------------------------------------------

def create_user_token_pair(user_id: str, role: str) -> TokenPair:
    """Issue a user-based token pair (SaaS multi-tenant mode)."""
    now = datetime.now(timezone.utc)
    access_exp = now + timedelta(seconds=config.USER_JWT_ACCESS_TOKEN_TTL_SECONDS)
    refresh_exp = now + timedelta(seconds=config.USER_JWT_REFRESH_TOKEN_TTL_SECONDS)
    refresh_jti = str(uuid.uuid4())

    access_payload = {
        "sub": user_id, "user_id": user_id, "role": role, "type": "access",
        "jti": str(uuid.uuid4()), "iat": now, "exp": access_exp,
    }
    refresh_payload = {
        "sub": user_id, "user_id": user_id, "role": role, "type": "refresh",
        "jti": refresh_jti, "iat": now, "exp": refresh_exp,
    }

    access_token = jwt.encode(access_payload, _user_secret(), algorithm=_ALGORITHM)
    refresh_token = jwt.encode(refresh_payload, _user_secret(), algorithm=_ALGORITHM)

    _register_user_session(user_id, refresh_jti, refresh_exp)

    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        access_expires_in=config.USER_JWT_ACCESS_TOKEN_TTL_SECONDS,
        refresh_expires_in=config.USER_JWT_REFRESH_TOKEN_TTL_SECONDS,
    )


def _register_user_session(user_id: str, refresh_jti: str, expires_at: datetime) -> None:
    """Create a UserSession record for the refresh token."""
    from database.connection import unit_of_work
    from database.models import UserSession
    from database.repositories import UserSessionRepository

    ip_address = request.remote_addr or "unknown"
    user_agent = request.headers.get("User-Agent", "")[:500]

    with unit_of_work() as session:
        session_record = UserSession(
            id=str(uuid.uuid4()),
            user_id=user_id,
            refresh_jti=refresh_jti,
            ip_address=ip_address,
            user_agent=user_agent,
            device_name=None,
            is_revoked=False,
            expires_at=expires_at,
            last_activity_at=None,
        )
        UserSessionRepository(session).save(session_record)


def refresh_user_token(refresh_token: str) -> TokenPair:
    """User refresh: validates, revokes old session, issues new pair."""
    try:
        payload = jwt.decode(refresh_token, _user_secret(), algorithms=[_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise AuthError("Refresh token has expired. Please log in again.")
    except jwt.InvalidTokenError as exc:
        raise AuthError(f"Invalid refresh token: {exc}")

    if payload.get("type") != "refresh":
        raise AuthError("Token is not a refresh token.")

    user_id = payload.get("user_id")
    role = payload.get("role")
    jti = payload.get("jti")
    if not user_id or not jti:
        raise AuthError("Refresh token payload is malformed.")

    from database.connection import unit_of_work
    from database.repositories import UserSessionRepository

    with unit_of_work() as session:
        repo = UserSessionRepository(session)
        session_record = repo.get_by_jti(jti)
        if session_record is None or session_record.is_revoked:
            raise AuthError(
                "Refresh token has already been used or revoked. "
                "This may indicate token theft — all sessions should be re-authenticated."
            )
        expires_at = session_record.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at <= datetime.now(timezone.utc):
            raise AuthError("Refresh token has expired.")
        repo.revoke_by_jti(jti)

    return create_user_token_pair(user_id, role)


def revoke_user_session(refresh_token: str) -> None:
    """User logout — revokes the session linked to this refresh token."""
    try:
        payload = jwt.decode(refresh_token, _user_secret(), algorithms=[_ALGORITHM], options={"verify_exp": False})
    except jwt.InvalidTokenError:
        return

    jti = payload.get("jti")
    if not jti:
        return

    from database.connection import unit_of_work
    from database.repositories import UserSessionRepository

    with unit_of_work() as session:
        UserSessionRepository(session).revoke_by_jti(jti)


# ---------------------------------------------------------------------------
# Token decoding
# ---------------------------------------------------------------------------

def decode_access_token(access_token: str) -> dict:
    """Decode an access token, trying user secret first, then legacy."""
    for secret_fn in (_user_secret, _legacy_secret):
        try:
            payload = jwt.decode(access_token, secret_fn(), algorithms=[_ALGORITHM])
            if payload.get("type") == "access":
                return payload
        except jwt.ExpiredSignatureError:
            raise AuthError("Access token has expired.")
        except jwt.InvalidTokenError:
            continue
    raise AuthError("Invalid access token.")


def _extract_bearer_token() -> str:
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        raise AuthError("Missing or malformed Authorization header. Expected 'Bearer <token>'.")
    return header[len("Bearer "):].strip()


def is_user_token(payload: dict) -> bool:
    """Returns True if this is a user-based token (has user_id)."""
    return "user_id" in payload and payload.get("user_id") is not None


# ---------------------------------------------------------------------------
# RBAC — extended decorator supporting both legacy and user tokens
# ---------------------------------------------------------------------------

def require_role(*allowed_roles: str) -> Callable:
    """
    Decorator for Flask view functions. Validates JWT access token
    (legacy or user-based) and checks the token's role is in allowed_roles.

    Sets on g:
      g.auth_role — the role string
      g.user_id — user ID (None for legacy tokens)
      g.is_legacy — True if this is a legacy single-operator token

    Usage:
      @require_role("admin")            — mutating endpoints
      @require_role("admin", "viewer")  — read-only endpoints
      @require_role("owner", "admin")   — SaaS owner/admin endpoints
    """
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def wrapper(*args, **kwargs):
            try:
                token = _extract_bearer_token()
                payload = decode_access_token(token)
            except AuthError as exc:
                return jsonify({"error": str(exc)}), exc.status

            role = payload.get("role")
            user_id = payload.get("user_id")

            if role not in allowed_roles:
                # Check hierarchy: if the token's role is higher in the
                # hierarchy than the most permissive allowed role, permit.
                token_rank = _ROLE_HIERARCHY.get(role, 99)
                lowest_allowed = max(_ROLE_HIERARCHY.get(r, 99) for r in allowed_roles)
                if token_rank > lowest_allowed:
                    return jsonify({
                        "error": f"Role '{role}' is not permitted to access this endpoint. "
                                 f"Required one of: {', '.join(allowed_roles)}"
                    }), 403

            g.auth_role = role
            g.user_id = user_id
            g.is_legacy = user_id is None
            return f(*args, **kwargs)
        return wrapper
    return decorator

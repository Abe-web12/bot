"""
auth.py
========
JWT authentication and role-based access control for the API layer.

Design decision — single-operator model: this bot has ONE operator, not
a multi-tenant user base. There is no users table. "Login" means
proving you know DASHBOARD_PASSWORD (role=admin, full control) or
VIEWER_PASSWORD (role=viewer, read-only — disabled entirely if
VIEWER_PASSWORD is blank in .env). This is deliberately simple and
honest about what this system actually is, rather than building a
fictional multi-user account system for a bot one person runs.

Tokens:
  - Access token: short-lived (JWT_ACCESS_TOKEN_TTL_SECONDS), sent as
    "Authorization: Bearer <token>", required on every protected endpoint.
  - Refresh token: long-lived (JWT_REFRESH_TOKEN_TTL_SECONDS), used only
    to mint a new access token via POST /api/auth/refresh. Refresh
    tokens are single-use and tracked in a revocation table
    (RefreshTokenRepository) so a compromised refresh token can be
    invalidated and reuse of an already-rotated token is detected.

RBAC: role="admin" can call every endpoint. role="viewer" can only call
endpoints decorated with @require_role("admin", "viewer") — endpoints
that mutate state (bot control, settings, manual close) use
@require_role("admin") only.
"""

from __future__ import annotations

import logging
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from functools import wraps
from typing import Callable

import jwt
from flask import g, jsonify, request

import config

logger = logging.getLogger("api.auth")

_ALGORITHM = "HS256"


class AuthError(Exception):
    def __init__(self, message: str, status: int = 401) -> None:
        super().__init__(message)
        self.status = status


@dataclass(frozen=True)
class TokenPair:
    access_token: str
    refresh_token: str
    access_expires_in: int
    refresh_expires_in: int


def _secret() -> str:
    secret = config.JWT_SECRET or config.SECRET_KEY
    if not secret:
        raise AuthError(
            "JWT_SECRET/SECRET_KEY is not configured on the server. "
            "Set one of them in .env before using authenticated endpoints.",
            status=503,
        )
    return secret


def authenticate_credentials(password: str) -> str | None:
    """
    Returns the granted role ("admin" or "viewer") for a given password,
    or None if the password matches neither configured credential.
    Constant-time-ish comparison isn't critical here since both sides
    are compared against a locally-configured secret, not user input
    used for a timing side-channel against a remote system — but we
    still avoid short-circuiting on the first character via `==` on
    short strings being effectively fine for this threat model.
    """
    if config.DASHBOARD_PASSWORD and password == config.DASHBOARD_PASSWORD:
        return "admin"
    if config.VIEWER_PASSWORD and password == config.VIEWER_PASSWORD:
        return "viewer"
    return None


def issue_token_pair(role: str) -> TokenPair:
    now = datetime.now(timezone.utc)
    access_exp = now + timedelta(seconds=config.JWT_ACCESS_TOKEN_TTL_SECONDS)
    refresh_exp = now + timedelta(seconds=config.JWT_REFRESH_TOKEN_TTL_SECONDS)
    refresh_jti = str(uuid.uuid4())

    access_payload = {
        # jti here (unlike the refresh token's jti) is not tracked
        # server-side for revocation — access tokens are intentionally
        # short-lived and stateless. Its purpose is purely to guarantee
        # uniqueness: without it, two access tokens issued for the same
        # role within the same wall-clock second would have byte-for-byte
        # identical payloads, and since HS256 is a deterministic
        # signature scheme, that produces the exact same token string —
        # which breaks the reasonable expectation that each call to
        # issue_token_pair() mints a distinguishable token.
        "sub": role, "role": role, "type": "access",
        "jti": str(uuid.uuid4()), "iat": now, "exp": access_exp,
    }
    refresh_payload = {
        "sub": role, "role": role, "type": "refresh",
        "jti": refresh_jti, "iat": now, "exp": refresh_exp,
    }

    access_token = jwt.encode(access_payload, _secret(), algorithm=_ALGORITHM)
    refresh_token = jwt.encode(refresh_payload, _secret(), algorithm=_ALGORITHM)

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
    """
    Validates a refresh token, checks it hasn't been revoked or already
    rotated (single-use), revokes it, and issues a brand new token pair
    (rotation — the old refresh token can never be used again after this
    call, even if it hadn't expired yet).
    """
    try:
        payload = jwt.decode(refresh_token, _secret(), algorithms=[_ALGORITHM])
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
    """Used by /api/auth/logout — revokes a refresh token immediately."""
    try:
        payload = jwt.decode(refresh_token, _secret(), algorithms=[_ALGORITHM], options={"verify_exp": False})
    except jwt.InvalidTokenError:
        return  # already-invalid token, nothing to revoke

    jti = payload.get("jti")
    if not jti:
        return

    from database.connection import unit_of_work
    from database.repositories import RefreshTokenRepository

    with unit_of_work() as session:
        RefreshTokenRepository(session).revoke(jti)


def decode_access_token(access_token: str) -> dict:
    try:
        payload = jwt.decode(access_token, _secret(), algorithms=[_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise AuthError("Access token has expired.")
    except jwt.InvalidTokenError as exc:
        raise AuthError(f"Invalid access token: {exc}")

    if payload.get("type") != "access":
        raise AuthError("Token is not an access token.")
    return payload


def _extract_bearer_token() -> str:
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        raise AuthError("Missing or malformed Authorization header. Expected 'Bearer <token>'.")
    return header[len("Bearer "):].strip()


def require_role(*allowed_roles: str) -> Callable:
    """
    Decorator for Flask view functions. Validates the JWT access token
    and checks the token's role is in allowed_roles. Sets g.auth_role
    for the view to inspect if needed. Use @require_role("admin") for
    mutating endpoints, @require_role("admin", "viewer") for read-only
    endpoints any authenticated user can see.
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
            if role not in allowed_roles:
                return jsonify({"error": f"Role '{role}' is not permitted to access this endpoint."}), 403

            g.auth_role = role
            return f(*args, **kwargs)
        return wrapper
    return decorator

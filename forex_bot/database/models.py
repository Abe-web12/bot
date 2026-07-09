"""
models.py
==========
SQLAlchemy ORM models for every persistent entity.

Design decisions:
  - All models inherit from a common Base with created_at/updated_at.
  - UUIDs are used as primary keys for idempotency (execution_id on
    TradeIntent prevents duplicate order placement after restart).
  - The schema is intentionally SQLite-compatible now and
    PostgreSQL-compatible later — no SQLite-specific types are used.
  - Alembic-style version tracking is built into SchemaVersion so the
    migration runner can check/update without Alembic being a hard dep.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, Column, DateTime, Float, Index, Integer,
    String, Text, UniqueConstraint,
)
from sqlalchemy.orm import DeclarativeBase, declared_attr


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return str(uuid.uuid4())


class Base(DeclarativeBase):
    @declared_attr
    def __tablename__(cls) -> str:  # type: ignore[override]
        return cls.__name__.lower()

    created_at = Column(DateTime(timezone=True), default=_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=_now, onupdate=_now, nullable=False)


class SchemaVersion(Base):
    """Tracks applied migrations — one row per migration script."""
    __tablename__ = "schema_version"

    id = Column(Integer, primary_key=True, autoincrement=True)
    version = Column(Integer, nullable=False, unique=True)
    description = Column(String(200), nullable=False)
    applied_at = Column(DateTime(timezone=True), default=_now, nullable=False)
    checksum = Column(String(64), nullable=True)  # SHA-256 of migration SQL


class PersistentTradeIntent(Base):
    """
    Persistent execution queue. Every TradeIntent submitted to the
    execution engine is written here first. On restart, PENDING rows are
    replayed. COMPLETED/FAILED/DUPLICATE rows are kept for audit.
    """
    __tablename__ = "trade_intents"

    execution_id = Column(String(36), primary_key=True, default=_uuid)
    symbol = Column(String(20), nullable=False)
    side = Column(String(4), nullable=False)          # BUY | SELL
    stop_loss_price = Column(Float, nullable=False)
    take_profit_price = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    magic_number = Column(Integer, nullable=False)
    comment = Column(String(100), nullable=True)
    status = Column(String(20), nullable=False, default="PENDING")
    # PENDING | PROCESSING | COMPLETED | FAILED | DUPLICATE | EXPIRED
    mt5_ticket = Column(Integer, nullable=True)
    filled_price = Column(Float, nullable=True)
    filled_volume = Column(Float, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    queued_at = Column(DateTime(timezone=True), default=_now, nullable=False)
    processed_at = Column(DateTime(timezone=True), nullable=True)
    idempotency_key = Column(String(100), nullable=True, unique=True)

    __table_args__ = (
        Index("idx_ti_status", "status"),
        Index("idx_ti_symbol_magic", "symbol", "magic_number"),
        Index("idx_ti_queued_at", "queued_at"),
    )


class Trade(Base):
    """
    Completed trade record — written when a position is closed.
    This is the permanent audit log of everything that happened.
    """
    __tablename__ = "trades"

    id = Column(String(36), primary_key=True, default=_uuid)
    execution_id = Column(String(36), nullable=True)   # links back to PersistentTradeIntent
    mt5_ticket = Column(Integer, nullable=False, unique=True)
    symbol = Column(String(20), nullable=False)
    side = Column(String(4), nullable=False)
    open_price = Column(Float, nullable=False)
    close_price = Column(Float, nullable=True)
    volume = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=True)
    take_profit = Column(Float, nullable=True)
    profit = Column(Float, nullable=True)
    swap = Column(Float, nullable=True, default=0.0)
    commission = Column(Float, nullable=True, default=0.0)
    magic_number = Column(Integer, nullable=False)
    comment = Column(String(100), nullable=True)
    open_time = Column(DateTime(timezone=True), nullable=False)
    close_time = Column(DateTime(timezone=True), nullable=True)
    is_closed = Column(Boolean, nullable=False, default=False)
    close_reason = Column(String(50), nullable=True)  # SL | TP | MANUAL | PARTIAL

    __table_args__ = (
        Index("idx_trade_symbol", "symbol"),
        Index("idx_trade_open_time", "open_time"),
        Index("idx_trade_is_closed", "is_closed"),
    )


class EquitySnapshot(Base):
    """Hourly equity/balance snapshots for equity curve charts."""
    __tablename__ = "equity_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    balance = Column(Float, nullable=False)
    equity = Column(Float, nullable=False)
    margin = Column(Float, nullable=False)
    free_margin = Column(Float, nullable=False)
    drawdown_pct = Column(Float, nullable=True)
    open_trades = Column(Integer, nullable=False, default=0)
    snapshotted_at = Column(DateTime(timezone=True), default=_now, nullable=False)

    __table_args__ = (
        Index("idx_eq_snapshot_time", "snapshotted_at"),
    )


class IdempotencyRecord(Base):
    """
    Deduplication table. Every operation that must execute exactly once
    (order placement, webhook processing) registers an idempotency key
    here before executing. A duplicate key means the operation already
    ran or is in progress.
    """
    __tablename__ = "idempotency_records"

    key = Column(String(100), primary_key=True)
    operation = Column(String(50), nullable=False)    # trade_intent | webhook | notification
    status = Column(String(20), nullable=False)       # PROCESSING | COMPLETED | FAILED
    result_summary = Column(Text, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)   # NULL = never expire

    __table_args__ = (
        Index("idx_idem_operation", "operation"),
        Index("idx_idem_status", "status"),
    )


class JournalEntry(Base):
    """
    Automatic journal — append-only structured record of every
    strategy/execution decision, distinct from BotEvent (which logs raw
    system events). JournalEntry specifically captures WHY something
    happened, with a consistent schema queryable by entry_type, so the
    dashboard can show "every signal", "every rejection", "every SL/TP
    hit" etc. without parsing free-form JSON payloads.
    """
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    entry_type = Column(String(40), nullable=False)
    # SIGNAL_GENERATED | SIGNAL_REJECTED | TRADE_OPENED | TRADE_CLOSED |
    # SL_HIT | TP_HIT | PARTIAL_CLOSE | BREAKEVEN | TRAILING_STOP |
    # AI_DECISION | MANUAL_OVERRIDE
    symbol = Column(String(20), nullable=True)
    side = Column(String(4), nullable=True)
    price = Column(Float, nullable=True)
    confidence = Column(Float, nullable=True)
    reason = Column(Text, nullable=True)
    execution_id = Column(String(36), nullable=True)
    mt5_ticket = Column(Integer, nullable=True)
    payload_json = Column(Text, nullable=True)
    occurred_at = Column(DateTime(timezone=True), default=_now, nullable=False)

    __table_args__ = (
        Index("idx_journal_type", "entry_type"),
        Index("idx_journal_symbol", "symbol"),
        Index("idx_journal_occurred", "occurred_at"),
    )


class RefreshToken(Base):
    """
    Tracks issued refresh tokens for revocation and single-use rotation.
    A refresh token's JWT signature alone can't express "has this
    already been used" — that requires server-side state, which is what
    this table is for.
    """
    __tablename__ = "refresh_tokens"

    jti = Column(String(36), primary_key=True)
    role = Column(String(20), nullable=False)
    is_revoked = Column(Boolean, nullable=False, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        Index("idx_refresh_expires", "expires_at"),
    )


class AuditLog(Base):
    """
    Records every dashboard-relevant action: logins, logouts, config
    changes, manual trade closes, bot control commands, API calls that
    mutate state, and security events (permission failures, failed
    logins). Append-only, like BotEvent, but distinct in purpose:
    BotEvent is "what happened in the trading system"; AuditLog is
    "what did a human (or an automated client acting on their behalf)
    do, and was it allowed."
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    action = Column(String(60), nullable=False)          # e.g. LOGIN, LOGOUT, CONFIG_CHANGE, MANUAL_CLOSE
    role = Column(String(20), nullable=True)              # admin | viewer | anonymous
    success = Column(Boolean, nullable=False, default=True)
    ip_address = Column(String(64), nullable=True)
    detail = Column(Text, nullable=True)
    occurred_at = Column(DateTime(timezone=True), default=_now, nullable=False)

    __table_args__ = (
        Index("idx_audit_action", "action"),
        Index("idx_audit_occurred", "occurred_at"),
    )


class BotEvent(Base):
    """
    Append-only event log — every significant bot event (trade, error,
    config change, restart) is written here for audit and debugging.
    Never updated, only inserted.
    """
    __tablename__ = "bot_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_name = Column(String(60), nullable=False)
    source = Column(String(60), nullable=True)
    payload_json = Column(Text, nullable=True)
    correlation_id = Column(String(36), nullable=True)
    occurred_at = Column(DateTime(timezone=True), default=_now, nullable=False)

    __table_args__ = (
        Index("idx_event_name", "event_name"),
        Index("idx_event_occurred", "occurred_at"),
    )


# =========================================================================
# SaaS / Multi-User Models
# =========================================================================


class User(Base):
    """
    Registered user account. Supports the full SaaS auth flow:
    email/password registration, email verification, password reset,
    and role-based access (owner > admin > trader > viewer).
    """
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=_uuid)
    email = Column(String(255), nullable=False, unique=True, index=True)
    username = Column(String(100), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="trader")
    # owner | admin | trader | viewer
    is_active = Column(Boolean, nullable=False, default=True)
    is_verified = Column(Boolean, nullable=False, default=False)
    display_name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    preferences_json = Column(Text, nullable=True)  # JSON blob for UI prefs
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    last_login_ip = Column(String(64), nullable=True)
    login_count = Column(Integer, nullable=False, default=0)
    metadata_json = Column(Text, nullable=True)  # arbitrary key-value store

    __table_args__ = (
        Index("idx_user_email", "email"),
        Index("idx_user_username", "username"),
        Index("idx_user_role", "role"),
    )


class Workspace(Base):
    """
    A workspace is a tenant within the SaaS — an isolated environment
    containing its own configuration, members, and bot instances.
    Every user gets a default workspace on registration.
    """
    __tablename__ = "workspaces"

    id = Column(String(36), primary_key=True, default=_uuid)
    name = Column(String(200), nullable=False)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    owner_id = Column(String(36), nullable=False, index=True)
    is_default = Column(Boolean, nullable=False, default=False)
    settings_json = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    __table_args__ = (
        Index("idx_workspace_slug", "slug"),
        Index("idx_workspace_owner", "owner_id"),
    )


class WorkspaceMember(Base):
    """
    Membership bridge between User and Workspace with a workspace-local
    role. The workspace owner is always a member with role="owner".
    """
    __tablename__ = "workspace_members"

    id = Column(String(36), primary_key=True, default=_uuid)
    workspace_id = Column(String(36), nullable=False, index=True)
    user_id = Column(String(36), nullable=False, index=True)
    role = Column(String(20), nullable=False, default="member")
    # owner | admin | member | viewer
    joined_at = Column(DateTime(timezone=True), default=_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("workspace_id", "user_id", name="uq_workspace_user"),
        Index("idx_wm_workspace", "workspace_id"),
        Index("idx_wm_user", "user_id"),
    )


class SubscriptionPlan(Base):
    """
    Predefined subscription plans (Free/Starter/Pro/Enterprise).
    Features are stored as a JSON blob so adding new feature flags
    doesn't require a schema migration.
    """
    __tablename__ = "subscription_plans"

    id = Column(String(36), primary_key=True, default=_uuid)
    plan_id = Column(String(50), nullable=False, unique=True, index=True)
    # free | starter | pro | enterprise
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price_monthly = Column(Integer, nullable=False, default=0)  # cents, 0 = free
    price_yearly = Column(Integer, nullable=False, default=0)
    features_json = Column(Text, nullable=True)  # JSON with feature flags
    is_active = Column(Boolean, nullable=False, default=True)
    sort_order = Column(Integer, nullable=False, default=0)

    __table_args__ = (
        Index("idx_plan_id", "plan_id"),
    )


class UserSubscription(Base):
    """
    Links a user to their current subscription plan. When no payment
    gateway is configured, this is set manually or defaults to "free".
    """
    __tablename__ = "user_subscriptions"

    id = Column(String(36), primary_key=True, default=_uuid)
    user_id = Column(String(36), nullable=False, unique=True, index=True)
    plan_id = Column(String(36), nullable=False, index=True)
    status = Column(String(20), nullable=False, default="active")
    # active | cancelled | expired | trialing
    current_period_start = Column(DateTime(timezone=True), nullable=False, default=_now)
    current_period_end = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    stripe_subscription_id = Column(String(100), nullable=True)
    metadata_json = Column(Text, nullable=True)

    __table_args__ = (
        Index("idx_user_sub_user", "user_id"),
        Index("idx_user_sub_status", "status"),
    )


class UserSession(Base):
    """
    Tracks active user sessions for security monitoring and forced
    logout capability. Each issued refresh token generates a session
    record.
    """
    __tablename__ = "user_sessions"

    id = Column(String(36), primary_key=True, default=_uuid)
    user_id = Column(String(36), nullable=False, index=True)
    refresh_jti = Column(String(36), nullable=False, unique=True)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(String(500), nullable=True)
    device_name = Column(String(200), nullable=True)
    is_revoked = Column(Boolean, nullable=False, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    last_activity_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        Index("idx_session_user", "user_id"),
        Index("idx_session_jti", "refresh_jti"),
        Index("idx_session_expires", "expires_at"),
    )


class ApiKey(Base):
    """
    API keys for programmatic access. The full key is hashed before
    storage; only the last 4 characters (prefix) are stored in plaintext
    for UI display so users can identify which key is which.
    """
    __tablename__ = "api_keys"

    id = Column(String(36), primary_key=True, default=_uuid)
    user_id = Column(String(36), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    key_hash = Column(String(255), nullable=False)
    key_prefix = Column(String(4), nullable=False)  # last 4 chars for display
    permissions_json = Column(Text, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)

    __table_args__ = (
        Index("idx_apikey_user", "user_id"),
        Index("idx_apikey_hash", "key_hash"),
    )


class EmailVerification(Base):
    """
    Email verification tokens. One token per verification attempt;
    expired or used tokens are cleaned up periodically.
    """
    __tablename__ = "email_verifications"

    id = Column(String(36), primary_key=True, default=_uuid)
    user_id = Column(String(36), nullable=False, index=True)
    email = Column(String(255), nullable=False)
    token = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    is_used = Column(Boolean, nullable=False, default=False)

    __table_args__ = (
        Index("idx_email_ver_token", "token"),
        Index("idx_email_ver_user", "user_id"),
    )


class PasswordReset(Base):
    """
    Password reset tokens. One-time use, with expiry.
    """
    __tablename__ = "password_resets"

    id = Column(String(36), primary_key=True, default=_uuid)
    user_id = Column(String(36), nullable=False, index=True)
    email = Column(String(255), nullable=False)
    token = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    is_used = Column(Boolean, nullable=False, default=False)

    __table_args__ = (
        Index("idx_pw_reset_token", "token"),
        Index("idx_pw_reset_user", "user_id"),
    )

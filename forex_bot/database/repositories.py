"""
repositories.py
================
All database access is in this file. Business logic (execution_engine,
trade_manager, etc.) never writes SQL directly — it calls repository
methods.

Repositories follow the pattern:
  - Constructor takes a session (injected by the caller via unit_of_work)
  - Methods raise specific exceptions on failure, never return None
    silently when not finding a record

Every repository method is atomic within the session it receives. The
caller (Unit of Work / unit_of_work() context manager) is responsible
for commit/rollback.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from database.models import (
    ApiKey,
    BotEvent,
    EmailVerification,
    EquitySnapshot,
    IdempotencyRecord,
    JournalEntry,
    PasswordReset,
    PersistentTradeIntent,
    SubscriptionPlan,
    Trade,
    User,
    UserSession,
    UserSubscription,
    Workspace,
    WorkspaceMember,
)

logger = logging.getLogger("database.repositories")


class RepositoryError(Exception):
    pass


class DuplicateKeyError(RepositoryError):
    """Raised when a unique constraint would be violated."""


# ---------------------------------------------------------------------------
# Trade Intent Repository (persistent execution queue)
# ---------------------------------------------------------------------------

class TradeIntentRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, intent: PersistentTradeIntent) -> PersistentTradeIntent:
        try:
            self._session.add(intent)
            self._session.flush()
            return intent
        except Exception as exc:
            if "UNIQUE" in str(exc).upper():
                raise DuplicateKeyError(
                    f"Trade intent with idempotency_key={intent.idempotency_key} already exists."
                ) from exc
            raise RepositoryError(f"Failed to save trade intent: {exc}") from exc

    def get_by_id(self, execution_id: str) -> Optional[PersistentTradeIntent]:
        return self._session.get(PersistentTradeIntent, execution_id)

    def get_pending(self) -> list[PersistentTradeIntent]:
        return (
            self._session.query(PersistentTradeIntent)
            .filter(PersistentTradeIntent.status == "PENDING")
            .order_by(PersistentTradeIntent.queued_at)
            .all()
        )

    def get_by_idempotency_key(self, key: str) -> Optional[PersistentTradeIntent]:
        return (
            self._session.query(PersistentTradeIntent)
            .filter(PersistentTradeIntent.idempotency_key == key)
            .first()
        )

    def mark_processing(self, execution_id: str) -> None:
        intent = self._session.get(PersistentTradeIntent, execution_id)
        if intent:
            intent.status = "PROCESSING"
            intent.updated_at = datetime.now(timezone.utc)
            self._session.flush()

    def mark_completed(
        self,
        execution_id: str,
        mt5_ticket: int,
        filled_price: float,
        filled_volume: float,
    ) -> None:
        intent = self._session.get(PersistentTradeIntent, execution_id)
        if intent:
            intent.status = "COMPLETED"
            intent.mt5_ticket = mt5_ticket
            intent.filled_price = filled_price
            intent.filled_volume = filled_volume
            intent.processed_at = datetime.now(timezone.utc)
            intent.updated_at = datetime.now(timezone.utc)
            self._session.flush()

    def mark_failed(self, execution_id: str, reason: str) -> None:
        intent = self._session.get(PersistentTradeIntent, execution_id)
        if intent:
            intent.status = "FAILED"
            intent.rejection_reason = reason[:500]
            intent.processed_at = datetime.now(timezone.utc)
            intent.updated_at = datetime.now(timezone.utc)
            self._session.flush()

    def mark_duplicate(self, execution_id: str, reason: str) -> None:
        intent = self._session.get(PersistentTradeIntent, execution_id)
        if intent:
            intent.status = "DUPLICATE"
            intent.rejection_reason = reason[:500]
            intent.processed_at = datetime.now(timezone.utc)
            intent.updated_at = datetime.now(timezone.utc)
            self._session.flush()

    def count_by_status(self) -> dict[str, int]:
        rows = (
            self._session.query(
                PersistentTradeIntent.status,
                text("COUNT(*) as cnt")
            )
            .group_by(PersistentTradeIntent.status)
            .all()
        )
        return {row[0]: row[1] for row in rows}


# ---------------------------------------------------------------------------
# Trade Repository (closed trades audit log)
# ---------------------------------------------------------------------------

class TradeRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, trade: Trade) -> Trade:
        try:
            self._session.add(trade)
            self._session.flush()
            return trade
        except Exception as exc:
            if "UNIQUE" in str(exc).upper():
                raise DuplicateKeyError(
                    f"Trade with mt5_ticket={trade.mt5_ticket} already exists."
                ) from exc
            raise RepositoryError(f"Failed to save trade: {exc}") from exc

    def get_by_ticket(self, mt5_ticket: int) -> Optional[Trade]:
        return (
            self._session.query(Trade)
            .filter(Trade.mt5_ticket == mt5_ticket)
            .first()
        )

    def get_open_trades(self) -> list[Trade]:
        return (
            self._session.query(Trade)
            .filter(Trade.is_closed == False)
            .order_by(Trade.open_time.desc())
            .all()
        )

    def get_recent_closed(self, limit: int = 50) -> list[Trade]:
        return (
            self._session.query(Trade)
            .filter(Trade.is_closed == True)
            .order_by(Trade.close_time.desc())
            .limit(limit)
            .all()
        )

    def close_trade(
        self,
        mt5_ticket: int,
        close_price: float,
        profit: float,
        close_time: datetime,
        close_reason: str,
    ) -> Optional[Trade]:
        trade = self.get_by_ticket(mt5_ticket)
        if trade:
            trade.close_price = close_price
            trade.profit = profit
            trade.close_time = close_time
            trade.is_closed = True
            trade.close_reason = close_reason
            trade.updated_at = datetime.now(timezone.utc)
            self._session.flush()
        return trade

    def daily_pnl(self, date: datetime) -> float:
        result = self._session.execute(
            text(
                "SELECT COALESCE(SUM(profit), 0) FROM trades "
                "WHERE is_closed = 1 AND date(close_time) = date(:d)"
            ),
            {"d": date.isoformat()},
        ).fetchone()
        return float(result[0]) if result else 0.0

    def monthly_pnl(self, year: int, month: int) -> float:
        """
        Monthly P&L — uses EXTRACT for PostgreSQL compatibility.
        Falls back to strftime for SQLite (detected by dialect name).
        """
        bind = self._session.get_bind()
        dialect = bind.dialect.name if bind is not None else "sqlite"

        if dialect == "sqlite":
            result = self._session.execute(
                text(
                    "SELECT COALESCE(SUM(profit), 0) FROM trades "
                    "WHERE is_closed = 1 "
                    "AND strftime('%Y', close_time) = :y "
                    "AND strftime('%m', close_time) = :m"
                ),
                {"y": str(year), "m": f"{month:02d}"},
            ).fetchone()
        else:
            # PostgreSQL / standard SQL
            result = self._session.execute(
                text(
                    "SELECT COALESCE(SUM(profit), 0) FROM trades "
                    "WHERE is_closed = TRUE "
                    "AND EXTRACT(YEAR FROM close_time) = :y "
                    "AND EXTRACT(MONTH FROM close_time) = :m"
                ),
                {"y": year, "m": month},
            ).fetchone()
        return float(result[0]) if result else 0.0

    def win_rate(self) -> dict:
        result = self._session.execute(
            text(
                "SELECT "
                "  COUNT(*) as total, "
                "  SUM(CASE WHEN profit > 0 THEN 1 ELSE 0 END) as wins, "
                "  SUM(CASE WHEN profit <= 0 THEN 1 ELSE 0 END) as losses "
                "FROM trades WHERE is_closed = 1"
            )
        ).fetchone()
        if not result or result[0] == 0:
            return {"total": 0, "wins": 0, "losses": 0, "win_rate_pct": 0.0}
        total, wins, losses = result[0], result[1] or 0, result[2] or 0
        return {
            "total": total,
            "wins": wins,
            "losses": losses,
            "win_rate_pct": round(wins / total * 100, 2),
        }

    def profit_factor(self) -> dict:
        """
        Profit factor = gross profit / gross loss (absolute value).
        Returns None for gross_loss if there are no losing trades yet —
        profit_factor is undefined (not infinite, not zero) in that case,
        and callers must handle that explicitly rather than divide by zero.
        """
        result = self._session.execute(
            text(
                "SELECT "
                "  COALESCE(SUM(CASE WHEN profit > 0 THEN profit ELSE 0 END), 0) as gross_profit, "
                "  COALESCE(SUM(CASE WHEN profit <= 0 THEN profit ELSE 0 END), 0) as gross_loss "
                "FROM trades WHERE is_closed = 1"
            )
        ).fetchone()
        gross_profit = float(result[0]) if result else 0.0
        gross_loss = abs(float(result[1])) if result else 0.0

        if gross_loss == 0:
            return {"gross_profit": gross_profit, "gross_loss": gross_loss, "profit_factor": None}

        return {
            "gross_profit": round(gross_profit, 2),
            "gross_loss": round(gross_loss, 2),
            "profit_factor": round(gross_profit / gross_loss, 3),
        }

    def expectancy(self) -> dict:
        """
        Expectancy = (win_rate * avg_win) - (loss_rate * avg_loss).
        The expected profit/loss per trade, in account currency —
        the single most useful number for "is this strategy worth running".
        """
        stats = self.win_rate()
        if stats["total"] == 0:
            return {"expectancy": 0.0, "avg_win": 0.0, "avg_loss": 0.0}

        avg_result = self._session.execute(
            text(
                "SELECT "
                "  COALESCE(AVG(CASE WHEN profit > 0 THEN profit END), 0) as avg_win, "
                "  COALESCE(AVG(CASE WHEN profit <= 0 THEN profit END), 0) as avg_loss "
                "FROM trades WHERE is_closed = 1"
            )
        ).fetchone()
        avg_win = float(avg_result[0]) if avg_result else 0.0
        avg_loss = float(avg_result[1]) if avg_result else 0.0  # already negative or zero

        win_rate = stats["wins"] / stats["total"]
        loss_rate = stats["losses"] / stats["total"]
        expectancy = (win_rate * avg_win) + (loss_rate * avg_loss)

        return {
            "expectancy": round(expectancy, 2),
            "avg_win": round(avg_win, 2),
            "avg_loss": round(avg_loss, 2),
        }


# ---------------------------------------------------------------------------
# Equity Snapshot Repository
# ---------------------------------------------------------------------------

class EquitySnapshotRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, snapshot: EquitySnapshot) -> EquitySnapshot:
        self._session.add(snapshot)
        self._session.flush()
        return snapshot

    def get_recent(self, limit: int = 168) -> list[EquitySnapshot]:  # 168 = 7 days of hourly
        return (
            self._session.query(EquitySnapshot)
            .order_by(EquitySnapshot.snapshotted_at.desc())
            .limit(limit)
            .all()
        )


# ---------------------------------------------------------------------------
# Idempotency Repository
# ---------------------------------------------------------------------------

class IdempotencyRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def try_acquire(self, key: str, operation: str, expires_at: datetime | None = None) -> bool:
        """
        Attempts to claim an idempotency key. Returns True if claimed
        (first time seeing this key), False if already exists. This is
        the core dedup mechanism — all side-effectful operations must
        call this before executing.
        """
        existing = self._session.get(IdempotencyRecord, key)
        if existing:
            logger.info(
                "Idempotency key %s already exists (status=%s) — operation is a duplicate.",
                key, existing.status,
            )
            return False

        record = IdempotencyRecord(
            key=key,
            operation=operation,
            status="PROCESSING",
            expires_at=expires_at,
        )
        self._session.add(record)
        self._session.flush()
        return True

    def mark_completed(self, key: str, result_summary: str = "") -> None:
        record = self._session.get(IdempotencyRecord, key)
        if record:
            record.status = "COMPLETED"
            record.result_summary = result_summary[:1000]
            record.completed_at = datetime.now(timezone.utc)
            record.updated_at = datetime.now(timezone.utc)
            self._session.flush()

    def mark_failed(self, key: str, reason: str) -> None:
        record = self._session.get(IdempotencyRecord, key)
        if record:
            record.status = "FAILED"
            record.result_summary = reason[:1000]
            record.updated_at = datetime.now(timezone.utc)
            self._session.flush()

    def cleanup_expired(self) -> int:
        """Delete expired idempotency records. Returns count deleted."""
        now = datetime.now(timezone.utc)
        result = self._session.execute(
            text(
                "DELETE FROM idempotency_records "
                "WHERE expires_at IS NOT NULL AND expires_at < :now"
            ),
            {"now": now.isoformat()},
        )
        self._session.flush()
        deleted = result.rowcount
        if deleted:
            logger.info("Cleaned up %d expired idempotency records.", deleted)
        return deleted


class JournalRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def record(
        self,
        entry_type: str,
        symbol: str | None = None,
        side: str | None = None,
        price: float | None = None,
        confidence: float | None = None,
        reason: str | None = None,
        execution_id: str | None = None,
        mt5_ticket: int | None = None,
        payload: dict | None = None,
    ) -> JournalEntry:
        entry = JournalEntry(
            entry_type=entry_type,
            symbol=symbol,
            side=side,
            price=price,
            confidence=confidence,
            reason=reason[:2000] if reason else None,
            execution_id=execution_id,
            mt5_ticket=mt5_ticket,
            payload_json=json.dumps(payload, default=str) if payload else None,
            occurred_at=datetime.now(timezone.utc),
        )
        self._session.add(entry)
        self._session.flush()
        return entry

    def get_recent(
        self,
        limit: int = 100,
        entry_type: str | None = None,
        symbol: str | None = None,
    ) -> list[JournalEntry]:
        q = self._session.query(JournalEntry).order_by(JournalEntry.occurred_at.desc())
        if entry_type:
            q = q.filter(JournalEntry.entry_type == entry_type)
        if symbol:
            q = q.filter(JournalEntry.symbol == symbol)
        return q.limit(limit).all()

    def count_by_type(self) -> dict[str, int]:
        rows = (
            self._session.query(JournalEntry.entry_type, text("COUNT(*) as cnt"))
            .group_by(JournalEntry.entry_type)
            .all()
        )
        return {row[0]: row[1] for row in rows}


# ---------------------------------------------------------------------------
# Bot Event Repository (append-only audit log)
# ---------------------------------------------------------------------------

class RefreshTokenRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def register(self, jti: str, role: str, expires_at: datetime) -> None:
        from database.models import RefreshToken
        self._session.add(RefreshToken(jti=jti, role=role, is_revoked=False, expires_at=expires_at))
        self._session.flush()

    def is_valid(self, jti: str) -> bool:
        from database.models import RefreshToken
        record = self._session.get(RefreshToken, jti)
        if record is None:
            return False
        if record.is_revoked:
            return False
        expires_at = record.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        return expires_at > datetime.now(timezone.utc)

    def revoke(self, jti: str) -> None:
        from database.models import RefreshToken
        record = self._session.get(RefreshToken, jti)
        if record:
            record.is_revoked = True
            record.updated_at = datetime.now(timezone.utc)
            self._session.flush()

    def cleanup_expired(self) -> int:
        now = datetime.now(timezone.utc)
        result = self._session.execute(
            text("DELETE FROM refresh_tokens WHERE expires_at < :now"),
            {"now": now.isoformat()},
        )
        self._session.flush()
        return result.rowcount


class AuditLogRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def record(self, action: str, role: str | None = None, success: bool = True,
               ip_address: str | None = None, detail: str = "") -> None:
        from database.models import AuditLog
        self._session.add(AuditLog(
            action=action, role=role, success=success,
            ip_address=ip_address, detail=detail[:2000] if detail else None,
            occurred_at=datetime.now(timezone.utc),
        ))
        self._session.flush()

    def get_recent(self, limit: int = 100, action: str | None = None) -> list:
        from database.models import AuditLog
        q = self._session.query(AuditLog).order_by(AuditLog.occurred_at.desc())
        if action:
            q = q.filter(AuditLog.action == action)
        return q.limit(limit).all()

    def count_failed_logins_since(self, since: datetime, ip_address: str | None = None) -> int:
        from database.models import AuditLog
        q = self._session.query(AuditLog).filter(
            AuditLog.action == "LOGIN", AuditLog.success == False, AuditLog.occurred_at >= since,  # noqa: E712
        )
        if ip_address:
            q = q.filter(AuditLog.ip_address == ip_address)
        return q.count()


class BotEventRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def append(
        self,
        event_name: str,
        source: str = "",
        payload: dict | None = None,
        correlation_id: str = "",
    ) -> BotEvent:
        record = BotEvent(
            event_name=event_name,
            source=source,
            payload_json=json.dumps(payload, default=str) if payload else None,
            correlation_id=correlation_id,
            occurred_at=datetime.now(timezone.utc),
        )
        self._session.add(record)
        self._session.flush()
        return record

    def get_recent(self, limit: int = 100, event_name: str | None = None) -> list[BotEvent]:
        q = self._session.query(BotEvent).order_by(BotEvent.occurred_at.desc())
        if event_name:
            q = q.filter(BotEvent.event_name == event_name)
        return q.limit(limit).all()


# ---------------------------------------------------------------------------
# User Repository
# ---------------------------------------------------------------------------

class UserRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, user: User) -> User:
        self._session.add(user)
        self._session.flush()
        return user

    def get_by_id(self, user_id: str) -> User | None:
        return self._session.get(User, user_id)

    def get_by_email(self, email: str) -> User | None:
        return self._session.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> User | None:
        return self._session.query(User).filter(User.username == username).first()

    def email_exists(self, email: str) -> bool:
        return self._session.query(User).filter(User.email == email).count() > 0

    def username_exists(self, username: str) -> bool:
        return self._session.query(User).filter(User.username == username).count() > 0

    def count_active(self) -> int:
        return self._session.query(User).filter(User.is_active == True).count()

    def update_last_login(self, user_id: str, ip_address: str) -> None:
        from datetime import datetime, timezone
        user = self._session.get(User, user_id)
        if user:
            user.last_login_at = datetime.now(timezone.utc)
            user.last_login_ip = ip_address
            user.login_count = (user.login_count or 0) + 1
            self._session.flush()

    def search(self, query: str, limit: int = 20) -> list[User]:
        return self._session.query(User).filter(
            User.email.ilike(f"%{query}%") | User.username.ilike(f"%{query}%")
        ).limit(limit).all()


# ---------------------------------------------------------------------------
# Workspace Repository
# ---------------------------------------------------------------------------

class WorkspaceRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, workspace: Workspace) -> Workspace:
        self._session.add(workspace)
        self._session.flush()
        return workspace

    def get_by_id(self, workspace_id: str) -> Workspace | None:
        return self._session.get(Workspace, workspace_id)

    def get_by_slug(self, slug: str) -> Workspace | None:
        return self._session.query(Workspace).filter(Workspace.slug == slug).first()

    def get_by_owner(self, owner_id: str) -> list[Workspace]:
        return self._session.query(Workspace).filter(
            Workspace.owner_id == owner_id, Workspace.is_active == True
        ).order_by(Workspace.created_at).all()

    def get_user_workspaces(self, user_id: str) -> list[Workspace]:
        """Returns all workspaces where the user is a member."""
        return self._session.query(Workspace).join(
            WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id
        ).filter(
            WorkspaceMember.user_id == user_id, Workspace.is_active == True
        ).all()

    def slug_exists(self, slug: str) -> bool:
        return self._session.query(Workspace).filter(Workspace.slug == slug).count() > 0


class WorkspaceMemberRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, member: WorkspaceMember) -> WorkspaceMember:
        self._session.add(member)
        self._session.flush()
        return member

    def get_by_id(self, member_id: str) -> WorkspaceMember | None:
        return self._session.get(WorkspaceMember, member_id)

    def get_by_workspace_and_user(self, workspace_id: str, user_id: str) -> WorkspaceMember | None:
        return self._session.query(WorkspaceMember).filter(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user_id,
        ).first()

    def get_workspace_members(self, workspace_id: str) -> list[WorkspaceMember]:
        return self._session.query(WorkspaceMember).filter(
            WorkspaceMember.workspace_id == workspace_id
        ).all()

    def get_user_memberships(self, user_id: str) -> list[WorkspaceMember]:
        return self._session.query(WorkspaceMember).filter(
            WorkspaceMember.user_id == user_id
        ).all()

    def remove(self, member_id: str) -> bool:
        member = self._session.get(WorkspaceMember, member_id)
        if member:
            self._session.delete(member)
            self._session.flush()
            return True
        return False

    def count_by_workspace(self, workspace_id: str) -> int:
        return self._session.query(WorkspaceMember).filter(
            WorkspaceMember.workspace_id == workspace_id
        ).count()


# ---------------------------------------------------------------------------
# Subscription Plan Repository
# ---------------------------------------------------------------------------

class SubscriptionPlanRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, plan: SubscriptionPlan) -> SubscriptionPlan:
        self._session.add(plan)
        self._session.flush()
        return plan

    def get_by_id(self, plan_id: str) -> SubscriptionPlan | None:
        return self._session.get(SubscriptionPlan, plan_id)

    def get_by_plan_id(self, plan_id: str) -> SubscriptionPlan | None:
        return self._session.query(SubscriptionPlan).filter(
            SubscriptionPlan.plan_id == plan_id
        ).first()

    def get_active_plans(self) -> list[SubscriptionPlan]:
        return self._session.query(SubscriptionPlan).filter(
            SubscriptionPlan.is_active == True
        ).order_by(SubscriptionPlan.sort_order).all()


class UserSubscriptionRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, subscription: UserSubscription) -> UserSubscription:
        self._session.add(subscription)
        self._session.flush()
        return subscription

    def get_by_id(self, sub_id: str) -> UserSubscription | None:
        return self._session.get(UserSubscription, sub_id)

    def get_by_user_id(self, user_id: str) -> UserSubscription | None:
        return self._session.query(UserSubscription).filter(
            UserSubscription.user_id == user_id
        ).first()

    def get_active_by_user_id(self, user_id: str) -> UserSubscription | None:
        return self._session.query(UserSubscription).filter(
            UserSubscription.user_id == user_id,
            UserSubscription.status.in_(["active", "trialing"]),
        ).first()


# ---------------------------------------------------------------------------
# User Session Repository
# ---------------------------------------------------------------------------

class UserSessionRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, session_record: UserSession) -> UserSession:
        self._session.add(session_record)
        self._session.flush()
        return session_record

    def get_by_jti(self, jti: str) -> UserSession | None:
        return self._session.query(UserSession).filter(
            UserSession.refresh_jti == jti
        ).first()

    def get_user_sessions(self, user_id: str) -> list[UserSession]:
        return self._session.query(UserSession).filter(
            UserSession.user_id == user_id
        ).order_by(UserSession.created_at.desc()).all()

    def revoke_by_jti(self, jti: str) -> None:
        session_record = self._session.query(UserSession).filter(
            UserSession.refresh_jti == jti
        ).first()
        if session_record:
            session_record.is_revoked = True
            self._session.flush()

    def revoke_all_user_sessions(self, user_id: str, except_jti: str | None = None) -> int:
        q = self._session.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.is_revoked == False,
        )
        if except_jti:
            q = q.filter(UserSession.refresh_jti != except_jti)
        count = q.count()
        q.update({"is_revoked": True, "updated_at": datetime.now(timezone.utc)})
        self._session.flush()
        return count

    def cleanup_expired(self) -> int:
        now = datetime.now(timezone.utc)
        result = self._session.execute(
            text("DELETE FROM user_sessions WHERE expires_at < :now"),
            {"now": now.isoformat()},
        )
        self._session.flush()
        return result.rowcount


# ---------------------------------------------------------------------------
# ApiKey Repository
# ---------------------------------------------------------------------------

class ApiKeyRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, api_key: ApiKey) -> ApiKey:
        self._session.add(api_key)
        self._session.flush()
        return api_key

    def get_by_id(self, key_id: str) -> ApiKey | None:
        return self._session.get(ApiKey, key_id)

    def get_by_key_hash(self, key_hash: str) -> ApiKey | None:
        return self._session.query(ApiKey).filter(ApiKey.key_hash == key_hash).first()

    def get_user_keys(self, user_id: str, active_only: bool = True) -> list[ApiKey]:
        q = self._session.query(ApiKey).filter(ApiKey.user_id == user_id)
        if active_only:
            q = q.filter(ApiKey.is_active == True)
        return q.order_by(ApiKey.created_at.desc()).all()

    def revoke(self, key_id: str) -> bool:
        key = self._session.get(ApiKey, key_id)
        if key:
            key.is_active = False
            self._session.flush()
            return True
        return False

    def update_last_used(self, key_id: str) -> None:
        key = self._session.get(ApiKey, key_id)
        if key:
            key.last_used_at = datetime.now(timezone.utc)
            self._session.flush()


# ---------------------------------------------------------------------------
# Email Verification Repository
# ---------------------------------------------------------------------------

class EmailVerificationRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, verification: EmailVerification) -> EmailVerification:
        self._session.add(verification)
        self._session.flush()
        return verification

    def get_by_token(self, token: str) -> EmailVerification | None:
        return self._session.query(EmailVerification).filter(
            EmailVerification.token == token
        ).first()

    def get_pending_by_user(self, user_id: str) -> list[EmailVerification]:
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        return self._session.query(EmailVerification).filter(
            EmailVerification.user_id == user_id,
            EmailVerification.verified_at.is_(None),
            EmailVerification.is_used == False,
            EmailVerification.expires_at > now,
        ).all()

    def mark_verified(self, verification_id: str) -> None:
        from datetime import datetime, timezone
        ver = self._session.get(EmailVerification, verification_id)
        if ver:
            ver.verified_at = datetime.now(timezone.utc)
            ver.is_used = True
            self._session.flush()

    def cleanup_expired(self) -> int:
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        result = self._session.execute(
            text("DELETE FROM email_verifications WHERE expires_at < :now"),
            {"now": now.isoformat()},
        )
        self._session.flush()
        return result.rowcount


# ---------------------------------------------------------------------------
# Password Reset Repository
# ---------------------------------------------------------------------------

class PasswordResetRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def save(self, reset: PasswordReset) -> PasswordReset:
        self._session.add(reset)
        self._session.flush()
        return reset

    def get_by_token(self, token: str) -> PasswordReset | None:
        return self._session.query(PasswordReset).filter(
            PasswordReset.token == token
        ).first()

    def mark_used(self, reset_id: str) -> None:
        from datetime import datetime, timezone
        reset = self._session.get(PasswordReset, reset_id)
        if reset:
            reset.used_at = datetime.now(timezone.utc)
            reset.is_used = True
            self._session.flush()

    def get_valid_by_user(self, user_id: str) -> list[PasswordReset]:
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        return self._session.query(PasswordReset).filter(
            PasswordReset.user_id == user_id,
            PasswordReset.is_used == False,
            PasswordReset.expires_at > now,
        ).all()

    def cleanup_expired(self) -> int:
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        result = self._session.execute(
            text("DELETE FROM password_resets WHERE expires_at < :now"),
            {"now": now.isoformat()},
        )
        self._session.flush()
        return result.rowcount

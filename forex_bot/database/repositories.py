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
    BotEvent,
    EquitySnapshot,
    IdempotencyRecord,
    JournalEntry,
    PersistentTradeIntent,
    Trade,
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
        result = self._session.execute(
            text(
                "SELECT COALESCE(SUM(profit), 0) FROM trades "
                "WHERE is_closed = 1 "
                "AND strftime('%Y', close_time) = :y "
                "AND strftime('%m', close_time) = :m"
            ),
            {"y": str(year), "m": f"{month:02d}"},
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

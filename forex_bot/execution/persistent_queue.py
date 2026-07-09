"""
persistent_queue.py
=====================
Wraps the in-memory ExecutionEngine queue with database persistence so
that:
  1. Every submitted TradeIntent is written to the DB before being put
     in the in-memory queue — crash after DB write but before processing
     means the row is still PENDING and will be replayed on restart.
  2. Idempotency keys prevent the same intent from executing twice even
     after a crash-and-restart during processing.
  3. On startup, recover_pending() replays any PENDING rows that weren't
     processed before the last crash.
  4. Completed/failed intents are recorded in the DB for audit.

This module sits BETWEEN callers (strategy layer, API webhooks) and
ExecutionEngine.submit(). Nothing calls ExecutionEngine.submit()
directly except this module — that's the only way to guarantee every
intent is persisted before being queued.

Architecture:
  PersistentQueueManager.submit()
    → validate idempotency key
    → write PersistentTradeIntent (status=PENDING) to DB
    → ExecutionEngine.submit() (in-memory queue)

  ExecutionEngine._process_intent()  [already exists]
    → processes from in-memory queue
    → on success/failure: PersistentQueueManager.mark_*() updates DB row
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

import config
from core.logging_setup import get_correlation_id
from database.connection import unit_of_work
from database.models import PersistentTradeIntent
from database.repositories import (
    DuplicateKeyError,
    IdempotencyRepository,
    TradeIntentRepository,
)
from execution.execution_engine import ExecutionEngine, TradeIntent
from execution.order_validator import OrderSide

logger = logging.getLogger("persistent_queue")


class PersistentQueueError(Exception):
    pass


class DuplicateIntentError(PersistentQueueError):
    """Raised when the idempotency key already exists."""


class PersistentQueueManager:
    """
    Durable wrapper around ExecutionEngine.submit().
    All public methods are thread-safe (they rely on DB transactions
    and the engine's own queue lock).
    """

    def __init__(self, engine: ExecutionEngine) -> None:
        self._engine = engine

    def submit(
        self,
        intent: TradeIntent,
        idempotency_key: str | None = None,
    ) -> str:
        """
        Persist a TradeIntent to the database and submit it to the
        execution engine's in-memory queue.

        Args:
            intent: The trade intent to execute.
            idempotency_key: Optional caller-supplied dedup key. If not
                provided, a UUID is generated. If this key was already
                submitted (regardless of outcome), DuplicateIntentError
                is raised — the caller should NOT retry.

        Returns:
            execution_id (UUID string) assigned to this intent.
        """
        execution_id = str(uuid.uuid4())
        if idempotency_key is None:
            # Deterministic key based on symbol+side+sl+tp so two
            # identical signals generated in the same second are deduped.
            idempotency_key = (
                f"{intent.symbol}:{intent.side.value}:"
                f"{intent.stop_loss_price:.5f}:{intent.take_profit_price:.5f}:"
                f"{intent.queued_at.strftime('%Y%m%d%H%M')}"
            )

        with unit_of_work() as session:
            idem_repo = IdempotencyRepository(session)
            acquired = idem_repo.try_acquire(
                key=idempotency_key,
                operation="trade_intent",
            )
            if not acquired:
                raise DuplicateIntentError(
                    f"Intent with idempotency_key={idempotency_key!r} already exists. "
                    f"This is a duplicate submission."
                )

            intent_repo = TradeIntentRepository(session)
            db_record = PersistentTradeIntent(
                execution_id=execution_id,
                symbol=intent.symbol,
                side=intent.side.value,
                stop_loss_price=intent.stop_loss_price,
                take_profit_price=intent.take_profit_price,
                confidence=intent.confidence,
                magic_number=intent.magic_number,
                comment=intent.comment,
                status="PENDING",
                queued_at=intent.queued_at,
                idempotency_key=idempotency_key,
            )
            intent_repo.save(db_record)
            # Idempotency record and trade intent committed atomically.

        logger.info(
            "Intent persisted: execution_id=%s symbol=%s side=%s confidence=%.1f",
            execution_id, intent.symbol, intent.side.value, intent.confidence,
        )

        # Now queue in-memory. If the process crashes between the DB
        # write above and this line, recover_pending() will replay on restart.
        queued = self._engine.submit(intent)
        if not queued:
            # Engine rejected (queue full or below threshold) — mark FAILED
            # in DB so it's visible, but don't replay (threshold rejection
            # is permanent for this signal).
            self.mark_failed(execution_id, "Engine rejected: queue full or below confidence threshold.")

        return execution_id

    def mark_completed(
        self,
        execution_id: str,
        mt5_ticket: int,
        filled_price: float,
        filled_volume: float,
    ) -> None:
        with unit_of_work() as session:
            repo = TradeIntentRepository(session)
            repo.mark_completed(execution_id, mt5_ticket, filled_price, filled_volume)
            idem_repo = IdempotencyRepository(session)
            idem_repo.mark_completed(
                _idem_key_from_execution_id(session, execution_id),
                result_summary=f"ticket={mt5_ticket} price={filled_price}",
            )
        logger.info("Intent %s marked COMPLETED (ticket=%d).", execution_id, mt5_ticket)

    def mark_failed(self, execution_id: str, reason: str) -> None:
        with unit_of_work() as session:
            repo = TradeIntentRepository(session)
            repo.mark_failed(execution_id, reason)
        logger.warning("Intent %s marked FAILED: %s", execution_id, reason)

    def mark_duplicate(self, execution_id: str, reason: str) -> None:
        with unit_of_work() as session:
            repo = TradeIntentRepository(session)
            repo.mark_duplicate(execution_id, reason)
        logger.info("Intent %s marked DUPLICATE: %s", execution_id, reason)

    def recover_pending(self) -> int:
        """
        Called once at startup. Finds all PENDING rows left from a
        previous crash and resubmits them to the engine's in-memory queue.
        Returns the number of intents recovered.

        Replay protection: each PENDING row already has an idempotency_key.
        Before replaying, we verify the idempotency record is still
        PROCESSING (not COMPLETED) — this handles the edge case where the
        order was sent to MT5 but the DB update crashed before completing.
        In that case the row stays PENDING but the idempotency record is
        PROCESSING, and we mark the intent FAILED so a human can reconcile
        against MT5's own trade history.
        """
        recovered = 0
        needs_manual_review: list[str] = []

        with unit_of_work() as session:
            repo = TradeIntentRepository(session)
            pending = repo.get_pending()

            for db_intent in pending:
                # Check idempotency record status
                from sqlalchemy import text
                idem_row = session.execute(
                    text("SELECT status FROM idempotency_records WHERE key = :k"),
                    {"k": db_intent.idempotency_key or ""},
                ).fetchone()

                if idem_row and idem_row[0] == "PROCESSING":
                    # Was mid-execution when crash occurred — cannot safely replay.
                    needs_manual_review.append(db_intent.execution_id)
                    repo.mark_failed(
                        db_intent.execution_id,
                        "Recovery: was PROCESSING at crash time — needs manual MT5 reconciliation.",
                    )
                    logger.warning(
                        "Intent %s was PROCESSING at crash — marked FAILED for manual review.",
                        db_intent.execution_id,
                    )
                    continue

                # Safe to replay — build TradeIntent from DB row.
                try:
                    intent = TradeIntent(
                        symbol=db_intent.symbol,
                        side=OrderSide(db_intent.side),
                        stop_loss_price=db_intent.stop_loss_price,
                        take_profit_price=db_intent.take_profit_price,
                        confidence=db_intent.confidence,
                        magic_number=db_intent.magic_number,
                        comment=db_intent.comment or "",
                        queued_at=db_intent.queued_at or datetime.now(timezone.utc),
                    )
                    self._engine.submit(intent)
                    recovered += 1
                    logger.info(
                        "Recovered PENDING intent %s (%s %s).",
                        db_intent.execution_id, db_intent.symbol, db_intent.side,
                    )
                except Exception as exc:
                    logger.error(
                        "Failed to recover intent %s: %s", db_intent.execution_id, exc
                    )
                    repo.mark_failed(db_intent.execution_id, f"Recovery failed: {exc}")

        if needs_manual_review:
            logger.error(
                "MANUAL REVIEW REQUIRED: %d intent(s) were mid-execution at crash time: %s. "
                "Check MT5 trade history to confirm if these orders were filled.",
                len(needs_manual_review), needs_manual_review,
            )

        if recovered:
            logger.info("Queue recovery complete: %d intent(s) replayed.", recovered)
        else:
            logger.info("Queue recovery: no PENDING intents to replay.")

        return recovered

    def queue_stats(self) -> dict:
        """Return counts of intents by status — for dashboard/monitoring."""
        try:
            with unit_of_work() as session:
                repo = TradeIntentRepository(session)
                return repo.count_by_status()
        except Exception as exc:
            logger.error("Failed to read queue stats: %s", exc)
            return {}


def _idem_key_from_execution_id(session, execution_id: str) -> str:
    """Look up the idempotency_key for a given execution_id."""
    from sqlalchemy import text
    row = session.execute(
        text("SELECT idempotency_key FROM trade_intents WHERE execution_id = :id"),
        {"id": execution_id},
    ).fetchone()
    return row[0] if row and row[0] else execution_id

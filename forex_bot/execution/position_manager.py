"""
position_manager.py
=====================
Owns two responsibilities that must live together: reading MT5's actual
open positions (the source of truth — not our own in-memory guess of
what's open), and preventing duplicate orders via a real lock around the
check-then-act sequence.

WHY A LOCK, NOT JUST A QUERY: "query MT5 for open positions on this
symbol, see none, then place an order" has a race window between the
query and the order placement. If this bot ever runs the execution path
from more than one trigger concurrently (e.g. a manual dashboard action
firing at the same moment as the scheduled signal loop — anticipated in
a later milestone but the lock costs nothing to add now and closes the
gap permanently), two callers could both observe "no position open" and
both place an order. threading.Lock here makes the
check-duplicate-and-reserve sequence atomic within this process.

This does NOT protect against duplicate orders from a SEPARATE process
(e.g. running run.py twice) — that is out of scope for an in-process
lock and would need a file lock or broker-side magic-number dedup at a
different layer. Documented here so it isn't assumed to cover more than
it does.
"""

from __future__ import annotations

import logging
import threading
from dataclasses import dataclass
from datetime import datetime, timezone

from bot.mt5_client import ORDER_TYPE_BUY, get_client
from bot.mt5_connector import MT5ConnectionError, connector
from core.state_manager import state

logger = logging.getLogger("position_manager")


class PositionManagerError(Exception):
    pass


class DuplicatePositionError(PositionManagerError):
    """Raised when an order is attempted for a symbol+magic_number that already has an open position."""


@dataclass(frozen=True)
class Position:
    ticket: int
    symbol: str
    side: str  # "BUY" or "SELL"
    volume: float
    open_price: float
    current_price: float
    stop_loss: float
    take_profit: float
    profit: float
    swap: float
    magic_number: int
    open_time: datetime
    comment: str


def _from_client_position(raw) -> Position:
    side = "BUY" if raw.type == ORDER_TYPE_BUY else "SELL"
    return Position(
        ticket=raw.ticket,
        symbol=raw.symbol,
        side=side,
        volume=raw.volume,
        open_price=raw.price_open,
        current_price=raw.price_current,
        stop_loss=raw.sl,
        take_profit=raw.tp,
        profit=raw.profit,
        swap=raw.swap,
        magic_number=raw.magic,
        open_time=datetime.fromtimestamp(raw.time, tz=timezone.utc),
        comment=raw.comment,
    )


class PositionManager:
    def __init__(self) -> None:
        # One lock per (symbol, magic_number) pair, created on demand.
        # A single global lock would serialize order placement across
        # unrelated symbols unnecessarily; per-key locks only serialize
        # what actually needs to be serialized.
        self._locks: dict[tuple[str, int], threading.Lock] = {}
        self._locks_guard = threading.Lock()  # protects creation of entries in self._locks

    def _get_lock(self, symbol: str, magic_number: int) -> threading.Lock:
        key = (symbol, magic_number)
        with self._locks_guard:
            if key not in self._locks:
                self._locks[key] = threading.Lock()
            return self._locks[key]

    # ------------------------------------------------------------------
    # Reading positions (source of truth = MT5, not our own bookkeeping)
    # ------------------------------------------------------------------
    def get_open_positions(self, symbol: str | None = None, magic_number: int | None = None) -> list[Position]:
        """
        Fetches current open positions directly from MT5. Optionally
        filtered by symbol and/or magic_number. Raises
        PositionManagerError (does not return an empty list) if MT5 is
        unreachable — an empty list must always mean "confirmed no
        positions", never "couldn't check".
        """
        if not connector.is_connected():
            raise PositionManagerError("Cannot fetch positions: MT5 is not connected.")

        client = get_client()
        raw_positions = client.positions_get(symbol=symbol)

        if magic_number is not None:
            raw_positions = [p for p in raw_positions if p.magic == magic_number]

        return [_from_client_position(p) for p in raw_positions]

    def get_position_by_ticket(self, ticket: int) -> Position | None:
        if not connector.is_connected():
            raise PositionManagerError("Cannot fetch position: MT5 is not connected.")

        client = get_client()
        raw_positions = client.positions_get(ticket=ticket)
        if not raw_positions:
            return None
        return _from_client_position(raw_positions[0])

    def sync_position_count(self) -> int:
        """
        Refreshes state_manager's open_position_count from MT5's actual
        position list — the authoritative count, not our own running
        tally (which could drift if a position was closed by SL/TP hit
        outside of our own close_position() call path, e.g. broker-side
        stop-out).
        """
        positions = self.get_open_positions()
        count = len(positions)
        state.set_open_position_count(count)
        return count

    # ------------------------------------------------------------------
    # Duplicate-order prevention
    # ------------------------------------------------------------------
    def reserve_for_new_position(self, symbol: str, magic_number: int) -> None:
        """
        Call this BEFORE placing an order. Acquires the per-(symbol,
        magic_number) lock, checks MT5 for an existing open position
        matching that key, and raises DuplicatePositionError if one
        exists. The lock is NOT released by this method — the caller
        must call release_reservation() in a finally block after the
        order attempt completes (success or failure), so the
        check-then-place sequence is atomic for the whole duration of
        the order attempt, not just the check.

        Usage:
            position_manager.reserve_for_new_position(symbol, magic)
            try:
                # ... place order ...
            finally:
                position_manager.release_reservation(symbol, magic)
        """
        lock = self._get_lock(symbol, magic_number)
        lock.acquire()
        try:
            existing = self.get_open_positions(symbol=symbol, magic_number=magic_number)
            if existing:
                tickets = [p.ticket for p in existing]
                raise DuplicatePositionError(
                    f"Refusing to open a new position: {len(existing)} position(s) already open for "
                    f"{symbol} with magic_number={magic_number} (tickets: {tickets})."
                )
        except Exception:
            # If the duplicate check itself raises (including
            # DuplicatePositionError), release the lock immediately
            # since the caller's try/finally never started — there is no
            # order attempt to protect.
            lock.release()
            raise

    def release_reservation(self, symbol: str, magic_number: int) -> None:
        """Releases the lock acquired by reserve_for_new_position(). Must
        be called exactly once per successful reserve_for_new_position()
        call, in a finally block."""
        lock = self._get_lock(symbol, magic_number)
        try:
            lock.release()
        except RuntimeError:
            logger.error(
                "release_reservation() called for %s/%d but the lock was not held. "
                "This indicates a bug in caller code (unbalanced reserve/release).",
                symbol, magic_number,
            )
            raise


# Single shared instance for the whole process.
position_manager = PositionManager()

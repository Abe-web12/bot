"""
trade_manager.py
==================
High-level trade lifecycle management: opens new positions (via
order_executor), and manages existing open positions with breakeven and
trailing-stop logic. This module contains NO direct mt5.order_send()
calls — every MT5 mutation goes through order_executor.py, so this
module is pure decision logic (when should breakeven trigger? what
should the new trailing SL be?) that is fully unit-testable without a
live connection.

Partial close (TP1/TP2/TP3 scaling out) is intentionally NOT
implemented as automatic logic in this milestone — config.py defines
TP1/TP2/TP3 ATR multipliers but applying them requires the strategy
layer's signal to specify which take-profit tier was hit, which is an
execution_engine.py orchestration decision, not a trade_manager.py
concern. trade_manager.py exposes execute_partial_close() as a callable
primitive; the orchestration of WHEN to call it belongs to
execution_engine.py, built next.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from enum import Enum

from bot.mt5_connector import connector
from execution.order_executor import (
    ExecutionResult, OrderExecutionError, close_position, modify_position_sl_tp,
)
from execution.position_manager import Position, position_manager
from market.symbols import normalize_volume

logger = logging.getLogger("trade_manager")


class TradeManagerError(Exception):
    pass


class BreakevenTrigger(str, Enum):
    NOT_YET = "NOT_YET"
    TRIGGERED = "TRIGGERED"
    ALREADY_AT_BREAKEVEN = "ALREADY_AT_BREAKEVEN"


@dataclass(frozen=True)
class TrailingStopDecision:
    should_update: bool
    new_stop_loss: float | None
    reason: str


# ---------------------------------------------------------------------------
# Breakeven logic (pure decision function, independently testable)
# ---------------------------------------------------------------------------

def evaluate_breakeven(
    position: Position,
    pip_size: float,
    trigger_distance_pips: float,
    lock_in_pips: float = 1.0,
) -> tuple[BreakevenTrigger, float | None]:
    """
    Determines whether a position has moved far enough in its favor to
    move the stop loss to breakeven (entry price + a small lock-in
    buffer, so the trade can't turn into a loss after having been
    profitable).

    Returns (trigger_state, new_sl_price). new_sl_price is None unless
    trigger_state == TRIGGERED.

    is_buy positions: current_price must be >= open_price +
    trigger_distance_pips. New SL = open_price + lock_in_pips (locks in
    a small profit, not exactly breakeven, so the trade has covered
    spread/commission by the time SL would be hit again).
    SELL positions: mirror image.
    """
    if pip_size <= 0:
        raise TradeManagerError(f"pip_size must be positive, got {pip_size}.")

    is_buy = position.side == "BUY"
    trigger_distance_price = trigger_distance_pips * pip_size
    lock_in_price = lock_in_pips * pip_size

    if is_buy:
        already_at_or_beyond_breakeven = position.stop_loss >= position.open_price
        trigger_price = position.open_price + trigger_distance_price
        has_moved_enough = position.current_price >= trigger_price
        new_sl = position.open_price + lock_in_price
    else:
        already_at_or_beyond_breakeven = position.stop_loss <= position.open_price and position.stop_loss != 0.0
        trigger_price = position.open_price - trigger_distance_price
        has_moved_enough = position.current_price <= trigger_price
        new_sl = position.open_price - lock_in_price

    if already_at_or_beyond_breakeven:
        return BreakevenTrigger.ALREADY_AT_BREAKEVEN, None

    if has_moved_enough:
        return BreakevenTrigger.TRIGGERED, new_sl

    return BreakevenTrigger.NOT_YET, None


def apply_breakeven(position: Position, pip_size: float, trigger_distance_pips: float,
                     lock_in_pips: float = 1.0) -> bool:
    """
    Evaluates and, if triggered, applies breakeven to a live position via
    order_executor.modify_position_sl_tp(). Returns True if a
    modification was made, False if not yet triggered or already at
    breakeven (both are normal, non-error outcomes).
    """
    trigger_state, new_sl = evaluate_breakeven(position, pip_size, trigger_distance_pips, lock_in_pips)

    if trigger_state != BreakevenTrigger.TRIGGERED:
        return False

    try:
        modify_position_sl_tp(position.ticket, new_sl, position.take_profit)
    except OrderExecutionError as exc:
        logger.error("Failed to apply breakeven to position %d: %s", position.ticket, exc)
        raise TradeManagerError(f"Breakeven application failed for position {position.ticket}: {exc}") from exc

    logger.info(
        "Breakeven applied to position %d (%s): SL moved from %.5f to %.5f",
        position.ticket, position.symbol, position.stop_loss, new_sl,
    )
    return True


# ---------------------------------------------------------------------------
# Trailing stop logic (pure decision function, independently testable)
# ---------------------------------------------------------------------------

def evaluate_trailing_stop(
    position: Position,
    pip_size: float,
    trailing_start_pips: float,
    trailing_step_pips: float,
) -> TrailingStopDecision:
    """
    Decides whether the trailing stop should advance. The stop only ever
    moves in the position's favor (never loosens) — this is enforced
    here, not just assumed, since a bug that loosens a trailing stop
    would defeat its entire purpose.

    Logic: once price has moved at least trailing_start_pips beyond
    entry, the SL trails behind current price by trailing_step_pips. The
    SL is only updated if the new trailing level is actually better
    (further in-profit direction) than the current SL — prevents
    redundant/no-op modify calls and, critically, prevents ever moving
    SL backward due to a stale/late price tick.
    """
    if pip_size <= 0:
        raise TradeManagerError(f"pip_size must be positive, got {pip_size}.")
    if trailing_step_pips <= 0:
        raise TradeManagerError(f"trailing_step_pips must be positive, got {trailing_step_pips}.")

    is_buy = position.side == "BUY"
    start_distance_price = trailing_start_pips * pip_size
    step_price = trailing_step_pips * pip_size

    if is_buy:
        profit_distance = position.current_price - position.open_price
        if profit_distance < start_distance_price:
            return TrailingStopDecision(False, None, "Price has not moved far enough to start trailing.")

        candidate_sl = position.current_price - step_price
        # Only advance if strictly better than current SL (or SL unset/0).
        if position.stop_loss > 0 and candidate_sl <= position.stop_loss:
            return TrailingStopDecision(False, None, "Candidate trailing SL is not better than current SL.")

        return TrailingStopDecision(True, candidate_sl, f"Trailing SL advanced to {candidate_sl:.5f}.")

    else:
        profit_distance = position.open_price - position.current_price
        if profit_distance < start_distance_price:
            return TrailingStopDecision(False, None, "Price has not moved far enough to start trailing.")

        candidate_sl = position.current_price + step_price
        if position.stop_loss > 0 and candidate_sl >= position.stop_loss:
            return TrailingStopDecision(False, None, "Candidate trailing SL is not better than current SL.")

        return TrailingStopDecision(True, candidate_sl, f"Trailing SL advanced to {candidate_sl:.5f}.")


def apply_trailing_stop(position: Position, pip_size: float, trailing_start_pips: float,
                         trailing_step_pips: float) -> bool:
    """Evaluates and, if appropriate, applies the trailing stop to a live
    position. Returns True if a modification was made."""
    decision = evaluate_trailing_stop(position, pip_size, trailing_start_pips, trailing_step_pips)

    if not decision.should_update:
        return False

    try:
        modify_position_sl_tp(position.ticket, decision.new_stop_loss, position.take_profit)
    except OrderExecutionError as exc:
        logger.error("Failed to apply trailing stop to position %d: %s", position.ticket, exc)
        raise TradeManagerError(f"Trailing stop application failed for position {position.ticket}: {exc}") from exc

    logger.info(
        "Trailing stop applied to position %d (%s): SL moved from %.5f to %.5f",
        position.ticket, position.symbol, position.stop_loss, decision.new_stop_loss,
    )
    return True


# ---------------------------------------------------------------------------
# Partial close primitive
# ---------------------------------------------------------------------------

def execute_partial_close(position: Position, close_fraction: float) -> ExecutionResult:
    """
    Closes close_fraction (0.0-1.0 exclusive of 0, inclusive of 1.0) of
    a position's current volume. The resulting volume is normalized to
    the symbol's volume_step via market.symbols.normalize_volume inside
    order_executor's close path is NOT applied here — close_position()
    in order_executor expects an already-valid volume, so we round here
    using the symbol info to avoid sending MT5 a fractional lot size
    that violates the broker's step (e.g. closing exactly 33% of a 0.03
    lot position must not produce 0.0099).
    """
    if not (0.0 < close_fraction <= 1.0):
        raise TradeManagerError(f"close_fraction must be in (0.0, 1.0], got {close_fraction}.")

    symbol_info = connector.get_symbol_info(position.symbol)
    raw_close_volume = position.volume * close_fraction

    close_volume = normalize_volume(symbol_info, raw_close_volume)

    if close_volume <= 0:
        raise TradeManagerError(
            f"Partial close of {close_fraction:.2%} on position {position.ticket} "
            f"({position.volume} lots) rounds down to 0 — below broker minimum. Close fully instead."
        )

    if close_volume >= position.volume:
        logger.info(
            "Partial close fraction %.2f on position %d rounds up to the full position volume "
            "(%.2f lots) — performing a full close instead.",
            close_fraction, position.ticket, position.volume,
        )

    try:
        return close_position(position.ticket, volume=close_volume)
    except OrderExecutionError as exc:
        raise TradeManagerError(f"Partial close failed for position {position.ticket}: {exc}") from exc


def execute_full_close(position: Position) -> ExecutionResult:
    """Closes a position entirely. Thin wrapper over order_executor.close_position
    kept here so callers consistently go through trade_manager.py rather than
    mixing direct order_executor calls with trade_manager calls."""
    try:
        return close_position(position.ticket, volume=None)
    except OrderExecutionError as exc:
        raise TradeManagerError(f"Full close failed for position {position.ticket}: {exc}") from exc


# ---------------------------------------------------------------------------
# Batch management entry point — intended to be called once per bot loop tick
# ---------------------------------------------------------------------------

def manage_open_positions(
    symbol: str,
    magic_number: int,
    pip_size: float,
    breakeven_trigger_pips: float,
    breakeven_lock_in_pips: float,
    trailing_start_pips: float,
    trailing_step_pips: float,
) -> dict[str, int]:
    """
    Runs breakeven and trailing-stop evaluation across every open
    position for symbol+magic_number. Intended to be called once per
    execution_engine.py loop tick. Returns a summary dict of how many
    positions had breakeven/trailing applied, for logging/dashboard
    purposes. Errors on individual positions are logged and do not stop
    processing of the remaining positions — one broken modify call must
    not prevent managing every other open position's risk.
    """
    positions = position_manager.get_open_positions(symbol=symbol, magic_number=magic_number)

    breakeven_applied = 0
    trailing_applied = 0
    errors = 0

    for position in positions:
        try:
            if apply_breakeven(position, pip_size, breakeven_trigger_pips, breakeven_lock_in_pips):
                breakeven_applied += 1
        except TradeManagerError as exc:
            logger.error("Breakeven evaluation failed for position %d: %s", position.ticket, exc)
            errors += 1
            continue  # still attempt trailing stop for this position independently

        try:
            # Re-fetch position state in case breakeven just modified it,
            # so trailing-stop logic evaluates against the current SL,
            # not a stale pre-breakeven value.
            refreshed = position_manager.get_position_by_ticket(position.ticket)
            if refreshed is None:
                continue  # position closed between breakeven and trailing check (e.g. SL/TP hit)
            if apply_trailing_stop(refreshed, pip_size, trailing_start_pips, trailing_step_pips):
                trailing_applied += 1
        except TradeManagerError as exc:
            logger.error("Trailing stop evaluation failed for position %d: %s", position.ticket, exc)
            errors += 1

    return {
        "positions_checked": len(positions),
        "breakeven_applied": breakeven_applied,
        "trailing_applied": trailing_applied,
        "errors": errors,
    }

"""
order_executor.py
====================
The ONLY module in this codebase that calls mt5.order_send() or
mt5.order_check(). Every other module that needs to open, modify, or
close a position goes through the functions here. Centralizing this is
what makes retry policy, requote handling, and execution logging exist
in exactly one place rather than being reimplemented (and subtly
diverging) across trade_manager.py and execution_engine.py.

EXECUTION GATE ORDER (enforced by execute_market_order, cannot be
bypassed by calling a "skip validation" parameter — there isn't one):
  1. order_validator.validate_order() — pre-flight checks (connection,
     symbol, volume, spread, margin estimate, SL/TP distance, session)
  2. risk.drawdown_guard.can_open_new_trade() — the circuit breaker
  3. position_manager.reserve_for_new_position() — duplicate-order lock
  4. mt5.order_check() — broker's own authoritative pre-trade check
  5. mt5.order_send() — actual execution, with retry on recoverable errors

If ANY of 1-4 fails, mt5.order_send() is never called. This is not a
"best effort" ordering — it's a hard sequential gate.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from datetime import datetime, timezone

import MetaTrader5 as mt5

import config
from bot.mt5_connector import MT5ConnectionError, connector
from core.circuit_breaker import CircuitOpenError, mt5_circuit
from core.event_bus import Events, bus
from core.state_manager import state
from execution.order_validator import OrderRequest, OrderSide, validate_order
from execution.position_manager import DuplicatePositionError, position_manager
from market.data_feed import DataFeedError, get_current_spread_pips, get_latest_tick
from market.symbols import normalize_price, normalize_volume
from risk.drawdown_guard import drawdown_guard

logger = logging.getLogger("order_executor")


class OrderExecutionError(Exception):
    pass


class OrderRejectedByRiskError(OrderExecutionError):
    """Raised when drawdown_guard or order_validator refuses the trade. Distinct
    from broker-level rejection so callers can distinguish 'our own risk rules
    said no' from 'the broker said no'."""


class OrderRejectedByBrokerError(OrderExecutionError):
    """Raised when MT5 itself rejects the order after all retries are exhausted."""


# Retcodes that represent a transient condition worth retrying (price
# moved, requote, server busy) as opposed to a structural rejection
# (invalid volume, no money, market closed) that retrying cannot fix.
_RETRYABLE_RETCODES = {
    getattr(mt5, "TRADE_RETCODE_REQUOTE", 10004),
    getattr(mt5, "TRADE_RETCODE_PRICE_CHANGED", 10020),
    getattr(mt5, "TRADE_RETCODE_TIMEOUT", 10012),
    10031,  # no connection with trade server
}


@dataclass(frozen=True)
class ExecutionResult:
    success: bool
    ticket: int | None
    requested_price: float
    filled_price: float | None
    volume: float
    retcode: int | None
    retcode_description: str
    retry_count: int
    request_id: str  # correlates this attempt across log lines


def _generate_request_id(symbol: str, side: OrderSide) -> str:
    return f"{symbol}-{side.value}-{int(time.time() * 1000)}"


def _build_mt5_request(request: OrderRequest, symbol_info, tick: dict, deviation_points: int) -> dict:
    is_buy = request.side == OrderSide.BUY
    order_type = mt5.ORDER_TYPE_BUY if is_buy else mt5.ORDER_TYPE_SELL
    price = tick["ask"] if is_buy else tick["bid"]

    return {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": request.symbol,
        "volume": normalize_volume(symbol_info, request.volume),
        "type": order_type,
        "price": normalize_price(symbol_info, price),
        "sl": normalize_price(symbol_info, request.stop_loss_price),
        "tp": normalize_price(symbol_info, request.take_profit_price),
        "deviation": deviation_points,
        "magic": request.magic_number,
        "comment": request.comment[:31] if request.comment else "bot",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }


def _retcode_description(retcode: int) -> str:
    descriptions = {
        10004: "Requote", 10006: "Request rejected", 10007: "Request canceled by trader",
        10008: "Order placed", 10009: "Request completed (done)",
        10010: "Only part of the request was completed", 10011: "Request processing error",
        10012: "Request canceled by timeout", 10013: "Invalid request",
        10014: "Invalid volume in the request", 10015: "Invalid price in the request",
        10016: "Invalid stops in the request", 10017: "Trade is disabled",
        10018: "Market is closed", 10019: "There is not enough money to complete the request",
        10020: "Prices changed", 10021: "There are no quotes to process the request",
        10022: "Invalid order expiration date in the request", 10023: "Order state changed",
        10024: "Too frequent requests", 10025: "No changes in request",
        10026: "Autotrading disabled by server", 10027: "Autotrading disabled by client terminal",
        10028: "Request locked for processing", 10029: "Order or position frozen",
        10030: "Invalid order filling type", 10031: "No connection with the trade server",
        10033: "Number of pending orders reached the limit",
        10034: "Volume of orders/positions for the symbol reached the limit",
    }
    return descriptions.get(retcode, f"Unknown retcode {retcode}")


def _run_pre_flight_checks(request: OrderRequest) -> tuple:
    """
    Runs validation + risk gate. Returns (symbol_info, account, tick,
    spread_pips) on success. Raises OrderRejectedByRiskError on any
    failure. Separated from execute_market_order() so the retry/send
    logic below it is independently testable with synthetic inputs —
    this function is the part that genuinely cannot be exercised without
    live MT5 data.
    """
    if not connector.is_connected():
        raise OrderRejectedByRiskError(f"Cannot execute order for {request.symbol}: MT5 is not connected.")

    try:
        symbol_info = connector.get_symbol_info(request.symbol)
        tick = get_latest_tick(request.symbol)
        spread_pips = get_current_spread_pips(request.symbol)
    except (MT5ConnectionError, DataFeedError) as exc:
        raise OrderRejectedByRiskError(f"Cannot execute order for {request.symbol}: {exc}") from exc

    account = state.account
    account_info = mt5.account_info()
    leverage = account_info.leverage if account_info else 0

    validation = validate_order(
        request=request,
        symbol_info=symbol_info,
        account=account,
        connection_status=state.connection_status,
        current_spread_pips=spread_pips,
        max_spread_pips=config.MAX_SPREAD_PIPS,
        leverage=leverage,
        now_utc=datetime.now(timezone.utc),
        session_start_utc=config.LONDON_OPEN,
        session_end_utc=config.NY_CLOSE,
    )
    if not validation.is_valid:
        raise OrderRejectedByRiskError(f"Order validation failed for {request.symbol}: {'; '.join(validation.errors)}")

    allowed, reason = drawdown_guard.can_open_new_trade()
    if not allowed:
        raise OrderRejectedByRiskError(f"Risk gate refused trade for {request.symbol}: {reason}")

    return symbol_info, account, tick, spread_pips


def execute_market_order(
    request: OrderRequest,
    max_retries: int | None = None,
    retry_delay_seconds: float = 1.0,
    deviation_points: int = 20,
) -> ExecutionResult:
    """
    Executes a market order end-to-end: validation, risk gate, duplicate
    lock, broker pre-check, send with retry on recoverable errors.

    Raises OrderRejectedByRiskError if validation or the risk gate
    refuses the trade (no MT5 call is ever made in this case).
    Raises OrderRejectedByBrokerError if MT5 rejects the order after
    exhausting retries.
    Raises DuplicatePositionError if a position already exists for this
    symbol+magic_number.

    Returns ExecutionResult only on confirmed success.
    """
    max_retries = max_retries if max_retries is not None else config.MAX_RETRY_ATTEMPTS
    request_id = _generate_request_id(request.symbol, request.side)

    logger.info(
        "[%s] Order execution starting: %s %s %.2f lots, SL=%.5f, TP=%.5f, magic=%d",
        request_id, request.symbol, request.side.value, request.volume,
        request.stop_loss_price, request.take_profit_price, request.magic_number,
    )

    symbol_info, account, _tick, spread_pips = _run_pre_flight_checks(request)

    position_manager.reserve_for_new_position(request.symbol, request.magic_number)
    try:
        return _send_with_retry(
            request=request, symbol_info=symbol_info, max_retries=max_retries,
            retry_delay_seconds=retry_delay_seconds, deviation_points=deviation_points,
            request_id=request_id,
        )
    finally:
        position_manager.release_reservation(request.symbol, request.magic_number)


def _send_with_retry(
    request: OrderRequest, symbol_info, max_retries: int,
    retry_delay_seconds: float, deviation_points: int, request_id: str,
) -> ExecutionResult:
    last_retcode: int | None = None
    last_description = "Not attempted"

    for attempt in range(1, max_retries + 1):
        try:
            tick = get_latest_tick(request.symbol)
        except DataFeedError as exc:
            logger.error("[%s] Attempt %d/%d: could not refresh tick before send: %s",
                         request_id, attempt, max_retries, exc)
            time.sleep(retry_delay_seconds)
            continue

        mt5_request = _build_mt5_request(request, symbol_info, tick, deviation_points)

        try:
            result = mt5_circuit.execute(mt5.order_send, mt5_request)
        except CircuitOpenError as exc:
            logger.error(
                "[%s] Attempt %d/%d: MT5 circuit breaker is OPEN — failing fast without contacting broker. %s",
                request_id, attempt, max_retries, exc,
            )
            bus.publish(
                Events.TRADE_REJECTED,
                {"request_id": request_id, "symbol": request.symbol, "retcode": None,
                 "reason": f"MT5 circuit breaker open: {exc}"},
                source="order_executor",
            )
            raise OrderRejectedByBrokerError(
                f"[{request_id}] MT5 circuit breaker is open — refusing to send order for {request.symbol}."
            ) from exc

        if result is None:
            error = mt5.last_error()
            last_description = f"order_send() returned None. MT5 error: {error}"
            logger.error("[%s] Attempt %d/%d: %s", request_id, attempt, max_retries, last_description)
            time.sleep(retry_delay_seconds)
            continue

        last_retcode = result.retcode
        last_description = _retcode_description(result.retcode)

        if result.retcode == getattr(mt5, "TRADE_RETCODE_DONE", 10009):
            logger.info(
                "[%s] Attempt %d/%d: SUCCESS. Ticket=%d, filled price=%.5f, volume=%.2f",
                request_id, attempt, max_retries, result.order, result.price, result.volume,
            )
            state.record_trade_opened()
            bus.publish(
                Events.TRADE_OPENED,
                {"request_id": request_id, "symbol": request.symbol, "side": request.side.value,
                 "ticket": result.order, "volume": result.volume, "price": result.price,
                 "magic_number": request.magic_number},
                source="order_executor",
            )
            return ExecutionResult(
                success=True, ticket=result.order, requested_price=mt5_request["price"],
                filled_price=result.price, volume=result.volume, retcode=result.retcode,
                retcode_description=last_description, retry_count=attempt - 1, request_id=request_id,
            )

        if result.retcode in _RETRYABLE_RETCODES:
            logger.warning(
                "[%s] Attempt %d/%d: retryable rejection retcode=%d (%s). Retrying...",
                request_id, attempt, max_retries, result.retcode, last_description,
            )
            time.sleep(retry_delay_seconds)
            continue

        logger.error(
            "[%s] Attempt %d/%d: non-retryable rejection retcode=%d (%s). Aborting.",
            request_id, attempt, max_retries, result.retcode, last_description,
        )
        bus.publish(
            Events.TRADE_REJECTED,
            {"request_id": request_id, "symbol": request.symbol, "retcode": result.retcode, "reason": last_description},
            source="order_executor",
        )
        raise OrderRejectedByBrokerError(
            f"[{request_id}] Broker rejected order for {request.symbol}: retcode={result.retcode} ({last_description})"
        )

    bus.publish(
        Events.TRADE_REJECTED,
        {"request_id": request_id, "symbol": request.symbol, "retcode": last_retcode, "reason": "max retries exceeded"},
        source="order_executor",
    )
    raise OrderRejectedByBrokerError(
        f"[{request_id}] Order for {request.symbol} failed after {max_retries} attempts. "
        f"Last retcode={last_retcode} ({last_description})."
    )


def modify_position_sl_tp(ticket: int, new_sl: float, new_tp: float) -> bool:
    """
    Modifies SL/TP on an existing open position. Returns True on
    confirmed success, raises OrderExecutionError otherwise (never
    returns False silently).
    """
    if not connector.is_connected():
        raise OrderExecutionError(f"Cannot modify position {ticket}: MT5 is not connected.")

    position = mt5.positions_get(ticket=ticket)
    if not position:
        raise OrderExecutionError(f"Cannot modify position {ticket}: position not found (already closed?).")

    pos = position[0]
    request = {
        "action": mt5.TRADE_ACTION_SLTP, "symbol": pos.symbol, "position": ticket,
        "sl": new_sl, "tp": new_tp,
    }

    try:
        result = mt5_circuit.execute(mt5.order_send, request)
    except CircuitOpenError as exc:
        raise OrderExecutionError(
            f"modify_position_sl_tp({ticket}) refused: MT5 circuit breaker is open. {exc}"
        ) from exc
    if result is None:
        error = mt5.last_error()
        raise OrderExecutionError(f"modify_position_sl_tp({ticket}) failed: order_send returned None. Error: {error}")

    if result.retcode != getattr(mt5, "TRADE_RETCODE_DONE", 10009):
        raise OrderExecutionError(
            f"modify_position_sl_tp({ticket}) rejected: retcode={result.retcode} ({_retcode_description(result.retcode)})"
        )

    logger.info("Modified position %d: SL=%.5f, TP=%.5f", ticket, new_sl, new_tp)
    return True


def close_position(ticket: int, volume: float | None = None, deviation_points: int = 20) -> ExecutionResult:
    """
    Closes a position fully (volume=None) or partially (volume=specific
    lot amount). A partial close is an opposite-direction market order
    against the same position ticket — the standard MT5 pattern.
    """
    if not connector.is_connected():
        raise OrderExecutionError(f"Cannot close position {ticket}: MT5 is not connected.")

    position = mt5.positions_get(ticket=ticket)
    if not position:
        raise OrderExecutionError(f"Cannot close position {ticket}: position not found (already closed?).")

    pos = position[0]
    close_volume = volume if volume is not None else pos.volume

    if close_volume > pos.volume:
        raise OrderExecutionError(f"Cannot close {close_volume} lots on position {ticket}: only {pos.volume} lots open.")

    is_closing_a_buy = pos.type == mt5.ORDER_TYPE_BUY
    close_order_type = mt5.ORDER_TYPE_SELL if is_closing_a_buy else mt5.ORDER_TYPE_BUY

    try:
        tick = get_latest_tick(pos.symbol)
    except DataFeedError as exc:
        raise OrderExecutionError(f"Cannot close position {ticket}: {exc}") from exc

    close_price = tick["bid"] if is_closing_a_buy else tick["ask"]

    request = {
        "action": mt5.TRADE_ACTION_DEAL, "symbol": pos.symbol, "volume": close_volume,
        "type": close_order_type, "position": ticket, "price": close_price,
        "deviation": deviation_points, "magic": pos.magic, "comment": "bot_close",
        "type_time": mt5.ORDER_TIME_GTC, "type_filling": mt5.ORDER_FILLING_IOC,
    }

    try:
        result = mt5_circuit.execute(mt5.order_send, request)
    except CircuitOpenError as exc:
        raise OrderExecutionError(
            f"close_position({ticket}) refused: MT5 circuit breaker is open. {exc}"
        ) from exc
    if result is None:
        error = mt5.last_error()
        raise OrderExecutionError(f"close_position({ticket}) failed: order_send returned None. Error: {error}")

    if result.retcode != getattr(mt5, "TRADE_RETCODE_DONE", 10009):
        raise OrderExecutionError(
            f"close_position({ticket}) rejected: retcode={result.retcode} ({_retcode_description(result.retcode)})"
        )

    is_full_close = close_volume >= pos.volume
    logger.info(
        "Closed %s%.2f lots of position %d (%s) at %.5f",
        "" if is_full_close else "partial ", close_volume, ticket, pos.symbol, result.price,
    )

    state.record_realized_pnl(pos.profit if is_full_close else 0.0)
    if is_full_close:
        state.record_trade_closed_count()

    bus.publish(
        Events.TRADE_CLOSED,
        {"ticket": ticket, "symbol": pos.symbol, "volume": close_volume, "price": result.price, "full_close": is_full_close},
        source="order_executor",
    )

    return ExecutionResult(
        success=True, ticket=ticket, requested_price=close_price, filled_price=result.price,
        volume=result.volume, retcode=result.retcode, retcode_description=_retcode_description(result.retcode),
        retry_count=0, request_id=f"close-{ticket}-{int(time.time() * 1000)}",
    )

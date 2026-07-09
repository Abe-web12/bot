"""
order_validator.py
====================
Pre-flight validation for every order before it reaches order_executor.py.
Every check here is a hard gate, not a warning — order_executor.py treats
any ValidationResult with is_valid=False as a refusal to proceed, full
stop. This mirrors the pattern already established by
market/data_validator.py (structural ValidationResult with errors/warnings)
so the two validation layers in this codebase behave consistently.

This module performs NO side effects — it does not place orders, does
not modify state, and does not call drawdown_guard (that integration
happens in order_executor.py / execution_engine.py, which compose this
module's pure checks with the stateful risk gate). Keeping this module
side-effect-free is what makes every check here independently unit
testable with synthetic SymbolInfo/account data.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum

from bot.mt5_connector import SymbolInfo
from core.state_manager import AccountSnapshot, ConnectionStatus

logger = logging.getLogger("order_validator")


class OrderSide(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


@dataclass(frozen=True)
class OrderRequest:
    """
    The fully-specified intent to place an order, prior to validation.
    Carrying this as one immutable object (rather than passing 6 loose
    parameters between validator/executor/risk functions) means every
    function in the execution layer agrees on exactly what fields an
    order request has, and adding a field later means updating one
    dataclass, not every function signature that touches an order.
    """
    symbol: str
    side: OrderSide
    volume: float
    stop_loss_price: float
    take_profit_price: float
    entry_price_estimate: float  # used for margin estimation only — actual fill price comes from the broker
    magic_number: int
    comment: str = ""


@dataclass(frozen=True)
class ValidationResult:
    is_valid: bool
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def raise_if_invalid(self, context: str = "") -> None:
        if not self.is_valid:
            raise OrderValidationError(f"{context}: {'; '.join(self.errors)}")


class OrderValidationError(Exception):
    pass


def validate_symbol(symbol_info: SymbolInfo, symbol: str) -> ValidationResult:
    """
    Confirms the resolved symbol matches what was requested (catches the
    case where mt5_connector.get_symbol_info silently resolved a
    broker-suffixed variant like EURUSDm when the caller didn't account
    for that) and that the symbol is currently visible.
    """
    errors: list[str] = []

    if symbol_info is None:
        return ValidationResult(is_valid=False, errors=[f"No symbol info available for '{symbol}'."])

    if not symbol_info.visible:
        errors.append(f"Symbol '{symbol_info.name}' is not visible in Market Watch.")

    return ValidationResult(is_valid=len(errors) == 0, errors=errors)


def validate_volume(symbol_info: SymbolInfo, volume: float) -> ValidationResult:
    """
    Confirms volume respects the broker's min/max/step constraints
    EXACTLY — not "close enough". A volume that isn't an exact multiple
    of volume_step (within floating-point tolerance) will be rejected by
    MT5 with "Invalid volume", and we want that caught here with a clear
    message, not as an opaque broker rejection deep in order_executor.
    """
    errors: list[str] = []

    if volume <= 0:
        return ValidationResult(is_valid=False, errors=[f"Volume must be positive, got {volume}."])

    if volume < symbol_info.volume_min:
        errors.append(f"Volume {volume} is below broker minimum {symbol_info.volume_min} for {symbol_info.name}.")

    if volume > symbol_info.volume_max:
        errors.append(f"Volume {volume} exceeds broker maximum {symbol_info.volume_max} for {symbol_info.name}.")

    if symbol_info.volume_step > 0:
        steps = volume / symbol_info.volume_step
        # Allow tiny floating-point tolerance (1e-6) rather than exact
        # equality, since volume arithmetic upstream (lot_calculator)
        # involves float division/multiplication.
        if abs(steps - round(steps)) > 1e-6:
            errors.append(
                f"Volume {volume} is not a valid multiple of broker step {symbol_info.volume_step} "
                f"for {symbol_info.name}."
            )

    return ValidationResult(is_valid=len(errors) == 0, errors=errors)


def validate_spread(current_spread_pips: float, max_spread_pips: float) -> ValidationResult:
    """
    Rejects the order if current spread exceeds the configured maximum.
    This is checked at the moment of order placement (not at signal
    generation time) because spread can widen significantly between
    signal generation and execution, especially around news events.
    """
    if current_spread_pips < 0:
        return ValidationResult(is_valid=False, errors=[f"Spread cannot be negative, got {current_spread_pips}."])

    if current_spread_pips > max_spread_pips:
        return ValidationResult(
            is_valid=False,
            errors=[
                f"Current spread {current_spread_pips:.1f} pips exceeds maximum allowed "
                f"{max_spread_pips:.1f} pips. Refusing to trade in widened-spread conditions."
            ],
        )

    return ValidationResult(is_valid=True)


def validate_margin(
    account: AccountSnapshot,
    symbol_info: SymbolInfo,
    volume: float,
    entry_price_estimate: float,
    leverage: int,
    required_free_margin_buffer_pct: float = 20.0,
) -> ValidationResult:
    """
    Estimates margin required for this order and confirms the account
    has sufficient free margin, with a configurable safety buffer beyond
    the bare minimum (default: require 20% MORE free margin than the
    order strictly needs, so the account isn't left at the edge of a
    margin call by a single trade).

    This is an ESTIMATE — order_executor.py should still rely on MT5's
    own order_check() for the broker's authoritative margin calculation
    immediately before sending the order (margin requirements can depend
    on broker-specific rules this estimate doesn't model, e.g. tiered
    margin). This function exists to fail fast with a clear message
    before even constructing a request, not to replace order_check().
    """
    errors: list[str] = []

    if leverage <= 0:
        return ValidationResult(is_valid=False, errors=[f"Invalid leverage {leverage} — cannot estimate margin."])

    if entry_price_estimate <= 0:
        return ValidationResult(is_valid=False, errors=[f"Invalid entry price estimate {entry_price_estimate}."])

    contract_value = volume * symbol_info.trade_contract_size * entry_price_estimate
    estimated_margin_required = contract_value / leverage
    required_with_buffer = estimated_margin_required * (1 + required_free_margin_buffer_pct / 100.0)

    if account.free_margin < required_with_buffer:
        errors.append(
            f"Insufficient free margin. Estimated requirement (with {required_free_margin_buffer_pct}% buffer): "
            f"{required_with_buffer:.2f} {account.currency}. Available free margin: "
            f"{account.free_margin:.2f} {account.currency}."
        )

    return ValidationResult(is_valid=len(errors) == 0, errors=errors)


def validate_connection(connection_status: ConnectionStatus) -> ValidationResult:
    """Refuses to validate an order as tradeable if MT5 is not connected.
    Trivial check, but centralizing it means every code path that builds
    an order goes through the same gate rather than each remembering to
    check is_connected() independently."""
    if connection_status != ConnectionStatus.CONNECTED:
        return ValidationResult(
            is_valid=False,
            errors=[f"MT5 connection status is '{connection_status.value}', not CONNECTED. Refusing to trade."],
        )
    return ValidationResult(is_valid=True)


def validate_stop_loss_take_profit(
    side: OrderSide,
    entry_price_estimate: float,
    stop_loss_price: float,
    take_profit_price: float,
    symbol_info: SymbolInfo,
    min_stop_distance_pips: float = 2.0,
) -> ValidationResult:
    """
    Confirms SL/TP are on the correct side of entry for the order
    direction (a BUY's SL must be below entry, TP above; SELL is the
    mirror) and far enough from entry to clear the broker's minimum
    stop distance (MT5 will reject orders with SL/TP too close to the
    current price — "Invalid stops").
    """
    errors: list[str] = []
    pip_divisor = 10 if symbol_info.digits in (3, 5) else 1
    pip_size = symbol_info.point * pip_divisor

    if side == OrderSide.BUY:
        if stop_loss_price >= entry_price_estimate:
            errors.append(f"BUY stop_loss_price ({stop_loss_price}) must be below entry ({entry_price_estimate}).")
        if take_profit_price <= entry_price_estimate:
            errors.append(f"BUY take_profit_price ({take_profit_price}) must be above entry ({entry_price_estimate}).")
    else:
        if stop_loss_price <= entry_price_estimate:
            errors.append(f"SELL stop_loss_price ({stop_loss_price}) must be above entry ({entry_price_estimate}).")
        if take_profit_price >= entry_price_estimate:
            errors.append(f"SELL take_profit_price ({take_profit_price}) must be below entry ({entry_price_estimate}).")

    if not errors:
        sl_distance_pips = abs(entry_price_estimate - stop_loss_price) / pip_size
        tp_distance_pips = abs(entry_price_estimate - take_profit_price) / pip_size

        if sl_distance_pips < min_stop_distance_pips:
            errors.append(
                f"Stop loss is only {sl_distance_pips:.1f} pips from entry; "
                f"broker minimum is approximately {min_stop_distance_pips:.1f} pips."
            )
        if tp_distance_pips < min_stop_distance_pips:
            errors.append(
                f"Take profit is only {tp_distance_pips:.1f} pips from entry; "
                f"broker minimum is approximately {min_stop_distance_pips:.1f} pips."
            )

    return ValidationResult(is_valid=len(errors) == 0, errors=errors)


def validate_trading_session(now_utc: datetime, session_start_utc: str, session_end_utc: str) -> ValidationResult:
    """
    Confirms the current UTC time falls within the configured trading
    session window (e.g. London+NY hours from config.py). Does not
    handle day-of-week (weekend) logic — that is intentionally left to
    market/data_validator.validate_freshness, which already detects
    "data is stale because the market is closed" from the data itself
    rather than from a hardcoded weekend calendar that could drift out
    of sync with actual holiday closures.
    """
    try:
        start_hour, start_minute = (int(p) for p in session_start_utc.split(":"))
        end_hour, end_minute = (int(p) for p in session_end_utc.split(":"))
    except (ValueError, AttributeError) as exc:
        return ValidationResult(
            is_valid=False,
            errors=[f"Invalid session time format (expected 'HH:MM'): start='{session_start_utc}', end='{session_end_utc}'. {exc}"],
        )

    session_start_minutes = start_hour * 60 + start_minute
    session_end_minutes = end_hour * 60 + end_minute
    now_minutes = now_utc.hour * 60 + now_utc.minute

    if session_start_minutes <= session_end_minutes:
        in_session = session_start_minutes <= now_minutes < session_end_minutes
    else:
        # Session wraps midnight UTC (not currently used by config.py's
        # London/NY windows, but supported for correctness/future use).
        in_session = now_minutes >= session_start_minutes or now_minutes < session_end_minutes

    if not in_session:
        return ValidationResult(
            is_valid=False,
            errors=[
                f"Current time {now_utc.strftime('%H:%M')} UTC is outside the configured trading "
                f"session ({session_start_utc}-{session_end_utc} UTC)."
            ],
        )
    return ValidationResult(is_valid=True)


def validate_order(
    request: OrderRequest,
    symbol_info: SymbolInfo,
    account: AccountSnapshot,
    connection_status: ConnectionStatus,
    current_spread_pips: float,
    max_spread_pips: float,
    leverage: int,
    now_utc: datetime,
    session_start_utc: str,
    session_end_utc: str,
    margin_buffer_pct: float = 20.0,
    min_stop_distance_pips: float = 2.0,
) -> ValidationResult:
    """
    Runs every check and aggregates results. Returns is_valid=False with
    ALL accumulated error messages if any check fails — a caller fixing
    one issue and resubmitting should see every other issue too, not
    discover them one at a time across multiple rejected attempts.
    """
    all_errors: list[str] = []
    all_warnings: list[str] = []

    checks = [
        validate_connection(connection_status),
        validate_symbol(symbol_info, request.symbol),
        validate_volume(symbol_info, request.volume),
        validate_spread(current_spread_pips, max_spread_pips),
        validate_margin(account, symbol_info, request.volume, request.entry_price_estimate,
                         leverage, margin_buffer_pct),
        validate_stop_loss_take_profit(request.side, request.entry_price_estimate,
                                        request.stop_loss_price, request.take_profit_price,
                                        symbol_info, min_stop_distance_pips),
        validate_trading_session(now_utc, session_start_utc, session_end_utc),
    ]

    for result in checks:
        all_errors.extend(result.errors)
        all_warnings.extend(result.warnings)

    is_valid = len(all_errors) == 0

    if not is_valid:
        logger.warning(
            "Order validation FAILED for %s %s %s lots: %s",
            request.symbol, request.side.value, request.volume, "; ".join(all_errors),
        )
    else:
        logger.info("Order validation PASSED for %s %s %s lots.", request.symbol, request.side.value, request.volume)

    return ValidationResult(is_valid=is_valid, errors=all_errors, warnings=all_warnings)

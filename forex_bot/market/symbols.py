"""
symbols.py
==========
Thin helpers built on top of bot.mt5_connector's SymbolInfo for
symbol-related calculations that strategy/risk code needs repeatedly:
pip size, price-to-pips conversion, and a single "is this symbol
actually tradeable right now" check.

mt5_connector.py owns *fetching and resolving* symbol info from MT5
(including broker-suffix matching like EURUSDm). This module owns
*calculations* built on top of that info, so those calculations aren't
duplicated across strategy, risk, and execution code with subtly
different rounding each time.
"""

from __future__ import annotations

import logging

import MetaTrader5 as mt5

from bot.mt5_connector import SymbolInfo, connector

logger = logging.getLogger("symbols")


class SymbolUnavailableError(Exception):
    pass


def pip_size(symbol_info: SymbolInfo) -> float:
    """
    Price difference equal to 1 pip for this symbol.
    5-digit (e.g. EURUSD=1.10500) and 3-digit (e.g. USDJPY=110.500)
    brokers quote an extra fractional digit beyond the traditional pip,
    so pip = 10 * point for those; otherwise pip = point.
    """
    pip_divisor = 10 if symbol_info.digits in (3, 5) else 1
    return symbol_info.point * pip_divisor


def price_diff_to_pips(symbol_info: SymbolInfo, price_diff: float) -> float:
    """Convert a raw price difference (e.g. entry - stop_loss) into pips."""
    size = pip_size(symbol_info)
    if size <= 0:
        raise SymbolUnavailableError(f"Invalid pip size for {symbol_info.name}.")
    return abs(price_diff) / size


def pips_to_price_diff(symbol_info: SymbolInfo, pips: float) -> float:
    """Convert a pip distance into a raw price difference."""
    return pips * pip_size(symbol_info)


def normalize_price(symbol_info: SymbolInfo, price: float) -> float:
    """Round a price to the symbol's actual digit precision. Sending MT5
    an order with too many decimal places is a common cause of rejected
    orders ("Invalid price")."""
    return round(price, symbol_info.digits)


def normalize_volume(symbol_info: SymbolInfo, volume: float) -> float:
    """
    Round a lot size down to the broker's volume_step and clamp to
    [volume_min, volume_max]. Rounds DOWN (not to nearest) so we never
    silently send a larger position than was calculated/risk-approved.
    """
    import math
    step = symbol_info.volume_step
    if step <= 0:
        raise SymbolUnavailableError(f"Invalid volume_step for {symbol_info.name}.")

    normalized = math.floor(volume / step) * step
    normalized = round(normalized, 2)
    normalized = max(symbol_info.volume_min, min(symbol_info.volume_max, normalized))
    return normalized


def is_symbol_tradeable(symbol: str) -> tuple[bool, str]:
    """
    Returns (tradeable, reason). Checks the symbol exists, is visible,
    and MT5 reports its trade mode as allowing trading — distinct from
    "market session is open", which is a time-based check handled
    separately by market_hours (a later increment).
    """
    info = mt5.symbol_info(symbol)
    if info is None:
        return False, f"Symbol '{symbol}' not found on this broker."

    if info.trade_mode == mt5.SYMBOL_TRADE_MODE_DISABLED:
        return False, f"Symbol '{symbol}' trading is disabled by the broker."

    if info.trade_mode == mt5.SYMBOL_TRADE_MODE_CLOSEONLY:
        return False, f"Symbol '{symbol}' is close-only — new positions cannot be opened."

    return True, "OK"


def get_validated_symbol_info(symbol: str) -> SymbolInfo:
    """
    Convenience wrapper: resolves symbol info via the connector AND
    confirms it's currently tradeable. Raises SymbolUnavailableError
    with a clear reason if not — callers (signal generator, execution)
    should not have to separately remember to call is_symbol_tradeable.
    """
    tradeable, reason = is_symbol_tradeable(symbol)
    if not tradeable:
        raise SymbolUnavailableError(reason)
    return connector.get_symbol_info(symbol)

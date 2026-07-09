"""
sl_tp_calculator.py
=====================
Computes concrete stop-loss and take-profit prices from ATR and the
multipliers already defined in config.py (SL_ATR_MULTIPLIER,
TP1_ATR_MULTIPLIER). This is the missing link between the strategy
layer (which only decides direction + confidence) and execution (which
needs actual price levels to build an OrderRequest/TradeIntent).

Pure function — no MT5 calls, no state. Takes the current price and a
pre-computed ATR value (from strategy.indicators.atr) as inputs so it's
independently unit-testable with synthetic numbers.
"""

from __future__ import annotations

from dataclasses import dataclass

from strategy.signal_generator import SignalDirection


class SlTpCalculationError(Exception):
    pass


@dataclass(frozen=True)
class SlTpLevels:
    stop_loss_price: float
    take_profit_price: float
    sl_distance_price: float
    tp_distance_price: float
    risk_reward_ratio: float


def calculate_sl_tp(
    direction: SignalDirection,
    entry_price: float,
    atr_value: float,
    sl_atr_multiplier: float,
    tp_atr_multiplier: float,
    price_digits: int = 5,
) -> SlTpLevels:
    """
    direction must be BUY or SELL (HOLD has no meaningful SL/TP — callers
    must not call this for a HOLD signal, and this function rejects it
    explicitly rather than returning meaningless numbers).
    """
    if direction == SignalDirection.HOLD:
        raise SlTpCalculationError("Cannot calculate SL/TP for a HOLD signal — there is no trade to protect.")

    if entry_price <= 0:
        raise SlTpCalculationError(f"entry_price must be positive, got {entry_price}.")
    if atr_value <= 0:
        raise SlTpCalculationError(f"atr_value must be positive, got {atr_value}.")
    if sl_atr_multiplier <= 0 or tp_atr_multiplier <= 0:
        raise SlTpCalculationError(
            f"ATR multipliers must be positive (sl={sl_atr_multiplier}, tp={tp_atr_multiplier})."
        )

    sl_distance = atr_value * sl_atr_multiplier
    tp_distance = atr_value * tp_atr_multiplier

    if direction == SignalDirection.BUY:
        stop_loss = entry_price - sl_distance
        take_profit = entry_price + tp_distance
    else:  # SELL
        stop_loss = entry_price + sl_distance
        take_profit = entry_price - tp_distance

    stop_loss = round(stop_loss, price_digits)
    take_profit = round(take_profit, price_digits)

    rr_ratio = tp_distance / sl_distance if sl_distance > 0 else 0.0

    return SlTpLevels(
        stop_loss_price=stop_loss,
        take_profit_price=take_profit,
        sl_distance_price=round(sl_distance, price_digits),
        tp_distance_price=round(tp_distance, price_digits),
        risk_reward_ratio=round(rr_ratio, 3),
    )

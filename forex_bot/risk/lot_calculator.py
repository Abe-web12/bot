"""
lot_calculator.py
==================
Computes position size from account risk percentage, stop-loss distance,
and the broker's actual lot constraints (min/max/step). Never returns a
lot size the broker would reject, and never silently rounds risk UP.
"""

from __future__ import annotations

import logging
import math

import config
from bot.mt5_connector import SymbolInfo, connector
from core.state_manager import state

logger = logging.getLogger("lot_calculator")


class LotCalculationError(Exception):
    pass


def calculate_lot_size(
    symbol: str,
    stop_loss_pips: float,
    risk_percent: float | None = None,
) -> float:
    """
    Returns a broker-valid lot size such that, if SL is hit, the loss is
    approximately risk_percent of current account balance (never more —
    we round DOWN to the nearest valid lot step).

    Raises LotCalculationError if the computed size is below the broker's
    minimum (i.e. the risk_percent is too small for this account size /
    SL distance combination) — we refuse to silently risk more than asked.
    """
    if stop_loss_pips <= 0:
        raise LotCalculationError(f"stop_loss_pips must be positive, got {stop_loss_pips}")

    risk_percent = risk_percent if risk_percent is not None else config.RISK_PER_TRADE_PCT
    if risk_percent <= 0 or risk_percent > 10:
        raise LotCalculationError(
            f"risk_percent={risk_percent} is outside sane bounds (0, 10]. Refusing to calculate."
        )

    account = state.account
    if account.balance <= 0:
        raise LotCalculationError("Account balance is 0 or unknown — refusing to size a position.")

    symbol_info: SymbolInfo = connector.get_symbol_info(symbol)

    risk_amount = account.balance * (risk_percent / 100.0)

    # pip value per 1.0 lot = contract_size * point * (10 if 5-digit else 1)
    pip_multiplier = 10 if symbol_info.digits in (3, 5) else 1
    pip_value_per_lot = symbol_info.trade_contract_size * symbol_info.point * pip_multiplier

    if pip_value_per_lot <= 0:
        raise LotCalculationError(f"Computed pip_value_per_lot={pip_value_per_lot} is invalid for {symbol}.")

    raw_lot = risk_amount / (stop_loss_pips * pip_value_per_lot)

    # Round DOWN to the nearest valid step — never risk more than asked.
    step = symbol_info.volume_step
    lot = math.floor(raw_lot / step) * step
    lot = round(lot, 2)

    if lot < symbol_info.volume_min:
        raise LotCalculationError(
            f"Calculated lot {lot} is below broker minimum {symbol_info.volume_min} for {symbol}. "
            f"risk_percent={risk_percent}% with SL={stop_loss_pips} pips on balance "
            f"{account.balance} is too small a risk for this account/SL combination. "
            f"Either increase risk_percent, use a tighter SL, or skip this trade."
        )

    if lot > symbol_info.volume_max:
        logger.warning(
            "Calculated lot %s exceeds broker maximum %s for %s — capping at maximum.",
            lot, symbol_info.volume_max, symbol,
        )
        lot = symbol_info.volume_max

    logger.info(
        "Lot size for %s: risk=%.2f%% (%.2f %s) / SL=%.1f pips -> %.2f lots",
        symbol, risk_percent, risk_amount, account.currency, stop_loss_pips, lot,
    )
    return lot

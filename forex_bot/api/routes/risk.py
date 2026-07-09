"""
risk.py (routes)
===================
  GET /api/risk/current — full real-time risk snapshot
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from flask import Blueprint, jsonify

import config
from api.auth import require_role
from api.rate_limit import rate_limited
from core.state_manager import state
from execution.position_manager import PositionManagerError, position_manager
from market.data_feed import DataFeedError, get_current_spread_pips
from risk.drawdown_guard import drawdown_guard

logger = logging.getLogger("api.routes.risk")

risk_bp = Blueprint("risk", __name__, url_prefix="/api/risk")


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


@risk_bp.get("/current")
@require_role("admin", "viewer")
@rate_limited()
def current_risk():
    account = state.account

    spread_status = {}
    for symbol in config.SYMBOLS:
        try:
            current = get_current_spread_pips(symbol)
            spread_status[symbol] = {
                "current_pips": current,
                "max_allowed_pips": config.MAX_SPREAD_PIPS,
                "within_limit": current <= config.MAX_SPREAD_PIPS,
            }
        except DataFeedError as exc:
            spread_status[symbol] = {"error": str(exc)}

    try:
        open_positions = position_manager.get_open_positions()
        open_count = len(open_positions)
    except PositionManagerError:
        open_count = state.open_position_count

    margin_usage_pct = None
    if account.equity > 0:
        margin_usage_pct = round((account.margin / account.equity) * 100, 2)

    can_open, reason = drawdown_guard.can_open_new_trade()

    return jsonify({
        "timestamp": _ts(),
        "daily_loss_pct": drawdown_guard.daily_loss_pct(),
        "daily_loss_limit_pct": config.DAILY_LOSS_LIMIT_PCT,
        "drawdown_pct": drawdown_guard.current_drawdown_pct(),
        "max_drawdown_pct": config.MAX_DRAWDOWN_PCT,
        "peak_equity": drawdown_guard.peak_equity,
        "risk_per_trade_pct": config.RISK_PER_TRADE_PCT,
        "margin_usage_pct": margin_usage_pct,
        "max_open_trades": config.MAX_OPEN_TRADES,
        "current_open_trades": open_count,
        "max_slippage_pips": config.MAX_SLIPPAGE_PIPS,
        "spread_status": spread_status,
        "duplicate_protection": {
            "tracked_symbol_magic_pairs": len(position_manager._locks),
            "note": "Count of (symbol, magic_number) pairs with a lock ever acquired this "
                    "session — not a live lock-held state, which is intentionally not exposed "
                    "since it could be stale by the time it's read over HTTP.",
        },
        "risk_gate": {"can_open_new_trade": can_open, "reason": reason},
    })

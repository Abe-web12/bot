"""
dashboard.py
=============
REST API for the dashboard frontend. Every endpoint reads real data
from state_manager, the execution engine, or the database via
repositories — nothing here returns synthetic/example data.

Authentication: every endpoint requires a valid JWT access token
(api.auth.require_role). Read endpoints accept role admin or viewer;
settings/logs/notification-test/manual-close require admin.

Endpoints:
  GET  /api/status         — bot + connection status
  GET  /api/account        — live MT5 account snapshot
  GET  /api/positions      — open positions (from position_manager, live MT5 read)
  GET  /api/orders         — persistent queue status
  GET  /api/signals        — recent journal entries of type SIGNAL_*
  GET  /api/trades         — closed trades, paginated/sortable
  GET  /api/trades/export.csv  — CSV export of closed trades
  GET  /api/trades/export.xlsx — Excel export of closed trades
  POST /api/trades/<ticket>/close — manual close of an open position (admin)
  GET  /api/journal        — full journal, optional entry_type/symbol filter
  GET  /api/analytics      — win rate, profit factor, expectancy, Sharpe, PnL, equity curve
  GET  /api/settings       — current hot-reloadable config (admin)
  POST /api/settings       — apply hot-reload changes (admin)
  GET  /api/logs           — tail of the JSON log file (admin)
  GET  /api/notifications  — recent bot_events of Telegram-relevant types
  POST /api/notifications/test — send a real test Telegram message (admin)
"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

import config
from api.auth import require_role
from api.cache import cached
from api.query_utils import QueryParamError, export_csv, export_xlsx, parse_pagination, parse_sort, sort_dicts
from api.rate_limit import rate_limited

logger = logging.getLogger("api.dashboard")

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api")


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# /api/status
# ---------------------------------------------------------------------------

@dashboard_bp.get("/status")
@require_role("admin", "viewer")
@rate_limited()
def bot_status():
    from core.state_manager import state
    return jsonify({
        "timestamp": _ts(),
        "bot_status": state.bot_status.value,
        "connection_status": state.connection_status.value,
        "is_demo_account": state.is_demo_account,
        "last_error": state.last_error,
    })


# ---------------------------------------------------------------------------
# /api/account
# ---------------------------------------------------------------------------

@dashboard_bp.get("/account")
@require_role("admin", "viewer")
@rate_limited()
def account_info():
    from core.state_manager import state
    from risk.drawdown_guard import drawdown_guard

    account = state.account
    return jsonify({
        "timestamp": _ts(),
        "balance": account.balance,
        "equity": account.equity,
        "margin": account.margin,
        "free_margin": account.free_margin,
        "margin_level": account.margin_level,
        "currency": account.currency,
        "updated_at": account.updated_at.isoformat() if account.updated_at else None,
        "drawdown_pct": drawdown_guard.current_drawdown_pct(),
        "daily_loss_pct": drawdown_guard.daily_loss_pct(),
        "open_positions": state.open_position_count,
    })


# ---------------------------------------------------------------------------
# /api/positions — live read from MT5 via position_manager
# ---------------------------------------------------------------------------

@dashboard_bp.get("/positions")
@require_role("admin", "viewer")
@rate_limited()
def open_positions():
    try:
        from execution.position_manager import position_manager
        positions = position_manager.get_open_positions()
        return jsonify({
            "timestamp": _ts(),
            "count": len(positions),
            "positions": [
                {
                    "ticket": p.ticket, "symbol": p.symbol, "side": p.side,
                    "volume": p.volume, "open_price": p.open_price,
                    "current_price": p.current_price, "stop_loss": p.stop_loss,
                    "take_profit": p.take_profit, "profit": p.profit,
                    "swap": p.swap, "magic_number": p.magic_number,
                    "open_time": p.open_time.isoformat(), "comment": p.comment,
                }
                for p in positions
            ],
        })
    except Exception as exc:
        logger.error("Failed to fetch open positions: %s", exc)
        return jsonify({"error": str(exc), "positions": []}), 503


# ---------------------------------------------------------------------------
# /api/orders — persistent queue status
# ---------------------------------------------------------------------------

@dashboard_bp.get("/orders")
@require_role("admin", "viewer")
@rate_limited()
def order_queue_status():
    from database.connection import unit_of_work
    from database.repositories import TradeIntentRepository

    try:
        with unit_of_work() as session:
            repo = TradeIntentRepository(session)
            counts = repo.count_by_status()
            pending = repo.get_pending()
            pending_summary = [
                {
                    "execution_id": p.execution_id, "symbol": p.symbol, "side": p.side,
                    "confidence": p.confidence, "queued_at": p.queued_at.isoformat() if p.queued_at else None,
                }
                for p in pending
            ]
        return jsonify({"timestamp": _ts(), "counts": counts, "pending": pending_summary})
    except Exception as exc:
        logger.error("Failed to fetch order queue status: %s", exc)
        return jsonify({"error": str(exc)}), 503


# ---------------------------------------------------------------------------
# /api/signals — journal entries of signal-related types
# ---------------------------------------------------------------------------

@dashboard_bp.get("/signals")
@require_role("admin", "viewer")
@rate_limited()
def recent_signals():
    limit = min(int(request.args.get("limit", 50)), 500)
    symbol = request.args.get("symbol")

    from database.connection import unit_of_work
    from database.repositories import JournalRepository

    try:
        with unit_of_work() as session:
            repo = JournalRepository(session)
            generated = repo.get_recent(limit=limit, entry_type="SIGNAL_GENERATED", symbol=symbol)
            rejected = repo.get_recent(limit=limit, entry_type="SIGNAL_REJECTED", symbol=symbol)

        def _serialize(entries):
            return [
                {
                    "id": e.id, "entry_type": e.entry_type, "symbol": e.symbol,
                    "side": e.side, "confidence": e.confidence, "reason": e.reason,
                    "occurred_at": e.occurred_at.isoformat(),
                }
                for e in entries
            ]

        combined = sorted(
            _serialize(generated) + _serialize(rejected),
            key=lambda x: x["occurred_at"], reverse=True,
        )[:limit]

        return jsonify({"timestamp": _ts(), "count": len(combined), "signals": combined})
    except Exception as exc:
        logger.error("Failed to fetch signals: %s", exc)
        return jsonify({"error": str(exc)}), 503


# ---------------------------------------------------------------------------
# /api/trades — closed trades
# ---------------------------------------------------------------------------

_TRADE_SORTABLE_FIELDS = {"open_time", "close_time", "profit", "symbol", "volume"}
_TRADE_EXPORT_FIELDS = [
    "id", "mt5_ticket", "symbol", "side", "open_price", "close_price",
    "volume", "stop_loss", "take_profit", "profit", "open_time", "close_time", "close_reason",
]


def _serialize_trade(t) -> dict:
    return {
        "id": t.id, "mt5_ticket": t.mt5_ticket, "symbol": t.symbol, "side": t.side,
        "open_price": t.open_price, "close_price": t.close_price, "volume": t.volume,
        "stop_loss": t.stop_loss, "take_profit": t.take_profit, "profit": t.profit,
        "open_time": t.open_time.isoformat() if t.open_time else None,
        "close_time": t.close_time.isoformat() if t.close_time else None,
        "close_reason": t.close_reason,
    }


def _fetch_filtered_trades(symbol: str | None) -> list[dict]:
    from database.connection import unit_of_work
    from database.repositories import TradeRepository

    with unit_of_work() as session:
        repo = TradeRepository(session)
        trades = repo.get_recent_closed(limit=5000)  # generous cap; paginated/sorted below in Python

    serialized = [_serialize_trade(t) for t in trades]
    if symbol:
        serialized = [t for t in serialized if t["symbol"] == symbol]
    return serialized


@dashboard_bp.get("/trades")
@require_role("admin", "viewer")
@rate_limited()
def closed_trades():
    try:
        page_request = parse_pagination()
        sort_field, sort_desc = parse_sort(_TRADE_SORTABLE_FIELDS, default_field="close_time")
    except QueryParamError as exc:
        return jsonify({"error": str(exc)}), 400

    symbol = request.args.get("symbol")

    from database.connection import unit_of_work
    from database.repositories import TradeRepository

    try:
        trades = _fetch_filtered_trades(symbol)
        trades = sort_dicts(trades, sort_field, sort_desc)

        total = len(trades)
        start = page_request.offset
        page_items = trades[start:start + page_request.page_size]
        total_pages = max(1, (total + page_request.page_size - 1) // page_request.page_size)

        with unit_of_work() as session:
            win_stats = TradeRepository(session).win_rate()

        return jsonify({
            "timestamp": _ts(),
            "win_rate": win_stats,
            "items": page_items,
            "pagination": {
                "page": page_request.page, "page_size": page_request.page_size,
                "total_items": total, "total_pages": total_pages,
            },
        })
    except Exception as exc:
        logger.error("Failed to fetch trades: %s", exc)
        return jsonify({"error": str(exc)}), 503


@dashboard_bp.get("/trades/export.csv")
@require_role("admin", "viewer")
@rate_limited()
def export_trades_csv():
    from flask import Response
    symbol = request.args.get("symbol")
    try:
        trades = _fetch_filtered_trades(symbol)
        csv_bytes = export_csv(trades, _TRADE_EXPORT_FIELDS)
        return Response(
            csv_bytes, mimetype="text/csv",
            headers={"Content-Disposition": "attachment; filename=trades_export.csv"},
        )
    except Exception as exc:
        logger.error("Failed to export trades CSV: %s", exc)
        return jsonify({"error": str(exc)}), 503


@dashboard_bp.get("/trades/export.xlsx")
@require_role("admin", "viewer")
@rate_limited()
def export_trades_xlsx():
    from flask import Response
    symbol = request.args.get("symbol")
    try:
        trades = _fetch_filtered_trades(symbol)
        xlsx_bytes = export_xlsx(trades, _TRADE_EXPORT_FIELDS, sheet_title="Trades")
        return Response(
            xlsx_bytes, mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=trades_export.xlsx"},
        )
    except Exception as exc:
        logger.error("Failed to export trades XLSX: %s", exc)
        return jsonify({"error": str(exc)}), 503


@dashboard_bp.post("/trades/<int:ticket>/close")
@require_role("admin")
@rate_limited()
def manual_close_trade(ticket: int):
    from execution.position_manager import position_manager
    from execution.trade_manager import TradeManagerError, execute_full_close

    position = position_manager.get_position_by_ticket(ticket)
    if position is None:
        return jsonify({"error": f"No open position found for ticket {ticket}."}), 404

    try:
        result = execute_full_close(position)
        logger.info("Manual close via API: ticket=%d", ticket)
        return jsonify({
            "status": "closed", "ticket": ticket,
            "filled_price": result.filled_price, "volume": result.volume,
        })
    except TradeManagerError as exc:
        return jsonify({"error": str(exc)}), 502


# ---------------------------------------------------------------------------
# /api/journal — full journal with filters
# ---------------------------------------------------------------------------

@dashboard_bp.get("/journal")
@require_role("admin", "viewer")
@rate_limited()
def journal():
    limit = min(int(request.args.get("limit", 100)), 1000)
    entry_type = request.args.get("entry_type")
    symbol = request.args.get("symbol")

    from database.connection import unit_of_work
    from database.repositories import JournalRepository

    try:
        with unit_of_work() as session:
            repo = JournalRepository(session)
            entries = repo.get_recent(limit=limit, entry_type=entry_type, symbol=symbol)

        return jsonify({
            "timestamp": _ts(),
            "count": len(entries),
            "entries": [
                {
                    "id": e.id, "entry_type": e.entry_type, "symbol": e.symbol, "side": e.side,
                    "price": e.price, "confidence": e.confidence, "reason": e.reason,
                    "execution_id": e.execution_id, "mt5_ticket": e.mt5_ticket,
                    "payload": json.loads(e.payload_json) if e.payload_json else None,
                    "occurred_at": e.occurred_at.isoformat(),
                }
                for e in entries
            ],
        })
    except Exception as exc:
        logger.error("Failed to fetch journal: %s", exc)
        return jsonify({"error": str(exc)}), 503


# ---------------------------------------------------------------------------
# /api/analytics
# ---------------------------------------------------------------------------

@dashboard_bp.get("/analytics")
@require_role("admin", "viewer")
@rate_limited()
@cached(ttl_seconds=10)
def analytics():
    from database.connection import unit_of_work
    from database.repositories import EquitySnapshotRepository, TradeRepository
    from core.performance_metrics import calculate_sharpe_ratio

    now = datetime.now(timezone.utc)
    try:
        with unit_of_work() as session:
            trade_repo = TradeRepository(session)
            eq_repo = EquitySnapshotRepository(session)

            win_stats = trade_repo.win_rate()
            profit_factor_stats = trade_repo.profit_factor()
            expectancy_stats = trade_repo.expectancy()
            daily_pnl = trade_repo.daily_pnl(now)
            monthly_pnl = trade_repo.monthly_pnl(now.year, now.month)
            snapshots = eq_repo.get_recent(limit=168)

        equity_values = [s.equity for s in reversed(snapshots)]
        sharpe = calculate_sharpe_ratio(equity_values, config.EQUITY_SNAPSHOT_INTERVAL)

        equity_curve = [
            {
                "balance": s.balance, "equity": s.equity, "drawdown_pct": s.drawdown_pct,
                "snapshotted_at": s.snapshotted_at.isoformat(),
            }
            for s in reversed(snapshots)
        ]

        return jsonify({
            "timestamp": _ts(),
            "win_rate": win_stats,
            "profit_factor": profit_factor_stats,
            "expectancy": expectancy_stats,
            "sharpe_ratio": {
                "value": sharpe.sharpe_ratio, "sample_count": sharpe.sample_count,
                "periods_per_year": sharpe.periods_per_year, "note": sharpe.note,
            },
            "daily_pnl": daily_pnl,
            "monthly_pnl": monthly_pnl,
            "equity_curve": equity_curve,
        })
    except Exception as exc:
        logger.error("Failed to compute analytics: %s", exc)
        return jsonify({"error": str(exc)}), 503


# ---------------------------------------------------------------------------
# /api/settings — alias of the config_manager hot-reload interface
# ---------------------------------------------------------------------------

@dashboard_bp.get("/settings")
@require_role("admin")
@rate_limited()
def get_settings():
    from core.config_manager import config_manager
    return jsonify({
        "timestamp": _ts(),
        "overrides": config_manager.current_overrides(),
        "reloadable_keys": config_manager.hot_reloadable_keys(),
        "history": config_manager.change_history(),
    })


@dashboard_bp.post("/settings")
@require_role("admin")
@rate_limited()
def update_settings():
    from core.config_manager import ConfigValidationError, config_manager

    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "Request body must be JSON."}), 400

    try:
        if "changes" in body:
            applied = config_manager.set_many(body["changes"])
            return jsonify({"applied": [{"key": c.key, "old": c.old_value, "new": c.new_value} for c in applied]})
        elif "key" in body and "value" in body:
            change = config_manager.set(body["key"], body["value"])
            return jsonify({"key": change.key, "old_value": change.old_value, "new_value": change.new_value})
        return jsonify({"error": "Provide 'key'+'value' or 'changes' dict."}), 400
    except ConfigValidationError as exc:
        return jsonify({"error": str(exc)}), 422


# ---------------------------------------------------------------------------
# /api/logs — real tail of the JSON log file
# ---------------------------------------------------------------------------

@dashboard_bp.get("/logs")
@require_role("admin")
@rate_limited()
def recent_logs():
    lines_requested = min(int(request.args.get("lines", 100)), 2000)
    level_filter = request.args.get("level", "").upper()

    log_path = os.path.join("logs", "bot.json.log")
    if not os.path.exists(log_path):
        return jsonify({"timestamp": _ts(), "count": 0, "logs": []})

    try:
        with open(log_path, "r", encoding="utf-8", errors="replace") as f:
            all_lines = f.readlines()
        tail = all_lines[-lines_requested:]

        parsed = []
        for line in tail:
            try:
                doc = json.loads(line)
                if level_filter and doc.get("level") != level_filter:
                    continue
                parsed.append(doc)
            except json.JSONDecodeError:
                continue

        return jsonify({"timestamp": _ts(), "count": len(parsed), "logs": parsed})
    except OSError as exc:
        return jsonify({"error": f"Could not read log file: {exc}"}), 500


# ---------------------------------------------------------------------------
# /api/notifications
# ---------------------------------------------------------------------------

_NOTIFICATION_EVENT_TYPES = [
    "BOT_STARTED", "BOT_STOPPED", "TRADE_OPENED", "TRADE_CLOSED",
    "SL_HIT", "TP_HIT", "DAILY_LOSS_LIMIT_HIT", "DRAWDOWN_LIMIT_HIT",
    "MT5_DISCONNECTED", "MT5_CONNECTED", "CRITICAL_ERROR",
]


@dashboard_bp.get("/notifications")
@require_role("admin", "viewer")
@rate_limited()
def recent_notifications():
    limit = min(int(request.args.get("limit", 50)), 500)

    from database.connection import unit_of_work
    from database.repositories import BotEventRepository

    try:
        with unit_of_work() as session:
            repo = BotEventRepository(session)
            all_events = []
            for event_name in _NOTIFICATION_EVENT_TYPES:
                all_events.extend(repo.get_recent(limit=limit, event_name=event_name))

        all_events.sort(key=lambda e: e.occurred_at, reverse=True)
        all_events = all_events[:limit]

        return jsonify({
            "timestamp": _ts(),
            "count": len(all_events),
            "notifications": [
                {
                    "id": e.id, "event_name": e.event_name, "source": e.source,
                    "payload": json.loads(e.payload_json) if e.payload_json else None,
                    "occurred_at": e.occurred_at.isoformat(),
                }
                for e in all_events
            ],
        })
    except Exception as exc:
        logger.error("Failed to fetch notifications: %s", exc)
        return jsonify({"error": str(exc)}), 503


@dashboard_bp.get("/notifications/queue")
@require_role("admin", "viewer")
@rate_limited()
def notification_queue_status():
    from notifications.telegram_service import telegram_service
    return jsonify({
        "timestamp": _ts(),
        "telegram_enabled": telegram_service._enabled,
        "queue_depth": telegram_service._queue.qsize(),
        "note": "Retry logic (exponential backoff, rate-limit respect) happens inside the "
                "sender loop per-message — there is no separate persisted retry queue; a "
                "message either succeeds within its retry attempts or is logged as failed.",
    })


@dashboard_bp.post("/notifications/test")
@require_role("admin")
@rate_limited()
def send_test_notification():
    from notifications.telegram_service import telegram_service

    if not telegram_service._enabled:
        return jsonify({"error": "Telegram is not configured (TELEGRAM_TOKEN/TELEGRAM_CHAT_ID missing)."}), 503

    sent = telegram_service.send_message_sync(
        "🔔 *Test Notification*\nThis is a real test message from the dashboard API\\."
    )
    return jsonify({"sent": sent, "timestamp": _ts()}), 200 if sent else 502

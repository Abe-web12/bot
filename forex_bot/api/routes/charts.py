"""
charts.py (routes)
=====================
Optimized chart-data endpoints for the dashboard. Every series is
computed from real Trade/EquitySnapshot repository data via
services.services — when there isn't enough data yet (e.g. a fresh
demo account with zero closed trades), the honest response is an empty
series, never a fabricated example curve.

  GET /api/charts/equity-curve
  GET /api/charts/balance-curve
  GET /api/charts/drawdown-curve
  GET /api/charts/profit-curve
  GET /api/charts/daily-stats
  GET /api/charts/weekly-stats
  GET /api/charts/monthly-stats
  GET /api/charts/heatmap            - day-of-week x hour-of-day win rate
  GET /api/charts/win-loss-distribution
  GET /api/charts/trade-duration
  GET /api/charts/session-performance - London/NY/overlap/other performance
"""

from __future__ import annotations

import logging
from collections import defaultdict
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

import config
from api.auth import require_role
from api.cache import cached
from api.rate_limit import rate_limited
from services.services import AnalyticsService, TradeService

logger = logging.getLogger("api.routes.charts")

charts_bp = Blueprint("charts", __name__, url_prefix="/api/charts")


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


@charts_bp.get("/equity-curve")
@require_role("admin", "viewer")
@rate_limited()
@cached(ttl_seconds=10)
def equity_curve():
    curve = AnalyticsService().get_equity_curve(limit=int(request.args.get("limit", 168)))
    return jsonify({"timestamp": _ts(), "series": [{"x": p["snapshotted_at"], "y": p["equity"]} for p in curve]})


@charts_bp.get("/balance-curve")
@require_role("admin", "viewer")
@rate_limited()
@cached(ttl_seconds=10)
def balance_curve():
    curve = AnalyticsService().get_equity_curve(limit=int(request.args.get("limit", 168)))
    return jsonify({"timestamp": _ts(), "series": [{"x": p["snapshotted_at"], "y": p["balance"]} for p in curve]})


@charts_bp.get("/drawdown-curve")
@require_role("admin", "viewer")
@rate_limited()
@cached(ttl_seconds=10)
def drawdown_curve():
    curve = AnalyticsService().get_equity_curve(limit=int(request.args.get("limit", 168)))
    return jsonify({
        "timestamp": _ts(),
        "series": [{"x": p["snapshotted_at"], "y": p["drawdown_pct"] or 0.0} for p in curve],
    })


@charts_bp.get("/profit-curve")
@require_role("admin", "viewer")
@rate_limited()
@cached(ttl_seconds=10)
def profit_curve():
    trades = TradeService().get_all_closed_for_charts()
    trades_with_close = [t for t in trades if t.close_time is not None]
    trades_with_close.sort(key=lambda t: t.close_time)

    cumulative = 0.0
    series = []
    for t in trades_with_close:
        cumulative += t.profit or 0.0
        series.append({"x": t.close_time.isoformat(), "y": round(cumulative, 2)})

    return jsonify({"timestamp": _ts(), "series": series})


def _bucket_by_period(trades, period: str) -> dict:
    buckets: dict = defaultdict(float)
    for t in trades:
        if t.close_time is None or t.profit is None:
            continue
        ct = t.close_time
        if period == "day":
            key = ct.strftime("%Y-%m-%d")
        elif period == "week":
            key = f"{ct.isocalendar().year}-W{ct.isocalendar().week:02d}"
        else:
            key = ct.strftime("%Y-%m")
        buckets[key] += t.profit
    return dict(buckets)


@charts_bp.get("/daily-stats")
@require_role("admin", "viewer")
@rate_limited()
@cached(ttl_seconds=15)
def daily_stats():
    trades = TradeService().get_all_closed_for_charts()
    buckets = _bucket_by_period(trades, "day")
    series = sorted(({"x": k, "y": round(v, 2)} for k, v in buckets.items()), key=lambda p: p["x"])
    return jsonify({"timestamp": _ts(), "series": series})


@charts_bp.get("/weekly-stats")
@require_role("admin", "viewer")
@rate_limited()
@cached(ttl_seconds=15)
def weekly_stats():
    trades = TradeService().get_all_closed_for_charts()
    buckets = _bucket_by_period(trades, "week")
    series = sorted(({"x": k, "y": round(v, 2)} for k, v in buckets.items()), key=lambda p: p["x"])
    return jsonify({"timestamp": _ts(), "series": series})


@charts_bp.get("/monthly-stats")
@require_role("admin", "viewer")
@rate_limited()
@cached(ttl_seconds=15)
def monthly_stats():
    trades = TradeService().get_all_closed_for_charts()
    buckets = _bucket_by_period(trades, "month")
    series = sorted(({"x": k, "y": round(v, 2)} for k, v in buckets.items()), key=lambda p: p["x"])
    return jsonify({"timestamp": _ts(), "series": series})


@charts_bp.get("/heatmap")
@require_role("admin", "viewer")
@rate_limited()
@cached(ttl_seconds=30)
def heatmap():
    """
    Day-of-week x hour-of-UTC win rate. Cells with zero trades report
    trade_count=0 and win_rate_pct=null (not 0%) - a cell with no data
    is not the same as a 0% win-rate cell, and conflating them would
    mislead a heatmap's color scale.
    """
    trades = TradeService().get_all_closed_for_charts()
    buckets: dict = defaultdict(list)

    for t in trades:
        if t.close_time is None or t.profit is None:
            continue
        key = (t.close_time.weekday(), t.close_time.hour)
        buckets[key].append(t.profit > 0)

    cells = []
    for day in range(7):
        for hour in range(24):
            outcomes = buckets.get((day, hour), [])
            win_rate = round(sum(outcomes) / len(outcomes) * 100, 1) if outcomes else None
            cells.append({
                "day_of_week": day, "hour_utc": hour,
                "trade_count": len(outcomes), "win_rate_pct": win_rate,
            })

    return jsonify({"timestamp": _ts(), "cells": cells})


@charts_bp.get("/win-loss-distribution")
@require_role("admin", "viewer")
@rate_limited()
@cached(ttl_seconds=15)
def win_loss_distribution():
    trades = TradeService().get_all_closed_for_charts()
    profits = [t.profit for t in trades if t.profit is not None]

    buckets_def = [
        ("< -100", lambda p: p < -100),
        ("-100 to -50", lambda p: -100 <= p < -50),
        ("-50 to 0", lambda p: -50 <= p < 0),
        ("0 to 50", lambda p: 0 <= p < 50),
        ("50 to 100", lambda p: 50 <= p < 100),
        ("> 100", lambda p: p >= 100),
    ]
    histogram = [{"range": label, "count": sum(1 for p in profits if predicate(p))} for label, predicate in buckets_def]

    return jsonify({"timestamp": _ts(), "total_trades": len(profits), "histogram": histogram})


@charts_bp.get("/trade-duration")
@require_role("admin", "viewer")
@rate_limited()
@cached(ttl_seconds=15)
def trade_duration():
    trades = TradeService().get_all_closed_for_charts()
    durations_minutes = []
    for t in trades:
        if t.open_time and t.close_time:
            delta = (t.close_time - t.open_time).total_seconds() / 60.0
            durations_minutes.append(delta)

    buckets_def = [
        ("< 15 min", lambda d: d < 15),
        ("15-60 min", lambda d: 15 <= d < 60),
        ("1-4 hours", lambda d: 60 <= d < 240),
        ("4-24 hours", lambda d: 240 <= d < 1440),
        ("> 1 day", lambda d: d >= 1440),
    ]
    histogram = [
        {"range": label, "count": sum(1 for d in durations_minutes if predicate(d))}
        for label, predicate in buckets_def
    ]
    avg_minutes = round(sum(durations_minutes) / len(durations_minutes), 1) if durations_minutes else None

    return jsonify({
        "timestamp": _ts(), "total_trades": len(durations_minutes),
        "average_duration_minutes": avg_minutes, "histogram": histogram,
    })


@charts_bp.get("/session-performance")
@require_role("admin", "viewer")
@rate_limited()
@cached(ttl_seconds=15)
def session_performance():
    """Buckets closed trades by which trading session they opened
    during, using the same session windows config.py already defines
    for the risk gate - one definition of "London session," not a
    second one invented for charting."""
    def _hour_in_range(hour: int, start_str: str, end_str: str) -> bool:
        start_h = int(start_str.split(":")[0])
        end_h = int(end_str.split(":")[0])
        if start_h <= end_h:
            return start_h <= hour < end_h
        return hour >= start_h or hour < end_h

    trades = TradeService().get_all_closed_for_charts()
    session_buckets: dict = defaultdict(list)

    for t in trades:
        if t.open_time is None or t.profit is None:
            continue
        hour = t.open_time.hour
        london = _hour_in_range(hour, config.LONDON_OPEN, config.LONDON_CLOSE)
        ny = _hour_in_range(hour, config.NY_OPEN, config.NY_CLOSE)

        if london and ny:
            session_name = "London/NY Overlap"
        elif london:
            session_name = "London"
        elif ny:
            session_name = "New York"
        else:
            session_name = "Other"

        session_buckets[session_name].append(t.profit)

    result = []
    for session_name, profits in session_buckets.items():
        wins = sum(1 for p in profits if p > 0)
        result.append({
            "session": session_name, "trade_count": len(profits),
            "total_profit": round(sum(profits), 2),
            "win_rate_pct": round(wins / len(profits) * 100, 1) if profits else 0.0,
        })

    return jsonify({"timestamp": _ts(), "sessions": result})

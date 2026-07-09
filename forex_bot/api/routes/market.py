"""
market.py (routes)
=====================
Real-time market data endpoints. Every value is computed live from MT5
via the existing market/ and strategy/ modules — nothing here is
pre-computed or cached beyond the short TTL cache for candle fetches.

  GET /api/market/price/<symbol>
  GET /api/market/candles/<symbol>?timeframe=H1&count=100
  GET /api/market/spread/<symbol>
  GET /api/market/atr/<symbol>?timeframe=H1&period=14
  GET /api/market/trend/<symbol>?timeframe=H1
  GET /api/market/session
  GET /api/market/liquidity/<symbol>
  GET /api/market/news-status

NEWS STATUS HONESTY NOTE: this codebase has no real news calendar feed
integrated (no ForexFactory/economic-calendar API is wired up anywhere
in the strategy or market layers). Rather than fabricate a fake "no
high-impact news" response, this endpoint honestly reports
configured=false. Building a real news feed integration is a distinct
future piece of work, not something this endpoint should pretend to
already do.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

import config
from api.auth import require_role
from api.cache import cached
from api.rate_limit import rate_limited
from execution.order_validator import validate_trading_session
from market.data_feed import DataFeedError, get_current_spread_pips, get_latest_tick, get_ohlc
from market.symbols import SymbolUnavailableError, get_validated_symbol_info
from strategy.indicators import IndicatorError, atr
from strategy.market_snapshot import MarketSnapshotError, get_snapshot
from strategy.trend_analyzer import TrendAnalysisError, assess_trend

logger = logging.getLogger("api.routes.market")

market_bp = Blueprint("market", __name__, url_prefix="/api/market")


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


def _validate_symbol_or_400(symbol: str):
    if symbol not in config.SYMBOLS:
        return None, (jsonify({"error": f"'{symbol}' is not a configured trading symbol."}), 400)
    return symbol, None


@market_bp.get("/price/<symbol>")
@require_role("admin", "viewer")
@rate_limited()
def live_price(symbol: str):
    symbol, err = _validate_symbol_or_400(symbol)
    if err:
        return err
    try:
        tick = get_latest_tick(symbol)
        return jsonify({
            "timestamp": _ts(), "symbol": symbol,
            "bid": tick["bid"], "ask": tick["ask"],
            "spread_pips": get_current_spread_pips(symbol),
            "tick_time": tick["time"].isoformat(),
        })
    except DataFeedError as exc:
        return jsonify({"error": str(exc)}), 503


@market_bp.get("/candles/<symbol>")
@require_role("admin", "viewer")
@rate_limited()
@cached(ttl_seconds=5)
def candles(symbol: str):
    symbol, err = _validate_symbol_or_400(symbol)
    if err:
        return err

    timeframe = request.args.get("timeframe", config.TIMEFRAME_PRIMARY)
    count = min(int(request.args.get("count", 100)), 1000)

    try:
        df = get_ohlc(symbol, timeframe, count)
    except DataFeedError as exc:
        return jsonify({"error": str(exc)}), 503

    return jsonify({
        "timestamp": _ts(), "symbol": symbol, "timeframe": timeframe, "count": len(df),
        "candles": [
            {
                "time": row["time"].isoformat(), "open": row["open"], "high": row["high"],
                "low": row["low"], "close": row["close"], "volume": row["tick_volume"],
            }
            for _, row in df.iterrows()
        ],
    })


@market_bp.get("/spread/<symbol>")
@require_role("admin", "viewer")
@rate_limited()
def spread(symbol: str):
    symbol, err = _validate_symbol_or_400(symbol)
    if err:
        return err
    try:
        current = get_current_spread_pips(symbol)
        return jsonify({
            "timestamp": _ts(), "symbol": symbol, "current_spread_pips": current,
            "max_allowed_pips": config.MAX_SPREAD_PIPS,
            "within_limit": current <= config.MAX_SPREAD_PIPS,
        })
    except DataFeedError as exc:
        return jsonify({"error": str(exc)}), 503


@market_bp.get("/atr/<symbol>")
@require_role("admin", "viewer")
@rate_limited()
@cached(ttl_seconds=5)
def atr_value(symbol: str):
    symbol, err = _validate_symbol_or_400(symbol)
    if err:
        return err

    timeframe = request.args.get("timeframe", config.TIMEFRAME_PRIMARY)
    period = int(request.args.get("period", config.ATR_PERIOD))

    try:
        snapshot = get_snapshot(symbol, timeframe, count=period + 50)
        series = atr(snapshot.high, snapshot.low, snapshot.close, period=period)
        return jsonify({
            "timestamp": _ts(), "symbol": symbol, "timeframe": timeframe, "period": period,
            "atr": round(float(series.iloc[-1]), 6),
        })
    except (MarketSnapshotError, IndicatorError) as exc:
        return jsonify({"error": str(exc)}), 503


@market_bp.get("/trend/<symbol>")
@require_role("admin", "viewer")
@rate_limited()
@cached(ttl_seconds=5)
def trend(symbol: str):
    symbol, err = _validate_symbol_or_400(symbol)
    if err:
        return err

    timeframe = request.args.get("timeframe", config.TIMEFRAME_PRIMARY)

    try:
        snapshot = get_snapshot(symbol, timeframe, count=150)
        assessment = assess_trend(snapshot.close, snapshot.high, snapshot.low)
        return jsonify({
            "timestamp": _ts(), "symbol": symbol, "timeframe": timeframe,
            "direction": assessment.direction.value, "is_trending": assessment.is_trending,
            "adx": assessment.adx_value, "ema_fast": assessment.ema_fast_value,
            "ema_slow": assessment.ema_slow_value,
        })
    except (MarketSnapshotError, TrendAnalysisError) as exc:
        return jsonify({"error": str(exc)}), 503


@market_bp.get("/session")
@require_role("admin", "viewer")
@rate_limited()
def session():
    now = datetime.now(timezone.utc)
    london = validate_trading_session(now, config.LONDON_OPEN, config.LONDON_CLOSE)
    ny = validate_trading_session(now, config.NY_OPEN, config.NY_CLOSE)

    return jsonify({
        "timestamp": _ts(),
        "server_time_utc": now.isoformat(),
        "london_open": london.is_valid,
        "ny_open": ny.is_valid,
        "overlap": london.is_valid and ny.is_valid,
        "trade_best_hours_only": config.TRADE_BEST_HOURS_ONLY,
    })


@market_bp.get("/liquidity/<symbol>")
@require_role("admin", "viewer")
@rate_limited()
@cached(ttl_seconds=5)
def liquidity(symbol: str):
    """
    Approximates relative liquidity from tick_volume (MT5's proxy for
    trading activity, NOT true exchange volume — forex has no
    centralized volume figure). Compares the current bar's tick_volume
    to its own trailing average; this is directionally useful (low
    ratio = quieter than usual, e.g. pre-London) but is explicitly
    labeled as an approximation, not a claim of true market depth.
    """
    symbol, err = _validate_symbol_or_400(symbol)
    if err:
        return err

    timeframe = request.args.get("timeframe", config.TIMEFRAME_PRIMARY)

    try:
        snapshot = get_snapshot(symbol, timeframe, count=60)
    except MarketSnapshotError as exc:
        return jsonify({"error": str(exc)}), 503

    volumes = snapshot.volume
    if len(volumes) < 10:
        return jsonify({"error": "Insufficient history to compute liquidity approximation."}), 503

    current = float(volumes.iloc[-1])
    average = float(volumes.iloc[:-1].mean())
    ratio = round(current / average, 3) if average > 0 else None

    return jsonify({
        "timestamp": _ts(), "symbol": symbol, "timeframe": timeframe,
        "tick_volume_current": current, "tick_volume_average": round(average, 2),
        "tick_volume_ratio": ratio,
        "note": "Approximated from MT5 tick_volume (price-change count), not true exchange volume.",
    })


@market_bp.get("/news-status")
@require_role("admin", "viewer")
@rate_limited()
def news_status():
    from market.news_filter import news_filter
    configured = news_filter.is_configured
    return jsonify({
        "timestamp": _ts(),
        "configured": configured,
        "filter_enabled": config.FILTER_NEWS,
        "high_impact_only": config.HIGH_IMPACT_ONLY,
        "pause_minutes_before": config.NEWS_PAUSE_MINUTES,
        "resume_minutes_after": config.NEWS_RESUME_MINUTES,
        "cached_event_count": news_filter.cached_event_count,
        "last_fetch_error": news_filter.last_fetch_error or None,
        "message": (
            "News filter active — fetching from ForexFactory calendar."
            if configured else
            "News filter disabled (FILTER_NEWS=False in config)."
        ),
    })

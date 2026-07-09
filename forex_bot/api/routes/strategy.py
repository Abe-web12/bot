"""
strategy.py (routes)
=======================
Read-only strategy inspection. IMPORTANT: /signal/<symbol> runs the same
signal_generator + signal_scorer pipeline signal_orchestrator.py uses,
but stops there — it never calls sl_tp_calculator or
PersistentQueueManager.submit(). Viewing the current signal from the
dashboard must never itself place a trade; only the scheduled
orchestrator loop and TradingView webhook (both going through the exact
persistent-queue path) can do that.

  GET /api/strategy/signal/<symbol>       — live read-only evaluation
  GET /api/strategy/history               — recent journal SIGNAL_* entries
  GET /api/strategy/indicators/<symbol>   — EMA/RSI/MACD/ATR/BB/S&R/swing values
  GET /api/strategy/score/<symbol>        — full weighted score breakdown + Gemini
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from flask import Blueprint, jsonify, request

import config
from ai.gemini_client import analyze as gemini_analyze, is_enabled as gemini_enabled
from api.auth import require_role
from api.cache import cached
from api.query_utils import QueryParamError, parse_pagination
from api.rate_limit import rate_limited
from strategy.indicators import IndicatorError, atr, bollinger_bands, ema, macd, rsi
from strategy.market_snapshot import MarketSnapshotError, get_snapshot
from strategy.multi_timeframe import MultiTimeframeError, assess_alignment
from strategy.signal_generator import SignalGeneratorError, generate_signal
from strategy.signal_scorer import score_signal
from strategy.support_resistance import SupportResistanceError, find_levels
from strategy.trend_analyzer import TrendAnalysisError, analyze_market_structure, assess_trend

logger = logging.getLogger("api.routes.strategy")

strategy_bp = Blueprint("strategy", __name__, url_prefix="/api/strategy")


def _ts() -> str:
    return datetime.now(timezone.utc).isoformat()


def _validate_symbol_or_400(symbol: str):
    if symbol not in config.SYMBOLS:
        return None, (jsonify({"error": f"'{symbol}' is not a configured trading symbol."}), 400)
    return symbol, None


@strategy_bp.get("/signal/<symbol>")
@require_role("admin", "viewer")
@rate_limited()
@cached(ttl_seconds=5)
def current_signal(symbol: str):
    symbol, err = _validate_symbol_or_400(symbol)
    if err:
        return err

    try:
        snapshot = get_snapshot(symbol, config.TIMEFRAME_PRIMARY, count=150)
        signal = generate_signal(
            snapshot.ohlc, symbol, config.TIMEFRAME_PRIMARY,
            rsi_period=config.RSI_PERIOD, rsi_oversold=config.RSI_OVERSOLD,
            rsi_overbought=config.RSI_OVERBOUGHT, macd_fast=config.MACD_FAST,
            macd_slow=config.MACD_SLOW, macd_signal=config.MACD_SIGNAL,
            ema_fast_period=config.EMA_FAST, ema_slow_period=config.EMA_SLOW,
        )
    except (MarketSnapshotError, SignalGeneratorError) as exc:
        return jsonify({"error": str(exc)}), 503

    return jsonify({
        "timestamp": _ts(), "symbol": symbol, "direction": signal.direction.value,
        "evidence": {
            "rsi_value": signal.evidence.rsi_value,
            "rsi_is_oversold": signal.evidence.rsi_is_oversold,
            "rsi_is_overbought": signal.evidence.rsi_is_overbought,
            "macd_histogram": signal.evidence.macd_histogram,
            "macd_bullish_crossover": signal.evidence.macd_bullish_crossover,
            "macd_bearish_crossover": signal.evidence.macd_bearish_crossover,
            "ema_fast_above_slow": signal.evidence.ema_fast_above_slow,
            "candle_patterns": [
                {"name": p.name, "bias": p.bias.value, "strength": p.strength}
                for p in signal.evidence.candle_patterns
            ],
        },
        "note": "Read-only evaluation. Does not submit a trade — only the scheduled "
                "orchestrator loop and verified TradingView webhooks can do that.",
    })


@strategy_bp.get("/score/<symbol>")
@require_role("admin", "viewer")
@rate_limited()
def signal_score(symbol: str):
    symbol, err = _validate_symbol_or_400(symbol)
    if err:
        return err

    try:
        snapshot = get_snapshot(symbol, config.TIMEFRAME_PRIMARY, count=150)
        signal = generate_signal(
            snapshot.ohlc, symbol, config.TIMEFRAME_PRIMARY,
            rsi_period=config.RSI_PERIOD, rsi_oversold=config.RSI_OVERSOLD,
            rsi_overbought=config.RSI_OVERBOUGHT, macd_fast=config.MACD_FAST,
            macd_slow=config.MACD_SLOW, macd_signal=config.MACD_SIGNAL,
            ema_fast_period=config.EMA_FAST, ema_slow_period=config.EMA_SLOW,
        )
    except (MarketSnapshotError, SignalGeneratorError) as exc:
        return jsonify({"error": str(exc)}), 503

    trend = None
    try:
        trend = assess_trend(snapshot.close, snapshot.high, snapshot.low)
    except TrendAnalysisError:
        pass

    alignment = None
    try:
        alignment = assess_alignment(symbol, [config.TIMEFRAME_CONFIRM, config.TIMEFRAME_PRIMARY])
    except MultiTimeframeError:
        pass

    score = score_signal(
        signal, snapshot.high, snapshot.low, snapshot.close,
        trend=trend, multi_timeframe_alignment=alignment, atr_period=config.ATR_PERIOD,
    )

    gemini_result = None
    if gemini_enabled():
        advisory = gemini_analyze(
            symbol=symbol, timeframe=config.TIMEFRAME_PRIMARY,
            direction=signal.direction.value, our_confidence=score.confidence,
            market_context={"rsi": signal.evidence.rsi_value},
        )
        gemini_result = {
            "available": advisory.advisory_available,
            "confidence_score": advisory.confidence_score,
            "reasoning": advisory.reasoning,
            "suggested_action": advisory.suggested_action,
        }

    return jsonify({
        "timestamp": _ts(), "symbol": symbol, "direction": signal.direction.value,
        "our_confidence": score.confidence,
        "breakdown": {
            "indicator_confluence_score": score.breakdown.indicator_confluence_score,
            "trend_alignment_score": score.breakdown.trend_alignment_score,
            "volatility_suitability_score": score.breakdown.volatility_suitability_score,
            "multi_timeframe_score": score.breakdown.multi_timeframe_score,
        },
        "reasons": score.reasons,
        "gemini": gemini_result,
        "min_signal_score_threshold": config.MIN_SIGNAL_SCORE,
        "would_queue": score.confidence >= config.MIN_SIGNAL_SCORE,
    })


@strategy_bp.get("/indicators/<symbol>")
@require_role("admin", "viewer")
@rate_limited()
@cached(ttl_seconds=5)
def indicators(symbol: str):
    symbol, err = _validate_symbol_or_400(symbol)
    if err:
        return err

    timeframe = request.args.get("timeframe", config.TIMEFRAME_PRIMARY)

    try:
        snapshot = get_snapshot(symbol, timeframe, count=150)
    except MarketSnapshotError as exc:
        return jsonify({"error": str(exc)}), 503

    close, high, low = snapshot.close, snapshot.high, snapshot.low
    result: dict = {"timestamp": _ts(), "symbol": symbol, "timeframe": timeframe}

    try:
        result["ema_fast"] = round(float(ema(close, config.EMA_FAST).iloc[-1]), 6)
        result["ema_slow"] = round(float(ema(close, config.EMA_SLOW).iloc[-1]), 6)
    except IndicatorError:
        result["ema_fast"] = result["ema_slow"] = None

    try:
        result["rsi"] = round(float(rsi(close, config.RSI_PERIOD).iloc[-1]), 2)
    except IndicatorError:
        result["rsi"] = None

    try:
        macd_result = macd(close, config.MACD_FAST, config.MACD_SLOW, config.MACD_SIGNAL)
        result["macd"] = {
            "macd_line": round(float(macd_result.macd_line.iloc[-1]), 6),
            "signal_line": round(float(macd_result.signal_line.iloc[-1]), 6),
            "histogram": round(float(macd_result.histogram.iloc[-1]), 6),
        }
    except IndicatorError:
        result["macd"] = None

    try:
        result["atr"] = round(float(atr(high, low, close, config.ATR_PERIOD).iloc[-1]), 6)
    except IndicatorError:
        result["atr"] = None

    try:
        bb = bollinger_bands(close, config.BB_PERIOD, config.BB_STD)
        result["bollinger_bands"] = {
            "upper": round(float(bb.upper.iloc[-1]), 6),
            "middle": round(float(bb.middle.iloc[-1]), 6),
            "lower": round(float(bb.lower.iloc[-1]), 6),
        }
    except IndicatorError:
        result["bollinger_bands"] = None

    try:
        levels = find_levels(high, low)
        result["support_resistance"] = [
            {"price": lvl.price, "is_resistance": lvl.is_resistance, "touch_count": lvl.touch_count}
            for lvl in levels[-10:]
        ]
    except SupportResistanceError:
        result["support_resistance"] = []

    try:
        structure = analyze_market_structure(high, low)
        result["market_structure"] = structure.structure_type.value
    except TrendAnalysisError:
        result["market_structure"] = None

    return jsonify(result)


@strategy_bp.get("/history")
@require_role("admin", "viewer")
@rate_limited()
def history():
    try:
        page_request = parse_pagination()
    except QueryParamError as exc:
        return jsonify({"error": str(exc)}), 400

    symbol = request.args.get("symbol")

    from database.connection import unit_of_work
    from database.repositories import JournalRepository

    try:
        with unit_of_work() as session:
            repo = JournalRepository(session)
            generated = repo.get_recent(limit=1000, entry_type="SIGNAL_GENERATED", symbol=symbol)
            rejected = repo.get_recent(limit=1000, entry_type="SIGNAL_REJECTED", symbol=symbol)
    except Exception as exc:
        return jsonify({"error": str(exc)}), 503

    combined = sorted(
        [
            {
                "id": e.id, "entry_type": e.entry_type, "symbol": e.symbol,
                "side": e.side, "confidence": e.confidence, "reason": e.reason,
                "occurred_at": e.occurred_at.isoformat(),
            }
            for e in list(generated) + list(rejected)
        ],
        key=lambda x: x["occurred_at"], reverse=True,
    )

    total = len(combined)
    start = page_request.offset
    end = start + page_request.page_size
    page_items = combined[start:end]
    total_pages = max(1, (total + page_request.page_size - 1) // page_request.page_size)

    return jsonify({
        "timestamp": _ts(),
        "items": page_items,
        "pagination": {
            "page": page_request.page, "page_size": page_request.page_size,
            "total_items": total, "total_pages": total_pages,
        },
    })

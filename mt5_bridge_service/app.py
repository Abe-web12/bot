"""
mt5_bridge_service/app.py
==========================
Windows MT5 Bridge Service — runs on the Windows machine where
MetaTrader 5 terminal is installed. Exposes a REST API that the
Linux-based ForexBot backend calls to execute MT5 operations.

Usage:
    python app.py --port 5002

All endpoints return JSON. Errors return {"error": "description"}.
"""

from __future__ import annotations

import argparse
import logging
import os
from datetime import datetime, timezone

import MetaTrader5 as mt5
from flask import Flask, jsonify, request

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("mt5_bridge")

app = Flask(__name__)

# Track connection state
_initialized = False

# ---------------------------------------------------------------------------
# Helper: check initialization
# ---------------------------------------------------------------------------

def _require_init() -> bool:
    if not _initialized:
        return False
    return True


def _mt5_result(retcode: int, order: int = 0, volume: float = 0.0, price: float = 0.0, comment: str = "") -> dict:
    return {
        "retcode": retcode,
        "order": order,
        "volume": volume,
        "price": price,
        "comment": comment,
    }


def _account_info_to_dict(info) -> dict:
    if info is None:
        return {"error": "account_info returned None"}
    return {
        "login": info.login,
        "balance": info.balance,
        "equity": info.equity,
        "margin": info.margin,
        "margin_free": info.margin_free,
        "margin_level": info.margin_level or 0.0,
        "currency": info.currency,
        "trade_mode": info.trade_mode,
        "server": info.server,
        "name": info.name,
        "leverage": info.leverage,
    }


def _symbol_info_to_dict(info) -> dict:
    if info is None:
        return {"error": "symbol_info returned None"}
    return {
        "name": info.name,
        "visible": bool(info.visible),
        "point": float(info.point),
        "digits": info.digits,
        "volume_min": info.volume_min,
        "volume_max": info.volume_max,
        "volume_step": info.volume_step,
        "trade_contract_size": info.trade_contract_size,
        "spread": info.spread,
        "trade_mode": info.trade_mode,
    }


# ---------------------------------------------------------------------------
# Connection lifecycle
# ---------------------------------------------------------------------------

@app.route("/api/v1/initialize", methods=["POST"])
def initialize():
    global _initialized
    data = request.get_json(silent=True) or {}
    login = data.get("login", 0)
    password = data.get("password", "")
    server = data.get("server", "")
    path = data.get("path")

    kwargs = {"login": login, "password": password, "server": server}
    if path:
        kwargs["path"] = path

    logger.info("initialize(login=%s, server=%s)", login, server)
    try:
        result = mt5.initialize(**kwargs)
        if result:
            _initialized = True
            return jsonify({"success": True})
        err = mt5.last_error()
        logger.error("initialize failed: %s", err)
        return jsonify({"success": False, "error": str(err)})
    except Exception as exc:
        logger.exception("initialize exception")
        return jsonify({"success": False, "error": str(exc)})


@app.route("/api/v1/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    login_val = data.get("login", 0)
    password = data.get("password", "")
    server = data.get("server", "")

    logger.info("login(login=%s, server=%s)", login_val, server)
    try:
        result = mt5.login(login=login_val, password=password, server=server)
        return jsonify({"success": bool(result)})
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)})


@app.route("/api/v1/shutdown", methods=["POST"])
def shutdown():
    global _initialized
    logger.info("shutdown")
    try:
        mt5.shutdown()
    except Exception:
        pass
    _initialized = False
    return jsonify({"success": True})


@app.route("/api/v1/last-error", methods=["GET"])
def last_error():
    err = mt5.last_error()
    if err is None:
        return jsonify({"code": 0, "description": "Success"})
    if isinstance(err, tuple) and len(err) >= 2:
        return jsonify({"code": err[0], "description": err[1]})
    return jsonify({"code": 1, "description": str(err)})


# ---------------------------------------------------------------------------
# Account / terminal
# ---------------------------------------------------------------------------

@app.route("/api/v1/account-info", methods=["GET"])
def account_info():
    if not _require_init():
        return jsonify({"error": "MT5 not initialized"})
    try:
        info = mt5.account_info()
        return jsonify(_account_info_to_dict(info))
    except Exception as exc:
        return jsonify({"error": str(exc)})


@app.route("/api/v1/terminal-info", methods=["GET"])
def terminal_info():
    if not _require_init():
        return jsonify({"connected": False, "trade_allowed": False})
    try:
        info = mt5.terminal_info()
        if info is None:
            return jsonify({"connected": False, "trade_allowed": False})
        return jsonify({
            "connected": bool(info.connected),
            "trade_allowed": bool(info.trade_allowed),
        })
    except Exception as exc:
        return jsonify({"error": str(exc)})


# ---------------------------------------------------------------------------
# Symbols
# ---------------------------------------------------------------------------

@app.route("/api/v1/symbol-info/<symbol>", methods=["GET"])
def symbol_info(symbol: str):
    if not _require_init():
        return jsonify({"error": "MT5 not initialized"})
    try:
        info = mt5.symbol_info(symbol)
        return jsonify(_symbol_info_to_dict(info))
    except Exception as exc:
        return jsonify({"error": str(exc)})


@app.route("/api/v1/symbols-get", methods=["GET"])
def symbols_get():
    if not _require_init():
        return jsonify({"error": "MT5 not initialized"})
    try:
        raw = mt5.symbols_get()
        if raw is None:
            return jsonify({"symbols": []})
        return jsonify({
            "symbols": [_symbol_info_to_dict(s) for s in raw]
        })
    except Exception as exc:
        return jsonify({"error": str(exc)})


@app.route("/api/v1/symbol-select", methods=["POST"])
def symbol_select():
    if not _require_init():
        return jsonify({"success": False, "error": "MT5 not initialized"})
    data = request.get_json(silent=True) or {}
    symbol = data.get("symbol", "")
    enable = data.get("enable", True)
    try:
        result = mt5.symbol_select(symbol, enable)
        return jsonify({"success": bool(result)})
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)})


# ---------------------------------------------------------------------------
# Market data
# ---------------------------------------------------------------------------

@app.route("/api/v1/tick/<symbol>", methods=["GET"])
def tick(symbol: str):
    if not _require_init():
        return jsonify({"error": "MT5 not initialized"})
    try:
        t = mt5.symbol_info_tick(symbol)
        if t is None:
            return jsonify({"error": f"No tick for {symbol}"})
        return jsonify({
            "time": t.time,
            "bid": t.bid,
            "ask": t.ask,
            "last": t.last,
            "volume": t.volume,
        })
    except Exception as exc:
        return jsonify({"error": str(exc)})


@app.route("/api/v1/rates/<symbol>", methods=["GET"])
def rates(symbol: str):
    if not _require_init():
        return jsonify({"error": "MT5 not initialized"})
    try:
        timeframe = int(request.args.get("timeframe", mt5.TIMEFRAME_H1))
        start_pos = int(request.args.get("start_pos", 1))
        count = int(request.args.get("count", 100))

        rates_raw = mt5.copy_rates_from_pos(symbol, timeframe, start_pos, count)
        if rates_raw is None:
            return jsonify({"rates": []})

        import numpy as np
        if isinstance(rates_raw, np.ndarray):
            records = [dict(zip(rates_raw.dtype.names, row)) for row in rates_raw]
        elif isinstance(rates_raw, (list, tuple)):
            records = [dict(r) for r in rates_raw]
        else:
            records = []

        # Convert numpy types to native Python types for JSON serialization
        cleaned = []
        for r in records:
            cleaned.append({
                "time": int(r.get("time", 0)),
                "open": float(r.get("open", 0.0)),
                "high": float(r.get("high", 0.0)),
                "low": float(r.get("low", 0.0)),
                "close": float(r.get("close", 0.0)),
                "tick_volume": int(r.get("tick_volume", 0)),
                "spread": int(r.get("spread", 0)),
                "real_volume": int(r.get("real_volume", 0)),
            })

        return jsonify({"rates": cleaned})
    except Exception as exc:
        return jsonify({"error": str(exc)})


# ---------------------------------------------------------------------------
# Trading
# ---------------------------------------------------------------------------

@app.route("/api/v1/order-send", methods=["POST"])
def order_send():
    if not _require_init():
        return jsonify({"error": "MT5 not initialized"})
    try:
        request_data = request.get_json(silent=True) or {}
        logger.info("order_send(%s)", {k: v for k, v in request_data.items() if k != "password"})
        result = mt5.order_send(request_data)
        if result is None:
            err = mt5.last_error()
            return jsonify({"error": f"order_send returned None: {err}"})
        return jsonify(_mt5_result(
            retcode=result.retcode,
            order=result.order,
            volume=result.volume,
            price=result.price,
        ))
    except Exception as exc:
        logger.exception("order_send exception")
        return jsonify({"error": str(exc)})


@app.route("/api/v1/order-check", methods=["POST"])
def order_check():
    if not _require_init():
        return jsonify({"retcode": -1})
    try:
        request_data = request.get_json(silent=True) or {}
        result = mt5.order_check(request_data)
        if result is None:
            return jsonify({"retcode": -1})
        return jsonify({"retcode": result.retcode})
    except Exception as exc:
        return jsonify({"error": str(exc)})


# ---------------------------------------------------------------------------
# Positions
# ---------------------------------------------------------------------------

@app.route("/api/v1/positions", methods=["GET"])
def positions():
    if not _require_init():
        return jsonify({"positions": []})
    try:
        symbol = request.args.get("symbol")
        ticket = request.args.get("ticket")

        kwargs = {}
        if symbol:
            kwargs["symbol"] = symbol
        if ticket:
            kwargs["ticket"] = int(ticket)

        raw = mt5.positions_get(**kwargs)
        if raw is None:
            return jsonify({"positions": []})

        return jsonify({
            "positions": [
                {
                    "ticket": p.ticket,
                    "symbol": p.symbol,
                    "type": p.type,
                    "volume": p.volume,
                    "price_open": p.price_open,
                    "price_current": p.price_current,
                    "sl": p.sl,
                    "tp": p.tp,
                    "profit": p.profit,
                    "swap": p.swap,
                    "magic": p.magic,
                    "time": p.time,
                    "comment": p.comment,
                }
                for p in raw
            ]
        })
    except Exception as exc:
        return jsonify({"error": str(exc)})


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.route("/api/v1/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok" if _initialized else "not_initialized",
        "initialized": _initialized,
    })


@app.route("/health", methods=["GET"])
def health_simple():
    return jsonify({"status": "ok" if _initialized else "not_initialized"})


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="MT5 Bridge Service for ForexBot")
    parser.add_argument("--port", type=int, default=5002, help="HTTP port (default: 5002)")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Bind address (default: 0.0.0.0)")
    args = parser.parse_args()

    logger.info("Starting MT5 Bridge Service on %s:%d", args.host, args.port)
    app.run(host=args.host, port=args.port, debug=False)


if __name__ == "__main__":
    main()

"""
bridge_client.py
=================
MT5 client implementation that calls the Windows MT5 Bridge Service
over HTTP. Allows the trading engine to run on Linux while MT5 runs on
a separate Windows machine/service.

All methods return the same DTOs as DirectMT5Client, making the two
implementations interchangeable.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import httpx

from bot.mt5_client import (
    MT5Client,
    AccountInfo,
    OrderCheckResult,
    OrderSendResult,
    Position,
    SymbolInfo,
    TerminalInfo,
    Tick,
)

logger = logging.getLogger("bridge_mt5_client")

_BRIDGE_TIMEOUT = 30.0  # seconds


def _to_tick(ts: float | None, bid: float, ask: float, last_val: float, vol: int) -> Tick:
    return Tick(
        time=datetime.fromtimestamp(ts, tz=timezone.utc) if ts else None,
        bid=bid,
        ask=ask,
        last=last_val,
        volume=vol,
    )


class BridgeMT5Client(MT5Client):
    def __init__(self, base_url: str) -> None:
        self._base_url = base_url.rstrip("/")
        self._client = httpx.Client(timeout=_BRIDGE_TIMEOUT)

    # ------------------------------------------------------------------
    # HTTP helpers
    # ------------------------------------------------------------------
    def _get(self, path: str, params: dict | None = None) -> dict:
        try:
            resp = self._client.get(f"{self._base_url}{path}", params=params)
            resp.raise_for_status()
            return resp.json()
        except httpx.TimeoutException:
            logger.error("Bridge GET %s timed out after %ss", path, _BRIDGE_TIMEOUT)
            return {"error": f"Timeout: {path}"}
        except httpx.RequestError as exc:
            logger.error("Bridge GET %s failed: %s", path, exc)
            return {"error": str(exc)}

    def _post(self, path: str, json_data: dict | None = None) -> dict:
        try:
            resp = self._client.post(f"{self._base_url}{path}", json=json_data)
            resp.raise_for_status()
            return resp.json()
        except httpx.TimeoutException:
            logger.error("Bridge POST %s timed out after %ss", path, _BRIDGE_TIMEOUT)
            return {"error": f"Timeout: {path}"}
        except httpx.RequestError as exc:
            logger.error("Bridge POST %s failed: %s", path, exc)
            return {"error": str(exc)}

    # ------------------------------------------------------------------
    # Connection lifecycle
    # ------------------------------------------------------------------
    def initialize(
        self, login: int, password: str, server: str, path: str | None = None
    ) -> bool:
        data = {"login": login, "password": password, "server": server}
        if path:
            data["path"] = path
        result = self._post("/api/v1/initialize", data)
        return result.get("success", False)

    def login(self, login: int, password: str, server: str) -> bool:
        result = self._post("/api/v1/login", {
            "login": login, "password": password, "server": server,
        })
        return result.get("success", False)

    def shutdown(self) -> None:
        self._post("/api/v1/shutdown")

    def last_error(self) -> tuple[int, str]:
        result = self._get("/api/v1/last-error")
        return (result.get("code", 1), result.get("description", "Unknown"))

    # ------------------------------------------------------------------
    # Account / terminal
    # ------------------------------------------------------------------
    def account_info(self) -> AccountInfo:
        result = self._get("/api/v1/account-info")
        if "error" in result:
            return AccountInfo()
        return AccountInfo(
            login=result.get("login", 0),
            balance=result.get("balance", 0.0),
            equity=result.get("equity", 0.0),
            margin=result.get("margin", 0.0),
            margin_free=result.get("margin_free", 0.0),
            margin_level=result.get("margin_level", 0.0),
            currency=result.get("currency", "USD"),
            trade_mode=result.get("trade_mode", 0),
            server=result.get("server", ""),
            name=result.get("name", ""),
            leverage=result.get("leverage", 0),
        )

    def terminal_info(self) -> TerminalInfo:
        result = self._get("/api/v1/terminal-info")
        if "error" in result:
            return TerminalInfo(connected=False, trade_allowed=False)
        return TerminalInfo(
            connected=result.get("connected", False),
            trade_allowed=result.get("trade_allowed", False),
        )

    # ------------------------------------------------------------------
    # Symbols
    # ------------------------------------------------------------------
    def symbol_info(self, symbol: str) -> SymbolInfo:
        result = self._get(f"/api/v1/symbol-info/{symbol}")
        if "error" in result:
            return SymbolInfo(name=symbol, visible=False)
        return SymbolInfo(
            name=result.get("name", symbol),
            visible=result.get("visible", False),
            point=result.get("point", 0.0),
            digits=result.get("digits", 5),
            volume_min=result.get("volume_min", 0.01),
            volume_max=result.get("volume_max", 100.0),
            volume_step=result.get("volume_step", 0.01),
            trade_contract_size=result.get("trade_contract_size", 100000.0),
            spread=result.get("spread", 0),
            trade_mode=result.get("trade_mode", 2),
        )

    def symbols_get(self) -> list[SymbolInfo]:
        result = self._get("/api/v1/symbols-get")
        if "error" in result or "symbols" not in result:
            return []
        return [
            SymbolInfo(
                name=s.get("name", ""),
                visible=s.get("visible", False),
                point=s.get("point", 0.0),
                digits=s.get("digits", 5),
                volume_min=s.get("volume_min", 0.01),
                volume_max=s.get("volume_max", 100.0),
                volume_step=s.get("volume_step", 0.01),
                trade_contract_size=s.get("trade_contract_size", 100000.0),
                spread=s.get("spread", 0),
                trade_mode=s.get("trade_mode", 2),
            )
            for s in result["symbols"]
        ]

    def symbol_select(self, symbol: str, enable: bool) -> bool:
        result = self._post("/api/v1/symbol-select", {
            "symbol": symbol, "enable": enable,
        })
        return result.get("success", False)

    # ------------------------------------------------------------------
    # Market data
    # ------------------------------------------------------------------
    def symbol_info_tick(self, symbol: str) -> Tick:
        result = self._get(f"/api/v1/tick/{symbol}")
        if "error" in result:
            return Tick()
        return _to_tick(
            result.get("time"),
            result.get("bid", 0.0),
            result.get("ask", 0.0),
            result.get("last", 0.0),
            result.get("volume", 0),
        )

    def copy_rates_from_pos(
        self, symbol: str, timeframe: int, start_pos: int, count: int
    ) -> list[dict[str, Any]]:
        result = self._get(
            f"/api/v1/rates/{symbol}",
            params={"timeframe": str(timeframe), "start_pos": str(start_pos), "count": str(count)},
        )
        if "error" in result or "rates" not in result:
            return []
        return result["rates"]

    # ------------------------------------------------------------------
    # Trading
    # ------------------------------------------------------------------
    def order_send(self, request: dict) -> OrderSendResult:
        result = self._post("/api/v1/order-send", request)
        if "error" in result:
            return OrderSendResult(retcode=-1, comment=result.get("error", "Unknown"))
        return OrderSendResult(
            retcode=result.get("retcode", -1),
            order=result.get("order", 0),
            volume=result.get("volume", 0.0),
            price=result.get("price", 0.0),
            comment=result.get("comment", ""),
        )

    def order_check(self, request: dict) -> OrderCheckResult:
        result = self._post("/api/v1/order-check", request)
        if "error" in result:
            return OrderCheckResult(retcode=-1)
        return OrderCheckResult(retcode=result.get("retcode", -1))

    # ------------------------------------------------------------------
    # Positions
    # ------------------------------------------------------------------
    def positions_get(
        self, symbol: str | None = None, ticket: int | None = None
    ) -> list[Position]:
        params: dict[str, str] = {}
        if symbol is not None:
            params["symbol"] = symbol
        if ticket is not None:
            params["ticket"] = str(ticket)
        result = self._get("/api/v1/positions", params=params)
        if "error" in result or "positions" not in result:
            return []
        return [
            Position(
                ticket=p.get("ticket", 0),
                symbol=p.get("symbol", ""),
                type=p.get("type", 0),
                volume=p.get("volume", 0.0),
                price_open=p.get("price_open", 0.0),
                price_current=p.get("price_current", 0.0),
                sl=p.get("sl", 0.0),
                tp=p.get("tp", 0.0),
                profit=p.get("profit", 0.0),
                swap=p.get("swap", 0.0),
                magic=p.get("magic", 0),
                time=p.get("time", 0),
                comment=p.get("comment", ""),
            )
            for p in result["positions"]
        ]

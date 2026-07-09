"""
direct_client.py
================
Direct MT5 client implementation using the MetaTrader5 Python package.
Used on Windows where MetaTrader5 terminal is installed.

This is the original implementation, extracted from mt5_connector.py
and friends into a single class that implements MT5Client.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

import MetaTrader5 as mt5

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

logger = logging.getLogger("direct_mt5_client")


class DirectMT5Client(MT5Client):
    def initialize(
        self, login: int, password: str, server: str, path: str | None = None
    ) -> bool:
        kwargs: dict[str, Any] = {
            "login": login,
            "password": password,
            "server": server,
        }
        if path:
            kwargs["path"] = path
        return mt5.initialize(**kwargs)

    def login(self, login: int, password: str, server: str) -> bool:
        return mt5.login(login=login, password=password, server=server)

    def shutdown(self) -> None:
        mt5.shutdown()

    def last_error(self) -> tuple[int, str]:
        err = mt5.last_error()
        if err is None:
            return (0, "Success")
        if isinstance(err, tuple) and len(err) >= 2:
            return (err[0], err[1])
        return (1, str(err))

    def account_info(self) -> AccountInfo:
        info = mt5.account_info()
        if info is None:
            return AccountInfo()
        return AccountInfo(
            login=info.login,
            balance=info.balance,
            equity=info.equity,
            margin=info.margin,
            margin_free=info.margin_free,
            margin_level=info.margin_level or 0.0,
            currency=info.currency,
            trade_mode=info.trade_mode,
            server=info.server,
            name=info.name,
            leverage=info.leverage,
        )

    def terminal_info(self) -> TerminalInfo:
        info = mt5.terminal_info()
        if info is None:
            return TerminalInfo(connected=False, trade_allowed=False)
        return TerminalInfo(
            connected=bool(info.connected),
            trade_allowed=bool(info.trade_allowed),
        )

    def symbol_info(self, symbol: str) -> SymbolInfo:
        info = mt5.symbol_info(symbol)
        if info is None:
            return SymbolInfo(name=symbol, visible=False)
        return SymbolInfo(
            name=info.name,
            visible=bool(info.visible),
            point=float(info.point),
            digits=info.digits,
            volume_min=info.volume_min,
            volume_max=info.volume_max,
            volume_step=info.volume_step,
            trade_contract_size=info.trade_contract_size,
            spread=info.spread,
            trade_mode=info.trade_mode,
        )

    def symbols_get(self) -> list[SymbolInfo]:
        raw = mt5.symbols_get()
        if raw is None:
            return []
        return [
            SymbolInfo(
                name=s.name,
                visible=bool(s.visible),
                point=float(s.point),
                digits=s.digits,
                volume_min=s.volume_min,
                volume_max=s.volume_max,
                volume_step=s.volume_step,
                trade_contract_size=s.trade_contract_size,
                spread=s.spread,
                trade_mode=s.trade_mode,
            )
            for s in raw
        ]

    def symbol_select(self, symbol: str, enable: bool) -> bool:
        return mt5.symbol_select(symbol, enable)

    def symbol_info_tick(self, symbol: str) -> Tick:
        tick = mt5.symbol_info_tick(symbol)
        if tick is None:
            return Tick()
        return Tick(
            time=datetime.fromtimestamp(tick.time, tz=timezone.utc),
            bid=tick.bid,
            ask=tick.ask,
            last=tick.last,
            volume=tick.volume,
        )

    def copy_rates_from_pos(
        self, symbol: str, timeframe: int, start_pos: int, count: int
    ) -> list[dict[str, Any]]:
        rates = mt5.copy_rates_from_pos(symbol, timeframe, start_pos, count)
        if rates is None:
            return []
        import numpy as np
        if isinstance(rates, np.ndarray):
            return [dict(zip(rates.dtype.names, row)) for row in rates]
        if isinstance(rates, (list, tuple)):
            return [dict(r) for r in rates]
        return []

    def order_send(self, request: dict) -> OrderSendResult:
        result = mt5.order_send(request)
        if result is None:
            return OrderSendResult(retcode=-1, comment="order_send returned None")
        return OrderSendResult(
            retcode=result.retcode,
            order=result.order,
            volume=result.volume,
            price=result.price,
            comment=str(getattr(result, "comment", "")),
        )

    def order_check(self, request: dict) -> OrderCheckResult:
        result = mt5.order_check(request)
        if result is None:
            return OrderCheckResult(retcode=-1)
        return OrderCheckResult(retcode=result.retcode)

    def positions_get(
        self, symbol: str | None = None, ticket: int | None = None
    ) -> list[Position]:
        kwargs: dict[str, Any] = {}
        if symbol is not None:
            kwargs["symbol"] = symbol
        if ticket is not None:
            kwargs["ticket"] = ticket

        raw = mt5.positions_get(**kwargs)
        if raw is None:
            return []

        return [
            Position(
                ticket=p.ticket,
                symbol=p.symbol,
                type=p.type,
                volume=p.volume,
                price_open=p.price_open,
                price_current=p.price_current,
                sl=p.sl,
                tp=p.tp,
                profit=p.profit,
                swap=p.swap,
                magic=p.magic,
                time=p.time,
                comment=p.comment,
            )
            for p in raw
        ]

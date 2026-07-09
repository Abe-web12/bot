"""
mt5_client.py
=============
Abstract interface for all MT5 operations, plus data transfer objects,
MT5 constant definitions, and a factory function.

Architecture:
  All modules that need MT5 data go through this interface instead of
  importing MetaTrader5 directly. Two implementations exist:
    - DirectMT5Client: uses MetaTrader5 Python package (Windows only)
    - BridgeMT5Client: calls the MT5 Bridge Service over HTTP (cross-platform)

  Set MT5_MODE=direct (default on Windows, requires MetaTrader5 installed)
  or MT5_MODE=bridge (Linux Docker, requires MT5_BRIDGE_URL).

  The singleton client is initialized once at startup in run.py and shared
  across all modules via get_client().
"""

from __future__ import annotations

import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, ClassVar

logger = logging.getLogger("mt5_client")

# =========================================================================
# MT5 Constants (mirror MetaTrader5 module-level ints)
# =========================================================================
# Trade operations
TRADE_ACTION_DEAL = 1
TRADE_ACTION_SLTP = 5

# Order types
ORDER_TYPE_BUY = 0
ORDER_TYPE_SELL = 1
ORDER_TYPE_BUY_LIMIT = 2
ORDER_TYPE_SELL_LIMIT = 3
ORDER_TYPE_BUY_STOP = 4
ORDER_TYPE_SELL_STOP = 5

# Order time / filling
ORDER_TIME_GTC = 0
ORDER_TIME_DAY = 1
ORDER_TIME_SPECIFIED = 2
ORDER_TIME_SPECIFIED_DAY = 3
ORDER_FILLING_FOK = 0
ORDER_FILLING_IOC = 1
ORDER_FILLING_RETURN = 2

# Trade retcodes
TRADE_RETCODE_DONE = 10009
TRADE_RETCODE_REQUOTE = 10004
TRADE_RETCODE_PRICE_CHANGED = 10020
TRADE_RETCODE_TIMEOUT = 10012

# Account trade modes
ACCOUNT_TRADE_MODE_DEMO = 0
ACCOUNT_TRADE_MODE_CONTEST = 1
ACCOUNT_TRADE_MODE_REAL = 2

# Symbol trade modes
SYMBOL_TRADE_MODE_DISABLED = 0
SYMBOL_TRADE_MODE_CLOSEONLY = 1
SYMBOL_TRADE_MODE_FULL = 2

# Timeframes
TIMEFRAME_M1 = 1
TIMEFRAME_M5 = 5
TIMEFRAME_M15 = 15
TIMEFRAME_M30 = 30
TIMEFRAME_H1 = 60
TIMEFRAME_H4 = 240
TIMEFRAME_D1 = 1440
TIMEFRAME_W1 = 10080
TIMEFRAME_MN1 = 43200


# =========================================================================
# DTOs (Data Transfer Objects) — mirror MT5's namedtuples
# =========================================================================

@dataclass
class AccountInfo:
    login: int = 0
    balance: float = 0.0
    equity: float = 0.0
    margin: float = 0.0
    margin_free: float = 0.0
    margin_level: float = 0.0
    currency: str = "USD"
    trade_mode: int = 0
    server: str = ""
    name: str = ""
    leverage: int = 0


@dataclass
class TerminalInfo:
    connected: bool = False
    trade_allowed: bool = False


@dataclass
class SymbolInfo:
    name: str = ""
    visible: bool = False
    point: float = 0.0
    digits: int = 5
    volume_min: float = 0.01
    volume_max: float = 100.0
    volume_step: float = 0.01
    trade_contract_size: float = 100000.0
    spread: int = 0
    trade_mode: int = 2


@dataclass
class Tick:
    time: datetime | None = None
    bid: float = 0.0
    ask: float = 0.0
    last: float = 0.0
    volume: int = 0


@dataclass
class Position:
    ticket: int = 0
    symbol: str = ""
    type: int = 0  # ORDER_TYPE_BUY or ORDER_TYPE_SELL
    volume: float = 0.0
    price_open: float = 0.0
    price_current: float = 0.0
    sl: float = 0.0
    tp: float = 0.0
    profit: float = 0.0
    swap: float = 0.0
    magic: int = 0
    time: int = 0
    comment: str = ""


@dataclass
class OrderSendResult:
    retcode: int = -1
    order: int = 0
    volume: float = 0.0
    price: float = 0.0
    comment: str = ""


@dataclass
class OrderCheckResult:
    retcode: int = -1


# =========================================================================
# Abstract client interface
# =========================================================================

class MT5Client(ABC):
    """
    Abstract interface for all MetaTrader 5 operations.
    Every method maps 1:1 to an mt5.* function.

    Implementations:
      - DirectMT5Client  — wraps the MetaTrader5 Python package
      - BridgeMT5Client  — calls the Windows MT5 Bridge Service via HTTP
    """

    # MT5 constants mirrored as class-level attributes so client consumers
    # can do:  from bot.mt5_client import get_client;  get_client().ORDER_TYPE_BUY
    # when they need platform-level ints. Module-level aliases also exist.
    ORDER_TYPE_BUY: ClassVar[int] = 0
    ORDER_TYPE_SELL: ClassVar[int] = 1

    # ------------------------------------------------------------------
    # Connection lifecycle
    # ------------------------------------------------------------------
    @abstractmethod
    def initialize(
        self, login: int, password: str, server: str, path: str | None = None
    ) -> bool:
        ...

    @abstractmethod
    def login(self, login: int, password: str, server: str) -> bool:
        ...

    @abstractmethod
    def shutdown(self) -> None:
        ...

    @abstractmethod
    def last_error(self) -> tuple[int, str]:
        """Returns (error_code, error_description)."""

    # ------------------------------------------------------------------
    # Account / terminal queries
    # ------------------------------------------------------------------
    @abstractmethod
    def account_info(self) -> AccountInfo:
        ...

    @abstractmethod
    def terminal_info(self) -> TerminalInfo:
        ...

    # ------------------------------------------------------------------
    # Symbol queries
    # ------------------------------------------------------------------
    @abstractmethod
    def symbol_info(self, symbol: str) -> SymbolInfo:
        ...

    @abstractmethod
    def symbols_get(self) -> list[SymbolInfo]:
        ...

    @abstractmethod
    def symbol_select(self, symbol: str, enable: bool) -> bool:
        ...

    # ------------------------------------------------------------------
    # Market data
    # ------------------------------------------------------------------
    @abstractmethod
    def symbol_info_tick(self, symbol: str) -> Tick:
        ...

    @abstractmethod
    def copy_rates_from_pos(
        self, symbol: str, timeframe: int, start_pos: int, count: int
    ) -> list[dict[str, Any]]:
        """
        Returns a list of dicts with keys matching MT5's rate columns:
        time(int), open, high, low, close, tick_volume, spread, real_volume.
        The caller converts to DataFrame as needed.
        """
        ...

    # ------------------------------------------------------------------
    # Trading
    # ------------------------------------------------------------------
    @abstractmethod
    def order_send(self, request: dict) -> OrderSendResult:
        ...

    @abstractmethod
    def order_check(self, request: dict) -> OrderCheckResult:
        ...

    # ------------------------------------------------------------------
    # Positions
    # ------------------------------------------------------------------
    @abstractmethod
    def positions_get(
        self, symbol: str | None = None, ticket: int | None = None
    ) -> list[Position]:
        ...


# =========================================================================
# Singleton holder & factory
# =========================================================================

_client_instance: MT5Client | None = None


def init_client(mode: str = "direct", bridge_url: str = "") -> MT5Client:
    """
    Create and return the appropriate MT5 client implementation.
    Call this once at startup (run.py). Subsequent calls return the
    same instance.  Thread-safe by convention (set once at startup,
    never changed after).
    """
    global _client_instance
    if _client_instance is not None:
        return _client_instance

    if mode == "direct":
        from bot.direct_client import DirectMT5Client
        _client_instance = DirectMT5Client()
        logger.info("MT5 client: direct mode (MetaTrader5 package)")
    elif mode == "bridge":
        if not bridge_url:
            raise ValueError("MT5_BRIDGE_URL must be set when MT5_MODE=bridge")
        from bot.bridge_client import BridgeMT5Client
        _client_instance = BridgeMT5Client(bridge_url)
        logger.info("MT5 client: bridge mode -> %s", bridge_url)
    else:
        raise ValueError(f"Unknown MT5_MODE '{mode}'. Use 'direct' or 'bridge'.")

    return _client_instance


def get_client() -> MT5Client:
    """Return the initialized MT5 client. Raises RuntimeError if not yet initialized."""
    if _client_instance is None:
        raise RuntimeError(
            "MT5Client not initialized. Call init_client(mode, bridge_url) "
            "in run.py before any module uses get_client()."
        )
    return _client_instance


def reset_client() -> None:
    """Reset the singleton (for tests)."""
    global _client_instance
    _client_instance = None

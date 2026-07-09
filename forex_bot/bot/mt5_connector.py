"""
mt5_connector.py
================
Owns the MetaTrader5 terminal connection: connect, verify, reconnect,
disconnect, and basic account/symbol queries.

SAFETY GATE (read this before touching this file):
This bot is being developed and validated on a DEMO account only. On
connect, we read the account's `trade_mode` from MT5 and refuse to
proceed if it is not explicitly DEMO. This check is intentionally
impossible to bypass via config — config.py cannot lie about what MT5
itself reports. If you later decide to go live, this gate needs a
deliberate, explicit code change here, not a config flag, so it's never
flipped by accident.
"""

from __future__ import annotations

import logging
import time

import config
from bot.mt5_client import AccountInfo, SymbolInfo as ClientSymbolInfo, get_client
from core.event_bus import Events, bus
from core.state_manager import ConnectionStatus, state

logger = logging.getLogger("mt5_connector")


class MT5ConnectionError(Exception):
    """Raised when MT5 cannot be reached or initialized."""


class LiveAccountBlockedError(Exception):
    """
    Raised when MT5 reports the connected account is NOT a demo account.
    This is a hard stop — the bot will not proceed.
    """


# Re-export SymbolInfo for backward compatibility with modules that
# import it from here (order_validator, lot_calculator, etc.).
# The actual DTO is now defined in mt5_client.py.
SymbolInfo = ClientSymbolInfo


class MT5Connector:
    def __init__(self) -> None:
        self._connected = False
        self._login = config.MT5_LOGIN
        self._password = config.MT5_PASSWORD
        self._server = config.MT5_SERVER
        self._path = getattr(config, "MT5_PATH", None)

    # ------------------------------------------------------------------
    # Connection lifecycle
    # ------------------------------------------------------------------
    def connect(self) -> None:
        """
        Initialize MT5, log in, and verify this is a demo account.
        Raises MT5ConnectionError or LiveAccountBlockedError on failure.
        """
        state.set_connection_status(ConnectionStatus.CONNECTING)

        if self._password in (None, "", "YOUR_PASSWORD_HERE"):
            raise MT5ConnectionError(
                "MT5_PASSWORD is not set. Put your Exness demo password in the .env file "
                "(see .env.example) — never hardcode it in config.py."
            )

        client = get_client()
        initialized = client.initialize(
            login=self._login,
            password=self._password,
            server=self._server,
            path=self._path,
        )

        if not initialized:
            error = client.last_error()
            state.set_connection_status(ConnectionStatus.FAILED)
            raise MT5ConnectionError(f"MT5 initialize() failed: {error}")

        account_info = client.account_info()
        if account_info.login == 0 and account_info.balance == 0.0:
            state.set_connection_status(ConnectionStatus.FAILED)
            client.shutdown()
            raise MT5ConnectionError("Connected but account_info() returned empty.")

        from bot.mt5_client import ACCOUNT_TRADE_MODE_DEMO
        is_demo = account_info.trade_mode == ACCOUNT_TRADE_MODE_DEMO
        state.set_is_demo_account(is_demo)

        if not is_demo:
            client.shutdown()
            state.set_connection_status(ConnectionStatus.FAILED)
            raise LiveAccountBlockedError(
                f"Account {account_info.login} on server {account_info.server} is NOT a demo "
                f"account (trade_mode={account_info.trade_mode}). Refusing to connect. "
                "This bot is configured for demo-only operation."
            )

        self._connected = True
        state.set_connection_status(ConnectionStatus.CONNECTED)
        state.update_account(
            balance=account_info.balance,
            equity=account_info.equity,
            margin=account_info.margin,
            free_margin=account_info.margin_free,
            margin_level=account_info.margin_level or 0.0,
            currency=account_info.currency,
        )

        logger.info(
            "Connected to MT5 DEMO account %s on %s | balance=%.2f %s",
            account_info.login, account_info.server, account_info.balance, account_info.currency,
        )
        bus.publish(
            Events.MT5_CONNECTED,
            {"login": account_info.login, "server": account_info.server, "is_demo": is_demo},
            source="mt5_connector",
        )

    def disconnect(self) -> None:
        if self._connected:
            get_client().shutdown()
            self._connected = False
            state.set_connection_status(ConnectionStatus.DISCONNECTED)
            logger.info("Disconnected from MT5.")

    def is_connected(self) -> bool:
        """
        Cheap liveness check. terminal_info() returns connected=False if
        the terminal connection has dropped.
        """
        if not self._connected:
            return False
        terminal = get_client().terminal_info()
        alive = terminal.connected
        if not alive:
            self._connected = False
            state.set_connection_status(ConnectionStatus.DISCONNECTED)
        return alive

    def reconnect(self, max_attempts: int | None = None, delay_seconds: int | None = None) -> bool:
        """
        Attempt to reconnect with backoff. Returns True on success.
        Does NOT re-verify demo status assumption silently — connect()
        always re-runs the full safety gate.
        """
        max_attempts = max_attempts or config.MAX_RETRY_ATTEMPTS
        delay_seconds = delay_seconds or config.RETRY_DELAY_SECONDS

        state.set_connection_status(ConnectionStatus.RECONNECTING)
        for attempt in range(1, max_attempts + 1):
            logger.warning("Reconnect attempt %d/%d...", attempt, max_attempts)
            try:
                self.disconnect()
                self.connect()
                return True
            except (MT5ConnectionError, LiveAccountBlockedError) as exc:
                logger.error("Reconnect attempt %d failed: %s", attempt, exc)
                if isinstance(exc, LiveAccountBlockedError):
                    bus.publish(Events.MT5_RECONNECT_FAILED, {"reason": str(exc), "fatal": True},
                                source="mt5_connector")
                    raise
                time.sleep(delay_seconds)

        bus.publish(Events.MT5_RECONNECT_FAILED, {"reason": "max attempts exceeded", "fatal": False},
                     source="mt5_connector")
        return False

    # ------------------------------------------------------------------
    # Account / symbol queries
    # ------------------------------------------------------------------
    def refresh_account_snapshot(self) -> None:
        """Pull latest balance/equity/margin into state_manager."""
        account_info = get_client().account_info()
        if account_info.login == 0 and account_info.balance == 0.0:
            raise MT5ConnectionError("account_info() returned empty — connection may be down.")
        state.update_account(
            balance=account_info.balance,
            equity=account_info.equity,
            margin=account_info.margin,
            free_margin=account_info.margin_free,
            margin_level=account_info.margin_level or 0.0,
            currency=account_info.currency,
        )

    def get_symbol_info(self, symbol: str) -> SymbolInfo:
        """
        Resolves and validates a symbol. Brokers frequently suffix symbols
        (e.g. 'EURUSDm', 'EURUSD.a') — we don't assume the literal name in
        config.py is correct. If the exact name isn't found, we try to find
        a close match so config stays simple, but we log loudly so it's
        never silently wrong.
        """
        client = get_client()
        info = client.symbol_info(symbol)

        # When MT5 doesn't find a symbol, our clients return visible=False
        # with point=0.0 and name matching the input.
        if not info.visible and info.point == 0.0 and info.name == symbol:
            candidate = self._find_symbol_variant(symbol)
            if candidate is None:
                raise MT5ConnectionError(
                    f"Symbol '{symbol}' not found on this broker and no close match exists. "
                    f"Check the exact symbol name in MT5's Market Watch."
                )
            logger.warning("Symbol '%s' not found exactly; using broker variant '%s' instead.",
                            symbol, candidate)
            info = client.symbol_info(candidate)
            symbol = candidate

        if not info.visible:
            if not client.symbol_select(symbol, True):
                raise MT5ConnectionError(f"Could not add symbol '{symbol}' to Market Watch.")
            info = client.symbol_info(symbol)

        return info

    @staticmethod
    def _find_symbol_variant(base_symbol: str) -> str | None:
        """Look for broker-specific suffixed versions of a symbol, e.g. EURUSDm."""
        all_symbols = get_client().symbols_get()
        if not all_symbols:
            return None
        for sym in all_symbols:
            if sym.name.upper().startswith(base_symbol.upper()):
                return sym.name
        return None

    def get_current_spread_pips(self, symbol: str) -> float:
        info = get_client().symbol_info(symbol)
        if not info.visible:
            raise MT5ConnectionError(f"Cannot read spread for unknown symbol '{symbol}'.")
        pip_divisor = 10 if info.digits in (3, 5) else 1
        return info.spread / pip_divisor


# Single shared instance for the whole process.
connector = MT5Connector()

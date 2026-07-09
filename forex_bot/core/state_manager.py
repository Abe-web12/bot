"""
state_manager.py
================
Single source of truth for runtime state.

Why this exists:
Without this, every module would keep its own notion of "is the bot
running?" or "what's our current equity?" — and those copies drift out
of sync. The dashboard would show stale data, the risk engine might
allow a trade after the kill switch fired, etc.

All state mutations go through this class and publish an event so
other modules (and eventually the dashboard's websocket layer) react
to changes instead of polling.

This is in-memory only. Persisted data (trade history, settings) lives
in the database layer, not here — this is *runtime* state.
"""

from __future__ import annotations

import threading
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any

from core.event_bus import Events, bus


class BotStatus(str, Enum):
    STOPPED = "STOPPED"
    STARTING = "STARTING"
    RUNNING = "RUNNING"
    PAUSED = "PAUSED"
    STOPPING = "STOPPING"
    ERROR = "ERROR"
    KILLED = "KILLED"


class ConnectionStatus(str, Enum):
    DISCONNECTED = "DISCONNECTED"
    CONNECTING = "CONNECTING"
    CONNECTED = "CONNECTED"
    RECONNECTING = "RECONNECTING"
    FAILED = "FAILED"


@dataclass
class AccountSnapshot:
    balance: float = 0.0
    equity: float = 0.0
    margin: float = 0.0
    free_margin: float = 0.0
    margin_level: float = 0.0
    currency: str = "USD"
    updated_at: datetime | None = None


@dataclass
class DailyStats:
    date: str = ""  # YYYY-MM-DD, reset detection key
    starting_balance: float = 0.0
    realized_pnl: float = 0.0
    trades_opened: int = 0
    trades_closed: int = 0


class StateManager:
    """
    Thread-safe runtime state holder.

    Usage:
        from core.state_manager import state

        state.set_bot_status(BotStatus.RUNNING)
        if state.bot_status == BotStatus.RUNNING:
            ...
    """

    def __init__(self) -> None:
        self._lock = threading.RLock()

        self._bot_status: BotStatus = BotStatus.STOPPED
        self._connection_status: ConnectionStatus = ConnectionStatus.DISCONNECTED
        self._account: AccountSnapshot = AccountSnapshot()
        self._daily_stats: DailyStats = DailyStats()
        self._open_position_count: int = 0
        self._last_error: str | None = None
        self._is_demo_account: bool | None = None  # set once on connect; never assume

    # ------------------------------------------------------------------
    # Bot status
    # ------------------------------------------------------------------
    @property
    def bot_status(self) -> BotStatus:
        with self._lock:
            return self._bot_status

    def set_bot_status(self, status: BotStatus, reason: str = "") -> None:
        with self._lock:
            previous = self._bot_status
            self._bot_status = status

        if previous != status:
            event_name = {
                BotStatus.RUNNING: Events.BOT_STARTED,
                BotStatus.STOPPED: Events.BOT_STOPPED,
                BotStatus.PAUSED: Events.BOT_PAUSED,
                BotStatus.KILLED: Events.KILL_SWITCH_TRIGGERED,
            }.get(status)
            if event_name:
                bus.publish(event_name, {"previous": previous.value, "reason": reason}, source="state_manager")

    # ------------------------------------------------------------------
    # Connection status
    # ------------------------------------------------------------------
    @property
    def connection_status(self) -> ConnectionStatus:
        with self._lock:
            return self._connection_status

    def set_connection_status(self, status: ConnectionStatus) -> None:
        with self._lock:
            previous = self._connection_status
            self._connection_status = status

        if previous != status:
            if status == ConnectionStatus.CONNECTED:
                bus.publish(Events.MT5_CONNECTED, {}, source="state_manager")
            elif status == ConnectionStatus.DISCONNECTED:
                bus.publish(Events.MT5_DISCONNECTED, {}, source="state_manager")

    # ------------------------------------------------------------------
    # Account identity safety
    # ------------------------------------------------------------------
    @property
    def is_demo_account(self) -> bool | None:
        """
        None until the connector confirms it. Code that places trades
        MUST check this is explicitly True before doing anything —
        never assume. See bot/mt5_connector.py.
        """
        with self._lock:
            return self._is_demo_account

    def set_is_demo_account(self, is_demo: bool) -> None:
        with self._lock:
            self._is_demo_account = is_demo

    # ------------------------------------------------------------------
    # Account snapshot
    # ------------------------------------------------------------------
    @property
    def account(self) -> AccountSnapshot:
        with self._lock:
            return self._account

    def update_account(self, *, balance: float, equity: float, margin: float,
                        free_margin: float, margin_level: float, currency: str = "USD") -> None:
        with self._lock:
            self._account = AccountSnapshot(
                balance=balance,
                equity=equity,
                margin=margin,
                free_margin=free_margin,
                margin_level=margin_level,
                currency=currency,
                updated_at=datetime.now(timezone.utc),
            )

    # ------------------------------------------------------------------
    # Daily stats (used by risk/drawdown_guard.py)
    # ------------------------------------------------------------------
    @property
    def daily_stats(self) -> DailyStats:
        with self._lock:
            return self._daily_stats

    def reset_daily_stats(self, date_str: str, starting_balance: float) -> None:
        with self._lock:
            self._daily_stats = DailyStats(date=date_str, starting_balance=starting_balance)

    def record_realized_pnl(self, amount: float) -> None:
        with self._lock:
            self._daily_stats.realized_pnl += amount
            self._daily_stats.trades_closed += 1

    def record_trade_opened(self) -> None:
        with self._lock:
            self._daily_stats.trades_opened += 1
            self._open_position_count += 1

    def record_trade_closed_count(self) -> None:
        with self._lock:
            self._open_position_count = max(0, self._open_position_count - 1)

    # ------------------------------------------------------------------
    # Open positions
    # ------------------------------------------------------------------
    @property
    def open_position_count(self) -> int:
        with self._lock:
            return self._open_position_count

    def set_open_position_count(self, count: int) -> None:
        with self._lock:
            self._open_position_count = count

    # ------------------------------------------------------------------
    # Errors
    # ------------------------------------------------------------------
    @property
    def last_error(self) -> str | None:
        with self._lock:
            return self._last_error

    def set_error(self, message: str) -> None:
        with self._lock:
            self._last_error = message
        bus.publish(Events.ERROR, {"message": message}, source="state_manager")

    def clear_error(self) -> None:
        with self._lock:
            self._last_error = None

    # ------------------------------------------------------------------
    # Snapshot for dashboard / logging
    # ------------------------------------------------------------------
    def to_dict(self) -> dict[str, Any]:
        with self._lock:
            return {
                "bot_status": self._bot_status.value,
                "connection_status": self._connection_status.value,
                "is_demo_account": self._is_demo_account,
                "account": asdict(self._account),
                "daily_stats": asdict(self._daily_stats),
                "open_position_count": self._open_position_count,
                "last_error": self._last_error,
            }


# Single shared instance for the whole process.
state = StateManager()

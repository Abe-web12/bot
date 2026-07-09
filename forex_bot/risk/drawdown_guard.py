"""
drawdown_guard.py
==================
The circuit breaker. Every other module that wants to open a trade MUST
call `drawdown_guard.can_open_new_trade()` first and respect a False
result. This module owns two protections:

1. Daily loss limit — if today's realized losses exceed
   config.DAILY_LOSS_LIMIT_PCT of the day's starting balance, no new
   trades until the next trading day.

2. Max drawdown — if current equity has fallen more than
   config.MAX_DRAWDOWN_PCT below the account's peak equity (persisted
   across restarts via the equity_snapshots table), the bot triggers
   the kill switch entirely, not just a pause. This is a
   capital-preservation stop, not a daily reset.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

import config
from core.event_bus import Events, bus
from core.state_manager import BotStatus, state

logger = logging.getLogger("drawdown_guard")


class DrawdownGuard:
    def __init__(self) -> None:
        self._peak_equity: float | None = None

    # ------------------------------------------------------------------
    # Peak equity persistence
    # ------------------------------------------------------------------
    def load_peak_equity(self) -> None:
        """
        Load the historical peak equity from the equity_snapshots table.
        Called once at startup so drawdown protection survives restarts.
        If no snapshots exist yet, falls back to the current live equity.
        """
        try:
            from database.connection import unit_of_work
            from sqlalchemy import text
            with unit_of_work() as session:
                row = session.execute(
                    text("SELECT MAX(equity) FROM equity_snapshots")
                ).fetchone()
                if row and row[0] is not None:
                    self._peak_equity = float(row[0])
                    logger.info(
                        "Peak equity loaded from DB: %.2f", self._peak_equity
                    )
                    return
        except Exception as exc:
            logger.warning("Could not load peak equity from DB: %s", exc)

        # Fallback: use current live equity as the starting peak
        equity = state.account.equity
        if equity > 0:
            self._peak_equity = equity
            logger.info(
                "Peak equity initialised from live account: %.2f", self._peak_equity
            )

    # ------------------------------------------------------------------
    # Daily reset
    # ------------------------------------------------------------------
    def ensure_daily_stats_current(self) -> None:
        """
        Call this on every trading-decision cycle. If the date has rolled
        over since the last recorded daily_stats, reset the counters
        against today's starting balance.
        """
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        if state.daily_stats.date != today:
            current_balance = state.account.balance
            logger.info(
                "New trading day detected (%s). Resetting daily stats. Starting balance=%.2f",
                today, current_balance,
            )
            state.reset_daily_stats(today, current_balance)

    # ------------------------------------------------------------------
    # Peak equity tracking (for max drawdown)
    # ------------------------------------------------------------------
    def update_peak_equity(self) -> None:
        equity = state.account.equity
        if equity <= 0:
            return
        if self._peak_equity is None or equity > self._peak_equity:
            self._peak_equity = equity

    @property
    def peak_equity(self) -> float | None:
        return self._peak_equity

    def current_drawdown_pct(self) -> float:
        if not self._peak_equity or self._peak_equity <= 0:
            return 0.0
        equity = state.account.equity
        drawdown = (self._peak_equity - equity) / self._peak_equity * 100.0
        return max(0.0, drawdown)

    # ------------------------------------------------------------------
    # Daily loss check
    # ------------------------------------------------------------------
    def daily_loss_pct(self) -> float:
        stats = state.daily_stats
        if stats.starting_balance <= 0:
            return 0.0
        loss_pct = (-stats.realized_pnl / stats.starting_balance) * 100.0
        return max(0.0, loss_pct)

    def is_daily_limit_hit(self) -> bool:
        return self.daily_loss_pct() >= config.DAILY_LOSS_LIMIT_PCT

    def is_max_drawdown_hit(self) -> bool:
        return self.current_drawdown_pct() >= config.MAX_DRAWDOWN_PCT

    # ------------------------------------------------------------------
    # Main gate — call this before opening any trade
    # ------------------------------------------------------------------
    def can_open_new_trade(self) -> tuple[bool, str]:
        """
        Returns (allowed, reason). If allowed is False, reason explains why.
        This function has side effects: it will trigger the kill switch
        event if max drawdown is breached, and publish DAILY_LOSS_LIMIT_HIT
        the first time the daily limit is crossed.
        """
        self.ensure_daily_stats_current()
        self.update_peak_equity()

        if state.bot_status in (BotStatus.KILLED, BotStatus.STOPPING, BotStatus.STOPPED):
            return False, f"Bot status is {state.bot_status.value}; not opening trades."

        if self.is_max_drawdown_hit():
            logger.critical(
                "MAX DRAWDOWN HIT: %.2f%% >= limit %.2f%%. Triggering kill switch.",
                self.current_drawdown_pct(), config.MAX_DRAWDOWN_PCT,
            )
            bus.publish(
                Events.DRAWDOWN_LIMIT_HIT,
                {"drawdown_pct": self.current_drawdown_pct(), "limit_pct": config.MAX_DRAWDOWN_PCT},
                source="drawdown_guard",
            )
            state.set_bot_status(BotStatus.KILLED, reason="max_drawdown_exceeded")
            return False, "Max drawdown limit exceeded — bot has been stopped. Manual review required."

        if self.is_daily_limit_hit():
            logger.warning(
                "Daily loss limit hit: %.2f%% >= limit %.2f%%. Pausing new trades until next trading day.",
                self.daily_loss_pct(), config.DAILY_LOSS_LIMIT_PCT,
            )
            bus.publish(
                Events.DAILY_LOSS_LIMIT_HIT,
                {"daily_loss_pct": self.daily_loss_pct(), "limit_pct": config.DAILY_LOSS_LIMIT_PCT},
                source="drawdown_guard",
            )
            return False, "Daily loss limit reached — no new trades until tomorrow."

        if state.open_position_count >= config.MAX_OPEN_TRADES:
            return False, f"Max open trades ({config.MAX_OPEN_TRADES}) already reached."

        return True, "OK"


# Single shared instance for the whole process.
drawdown_guard = DrawdownGuard()

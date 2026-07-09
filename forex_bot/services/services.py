"""
services.py
=============
Service layer between the API/WebSocket boundary and the existing
backend modules (repositories, state_manager, risk, market, strategy).
Every service here is a thin aggregator: it calls existing, already-
tested functions and repackages the result as a DTO — it never
recomputes a value that some other module already owns (e.g. win rate
is always computed by TradeRepository.win_rate(), never recalculated
here from raw rows).

Existing dashboard.py routes are NOT rewritten to use these services in
this milestone (per "do not rewrite working modules") — this layer is
additive, used by new code (chart endpoints, background workers,
WebSocket tick publishers), and available for existing routes to adopt
incrementally later without forcing that migration now.
"""

from __future__ import annotations

from datetime import datetime, timezone

import config
from api.dto import AccountDTO, PositionDTO, SignalDTO, StatisticsDTO, TradeDTO, WinRateDTO
from core.state_manager import state
from database.connection import unit_of_work
from database.repositories import (
    BotEventRepository, EquitySnapshotRepository, JournalRepository, TradeRepository,
)
from risk.drawdown_guard import drawdown_guard


class AccountService:
    def get_account(self) -> AccountDTO:
        account = state.account
        floating_profit = 0.0
        try:
            from execution.position_manager import position_manager
            positions = position_manager.get_open_positions()
            floating_profit = sum(p.profit for p in positions)
        except Exception:
            pass

        return AccountDTO(
            balance=account.balance, equity=account.equity, margin=account.margin,
            free_margin=account.free_margin, margin_level=account.margin_level,
            currency=account.currency, floating_profit=round(floating_profit, 2),
            drawdown_pct=drawdown_guard.current_drawdown_pct(),
            daily_loss_pct=drawdown_guard.daily_loss_pct(),
            open_positions=state.open_position_count,
            updated_at=account.updated_at,
        )


class TradeService:
    def get_open_positions(self) -> list[PositionDTO]:
        from execution.position_manager import position_manager
        positions = position_manager.get_open_positions()
        return [
            PositionDTO(
                ticket=p.ticket, symbol=p.symbol, side=p.side, volume=p.volume,
                open_price=p.open_price, current_price=p.current_price,
                stop_loss=p.stop_loss, take_profit=p.take_profit, profit=p.profit,
                swap=p.swap, magic_number=p.magic_number, open_time=p.open_time, comment=p.comment,
            )
            for p in positions
        ]

    def get_recent_closed(self, limit: int = 50) -> list[TradeDTO]:
        with unit_of_work() as session:
            trades = TradeRepository(session).get_recent_closed(limit=limit)
            return [
                TradeDTO(
                    id=t.id, mt5_ticket=t.mt5_ticket, symbol=t.symbol, side=t.side,
                    open_price=t.open_price, close_price=t.close_price, volume=t.volume,
                    stop_loss=t.stop_loss, take_profit=t.take_profit, profit=t.profit,
                    open_time=t.open_time, close_time=t.close_time, close_reason=t.close_reason,
                )
                for t in trades
            ]

    def get_all_closed_for_charts(self) -> list[TradeDTO]:
        return self.get_recent_closed(limit=5000)


class MarketService:
    def get_all_symbol_ticks(self) -> dict[str, dict]:
        from market.data_feed import DataFeedError, get_current_spread_pips, get_latest_tick
        result: dict[str, dict] = {}
        for symbol in config.SYMBOLS:
            try:
                tick = get_latest_tick(symbol)
                result[symbol] = {
                    "bid": tick["bid"], "ask": tick["ask"],
                    "spread_pips": get_current_spread_pips(symbol),
                    "tick_time": tick["time"].isoformat(),
                }
            except DataFeedError as exc:
                result[symbol] = {"error": str(exc)}
        return result


class StrategyService:
    def get_recent_signals(self, limit: int = 50, symbol: str | None = None) -> list[SignalDTO]:
        with unit_of_work() as session:
            repo = JournalRepository(session)
            generated = repo.get_recent(limit=limit, entry_type="SIGNAL_GENERATED", symbol=symbol)
            rejected = repo.get_recent(limit=limit, entry_type="SIGNAL_REJECTED", symbol=symbol)

        combined = [
            SignalDTO(
                symbol=e.symbol or "", direction=e.side or "", confidence=e.confidence,
                reason=e.reason or "", occurred_at=e.occurred_at,
            )
            for e in list(generated) + list(rejected)
        ]
        combined.sort(key=lambda s: s.occurred_at or datetime.min.replace(tzinfo=timezone.utc), reverse=True)
        return combined[:limit]


class RiskService:
    def get_risk_snapshot(self) -> dict:
        can_open, reason = drawdown_guard.can_open_new_trade()
        return {
            "daily_loss_pct": drawdown_guard.daily_loss_pct(),
            "daily_loss_limit_pct": config.DAILY_LOSS_LIMIT_PCT,
            "drawdown_pct": drawdown_guard.current_drawdown_pct(),
            "max_drawdown_pct": config.MAX_DRAWDOWN_PCT,
            "can_open_new_trade": can_open,
            "reason": reason,
        }


class AnalyticsService:
    def get_statistics(self) -> StatisticsDTO:
        with unit_of_work() as session:
            repo = TradeRepository(session)
            win_stats = repo.win_rate()
            pf_stats = repo.profit_factor()
            exp_stats = repo.expectancy()

        return StatisticsDTO(
            win_rate=WinRateDTO(**win_stats),
            profit_factor=pf_stats["profit_factor"],
            expectancy=exp_stats["expectancy"],
            gross_profit=pf_stats["gross_profit"],
            gross_loss=pf_stats["gross_loss"],
            avg_win=exp_stats["avg_win"],
            avg_loss=exp_stats["avg_loss"],
        )

    def get_equity_curve(self, limit: int = 168) -> list[dict]:
        with unit_of_work() as session:
            snapshots = EquitySnapshotRepository(session).get_recent(limit=limit)
        return [
            {
                "balance": s.balance, "equity": s.equity, "drawdown_pct": s.drawdown_pct,
                "snapshotted_at": s.snapshotted_at.isoformat(),
            }
            for s in reversed(snapshots)
        ]


class NotificationService:
    def get_recent(self, limit: int = 50) -> list[dict]:
        event_types = [
            "BOT_STARTED", "BOT_STOPPED", "TRADE_OPENED", "TRADE_CLOSED",
            "SL_HIT", "TP_HIT", "DAILY_LOSS_LIMIT_HIT", "DRAWDOWN_LIMIT_HIT",
            "MT5_DISCONNECTED", "MT5_CONNECTED", "CRITICAL_ERROR",
        ]
        with unit_of_work() as session:
            repo = BotEventRepository(session)
            events = []
            for event_name in event_types:
                events.extend(repo.get_recent(limit=limit, event_name=event_name))

        events.sort(key=lambda e: e.occurred_at, reverse=True)
        return [
            {"id": e.id, "event_name": e.event_name, "source": e.source, "occurred_at": e.occurred_at.isoformat()}
            for e in events[:limit]
        ]

    def queue_status(self) -> dict:
        from notifications.telegram_service import telegram_service
        return {"telegram_enabled": telegram_service._enabled, "queue_depth": telegram_service._queue.qsize()}


class HealthService:
    def get_health_summary(self) -> dict:
        from core.state_manager import BotStatus, ConnectionStatus
        from database.connection import check_connection

        db_ok, db_msg = check_connection()
        bot_ok = state.bot_status == BotStatus.RUNNING
        conn_ok = state.connection_status == ConnectionStatus.CONNECTED

        return {
            "bot_status": state.bot_status.value,
            "connection_status": state.connection_status.value,
            "database_ok": db_ok,
            "database_message": db_msg,
            "overall_ok": db_ok and bot_ok and conn_ok,
        }


class ConfigurationService:
    def get_current(self) -> dict:
        from core.config_manager import config_manager
        return {
            "overrides": config_manager.current_overrides(),
            "reloadable_keys": config_manager.hot_reloadable_keys(),
        }


class BotControlService:
    def get_status(self) -> dict:
        from core.bot_controller import bot_controller
        return bot_controller.status()


class DashboardService:
    """Top-level aggregator combining every other service into a single
    payload for a page-load endpoint (WebSocket keeps it live afterward)."""

    def __init__(self) -> None:
        self.account = AccountService()
        self.trades = TradeService()
        self.market = MarketService()
        self.strategy = StrategyService()
        self.risk = RiskService()
        self.analytics = AnalyticsService()
        self.notifications = NotificationService()
        self.health = HealthService()
        self.config = ConfigurationService()
        self.bot = BotControlService()

    def get_dashboard_snapshot(self) -> dict:
        return {
            "account": self.account.get_account().to_dict(),
            "positions": [p.to_dict() for p in self.trades.get_open_positions()],
            "recent_trades": [t.to_dict() for t in self.trades.get_recent_closed(limit=10)],
            "recent_signals": [s.to_dict() for s in self.strategy.get_recent_signals(limit=10)],
            "risk": self.risk.get_risk_snapshot(),
            "statistics": self.analytics.get_statistics().to_dict(),
            "health": self.health.get_health_summary(),
            "bot": self.bot.get_status(),
        }

"""
dto.py
=======
Dedicated Data Transfer Objects for the API/WebSocket boundary.

Why this exists as a separate layer: before this module, route handlers
built response dicts by hand, field by field, directly from SQLAlchemy
model attributes. That works, but means the shape of an API response is
implicitly whatever attributes a route happened to pick. DTOs make that
explicit and give the new services/chart/WebSocket layers a single,
versionable contract to target.

This module does NOT replace existing hand-built dicts in
dashboard.py/market.py/etc. — those already work and are tested; per
this milestone's "do not rewrite working modules" instruction they are
left alone. DTOs here are used by NEW code added in this milestone.
"""

from __future__ import annotations

import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from typing import Any, Generic, TypeVar

T = TypeVar("T")


def _to_dict(obj) -> dict:
    def _convert(value):
        if isinstance(value, datetime):
            return value.isoformat()
        if hasattr(value, "__dataclass_fields__"):
            return _to_dict(value)
        if isinstance(value, list):
            return [_convert(v) for v in value]
        if isinstance(value, dict):
            return {k: _convert(v) for k, v in value.items()}
        return value

    return {k: _convert(v) for k, v in asdict(obj).items()}


class DTOMixin:
    def to_dict(self) -> dict:
        return _to_dict(self)


@dataclass(frozen=True)
class ErrorDTO(DTOMixin):
    error: str
    status: int
    detail: str = ""
    request_id: str = ""


@dataclass(frozen=True)
class PaginationMetaDTO(DTOMixin):
    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool = False
    has_previous: bool = False


@dataclass(frozen=True)
class PagedResponseDTO(DTOMixin, Generic[T]):
    items: list[T]
    pagination: PaginationMetaDTO


@dataclass(frozen=True)
class LoginRequestDTO:
    password: str


@dataclass(frozen=True)
class AuthTokenDTO(DTOMixin):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    refresh_expires_in: int
    role: str


@dataclass(frozen=True)
class AccountDTO(DTOMixin):
    balance: float
    equity: float
    margin: float
    free_margin: float
    margin_level: float
    currency: str
    floating_profit: float
    drawdown_pct: float
    daily_loss_pct: float
    open_positions: int
    updated_at: datetime | None = None


@dataclass(frozen=True)
class PositionDTO(DTOMixin):
    ticket: int
    symbol: str
    side: str
    volume: float
    open_price: float
    current_price: float
    stop_loss: float
    take_profit: float
    profit: float
    swap: float
    magic_number: int
    open_time: datetime
    comment: str = ""


@dataclass(frozen=True)
class TradeDTO(DTOMixin):
    id: str
    mt5_ticket: int
    symbol: str
    side: str
    open_price: float
    close_price: float | None
    volume: float
    stop_loss: float | None
    take_profit: float | None
    profit: float | None
    open_time: datetime | None
    close_time: datetime | None
    close_reason: str | None


@dataclass(frozen=True)
class SignalDTO(DTOMixin):
    symbol: str
    direction: str
    confidence: float | None
    reason: str = ""
    occurred_at: datetime | None = None


@dataclass(frozen=True)
class WinRateDTO(DTOMixin):
    total: int
    wins: int
    losses: int
    win_rate_pct: float


@dataclass(frozen=True)
class StatisticsDTO(DTOMixin):
    win_rate: WinRateDTO
    profit_factor: float | None
    expectancy: float
    gross_profit: float
    gross_loss: float
    avg_win: float
    avg_loss: float


@dataclass(frozen=True)
class ChartPointDTO(DTOMixin):
    x: str
    y: float


@dataclass(frozen=True)
class ChartSeriesDTO(DTOMixin):
    name: str
    points: list[ChartPointDTO] = field(default_factory=list)


@dataclass(frozen=True)
class EventDTO(DTOMixin):
    """
    The canonical WebSocket message envelope.
      event_id   — globally unique, lets a client dedupe a message it
                   already processed (e.g. brief overlap around reconnect).
      sequence   — monotonic per-process counter; lets a client detect a
                   GAP (41 -> 44) even without knowing which events were
                   missed — that gap is what triggers a replay request.
      channel    — which subscription channel this belongs to.
      occurred_at— when the underlying domain event happened.
    """
    event_id: str
    sequence: int
    event: str
    channel: str
    payload: dict[str, Any]
    occurred_at: datetime

    @staticmethod
    def new(sequence: int, event: str, channel: str, payload: dict[str, Any]) -> "EventDTO":
        return EventDTO(
            event_id=str(uuid.uuid4()),
            sequence=sequence,
            event=event,
            channel=channel,
            payload=payload,
            occurred_at=datetime.now(timezone.utc),
        )

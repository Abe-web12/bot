"""
test_execution_and_notifications.py
=====================================
Tests for:
  - execution/order_validator.py  (pure logic, no MT5)
  - execution/trade_manager.py    (pure decision logic: breakeven, trailing)
  - execution/execution_engine.py (queue, submit, stats)
  - notifications/telegram_service.py (escaping, disabled-mode guard,
    message formatting — not the actual HTTP send which requires live Telegram)
"""

from __future__ import annotations

from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_symbol_info(
    name="EURUSD", point=0.00001, digits=5,
    vol_min=0.01, vol_max=100.0, vol_step=0.01,
    contract_size=100_000.0, spread=2, visible=True,
):
    from bot.mt5_connector import SymbolInfo
    return SymbolInfo(
        name=name, visible=visible, point=point, digits=digits,
        volume_min=vol_min, volume_max=vol_max, volume_step=vol_step,
        trade_contract_size=contract_size, spread=spread,
    )


def _make_account(balance=10_000.0, equity=10_000.0, margin=0.0,
                   free_margin=10_000.0, margin_level=0.0, currency="USD"):
    from core.state_manager import AccountSnapshot
    return AccountSnapshot(
        balance=balance, equity=equity, margin=margin,
        free_margin=free_margin, margin_level=margin_level,
        currency=currency, updated_at=datetime.now(timezone.utc),
    )


# ---------------------------------------------------------------------------
# order_validator.py — pure logic tests
# ---------------------------------------------------------------------------

class TestOrderValidator:

    def test_validate_connection_connected_passes(self):
        from core.state_manager import ConnectionStatus
        from execution.order_validator import validate_connection
        result = validate_connection(ConnectionStatus.CONNECTED)
        assert result.is_valid

    def test_validate_connection_disconnected_fails(self):
        from core.state_manager import ConnectionStatus
        from execution.order_validator import validate_connection
        result = validate_connection(ConnectionStatus.DISCONNECTED)
        assert not result.is_valid
        assert "CONNECTED" in result.errors[0]

    def test_validate_volume_valid(self):
        from execution.order_validator import validate_volume
        result = validate_volume(_make_symbol_info(), 0.01)
        assert result.is_valid

    def test_validate_volume_below_minimum(self):
        from execution.order_validator import validate_volume
        result = validate_volume(_make_symbol_info(vol_min=0.01), 0.005)
        assert not result.is_valid
        assert "minimum" in result.errors[0]

    def test_validate_volume_above_maximum(self):
        from execution.order_validator import validate_volume
        result = validate_volume(_make_symbol_info(vol_max=100.0), 200.0)
        assert not result.is_valid
        assert "maximum" in result.errors[0]

    def test_validate_volume_invalid_step(self):
        from execution.order_validator import validate_volume
        # 0.015 is not a multiple of 0.01 step (0.015 / 0.01 = 1.5)
        result = validate_volume(_make_symbol_info(vol_step=0.01), 0.015)
        assert not result.is_valid
        assert "step" in result.errors[0]

    def test_validate_volume_zero_rejected(self):
        from execution.order_validator import validate_volume
        result = validate_volume(_make_symbol_info(), 0.0)
        assert not result.is_valid

    def test_validate_spread_within_limit(self):
        from execution.order_validator import validate_spread
        result = validate_spread(current_spread_pips=2.0, max_spread_pips=3.0)
        assert result.is_valid

    def test_validate_spread_exceeds_limit(self):
        from execution.order_validator import validate_spread
        result = validate_spread(current_spread_pips=5.0, max_spread_pips=3.0)
        assert not result.is_valid
        assert "exceeds" in result.errors[0]

    def test_validate_spread_negative_rejected(self):
        from execution.order_validator import validate_spread
        result = validate_spread(current_spread_pips=-1.0, max_spread_pips=3.0)
        assert not result.is_valid

    def test_validate_margin_sufficient(self):
        from execution.order_validator import validate_margin
        result = validate_margin(
            account=_make_account(free_margin=5_000.0),
            symbol_info=_make_symbol_info(),
            volume=0.01,
            entry_price_estimate=1.1000,
            leverage=100,
            required_free_margin_buffer_pct=20.0,
        )
        # Required: 0.01 * 100_000 * 1.1000 / 100 * 1.20 = 132 USD
        # Free margin = 5000 USD — should pass
        assert result.is_valid

    def test_validate_margin_insufficient(self):
        from execution.order_validator import validate_margin
        result = validate_margin(
            account=_make_account(free_margin=50.0),
            symbol_info=_make_symbol_info(),
            volume=1.0,
            entry_price_estimate=1.1000,
            leverage=100,
            required_free_margin_buffer_pct=20.0,
        )
        # Required: 1.0 * 100_000 * 1.1000 / 100 * 1.20 = 1_320 USD
        # Free margin = 50 USD — must fail
        assert not result.is_valid
        assert "free margin" in result.errors[0].lower()

    def test_validate_margin_zero_leverage_rejected(self):
        from execution.order_validator import validate_margin
        result = validate_margin(
            account=_make_account(), symbol_info=_make_symbol_info(),
            volume=0.01, entry_price_estimate=1.1, leverage=0,
        )
        assert not result.is_valid

    def test_validate_sl_tp_buy_correct(self):
        from execution.order_validator import OrderSide, validate_stop_loss_take_profit
        result = validate_stop_loss_take_profit(
            side=OrderSide.BUY,
            entry_price_estimate=1.1000,
            stop_loss_price=1.0950,
            take_profit_price=1.1100,
            symbol_info=_make_symbol_info(),
        )
        assert result.is_valid

    def test_validate_sl_tp_buy_sl_above_entry_rejected(self):
        from execution.order_validator import OrderSide, validate_stop_loss_take_profit
        result = validate_stop_loss_take_profit(
            side=OrderSide.BUY,
            entry_price_estimate=1.1000,
            stop_loss_price=1.1050,  # SL above entry for BUY — wrong
            take_profit_price=1.1100,
            symbol_info=_make_symbol_info(),
        )
        assert not result.is_valid

    def test_validate_sl_tp_sell_correct(self):
        from execution.order_validator import OrderSide, validate_stop_loss_take_profit
        result = validate_stop_loss_take_profit(
            side=OrderSide.SELL,
            entry_price_estimate=1.1000,
            stop_loss_price=1.1050,
            take_profit_price=1.0900,
            symbol_info=_make_symbol_info(),
        )
        assert result.is_valid

    def test_validate_trading_session_in_session(self):
        from execution.order_validator import validate_trading_session
        # 12:00 UTC is within 08:00-21:00
        now = datetime(2026, 6, 1, 12, 0, 0, tzinfo=timezone.utc)
        result = validate_trading_session(now, "08:00", "21:00")
        assert result.is_valid

    def test_validate_trading_session_outside_session(self):
        from execution.order_validator import validate_trading_session
        # 02:00 UTC is outside 08:00-21:00
        now = datetime(2026, 6, 1, 2, 0, 0, tzinfo=timezone.utc)
        result = validate_trading_session(now, "08:00", "21:00")
        assert not result.is_valid

    def test_validate_trading_session_bad_format_rejected(self):
        from execution.order_validator import validate_trading_session
        now = datetime(2026, 6, 1, 12, 0, 0, tzinfo=timezone.utc)
        result = validate_trading_session(now, "8am", "9pm")
        assert not result.is_valid

    def test_validate_symbol_visible_passes(self):
        from execution.order_validator import validate_symbol
        result = validate_symbol(_make_symbol_info(visible=True), "EURUSD")
        assert result.is_valid

    def test_validate_symbol_not_visible_fails(self):
        from execution.order_validator import validate_symbol
        result = validate_symbol(_make_symbol_info(visible=False), "EURUSD")
        assert not result.is_valid

    def test_validate_symbol_none_fails(self):
        from execution.order_validator import validate_symbol
        result = validate_symbol(None, "EURUSD")
        assert not result.is_valid

    def test_validate_order_aggregates_all_errors(self):
        """When multiple checks fail, all errors are returned at once."""
        from core.state_manager import ConnectionStatus
        from execution.order_validator import OrderRequest, OrderSide, validate_order
        request = OrderRequest(
            symbol="EURUSD", side=OrderSide.BUY, volume=-1.0,
            stop_loss_price=1.1100,  # wrong side for BUY
            take_profit_price=0.9000,
            entry_price_estimate=1.1000,
            magic_number=12345,
        )
        result = validate_order(
            request=request,
            symbol_info=_make_symbol_info(),
            account=_make_account(free_margin=0.01),
            connection_status=ConnectionStatus.CONNECTED,
            current_spread_pips=1.0,
            max_spread_pips=3.0,
            leverage=100,
            now_utc=datetime(2026, 6, 1, 12, 0, tzinfo=timezone.utc),
            session_start_utc="08:00",
            session_end_utc="21:00",
        )
        assert not result.is_valid
        # Multiple checks should have failed: volume, margin, sl/tp
        assert len(result.errors) >= 2


# ---------------------------------------------------------------------------
# trade_manager.py — breakeven and trailing stop pure logic
# ---------------------------------------------------------------------------

class TestBreakevenLogic:

    def _make_position(self, side="BUY", open_price=1.1000, current_price=1.1050,
                        stop_loss=1.0950, take_profit=1.1150, ticket=1001):
        from execution.position_manager import Position
        return Position(
            ticket=ticket, symbol="EURUSD", side=side, volume=0.01,
            open_price=open_price, current_price=current_price,
            stop_loss=stop_loss, take_profit=take_profit,
            profit=50.0, swap=0.0, magic_number=202600001,
            open_time=datetime.now(timezone.utc), comment="test",
        )

    def test_breakeven_not_triggered_yet(self):
        from execution.trade_manager import BreakevenTrigger, evaluate_breakeven
        pos = self._make_position(current_price=1.1010)  # only 10 pips up
        trigger, new_sl = evaluate_breakeven(pos, pip_size=0.0001, trigger_distance_pips=20.0)
        assert trigger == BreakevenTrigger.NOT_YET
        assert new_sl is None

    def test_breakeven_triggered_for_buy(self):
        from execution.trade_manager import BreakevenTrigger, evaluate_breakeven
        pos = self._make_position(current_price=1.1021)  # 21 pips up — exceeds 20 pip trigger
        trigger, new_sl = evaluate_breakeven(pos, pip_size=0.0001, trigger_distance_pips=20.0, lock_in_pips=2.0)
        assert trigger == BreakevenTrigger.TRIGGERED
        assert new_sl == pytest.approx(1.1000 + 2 * 0.0001)

    def test_breakeven_already_set_for_buy(self):
        from execution.trade_manager import BreakevenTrigger, evaluate_breakeven
        pos = self._make_position(current_price=1.1050, stop_loss=1.1001)  # SL already at/above open
        trigger, new_sl = evaluate_breakeven(pos, pip_size=0.0001, trigger_distance_pips=20.0)
        assert trigger == BreakevenTrigger.ALREADY_AT_BREAKEVEN

    def test_breakeven_triggered_for_sell(self):
        from execution.trade_manager import BreakevenTrigger, evaluate_breakeven
        pos = self._make_position(
            side="SELL", open_price=1.1000, current_price=1.0975,
            stop_loss=1.1050,  # SL above open for SELL
        )
        trigger, new_sl = evaluate_breakeven(pos, pip_size=0.0001, trigger_distance_pips=20.0, lock_in_pips=2.0)
        assert trigger == BreakevenTrigger.TRIGGERED
        assert new_sl == pytest.approx(1.1000 - 2 * 0.0001)

    def test_breakeven_invalid_pip_size_raises(self):
        from execution.trade_manager import TradeManagerError, evaluate_breakeven
        pos = self._make_position()
        with pytest.raises(TradeManagerError):
            evaluate_breakeven(pos, pip_size=0.0, trigger_distance_pips=20.0)


class TestTrailingStopLogic:

    def _make_position(self, side="BUY", open_price=1.1000, current_price=1.1050, stop_loss=1.0950):
        from execution.position_manager import Position
        return Position(
            ticket=1002, symbol="EURUSD", side=side, volume=0.01,
            open_price=open_price, current_price=current_price,
            stop_loss=stop_loss, take_profit=1.1200,
            profit=50.0, swap=0.0, magic_number=202600001,
            open_time=datetime.now(timezone.utc), comment="test",
        )

    def test_trailing_not_started_yet(self):
        from execution.trade_manager import evaluate_trailing_stop
        pos = self._make_position(current_price=1.1010)  # only 10 pips, start=20
        decision = evaluate_trailing_stop(pos, pip_size=0.0001, trailing_start_pips=20.0, trailing_step_pips=10.0)
        assert not decision.should_update

    def test_trailing_advances_for_buy(self):
        from execution.trade_manager import evaluate_trailing_stop
        pos = self._make_position(current_price=1.1030, stop_loss=1.0950)  # 30 pips up
        decision = evaluate_trailing_stop(pos, pip_size=0.0001, trailing_start_pips=20.0, trailing_step_pips=10.0)
        assert decision.should_update
        expected_sl = 1.1030 - 10 * 0.0001
        assert decision.new_stop_loss == pytest.approx(expected_sl)

    def test_trailing_does_not_regress(self):
        from execution.trade_manager import evaluate_trailing_stop
        # Candidate SL (1.1015) is worse than current SL (1.1020) — must not update
        pos = self._make_position(current_price=1.1025, stop_loss=1.1020)
        decision = evaluate_trailing_stop(pos, pip_size=0.0001, trailing_start_pips=20.0, trailing_step_pips=10.0)
        assert not decision.should_update

    def test_trailing_advances_for_sell(self):
        from execution.trade_manager import evaluate_trailing_stop
        pos = self._make_position(
            side="SELL", open_price=1.1000, current_price=1.0970, stop_loss=1.1050,
        )  # 30 pips down
        decision = evaluate_trailing_stop(pos, pip_size=0.0001, trailing_start_pips=20.0, trailing_step_pips=10.0)
        assert decision.should_update
        expected_sl = 1.0970 + 10 * 0.0001
        assert decision.new_stop_loss == pytest.approx(expected_sl)

    def test_trailing_invalid_step_raises(self):
        from execution.trade_manager import TradeManagerError, evaluate_trailing_stop
        pos = self._make_position()
        with pytest.raises(TradeManagerError):
            evaluate_trailing_stop(pos, pip_size=0.0001, trailing_start_pips=20.0, trailing_step_pips=0.0)


# ---------------------------------------------------------------------------
# execution_engine.py — queue and submit logic
# ---------------------------------------------------------------------------

class TestExecutionEngineQueue:

    def _make_intent(self, symbol="EURUSD", side_str="BUY", confidence=70.0):
        from execution.execution_engine import TradeIntent
        from execution.order_validator import OrderSide
        return TradeIntent(
            symbol=symbol,
            side=OrderSide.BUY if side_str == "BUY" else OrderSide.SELL,
            stop_loss_price=1.0950,
            take_profit_price=1.1100,
            confidence=confidence,
            magic_number=202600001,
        )

    def test_submit_above_threshold_queues(self):
        from execution.execution_engine import ExecutionEngine
        engine = ExecutionEngine(min_confidence_threshold=65.0)
        intent = self._make_intent(confidence=70.0)
        queued = engine.submit(intent)
        assert queued is True
        assert engine._queue.qsize() == 1

    def test_submit_below_threshold_discards(self):
        from execution.execution_engine import ExecutionEngine
        engine = ExecutionEngine(min_confidence_threshold=65.0)
        intent = self._make_intent(confidence=50.0)
        queued = engine.submit(intent)
        assert queued is False
        assert engine._queue.qsize() == 0

    def test_submit_exactly_at_threshold_queues(self):
        from execution.execution_engine import ExecutionEngine
        engine = ExecutionEngine(min_confidence_threshold=65.0)
        intent = self._make_intent(confidence=65.0)
        queued = engine.submit(intent)
        assert queued is True

    def test_submit_queue_full_discards(self):
        from execution.execution_engine import ExecutionEngine, _QUEUE_MAX_SIZE
        import queue
        engine = ExecutionEngine(min_confidence_threshold=0.0)
        # Fill the queue to capacity with dummy items
        for _ in range(_QUEUE_MAX_SIZE):
            engine._queue.put_nowait(self._make_intent(confidence=100.0))
        # Now the queue is full — next submit should discard
        queued = engine.submit(self._make_intent(confidence=100.0))
        assert queued is False
        with engine._stats_lock:
            assert engine._stats.intents_discarded_queue_full >= 1

    def test_stats_tracks_received(self):
        from execution.execution_engine import ExecutionEngine
        engine = ExecutionEngine(min_confidence_threshold=65.0)
        engine.submit(self._make_intent(confidence=80.0))
        engine.submit(self._make_intent(confidence=30.0))  # below threshold
        stats = engine.stats()
        assert stats["intents_received"] == 2
        assert stats["intents_discarded_low_confidence"] == 1


# ---------------------------------------------------------------------------
# notifications/telegram_service.py — pure logic (no HTTP)
# ---------------------------------------------------------------------------

class TestTelegramEscaping:

    def test_escape_mdv2_escapes_special_chars(self):
        from notifications.telegram_service import _escape_mdv2
        raw = "Hello (World) +1.5% profit!"
        escaped = _escape_mdv2(raw)
        assert "\\(" in escaped
        assert "\\)" in escaped
        assert "\\+" in escaped
        assert "\\." in escaped
        assert "\\!" in escaped

    def test_escape_mdv2_plain_text_unchanged(self):
        from notifications.telegram_service import _escape_mdv2
        raw = "hello world 12345"
        assert _escape_mdv2(raw) == raw

    def test_escape_mdv2_handles_empty_string(self):
        from notifications.telegram_service import _escape_mdv2
        assert _escape_mdv2("") == ""


class TestTelegramServiceDisabledMode:

    def test_disabled_when_no_credentials(self):
        """Service must not crash or attempt sends when token/chat_id absent."""
        with patch("config.TELEGRAM_TOKEN", ""), patch("config.TELEGRAM_CHAT_ID", ""):
            from importlib import reload
            import notifications.telegram_service as ts_mod
            reload(ts_mod)
            svc = ts_mod.TelegramService()
            assert not svc._enabled

    def test_send_message_returns_false_when_disabled(self):
        with patch("config.TELEGRAM_TOKEN", ""), patch("config.TELEGRAM_CHAT_ID", ""):
            from importlib import reload
            import notifications.telegram_service as ts_mod
            reload(ts_mod)
            svc = ts_mod.TelegramService()
            result = svc.send_message("test")
            assert result is False

    def test_start_is_noop_when_disabled(self):
        with patch("config.TELEGRAM_TOKEN", ""), patch("config.TELEGRAM_CHAT_ID", ""):
            from importlib import reload
            import notifications.telegram_service as ts_mod
            reload(ts_mod)
            svc = ts_mod.TelegramService()
            svc.start()  # must not start a thread
            assert svc._sender_thread is None


class TestTelegramServiceEnabled:

    def _make_service(self):
        """Create a TelegramService instance with fake but non-empty credentials."""
        with patch("config.TELEGRAM_TOKEN", "fake_token_for_test"), \
             patch("config.TELEGRAM_CHAT_ID", "123456789"):
            from importlib import reload
            import notifications.telegram_service as ts_mod
            reload(ts_mod)
            return ts_mod.TelegramService()

    def test_enabled_with_credentials(self):
        svc = self._make_service()
        assert svc._enabled

    def test_enqueue_returns_true(self):
        svc = self._make_service()
        result = svc._enqueue("test message")
        assert result is True
        assert svc._queue.qsize() == 1

    def test_send_now_handles_http_error_gracefully(self):
        """A failing HTTP response must return False, not raise."""
        import httpx
        svc = self._make_service()
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"
        mock_response.json.return_value = {}

        with patch("httpx.post", return_value=mock_response):
            from notifications.telegram_service import _OutboundMessage
            result = svc._send_now(_OutboundMessage(text="test"))
        assert result is False

    def test_send_now_returns_true_on_200(self):
        svc = self._make_service()
        mock_response = MagicMock()
        mock_response.status_code = 200

        with patch("httpx.post", return_value=mock_response):
            from notifications.telegram_service import _OutboundMessage
            result = svc._send_now(_OutboundMessage(text="hello"))
        assert result is True

    def test_send_now_respects_rate_limit_retry_after(self):
        svc = self._make_service()
        rate_limit_response = MagicMock()
        rate_limit_response.status_code = 429
        rate_limit_response.json.return_value = {"parameters": {"retry_after": 1}}

        success_response = MagicMock()
        success_response.status_code = 200

        with patch("httpx.post", side_effect=[rate_limit_response, success_response]), \
             patch("time.sleep"):  # don't actually sleep in tests
            from notifications.telegram_service import _OutboundMessage
            result = svc._send_now(_OutboundMessage(text="ratelimited"))
        assert result is True

    def test_send_now_handles_network_error_gracefully(self):
        svc = self._make_service()
        import httpx
        with patch("httpx.post", side_effect=httpx.NetworkError("connection refused")), \
             patch("time.sleep"):
            from notifications.telegram_service import _OutboundMessage
            result = svc._send_now(_OutboundMessage(text="network error test"))
        assert result is False

    def test_event_handler_on_trade_opened_formats_message(self):
        """Event handler must call _enqueue with a non-empty formatted message."""
        svc = self._make_service()
        from core.event_bus import Event
        event = Event(
            name="TRADE_OPENED",
            payload={"symbol": "EURUSD", "side": "BUY", "ticket": 12345,
                     "price": 1.10500, "volume": 0.01, "sl": 1.09500, "tp": 1.11500},
        )
        with patch.object(svc, "_enqueue") as mock_enqueue:
            svc._on_trade_opened(event)
        mock_enqueue.assert_called_once()
        msg = mock_enqueue.call_args[0][0]
        assert "EURUSD" in msg
        assert "BUY" in msg
        assert "12345" in msg

    def test_event_handler_on_sl_hit_formats_message(self):
        svc = self._make_service()
        from core.event_bus import Event
        event = Event(
            name="SL_HIT",
            payload={"symbol": "GBPUSD", "ticket": 99999, "price": 1.2500, "profit": -25.0},
        )
        with patch.object(svc, "_enqueue") as mock_enqueue:
            svc._on_sl_hit(event)
        mock_enqueue.assert_called_once()
        msg = mock_enqueue.call_args[0][0]
        assert "Stop Loss" in msg
        assert "GBPUSD" in msg

    def test_regular_error_event_not_forwarded(self):
        """ERROR events (non-critical) must not trigger a Telegram message."""
        svc = self._make_service()
        from core.event_bus import Event
        event = Event(name="ERROR", payload={"message": "some error"})
        with patch.object(svc, "_enqueue") as mock_enqueue:
            svc._on_error(event)
        mock_enqueue.assert_not_called()

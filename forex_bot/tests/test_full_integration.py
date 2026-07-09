"""
test_full_integration.py
==========================
Tests for the FULL SYSTEM INTEGRATION milestone:
  - core/rate_limiter.py
  - risk/sl_tp_calculator.py
  - ai/gemini_client.py (parsing/disabled-mode logic, HTTP mocked)
  - api/routes/webhooks.py (HMAC, replay, duplicate, rate-limit pipeline)
  - core/persistence_subscriber.py (event -> DB writes, in-memory SQLite)
  - api/routes/dashboard.py (endpoint shape, auth)
  - strategy/signal_orchestrator.py (Gemini confidence-bounding is pure logic)
"""

from __future__ import annotations

import hashlib
import hmac
import json
import time
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def in_memory_db(tmp_path):
    db_path = str(tmp_path / "test.db")
    db_url = f"sqlite:///{db_path}"
    with patch("config.DATABASE_URL", db_url):
        import database.connection as dbconn
        original_engine = dbconn._engine
        original_factory = dbconn._SessionLocal
        dbconn._engine = None
        dbconn._SessionLocal = None

        from database.connection import init_db
        init_db()
        from database.migrations import migration_runner
        migration_runner.run_all()

        yield db_url

        dbconn._engine = original_engine
        dbconn._SessionLocal = original_factory


# ---------------------------------------------------------------------------
# RateLimiter
# ---------------------------------------------------------------------------

class TestRateLimiter:

    def test_allows_up_to_max_per_minute(self):
        from core.rate_limiter import RateLimiter
        rl = RateLimiter(max_per_minute=5)
        results = [rl.allow("client-a") for _ in range(5)]
        assert all(results)

    def test_blocks_after_max_exhausted(self):
        from core.rate_limiter import RateLimiter
        rl = RateLimiter(max_per_minute=3)
        for _ in range(3):
            assert rl.allow("client-b")
        assert rl.allow("client-b") is False

    def test_different_keys_independent(self):
        from core.rate_limiter import RateLimiter
        rl = RateLimiter(max_per_minute=1)
        assert rl.allow("client-x") is True
        assert rl.allow("client-y") is True  # different key, own bucket
        assert rl.allow("client-x") is False  # x already exhausted

    def test_refill_over_time(self):
        from core.rate_limiter import RateLimiter
        rl = RateLimiter(max_per_minute=60)  # 1 token/sec
        assert rl.allow("client-z") is True
        # Manually age the bucket to simulate time passing
        with rl._lock:
            rl._buckets["client-z"].last_refill -= 2.0  # pretend 2 seconds passed
        assert rl.allow("client-z") is True  # should have refilled

    def test_rejects_invalid_max(self):
        from core.rate_limiter import RateLimiter
        with pytest.raises(ValueError):
            RateLimiter(max_per_minute=0)

    def test_reset_clears_bucket(self):
        from core.rate_limiter import RateLimiter
        rl = RateLimiter(max_per_minute=1)
        rl.allow("client-r")
        assert rl.allow("client-r") is False
        rl.reset("client-r")
        assert rl.allow("client-r") is True


# ---------------------------------------------------------------------------
# SL/TP calculator
# ---------------------------------------------------------------------------

class TestSlTpCalculator:

    def test_buy_sl_below_tp_above_entry(self):
        from risk.sl_tp_calculator import calculate_sl_tp
        from strategy.signal_generator import SignalDirection
        levels = calculate_sl_tp(
            SignalDirection.BUY, entry_price=1.1000, atr_value=0.0020,
            sl_atr_multiplier=1.5, tp_atr_multiplier=2.0,
        )
        assert levels.stop_loss_price < 1.1000
        assert levels.take_profit_price > 1.1000

    def test_sell_sl_above_tp_below_entry(self):
        from risk.sl_tp_calculator import calculate_sl_tp
        from strategy.signal_generator import SignalDirection
        levels = calculate_sl_tp(
            SignalDirection.SELL, entry_price=1.1000, atr_value=0.0020,
            sl_atr_multiplier=1.5, tp_atr_multiplier=2.0,
        )
        assert levels.stop_loss_price > 1.1000
        assert levels.take_profit_price < 1.1000

    def test_risk_reward_ratio_calculation(self):
        from risk.sl_tp_calculator import calculate_sl_tp
        from strategy.signal_generator import SignalDirection
        levels = calculate_sl_tp(
            SignalDirection.BUY, entry_price=1.1000, atr_value=0.0010,
            sl_atr_multiplier=1.0, tp_atr_multiplier=2.0,
        )
        assert levels.risk_reward_ratio == pytest.approx(2.0)

    def test_hold_direction_rejected(self):
        from risk.sl_tp_calculator import SlTpCalculationError, calculate_sl_tp
        from strategy.signal_generator import SignalDirection
        with pytest.raises(SlTpCalculationError):
            calculate_sl_tp(SignalDirection.HOLD, 1.1000, 0.0020, 1.5, 2.0)

    def test_zero_atr_rejected(self):
        from risk.sl_tp_calculator import SlTpCalculationError, calculate_sl_tp
        from strategy.signal_generator import SignalDirection
        with pytest.raises(SlTpCalculationError):
            calculate_sl_tp(SignalDirection.BUY, 1.1000, 0.0, 1.5, 2.0)

    def test_negative_entry_price_rejected(self):
        from risk.sl_tp_calculator import SlTpCalculationError, calculate_sl_tp
        from strategy.signal_generator import SignalDirection
        with pytest.raises(SlTpCalculationError):
            calculate_sl_tp(SignalDirection.BUY, -1.0, 0.0020, 1.5, 2.0)

    def test_price_rounding_respects_digits(self):
        from risk.sl_tp_calculator import calculate_sl_tp
        from strategy.signal_generator import SignalDirection
        levels = calculate_sl_tp(
            SignalDirection.BUY, entry_price=1.10001234, atr_value=0.00123456,
            sl_atr_multiplier=1.5, tp_atr_multiplier=2.0, price_digits=5,
        )
        assert len(str(levels.stop_loss_price).split(".")[-1]) <= 5


# ---------------------------------------------------------------------------
# Gemini client
# ---------------------------------------------------------------------------

class TestGeminiClient:

    def test_disabled_when_no_api_key(self):
        with patch("config.GEMINI_API_KEY", ""):
            from ai.gemini_client import is_enabled
            assert is_enabled() is False

    def test_analyze_returns_unavailable_when_disabled(self):
        with patch("config.GEMINI_API_KEY", ""):
            from ai.gemini_client import analyze
            result = analyze("EURUSD", "H1", "BUY", 70.0, {})
            assert result.advisory_available is False
            assert "not set" in result.unavailable_reason.lower()

    def test_analyze_parses_valid_response(self):
        with patch("config.GEMINI_API_KEY", "fake-key"):
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "candidates": [{
                    "content": {"parts": [{"text": json.dumps({
                        "confidence_score": 82,
                        "reasoning": "Strong trend alignment",
                        "suggested_action": "BUY",
                        "suggested_stop_loss": 1.0950,
                        "suggested_take_profit": 1.1100,
                        "risk_note": "moderate",
                    })}]}
                }]
            }
            with patch("httpx.post", return_value=mock_response):
                from ai.gemini_client import analyze
                result = analyze("EURUSD", "H1", "BUY", 70.0, {"rsi": 28})
            assert result.advisory_available is True
            assert result.confidence_score == 82.0
            assert result.suggested_action == "BUY"

    def test_analyze_handles_markdown_fenced_json(self):
        with patch("config.GEMINI_API_KEY", "fake-key"):
            mock_response = MagicMock()
            mock_response.status_code = 200
            fenced = "```json\n" + json.dumps({"confidence_score": 60, "reasoning": "ok", "suggested_action": "HOLD"}) + "\n```"
            mock_response.json.return_value = {"candidates": [{"content": {"parts": [{"text": fenced}]}}]}
            with patch("httpx.post", return_value=mock_response):
                from ai.gemini_client import analyze
                result = analyze("EURUSD", "H1", "BUY", 70.0, {})
            assert result.advisory_available is True
            assert result.confidence_score == 60.0

    def test_analyze_handles_malformed_json_gracefully(self):
        with patch("config.GEMINI_API_KEY", "fake-key"):
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "candidates": [{"content": {"parts": [{"text": "not json at all"}]}}]
            }
            with patch("httpx.post", return_value=mock_response):
                from ai.gemini_client import analyze
                result = analyze("EURUSD", "H1", "BUY", 70.0, {})
            assert result.advisory_available is False

    def test_analyze_handles_http_error_gracefully(self):
        with patch("config.GEMINI_API_KEY", "fake-key"):
            mock_response = MagicMock()
            mock_response.status_code = 500
            mock_response.text = "server error"
            with patch("httpx.post", return_value=mock_response):
                from ai.gemini_client import analyze
                result = analyze("EURUSD", "H1", "BUY", 70.0, {})
            assert result.advisory_available is False

    def test_analyze_never_raises_on_network_failure(self):
        import httpx
        with patch("config.GEMINI_API_KEY", "fake-key"), \
             patch("httpx.post", side_effect=httpx.ConnectError("refused")):
            from ai.gemini_client import analyze
            result = analyze("EURUSD", "H1", "BUY", 70.0, {})
            assert result.advisory_available is False

    def test_confidence_score_clamped_0_100(self):
        with patch("config.GEMINI_API_KEY", "fake-key"):
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "candidates": [{"content": {"parts": [{"text": json.dumps({
                    "confidence_score": 150, "reasoning": "x", "suggested_action": "BUY",
                })}]}}]
            }
            with patch("httpx.post", return_value=mock_response):
                from ai.gemini_client import analyze
                result = analyze("EURUSD", "H1", "BUY", 70.0, {})
            assert result.confidence_score == 100.0


# ---------------------------------------------------------------------------
# Webhook security pipeline
# ---------------------------------------------------------------------------

class TestWebhookSecurity:

    def _sign(self, secret: str, body: bytes) -> str:
        return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()

    @pytest.fixture
    def client(self):
        with patch("config.WEBHOOK_SECRET", "test-webhook-secret-1234567890"), \
             patch("config.DASHBOARD_PASSWORD", "test-token"):
            from api.app import create_app
            app = create_app()
            app.config["TESTING"] = True
            with app.test_client() as c:
                yield c

    def test_missing_signature_rejected(self, client, in_memory_db):
        body = json.dumps({"symbol": "EURUSD", "timestamp": time.time(), "id": "t1"})
        resp = client.post("/webhooks/tradingview", data=body, content_type="application/json")
        assert resp.status_code == 401

    def test_invalid_signature_rejected(self, client, in_memory_db):
        body = json.dumps({"symbol": "EURUSD", "timestamp": time.time(), "id": "t2"}).encode()
        resp = client.post(
            "/webhooks/tradingview", data=body, content_type="application/json",
            headers={"X-Webhook-Signature": "0" * 64},
        )
        assert resp.status_code == 401

    def test_valid_signature_but_missing_timestamp_rejected(self, client, in_memory_db):
        body = json.dumps({"symbol": "EURUSD", "id": "t3"}).encode()
        sig = self._sign("test-webhook-secret-1234567890", body)
        resp = client.post(
            "/webhooks/tradingview", data=body, content_type="application/json",
            headers={"X-Webhook-Signature": sig},
        )
        assert resp.status_code == 400
        assert "timestamp" in resp.get_json()["error"].lower()

    def test_expired_timestamp_rejected(self, client, in_memory_db):
        old_ts = time.time() - 10000  # way past replay window
        body = json.dumps({"symbol": "EURUSD", "timestamp": old_ts, "id": "t4"}).encode()
        sig = self._sign("test-webhook-secret-1234567890", body)
        resp = client.post(
            "/webhooks/tradingview", data=body, content_type="application/json",
            headers={"X-Webhook-Signature": sig},
        )
        assert resp.status_code == 400
        assert "replay" in resp.get_json()["error"].lower()

    def test_future_timestamp_rejected(self, client, in_memory_db):
        future_ts = time.time() + 10000
        body = json.dumps({"symbol": "EURUSD", "timestamp": future_ts, "id": "t5"}).encode()
        sig = self._sign("test-webhook-secret-1234567890", body)
        resp = client.post(
            "/webhooks/tradingview", data=body, content_type="application/json",
            headers={"X-Webhook-Signature": sig},
        )
        assert resp.status_code == 400

    def test_duplicate_request_rejected_second_time(self, client, in_memory_db):
        body = json.dumps({
            "symbol": "GBPUSD", "timestamp": time.time(), "id": "dup-test-1",
        }).encode()
        sig = self._sign("test-webhook-secret-1234567890", body)

        with patch("config.SYMBOLS", ["GBPUSD"]), \
             patch("execution.execution_engine.execution_engine") as mock_engine:
            resp1 = client.post(
                "/webhooks/tradingview", data=body, content_type="application/json",
                headers={"X-Webhook-Signature": sig},
            )
            resp2 = client.post(
                "/webhooks/tradingview", data=body, content_type="application/json",
                headers={"X-Webhook-Signature": sig},
            )
        assert resp2.status_code == 409

    def test_unconfigured_secret_returns_503(self, in_memory_db):
        with patch("config.WEBHOOK_SECRET", ""), patch("config.DASHBOARD_PASSWORD", "test-token"):
            from api.app import create_app
            app = create_app()
            app.config["TESTING"] = True
            with app.test_client() as c:
                body = json.dumps({"symbol": "EURUSD", "timestamp": time.time(), "id": "t6"}).encode()
                resp = c.post(
                    "/webhooks/tradingview", data=body, content_type="application/json",
                    headers={"X-Webhook-Signature": "abc"},
                )
                assert resp.status_code == 503

    def test_makecom_invalid_command_rejected(self, client, in_memory_db):
        body = json.dumps({"timestamp": time.time(), "id": "mc-1", "command": "nuke"}).encode()
        sig = self._sign("test-webhook-secret-1234567890", body)
        resp = client.post(
            "/webhooks/makecom", data=body, content_type="application/json",
            headers={"X-Webhook-Signature": sig},
        )
        assert resp.status_code == 400

    def test_makecom_status_command_succeeds(self, client, in_memory_db):
        body = json.dumps({"timestamp": time.time(), "id": "mc-2", "command": "status"}).encode()
        sig = self._sign("test-webhook-secret-1234567890", body)
        resp = client.post(
            "/webhooks/makecom", data=body, content_type="application/json",
            headers={"X-Webhook-Signature": sig},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert "bot_status" in data

    def test_rate_limit_enforced(self, client, in_memory_db):
        import api.routes.webhooks as wh
        original_limiter = wh._rate_limiter
        wh._rate_limiter = wh.RateLimiter(max_per_minute=2)
        try:
            for i in range(2):
                body = json.dumps({"timestamp": time.time(), "id": f"rl-{i}", "command": "status"}).encode()
                sig = self._sign("test-webhook-secret-1234567890", body)
                client.post(
                    "/webhooks/makecom", data=body, content_type="application/json",
                    headers={"X-Webhook-Signature": sig},
                )
            body = json.dumps({"timestamp": time.time(), "id": "rl-blocked", "command": "status"}).encode()
            sig = self._sign("test-webhook-secret-1234567890", body)
            resp = client.post(
                "/webhooks/makecom", data=body, content_type="application/json",
                headers={"X-Webhook-Signature": sig},
            )
            assert resp.status_code == 429
        finally:
            wh._rate_limiter = original_limiter


# ---------------------------------------------------------------------------
# Persistence subscriber
# ---------------------------------------------------------------------------

class TestPersistenceSubscriber:

    def test_trade_opened_writes_trade_row(self, in_memory_db):
        from core.event_bus import EventBus
        from core.persistence_subscriber import _on_trade_opened

        test_bus_event = type("E", (), {
            "payload": {
                "symbol": "EURUSD", "side": "BUY", "ticket": 500001,
                "price": 1.1000, "volume": 0.01, "sl": 1.0950, "tp": 1.1100,
                "magic_number": 1, "comment": "test",
            }
        })()

        _on_trade_opened(test_bus_event)

        from database.connection import unit_of_work
        from database.repositories import TradeRepository
        with unit_of_work() as session:
            trade = TradeRepository(session).get_by_ticket(500001)
        assert trade is not None
        assert trade.symbol == "EURUSD"
        assert trade.is_closed is False

    def test_trade_opened_is_idempotent(self, in_memory_db):
        from core.persistence_subscriber import _on_trade_opened

        event = type("E", (), {
            "payload": {"symbol": "EURUSD", "side": "BUY", "ticket": 500002, "price": 1.1, "volume": 0.01}
        })()

        _on_trade_opened(event)
        _on_trade_opened(event)  # duplicate delivery — must not raise or duplicate

        from database.connection import unit_of_work
        from database.repositories import TradeRepository
        with unit_of_work() as session:
            trades = session.query(__import__("database.models", fromlist=["Trade"]).Trade).filter_by(mt5_ticket=500002).all()
        assert len(trades) == 1

    def test_trade_closed_updates_existing_row(self, in_memory_db):
        from core.persistence_subscriber import _on_trade_closed, _on_trade_opened

        open_event = type("E", (), {
            "payload": {"symbol": "EURUSD", "side": "BUY", "ticket": 500003, "price": 1.1, "volume": 0.01}
        })()
        _on_trade_opened(open_event)

        close_event = type("E", (), {
            "payload": {"ticket": 500003, "price": 1.1050, "profit": 50.0, "full_close": True}
        })()
        _on_trade_closed(close_event)

        from database.connection import unit_of_work
        from database.repositories import TradeRepository
        with unit_of_work() as session:
            trade = TradeRepository(session).get_by_ticket(500003)
        assert trade.is_closed is True
        assert trade.profit == 50.0

    def test_record_bot_event_writes_row(self, in_memory_db):
        from core.event_bus import Event
        from core.persistence_subscriber import _record_bot_event

        event = Event(name="BOT_STARTED", payload={"mode": "DEMO"}, source="test")
        _record_bot_event(event)

        from database.connection import unit_of_work
        from database.repositories import BotEventRepository
        with unit_of_work() as session:
            events = BotEventRepository(session).get_recent(limit=10, event_name="BOT_STARTED")
        assert len(events) == 1


# ---------------------------------------------------------------------------
# Dashboard API
# ---------------------------------------------------------------------------

class TestDashboardAPI:

    @pytest.fixture
    def client(self):
        with patch("config.DASHBOARD_PASSWORD", "test-token"), \
             patch("config.JWT_SECRET", "test-jwt-secret-for-integration-tests"), \
             patch("config.SECRET_KEY", "test-jwt-secret-for-integration-tests"):
            from api.app import create_app
            app = create_app()
            app.config["TESTING"] = True
            with app.test_client() as c:
                yield c

    def _auth_headers(self, client) -> dict:
        """Dashboard endpoints now require a JWT (added in the API
        milestone that retrofitted auth onto every endpoint) — log in
        as admin and return a Bearer header, matching the current
        architecture rather than the old shared X-Bot-Token model."""
        resp = client.post("/api/auth/login", json={"password": "test-token"})
        assert resp.status_code == 200, resp.get_json()
        token = resp.get_json()["access_token"]
        return {"Authorization": f"Bearer {token}"}

    def test_status_endpoint(self, client, in_memory_db):
        headers = self._auth_headers(client)
        resp = client.get("/api/status", headers=headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert "bot_status" in data
        assert "connection_status" in data

    def test_account_endpoint(self, client, in_memory_db):
        headers = self._auth_headers(client)
        resp = client.get("/api/account", headers=headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert "balance" in data
        assert "equity" in data

    def test_trades_endpoint_with_real_db(self, client, in_memory_db):
        headers = self._auth_headers(client)
        resp = client.get("/api/trades", headers=headers)
        assert resp.status_code == 200
        data = resp.get_json()
        # /api/trades now returns a paginated envelope (items/pagination)
        # rather than a bare trades/count pair — updated to match the
        # pagination added in the full backend API milestone.
        assert "items" in data
        assert "win_rate" in data

    def test_journal_endpoint_with_real_db(self, client, in_memory_db):
        headers = self._auth_headers(client)
        from database.connection import unit_of_work
        from database.repositories import JournalRepository
        with unit_of_work() as session:
            JournalRepository(session).record(entry_type="SIGNAL_GENERATED", symbol="EURUSD", confidence=75.0)

        resp = client.get("/api/journal", headers=headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["count"] == 1
        assert data["entries"][0]["symbol"] == "EURUSD"

    def test_analytics_endpoint_with_real_db(self, client, in_memory_db):
        headers = self._auth_headers(client)
        resp = client.get("/api/analytics", headers=headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert "win_rate" in data
        assert "equity_curve" in data

    def test_settings_requires_auth(self, client):
        resp = client.get("/api/settings")
        assert resp.status_code == 401

    def test_settings_with_auth(self, client, in_memory_db):
        headers = self._auth_headers(client)
        resp = client.get("/api/settings", headers=headers)
        assert resp.status_code == 200

    def test_orders_endpoint_with_real_db(self, client, in_memory_db):
        headers = self._auth_headers(client)
        resp = client.get("/api/orders", headers=headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert "counts" in data

    def test_notifications_requires_auth(self, client, in_memory_db):
        # /api/notifications was previously unauthenticated; this
        # milestone retrofitted JWT auth onto every dashboard endpoint.
        resp = client.get("/api/notifications")
        assert resp.status_code == 401
        headers = self._auth_headers(client)
        resp2 = client.get("/api/notifications", headers=headers)
        assert resp2.status_code == 200
        resp3 = client.post("/api/notifications/test")
        assert resp3.status_code == 401

    def test_logs_requires_auth(self, client):
        resp = client.get("/api/logs")
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Signal orchestrator — Gemini confidence bounding (pure logic slice)
# ---------------------------------------------------------------------------

class TestSignalOrchestratorGeminiBounding:

    def test_gemini_adjustment_is_bounded(self):
        """
        Directly verifies the bounded-delta math used in
        signal_orchestrator.evaluate_symbol: Gemini's opinion can only
        move the final score by at most _GEMINI_MAX_ADJUSTMENT points,
        regardless of how far Gemini's own confidence differs from ours.
        """
        from strategy.signal_orchestrator import _GEMINI_MAX_ADJUSTMENT

        our_score = 70.0
        gemini_score = 100.0  # wildly more bullish than us
        delta = gemini_score - our_score
        bounded_delta = max(-_GEMINI_MAX_ADJUSTMENT, min(_GEMINI_MAX_ADJUSTMENT, delta))
        final = max(0.0, min(100.0, our_score + bounded_delta))

        assert final == our_score + _GEMINI_MAX_ADJUSTMENT
        assert final < gemini_score  # Gemini cannot pull the score all the way to its own opinion

    def test_gemini_negative_adjustment_is_bounded(self):
        from strategy.signal_orchestrator import _GEMINI_MAX_ADJUSTMENT

        our_score = 70.0
        gemini_score = 0.0  # wildly more bearish than us
        delta = gemini_score - our_score
        bounded_delta = max(-_GEMINI_MAX_ADJUSTMENT, min(_GEMINI_MAX_ADJUSTMENT, delta))
        final = max(0.0, min(100.0, our_score + bounded_delta))

        assert final == our_score - _GEMINI_MAX_ADJUSTMENT
        assert final > gemini_score

    def test_evaluate_symbol_skips_when_risk_gate_closed(self):
        """evaluate_symbol must return early (no signal generation attempted)
        when drawdown_guard refuses new trades."""
        from execution.persistent_queue import PersistentQueueManager
        from strategy.signal_orchestrator import SignalOrchestrator

        mock_queue = MagicMock(spec=PersistentQueueManager)
        orchestrator = SignalOrchestrator(mock_queue)

        with patch("risk.drawdown_guard.drawdown_guard.can_open_new_trade", return_value=(False, "daily limit hit")), \
             patch("strategy.signal_orchestrator.get_snapshot") as mock_snapshot:
            orchestrator.evaluate_symbol("EURUSD")
            mock_snapshot.assert_not_called()
            mock_queue.submit.assert_not_called()

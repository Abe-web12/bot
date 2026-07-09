"""
test_api_layer.py
====================
Tests for the complete backend API milestone:
  - api/auth.py (JWT issue/refresh/revoke/RBAC)
  - api/rate_limit.py
  - api/cache.py
  - api/query_utils.py (pagination, sorting, CSV/XLSX export)
  - core/bot_controller.py
  - core/performance_metrics.py (Sharpe ratio)
  - api/routes/{auth,bot,market,strategy,risk,database}.py
  - api/routes/dashboard.py (retrofitted JWT auth, pagination, export, manual close)
"""

from __future__ import annotations

import time
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest


@pytest.fixture(autouse=True)
def _reset_rate_limiters():
    """
    api/rate_limit.py's limiters are intentionally process-wide
    singletons (that's what makes rate limiting actually work in
    production). That same property means test cases sharing one Flask
    test client from the same source IP will otherwise accumulate
    bucket state across unrelated tests and eventually trip the limit
    for reasons unrelated to whatever a given test is checking. Reset
    before and after every test in this module for isolation.
    """
    import api.rate_limit as rl
    rl._default_limiter.reset_all()
    rl._login_limiter.reset_all()
    yield
    rl._default_limiter.reset_all()
    rl._login_limiter.reset_all()


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


@pytest.fixture
def app_client():
    with patch("config.DASHBOARD_PASSWORD", "admin-pass-123"), \
         patch("config.VIEWER_PASSWORD", "viewer-pass-123"), \
         patch("config.JWT_SECRET", "test-jwt-secret-key-for-testing-only"), \
         patch("config.SECRET_KEY", "test-jwt-secret-key-for-testing-only"):
        from api.app import create_app
        app = create_app()
        app.config["TESTING"] = True
        with app.test_client() as c:
            yield c


def _login(client, password: str) -> dict:
    resp = client.post("/api/auth/login", json={"password": password})
    assert resp.status_code == 200, resp.get_json()
    return resp.get_json()


def _auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# api/auth.py — pure JWT logic
# ---------------------------------------------------------------------------

class TestAuthCore:

    def test_authenticate_credentials_admin(self):
        with patch("config.DASHBOARD_PASSWORD", "admin123"), patch("config.VIEWER_PASSWORD", ""):
            from api.auth import authenticate_credentials
            assert authenticate_credentials("admin123") == "admin"

    def test_authenticate_credentials_viewer(self):
        with patch("config.DASHBOARD_PASSWORD", "admin123"), patch("config.VIEWER_PASSWORD", "view456"):
            from api.auth import authenticate_credentials
            assert authenticate_credentials("view456") == "viewer"

    def test_authenticate_credentials_wrong_password(self):
        with patch("config.DASHBOARD_PASSWORD", "admin123"), patch("config.VIEWER_PASSWORD", ""):
            from api.auth import authenticate_credentials
            assert authenticate_credentials("wrong") is None

    def test_viewer_disabled_when_blank(self):
        with patch("config.DASHBOARD_PASSWORD", "admin123"), patch("config.VIEWER_PASSWORD", ""):
            from api.auth import authenticate_credentials
            assert authenticate_credentials("") is None

    def test_issue_token_pair_and_decode(self, in_memory_db):
        with patch("config.JWT_SECRET", "test-secret"), patch("config.SECRET_KEY", "test-secret"):
            from api.auth import decode_access_token, issue_token_pair
            tokens = issue_token_pair("admin")
            payload = decode_access_token(tokens.access_token)
            assert payload["role"] == "admin"
            assert payload["type"] == "access"

    def test_decode_rejects_refresh_token_as_access(self, in_memory_db):
        with patch("config.JWT_SECRET", "test-secret"), patch("config.SECRET_KEY", "test-secret"):
            from api.auth import AuthError, decode_access_token, issue_token_pair
            tokens = issue_token_pair("admin")
            with pytest.raises(AuthError):
                decode_access_token(tokens.refresh_token)

    def test_refresh_rotates_token_and_invalidates_old(self, in_memory_db):
        with patch("config.JWT_SECRET", "test-secret"), patch("config.SECRET_KEY", "test-secret"):
            from api.auth import AuthError, issue_token_pair, refresh_access_token
            tokens = issue_token_pair("admin")
            new_tokens = refresh_access_token(tokens.refresh_token)
            assert new_tokens.access_token != tokens.access_token
            with pytest.raises(AuthError, match="already been used"):
                refresh_access_token(tokens.refresh_token)

    def test_revoke_refresh_token_prevents_reuse(self, in_memory_db):
        with patch("config.JWT_SECRET", "test-secret"), patch("config.SECRET_KEY", "test-secret"):
            from api.auth import AuthError, issue_token_pair, refresh_access_token, revoke_refresh_token
            tokens = issue_token_pair("admin")
            revoke_refresh_token(tokens.refresh_token)
            with pytest.raises(AuthError):
                refresh_access_token(tokens.refresh_token)

    def test_missing_secret_raises_503(self):
        with patch("config.JWT_SECRET", ""), patch("config.SECRET_KEY", ""):
            from api.auth import AuthError, issue_token_pair
            with pytest.raises(AuthError) as exc_info:
                issue_token_pair("admin")
            assert exc_info.value.status == 503


# ---------------------------------------------------------------------------
# Login / refresh / logout / me — full HTTP flow
# ---------------------------------------------------------------------------

class TestAuthEndpoints:

    def test_login_success_admin(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        assert data["role"] == "admin"
        assert "access_token" in data
        assert "refresh_token" in data

    def test_login_success_viewer(self, app_client, in_memory_db):
        data = _login(app_client, "viewer-pass-123")
        assert data["role"] == "viewer"

    def test_login_wrong_password(self, app_client, in_memory_db):
        resp = app_client.post("/api/auth/login", json={"password": "nope"})
        assert resp.status_code == 401

    def test_login_missing_password(self, app_client, in_memory_db):
        resp = app_client.post("/api/auth/login", json={})
        assert resp.status_code == 400

    def test_me_requires_token(self, app_client):
        resp = app_client.get("/api/auth/me")
        assert resp.status_code == 401

    def test_me_with_valid_token(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/auth/me", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        assert resp.get_json()["role"] == "admin"

    def test_refresh_endpoint(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.post("/api/auth/refresh", json={"refresh_token": data["refresh_token"]})
        assert resp.status_code == 200
        new_data = resp.get_json()
        assert new_data["access_token"] != data["access_token"]

    def test_logout_revokes_refresh_token(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        app_client.post("/api/auth/logout", json={"refresh_token": data["refresh_token"]})
        resp = app_client.post("/api/auth/refresh", json={"refresh_token": data["refresh_token"]})
        assert resp.status_code == 401

    def test_login_rate_limited(self, app_client, in_memory_db):
        import api.rate_limit as rl
        rl._login_limiter = rl.RateLimiter(max_per_minute=2)
        try:
            for _ in range(2):
                app_client.post("/api/auth/login", json={"password": "wrong"})
            resp = app_client.post("/api/auth/login", json={"password": "wrong"})
            assert resp.status_code == 429
        finally:
            rl._login_limiter = rl.RateLimiter(max_per_minute=10)


# ---------------------------------------------------------------------------
# RBAC enforcement
# ---------------------------------------------------------------------------

class TestRBAC:

    def test_viewer_can_read_status(self, app_client, in_memory_db):
        data = _login(app_client, "viewer-pass-123")
        resp = app_client.get("/api/status", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200

    def test_viewer_cannot_start_bot(self, app_client, in_memory_db):
        data = _login(app_client, "viewer-pass-123")
        resp = app_client.post("/api/bot/start", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 403

    def test_viewer_cannot_update_settings(self, app_client, in_memory_db):
        data = _login(app_client, "viewer-pass-123")
        resp = app_client.post(
            "/api/settings", json={"key": "RSI_PERIOD", "value": 20},
            headers=_auth_headers(data["access_token"]),
        )
        assert resp.status_code == 403

    def test_admin_can_access_admin_only_endpoint(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/logs", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200

    def test_no_token_rejected(self, app_client):
        resp = app_client.get("/api/status")
        assert resp.status_code == 401

    def test_malformed_token_rejected(self, app_client):
        resp = app_client.get("/api/status", headers={"Authorization": "Bearer garbage.token.here"})
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# api/query_utils.py
# ---------------------------------------------------------------------------

class TestQueryUtils:

    def test_paginate_list_basic(self):
        from api.query_utils import PageRequest, paginate_list
        items = list(range(25))
        result = paginate_list(items, PageRequest(page=2, page_size=10))
        assert result["items"] == list(range(10, 20))
        assert result["pagination"]["total_items"] == 25
        assert result["pagination"]["total_pages"] == 3
        assert result["pagination"]["has_next"] is True
        assert result["pagination"]["has_previous"] is True

    def test_sort_dicts_ascending(self):
        from api.query_utils import sort_dicts
        items = [{"v": 3}, {"v": 1}, {"v": 2}]
        result = sort_dicts(items, "v", descending=False)
        assert [d["v"] for d in result] == [1, 2, 3]

    def test_sort_dicts_none_last(self):
        from api.query_utils import sort_dicts
        items = [{"v": 2}, {"v": None}, {"v": 1}]
        result = sort_dicts(items, "v", descending=False)
        assert result[-1]["v"] is None

    def test_export_csv_produces_header_and_rows(self):
        from api.query_utils import export_csv
        rows = [{"a": 1, "b": "x"}, {"a": 2, "b": "y"}]
        csv_bytes = export_csv(rows, ["a", "b"])
        text = csv_bytes.decode("utf-8")
        assert "a,b" in text
        assert "1,x" in text

    def test_export_xlsx_produces_valid_workbook(self):
        from api.query_utils import export_xlsx
        rows = [{"a": 1, "b": "x"}]
        xlsx_bytes = export_xlsx(rows, ["a", "b"])
        assert xlsx_bytes[:2] == b"PK"  # xlsx is a zip archive


# ---------------------------------------------------------------------------
# api/rate_limit.py and api/cache.py
# ---------------------------------------------------------------------------

class TestApiRateLimitAndCache:

    def test_rate_limited_decorator_blocks_after_limit(self, app_client, in_memory_db):
        import api.rate_limit as rl
        rl._default_limiter = rl.RateLimiter(max_per_minute=2)
        data = _login(app_client, "admin-pass-123")
        headers = _auth_headers(data["access_token"])
        try:
            app_client.get("/api/status", headers=headers)
            app_client.get("/api/status", headers=headers)
            resp = app_client.get("/api/status", headers=headers)
            assert resp.status_code == 429
        finally:
            rl._default_limiter = rl.RateLimiter(max_per_minute=120)

    def test_cache_returns_same_response_within_ttl(self):
        from api.cache import TTLCache
        cache = TTLCache()
        cache.set("k", "v1", ttl_seconds=10)
        assert cache.get("k") == "v1"

    def test_cache_expires_after_ttl(self):
        from api.cache import TTLCache
        cache = TTLCache()
        cache.set("k", "v1", ttl_seconds=0.01)
        time.sleep(0.05)
        assert cache.get("k") is None


# ---------------------------------------------------------------------------
# core/performance_metrics.py — Sharpe ratio
# ---------------------------------------------------------------------------

class TestSharpeRatio:

    def test_insufficient_data_returns_none(self):
        from core.performance_metrics import calculate_sharpe_ratio
        result = calculate_sharpe_ratio([1000.0], snapshot_interval_seconds=3600)
        assert result.sharpe_ratio is None

    def test_zero_variance_returns_none(self):
        from core.performance_metrics import calculate_sharpe_ratio
        result = calculate_sharpe_ratio([1000.0, 1000.0, 1000.0, 1000.0], snapshot_interval_seconds=3600)
        assert result.sharpe_ratio is None
        assert "undefined" in result.note.lower()

    def test_positive_trend_gives_positive_sharpe(self):
        from core.performance_metrics import calculate_sharpe_ratio
        values = [1000 + i * 2 + (0.1 if i % 2 == 0 else -0.05) for i in range(20)]
        result = calculate_sharpe_ratio(values, snapshot_interval_seconds=3600)
        assert result.sharpe_ratio is not None
        assert result.sharpe_ratio > 0

    def test_negative_trend_gives_negative_sharpe(self):
        from core.performance_metrics import calculate_sharpe_ratio
        values = [1000 - i * 2 + (0.1 if i % 2 == 0 else -0.05) for i in range(20)]
        result = calculate_sharpe_ratio(values, snapshot_interval_seconds=3600)
        assert result.sharpe_ratio is not None
        assert result.sharpe_ratio < 0

    def test_invalid_interval_raises(self):
        from core.performance_metrics import calculate_sharpe_ratio
        with pytest.raises(ValueError):
            calculate_sharpe_ratio([1.0, 2.0, 3.0], snapshot_interval_seconds=0)


# ---------------------------------------------------------------------------
# TradeRepository — profit factor and expectancy additions
# ---------------------------------------------------------------------------

class TestTradeRepositoryNewMetrics:

    def _add_trade(self, session, ticket: int, profit: float):
        import uuid
        from database.models import Trade
        from database.repositories import TradeRepository
        TradeRepository(session).save(Trade(
            id=str(uuid.uuid4()), mt5_ticket=ticket, symbol="EURUSD", side="BUY",
            open_price=1.1, close_price=1.1 + profit / 100000, volume=0.01,
            profit=profit, magic_number=1, open_time=datetime.now(timezone.utc),
            close_time=datetime.now(timezone.utc), is_closed=True,
        ))

    def test_profit_factor_with_wins_and_losses(self, in_memory_db):
        from database.connection import unit_of_work
        from database.repositories import TradeRepository

        with unit_of_work() as session:
            self._add_trade(session, 1, 100.0)
            self._add_trade(session, 2, -50.0)

        with unit_of_work() as session:
            result = TradeRepository(session).profit_factor()
        assert result["gross_profit"] == 100.0
        assert result["gross_loss"] == 50.0
        assert result["profit_factor"] == 2.0

    def test_profit_factor_no_losses_returns_none(self, in_memory_db):
        from database.connection import unit_of_work
        from database.repositories import TradeRepository

        with unit_of_work() as session:
            self._add_trade(session, 3, 100.0)

        with unit_of_work() as session:
            result = TradeRepository(session).profit_factor()
        assert result["profit_factor"] is None

    def test_expectancy_calculation(self, in_memory_db):
        from database.connection import unit_of_work
        from database.repositories import TradeRepository

        with unit_of_work() as session:
            self._add_trade(session, 4, 100.0)
            self._add_trade(session, 5, -50.0)

        with unit_of_work() as session:
            result = TradeRepository(session).expectancy()
        assert result["expectancy"] == pytest.approx(25.0)


# ---------------------------------------------------------------------------
# core/bot_controller.py
# ---------------------------------------------------------------------------

class TestBotController:

    def _make_controller(self):
        from core.bot_controller import BotController
        controller = BotController()
        mock_engine = MagicMock()
        mock_engine.is_running.return_value = False
        mock_queue = MagicMock()
        mock_orchestrator = MagicMock()
        mock_orchestrator._thread = None
        controller.bind(mock_engine, mock_queue, mock_orchestrator)
        return controller, mock_engine, mock_orchestrator

    def test_unbound_controller_raises(self):
        from core.bot_controller import BotController, BotControllerError
        controller = BotController()
        with pytest.raises(BotControllerError):
            controller.start_trading()

    def test_start_trading_requires_connection(self):
        controller, engine, orchestrator = self._make_controller()
        from core.state_manager import ConnectionStatus, state
        original = state._connection_status
        try:
            state._connection_status = ConnectionStatus.DISCONNECTED
            from core.bot_controller import BotControllerError
            with pytest.raises(BotControllerError):
                controller.start_trading()
        finally:
            state._connection_status = original

    def test_start_trading_succeeds_when_connected(self):
        controller, engine, orchestrator = self._make_controller()
        from core.state_manager import BotStatus, ConnectionStatus, state
        original_conn = state._connection_status
        original_status = state._bot_status
        try:
            state._connection_status = ConnectionStatus.CONNECTED
            state._bot_status = BotStatus.STOPPED
            result = controller.start_trading()
            assert result["status"] == "started"
            orchestrator.start.assert_called_once()
        finally:
            state._connection_status = original_conn
            state._bot_status = original_status

    def test_pause_and_resume(self):
        controller, engine, orchestrator = self._make_controller()
        from core.state_manager import BotStatus, ConnectionStatus, state
        original_conn = state._connection_status
        original_status = state._bot_status
        try:
            state._connection_status = ConnectionStatus.CONNECTED
            controller.pause_trading(reason="test")
            assert state.bot_status == BotStatus.PAUSED
            controller.resume_trading()
            assert state.bot_status == BotStatus.RUNNING
        finally:
            state._connection_status = original_conn
            state._bot_status = original_status

    def test_cannot_resume_from_killed(self):
        controller, engine, orchestrator = self._make_controller()
        from core.bot_controller import BotControllerError
        from core.state_manager import BotStatus, ConnectionStatus, state
        original_conn = state._connection_status
        original_status = state._bot_status
        try:
            state._connection_status = ConnectionStatus.CONNECTED
            state._bot_status = BotStatus.KILLED
            with pytest.raises(BotControllerError, match="KILLED"):
                controller.resume_trading()
        finally:
            state._connection_status = original_conn
            state._bot_status = original_status

    def test_kill_switch_sets_killed_status(self):
        controller, engine, orchestrator = self._make_controller()
        from core.state_manager import BotStatus, state
        original_status = state._bot_status
        try:
            result = controller.kill_switch(reason="test_kill")
            assert result["status"] == "killed"
            assert state.bot_status == BotStatus.KILLED
        finally:
            state._bot_status = original_status

    def test_emergency_stop_closes_positions(self):
        controller, engine, orchestrator = self._make_controller()
        from core.state_manager import BotStatus, state
        original_status = state._bot_status

        fake_position = MagicMock()
        fake_position.ticket = 12345

        try:
            with patch("execution.position_manager.position_manager.get_open_positions", return_value=[fake_position]), \
                 patch("execution.trade_manager.execute_full_close") as mock_close:
                result = controller.emergency_stop(reason="test_emergency")
                assert result["positions_closed"] == 1
                mock_close.assert_called_once_with(fake_position)
                assert state.bot_status == BotStatus.KILLED
        finally:
            state._bot_status = original_status

    def test_status_reports_bound_state(self):
        controller, engine, orchestrator = self._make_controller()
        status = controller.status()
        assert status["is_bound"] is True


# ---------------------------------------------------------------------------
# api/routes/bot.py
# ---------------------------------------------------------------------------

class TestBotRoutes:

    def test_bot_status_endpoint(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/bot/status", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        assert "bot_status" in resp.get_json()

    def test_bot_start_without_binding_returns_409(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        with patch("core.bot_controller.bot_controller._is_bound", False):
            resp = app_client.post("/api/bot/start", headers=_auth_headers(data["access_token"]))
            assert resp.status_code == 409

    def test_bot_kill_switch_requires_admin(self, app_client, in_memory_db):
        data = _login(app_client, "viewer-pass-123")
        resp = app_client.post("/api/bot/kill-switch", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 403


# ---------------------------------------------------------------------------
# api/routes/market.py — structure/error-path tests (no live MT5)
# ---------------------------------------------------------------------------

class TestMarketRoutes:

    def test_invalid_symbol_rejected(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/market/price/NOTASYMBOL", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 400

    def test_session_endpoint_returns_real_utc_time(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/market/session", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        body = resp.get_json()
        assert "server_time_utc" in body

    def test_news_status_is_honest_about_not_being_configured(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/market/news-status", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        body = resp.get_json()
        assert body["configured"] is False


# ---------------------------------------------------------------------------
# api/routes/risk.py
# ---------------------------------------------------------------------------

class TestRiskRoutes:

    def test_current_risk_endpoint_structure(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/risk/current", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        body = resp.get_json()
        assert "daily_loss_pct" in body
        assert "risk_gate" in body


# ---------------------------------------------------------------------------
# api/routes/database.py
# ---------------------------------------------------------------------------

class TestDatabaseRoutes:

    def test_database_status_endpoint(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/database/status", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        body = resp.get_json()
        assert body["connected"] is True
        assert "migration_version" in body


# ---------------------------------------------------------------------------
# api/routes/dashboard.py — retrofitted auth + new pagination/export/manual-close
# ---------------------------------------------------------------------------

class TestDashboardRetrofit:

    def test_trades_requires_auth(self, app_client):
        resp = app_client.get("/api/trades")
        assert resp.status_code == 401

    def test_trades_paginated_response_shape(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/trades", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        body = resp.get_json()
        assert "items" in body
        assert "pagination" in body

    def test_trades_invalid_sort_field_rejected(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get(
            "/api/trades?sort=not_a_real_field",
            headers=_auth_headers(data["access_token"]),
        )
        assert resp.status_code == 400

    def test_trades_export_csv(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/trades/export.csv", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        assert resp.mimetype == "text/csv"

    def test_trades_export_xlsx(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/trades/export.xlsx", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200

    def test_manual_close_nonexistent_ticket_404(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        with patch("execution.position_manager.position_manager.get_position_by_ticket", return_value=None):
            resp = app_client.post(
                "/api/trades/999999/close", headers=_auth_headers(data["access_token"]),
            )
        assert resp.status_code == 404

    def test_manual_close_requires_admin(self, app_client, in_memory_db):
        data = _login(app_client, "viewer-pass-123")
        resp = app_client.post("/api/trades/1/close", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 403

    def test_analytics_includes_new_metrics(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/analytics", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        body = resp.get_json()
        assert "profit_factor" in body
        assert "expectancy" in body
        assert "sharpe_ratio" in body

    def test_notification_queue_endpoint(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/notifications/queue", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        assert "queue_depth" in resp.get_json()

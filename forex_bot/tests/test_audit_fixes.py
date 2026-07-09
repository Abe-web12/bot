"""
test_audit_fixes.py
====================
Tests that verify every fix applied during the post-audit remediation.

Covers:
  1. UserSession bug fix — _register_user_session uses real UserSession model
  2. Peak equity persistence — load_peak_equity() reads from DB
  3. floating_profit field present in /api/account response
  4. JWT secret CRITICAL (not WARNING) in startup validator
  5. monthly_pnl PostgreSQL-compatible dialect branching
  6. News filter — is_news_blackout fails open on fetch error
  7. News filter — correctly identifies blackout window
  8. News filter — disabled when FILTER_NEWS=False
  9. Migration v17 seeds subscription plans
 10. CORS restricted origins (not wildcard)
 11. WebSocket softDisconnect does not set destroyed=true
 12. Subscription plan limit enforcement on workspace creation
 13. Subscription plan limit enforcement on API key creation
 14. authenticatedDownload exists and does not use query param token
"""

from __future__ import annotations

import json
import time
from datetime import datetime, timedelta, timezone
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


@pytest.fixture
def app_client(in_memory_db):
    with patch("config.DASHBOARD_PASSWORD", "admin-pass-123"), \
         patch("config.VIEWER_PASSWORD", "viewer-pass-123"), \
         patch("config.JWT_SECRET", "test-jwt-secret-key-for-testing-only-32chars"), \
         patch("config.SECRET_KEY", "test-jwt-secret-key-for-testing-only-32chars"):
        from api.app import create_app
        app = create_app()
        app.config["TESTING"] = True
        with app.test_client() as c:
            yield c


def _login(client, password="admin-pass-123"):
    resp = client.post("/api/auth/login", json={"password": password})
    assert resp.status_code == 200, resp.get_json()
    return resp.get_json()


def _auth(token):
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Fix 1: UserSession bug — _register_user_session uses real UserSession model
# ---------------------------------------------------------------------------

class TestUserSessionFix:

    def test_register_user_session_uses_real_model(self, in_memory_db):
        """
        create_user_token_pair must persist a real UserSession row,
        not raise UnmappedInstanceError from an anonymous class.
        """
        with patch("config.USER_JWT_SECRET", "test-user-secret-32chars-minimum-ok"), \
             patch("config.JWT_SECRET", "test-user-secret-32chars-minimum-ok"), \
             patch("config.SECRET_KEY", "test-user-secret-32chars-minimum-ok"):

            # Simulate a Flask request context so request.remote_addr is available
            from api.app import create_app
            app = create_app()
            with app.test_request_context("/"):
                from api.auth import create_user_token_pair
                # Must not raise UnmappedInstanceError
                tokens = create_user_token_pair("test-user-id-001", "trader")
                assert tokens.access_token
                assert tokens.refresh_token

            # Verify the session was actually persisted
            from database.connection import unit_of_work
            from database.repositories import UserSessionRepository
            with unit_of_work() as session:
                record = UserSessionRepository(session).get_by_jti(
                    # decode the refresh token to get the jti
                    __import__("jwt").decode(
                        tokens.refresh_token,
                        "test-user-secret-32chars-minimum-ok",
                        algorithms=["HS256"],
                    )["jti"]
                )
                assert record is not None
                assert record.user_id == "test-user-id-001"
                assert record.is_revoked is False

    def test_user_session_revoked_on_logout(self, in_memory_db):
        """Refresh token revocation must mark the UserSession as revoked."""
        with patch("config.USER_JWT_SECRET", "test-user-secret-32chars-minimum-ok"), \
             patch("config.JWT_SECRET", "test-user-secret-32chars-minimum-ok"), \
             patch("config.SECRET_KEY", "test-user-secret-32chars-minimum-ok"):

            from api.app import create_app
            app = create_app()
            with app.test_request_context("/"):
                from api.auth import create_user_token_pair, revoke_user_session
                tokens = create_user_token_pair("test-user-id-002", "trader")
                revoke_user_session(tokens.refresh_token)

            import jwt as pyjwt
            jti = pyjwt.decode(
                tokens.refresh_token,
                "test-user-secret-32chars-minimum-ok",
                algorithms=["HS256"],
            )["jti"]

            from database.connection import unit_of_work
            from database.repositories import UserSessionRepository
            with unit_of_work() as session:
                record = UserSessionRepository(session).get_by_jti(jti)
                assert record is not None
                assert record.is_revoked is True


# ---------------------------------------------------------------------------
# Fix 2: Peak equity persistence
# ---------------------------------------------------------------------------

class TestPeakEquityPersistence:

    def test_load_peak_equity_reads_from_db(self, in_memory_db):
        """load_peak_equity() must restore peak from equity_snapshots table."""
        from database.connection import unit_of_work
        from database.models import EquitySnapshot
        from database.repositories import EquitySnapshotRepository

        # Insert a snapshot with a known equity value
        with unit_of_work() as session:
            EquitySnapshotRepository(session).save(EquitySnapshot(
                balance=9500.0, equity=10500.0, margin=100.0,
                free_margin=9400.0, drawdown_pct=0.0, open_trades=0,
                snapshotted_at=datetime.now(timezone.utc),
            ))

        from risk.drawdown_guard import DrawdownGuard
        guard = DrawdownGuard()
        assert guard.peak_equity is None  # not loaded yet

        guard.load_peak_equity()
        assert guard.peak_equity == 10500.0

    def test_load_peak_equity_falls_back_to_live_when_no_snapshots(self, in_memory_db):
        """When no snapshots exist, load_peak_equity falls back to live equity."""
        from core.state_manager import StateManager
        sm = StateManager()
        sm.update_account(balance=5000.0, equity=5100.0, margin=0.0, free_margin=5100.0, margin_level=0.0)

        from risk.drawdown_guard import DrawdownGuard
        guard = DrawdownGuard()

        with patch("risk.drawdown_guard.state", sm):
            guard.load_peak_equity()

        assert guard.peak_equity == 5100.0

    def test_load_peak_equity_survives_db_error(self):
        """load_peak_equity must not raise even if DB is unavailable."""
        from risk.drawdown_guard import DrawdownGuard
        guard = DrawdownGuard()

        with patch("risk.drawdown_guard.state") as mock_state:
            mock_state.account.equity = 0.0
            with patch("database.connection.unit_of_work", side_effect=Exception("DB down")):
                guard.load_peak_equity()  # must not raise

        assert guard.peak_equity is None


# ---------------------------------------------------------------------------
# Fix 3: floating_profit in /api/account
# ---------------------------------------------------------------------------

class TestAccountFloatingProfit:

    def test_account_endpoint_includes_floating_profit(self, app_client):
        data = _login(app_client)
        resp = app_client.get("/api/account", headers=_auth(data["access_token"]))
        assert resp.status_code == 200
        body = resp.get_json()
        assert "floating_profit" in body
        # floating_profit = equity - balance; both default to 0 in test state
        assert isinstance(body["floating_profit"], (int, float))


# ---------------------------------------------------------------------------
# Fix 4: JWT secret is CRITICAL in startup validator
# ---------------------------------------------------------------------------

class TestJwtSecretCritical:

    def test_missing_jwt_secret_is_critical(self):
        with patch("config.SECRET_KEY", ""):
            from core.startup_validator import StartupValidator, Severity
            validator = StartupValidator()
            result = validator._check_jwt_secret()
            assert not result.passed
            assert result.severity == Severity.CRITICAL

    def test_weak_jwt_secret_is_critical(self):
        with patch("config.SECRET_KEY", "short"):
            from core.startup_validator import StartupValidator, Severity
            validator = StartupValidator()
            result = validator._check_jwt_secret()
            assert not result.passed
            assert result.severity == Severity.CRITICAL

    def test_strong_jwt_secret_passes(self):
        with patch("config.SECRET_KEY", "a" * 32):
            from core.startup_validator import StartupValidator
            validator = StartupValidator()
            result = validator._check_jwt_secret()
            assert result.passed

    def test_missing_jwt_secret_blocks_startup(self):
        """A missing JWT secret must block startup (can_start=False)."""
        from core.startup_validator import CheckResult, Severity, StartupReport
        report = StartupReport()
        report.checks = [
            CheckResult("jwt_secret", Severity.CRITICAL, False, "missing"),
        ]
        assert report.can_start is False


# ---------------------------------------------------------------------------
# Fix 5: monthly_pnl PostgreSQL-compatible
# ---------------------------------------------------------------------------

class TestMonthlyPnlDialect:

    def test_monthly_pnl_sqlite_path(self, in_memory_db):
        """monthly_pnl must work on SQLite without error."""
        from database.connection import unit_of_work
        from database.repositories import TradeRepository
        with unit_of_work() as session:
            result = TradeRepository(session).monthly_pnl(2025, 1)
        assert result == 0.0

    def test_monthly_pnl_uses_strftime_for_sqlite(self, in_memory_db):
        """Verify the SQLite branch is taken for sqlite dialect."""
        from database.connection import unit_of_work
        from database.repositories import TradeRepository
        with unit_of_work() as session:
            bind = session.get_bind()
            assert bind.dialect.name == "sqlite"
            # Should not raise
            result = TradeRepository(session).monthly_pnl(2025, 6)
        assert isinstance(result, float)


# ---------------------------------------------------------------------------
# Fix 6-8: News filter
# ---------------------------------------------------------------------------

class TestNewsFilter:

    def test_fails_open_on_fetch_error(self):
        """is_news_blackout must return False (allow trading) when fetch fails."""
        from market.news_filter import NewsFilter
        nf = NewsFilter()
        with patch("config.FILTER_NEWS", True), \
             patch.object(nf, "_fetch_and_parse", side_effect=Exception("network error")):
            # Force stale so it tries to fetch
            nf._last_fetch = 0.0
            result = nf.is_news_blackout("EURUSD")
        assert result is False

    def test_disabled_when_filter_news_false(self):
        """is_news_blackout must return False when FILTER_NEWS=False."""
        from market.news_filter import NewsFilter
        nf = NewsFilter()
        with patch("config.FILTER_NEWS", False):
            result = nf.is_news_blackout("EURUSD")
        assert result is False

    def test_blackout_active_within_window(self):
        """is_news_blackout returns True when inside the pause window."""
        from market.news_filter import NewsFilter, NewsEvent
        nf = NewsFilter()
        now = datetime.now(timezone.utc)
        # Event 10 minutes from now; pause window is 30 min before
        event_time = now + timedelta(minutes=10)
        nf._events = [
            NewsEvent(title="NFP", currency="USD", impact="High", event_time=event_time)
        ]
        nf._last_fetch = time.monotonic()  # mark as fresh

        with patch("config.FILTER_NEWS", True), \
             patch("config.NEWS_PAUSE_MINUTES", 30), \
             patch("config.NEWS_RESUME_MINUTES", 30), \
             patch("config.HIGH_IMPACT_ONLY", True):
            result = nf.is_news_blackout("EURUSD")
        assert result is True

    def test_no_blackout_outside_window(self):
        """is_news_blackout returns False when event is far in the future."""
        from market.news_filter import NewsFilter, NewsEvent
        nf = NewsFilter()
        now = datetime.now(timezone.utc)
        event_time = now + timedelta(hours=5)
        nf._events = [
            NewsEvent(title="CPI", currency="USD", impact="High", event_time=event_time)
        ]
        nf._last_fetch = time.monotonic()

        with patch("config.FILTER_NEWS", True), \
             patch("config.NEWS_PAUSE_MINUTES", 30), \
             patch("config.NEWS_RESUME_MINUTES", 30), \
             patch("config.HIGH_IMPACT_ONLY", True):
            result = nf.is_news_blackout("EURUSD")
        assert result is False

    def test_medium_impact_ignored_when_high_only(self):
        """Medium-impact events are ignored when HIGH_IMPACT_ONLY=True."""
        from market.news_filter import NewsFilter, NewsEvent
        nf = NewsFilter()
        now = datetime.now(timezone.utc)
        event_time = now + timedelta(minutes=5)
        nf._events = [
            NewsEvent(title="Retail Sales", currency="USD", impact="Medium", event_time=event_time)
        ]
        nf._last_fetch = time.monotonic()

        with patch("config.FILTER_NEWS", True), \
             patch("config.NEWS_PAUSE_MINUTES", 30), \
             patch("config.NEWS_RESUME_MINUTES", 30), \
             patch("config.HIGH_IMPACT_ONLY", True):
            result = nf.is_news_blackout("EURUSD")
        assert result is False

    def test_symbol_to_currencies_mapping(self):
        """_symbol_to_currencies must return correct pairs."""
        from market.news_filter import _symbol_to_currencies
        assert _symbol_to_currencies("EURUSD") == ["EUR", "USD"]
        assert _symbol_to_currencies("GBPJPY") == ["GBP", "JPY"]
        assert _symbol_to_currencies("UNKNOWN") == ["UNK", "NOW"]  # generic fallback

    def test_parse_ff_datetime_valid(self):
        """_parse_ff_datetime must parse ForexFactory date/time strings."""
        from market.news_filter import _parse_ff_datetime
        dt = _parse_ff_datetime("01-06-2025", "8:30am")
        assert dt is not None
        assert dt.year == 2025
        assert dt.month == 1
        assert dt.day == 6
        assert dt.hour == 8
        assert dt.minute == 30

    def test_parse_ff_datetime_all_day(self):
        """All Day events default to midnight UTC."""
        from market.news_filter import _parse_ff_datetime
        dt = _parse_ff_datetime("06-15-2025", "All Day")
        assert dt is not None
        assert dt.hour == 0
        assert dt.minute == 0


# ---------------------------------------------------------------------------
# Fix 9: Migration v17 seeds subscription plans
# ---------------------------------------------------------------------------

class TestMigrationV17:

    def test_subscription_plans_seeded(self, in_memory_db):
        """After run_all(), subscription_plans table must have 4 rows."""
        from database.connection import unit_of_work
        from database.repositories import SubscriptionPlanRepository
        with unit_of_work() as session:
            plans = SubscriptionPlanRepository(session).get_active_plans()
        plan_ids = {p.plan_id for p in plans}
        assert "free" in plan_ids
        assert "starter" in plan_ids
        assert "pro" in plan_ids
        assert "enterprise" in plan_ids

    def test_free_plan_features_json_parseable(self, in_memory_db):
        """Free plan features_json must be valid JSON with expected keys."""
        from database.connection import unit_of_work
        from database.repositories import SubscriptionPlanRepository
        with unit_of_work() as session:
            plan = SubscriptionPlanRepository(session).get_by_plan_id("free")
        assert plan is not None
        features = json.loads(plan.features_json)
        assert "max_workspaces" in features
        assert "max_api_keys" in features
        assert features["max_api_keys"] == 0

    def test_migration_idempotent_with_v17(self, in_memory_db):
        """Running migrations twice must not duplicate plan rows."""
        from database.migrations import migration_runner
        migration_runner.run_all()  # second run

        from database.connection import unit_of_work
        from database.repositories import SubscriptionPlanRepository
        with unit_of_work() as session:
            plans = SubscriptionPlanRepository(session).get_active_plans()
        assert len(plans) == 4


# ---------------------------------------------------------------------------
# Fix 10: CORS restricted origins
# ---------------------------------------------------------------------------

class TestCorsRestricted:

    def test_cors_not_wildcard(self):
        """CORS must not be configured with wildcard '*' origin."""
        with patch("config.SITE_URL", "https://dashboard.example.com"), \
             patch("config.JWT_SECRET", "test-jwt-secret-key-for-testing-only-32chars"), \
             patch("config.SECRET_KEY", "test-jwt-secret-key-for-testing-only-32chars"), \
             patch("config.DASHBOARD_PASSWORD", "test-pass"):
            from api.app import create_app
            app = create_app()

        # Inspect the CORS extension configuration
        from flask_cors import CORS
        # The app must have been created without wildcard — verify by checking
        # that a request from an unlisted origin does NOT get ACAO: *
        with app.test_client() as c:
            resp = c.get("/health", headers={"Origin": "https://evil.example.com"})
            acao = resp.headers.get("Access-Control-Allow-Origin", "")
            assert acao != "*", "CORS must not allow all origins with wildcard"


# ---------------------------------------------------------------------------
# Fix 11: WebSocket softDisconnect
# ---------------------------------------------------------------------------

class TestWebSocketSoftDisconnect:
    """Tests run in a non-browser environment so we mock WebSocket."""

    def test_soft_disconnect_does_not_set_destroyed(self):
        """softDisconnect must not set destroyed=true."""
        # This is a TypeScript class — we verify the logic by reading the source
        import os
        ws_client_path = os.path.join(
            os.path.dirname(__file__),
            "..", "..", "dashboard", "src", "lib", "websocket-client.ts"
        )
        ws_client_path = os.path.normpath(ws_client_path)
        if os.path.exists(ws_client_path):
            with open(ws_client_path, "r") as f:
                source = f.read()
            # softDisconnect must NOT contain "destroyed = true"
            assert "softDisconnect" in source
            # Find the softDisconnect method body and verify it doesn't set destroyed
            soft_idx = source.index("softDisconnect")
            # Get the next 500 chars after softDisconnect definition
            snippet = source[soft_idx:soft_idx + 500]
            assert "destroyed = true" not in snippet, \
                "softDisconnect must not set destroyed=true"
            # disconnect() MUST set destroyed=true
            disc_idx = source.rindex("disconnect()")
            disc_snippet = source[disc_idx:disc_idx + 200]
            assert "destroyed = true" in disc_snippet, \
                "disconnect() must set destroyed=true"


# ---------------------------------------------------------------------------
# Fix 12: Workspace plan limit enforcement
# ---------------------------------------------------------------------------

class TestWorkspacePlanLimits:

    def test_workspace_creation_blocked_at_plan_limit(self, app_client, in_memory_db):
        """Creating more workspaces than the plan allows must return 403."""
        # Register a user (gets free plan: max_workspaces=1)
        resp = app_client.post("/api/auth/register", json={
            "email": "ws_limit@test.com",
            "password": "password123",
            "username": "wslimituser",
        })
        assert resp.status_code == 201

        # Login
        resp = app_client.post("/api/auth/login", json={
            "email": "ws_limit@test.com",
            "password": "password123",
        })
        assert resp.status_code == 200
        token = resp.get_json()["access_token"]

        # First workspace already created on registration (default workspace)
        # Trying to create another must be blocked by free plan limit (max=1)
        resp = app_client.post(
            "/api/workspaces",
            json={"name": "Second Workspace"},
            headers=_auth(token),
        )
        assert resp.status_code == 403
        assert "limit" in resp.get_json()["error"].lower()


# ---------------------------------------------------------------------------
# Fix 13: API key plan limit enforcement
# ---------------------------------------------------------------------------

class TestApiKeyPlanLimits:

    def test_api_key_creation_blocked_on_free_plan(self, app_client, in_memory_db):
        """Free plan has max_api_keys=0, so creating any key must return 403."""
        resp = app_client.post("/api/auth/register", json={
            "email": "apikey_limit@test.com",
            "password": "password123",
            "username": "apikeylimituser",
        })
        assert resp.status_code == 201

        resp = app_client.post("/api/auth/login", json={
            "email": "apikey_limit@test.com",
            "password": "password123",
        })
        assert resp.status_code == 200
        token = resp.get_json()["access_token"]

        resp = app_client.post(
            "/api/users/me/api-keys",
            json={"name": "My Key"},
            headers=_auth(token),
        )
        assert resp.status_code == 403
        assert "limit" in resp.get_json()["error"].lower()


# ---------------------------------------------------------------------------
# Fix 14: authenticatedDownload — no JWT in URL query param
# ---------------------------------------------------------------------------

class TestAuthenticatedDownload:

    def test_authenticated_download_function_exists(self):
        """authenticatedDownload must be exported from api-client.ts."""
        import os
        api_client_path = os.path.normpath(os.path.join(
            os.path.dirname(__file__),
            "..", "..", "dashboard", "src", "lib", "api-client.ts"
        ))
        if os.path.exists(api_client_path):
            with open(api_client_path, "r") as f:
                source = f.read()
            assert "authenticatedDownload" in source, \
                "authenticatedDownload must be exported from api-client.ts"
            # Must use Authorization header, not URL query param
            assert "Authorization" in source
            # getDownloadUrl must NOT append token as query param
            get_dl_idx = source.index("getDownloadUrl")
            snippet = source[get_dl_idx:get_dl_idx + 300]
            assert "searchParams.set" not in snippet, \
                "getDownloadUrl must not append JWT as URL query param"

    def test_export_csv_endpoint_requires_auth_header(self, app_client, in_memory_db):
        """CSV export must require Authorization header, not URL token."""
        # Without auth header — must return 401
        resp = app_client.get("/api/trades/export.csv")
        assert resp.status_code == 401

        # With valid auth header — must return 200
        data = _login(app_client)
        resp = app_client.get(
            "/api/trades/export.csv",
            headers=_auth(data["access_token"]),
        )
        assert resp.status_code == 200
        assert resp.mimetype == "text/csv"


# ---------------------------------------------------------------------------
# Fix: news-status endpoint reflects real filter state
# ---------------------------------------------------------------------------

class TestNewsStatusEndpoint:

    def test_news_status_reflects_filter_config(self, app_client, in_memory_db):
        data = _login(app_client)
        resp = app_client.get(
            "/api/market/news-status",
            headers=_auth(data["access_token"]),
        )
        assert resp.status_code == 200
        body = resp.get_json()
        assert "filter_enabled" in body
        assert "configured" in body
        # configured must match FILTER_NEWS config value
        import config
        assert body["filter_enabled"] == config.FILTER_NEWS

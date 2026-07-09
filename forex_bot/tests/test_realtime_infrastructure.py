"""
test_realtime_infrastructure.py
==================================
Tests for the real-time dashboard infrastructure milestone.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

import pytest


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


@pytest.fixture(autouse=True)
def _reset_rate_limiters():
    import api.rate_limit as rl
    rl._default_limiter.reset_all()
    rl._login_limiter.reset_all()
    yield
    rl._default_limiter.reset_all()
    rl._login_limiter.reset_all()


@pytest.fixture
def app_client():
    with patch("config.DASHBOARD_PASSWORD", "admin-pass-123"), \
         patch("config.VIEWER_PASSWORD", "viewer-pass-123"), \
         patch("config.JWT_SECRET", "test-jwt-secret-for-realtime-tests"), \
         patch("config.SECRET_KEY", "test-jwt-secret-for-realtime-tests"):
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
# EventSequencer
# ---------------------------------------------------------------------------

class TestEventSequencer:

    def test_sequence_increases_monotonically(self):
        from api.websocket_manager import EventSequencer
        seq = EventSequencer()
        e1 = seq.emit("TEST", "ch1", {})
        e2 = seq.emit("TEST", "ch1", {})
        assert e2.sequence == e1.sequence + 1

    def test_each_event_has_unique_event_id(self):
        from api.websocket_manager import EventSequencer
        seq = EventSequencer()
        e1 = seq.emit("TEST", "ch1", {})
        e2 = seq.emit("TEST", "ch1", {})
        assert e1.event_id != e2.event_id

    def test_replay_returns_events_after_sequence(self):
        from api.websocket_manager import EventSequencer
        seq = EventSequencer()
        seq.emit("A", "ch1", {})
        e2 = seq.emit("B", "ch1", {})
        seq.emit("C", "ch1", {})

        events, incomplete = seq.replay("ch1", since_sequence=e2.sequence - 1)
        assert len(events) == 2
        assert not incomplete

    def test_replay_channel_isolation(self):
        from api.websocket_manager import EventSequencer
        seq = EventSequencer()
        seq.emit("A", "ch1", {})
        seq.emit("B", "ch2", {})

        events, _ = seq.replay("ch1", since_sequence=0)
        assert len(events) == 1
        assert events[0].event == "A"

    def test_replay_incomplete_when_buffer_evicted(self):
        from api.websocket_manager import EventSequencer
        seq = EventSequencer(buffer_size=3)
        for i in range(5):
            seq.emit(f"E{i}", "ch1", {})
        events, incomplete = seq.replay("ch1", since_sequence=0)
        assert incomplete is True

    def test_replay_empty_channel_returns_empty_not_error(self):
        from api.websocket_manager import EventSequencer
        seq = EventSequencer()
        events, incomplete = seq.replay("never_used", since_sequence=0)
        assert events == []
        assert incomplete is False

    def test_current_sequence_reflects_emitted_count(self):
        from api.websocket_manager import EventSequencer
        seq = EventSequencer()
        seq.emit("A", "ch1", {})
        seq.emit("B", "ch1", {})
        assert seq.current_sequence() == 2

    def test_is_duplicate_detects_seen_event_id(self):
        from api.websocket_manager import EventSequencer
        seq = EventSequencer()
        dto = seq.emit("A", "ch1", {})
        assert seq.is_duplicate(dto.event_id) is True
        assert seq.is_duplicate("never-seen-id") is False


# ---------------------------------------------------------------------------
# ConnectionManager
# ---------------------------------------------------------------------------

class TestConnectionManager:

    def _make_manager(self):
        from api.websocket_manager import ConnectionManager
        return ConnectionManager()

    def test_connect_assigns_unique_conn_id(self):
        mgr = self._make_manager()
        sent = []
        id1 = mgr.connect(ws=object(), role="admin", send_fn=sent.append)
        id2 = mgr.connect(ws=object(), role="admin", send_fn=sent.append)
        assert id1 != id2
        assert mgr.connection_count() == 2

    def test_disconnect_removes_connection(self):
        mgr = self._make_manager()
        conn_id = mgr.connect(ws=object(), role="admin", send_fn=lambda m: None)
        mgr.disconnect(conn_id)
        assert mgr.connection_count() == 0

    def test_subscribe_and_broadcast_delivers_only_to_subscribers(self):
        mgr = self._make_manager()
        received_a, received_b = [], []
        conn_a = mgr.connect(ws=object(), role="admin", send_fn=received_a.append)
        conn_b = mgr.connect(ws=object(), role="admin", send_fn=received_b.append)

        mgr.subscribe(conn_a, "trades")
        mgr.subscribe(conn_b, "signals")

        mgr.broadcast("TRADE_OPENED", "trades", {"symbol": "EURUSD"})

        assert len(received_a) == 1
        assert len(received_b) == 0

    def test_unsubscribed_connection_receives_nothing(self):
        mgr = self._make_manager()
        received = []
        mgr.connect(ws=object(), role="admin", send_fn=received.append)
        mgr.broadcast("TRADE_OPENED", "trades", {"symbol": "EURUSD"})
        assert received == []

    def test_unsubscribe_stops_further_delivery(self):
        mgr = self._make_manager()
        received = []
        conn_id = mgr.connect(ws=object(), role="admin", send_fn=received.append)
        mgr.subscribe(conn_id, "trades")
        mgr.broadcast("EVENT1", "trades", {})
        mgr.unsubscribe(conn_id, "trades")
        mgr.broadcast("EVENT2", "trades", {})
        assert len(received) == 1

    def test_broadcast_buffers_even_with_zero_subscribers(self):
        mgr = self._make_manager()
        mgr.broadcast("EVENT1", "trades", {})
        events, _ = mgr.sequencer.replay("trades", since_sequence=0)
        assert len(events) == 1

    def test_backpressure_drops_connection_after_repeated_failures(self):
        mgr = self._make_manager()

        def failing_send(msg):
            raise ConnectionError("broken pipe")

        conn_id = mgr.connect(ws=object(), role="admin", send_fn=failing_send)
        mgr.subscribe(conn_id, "trades")

        mgr.broadcast("E1", "trades", {})
        mgr.broadcast("E2", "trades", {})
        mgr.broadcast("E3", "trades", {})

        assert mgr.connection_count() == 0

    def test_acknowledge_updates_last_ack(self):
        mgr = self._make_manager()
        conn_id = mgr.connect(ws=object(), role="admin", send_fn=lambda m: None)
        mgr.acknowledge(conn_id, "some-event-id")
        metrics = mgr.connection_metrics()
        conn_entry = next(c for c in metrics["connections"] if c["conn_id"] == conn_id)
        assert conn_entry is not None

    def test_send_replay_reports_incomplete_flag(self):
        mgr = self._make_manager()
        received = []
        conn_id = mgr.connect(ws=object(), role="admin", send_fn=received.append)
        mgr.broadcast("E1", "trades", {})
        summary = mgr.send_replay(conn_id, "trades", since_sequence=0)
        assert summary["replay_incomplete"] is False
        assert summary["events_sent"] == 1

    def test_send_replay_unknown_connection_raises(self):
        from api.websocket_manager import WebSocketManagerError
        mgr = self._make_manager()
        with pytest.raises(WebSocketManagerError):
            mgr.send_replay("unknown-conn-id", "trades", 0)

    def test_connection_metrics_reports_per_channel_counts(self):
        mgr = self._make_manager()
        conn_a = mgr.connect(ws=object(), role="admin", send_fn=lambda m: None)
        conn_b = mgr.connect(ws=object(), role="viewer", send_fn=lambda m: None)
        mgr.subscribe(conn_a, "trades")
        mgr.subscribe(conn_b, "trades")
        mgr.subscribe(conn_b, "signals")

        metrics = mgr.connection_metrics()
        assert metrics["subscriptions_per_channel"]["trades"] == 2
        assert metrics["subscriptions_per_channel"]["signals"] == 1
        assert metrics["total_connections"] == 2

    def test_heartbeat_drops_stale_connections(self):
        from api.websocket_manager import HEARTBEAT_TIMEOUT_S
        mgr = self._make_manager()
        conn_id = mgr.connect(ws=object(), role="admin", send_fn=lambda m: None)

        with mgr._lock:
            conn = mgr._connections[conn_id]
            conn.metrics.last_seen -= (HEARTBEAT_TIMEOUT_S + 10)

        mgr._run_heartbeat_cycle()
        assert mgr.connection_count() == 0

    def test_heartbeat_keeps_fresh_connections(self):
        mgr = self._make_manager()
        pings = []
        mgr.connect(ws=object(), role="admin", send_fn=pings.append)
        mgr._run_heartbeat_cycle()
        assert mgr.connection_count() == 1
        assert len(pings) == 1


# ---------------------------------------------------------------------------
# api/dto.py
# ---------------------------------------------------------------------------

class TestDTOs:

    def test_account_dto_to_dict(self):
        from api.dto import AccountDTO
        dto = AccountDTO(
            balance=1000.0, equity=1010.0, margin=50.0, free_margin=960.0,
            margin_level=2020.0, currency="USD", floating_profit=10.0,
            drawdown_pct=0.5, daily_loss_pct=0.0, open_positions=1,
        )
        d = dto.to_dict()
        assert d["balance"] == 1000.0
        assert d["currency"] == "USD"

    def test_event_dto_new_generates_unique_id_and_timestamp(self):
        from api.dto import EventDTO
        dto = EventDTO.new(sequence=1, event="TEST", channel="ch1", payload={"a": 1})
        assert dto.event_id
        assert dto.sequence == 1
        assert isinstance(dto.occurred_at, datetime)

    def test_event_dto_to_dict_serializes_datetime(self):
        from api.dto import EventDTO
        dto = EventDTO.new(sequence=1, event="TEST", channel="ch1", payload={})
        d = dto.to_dict()
        assert isinstance(d["occurred_at"], str)

    def test_paged_response_dto(self):
        from api.dto import PaginationMetaDTO, PagedResponseDTO
        meta = PaginationMetaDTO(page=1, page_size=10, total_items=25, total_pages=3)
        resp = PagedResponseDTO(items=[1, 2, 3], pagination=meta)
        d = resp.to_dict()
        assert d["pagination"]["total_pages"] == 3
        assert d["items"] == [1, 2, 3]

    def test_error_dto_defaults(self):
        from api.dto import ErrorDTO
        dto = ErrorDTO(error="Not found", status=404)
        assert dto.to_dict()["detail"] == ""


# ---------------------------------------------------------------------------
# services/services.py
# ---------------------------------------------------------------------------

class TestServices:

    def test_account_service_returns_dto(self, in_memory_db):
        from services.services import AccountService
        with patch("execution.position_manager.position_manager.get_open_positions", return_value=[]):
            dto = AccountService().get_account()
        assert dto.balance >= 0
        assert dto.floating_profit == 0.0

    def test_account_service_sums_floating_profit(self, in_memory_db):
        from services.services import AccountService
        fake_pos_1 = MagicMock(profit=10.0)
        fake_pos_2 = MagicMock(profit=-5.0)
        with patch("execution.position_manager.position_manager.get_open_positions",
                   return_value=[fake_pos_1, fake_pos_2]):
            dto = AccountService().get_account()
        assert dto.floating_profit == 5.0

    def test_account_service_tolerates_position_read_failure(self, in_memory_db):
        from services.services import AccountService
        with patch("execution.position_manager.position_manager.get_open_positions",
                   side_effect=RuntimeError("mt5 down")):
            dto = AccountService().get_account()
        assert dto.floating_profit == 0.0

    def test_trade_service_get_recent_closed_empty_db(self, in_memory_db):
        from services.services import TradeService
        trades = TradeService().get_recent_closed(limit=10)
        assert trades == []

    def test_analytics_service_statistics_empty_db(self, in_memory_db):
        from services.services import AnalyticsService
        stats = AnalyticsService().get_statistics()
        assert stats.win_rate.total == 0
        assert stats.profit_factor is None

    def test_notification_service_queue_status(self, in_memory_db):
        from services.services import NotificationService
        status = NotificationService().queue_status()
        assert "telegram_enabled" in status
        assert "queue_depth" in status

    def test_health_service_summary_structure(self, in_memory_db):
        from services.services import HealthService
        summary = HealthService().get_health_summary()
        assert "bot_status" in summary
        assert "database_ok" in summary

    def test_dashboard_service_aggregates_everything(self, in_memory_db):
        from services.services import DashboardService
        with patch("execution.position_manager.position_manager.get_open_positions", return_value=[]):
            snapshot = DashboardService().get_dashboard_snapshot()
        assert "account" in snapshot
        assert "positions" in snapshot
        assert "statistics" in snapshot
        assert "health" in snapshot


# ---------------------------------------------------------------------------
# core/background_workers.py
# ---------------------------------------------------------------------------

class TestBackgroundWorkers:

    def test_cleanup_worker_calls_repository_cleanup(self, in_memory_db):
        from core.background_workers import CleanupWorker
        CleanupWorker().run_once()

    def test_cleanup_worker_actually_removes_expired_idempotency_records(self, in_memory_db):
        from database.connection import unit_of_work
        from database.repositories import IdempotencyRepository

        past = datetime.now(timezone.utc) - timedelta(days=1)
        with unit_of_work() as session:
            IdempotencyRepository(session).try_acquire("expired-key", "test", expires_at=past)

        from core.background_workers import CleanupWorker
        CleanupWorker().run_once()

        with unit_of_work() as session:
            from database.models import IdempotencyRecord
            assert session.get(IdempotencyRecord, "expired-key") is None

    def test_dashboard_tick_worker_skips_when_bot_not_running(self, in_memory_db):
        from core.background_workers import DashboardTickWorker
        from core.state_manager import BotStatus, state
        original = state._bot_status
        try:
            state._bot_status = BotStatus.STOPPED
            worker = DashboardTickWorker()
            with patch.object(worker, "_publish_account_tick") as mock_pub:
                worker.run_once()
                mock_pub.assert_not_called()
        finally:
            state._bot_status = original

    def test_dashboard_tick_worker_publishes_when_running(self, in_memory_db):
        from core.background_workers import DashboardTickWorker
        from core.state_manager import BotStatus, state
        original = state._bot_status
        try:
            state._bot_status = BotStatus.RUNNING
            worker = DashboardTickWorker()
            with patch("execution.position_manager.position_manager.get_open_positions", return_value=[]):
                events_received = []
                from core.event_bus import bus
                bus.subscribe("ACCOUNT_TICK", lambda e: events_received.append(e))
                worker.run_once()
            assert len(events_received) == 1
        finally:
            state._bot_status = original

    def test_cache_warm_worker_does_not_raise_on_empty_db(self, in_memory_db):
        from core.background_workers import CacheWarmWorker
        CacheWarmWorker().run_once()

    def test_worker_manager_start_stop_lifecycle(self, in_memory_db):
        from core.background_workers import WorkerManager
        mgr = WorkerManager()
        mgr.dashboard_tick._interval = 100
        mgr.cleanup._interval = 100
        mgr.cache_warm._interval = 100
        mgr.start()
        try:
            status = mgr.status()
            assert status["cleanup"] is True
            assert status["cache_warm"] is True
        finally:
            mgr.stop()


# ---------------------------------------------------------------------------
# core/audit.py + AuditLogRepository
# ---------------------------------------------------------------------------

class TestAudit:

    def test_record_action_writes_row(self, in_memory_db):
        from core.audit import record_action
        record_action("TEST_ACTION", role="admin", success=True, ip_address="1.2.3.4")

        from database.connection import unit_of_work
        from database.repositories import AuditLogRepository
        with unit_of_work() as session:
            entries = AuditLogRepository(session).get_recent(limit=10, action="TEST_ACTION")
        assert len(entries) == 1
        assert entries[0].ip_address == "1.2.3.4"

    def test_record_action_never_raises_on_db_failure(self):
        from core.audit import record_action
        with patch("database.connection.unit_of_work", side_effect=RuntimeError("db down")):
            record_action("TEST_ACTION")

    def test_count_failed_logins_since(self, in_memory_db):
        from database.connection import unit_of_work
        from database.repositories import AuditLogRepository

        now = datetime.now(timezone.utc)
        with unit_of_work() as session:
            repo = AuditLogRepository(session)
            repo.record("LOGIN", success=False, ip_address="9.9.9.9")
            repo.record("LOGIN", success=False, ip_address="9.9.9.9")
            repo.record("LOGIN", success=True, ip_address="9.9.9.9")

        with unit_of_work() as session:
            count = AuditLogRepository(session).count_failed_logins_since(
                now - timedelta(minutes=5), ip_address="9.9.9.9"
            )
        assert count == 2

    def test_login_endpoint_records_failed_attempt(self, app_client, in_memory_db):
        app_client.post("/api/auth/login", json={"password": "wrong"})

        from database.connection import unit_of_work
        from database.repositories import AuditLogRepository
        with unit_of_work() as session:
            entries = AuditLogRepository(session).get_recent(limit=10, action="LOGIN")
        assert any(not e.success for e in entries)

    def test_permission_denied_auto_audited(self, app_client, in_memory_db):
        data = _login(app_client, "viewer-pass-123")
        app_client.post("/api/bot/start", headers=_auth_headers(data["access_token"]))

        from database.connection import unit_of_work
        from database.repositories import AuditLogRepository
        with unit_of_work() as session:
            entries = AuditLogRepository(session).get_recent(limit=10, action="PERMISSION_DENIED")
        assert len(entries) >= 1


# ---------------------------------------------------------------------------
# api/routes/charts.py
# ---------------------------------------------------------------------------

class TestChartRoutes:

    def test_equity_curve_empty_db_returns_empty_series(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/charts/equity-curve", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        assert resp.get_json()["series"] == []

    def test_heatmap_returns_168_cells(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/charts/heatmap", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        cells = resp.get_json()["cells"]
        assert len(cells) == 7 * 24

    def test_heatmap_empty_cells_have_null_win_rate_not_zero(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/charts/heatmap", headers=_auth_headers(data["access_token"]))
        cells = resp.get_json()["cells"]
        assert all(c["win_rate_pct"] is None for c in cells if c["trade_count"] == 0)

    def test_win_loss_distribution_structure(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/charts/win-loss-distribution", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        assert "histogram" in resp.get_json()

    def test_session_performance_uses_configured_windows(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/charts/session-performance", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        assert "sessions" in resp.get_json()

    def test_charts_require_auth(self, app_client):
        resp = app_client.get("/api/charts/equity-curve")
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# api/routes/security.py
# ---------------------------------------------------------------------------

class TestSecurityRoutes:

    def test_audit_log_requires_admin(self, app_client, in_memory_db):
        data = _login(app_client, "viewer-pass-123")
        resp = app_client.get("/api/security/audit-log", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 403

    def test_audit_log_admin_can_read(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/security/audit-log", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200

    def test_failed_logins_endpoint(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/security/failed-logins", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        assert "failed_login_count" in resp.get_json()

    def test_rate_limit_status_endpoint(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/security/rate-limits", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        assert "default_limit_per_minute" in resp.get_json()


# ---------------------------------------------------------------------------
# api/routes/realtime.py
# ---------------------------------------------------------------------------

class TestRealtimeRoutes:

    def test_dashboard_snapshot_endpoint(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        with patch("execution.position_manager.position_manager.get_open_positions", return_value=[]):
            resp = app_client.get("/api/dashboard/snapshot", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        body = resp.get_json()
        assert "account" in body
        assert "statistics" in body

    def test_websocket_status_endpoint(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/websocket/status", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        assert "total_connections" in resp.get_json()

    def test_cache_stats_requires_admin(self, app_client, in_memory_db):
        data = _login(app_client, "viewer-pass-123")
        resp = app_client.get("/api/cache/stats", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 403

    def test_workers_status_endpoint(self, app_client, in_memory_db):
        data = _login(app_client, "admin-pass-123")
        resp = app_client.get("/api/workers/status", headers=_auth_headers(data["access_token"]))
        assert resp.status_code == 200
        assert "workers" in resp.get_json()


# ---------------------------------------------------------------------------
# api/routes/openapi.py
# ---------------------------------------------------------------------------

class TestOpenAPIRoutes:

    def test_openapi_json_is_valid_spec_shape(self, app_client):
        resp = app_client.get("/api/openapi.json")
        assert resp.status_code == 200
        spec = resp.get_json()
        assert spec["openapi"] == "3.0.3"
        assert "/api/auth/login" in spec["paths"]
        assert "BearerAuth" in spec["components"]["securitySchemes"]

    def test_openapi_documents_websocket(self, app_client):
        resp = app_client.get("/api/openapi.json")
        spec = resp.get_json()
        assert "x-websocket" in spec
        assert spec["x-websocket"]["url"] == "/ws"

    def test_docs_page_serves_html(self, app_client):
        resp = app_client.get("/api/docs")
        assert resp.status_code == 200
        assert b"swagger-ui" in resp.data

    def test_openapi_unauthenticated_access(self, app_client):
        resp = app_client.get("/api/openapi.json")
        assert resp.status_code == 200


# ---------------------------------------------------------------------------
# Security headers
# ---------------------------------------------------------------------------

class TestSecurityHeaders:

    def test_security_headers_present_on_every_response(self, app_client):
        resp = app_client.get("/live")
        assert resp.headers.get("X-Content-Type-Options") == "nosniff"
        assert resp.headers.get("X-Frame-Options") == "DENY"
        assert resp.headers.get("Referrer-Policy") == "no-referrer"

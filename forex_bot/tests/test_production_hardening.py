"""
test_production_hardening.py
==============================
Tests for:
  - core/metrics.py          — MetricsCollector
  - core/logging_setup.py    — JSON formatter, correlation ID
  - core/config_manager.py   — hot reload, validation, persistence
  - database/migrations.py   — MigrationRunner (in-memory SQLite)
  - database/repositories.py — all repositories (in-memory SQLite)
  - database/connection.py   — unit_of_work
  - core/startup_validator.py — individual check methods
  - execution/persistent_queue.py — submit, idempotency, recovery
"""

from __future__ import annotations

import json
import logging
import os
import tempfile
import threading
import time
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

import pytest


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def in_memory_db(tmp_path):
    """Patches DATABASE_URL to an in-memory SQLite for each test."""
    db_path = str(tmp_path / "test.db")
    db_url = f"sqlite:///{db_path}"
    with patch("config.DATABASE_URL", db_url):
        # Force new engine creation for the test URL
        import database.connection as dbconn
        original_engine = dbconn._engine
        original_factory = dbconn._SessionLocal
        dbconn._engine = None
        dbconn._SessionLocal = None

        from database.connection import init_db
        init_db()

        yield db_url

        dbconn._engine = original_engine
        dbconn._SessionLocal = original_factory


# ---------------------------------------------------------------------------
# MetricsCollector
# ---------------------------------------------------------------------------

class TestMetricsCollector:

    def _fresh(self):
        from core.metrics import MetricsCollector
        return MetricsCollector()

    def test_increment_counter(self):
        m = self._fresh()
        m.increment("trades_opened")
        m.increment("trades_opened")
        assert m.counter("trades_opened") == 2

    def test_increment_unknown_key_creates_counter(self):
        m = self._fresh()
        m.increment("custom_event")
        assert m.counter("custom_event") == 1

    def test_set_and_read_gauge(self):
        m = self._fresh()
        m.set_gauge("equity", 12345.67)
        assert m.gauge("equity") == 12345.67

    def test_latency_series_records_and_returns_stats(self):
        m = self._fresh()
        for ms in [10.0, 20.0, 30.0, 40.0, 50.0]:
            m.record_mt5_latency_ms(ms)
        snap = m.snapshot()
        mt5_lat = snap["latency"]["mt5_ms"]
        assert mt5_lat["count"] == 5
        assert mt5_lat["avg"] == pytest.approx(30.0)
        assert mt5_lat["p50"] is not None

    def test_win_rate_calculation(self):
        m = self._fresh()
        for _ in range(3):
            m.record_trade_win()
        for _ in range(1):
            m.record_trade_loss()
        snap = m.snapshot()
        assert snap["gauges"]["win_rate_pct"] == pytest.approx(75.0)
        assert snap["win_loss"]["wins"] == 3
        assert snap["win_loss"]["losses"] == 1

    def test_snapshot_includes_all_expected_keys(self):
        m = self._fresh()
        snap = m.snapshot()
        assert "timestamp" in snap
        assert "counters" in snap
        assert "gauges" in snap
        assert "latency" in snap
        assert "system" in snap
        assert "win_loss" in snap

    def test_system_stats_returns_cpu_and_ram(self):
        m = self._fresh()
        snap = m.snapshot()
        system = snap["system"]
        assert "cpu_pct" in system
        assert "ram_mb" in system
        assert "active_threads" in system
        assert "uptime_seconds" in system

    def test_thread_safe_concurrent_increments(self):
        m = self._fresh()
        errors = []

        def worker():
            try:
                for _ in range(100):
                    m.increment("trades_opened")
            except Exception as exc:
                errors.append(exc)

        threads = [threading.Thread(target=worker) for _ in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert not errors
        assert m.counter("trades_opened") == 1000


# ---------------------------------------------------------------------------
# Structured logging
# ---------------------------------------------------------------------------

class TestStructuredLogging:

    def test_json_formatter_produces_valid_json(self):
        from core.logging_setup import _JsonFormatter
        formatter = _JsonFormatter()
        record = logging.LogRecord(
            name="test", level=logging.INFO, pathname="", lineno=1,
            msg="hello world", args=(), exc_info=None,
        )
        output = formatter.format(record)
        doc = json.loads(output)
        assert doc["msg"] == "hello world"
        assert doc["level"] == "INFO"
        assert "ts" in doc
        assert "logger" in doc
        assert "thread" in doc

    def test_json_formatter_includes_exception_info(self):
        from core.logging_setup import _JsonFormatter
        formatter = _JsonFormatter()
        try:
            raise ValueError("test error")
        except ValueError:
            import sys
            exc_info = sys.exc_info()

        record = logging.LogRecord(
            name="test", level=logging.ERROR, pathname="", lineno=1,
            msg="error occurred", args=(), exc_info=exc_info,
        )
        output = formatter.format(record)
        doc = json.loads(output)
        assert "exception" in doc
        assert doc["exception"]["type"] == "ValueError"

    def test_correlation_id_included_in_record(self):
        from core.logging_setup import _JsonFormatter, set_correlation_id
        set_correlation_id("test-cid-123")
        formatter = _JsonFormatter()
        record = logging.LogRecord(
            name="test", level=logging.INFO, pathname="", lineno=1,
            msg="correlated", args=(), exc_info=None,
        )
        output = formatter.format(record)
        doc = json.loads(output)
        assert doc["correlation_id"] == "test-cid-123"
        # Reset
        set_correlation_id("")

    def test_extra_fields_included_in_json(self):
        from core.logging_setup import _JsonFormatter
        formatter = _JsonFormatter()
        record = logging.LogRecord(
            name="test", level=logging.INFO, pathname="", lineno=1,
            msg="trade event", args=(), exc_info=None,
        )
        record.symbol = "EURUSD"
        record.ticket = 12345
        record.latency_ms = 42.5
        output = formatter.format(record)
        doc = json.loads(output)
        assert doc.get("symbol") == "EURUSD"
        assert doc.get("ticket") == 12345
        assert doc.get("latency_ms") == 42.5


# ---------------------------------------------------------------------------
# ConfigManager
# ---------------------------------------------------------------------------

class TestConfigManager:

    @pytest.fixture(autouse=True)
    def _clean_sidecar(self, tmp_path, monkeypatch):
        """Each test gets a fresh sidecar path to avoid interference."""
        sidecar = str(tmp_path / "config_overrides.json")
        monkeypatch.setattr("core.config_manager._SIDECAR_PATH", sidecar)
        yield

    def _fresh(self):
        from core.config_manager import ConfigManager
        return ConfigManager()

    def test_get_returns_static_config_by_default(self):
        cm = self._fresh()
        import config
        assert cm.get("RSI_PERIOD") == config.RSI_PERIOD

    def test_set_valid_value_applies_immediately(self):
        cm = self._fresh()
        import config
        original = config.RSI_PERIOD
        try:
            cm.set("RSI_PERIOD", 21)
            assert cm.get("RSI_PERIOD") == 21
            assert config.RSI_PERIOD == 21
        finally:
            config.RSI_PERIOD = original

    def test_set_invalid_key_raises_config_validation_error(self):
        from core.config_manager import ConfigValidationError
        cm = self._fresh()
        with pytest.raises(ConfigValidationError, match="not in the hot-reload whitelist"):
            cm.set("MT5_PASSWORD", "new_password")

    def test_set_out_of_range_raises_config_validation_error(self):
        from core.config_manager import ConfigValidationError
        cm = self._fresh()
        with pytest.raises(ConfigValidationError, match="exceeds maximum"):
            cm.set("RISK_PER_TRADE_PCT", 99.0)  # max is 10.0

    def test_set_below_minimum_raises(self):
        from core.config_manager import ConfigValidationError
        cm = self._fresh()
        with pytest.raises(ConfigValidationError, match="below minimum"):
            cm.set("RISK_PER_TRADE_PCT", -1.0)

    def test_invalid_time_pattern_raises(self):
        from core.config_manager import ConfigValidationError
        cm = self._fresh()
        with pytest.raises(ConfigValidationError, match="pattern"):
            cm.set("LONDON_OPEN", "8am")

    def test_valid_time_pattern_accepted(self):
        cm = self._fresh()
        import config
        original = config.LONDON_OPEN
        try:
            change = cm.set("LONDON_OPEN", "09:00")
            assert change.new_value == "09:00"
        finally:
            config.LONDON_OPEN = original

    def test_set_many_atomic_all_or_nothing(self):
        from core.config_manager import ConfigValidationError
        cm = self._fresh()
        import config
        original_rsi = config.RSI_PERIOD
        try:
            with pytest.raises(ConfigValidationError):
                cm.set_many({
                    "RSI_PERIOD": 20,
                    "MT5_PASSWORD": "forbidden",  # not hot-reloadable
                })
            # RSI_PERIOD must NOT have been changed
            assert config.RSI_PERIOD == original_rsi
        finally:
            config.RSI_PERIOD = original_rsi

    def test_reset_reverts_to_static_value(self):
        """
        A ConfigManager captures the static default for every
        hot-reloadable key at construction time (before any override is
        applied). reset() must revert to that captured default, not to
        whatever value happens to currently be on the config module
        (which set() has already mutated).
        """
        cm = self._fresh()
        default_at_construction = cm._static_defaults["RSI_PERIOD"]

        cm.set("RSI_PERIOD", default_at_construction + 3)
        import config
        assert config.RSI_PERIOD == default_at_construction + 3

        cm.reset("RSI_PERIOD")
        assert config.RSI_PERIOD == default_at_construction

    def test_change_history_recorded(self):
        cm = self._fresh()
        import config
        original = config.RSI_PERIOD
        try:
            cm.set("RSI_PERIOD", 20)
            cm.set("RSI_PERIOD", 22)
            history = cm.change_history()
            assert len(history) >= 2
            assert history[-1]["key"] == "RSI_PERIOD"
            assert history[-1]["new"] == 22
        finally:
            config.RSI_PERIOD = original

    def test_hot_reloadable_keys_returns_list(self):
        cm = self._fresh()
        keys = cm.hot_reloadable_keys()
        assert "RISK_PER_TRADE_PCT" in keys
        assert "RSI_PERIOD" in keys
        assert "MT5_PASSWORD" not in keys


# ---------------------------------------------------------------------------
# Database migrations (in-memory SQLite)
# ---------------------------------------------------------------------------

class TestMigrationRunner:

    def test_run_all_creates_all_tables(self, in_memory_db):
        from database.migrations import MigrationRunner
        runner = MigrationRunner()
        applied = runner.run_all()
        assert len(applied) >= 1

    def test_run_all_idempotent(self, in_memory_db):
        from database.migrations import MigrationRunner
        runner = MigrationRunner()
        runner.run_all()
        applied_second = runner.run_all()
        assert applied_second == []  # nothing new

    def test_current_version_after_run(self, in_memory_db):
        from database.migrations import MIGRATIONS, MigrationRunner
        runner = MigrationRunner()
        runner.run_all()
        assert runner.current_version() == max(m.version for m in MIGRATIONS)

    def test_integrity_check_passes_after_clean_run(self, in_memory_db):
        from database.migrations import MigrationRunner
        runner = MigrationRunner()
        runner.run_all()
        errors = runner.integrity_check()
        assert errors == []

    def test_rollback_removes_version(self, in_memory_db):
        from database.migrations import MigrationRunner
        runner = MigrationRunner()
        runner.run_all()
        current = runner.current_version()
        rolled = runner.rollback_to(current - 1)
        assert current in rolled
        assert runner.current_version() == current - 1


# ---------------------------------------------------------------------------
# Repository tests (in-memory SQLite)
# ---------------------------------------------------------------------------

class TestTradeIntentRepository:

    def test_save_and_retrieve_pending(self, in_memory_db):
        from database.connection import unit_of_work
        from database.migrations import migration_runner
        from database.models import PersistentTradeIntent
        from database.repositories import TradeIntentRepository

        migration_runner.run_all()

        with unit_of_work() as session:
            repo = TradeIntentRepository(session)
            intent = PersistentTradeIntent(
                execution_id="test-exec-1",
                symbol="EURUSD", side="BUY",
                stop_loss_price=1.09, take_profit_price=1.11,
                confidence=75.0, magic_number=123,
                status="PENDING", queued_at=datetime.now(timezone.utc),
                idempotency_key="key-001",
            )
            repo.save(intent)

        with unit_of_work() as session:
            repo = TradeIntentRepository(session)
            pending = repo.get_pending()
            assert len(pending) == 1
            assert pending[0].symbol == "EURUSD"

    def test_mark_completed(self, in_memory_db):
        from database.connection import unit_of_work
        from database.migrations import migration_runner
        from database.models import PersistentTradeIntent
        from database.repositories import TradeIntentRepository

        migration_runner.run_all()

        with unit_of_work() as session:
            repo = TradeIntentRepository(session)
            intent = PersistentTradeIntent(
                execution_id="test-exec-2",
                symbol="GBPUSD", side="SELL",
                stop_loss_price=1.30, take_profit_price=1.28,
                confidence=80.0, magic_number=123,
                status="PENDING", queued_at=datetime.now(timezone.utc),
                idempotency_key="key-002",
            )
            repo.save(intent)

        with unit_of_work() as session:
            repo = TradeIntentRepository(session)
            repo.mark_completed("test-exec-2", mt5_ticket=9999, filled_price=1.2990, filled_volume=0.01)

        with unit_of_work() as session:
            repo = TradeIntentRepository(session)
            record = repo.get_by_id("test-exec-2")
            assert record.status == "COMPLETED"
            assert record.mt5_ticket == 9999

    def test_count_by_status(self, in_memory_db):
        from database.connection import unit_of_work
        from database.migrations import migration_runner
        from database.models import PersistentTradeIntent
        from database.repositories import TradeIntentRepository

        migration_runner.run_all()

        with unit_of_work() as session:
            repo = TradeIntentRepository(session)
            for i in range(3):
                repo.save(PersistentTradeIntent(
                    execution_id=f"cnt-{i}", symbol="EURUSD", side="BUY",
                    stop_loss_price=1.09, take_profit_price=1.11,
                    confidence=70.0, magic_number=1,
                    status="PENDING", queued_at=datetime.now(timezone.utc),
                    idempotency_key=f"cnt-key-{i}",
                ))
            repo.save(PersistentTradeIntent(
                execution_id="cnt-fail", symbol="EURUSD", side="BUY",
                stop_loss_price=1.09, take_profit_price=1.11,
                confidence=70.0, magic_number=1,
                status="FAILED", queued_at=datetime.now(timezone.utc),
                idempotency_key="cnt-key-fail",
            ))

        with unit_of_work() as session:
            counts = TradeIntentRepository(session).count_by_status()
        assert counts.get("PENDING", 0) == 3
        assert counts.get("FAILED", 0) == 1


class TestIdempotencyRepository:

    def test_try_acquire_first_time_returns_true(self, in_memory_db):
        from database.connection import unit_of_work
        from database.migrations import migration_runner
        from database.repositories import IdempotencyRepository

        migration_runner.run_all()

        with unit_of_work() as session:
            repo = IdempotencyRepository(session)
            acquired = repo.try_acquire("unique-key-1", "trade_intent")
            assert acquired is True

    def test_try_acquire_duplicate_returns_false(self, in_memory_db):
        from database.connection import unit_of_work
        from database.migrations import migration_runner
        from database.repositories import IdempotencyRepository

        migration_runner.run_all()

        with unit_of_work() as session:
            repo = IdempotencyRepository(session)
            repo.try_acquire("dup-key", "trade_intent")

        with unit_of_work() as session:
            repo = IdempotencyRepository(session)
            acquired = repo.try_acquire("dup-key", "trade_intent")
            assert acquired is False

    def test_mark_completed_updates_status(self, in_memory_db):
        from database.connection import unit_of_work
        from database.migrations import migration_runner
        from database.repositories import IdempotencyRepository

        migration_runner.run_all()

        with unit_of_work() as session:
            repo = IdempotencyRepository(session)
            repo.try_acquire("complete-key", "trade_intent")

        with unit_of_work() as session:
            repo = IdempotencyRepository(session)
            repo.mark_completed("complete-key", "ticket=1234")

        with unit_of_work() as session:
            from database.models import IdempotencyRecord
            record = session.get(IdempotencyRecord, "complete-key")
            assert record.status == "COMPLETED"


class TestTradeRepository:

    def test_save_and_retrieve_by_ticket(self, in_memory_db):
        import uuid
        from database.connection import unit_of_work
        from database.migrations import migration_runner
        from database.models import Trade
        from database.repositories import TradeRepository

        migration_runner.run_all()

        with unit_of_work() as session:
            repo = TradeRepository(session)
            trade = Trade(
                id=str(uuid.uuid4()), mt5_ticket=55001,
                symbol="EURUSD", side="BUY",
                open_price=1.1000, volume=0.01,
                magic_number=202600001,
                open_time=datetime.now(timezone.utc),
                is_closed=False,
            )
            repo.save(trade)

        with unit_of_work() as session:
            repo = TradeRepository(session)
            found = repo.get_by_ticket(55001)
            assert found is not None
            assert found.symbol == "EURUSD"

    def test_win_rate_with_no_trades(self, in_memory_db):
        from database.connection import unit_of_work
        from database.migrations import migration_runner
        from database.repositories import TradeRepository

        migration_runner.run_all()

        with unit_of_work() as session:
            result = TradeRepository(session).win_rate()
        assert result["total"] == 0
        assert result["win_rate_pct"] == 0.0


class TestBotEventRepository:

    def test_append_and_retrieve(self, in_memory_db):
        from database.connection import unit_of_work
        from database.migrations import migration_runner
        from database.repositories import BotEventRepository

        migration_runner.run_all()

        with unit_of_work() as session:
            repo = BotEventRepository(session)
            repo.append("TRADE_OPENED", source="test", payload={"symbol": "EURUSD"})

        with unit_of_work() as session:
            repo = BotEventRepository(session)
            events = repo.get_recent(limit=10)
            assert len(events) == 1
            assert events[0].event_name == "TRADE_OPENED"


# ---------------------------------------------------------------------------
# PersistentQueueManager
# ---------------------------------------------------------------------------

class TestPersistentQueueManager:

    def _make_manager(self, in_memory_db):
        from database.migrations import migration_runner
        migration_runner.run_all()

        from execution.execution_engine import ExecutionEngine
        mock_engine = MagicMock(spec=ExecutionEngine)
        mock_engine.submit.return_value = True

        from execution.persistent_queue import PersistentQueueManager
        return PersistentQueueManager(mock_engine), mock_engine

    def _make_intent(self, symbol="EURUSD", side_str="BUY", confidence=75.0):
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

    def test_submit_persists_to_db_and_calls_engine(self, in_memory_db):
        manager, mock_engine = self._make_manager(in_memory_db)
        intent = self._make_intent()

        execution_id = manager.submit(intent, idempotency_key="unique-submit-key")

        assert execution_id is not None
        mock_engine.submit.assert_called_once_with(intent)

        stats = manager.queue_stats()
        assert stats.get("PENDING", 0) >= 1

    def test_submit_duplicate_key_raises(self, in_memory_db):
        from execution.persistent_queue import DuplicateIntentError
        manager, _ = self._make_manager(in_memory_db)
        intent = self._make_intent()

        manager.submit(intent, idempotency_key="dup-test-key")

        with pytest.raises(DuplicateIntentError):
            manager.submit(intent, idempotency_key="dup-test-key")

    def test_mark_completed_updates_db(self, in_memory_db):
        from database.connection import unit_of_work
        from database.repositories import TradeIntentRepository
        manager, _ = self._make_manager(in_memory_db)

        execution_id = manager.submit(
            self._make_intent(), idempotency_key="completed-key"
        )
        manager.mark_completed(execution_id, mt5_ticket=77777, filled_price=1.1001, filled_volume=0.01)

        with unit_of_work() as session:
            record = TradeIntentRepository(session).get_by_id(execution_id)
            assert record.status == "COMPLETED"
            assert record.mt5_ticket == 77777

    def test_recover_pending_calls_engine_submit(self, in_memory_db):
        from database.connection import unit_of_work
        from database.migrations import migration_runner
        from database.models import PersistentTradeIntent
        from database.repositories import TradeIntentRepository
        from execution.execution_engine import ExecutionEngine
        from execution.persistent_queue import PersistentQueueManager

        migration_runner.run_all()

        # Directly insert a PENDING row simulating a crash scenario
        with unit_of_work() as session:
            repo = TradeIntentRepository(session)
            repo.save(PersistentTradeIntent(
                execution_id="crash-recovery-1",
                symbol="EURUSD", side="BUY",
                stop_loss_price=1.09, take_profit_price=1.11,
                confidence=70.0, magic_number=1,
                status="PENDING", queued_at=datetime.now(timezone.utc),
                idempotency_key="crash-key-1",
            ))

        mock_engine = MagicMock(spec=ExecutionEngine)
        mock_engine.submit.return_value = True
        manager = PersistentQueueManager(mock_engine)

        recovered = manager.recover_pending()
        assert recovered == 1
        mock_engine.submit.assert_called_once()


# ---------------------------------------------------------------------------
# StartupValidator — individual checks
# ---------------------------------------------------------------------------

class TestStartupValidator:

    def _fresh(self):
        from core.startup_validator import StartupValidator
        return StartupValidator()

    def test_check_folders_passes_for_writable_path(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        validator = self._fresh()
        results = validator._check_required_folders()
        assert all(r.passed for r in results)

    def test_mt5_login_missing_is_critical(self):
        with patch("config.MT5_LOGIN", 0), patch("config.MT5_PASSWORD", ""), patch("config.MT5_SERVER", ""):
            validator = self._fresh()
            results = validator._check_mt5_credentials()
            failed = [r for r in results if not r.passed]
            assert len(failed) >= 2

    def test_mt5_password_placeholder_fails(self):
        with patch("config.MT5_PASSWORD", "YOUR_PASSWORD_HERE"):
            validator = self._fresh()
            results = validator._check_mt5_credentials()
            pw_check = next(r for r in results if r.name == "mt5_password")
            assert not pw_check.passed

    def test_telegram_missing_is_warning_not_critical(self):
        with patch("config.TELEGRAM_TOKEN", ""), patch("config.TELEGRAM_CHAT_ID", ""):
            validator = self._fresh()
            results = validator._check_telegram_credentials()
            from core.startup_validator import Severity
            for r in results:
                if not r.passed:
                    assert r.severity == Severity.WARNING

    def test_invalid_timeframe_is_critical(self):
        with patch("config.TIMEFRAME_PRIMARY", "H2"), \
             patch("config.TIMEFRAME_CONFIRM", "H4"), \
             patch("config.TIMEFRAME_ENTRY", "M15"):
            validator = self._fresh()
            result = validator._check_timeframes()
            assert not result.passed
            from core.startup_validator import Severity
            assert result.severity == Severity.CRITICAL

    def test_valid_timeframes_pass(self):
        with patch("config.TIMEFRAME_PRIMARY", "H1"), \
             patch("config.TIMEFRAME_CONFIRM", "H4"), \
             patch("config.TIMEFRAME_ENTRY", "M15"):
            validator = self._fresh()
            result = validator._check_timeframes()
            assert result.passed

    def test_risk_parameters_out_of_range_warns(self):
        with patch("config.RISK_PER_TRADE_PCT", 50.0):
            validator = self._fresh()
            results = validator._check_risk_parameters()
            from core.startup_validator import Severity
            risk_check = next(r for r in results if r.name == "risk_per_trade_pct")
            assert not risk_check.passed
            assert risk_check.severity == Severity.WARNING

    def test_startup_report_can_start_with_only_warnings(self):
        from core.startup_validator import CheckResult, Severity, StartupReport
        report = StartupReport()
        report.checks = [
            CheckResult("test1", Severity.INFO, True, "ok"),
            CheckResult("test2", Severity.WARNING, False, "warn"),
        ]
        assert report.can_start is True

    def test_startup_report_cannot_start_with_critical_failure(self):
        from core.startup_validator import CheckResult, Severity, StartupReport
        report = StartupReport()
        report.checks = [
            CheckResult("test1", Severity.CRITICAL, False, "fail"),
        ]
        assert report.can_start is False


# ---------------------------------------------------------------------------
# Health API
# ---------------------------------------------------------------------------

class TestHealthAPI:

    @pytest.fixture
    def client(self):
        with patch("config.DASHBOARD_PASSWORD", "test-token"):
            from api.app import create_app
            app = create_app()
            app.config["TESTING"] = True
            with app.test_client() as c:
                yield c

    def test_live_returns_200(self, client):
        resp = client.get("/live")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["status"] == "alive"

    def test_ready_returns_503_when_bot_not_running(self, client):
        from core.state_manager import BotStatus
        # bot_status is a @property backed by _bot_status — patch the
        # private attribute directly since patch.object can't replace properties.
        original = state._bot_status
        try:
            state._bot_status = BotStatus.STOPPED
            resp = client.get("/ready")
            assert resp.status_code == 503
        finally:
            state._bot_status = original

    def test_health_returns_status_field(self, client):
        resp = client.get("/health")
        assert resp.status_code in (200, 503)
        data = resp.get_json()
        assert "status" in data
        assert "subsystems" in data

    def test_metrics_requires_auth(self, client):
        resp = client.get("/metrics")
        assert resp.status_code == 401

    def test_metrics_with_valid_token(self, client):
        resp = client.get("/metrics", headers={"X-Bot-Token": "test-token"})
        assert resp.status_code == 200
        data = resp.get_json()
        assert "counters" in data
        assert "gauges" in data

    def test_config_get_requires_auth(self, client):
        resp = client.get("/config")
        assert resp.status_code == 401

    def test_config_post_valid_change(self, client):
        import config as cfg
        original = cfg.RSI_PERIOD
        try:
            resp = client.post(
                "/config",
                json={"key": "RSI_PERIOD", "value": 20},
                headers={"X-Bot-Token": "test-token"},
            )
            assert resp.status_code == 200
            data = resp.get_json()
            assert data["key"] == "RSI_PERIOD"
            assert data["new_value"] == 20
        finally:
            cfg.RSI_PERIOD = original

    def test_config_post_invalid_key_returns_422(self, client):
        resp = client.post(
            "/config",
            json={"key": "MT5_PASSWORD", "value": "hacked"},
            headers={"X-Bot-Token": "test-token"},
        )
        assert resp.status_code == 422

    def test_config_post_missing_body_returns_400(self, client):
        resp = client.post(
            "/config",
            data="not json",
            content_type="text/plain",
            headers={"X-Bot-Token": "test-token"},
        )
        assert resp.status_code == 400

    def test_system_endpoint(self, client):
        resp = client.get("/system")
        assert resp.status_code == 200
        data = resp.get_json()
        assert "cpu_pct" in data or "ram_mb" in data

    def test_database_endpoint_with_real_sqlite(self, client, in_memory_db):
        resp = client.get("/database")
        assert resp.status_code in (200, 503)
        data = resp.get_json()
        assert "connected" in data
        assert "latency_ms" in data


# Make state accessible in health tests
from core.state_manager import state

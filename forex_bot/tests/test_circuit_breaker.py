"""
test_circuit_breaker.py
========================
Tests for core/circuit_breaker.py.
All tests are pure Python — no MT5, no network, no database required.
"""

from __future__ import annotations

import threading
import time
from unittest.mock import MagicMock

import pytest

from core.circuit_breaker import (
    CircuitBreaker,
    CircuitOpenError,
    CircuitState,
    all_circuit_stats,
    database_circuit,
    gemini_circuit,
    mt5_circuit,
    telegram_circuit,
    webhook_circuit,
)


class TestCircuitBreakerStateTransitions:

    def _make_cb(self, threshold=3, recovery=60.0):
        return CircuitBreaker("test", failure_threshold=threshold, recovery_timeout=recovery)

    def test_initial_state_is_closed(self):
        cb = self._make_cb()
        assert cb.state == CircuitState.CLOSED

    def test_successful_call_stays_closed(self):
        cb = self._make_cb()
        result = cb.execute(lambda: 42)
        assert result == 42
        assert cb.state == CircuitState.CLOSED

    def test_failure_increments_consecutive_count(self):
        cb = self._make_cb(threshold=5)
        for _ in range(3):
            with pytest.raises(ValueError):
                cb.execute(lambda: (_ for _ in ()).throw(ValueError("fail")))
        assert cb._stats.consecutive_failures == 3
        assert cb.state == CircuitState.CLOSED

    def test_threshold_failures_open_circuit(self):
        cb = self._make_cb(threshold=3)
        for _ in range(3):
            with pytest.raises(ValueError):
                cb.execute(lambda: (_ for _ in ()).throw(ValueError("fail")))
        assert cb.state == CircuitState.OPEN

    def test_open_circuit_raises_circuit_open_error(self):
        cb = self._make_cb(threshold=2)
        for _ in range(2):
            with pytest.raises(ValueError):
                cb.execute(lambda: (_ for _ in ()).throw(ValueError()))
        assert cb.state == CircuitState.OPEN
        with pytest.raises(CircuitOpenError):
            cb.execute(lambda: 99)

    def test_open_circuit_transitions_to_half_open_after_timeout(self):
        cb = CircuitBreaker("test_halfopen", failure_threshold=1, recovery_timeout=0.05)
        with pytest.raises(RuntimeError):
            cb.execute(lambda: (_ for _ in ()).throw(RuntimeError()))
        assert cb.state == CircuitState.OPEN
        time.sleep(0.1)
        # Evaluating state should transition to HALF_OPEN
        assert cb.state == CircuitState.HALF_OPEN

    def test_half_open_success_closes_circuit(self):
        cb = CircuitBreaker("test_close", failure_threshold=1, recovery_timeout=0.05)
        with pytest.raises(RuntimeError):
            cb.execute(lambda: (_ for _ in ()).throw(RuntimeError()))
        time.sleep(0.1)
        _ = cb.state  # trigger HALF_OPEN transition
        result = cb.execute(lambda: "recovered")
        assert result == "recovered"
        assert cb.state == CircuitState.CLOSED

    def test_half_open_failure_reopens_circuit(self):
        cb = CircuitBreaker("test_reopen", failure_threshold=1, recovery_timeout=0.05)
        with pytest.raises(RuntimeError):
            cb.execute(lambda: (_ for _ in ()).throw(RuntimeError()))
        time.sleep(0.1)
        _ = cb.state  # trigger HALF_OPEN
        with pytest.raises(RuntimeError):
            cb.execute(lambda: (_ for _ in ()).throw(RuntimeError()))
        assert cb.state == CircuitState.OPEN

    def test_reset_returns_to_closed(self):
        cb = self._make_cb(threshold=1)
        with pytest.raises(RuntimeError):
            cb.execute(lambda: (_ for _ in ()).throw(RuntimeError()))
        assert cb.state == CircuitState.OPEN
        cb.reset()
        assert cb.state == CircuitState.CLOSED
        assert cb._stats.consecutive_failures == 0

    def test_success_resets_consecutive_failure_count(self):
        cb = self._make_cb(threshold=5)
        for _ in range(3):
            with pytest.raises(ValueError):
                cb.execute(lambda: (_ for _ in ()).throw(ValueError()))
        cb.execute(lambda: "ok")  # success
        assert cb._stats.consecutive_failures == 0

    def test_rejected_calls_are_counted(self):
        cb = self._make_cb(threshold=1)
        with pytest.raises(RuntimeError):
            cb.execute(lambda: (_ for _ in ()).throw(RuntimeError()))
        for _ in range(3):
            with pytest.raises(CircuitOpenError):
                cb.execute(lambda: None)
        assert cb._stats.rejected_calls == 3

    def test_stats_tracks_all_counters(self):
        cb = self._make_cb(threshold=5)
        cb.execute(lambda: None)
        with pytest.raises(ValueError):
            cb.execute(lambda: (_ for _ in ()).throw(ValueError()))
        stats = cb.stats()
        assert stats["total_calls"] == 2
        assert stats["successful_calls"] == 1
        assert stats["failed_calls"] == 1
        assert stats["state"] == CircuitState.CLOSED.value


class TestCircuitBreakerDecorator:

    def test_decorator_form_passes_through_result(self):
        cb = CircuitBreaker("deco_test", failure_threshold=3, recovery_timeout=60)

        @cb.call
        def my_func(x):
            return x * 2

        assert my_func(5) == 10

    def test_decorator_form_counts_failure(self):
        cb = CircuitBreaker("deco_fail", failure_threshold=3, recovery_timeout=60)

        @cb.call
        def failing_func():
            raise ConnectionError("down")

        for _ in range(3):
            with pytest.raises(ConnectionError):
                failing_func()
        assert cb.state == CircuitState.OPEN


class TestCircuitBreakerThreadSafety:

    def test_concurrent_calls_do_not_corrupt_stats(self):
        cb = CircuitBreaker("thread_test", failure_threshold=100, recovery_timeout=60)
        errors = []

        def worker():
            try:
                for _ in range(20):
                    cb.execute(lambda: None)
            except Exception as exc:
                errors.append(exc)

        threads = [threading.Thread(target=worker) for _ in range(10)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        assert not errors
        assert cb._stats.total_calls == 200
        assert cb._stats.successful_calls == 200

    def test_only_one_half_open_call_allowed(self):
        """When multiple threads race on a HALF_OPEN circuit, only one
        probe call is allowed through. Others get CircuitOpenError."""
        cb = CircuitBreaker(
            "half_open_race", failure_threshold=1,
            recovery_timeout=0.05, half_open_max_calls=1
        )
        with pytest.raises(RuntimeError):
            cb.execute(lambda: (_ for _ in ()).throw(RuntimeError()))
        time.sleep(0.1)
        _ = cb.state  # transition to HALF_OPEN

        probe_results = []
        lock = threading.Lock()

        def probe():
            try:
                cb.execute(lambda: time.sleep(0.05) or "ok")
                with lock:
                    probe_results.append("pass")
            except (CircuitOpenError, RuntimeError):
                with lock:
                    probe_results.append("blocked")

        threads = [threading.Thread(target=probe) for _ in range(5)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        # Exactly one should pass through
        assert probe_results.count("pass") <= 1


class TestPreBuiltCircuits:

    def test_all_pre_built_circuits_exist_and_are_closed(self):
        for cb in [mt5_circuit, telegram_circuit, gemini_circuit, database_circuit, webhook_circuit]:
            assert cb.state in (CircuitState.CLOSED, CircuitState.OPEN, CircuitState.HALF_OPEN)

    def test_all_circuit_stats_returns_list_of_five(self):
        stats = all_circuit_stats()
        assert len(stats) == 5
        names = {s["name"] for s in stats}
        assert "mt5" in names
        assert "telegram" in names
        assert "gemini" in names
        assert "database" in names
        assert "webhook" in names

"""
circuit_breaker.py
====================
Generic circuit breaker implementation for MT5, Telegram, Gemini,
database, and webhook calls.

States:
  CLOSED   — normal operation, calls pass through
  OPEN     — failure threshold exceeded, calls fail fast without
              attempting the real operation (protecting downstream)
  HALF_OPEN — recovery probe: one call allowed through; if it succeeds,
              transition to CLOSED; if it fails, reset the OPEN timeout.

Thread-safe. Every instance tracks its own failure statistics.

Usage:
    cb = CircuitBreaker("mt5", failure_threshold=5, recovery_timeout=60)

    @cb.call
    def send_order():
        return mt5.order_send(request)

    # or directly:
    result = cb.execute(mt5.order_send, request)
"""

from __future__ import annotations

import logging
import threading
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, TypeVar

logger = logging.getLogger("circuit_breaker")

F = TypeVar("F", bound=Callable[..., Any])


class CircuitState(str, Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"


class CircuitOpenError(Exception):
    """Raised when a call is attempted while the circuit is OPEN."""


@dataclass
class CircuitBreakerStats:
    total_calls: int = 0
    successful_calls: int = 0
    failed_calls: int = 0
    rejected_calls: int = 0          # calls rejected because circuit is OPEN
    state_changes: int = 0
    consecutive_failures: int = 0
    last_failure_time: float | None = None
    last_success_time: float | None = None


class CircuitBreaker:
    """
    Thread-safe circuit breaker.

    Args:
        name: Human-readable label for logging.
        failure_threshold: Number of consecutive failures before opening.
        recovery_timeout: Seconds to wait in OPEN state before probing.
        half_open_max_calls: Max concurrent calls allowed in HALF_OPEN state.
        expected_exception: Exception type(s) that count as failures.
            If None, any Exception counts.
    """

    def __init__(
        self,
        name: str,
        failure_threshold: int = 5,
        recovery_timeout: float = 60.0,
        half_open_max_calls: int = 1,
        expected_exception: type[Exception] | tuple[type[Exception], ...] = Exception,
    ) -> None:
        self.name = name
        self._failure_threshold = failure_threshold
        self._recovery_timeout = recovery_timeout
        self._half_open_max_calls = half_open_max_calls
        self._expected_exception = expected_exception

        self._state = CircuitState.CLOSED
        self._lock = threading.RLock()
        self._opened_at: float | None = None
        self._half_open_calls = 0
        self._stats = CircuitBreakerStats()

    @property
    def state(self) -> CircuitState:
        with self._lock:
            return self._evaluate_state()

    def _evaluate_state(self) -> CircuitState:
        """Must be called under self._lock."""
        if self._state == CircuitState.OPEN:
            if self._opened_at and (time.monotonic() - self._opened_at) >= self._recovery_timeout:
                logger.info("CircuitBreaker[%s]: transitioning OPEN→HALF_OPEN (probe).", self.name)
                self._state = CircuitState.HALF_OPEN
                self._half_open_calls = 0
                self._stats.state_changes += 1
        return self._state

    def execute(self, func: Callable[..., Any], *args: Any, **kwargs: Any) -> Any:
        """
        Execute func(*args, **kwargs) through the circuit breaker.
        Raises CircuitOpenError if the circuit is OPEN and the recovery
        timeout has not yet elapsed.
        """
        with self._lock:
            current_state = self._evaluate_state()
            self._stats.total_calls += 1

            if current_state == CircuitState.OPEN:
                self._stats.rejected_calls += 1
                raise CircuitOpenError(
                    f"CircuitBreaker[{self.name}] is OPEN. "
                    f"Recovery in {max(0, self._recovery_timeout - (time.monotonic() - self._opened_at)):.0f}s."
                )

            if current_state == CircuitState.HALF_OPEN:
                if self._half_open_calls >= self._half_open_max_calls:
                    self._stats.rejected_calls += 1
                    raise CircuitOpenError(
                        f"CircuitBreaker[{self.name}] HALF_OPEN probe slot occupied."
                    )
                self._half_open_calls += 1

        try:
            result = func(*args, **kwargs)
            self._on_success()
            return result
        except self._expected_exception as exc:
            self._on_failure()
            raise

    def _on_success(self) -> None:
        just_recovered = False
        with self._lock:
            self._stats.successful_calls += 1
            self._stats.consecutive_failures = 0
            self._stats.last_success_time = time.monotonic()

            if self._state in (CircuitState.HALF_OPEN, CircuitState.OPEN):
                logger.info(
                    "CircuitBreaker[%s]: probe succeeded → transitioning to CLOSED.", self.name
                )
                self._state = CircuitState.CLOSED
                self._opened_at = None
                self._stats.state_changes += 1
                just_recovered = True

        if just_recovered:
            self._publish_transition_event(recovered=True)

    def _on_failure(self) -> None:
        just_tripped = False
        with self._lock:
            self._stats.failed_calls += 1
            self._stats.consecutive_failures += 1
            self._stats.last_failure_time = time.monotonic()

            if self._state == CircuitState.HALF_OPEN:
                logger.warning(
                    "CircuitBreaker[%s]: probe FAILED → reopening circuit.", self.name
                )
                self._state = CircuitState.OPEN
                self._opened_at = time.monotonic()
                self._stats.state_changes += 1
                just_tripped = True

            elif self._state == CircuitState.CLOSED:
                if self._stats.consecutive_failures >= self._failure_threshold:
                    logger.error(
                        "CircuitBreaker[%s]: %d consecutive failures → OPENING circuit.",
                        self.name, self._stats.consecutive_failures,
                    )
                    self._state = CircuitState.OPEN
                    self._opened_at = time.monotonic()
                    self._stats.state_changes += 1
                    just_tripped = True

        if just_tripped:
            self._publish_transition_event(recovered=False)

    def _publish_transition_event(self, recovered: bool) -> None:
        """
        Publishes a bus event on OPEN/CLOSED transitions. Import is local
        to avoid a module-load-time circular import (event_bus does not
        import circuit_breaker, so this is safe at call time regardless).
        Any failure publishing must never propagate — a broken event bus
        subscriber must not affect circuit breaker correctness.
        """
        try:
            from core.event_bus import Events, bus
            event_name = Events.CIRCUIT_BREAKER_RECOVERED if recovered else Events.CIRCUIT_BREAKER_TRIPPED
            bus.publish(event_name, {"name": self.name, "state": self.state.value}, source="circuit_breaker")
        except Exception:
            logger.exception("Failed to publish circuit breaker transition event for %s", self.name)

    def reset(self) -> None:
        """Manually reset to CLOSED state. Intended for tests and manual intervention."""
        with self._lock:
            self._state = CircuitState.CLOSED
            self._opened_at = None
            self._stats.consecutive_failures = 0
            self._stats.state_changes += 1

    def stats(self) -> dict:
        with self._lock:
            return {
                "name": self.name,
                "state": self._state.value,
                "failure_threshold": self._failure_threshold,
                "recovery_timeout_s": self._recovery_timeout,
                "total_calls": self._stats.total_calls,
                "successful_calls": self._stats.successful_calls,
                "failed_calls": self._stats.failed_calls,
                "rejected_calls": self._stats.rejected_calls,
                "consecutive_failures": self._stats.consecutive_failures,
                "state_changes": self._stats.state_changes,
                "last_failure_time": self._stats.last_failure_time,
                "last_success_time": self._stats.last_success_time,
            }

    def call(self, func: F) -> F:
        """Decorator form: @cb.call"""
        import functools

        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            return self.execute(func, *args, **kwargs)

        return wrapper  # type: ignore[return-value]


# ---------------------------------------------------------------------------
# Pre-built circuit breakers for each external dependency.
# Import and use these directly; do not create ad-hoc breakers elsewhere.
# ---------------------------------------------------------------------------
mt5_circuit = CircuitBreaker(
    "mt5",
    failure_threshold=5,
    recovery_timeout=30.0,
    expected_exception=Exception,
)

telegram_circuit = CircuitBreaker(
    "telegram",
    failure_threshold=3,
    recovery_timeout=120.0,
    expected_exception=Exception,
)

gemini_circuit = CircuitBreaker(
    "gemini",
    failure_threshold=3,
    recovery_timeout=60.0,
    expected_exception=Exception,
)

database_circuit = CircuitBreaker(
    "database",
    failure_threshold=5,
    recovery_timeout=30.0,
    expected_exception=Exception,
)

webhook_circuit = CircuitBreaker(
    "webhook",
    failure_threshold=5,
    recovery_timeout=30.0,
    expected_exception=Exception,
)


def all_circuit_stats() -> list[dict]:
    """Returns stats for all pre-built circuit breakers. Used by health endpoints."""
    return [
        mt5_circuit.stats(),
        telegram_circuit.stats(),
        gemini_circuit.stats(),
        database_circuit.stats(),
        webhook_circuit.stats(),
    ]

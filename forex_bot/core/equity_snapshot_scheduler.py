"""
equity_snapshot_scheduler.py
==============================
Background thread that periodically writes an EquitySnapshot row via
EquitySnapshotRepository. Interval controlled by
config.EQUITY_SNAPSHOT_INTERVAL (seconds). Reads live values from
state_manager (already kept current by run.py's main loop and
mt5_connector), never queries MT5 directly — this module has one job
(persist a periodic snapshot), not "know how to read account state".
"""

from __future__ import annotations

import logging
import threading

import config
from core.state_manager import state
from risk.drawdown_guard import drawdown_guard

logger = logging.getLogger("equity_snapshot_scheduler")


class EquitySnapshotScheduler:
    def __init__(self, interval_seconds: int | None = None) -> None:
        self._interval = interval_seconds or config.EQUITY_SNAPSHOT_INTERVAL
        self._stop_event = threading.Event()
        self._thread: threading.Thread | None = None

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            logger.warning("EquitySnapshotScheduler already running.")
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run, name="equity-snapshot", daemon=True)
        self._thread.start()
        logger.info("EquitySnapshotScheduler started (interval=%ds).", self._interval)

    def stop(self, timeout_seconds: float = 5.0) -> None:
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=timeout_seconds)
        logger.info("EquitySnapshotScheduler stopped.")

    def _run(self) -> None:
        while not self._stop_event.is_set():
            if self._stop_event.wait(self._interval):
                return
            try:
                self.snapshot_now()
            except Exception:
                logger.exception("EquitySnapshotScheduler: snapshot failed.")

    def snapshot_now(self) -> None:
        """Take one snapshot immediately. Also callable synchronously
        (e.g. from the dashboard API for an on-demand snapshot)."""
        account = state.account
        if account.balance <= 0 and account.equity <= 0:
            logger.debug("Skipping equity snapshot — account not yet populated.")
            return

        from database.connection import unit_of_work
        from database.models import EquitySnapshot
        from database.repositories import EquitySnapshotRepository

        with unit_of_work() as session:
            repo = EquitySnapshotRepository(session)
            repo.save(EquitySnapshot(
                balance=account.balance,
                equity=account.equity,
                margin=account.margin,
                free_margin=account.free_margin,
                drawdown_pct=drawdown_guard.current_drawdown_pct(),
                open_trades=state.open_position_count,
            ))
        logger.info(
            "Equity snapshot saved: balance=%.2f equity=%.2f drawdown=%.2f%%",
            account.balance, account.equity, drawdown_guard.current_drawdown_pct(),
        )


# Single shared instance.
equity_snapshot_scheduler = EquitySnapshotScheduler()

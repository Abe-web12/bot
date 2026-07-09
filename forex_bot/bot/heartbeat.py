"""
heartbeat.py
============
Runs a background thread that periodically checks the MT5 connection is
still alive and that account data is still updating. MT5 can drop a
connection silently (network blip, broker maintenance) without raising
any exception on the next API call — some calls just start returning
None. This catches that early instead of letting the bot trade on stale
or absent data.
"""

from __future__ import annotations

import logging
import threading
import time

import config
from bot.mt5_connector import MT5ConnectionError, connector
from core.event_bus import Events, bus
from core.state_manager import ConnectionStatus, state

logger = logging.getLogger("heartbeat")


class HeartbeatMonitor:
    def __init__(self, interval_seconds: int | None = None) -> None:
        self._interval = interval_seconds or config.HEARTBEAT_INTERVAL
        self._thread: threading.Thread | None = None
        self._stop_event = threading.Event()

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            logger.warning("Heartbeat already running.")
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run, name="heartbeat", daemon=True)
        self._thread.start()
        logger.info("Heartbeat monitor started (interval=%ds).", self._interval)

    def stop(self) -> None:
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=self._interval + 5)
        logger.info("Heartbeat monitor stopped.")

    def _run(self) -> None:
        while not self._stop_event.is_set():
            self._check_once()
            self._stop_event.wait(self._interval)

    def _check_once(self) -> None:
        alive = connector.is_connected()

        if alive:
            try:
                connector.refresh_account_snapshot()
                bus.publish(Events.HEARTBEAT, {"status": "ok"}, source="heartbeat")
            except MT5ConnectionError as exc:
                logger.error("Heartbeat: connection looked alive but snapshot failed: %s", exc)
                alive = False

        if not alive:
            logger.warning("Heartbeat: MT5 connection is down. Attempting reconnect...")
            state.set_connection_status(ConnectionStatus.RECONNECTING)
            try:
                success = connector.reconnect()
                if not success:
                    logger.error("Heartbeat: reconnect failed after max attempts.")
            except Exception:
                # LiveAccountBlockedError or anything else fatal — reconnect()
                # already published MT5_RECONNECT_FAILED with fatal=True.
                # We do not retry past that; a human needs to look at it.
                logger.exception("Heartbeat: reconnect raised a fatal error. Not retrying.")
                self._stop_event.set()


# Single shared instance for the whole process.
heartbeat = HeartbeatMonitor()

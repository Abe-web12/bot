# bot/main_loop.py
"""Async main loop for the autonomous trading bot (Phase 1: no execution).

Per iteration:
  1. Run the iteration logic (read BotState, check kill-switch/mode, session gate).
  2. On success: build a status dict {mode, killSwitch, ok: True}.
  3. On failure: catch the exception, build {mode, killSwitch, ok: False, note},
     and fire an async Telegram alert.
  4. Write exactly ONE heartbeat at the END of the iteration, carrying that
     status (ok flag + note), so the dashboard always sees the latest state,
     including failures.

24/7 VPS design:
  - Graceful SIGINT/SIGTERM shutdown.
  - Exponential backoff after failures (capped) so a Neon blip can't spin.
  - Never crashes: a bad iteration is logged, alerted, recorded, and the loop
    continues.

Run:  python -m bot.main_loop
"""

from __future__ import annotations

import asyncio
import logging
import os
import signal
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv

# Prisma client is required at runtime; if it can't initialize (e.g. DB query
# engine unreachable), we handle it gracefully in `run()`.
from prisma import Prisma  # prisma-client-py




from bot.notifier import notify_async
from bot.session_gate import evaluate_sessions


# ─────────────────────────────────────────────────────────────
# Explicit dotenv initialization (must be at the very top)
# ─────────────────────────────────────────────────────────────

_ENV_CANDIDATES = [
    # Preferred: bot/.env
    Path(__file__).resolve().parent / ".env",
    # Fallback: repo root .env
    Path(__file__).resolve().parent.parent / ".env",
]

_loaded = False
for _p in _ENV_CANDIDATES:
    if _p.exists() and _p.is_file():
        load_dotenv(dotenv_path=_p, override=False)
        _loaded = True
        break

if not _loaded:
    # Still attempt default loading (in case user already exported vars).
    load_dotenv(override=False)


def _try_get_database_url() -> Optional[str]:
    # Returns DATABASE_URL if present after dotenv loading; otherwise None.
    return os.getenv("DATABASE_URL")


def _require_database_url() -> str:
    db_url = _try_get_database_url()
    if db_url:
        return db_url

    candidate_paths = [str(p) for p in _ENV_CANDIDATES]
    raise RuntimeError(
        "DATABASE_URL not found in environment (after dotenv load). "
        "Create a .env file at one of: "
        + ", ".join(candidate_paths)
    )



# ─────────────────────────────────────────────────────────────
# Config
# ─────────────────────────────────────────────────────────────

LOOP_INTERVAL_SECONDS = 5.0
MAX_BACKOFF_SECONDS = 60.0
BOT_STATE_ID = "singleton"
HEARTBEAT_ID = "singleton"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-7s %(name)s: %(message)s",
)
logger = logging.getLogger("bot.main_loop")


# ─────────────────────────────────────────────────────────────
# Iteration status (returned by the work fn, written to the heartbeat)
# ─────────────────────────────────────────────────────────────


@dataclass
class IterationStatus:
    mode: Optional[str] = None
    kill_switch: bool = False
    ok: bool = True
    note: Optional[str] = None

    def as_dict(self) -> dict[str, Any]:
        return {
            "mode": self.mode,
            "killSwitch": self.kill_switch,
            "ok": self.ok,
            "note": self.note,
        }


# ─────────────────────────────────────────────────────────────
# Graceful shutdown
# ─────────────────────────────────────────────────────────────


class _Shutdown:
    def __init__(self) -> None:
        self.requested = False

    def request(self, signum, _frame) -> None:
        logger.info("Received signal %s; will stop after current iteration.", signum)
        self.requested = True


_shutdown = _Shutdown()


# ─────────────────────────────────────────────────────────────
# DB helpers
# ─────────────────────────────────────────────────────────────


async def _load_bot_state(db: Prisma) -> Optional[dict]:
    row = await db.botstate.find_unique(where={"id": BOT_STATE_ID})
    if row is None:
        return None
    return {
        "mode": row.mode,
        "killSwitch": row.killSwitch,
        "activeStrategy": row.activeStrategy,
        "maxOpenTrades": row.maxOpenTrades,
        "maxDailyLossPct": row.maxDailyLossPct,
    }


async def _load_session_windows(db: Prisma) -> list[dict]:
    rows = await db.sessionwindow.find_many(where={"enabled": True})
    return [
        {
            "sessionName": r.sessionName,
            "startMinuteUtc": r.startMinuteUtc,
            "endMinuteUtc": r.endMinuteUtc,
            "enabled": r.enabled,
            "tradingEnabled": r.tradingEnabled,
            "symbols": r.symbols or [],
        }
        for r in rows
    ]


async def _write_heartbeat(db: Prisma, loop_count: int, status: IterationStatus) -> None:
    """Write exactly one heartbeat at the end of an iteration.

    Fail-soft: if the BotHeartbeat table/mapping isn't available yet, skip.
    """

    now = datetime.now(timezone.utc)
    try:
        await db.botheartbeat.upsert(
            where={"id": HEARTBEAT_ID},

            data={
                "create": {
                    "id": HEARTBEAT_ID,
                    "lastBeatAt": now,
                    "loopCount": loop_count,
                    "mode": status.mode,
                    "killSwitch": status.kill_switch,
                    "note": status.note if not status.ok else None,
                },
                "update": {
                    "lastBeatAt": now,
                    "loopCount": loop_count,
                    "mode": status.mode,
                    "killSwitch": status.kill_switch,
                    "note": status.note if not status.ok else None,
                },
            },
        )
        logger.info(
            "Heartbeat sent (loop=%d, ok=%s%s).",
            loop_count,
            status.ok,
            "" if status.ok else f", note={status.note!r}",
        )
    except Exception as exc:
        logger.warning("Heartbeat write skipped (%s): %s", exc.__class__.__name__, exc)


# ─────────────────────────────────────────────────────────────
# Iteration logic (no trading in Phase 1). Returns an IterationStatus.
# ─────────────────────────────────────────────────────────────


async def _run_iteration(db: Prisma) -> IterationStatus:
    state = await _load_bot_state(db)

    if state is None:
        logger.info("No BotState row -> treating as DISABLED.")
        return IterationStatus(mode="DISABLED", kill_switch=False, ok=True)

    mode = state["mode"]
    kill = state["killSwitch"]
    logger.info("Kill-switch: %s | Mode: %s", "ON" if kill else "OFF", mode)

    if kill:
        logger.warning("Kill-switch ENGAGED -> no actions.")
        return IterationStatus(mode=mode, kill_switch=True, ok=True)

    if mode == "DISABLED":
        logger.info("Mode DISABLED -> idle.")
        return IterationStatus(mode=mode, kill_switch=False, ok=True)

    windows = await _load_session_windows(db)
    check = evaluate_sessions(windows, now=datetime.now(timezone.utc))
    logger.info(
        "Session allowed: %s (%s)%s",
        check.is_trading_allowed,
        check.reason,
        f" [active: {check.active_session}]" if check.active_session else "",
    )

    if mode in ("SEMI_AUTO", "FULL_AUTO") and check.is_trading_allowed:
        logger.info("[Phase 1] Would evaluate strategy here (execution not built).")
    elif mode == "OBSERVE":
        logger.info("[Phase 1] OBSERVE -> would generate signals only.")

    return IterationStatus(mode=mode, kill_switch=kill, ok=True)


# ─────────────────────────────────────────────────────────────
# Loop runner
# ─────────────────────────────────────────────────────────────


async def run() -> None:
    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            signal.signal(sig, _shutdown.request)
        except (ValueError, OSError):
            pass

    if Prisma is None:
        logger.error("Prisma client not installed (module 'prisma' missing).")
        while not _shutdown.requested:
            await asyncio.sleep(5.0)
        return

    db = Prisma()

    # Keep process alive and retry with exponential backoff until the DB
    # query engine is reachable.
    backoff = LOOP_INTERVAL_SECONDS
    while not _shutdown.requested:
        try:
            await db.connect()
            logger.info("Connected to database. Entering main loop.")
            break
        except Exception as exc:
            logger.exception(
                "Database connection failed; retrying in %.1fs (error: %s)",
                backoff,
                exc,
            )
            await asyncio.sleep(backoff)
            backoff = min(backoff * 2, MAX_BACKOFF_SECONDS)

    if _shutdown.requested:
        await db.disconnect()
        return




    loop_count = 0
    backoff = LOOP_INTERVAL_SECONDS

    try:
        while not _shutdown.requested:
            loop_count += 1

            try:
                status = await _run_iteration(db)
                backoff = LOOP_INTERVAL_SECONDS  # reset after a clean run
            except Exception as exc:
                logger.exception("Iteration %d failed: %s", loop_count, exc)
                status = IterationStatus(
                    mode=None,
                    kill_switch=False,
                    ok=False,
                    note=f"{exc.__class__.__name__}: {exc}",
                )
                await notify_async(f"Bot failure: {exc}", level="ERROR")
                backoff = min(backoff * 2, MAX_BACKOFF_SECONDS)
                logger.info("Backing off %.1fs.", backoff)

            await _write_heartbeat(db, loop_count, status)

            slept = 0.0
            while slept < backoff and not _shutdown.requested:
                await asyncio.sleep(min(0.5, backoff - slept))
                slept += 0.5
    finally:
        await db.disconnect()
        logger.info("Disconnected. Stopped cleanly after %d iterations.", loop_count)


def main() -> None:
    # Validate env early, but don't hard-fail on missing DB connectivity.
    _require_database_url()

    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        logger.info("Interrupted.")
    except Exception as exc:
        # If DB connection fails at startup, log a clear error and exit
        # non-zero so supervisors know it didn't start.
        logger.exception("Fatal startup error: %s", exc)
        raise



if __name__ == "__main__":
    main()


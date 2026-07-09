"""
logging_setup.py
=================
Structured JSON logging with correlation IDs, thread context, and log
rotation. Call configure_logging() exactly once at process start.

Design:
  - All log records are written as JSON to logs/bot.json.log — machine
    parseable for log aggregators (Datadog, CloudWatch, Loki, etc.)
  - A human-readable format is still written to the console and
    logs/bot.log for developer ergonomics during development.
  - A ContextVar-backed correlation_id is attached to every record by
    the JsonFormatter so tracing a request across log lines is possible
    by filtering on correlation_id.
  - Log rotation: max 10 MB per file, 5 backups — same as before.
"""

from __future__ import annotations

import contextvars
import json
import logging
import logging.handlers
import os
import threading
import traceback
from datetime import datetime, timezone

import config

# ---------------------------------------------------------------------------
# Correlation ID context variable — set per-request/intent, propagates
# automatically to child threads via contextvars copy-on-create semantics.
# ---------------------------------------------------------------------------
correlation_id_var: contextvars.ContextVar[str] = contextvars.ContextVar(
    "correlation_id", default=""
)


def set_correlation_id(cid: str) -> None:
    correlation_id_var.set(cid)


def get_correlation_id() -> str:
    return correlation_id_var.get("")


# ---------------------------------------------------------------------------
# JSON formatter — every field is explicit so downstream consumers don't
# have to parse free-form strings.
# ---------------------------------------------------------------------------
class _JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        doc: dict = {
            "ts": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "module": record.module,
            "func": record.funcName,
            "line": record.lineno,
            "thread": record.threadName,
            "pid": os.getpid(),
            "correlation_id": get_correlation_id(),
            "msg": record.getMessage(),
        }

        # Attach structured extra fields injected via logger.info(..., extra={...})
        for key in (
            "execution_id", "trade_id", "ticket", "symbol", "request_id",
            "latency_ms", "retcode", "side", "volume",
        ):
            if hasattr(record, key):
                doc[key] = getattr(record, key)

        if record.exc_info:
            doc["exception"] = {
                "type": record.exc_info[0].__name__ if record.exc_info[0] else None,
                "message": str(record.exc_info[1]) if record.exc_info[1] else None,
                "traceback": traceback.format_exception(*record.exc_info),
            }

        return json.dumps(doc, default=str)


# ---------------------------------------------------------------------------
# Human-readable formatter for console / plain-text file
# ---------------------------------------------------------------------------
_PLAIN_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
_PLAIN_DATE = "%Y-%m-%d %H:%M:%S"


def configure_logging() -> None:
    """Configure the root logger. Call once at process start."""
    os.makedirs("logs", exist_ok=True)

    root = logging.getLogger()
    # Clear any handlers added by a previous call (e.g. during tests)
    root.handlers.clear()
    root.setLevel(getattr(logging, config.LOG_LEVEL, logging.INFO))

    max_bytes = config.LOG_MAX_SIZE * 1024 * 1024
    backup_count = config.LOG_BACKUP_COUNT

    plain_fmt = logging.Formatter(fmt=_PLAIN_FORMAT, datefmt=_PLAIN_DATE)
    json_fmt = _JsonFormatter()

    # 1. Console — human readable
    console = logging.StreamHandler()
    console.setFormatter(plain_fmt)
    root.addHandler(console)

    # 2. Plain rotating file — human readable
    plain_handler = logging.handlers.RotatingFileHandler(
        "logs/bot.log", maxBytes=max_bytes, backupCount=backup_count, encoding="utf-8"
    )
    plain_handler.setFormatter(plain_fmt)
    root.addHandler(plain_handler)

    # 3. JSON rotating file — structured, machine-parseable
    json_handler = logging.handlers.RotatingFileHandler(
        "logs/bot.json.log", maxBytes=max_bytes, backupCount=backup_count, encoding="utf-8"
    )
    json_handler.setFormatter(json_fmt)
    root.addHandler(json_handler)

    # 4. Errors-only plain rotating file
    error_handler = logging.handlers.RotatingFileHandler(
        "logs/errors.log", maxBytes=max_bytes, backupCount=backup_count, encoding="utf-8"
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(plain_fmt)
    root.addHandler(error_handler)

    logging.getLogger(__name__).info(
        "Structured JSON logging configured. Level=%s JSON→logs/bot.json.log",
        config.LOG_LEVEL,
    )

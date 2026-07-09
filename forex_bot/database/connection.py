"""
connection.py
==============
Database connection, session factory, and Unit-of-Work context manager.

Business logic never creates sessions directly — it uses the
unit_of_work() context manager which handles commit/rollback
atomically. This is the single place where connection pooling and
engine configuration live.

SQLite WAL mode is enabled for better concurrent read/write performance
(the bot writes positions while the API reads metrics simultaneously).
The architecture is deliberately agnostic to dialect: swap DATABASE_URL
in .env from sqlite:/// to postgresql+psycopg2:// and nothing else
changes.
"""

from __future__ import annotations

import logging
import os
from contextlib import contextmanager
from typing import Generator

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import Session, sessionmaker

import config
from database.models import Base

logger = logging.getLogger("database.connection")

_engine = None
_SessionLocal: sessionmaker | None = None


def _get_engine():
    global _engine
    if _engine is None:
        _engine = _create_engine()
    return _engine


def _create_engine():
    db_url = config.DATABASE_URL
    connect_args = {}

    if db_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
        # Ensure the directory exists for the SQLite file.
        db_path = db_url.replace("sqlite:///", "")
        db_dir = os.path.dirname(db_path)
        if db_dir:
            os.makedirs(db_dir, exist_ok=True)

    engine = create_engine(
        db_url,
        connect_args=connect_args,
        pool_pre_ping=True,          # verify connections before use
        pool_recycle=3600,           # recycle connections hourly
        echo=False,                  # set True for SQL debug logging
    )

    if db_url.startswith("sqlite"):
        @event.listens_for(engine, "connect")
        def _set_sqlite_pragmas(dbapi_conn, connection_record):
            cursor = dbapi_conn.cursor()
            cursor.execute("PRAGMA journal_mode=WAL")
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.execute("PRAGMA busy_timeout=5000")
            cursor.close()

    logger.info("Database engine created: %s", db_url.split("@")[-1])  # hide credentials
    return engine


def _get_session_factory() -> sessionmaker:
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(
            bind=_get_engine(),
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
        )
    return _SessionLocal


def init_db() -> None:
    """
    Create all tables that don't yet exist. Called once at startup.
    Does NOT drop existing tables — safe to call repeatedly.
    """
    engine = _get_engine()
    Base.metadata.create_all(engine)
    logger.info("Database schema initialised (tables created if missing).")


def get_session() -> Session:
    """Return a new session. Caller is responsible for close()."""
    factory = _get_session_factory()
    return factory()


@contextmanager
def unit_of_work() -> Generator[Session, None, None]:
    """
    Context manager providing a transactional unit of work.
    Commits on clean exit, rolls back on any exception.

    Usage:
        with unit_of_work() as session:
            session.add(record)
    """
    session = get_session()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def check_connection() -> tuple[bool, str]:
    """
    Verify the database is reachable. Returns (ok, message).
    Used by health check endpoints. Routed through database_circuit so
    repeated DB outages trip the breaker and are visible in /metrics —
    this specific probe is low-stakes to wrap (read-only SELECT 1), but
    keeping it consistent with every other external dependency means
    the circuit breaker dashboard reflects true DB health, not just
    MT5/Telegram/Gemini.
    """
    from core.circuit_breaker import CircuitOpenError, database_circuit

    def _probe() -> None:
        with unit_of_work() as session:
            session.execute(text("SELECT 1"))

    try:
        database_circuit.execute(_probe)
        return True, "Database reachable."
    except CircuitOpenError as exc:
        return False, f"Database circuit breaker open: {exc}"
    except Exception as exc:
        return False, f"Database unreachable: {exc}"

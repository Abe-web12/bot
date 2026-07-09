"""
migrations.py
==============
Lightweight migration runner. No Alembic dependency — migrations are
plain SQL strings with version numbers and checksums. The runner applies
each migration exactly once, verified by the SchemaVersion table.

Rollback: each migration entry carries a down_sql. Call
rollback_to(version) to reverse applied migrations down to a target
version. Rollback is intentionally explicit — never automatic.

Adding a new migration:
  1. Append a new Migration(version=N+1, ...) to MIGRATIONS.
  2. Write both up_sql and down_sql.
  3. Never modify an existing migration — it will fail the checksum
     check if modified after being applied.
"""

from __future__ import annotations

import hashlib
import logging
from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import inspect, text

from database.connection import get_session, unit_of_work
from database.models import Base, SchemaVersion

logger = logging.getLogger("database.migrations")


@dataclass
class Migration:
    version: int
    description: str
    up_sql: str
    down_sql: str

    def checksum(self) -> str:
        return hashlib.sha256(self.up_sql.encode()).hexdigest()


# ---------------------------------------------------------------------------
# All migrations — append only, never modify existing entries.
# ---------------------------------------------------------------------------
MIGRATIONS: list[Migration] = [
    Migration(
        version=1,
        description="Create schema_version table",
        up_sql="""
            CREATE TABLE IF NOT EXISTS schema_version (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                version INTEGER NOT NULL UNIQUE,
                description VARCHAR(200) NOT NULL,
                applied_at DATETIME NOT NULL,
                checksum VARCHAR(64),
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        """,
        down_sql="DROP TABLE IF EXISTS schema_version;",
    ),
    Migration(
        version=2,
        description="Create trade_intents persistent queue table",
        up_sql="""
            CREATE TABLE IF NOT EXISTS trade_intents (
                execution_id VARCHAR(36) PRIMARY KEY,
                symbol VARCHAR(20) NOT NULL,
                side VARCHAR(4) NOT NULL,
                stop_loss_price REAL NOT NULL,
                take_profit_price REAL NOT NULL,
                confidence REAL NOT NULL,
                magic_number INTEGER NOT NULL,
                comment VARCHAR(100),
                status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                mt5_ticket INTEGER,
                filled_price REAL,
                filled_volume REAL,
                rejection_reason TEXT,
                queued_at DATETIME NOT NULL,
                processed_at DATETIME,
                idempotency_key VARCHAR(100) UNIQUE,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_ti_status ON trade_intents(status);
            CREATE INDEX IF NOT EXISTS idx_ti_symbol_magic ON trade_intents(symbol, magic_number);
            CREATE INDEX IF NOT EXISTS idx_ti_queued_at ON trade_intents(queued_at);
        """,
        down_sql="DROP TABLE IF EXISTS trade_intents;",
    ),
    Migration(
        version=3,
        description="Create trades audit table",
        up_sql="""
            CREATE TABLE IF NOT EXISTS trades (
                id VARCHAR(36) PRIMARY KEY,
                execution_id VARCHAR(36),
                mt5_ticket INTEGER NOT NULL UNIQUE,
                symbol VARCHAR(20) NOT NULL,
                side VARCHAR(4) NOT NULL,
                open_price REAL NOT NULL,
                close_price REAL,
                volume REAL NOT NULL,
                stop_loss REAL,
                take_profit REAL,
                profit REAL,
                swap REAL DEFAULT 0.0,
                commission REAL DEFAULT 0.0,
                magic_number INTEGER NOT NULL,
                comment VARCHAR(100),
                open_time DATETIME NOT NULL,
                close_time DATETIME,
                is_closed INTEGER NOT NULL DEFAULT 0,
                close_reason VARCHAR(50),
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_trade_symbol ON trades(symbol);
            CREATE INDEX IF NOT EXISTS idx_trade_open_time ON trades(open_time);
            CREATE INDEX IF NOT EXISTS idx_trade_is_closed ON trades(is_closed);
        """,
        down_sql="DROP TABLE IF EXISTS trades;",
    ),
    Migration(
        version=4,
        description="Create equity_snapshots table",
        up_sql="""
            CREATE TABLE IF NOT EXISTS equity_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                balance REAL NOT NULL,
                equity REAL NOT NULL,
                margin REAL NOT NULL,
                free_margin REAL NOT NULL,
                drawdown_pct REAL,
                open_trades INTEGER NOT NULL DEFAULT 0,
                snapshotted_at DATETIME NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_eq_snapshot_time ON equity_snapshots(snapshotted_at);
        """,
        down_sql="DROP TABLE IF EXISTS equity_snapshots;",
    ),
    Migration(
        version=5,
        description="Create idempotency_records table",
        up_sql="""
            CREATE TABLE IF NOT EXISTS idempotency_records (
                key VARCHAR(100) PRIMARY KEY,
                operation VARCHAR(50) NOT NULL,
                status VARCHAR(20) NOT NULL,
                result_summary TEXT,
                completed_at DATETIME,
                expires_at DATETIME,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_idem_operation ON idempotency_records(operation);
            CREATE INDEX IF NOT EXISTS idx_idem_status ON idempotency_records(status);
        """,
        down_sql="DROP TABLE IF EXISTS idempotency_records;",
    ),
    Migration(
        version=6,
        description="Create bot_events audit log table",
        up_sql="""
            CREATE TABLE IF NOT EXISTS bot_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_name VARCHAR(60) NOT NULL,
                source VARCHAR(60),
                payload_json TEXT,
                correlation_id VARCHAR(36),
                occurred_at DATETIME NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_event_name ON bot_events(event_name);
            CREATE INDEX IF NOT EXISTS idx_event_occurred ON bot_events(occurred_at);
        """,
        down_sql="DROP TABLE IF EXISTS bot_events;",
    ),
    Migration(
        version=7,
        description="Create journal_entries table for automatic journal",
        up_sql="""
            CREATE TABLE IF NOT EXISTS journal_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entry_type VARCHAR(40) NOT NULL,
                symbol VARCHAR(20),
                side VARCHAR(4),
                price REAL,
                confidence REAL,
                reason TEXT,
                execution_id VARCHAR(36),
                mt5_ticket INTEGER,
                payload_json TEXT,
                occurred_at DATETIME NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_journal_type ON journal_entries(entry_type);
            CREATE INDEX IF NOT EXISTS idx_journal_symbol ON journal_entries(symbol);
            CREATE INDEX IF NOT EXISTS idx_journal_occurred ON journal_entries(occurred_at);
        """,
        down_sql="DROP TABLE IF EXISTS journal_entries;",
    ),
    Migration(
        version=8,
        description="Create refresh_tokens table for JWT refresh rotation/revocation",
        up_sql="""
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                jti VARCHAR(36) PRIMARY KEY,
                role VARCHAR(20) NOT NULL,
                is_revoked INTEGER NOT NULL DEFAULT 0,
                expires_at DATETIME NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_refresh_expires ON refresh_tokens(expires_at);
        """,
        down_sql="DROP TABLE IF EXISTS refresh_tokens;",
    ),
    Migration(
        version=9,
        description="Create audit_logs table",
        up_sql="""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action VARCHAR(60) NOT NULL,
                role VARCHAR(20),
                success INTEGER NOT NULL DEFAULT 1,
                ip_address VARCHAR(64),
                detail TEXT,
                occurred_at DATETIME NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
            CREATE INDEX IF NOT EXISTS idx_audit_occurred ON audit_logs(occurred_at);
        """,
        down_sql="DROP TABLE IF EXISTS audit_logs;",
    ),
    Migration(
        version=10,
        description="Create users table",
        up_sql="""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                username VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'trader',
                is_active INTEGER NOT NULL DEFAULT 1,
                is_verified INTEGER NOT NULL DEFAULT 0,
                display_name VARCHAR(100),
                avatar_url VARCHAR(500),
                preferences_json TEXT,
                last_login_at DATETIME,
                last_login_ip VARCHAR(64),
                login_count INTEGER NOT NULL DEFAULT 0,
                metadata_json TEXT,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_user_username ON users(username);
            CREATE INDEX IF NOT EXISTS idx_user_role ON users(role);
        """,
        down_sql="DROP TABLE IF EXISTS users;",
    ),
    Migration(
        version=11,
        description="Create workspaces and workspace_members tables",
        up_sql="""
            CREATE TABLE IF NOT EXISTS workspaces (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                slug VARCHAR(100) NOT NULL UNIQUE,
                owner_id VARCHAR(36) NOT NULL,
                is_default INTEGER NOT NULL DEFAULT 0,
                settings_json TEXT,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_workspace_slug ON workspaces(slug);
            CREATE INDEX IF NOT EXISTS idx_workspace_owner ON workspaces(owner_id);
            CREATE TABLE IF NOT EXISTS workspace_members (
                id VARCHAR(36) PRIMARY KEY,
                workspace_id VARCHAR(36) NOT NULL,
                user_id VARCHAR(36) NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'member',
                joined_at DATETIME NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(workspace_id, user_id)
            );
            CREATE INDEX IF NOT EXISTS idx_wm_workspace ON workspace_members(workspace_id);
            CREATE INDEX IF NOT EXISTS idx_wm_user ON workspace_members(user_id);
        """,
        down_sql="DROP TABLE IF EXISTS workspace_members; DROP TABLE IF EXISTS workspaces;",
    ),
    Migration(
        version=12,
        description="Create subscription_plans and user_subscriptions tables",
        up_sql="""
            CREATE TABLE IF NOT EXISTS subscription_plans (
                id VARCHAR(36) PRIMARY KEY,
                plan_id VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price_monthly INTEGER NOT NULL DEFAULT 0,
                price_yearly INTEGER NOT NULL DEFAULT 0,
                features_json TEXT,
                is_active INTEGER NOT NULL DEFAULT 1,
                sort_order INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_plan_id ON subscription_plans(plan_id);
            CREATE TABLE IF NOT EXISTS user_subscriptions (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL UNIQUE,
                plan_id VARCHAR(36) NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'active',
                current_period_start DATETIME NOT NULL,
                current_period_end DATETIME,
                cancelled_at DATETIME,
                stripe_subscription_id VARCHAR(100),
                metadata_json TEXT,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_user_sub_user ON user_subscriptions(user_id);
            CREATE INDEX IF NOT EXISTS idx_user_sub_status ON user_subscriptions(status);
        """,
        down_sql="DROP TABLE IF EXISTS user_subscriptions; DROP TABLE IF EXISTS subscription_plans;",
    ),
    Migration(
        version=13,
        description="Create user_sessions table",
        up_sql="""
            CREATE TABLE IF NOT EXISTS user_sessions (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                refresh_jti VARCHAR(36) NOT NULL UNIQUE,
                ip_address VARCHAR(64),
                user_agent VARCHAR(500),
                device_name VARCHAR(200),
                is_revoked INTEGER NOT NULL DEFAULT 0,
                expires_at DATETIME NOT NULL,
                last_activity_at DATETIME,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_session_user ON user_sessions(user_id);
            CREATE INDEX IF NOT EXISTS idx_session_jti ON user_sessions(refresh_jti);
            CREATE INDEX IF NOT EXISTS idx_session_expires ON user_sessions(expires_at);
        """,
        down_sql="DROP TABLE IF EXISTS user_sessions;",
    ),
    Migration(
        version=14,
        description="Create api_keys table",
        up_sql="""
            CREATE TABLE IF NOT EXISTS api_keys (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                name VARCHAR(100) NOT NULL,
                key_hash VARCHAR(255) NOT NULL,
                key_prefix VARCHAR(4) NOT NULL,
                permissions_json TEXT,
                expires_at DATETIME,
                last_used_at DATETIME,
                is_active INTEGER NOT NULL DEFAULT 1,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_apikey_user ON api_keys(user_id);
            CREATE INDEX IF NOT EXISTS idx_apikey_hash ON api_keys(key_hash);
        """,
        down_sql="DROP TABLE IF EXISTS api_keys;",
    ),
    Migration(
        version=15,
        description="Create email_verifications table",
        up_sql="""
            CREATE TABLE IF NOT EXISTS email_verifications (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                email VARCHAR(255) NOT NULL,
                token VARCHAR(255) NOT NULL UNIQUE,
                expires_at DATETIME NOT NULL,
                verified_at DATETIME,
                is_used INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_email_ver_token ON email_verifications(token);
            CREATE INDEX IF NOT EXISTS idx_email_ver_user ON email_verifications(user_id);
        """,
        down_sql="DROP TABLE IF EXISTS email_verifications;",
    ),
    Migration(
        version=16,
        description="Create password_resets table",
        up_sql="""
            CREATE TABLE IF NOT EXISTS password_resets (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                email VARCHAR(255) NOT NULL,
                token VARCHAR(255) NOT NULL UNIQUE,
                expires_at DATETIME NOT NULL,
                used_at DATETIME,
                is_used INTEGER NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_pw_reset_token ON password_resets(token);
            CREATE INDEX IF NOT EXISTS idx_pw_reset_user ON password_resets(user_id);
        """,
        down_sql="DROP TABLE IF EXISTS password_resets;",
    ),
    Migration(
        version=17,
        description="Seed default subscription plans (free/starter/pro/enterprise)",
        up_sql="""
            INSERT OR IGNORE INTO subscription_plans
                (id, plan_id, name, description, price_monthly, price_yearly,
                 features_json, is_active, sort_order, created_at, updated_at)
            SELECT 'plan-free-0001','free','Free','Free tier',0,0,
                   '{"max_workspaces":1,"max_members":1,"max_api_keys":0,"max_symbols":2,"max_trades_per_day":10,"includes_ai":false,"includes_telegram":false,"historical_data_days":7,"chart_indicators":true,"export_csv":true,"export_xlsx":false,"priority_support":false}',
                   1,0,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
            WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE plan_id='free');
            INSERT OR IGNORE INTO subscription_plans
                (id, plan_id, name, description, price_monthly, price_yearly,
                 features_json, is_active, sort_order, created_at, updated_at)
            SELECT 'plan-starter-001','starter','Starter','Starter tier',2900,29000,
                   '{"max_workspaces":1,"max_members":2,"max_api_keys":1,"max_symbols":4,"max_trades_per_day":50,"includes_ai":true,"includes_telegram":false,"historical_data_days":30,"chart_indicators":true,"export_csv":true,"export_xlsx":true,"priority_support":false}',
                   1,1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
            WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE plan_id='starter');
            INSERT OR IGNORE INTO subscription_plans
                (id, plan_id, name, description, price_monthly, price_yearly,
                 features_json, is_active, sort_order, created_at, updated_at)
            SELECT 'plan-pro-000001','pro','Pro','Pro tier',7900,79000,
                   '{"max_workspaces":3,"max_members":5,"max_api_keys":5,"max_symbols":10,"max_trades_per_day":200,"includes_ai":true,"includes_telegram":true,"historical_data_days":90,"chart_indicators":true,"export_csv":true,"export_xlsx":true,"priority_support":false}',
                   1,2,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
            WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE plan_id='pro');
            INSERT OR IGNORE INTO subscription_plans
                (id, plan_id, name, description, price_monthly, price_yearly,
                 features_json, is_active, sort_order, created_at, updated_at)
            SELECT 'plan-ent-000001','enterprise','Enterprise','Enterprise tier',29900,299000,
                   '{"max_workspaces":10,"max_members":50,"max_api_keys":50,"max_symbols":50,"max_trades_per_day":10000,"includes_ai":true,"includes_telegram":true,"historical_data_days":365,"chart_indicators":true,"export_csv":true,"export_xlsx":true,"priority_support":true}',
                   1,3,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
            WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE plan_id='enterprise')
        """,
        down_sql="DELETE FROM subscription_plans WHERE plan_id IN ('free','starter','pro','enterprise');",
    ),
]


class MigrationError(Exception):
    pass


class MigrationRunner:
    def __init__(self) -> None:
        self._session_factory = get_session

    def _ensure_schema_version_table(self, session) -> None:
        """Bootstrap: create schema_version if it doesn't exist yet."""
        inspector = inspect(session.get_bind())
        if "schema_version" not in inspector.get_table_names():
            session.execute(text(MIGRATIONS[0].up_sql))
            session.commit()
            logger.info("Created schema_version table (bootstrap).")

    def _applied_versions(self, session) -> set[int]:
        rows = session.execute(text("SELECT version FROM schema_version")).fetchall()
        return {row[0] for row in rows}

    def _record_version(self, session, migration: Migration) -> None:
        now = datetime.now(timezone.utc).isoformat()
        session.execute(
            text(
                "INSERT INTO schema_version "
                "(version, description, applied_at, checksum, created_at, updated_at) "
                "VALUES (:v, :d, :a, :c, :ca, :ua)"
            ),
            {
                "v": migration.version,
                "d": migration.description,
                "a": now,
                "c": migration.checksum(),
                "ca": now,
                "ua": now,
            },
        )

    def _verify_checksum(self, session, migration: Migration) -> None:
        row = session.execute(
            text("SELECT checksum FROM schema_version WHERE version = :v"),
            {"v": migration.version},
        ).fetchone()
        if row and row[0] and row[0] != migration.checksum():
            raise MigrationError(
                f"Migration v{migration.version} checksum mismatch — "
                f"the migration was modified after being applied. "
                f"This is not allowed. Stored={row[0][:12]}... Current={migration.checksum()[:12]}..."
            )

    def run_all(self) -> list[int]:
        """
        Apply all pending migrations in order. Returns list of applied
        version numbers. Safe to call multiple times — already-applied
        migrations are skipped.
        """
        session = get_session()
        try:
            self._ensure_schema_version_table(session)
            applied = self._applied_versions(session)
            newly_applied: list[int] = []

            for migration in sorted(MIGRATIONS, key=lambda m: m.version):
                if migration.version == 1:
                    # v1 is the bootstrap migration, always applied by
                    # _ensure_schema_version_table above.
                    if 1 not in applied:
                        self._record_version(session, migration)
                        session.commit()
                    continue

                if migration.version in applied:
                    self._verify_checksum(session, migration)
                    continue

                logger.info(
                    "Applying migration v%d: %s", migration.version, migration.description
                )
                for statement in migration.up_sql.strip().split(";"):
                    stmt = statement.strip()
                    if stmt:
                        # Use raw DBAPI execute to bypass SQLAlchemy's bind
                        # parameter parsing — required for migrations that
                        # contain JSON literals with colons (e.g. v17 seed data).
                        conn = session.connection()
                        conn.connection.execute(stmt)

                self._record_version(session, migration)
                session.commit()
                newly_applied.append(migration.version)
                logger.info("Migration v%d applied successfully.", migration.version)

            if newly_applied:
                logger.info("Applied %d new migration(s): %s", len(newly_applied), newly_applied)
            else:
                logger.info("Database schema is up to date (no migrations pending).")

            return newly_applied

        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def rollback_to(self, target_version: int) -> list[int]:
        """
        Roll back migrations DOWN to target_version (exclusive — the
        target version itself remains applied). Returns list of rolled
        back version numbers.
        """
        session = get_session()
        try:
            self._ensure_schema_version_table(session)
            applied = self._applied_versions(session)
            to_rollback = sorted(
                [v for v in applied if v > target_version], reverse=True
            )

            if not to_rollback:
                logger.info("Nothing to roll back — already at or below v%d.", target_version)
                return []

            rolled_back: list[int] = []
            migration_map = {m.version: m for m in MIGRATIONS}

            for version in to_rollback:
                migration = migration_map.get(version)
                if not migration:
                    raise MigrationError(f"No migration definition found for v{version}.")

                logger.warning("Rolling back migration v%d: %s", version, migration.description)
                for statement in migration.down_sql.strip().split(";"):
                    stmt = statement.strip()
                    if stmt:
                        session.execute(text(stmt))

                session.execute(
                    text("DELETE FROM schema_version WHERE version = :v"), {"v": version}
                )
                session.commit()
                rolled_back.append(version)
                logger.info("Migration v%d rolled back.", version)

            return rolled_back

        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    def current_version(self) -> int:
        """Returns the highest applied migration version, or 0 if none."""
        session = get_session()
        try:
            self._ensure_schema_version_table(session)
            row = session.execute(
                text("SELECT MAX(version) FROM schema_version")
            ).fetchone()
            return row[0] or 0
        finally:
            session.close()

    def integrity_check(self) -> list[str]:
        """
        Verifies checksums of all applied migrations. Returns a list of
        error messages (empty = all good).
        """
        session = get_session()
        errors: list[str] = []
        try:
            self._ensure_schema_version_table(session)
            applied = self._applied_versions(session)
            migration_map = {m.version: m for m in MIGRATIONS}

            for version in applied:
                migration = migration_map.get(version)
                if not migration:
                    errors.append(f"v{version} is applied in DB but has no definition in code.")
                    continue
                try:
                    self._verify_checksum(session, migration)
                except MigrationError as exc:
                    errors.append(str(exc))
        finally:
            session.close()
        return errors


# Single shared instance.
migration_runner = MigrationRunner()

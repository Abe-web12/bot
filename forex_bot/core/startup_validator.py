"""
startup_validator.py
=====================
Runs before the bot starts trading. Every check is real — no fake
responses. If any CRITICAL check fails, the bot does not start.
WARNING checks are logged but do not block startup.

Checks (in order):
  1. Environment / .env file
  2. Required folders exist and are writable
  3. Database connectivity and schema integrity
  4. MT5 credentials format (actual connection tested in run.py)
  5. Telegram credentials (format + live ping)
  6. Gemini API key presence (connection optional — non-critical)
  7. Webhook secret strength
  8. Trading symbols defined
  9. Timeframes valid
 10. Risk parameters in sane ranges

Usage:
    from core.startup_validator import startup_validator
    report = startup_validator.run()
    if not report.can_start:
        sys.exit(1)
"""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger("startup_validator")


class Severity(str, Enum):
    CRITICAL = "CRITICAL"   # blocks startup
    WARNING = "WARNING"     # logged but startup continues
    INFO = "INFO"           # informational only


@dataclass
class CheckResult:
    name: str
    severity: Severity
    passed: bool
    message: str
    detail: str = ""


@dataclass
class StartupReport:
    checks: list[CheckResult] = field(default_factory=list)

    @property
    def can_start(self) -> bool:
        """True only if no CRITICAL checks failed."""
        return all(
            c.passed or c.severity != Severity.CRITICAL
            for c in self.checks
        )

    @property
    def failed_critical(self) -> list[CheckResult]:
        return [c for c in self.checks if not c.passed and c.severity == Severity.CRITICAL]

    @property
    def warnings(self) -> list[CheckResult]:
        return [c for c in self.checks if not c.passed and c.severity == Severity.WARNING]

    def log_summary(self) -> None:
        passed = sum(1 for c in self.checks if c.passed)
        total = len(self.checks)
        logger.info("Startup validation: %d/%d checks passed.", passed, total)
        for c in self.checks:
            if c.passed:
                logger.info("  ✅ [%s] %s: %s", c.severity.value, c.name, c.message)
            else:
                log_fn = logger.critical if c.severity == Severity.CRITICAL else logger.warning
                log_fn("  ❌ [%s] %s: %s %s", c.severity.value, c.name, c.message, c.detail)

        if not self.can_start:
            logger.critical(
                "STARTUP BLOCKED — %d critical check(s) failed: %s",
                len(self.failed_critical),
                [c.name for c in self.failed_critical],
            )


class StartupValidator:
    def run(self) -> StartupReport:
        report = StartupReport()
        checks = [
            self._check_env_file,
            self._check_required_folders,
            self._check_mt5_credentials,
            self._check_telegram_credentials,
            self._check_gemini_credentials,
            self._check_webhook_secret,
            self._check_database,
            self._check_database_schema,
            self._check_trading_symbols,
            self._check_timeframes,
            self._check_risk_parameters,
            self._check_mt5_health,
            self._check_jwt_secret,
        ]

        for check_fn in checks:
            try:
                result = check_fn()
                if isinstance(result, list):
                    report.checks.extend(result)
                else:
                    report.checks.append(result)
            except Exception as exc:
                report.checks.append(CheckResult(
                    name=check_fn.__name__,
                    severity=Severity.CRITICAL,
                    passed=False,
                    message="Check raised an unexpected exception.",
                    detail=str(exc),
                ))

        report.log_summary()
        return report

    # ------------------------------------------------------------------
    # Individual checks
    # ------------------------------------------------------------------

    def _check_env_file(self) -> CheckResult:
        env_path = os.path.join(os.getcwd(), ".env")
        if os.path.exists(env_path):
            return CheckResult(
                name=".env file",
                severity=Severity.INFO,
                passed=True,
                message=".env file found.",
            )
        return CheckResult(
            name=".env file",
            severity=Severity.WARNING,
            passed=False,
            message=".env file not found — using OS environment variables.",
            detail="Create .env from .env.example for local development.",
        )

    def _check_required_folders(self) -> list[CheckResult]:
        results = []
        required = ["logs", "database"]
        for folder in required:
            path = os.path.join(os.getcwd(), folder)
            try:
                os.makedirs(path, exist_ok=True)
                test_file = os.path.join(path, ".write_test")
                with open(test_file, "w") as f:
                    f.write("ok")
                os.remove(test_file)
                results.append(CheckResult(
                    name=f"folder:{folder}",
                    severity=Severity.CRITICAL,
                    passed=True,
                    message=f"Folder '{folder}' exists and is writable.",
                ))
            except OSError as exc:
                results.append(CheckResult(
                    name=f"folder:{folder}",
                    severity=Severity.CRITICAL,
                    passed=False,
                    message=f"Folder '{folder}' is not writable.",
                    detail=str(exc),
                ))
        return results

    def _check_mt5_credentials(self) -> list[CheckResult]:
        import config
        results = []

        login_ok = bool(config.MT5_LOGIN and str(config.MT5_LOGIN).isdigit())
        results.append(CheckResult(
            name="mt5_login",
            severity=Severity.CRITICAL,
            passed=login_ok,
            message="MT5 login is set." if login_ok else "MT5_LOGIN is missing or non-numeric.",
        ))

        pw_ok = bool(config.MT5_PASSWORD and config.MT5_PASSWORD != "YOUR_PASSWORD_HERE")
        results.append(CheckResult(
            name="mt5_password",
            severity=Severity.CRITICAL,
            passed=pw_ok,
            message="MT5 password is set." if pw_ok else "MT5_PASSWORD is missing or placeholder.",
            detail="" if pw_ok else "Set MT5_PASSWORD in .env",
        ))

        server_ok = bool(config.MT5_SERVER)
        results.append(CheckResult(
            name="mt5_server",
            severity=Severity.CRITICAL,
            passed=server_ok,
            message=f"MT5 server: {config.MT5_SERVER}" if server_ok else "MT5_SERVER is empty.",
        ))

        return results

    def _check_telegram_credentials(self) -> list[CheckResult]:
        import config
        results = []

        token_ok = bool(config.TELEGRAM_TOKEN and ":" in config.TELEGRAM_TOKEN)
        results.append(CheckResult(
            name="telegram_token",
            severity=Severity.WARNING,
            passed=token_ok,
            message="Telegram token is set." if token_ok else "TELEGRAM_TOKEN missing/invalid.",
            detail="" if token_ok else "Telegram notifications will be disabled.",
        ))

        chat_ok = bool(config.TELEGRAM_CHAT_ID)
        results.append(CheckResult(
            name="telegram_chat_id",
            severity=Severity.WARNING,
            passed=chat_ok,
            message="Telegram chat ID is set." if chat_ok else "TELEGRAM_CHAT_ID missing.",
        ))

        # Only try live ping if both credentials present
        if token_ok and chat_ok:
            ping_ok, ping_msg = self._ping_telegram(config.TELEGRAM_TOKEN)
            results.append(CheckResult(
                name="telegram_ping",
                severity=Severity.WARNING,
                passed=ping_ok,
                message=ping_msg,
            ))

        return results

    @staticmethod
    def _ping_telegram(token: str) -> tuple[bool, str]:
        try:
            import httpx
            r = httpx.get(
                f"https://api.telegram.org/bot{token}/getMe",
                timeout=5.0,
            )
            if r.status_code == 200:
                data = r.json()
                name = data.get("result", {}).get("username", "unknown")
                return True, f"Telegram bot reachable (@{name})."
            return False, f"Telegram API returned HTTP {r.status_code}."
        except Exception as exc:
            return False, f"Telegram ping failed: {exc}"

    def _check_gemini_credentials(self) -> CheckResult:
        import config
        key = getattr(config, "GEMINI_API_KEY", "")
        if key:
            return CheckResult(
                name="gemini_api_key",
                severity=Severity.INFO,
                passed=True,
                message="Gemini API key is set — AI features enabled.",
            )
        return CheckResult(
            name="gemini_api_key",
            severity=Severity.WARNING,
            passed=False,
            message="GEMINI_API_KEY not set — AI analysis features disabled.",
            detail="Set GEMINI_API_KEY in .env to enable Gemini integration.",
        )

    def _check_webhook_secret(self) -> CheckResult:
        import config
        secret = getattr(config, "WEBHOOK_SECRET", "")
        if secret and len(secret) >= 32:
            return CheckResult(
                name="webhook_secret",
                severity=Severity.INFO,
                passed=True,
                message="Webhook secret is set and strong (>=32 chars).",
            )
        if secret and len(secret) < 32:
            return CheckResult(
                name="webhook_secret",
                severity=Severity.WARNING,
                passed=False,
                message="WEBHOOK_SECRET is set but weak (<32 chars).",
                detail="Generate with: python -c \"import secrets; print(secrets.token_hex(32))\"",
            )
        return CheckResult(
            name="webhook_secret",
            severity=Severity.WARNING,
            passed=False,
            message="WEBHOOK_SECRET not set — webhook endpoints will reject all requests.",
            detail="Set WEBHOOK_SECRET in .env",
        )

    def _check_database(self) -> CheckResult:
        from database.connection import check_connection
        ok, msg = check_connection()
        return CheckResult(
            name="database_connection",
            severity=Severity.CRITICAL,
            passed=ok,
            message=msg,
        )

    def _check_database_schema(self) -> CheckResult:
        try:
            from database.migrations import migration_runner
            errors = migration_runner.integrity_check()
            if errors:
                return CheckResult(
                    name="database_schema",
                    severity=Severity.CRITICAL,
                    passed=False,
                    message="Migration integrity check failed.",
                    detail="; ".join(errors),
                )
            version = migration_runner.current_version()
            return CheckResult(
                name="database_schema",
                severity=Severity.INFO,
                passed=True,
                message=f"Schema at version {version}, integrity verified.",
            )
        except Exception as exc:
            return CheckResult(
                name="database_schema",
                severity=Severity.CRITICAL,
                passed=False,
                message="Cannot verify database schema.",
                detail=str(exc),
            )

    def _check_trading_symbols(self) -> CheckResult:
        import config
        symbols = getattr(config, "SYMBOLS", [])
        if symbols and len(symbols) > 0:
            return CheckResult(
                name="trading_symbols",
                severity=Severity.INFO,
                passed=True,
                message=f"Trading symbols configured: {symbols}",
            )
        return CheckResult(
            name="trading_symbols",
            severity=Severity.CRITICAL,
            passed=False,
            message="No trading symbols configured (SYMBOLS is empty).",
        )

    def _check_timeframes(self) -> CheckResult:
        import config
        from market.timeframes import UnknownTimeframeError, to_mt5
        bad = []
        for tf in [
            getattr(config, "TIMEFRAME_PRIMARY", ""),
            getattr(config, "TIMEFRAME_CONFIRM", ""),
            getattr(config, "TIMEFRAME_ENTRY", ""),
        ]:
            if not tf:
                bad.append(f"(empty)")
                continue
            try:
                to_mt5(tf)
            except UnknownTimeframeError:
                bad.append(tf)

        if bad:
            return CheckResult(
                name="timeframes",
                severity=Severity.CRITICAL,
                passed=False,
                message=f"Invalid timeframe(s): {bad}",
            )
        return CheckResult(
            name="timeframes",
            severity=Severity.INFO,
            passed=True,
            message="All configured timeframes are valid.",
        )

    def _check_risk_parameters(self) -> list[CheckResult]:
        import config
        results = []

        risk_pct = getattr(config, "RISK_PER_TRADE_PCT", 0)
        ok = 0 < risk_pct <= 5
        results.append(CheckResult(
            name="risk_per_trade_pct",
            severity=Severity.WARNING if not ok else Severity.INFO,
            passed=ok,
            message=f"RISK_PER_TRADE_PCT={risk_pct}%" + ("" if ok else " — out of safe range (0,5]"),
        ))

        dd_limit = getattr(config, "MAX_DRAWDOWN_PCT", 0)
        ok = 0 < dd_limit <= 30
        results.append(CheckResult(
            name="max_drawdown_pct",
            severity=Severity.WARNING if not ok else Severity.INFO,
            passed=ok,
            message=f"MAX_DRAWDOWN_PCT={dd_limit}%" + ("" if ok else " — out of safe range (0,30]"),
        ))

        daily_limit = getattr(config, "DAILY_LOSS_LIMIT_PCT", 0)
        ok = 0 < daily_limit <= 15
        results.append(CheckResult(
            name="daily_loss_limit_pct",
            severity=Severity.WARNING if not ok else Severity.INFO,
            passed=ok,
            message=f"DAILY_LOSS_LIMIT_PCT={daily_limit}%" + ("" if ok else " — out of safe range (0,15]"),
        ))

        return results

    def _check_mt5_health(self) -> CheckResult:
        """
        Attempt a lightweight MT5 health probe — initializes the client
        and checks terminal_info(). This is a WARNING check only because
        MT5 may not be installed on the development machine (e.g. when
        running tests or on a CI server). The actual connection with
        full login credentials happens later in run.py.
        """
        import config
        try:
            from bot.mt5_client import get_client
            client = get_client()
            initialized = client.initialize(
                login=config.MT5_LOGIN,
                password=config.MT5_PASSWORD,
                server=config.MT5_SERVER,
                path=getattr(config, "MT5_PATH", None),
            )
            if not initialized:
                error = client.last_error()
                client.shutdown()
                return CheckResult(
                    name="mt5_health",
                    severity=Severity.WARNING,
                    passed=False,
                    message="MT5 terminal could not be initialized.",
                    detail=f"Error: {error}",
                )
            terminal = client.terminal_info()
            client.shutdown()
            return CheckResult(
                name="mt5_health",
                severity=Severity.INFO,
                passed=True,
                message=f"MT5 terminal reachable (connected={terminal.connected}).",
            )
        except ImportError:
            return CheckResult(
                name="mt5_health",
                severity=Severity.INFO,
                passed=True,
                message="MT5 client not importable — skipping health check (expected in test/CI).",
            )
        except Exception as exc:
            return CheckResult(
                name="mt5_health",
                severity=Severity.WARNING,
                passed=False,
                message="MT5 health probe raised an exception.",
                detail=str(exc),
            )

    def _check_jwt_secret(self) -> CheckResult:
        import config
        secret = getattr(config, "SECRET_KEY", "")
        if secret and len(secret) >= 32 and secret != "forex_bot_secret_2026":
            return CheckResult(
                name="jwt_secret",
                severity=Severity.INFO,
                passed=True,
                message="JWT/session secret is set and non-default.",
            )
        return CheckResult(
            name="jwt_secret",
            severity=Severity.CRITICAL,
            passed=False,
            message="SECRET_KEY is missing, weak (<32 chars), or using the default placeholder value.",
            detail="Generate with: python -c \"import secrets; print(secrets.token_hex(32))\"  and set in .env",
        )


# Single shared instance.
startup_validator = StartupValidator()

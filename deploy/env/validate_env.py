#!/usr/bin/env python3
"""
Environment Variable Validator

Validates that all required environment variables are present and
correctly formatted. Run this before deploying to production.

Usage:
    python deploy/env/validate_env.py              # validate .env in CWD
    python deploy/env/validate_env.py /path/to/.env # specific file
"""

import os
import re
import sys
from pathlib import Path


class EnvValidator:
    CRITICAL = "CRITICAL"
    WARNING = "WARNING"
    INFO = "INFO"

    def __init__(self, env_path: str | None = None) -> None:
        self.env_path = env_path or os.path.join(os.getcwd(), ".env")
        self.errors: list[dict] = []
        self.loaded: dict[str, str] = {}

    def load(self) -> bool:
        if not os.path.exists(self.env_path):
            self.errors.append({
                "severity": self.CRITICAL,
                "variable": ".env",
                "message": f".env file not found at: {self.env_path}",
            })
            return False

        with open(self.env_path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                self.loaded[key.strip()] = value.strip()

        return True

    def _check(self, key: str, severity: str, condition: bool, message: str) -> None:
        if not condition:
            self.errors.append({
                "severity": severity,
                "variable": key,
                "message": message,
            })

    def _get(self, key: str) -> str:
        return self.loaded.get(key, "")

    def validate(self) -> list[dict]:
        """Run all validation checks. Returns list of error dicts."""
        if not self.load():
            return self.errors

        # ---- MT5 ----
        login = self._get("MT5_LOGIN")
        self._check("MT5_LOGIN", self.CRITICAL,
                     bool(login) and login.isdigit(),
                     "MT5_LOGIN is missing or non-numeric.")

        pw = self._get("MT5_PASSWORD")
        self._check("MT5_PASSWORD", self.CRITICAL,
                     bool(pw) and pw != "YOUR_PASSWORD_HERE",
                     "MT5_PASSWORD is missing or using placeholder.")

        self._check("MT5_SERVER", self.CRITICAL,
                     bool(self._get("MT5_SERVER")),
                     "MT5_SERVER is missing.")

        # ---- Security ----
        sk = self._get("SECRET_KEY")
        self._check("SECRET_KEY", self.CRITICAL, bool(sk),
                     "SECRET_KEY is missing.")
        self._check("SECRET_KEY", self.WARNING,
                     bool(sk) and len(sk) >= 32 and " " not in sk,
                     "SECRET_KEY should be >= 32 hex chars (no spaces).")

        dp = self._get("DASHBOARD_PASSWORD")
        self._check("DASHBOARD_PASSWORD", self.CRITICAL, bool(dp),
                     "DASHBOARD_PASSWORD is missing.")
        self._check("DASHBOARD_PASSWORD", self.WARNING,
                     bool(dp) and len(dp) >= 8 and dp != "admin123",
                     "DASHBOARD_PASSWORD is weak or using default.")

        wh = self._get("WEBHOOK_SECRET")
        self._check("WEBHOOK_SECRET", self.WARNING,
                     bool(wh) and len(wh) >= 32,
                     "WEBHOOK_SECRET is missing or weak (< 32 chars).")

        # ---- JWT ----
        jwt = self._get("JWT_SECRET")
        self._check("JWT_SECRET", self.WARNING,
                     bool(jwt) and len(jwt) >= 32,
                     "JWT_SECRET is missing or weak.")

        ujwt = self._get("USER_JWT_SECRET")
        self._check("USER_JWT_SECRET", self.WARNING,
                     not ujwt or len(ujwt) >= 32,
                     "USER_JWT_SECRET is set but weak (< 32 chars).")

        # ---- Telegram ----
        tt = self._get("TELEGRAM_TOKEN")
        self._check("TELEGRAM_TOKEN", self.WARNING,
                     not tt or (":" in tt),
                     "TELEGRAM_TOKEN looks invalid (missing ':').")
        self._check("TELEGRAM_CHAT_ID", self.WARNING,
                     bool(self._get("TELEGRAM_CHAT_ID")),
                     "TELEGRAM_CHAT_ID is missing — no Telegram alerts.")

        # ---- Database ----
        db = self._get("DATABASE_URL")
        self._check("DATABASE_URL", self.CRITICAL, bool(db),
                     "DATABASE_URL is missing.")
        self._check("DATABASE_URL", self.INFO,
                     db and (db.startswith("sqlite://") or db.startswith("postgresql")),
                     f"DATABASE_URL is unusual: {db[:50]}...")

        # ---- SMTP ----
        smtp = self._get("SMTP_HOST")
        self._check("SMTP_HOST", self.WARNING,
                     not smtp or bool(smtp),
                     "SMTP_HOST is set but empty — email features disabled.")

        # ---- SITE ----
        site_url = self._get("SITE_URL")
        self._check("SITE_URL", self.WARNING,
                     not site_url or site_url.startswith("http"),
                     "SITE_URL should start with http:// or https://.")

        self._check("SUPPORT_EMAIL", self.WARNING,
                     bool(self._get("SUPPORT_EMAIL")),
                     "SUPPORT_EMAIL is missing.")

        return self.errors

    def print_report(self) -> None:
        if not self.errors:
            print("\n✅ All environment variables validated successfully.")
            return

        criticals = [e for e in self.errors if e["severity"] == self.CRITICAL]
        warnings = [e for e in self.errors if e["severity"] == self.WARNING]
        infos = [e for e in self.errors if e["severity"] == self.INFO]

        print(f"\n{'='*60}")
        print(f"Environment Validation Report — {self.env_path}")
        print(f"{'='*60}")

        if criticals:
            print(f"\n🔴 CRITICAL ({len(criticals)}):")
            for e in criticals:
                print(f"  {e['variable']}: {e['message']}")

        if warnings:
            print(f"\n🟡 WARNINGS ({len(warnings)}):")
            for e in warnings:
                print(f"  {e['variable']}: {e['message']}")

        if infos:
            print(f"\nℹ️  INFO ({len(infos)}):")
            for e in infos:
                print(f"  {e['variable']}: {e['message']}")

        print()

        if criticals:
            print("❌ Validation FAILED — fix critical errors before deploying.")
            sys.exit(1)
        else:
            print("⚠️  Validation PASSED with warnings. Review before production.")


def main() -> None:
    env_path = sys.argv[1] if len(sys.argv) > 1 else None
    validator = EnvValidator(env_path)
    validator.validate()
    validator.print_report()


if __name__ == "__main__":
    main()

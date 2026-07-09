"""
email_service.py
=================
SMTP email sending for verification, password reset, and notifications.
Degrades gracefully when SMTP credentials are not configured — instead
of crashing or silently failing, it logs a clear warning at startup and
all email features are disabled with a descriptive error message.
"""

from __future__ import annotations

import logging
import smtplib
import threading
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Callable

import config

logger = logging.getLogger("services.email")

_HTML_TEMPLATES: dict[str, tuple[str, str]] = {}


def _register_template(name: str, subject: str, html: str) -> None:
    _HTML_TEMPLATES[name] = (subject, html)


_register_template(
    "verify_email",
    "Verify your email address",
    """<!DOCTYPE html>
<html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
<h1 style="color:#10b981;">Welcome to {site_name}</h1>
<p>Click the link below to verify your email address:</p>
<p style="text-align:center;margin:30px 0;">
  <a href="{verify_url}"
     style="background:#10b981;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:16px;">
    Verify Email
  </a>
</p>
<p>Or copy this link into your browser:</p>
<p style="word-break:break-all;font-size:12px;color:#666;">{verify_url}</p>
<p>This link expires in 24 hours.</p>
<p>If you did not create an account, you can ignore this email.</p>
</body></html>""",
)

_register_template(
    "password_reset",
    "Reset your password",
    """<!DOCTYPE html>
<html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
<h1 style="color:#10b981;">Password Reset</h1>
<p>Click the link below to reset your password:</p>
<p style="text-align:center;margin:30px 0;">
  <a href="{reset_url}"
     style="background:#10b981;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:16px;">
    Reset Password
  </a>
</p>
<p>Or copy this link into your browser:</p>
<p style="word-break:break-all;font-size:12px;color:#666;">{reset_url}</p>
<p>This link expires in 1 hour.</p>
<p>If you did not request a password reset, you can ignore this email.</p>
</body></html>""",
)


class EmailService:
    """SMTP-based email sender. Gracefully disabled if SMTP not configured."""

    def __init__(self) -> None:
        self._enabled = False
        self._lock = threading.Lock()
        self._html_templates: dict[str, tuple[str, str]] = {}
        self._text_templates: dict[str, str] = {}

    def start(self) -> None:
        """Initialize the email service. Must be called before send()."""
        if not config.SMTP_HOST:
            logger.warning(
                "SMTP_HOST not configured — email sending is DISABLED. "
                "Set SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD in .env to enable."
            )
            self._enabled = False
            return
        if not config.SMTP_USERNAME or not config.SMTP_PASSWORD:
            logger.warning(
                "SMTP_USERNAME or SMTP_PASSWORD not configured — email sending is DISABLED."
            )
            self._enabled = False
            return

        self._enabled = True
        self._html_templates = dict(_HTML_TEMPLATES)
        logger.info("Email service enabled (SMTP: %s:%d)", config.SMTP_HOST, config.SMTP_PORT)

    def stop(self) -> None:
        self._enabled = False

    @property
    def is_enabled(self) -> bool:
        return self._enabled

    def send(self, to_email: str, template_name: str, context: dict | None = None) -> tuple[bool, str]:
        """
        Send an HTML email using a named template.
        Returns (success, message).
        Gracefully returns (False, "Email service is not configured") if SMTP disabled.
        """
        if not self._enabled:
            return False, "Email service is not configured. Set SMTP credentials in .env to enable."

        template = self._html_templates.get(template_name)
        if not template:
            return False, f"Unknown email template: {template_name}"

        subject_template, html_template = template
        ctx = dict(context or {})
        ctx.setdefault("site_name", config.SITE_NAME)
        ctx.setdefault("site_url", config.SITE_URL)
        ctx.setdefault("support_email", config.SUPPORT_EMAIL)

        try:
            subject = subject_template.format(**ctx)
            html_body = html_template.format(**ctx)
        except KeyError as exc:
            return False, f"Missing template variable: {exc}"

        return self._send_smtp(to_email, subject, html_body)

    def send_plain(self, to_email: str, subject: str, body: str) -> tuple[bool, str]:
        """Send a plain-text email directly (no template)."""
        if not self._enabled:
            return False, "Email service is not configured."

        html_body = body.replace("\n", "<br>")
        return self._send_smtp(to_email, subject, html_body)

    def _send_smtp(self, to_email: str, subject: str, html_body: str) -> tuple[bool, str]:
        """Low-level SMTP send. Catches and logs all errors."""
        try:
            msg = MIMEMultipart("alternative")
            msg["From"] = config.SMTP_FROM
            msg["To"] = to_email
            msg["Subject"] = subject

            text_part = MIMEText(
                html_body.replace("<br>", "\n").replace("</p>", "</p>\n")
                .replace("<li>", "- ").replace("</li>", ""),
                "plain", "utf-8",
            )
            html_part = MIMEText(html_body, "html", "utf-8")
            msg.attach(text_part)
            msg.attach(html_part)

            with smtplib.SMTP(config.SMTP_HOST, config.SMTP_PORT, timeout=30) as server:
                if config.SMTP_USE_TLS:
                    server.starttls()
                if config.SMTP_USERNAME:
                    server.login(config.SMTP_USERNAME, config.SMTP_PASSWORD)
                server.sendmail(config.SMTP_FROM, [to_email], msg.as_string())

            logger.info("Email sent to %s: %s", to_email, subject)
            return True, "Email sent successfully."

        except smtplib.SMTPException as exc:
            logger.error("SMTP error sending to %s: %s", to_email, exc)
            return False, f"SMTP error: {exc}"
        except OSError as exc:
            logger.error("Connection error sending to %s: %s", to_email, exc)
            return False, f"Connection error: {exc}"
        except Exception as exc:
            logger.exception("Unexpected error sending email to %s", to_email)
            return False, f"Unexpected error: {exc}"


_register_template(
    "welcome",
    "Welcome to {site_name}",
    """<!DOCTYPE html>
<html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
<h1 style="color:#10b981;">Welcome to {site_name}</h1>
<p>Your account has been created successfully. You can now log in and start trading.</p>
<p style="text-align:center;margin:30px 0;">
  <a href="{dashboard_url}"
     style="background:#10b981;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:16px;">
    Get Started
  </a>
</p>
<p>Or copy this link into your browser:</p>
<p style="word-break:break-all;font-size:12px;color:#666;">{dashboard_url}</p>
<p>If you have any questions, feel free to contact us at <a href="mailto:{support_email}">{support_email}</a>.</p>
</body></html>""",
)

email_service = EmailService()

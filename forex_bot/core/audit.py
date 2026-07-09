"""
audit.py
=========
Thin wrapper around AuditLogRepository so call sites (auth routes, bot
control routes, config routes, manual close) can log an action in one
line without repeating the unit_of_work/session boilerplate. A logging
failure here must never break the action being audited — recording
"the admin closed a trade" failing to write to the audit table is not a
reason to have already-failed to close the trade too, so this function
swallows and logs its own errors rather than propagating them.
"""

from __future__ import annotations

import logging

logger = logging.getLogger("audit")


def record_action(action: str, role: str | None = None, success: bool = True,
                   ip_address: str | None = None, detail: str = "") -> None:
    try:
        from database.connection import unit_of_work
        from database.repositories import AuditLogRepository

        with unit_of_work() as session:
            AuditLogRepository(session).record(
                action=action, role=role, success=success, ip_address=ip_address, detail=detail,
            )
    except Exception:
        logger.exception("Failed to record audit log entry for action=%s", action)

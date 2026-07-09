"""
subscriptions.py (routes)
===========================
Subscription plan management and feature gating.

  GET  /api/subscriptions/plans    — list available plans
  GET  /api/subscriptions/current  — current user's subscription
  POST /api/subscriptions/select   — select/change plan (no payment yet)
  GET  /api/subscriptions/features — feature flags for current plan
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta, timezone

from flask import Blueprint, jsonify, g, request

import config
from api.auth import require_role
from api.rate_limit import rate_limited

logger = logging.getLogger("api.routes.subscriptions")

subscriptions_bp = Blueprint("subscriptions", __name__, url_prefix="/api/subscriptions")


def _require_user():
    if getattr(g, "is_legacy", True):
        return jsonify({"error": "This endpoint requires a user account."}), 401
    return None


def _get_plan_features(plan_id: str) -> dict:
    """Get features for a plan from config (source of truth)."""
    plan = config.SUBSCRIPTION_PLANS.get(plan_id)
    if plan:
        return dict(plan)
    return dict(config.SUBSCRIPTION_PLANS.get("free", {}))


@subscriptions_bp.get("/plans")
@rate_limited()
def list_plans():
    """
    List all available subscription plans.
    Unauthenticated endpoint — used by the landing page.
    """
    plans = []
    for plan_id, details in config.SUBSCRIPTION_PLANS.items():
        plans.append({
            "id": plan_id,
            "name": details.get("name", plan_id.title()),
            "max_workspaces": details.get("max_workspaces", 1),
            "max_members": details.get("max_members", 1),
            "max_api_keys": details.get("max_api_keys", 0),
            "max_symbols": details.get("max_symbols", 2),
            "max_trades_per_day": details.get("max_trades_per_day", 10),
            "includes_ai": details.get("includes_ai", False),
            "includes_telegram": details.get("includes_telegram", False),
            "historical_data_days": details.get("historical_data_days", 7),
            "chart_indicators": details.get("chart_indicators", True),
            "export_csv": details.get("export_csv", True),
            "export_xlsx": details.get("export_xlsx", False),
            "priority_support": details.get("priority_support", False),
        })

    return jsonify({"plans": plans})


@subscriptions_bp.get("/current")
@require_role("owner", "admin", "trader", "viewer")
@rate_limited()
def current_subscription():
    err = _require_user()
    if err:
        return err

    from database.connection import unit_of_work
    from database.repositories import SubscriptionPlanRepository, UserSubscriptionRepository

    with unit_of_work() as session:
        sub_repo = UserSubscriptionRepository(session)
        sub = sub_repo.get_active_by_user_id(g.user_id)

        plan_id = "free"
        features = _get_plan_features("free")
        current_period_end = None
        status = "active"

        if sub:
            plan = SubscriptionPlanRepository(session).get_by_id(sub.plan_id)
            if plan:
                plan_id = plan.plan_id
                features = _get_plan_features(plan_id)
                status = sub.status
                current_period_end = sub.current_period_end.isoformat() if sub.current_period_end else None

    return jsonify({
        "plan_id": plan_id,
        "status": status,
        "features": features,
        "current_period_end": current_period_end,
    })


@subscriptions_bp.post("/select")
@require_role("owner", "admin")
@rate_limited()
def select_plan():
    """
    Select/change a subscription plan.
    Body: {"plan_id": "pro"}
    NOTE: No payment processing yet — this directly changes the plan.
    """
    err = _require_user()
    if err:
        return err

    body = request.get_json(silent=True) or {}
    plan_id = body.get("plan_id", "").strip().lower()

    if plan_id not in config.SUBSCRIPTION_PLANS:
        valid = list(config.SUBSCRIPTION_PLANS.keys())
        return jsonify({"error": f"Invalid plan. Valid plans: {', '.join(valid)}"}), 400

    from database.connection import unit_of_work
    from database.repositories import SubscriptionPlanRepository, UserSubscriptionRepository
    from database.models import UserSubscription

    with unit_of_work() as session:
        plan = SubscriptionPlanRepository(session).get_by_plan_id(plan_id)
        if plan is None:
            return jsonify({"error": "Plan not found in database."}), 404

        sub_repo = UserSubscriptionRepository(session)
        existing = sub_repo.get_by_user_id(g.user_id)

        now = datetime.now(timezone.utc)
        period_end = now + timedelta(days=30)

        if existing:
            existing.plan_id = plan.id
            existing.status = "active"
            existing.current_period_start = now
            existing.current_period_end = period_end
            existing.cancelled_at = None
        else:
            sub_repo.save(UserSubscription(
                user_id=g.user_id,
                plan_id=plan.id,
                status="active",
                current_period_start=now,
                current_period_end=period_end,
            ))

    logger.info("Plan selected for user_id=%s: plan_id=%s", g.user_id, plan_id)
    return jsonify({
        "status": "selected",
        "plan_id": plan_id,
        "message": f"Plan changed to {config.SUBSCRIPTION_PLANS[plan_id]['name']}.",
    })


@subscriptions_bp.post("/cancel")
@require_role("owner", "admin")
@rate_limited()
def cancel_subscription():
    err = _require_user()
    if err:
        return err

    from database.connection import unit_of_work
    from database.repositories import UserSubscriptionRepository

    with unit_of_work() as session:
        repo = UserSubscriptionRepository(session)
        sub = repo.get_by_user_id(g.user_id)

        if sub is None:
            return jsonify({"error": "No active subscription to cancel."}), 404

        if sub.status == "cancelled":
            return jsonify({"error": "Subscription is already cancelled."}), 400

        sub.status = "cancelled"
        sub.cancelled_at = datetime.now(timezone.utc)
        session.flush()

    logger.info("Subscription cancelled for user_id=%s", g.user_id)
    from core.audit import record_action
    record_action("SUBSCRIPTION_CANCELLED", role=g.auth_role, success=True,
                  ip_address=request.remote_addr or "unknown",
                  detail=f"user_id={g.user_id}")

    return jsonify({
        "status": "cancelled",
        "message": "Your subscription has been cancelled. You will continue to have access until the end of the current billing period.",
    })


@subscriptions_bp.get("/features")
@require_role("owner", "admin", "trader", "viewer")
@rate_limited()
def feature_flags():
    """
    Return the active feature flags for the current user's plan.
    Frontend uses this to show/hide UI elements based on subscription.
    """
    err = _require_user()
    if err:
        return err

    from database.connection import unit_of_work
    from database.repositories import SubscriptionPlanRepository, UserSubscriptionRepository

    with unit_of_work() as session:
        sub = UserSubscriptionRepository(session).get_active_by_user_id(g.user_id)
        plan_id = "free"

        if sub:
            plan = SubscriptionPlanRepository(session).get_by_id(sub.plan_id)
            if plan:
                plan_id = plan.plan_id

    features = _get_plan_features(plan_id)
    return jsonify({
        "plan_id": plan_id,
        "features": features,
    })

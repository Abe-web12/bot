"""
workspaces.py (routes)
=========================
Multi-tenant workspace management.

  GET    /api/workspaces              — list user's workspaces
  POST   /api/workspaces              — create a new workspace
  GET    /api/workspaces/<id>         — get workspace details
  PUT    /api/workspaces/<id>         — update workspace
  DELETE /api/workspaces/<id>         — delete workspace
  GET    /api/workspaces/<id>/members — list workspace members
  POST   /api/workspaces/<id>/members — invite/add a member
  DELETE /api/workspaces/<id>/members/<member_id> — remove a member
"""

from __future__ import annotations

import logging
import re

from flask import Blueprint, jsonify, g, request

from api.auth import require_role
from api.rate_limit import rate_limited

logger = logging.getLogger("api.routes.workspaces")

workspaces_bp = Blueprint("workspaces", __name__, url_prefix="/api/workspaces")


def _require_user():
    if getattr(g, "is_legacy", True):
        return jsonify({"error": "This endpoint requires a user account."}), 401
    return None


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9-]", "", name.lower().replace(" ", "-"))[:80]
    if not slug:
        slug = "workspace"
    return slug


@workspaces_bp.get("")
@require_role("owner", "admin", "trader")
@rate_limited()
def list_workspaces():
    err = _require_user()
    if err:
        return err

    from database.connection import unit_of_work
    from database.repositories import WorkspaceRepository

    with unit_of_work() as session:
        workspaces = WorkspaceRepository(session).get_user_workspaces(g.user_id)

    return jsonify({
        "workspaces": [
            {
                "id": w.id,
                "name": w.name,
                "slug": w.slug,
                "is_default": w.is_default,
                "is_active": w.is_active,
                "created_at": w.created_at.isoformat() if w.created_at else None,
            }
            for w in workspaces
        ],
    })


@workspaces_bp.post("")
@require_role("owner", "admin")
@rate_limited()
def create_workspace():
    err = _require_user()
    if err:
        return err

    body = request.get_json(silent=True) or {}
    name = body.get("name", "").strip()
    if not name or len(name) < 2:
        return jsonify({"error": "Workspace name must be at least 2 characters."}), 400

    # Check plan limits
    from database.connection import unit_of_work
    from database.repositories import SubscriptionPlanRepository, UserSubscriptionRepository, WorkspaceRepository

    with unit_of_work() as session:
        sub = UserSubscriptionRepository(session).get_active_by_user_id(g.user_id)
        max_workspaces = 1
        if sub:
            plan = SubscriptionPlanRepository(session).get_by_id(sub.plan_id)
            if plan and plan.features_json:
                import json
                features = json.loads(plan.features_json)
                max_workspaces = features.get("max_workspaces", 1)

        existing = WorkspaceRepository(session).get_by_owner(g.user_id)
        if len(existing) >= max_workspaces:
            return jsonify({
                "error": f"Workspace limit reached ({max_workspaces}). Upgrade your plan to create more."
            }), 403

    from database.models import Workspace, WorkspaceMember
    from database.repositories import WorkspaceMemberRepository

    with unit_of_work() as session:
        ws_repo = WorkspaceRepository(session)
        slug = _slugify(name)
        base_slug = slug
        counter = 1
        while ws_repo.slug_exists(slug):
            slug = f"{base_slug}-{counter}"
            counter += 1

        workspace = Workspace(
            name=name,
            slug=slug,
            owner_id=g.user_id,
        )
        ws_repo.save(workspace)

        # Add creator as owner member
        member = WorkspaceMember(
            workspace_id=workspace.id,
            user_id=g.user_id,
            role="owner",
        )
        WorkspaceMemberRepository(session).save(member)

    logger.info("Workspace created: id=%s name=%s owner=%s", workspace.id, name, g.user_id)
    return jsonify({
        "status": "created",
        "workspace": {
            "id": workspace.id,
            "name": workspace.name,
            "slug": workspace.slug,
        },
    }), 201


@workspaces_bp.get("/<workspace_id>")
@require_role("owner", "admin", "trader", "viewer")
@rate_limited()
def get_workspace(workspace_id: str):
    err = _require_user()
    if err:
        return err

    from database.connection import unit_of_work
    from database.repositories import WorkspaceMemberRepository, WorkspaceRepository

    with unit_of_work() as session:
        workspace = WorkspaceRepository(session).get_by_id(workspace_id)
        if workspace is None:
            return jsonify({"error": "Workspace not found."}), 404

        membership = WorkspaceMemberRepository(session).get_by_workspace_and_user(workspace_id, g.user_id)
        if membership is None:
            return jsonify({"error": "You are not a member of this workspace."}), 403

        members = WorkspaceMemberRepository(session).get_workspace_members(workspace_id)

    return jsonify({
        "workspace": {
            "id": workspace.id,
            "name": workspace.name,
            "slug": workspace.slug,
            "is_default": workspace.is_default,
            "is_active": workspace.is_active,
            "owner_id": workspace.owner_id,
            "settings": workspace.settings_json,
            "created_at": workspace.created_at.isoformat() if workspace.created_at else None,
        },
        "my_role": membership.role,
        "members": [
            {
                "id": m.id,
                "user_id": m.user_id,
                "role": m.role,
                "joined_at": m.joined_at.isoformat() if m.joined_at else None,
            }
            for m in members
        ],
    })


@workspaces_bp.put("/<workspace_id>")
@require_role("owner", "admin")
@rate_limited()
def update_workspace(workspace_id: str):
    err = _require_user()
    if err:
        return err

    body = request.get_json(silent=True) or {}
    allowed_fields = {"name", "settings"}
    updates = {k: v for k, v in body.items() if k in allowed_fields}

    if not updates:
        return jsonify({"error": "No valid fields to update."}), 400

    from database.connection import unit_of_work
    from database.repositories import WorkspaceMemberRepository, WorkspaceRepository

    with unit_of_work() as session:
        workspace = WorkspaceRepository(session).get_by_id(workspace_id)
        if workspace is None:
            return jsonify({"error": "Workspace not found."}), 404

        membership = WorkspaceMemberRepository(session).get_by_workspace_and_user(workspace_id, g.user_id)
        if membership is None or membership.role not in ("owner", "admin"):
            return jsonify({"error": "You do not have permission to update this workspace."}), 403

        if "name" in updates:
            workspace.name = str(updates["name"])[:200]
        if "settings" in updates:
            import json
            workspace.settings_json = json.dumps(updates["settings"], default=str)

    return jsonify({"status": "updated", "message": "Workspace updated."})


@workspaces_bp.delete("/<workspace_id>")
@require_role("owner")
@rate_limited()
def delete_workspace(workspace_id: str):
    err = _require_user()
    if err:
        return err

    from database.connection import unit_of_work
    from database.repositories import WorkspaceMemberRepository, WorkspaceRepository

    with unit_of_work() as session:
        workspace = WorkspaceRepository(session).get_by_id(workspace_id)
        if workspace is None:
            return jsonify({"error": "Workspace not found."}), 404
        if workspace.owner_id != g.user_id:
            return jsonify({"error": "Only the workspace owner can delete a workspace."}), 403

        workspace.is_active = False

    logger.info("Workspace deleted: id=%s", workspace_id)
    return jsonify({"status": "deleted", "message": "Workspace deleted."})


# ---------------------------------------------------------------------------
# Workspace members
# ---------------------------------------------------------------------------


@workspaces_bp.get("/<workspace_id>/members")
@require_role("owner", "admin", "trader", "viewer")
@rate_limited()
def list_members(workspace_id: str):
    err = _require_user()
    if err:
        return err

    from database.connection import unit_of_work
    from database.repositories import WorkspaceMemberRepository, WorkspaceRepository

    with unit_of_work() as session:
        membership = WorkspaceMemberRepository(session).get_by_workspace_and_user(workspace_id, g.user_id)
        if membership is None:
            return jsonify({"error": "You are not a member of this workspace."}), 403

        members = WorkspaceMemberRepository(session).get_workspace_members(workspace_id)

    return jsonify({
        "members": [
            {
                "id": m.id,
                "user_id": m.user_id,
                "role": m.role,
                "joined_at": m.joined_at.isoformat() if m.joined_at else None,
            }
            for m in members
        ],
    })


@workspaces_bp.post("/<workspace_id>/members")
@require_role("owner", "admin")
@rate_limited()
def add_member(workspace_id: str):
    err = _require_user()
    if err:
        return err

    body = request.get_json(silent=True) or {}
    email = body.get("email", "").strip().lower()
    role = body.get("role", "member").strip()

    if not email:
        return jsonify({"error": "Missing 'email' of user to add."}), 400
    if role not in ("admin", "member", "viewer"):
        return jsonify({"error": "Role must be one of: admin, member, viewer"}), 400

    from database.connection import unit_of_work
    from database.repositories import (
        SubscriptionPlanRepository, UserRepository, UserSubscriptionRepository,
        WorkspaceMemberRepository, WorkspaceRepository,
    )
    from database.models import WorkspaceMember

    with unit_of_work() as session:
        workspace = WorkspaceRepository(session).get_by_id(workspace_id)
        if workspace is None:
            return jsonify({"error": "Workspace not found."}), 404

        membership = WorkspaceMemberRepository(session).get_by_workspace_and_user(workspace_id, g.user_id)
        if membership is None or membership.role not in ("owner", "admin"):
            return jsonify({"error": "You do not have permission to add members."}), 403

        # Find user by email
        user = UserRepository(session).get_by_email(email)
        if user is None:
            return jsonify({"error": "No user found with that email."}), 404

        # Check not already a member
        existing = WorkspaceMemberRepository(session).get_by_workspace_and_user(workspace_id, user.id)
        if existing:
            return jsonify({"error": "User is already a member of this workspace."}), 409

        # Check plan member limit
        sub = UserSubscriptionRepository(session).get_active_by_user_id(workspace.owner_id)
        max_members = 1
        if sub:
            plan = SubscriptionPlanRepository(session).get_by_id(sub.plan_id)
            if plan and plan.features_json:
                import json
                features = json.loads(plan.features_json)
                max_members = features.get("max_members", 1)

        current_count = WorkspaceMemberRepository(session).count_by_workspace(workspace_id)
        if current_count >= max_members:
            return jsonify({
                "error": f"Member limit reached ({max_members}). Upgrade the workspace plan to add more members."
            }), 403

        member = WorkspaceMember(
            workspace_id=workspace_id,
            user_id=user.id,
            role=role,
        )
        WorkspaceMemberRepository(session).save(member)

    logger.info("Member added to workspace %s: email=%s role=%s", workspace_id, email, role)
    return jsonify({
        "status": "added",
        "member": {
            "id": member.id,
            "user_id": user.id,
            "email": email,
            "role": role,
        },
    }), 201


@workspaces_bp.delete("/<workspace_id>/members/<member_id>")
@require_role("owner", "admin")
@rate_limited()
def remove_member(workspace_id: str, member_id: str):
    err = _require_user()
    if err:
        return err

    from database.connection import unit_of_work
    from database.repositories import WorkspaceMemberRepository, WorkspaceRepository

    with unit_of_work() as session:
        workspace = WorkspaceRepository(session).get_by_id(workspace_id)
        if workspace is None:
            return jsonify({"error": "Workspace not found."}), 404

        membership = WorkspaceMemberRepository(session).get_by_workspace_and_user(workspace_id, g.user_id)
        if membership is None or membership.role not in ("owner", "admin"):
            return jsonify({"error": "You do not have permission to remove members."}), 403

        target = WorkspaceMemberRepository(session).get_by_id(member_id)
        if target is None or target.workspace_id != workspace_id:
            return jsonify({"error": "Member not found."}), 404

        # Cannot remove the owner
        if target.role == "owner":
            return jsonify({"error": "Cannot remove the workspace owner."}), 403

        WorkspaceMemberRepository(session).remove(member_id)

    return jsonify({"status": "removed", "message": "Member removed from workspace."})

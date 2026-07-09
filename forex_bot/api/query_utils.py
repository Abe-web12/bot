"""
query_utils.py
================
Shared helpers for list endpoints: pagination, sorting, and export.
Filtering is intentionally left to each endpoint (symbol=, entry_type=,
etc. — those are domain-specific query params already implemented per
route), but the pagination/sort envelope and CSV/Excel export are
identical across every list endpoint, so they live here once.

Pagination convention: ?page=1&page_size=50 (1-indexed page numbers,
page_size capped at MAX_PAGE_SIZE to prevent a client from requesting
the entire table in one response).

Sort convention: ?sort=field:asc or ?sort=field:desc. Each endpoint
declares which fields are sortable (an allowlist) — sorting by an
arbitrary attacker-supplied column name against raw SQL is not
attempted; this only sorts already-fetched Python objects/dicts by a
known-safe attribute name.
"""

from __future__ import annotations

import csv
import io
from dataclasses import dataclass
from typing import Any, Callable

from flask import request

MAX_PAGE_SIZE = 500
DEFAULT_PAGE_SIZE = 50


@dataclass(frozen=True)
class PageRequest:
    page: int
    page_size: int

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


class QueryParamError(Exception):
    pass


def parse_pagination() -> PageRequest:
    try:
        page = int(request.args.get("page", 1))
        page_size = int(request.args.get("page_size", DEFAULT_PAGE_SIZE))
    except ValueError:
        raise QueryParamError("'page' and 'page_size' must be integers.")

    if page < 1:
        raise QueryParamError("'page' must be >= 1.")
    if page_size < 1 or page_size > MAX_PAGE_SIZE:
        raise QueryParamError(f"'page_size' must be between 1 and {MAX_PAGE_SIZE}.")

    return PageRequest(page=page, page_size=page_size)


def parse_sort(allowed_fields: set[str], default_field: str, default_desc: bool = True) -> tuple[str, bool]:
    """
    Returns (field_name, descending). Raises QueryParamError if the
    requested field is not in allowed_fields — this is the allowlist
    that keeps sorting safe.
    """
    raw = request.args.get("sort", "")
    if not raw:
        return default_field, default_desc

    if ":" in raw:
        field, direction = raw.split(":", 1)
    else:
        field, direction = raw, "desc" if default_desc else "asc"

    if field not in allowed_fields:
        raise QueryParamError(f"Cannot sort by '{field}'. Allowed fields: {sorted(allowed_fields)}.")

    descending = direction.lower() == "desc"
    return field, descending


def paginate_list(items: list, page_request: PageRequest) -> dict:
    """Slices an already-fetched list and returns a pagination envelope."""
    total = len(items)
    start = page_request.offset
    end = start + page_request.page_size
    page_items = items[start:end]
    total_pages = max(1, (total + page_request.page_size - 1) // page_request.page_size)

    return {
        "items": page_items,
        "pagination": {
            "page": page_request.page,
            "page_size": page_request.page_size,
            "total_items": total,
            "total_pages": total_pages,
            "has_next": page_request.page < total_pages,
            "has_previous": page_request.page > 1,
        },
    }


def sort_dicts(items: list[dict], field: str, descending: bool) -> list[dict]:
    """Sorts a list of dicts by field, tolerating None values (sorted last)."""
    return sorted(
        items,
        key=lambda d: (d.get(field) is None, d.get(field)),
        reverse=descending,
    )


# ---------------------------------------------------------------------------
# Export
# ---------------------------------------------------------------------------

def export_csv(rows: list[dict], fieldnames: list[str]) -> bytes:
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    return buffer.getvalue().encode("utf-8")


def export_xlsx(rows: list[dict], fieldnames: list[str], sheet_title: str = "Export") -> bytes:
    from openpyxl import Workbook

    wb = Workbook()
    ws = wb.active
    ws.title = sheet_title[:31]  # Excel sheet name length limit

    ws.append(fieldnames)
    for row in rows:
        ws.append([row.get(field, "") for field in fieldnames])

    buffer = io.BytesIO()
    wb.save(buffer)
    return buffer.getvalue()

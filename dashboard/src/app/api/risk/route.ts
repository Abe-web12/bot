// dashboard/src/app/api/risk/current/route.ts
// Prisma-backed Route Handler for current risk state.
// Replaces Flask's GET /api/risk/current read path.
//
// GET  → current risk state (latest snapshot + derived level). 200 with
//        { timestamp, risk } or { timestamp, risk: null } if none captured yet.
// POST → append a live risk snapshot streamed by the Python risk engine.
// PUT  → alias of POST (periodic pushes); both append a time-series row.
//
// Response shape matches what the existing useRiskSnapshot() hook polls at
// /api/risk/current every 10s.

import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { CreateRiskSnapshotSchema } from "@/schemas/risk.schema";
import { getCurrentRisk, recordRiskSnapshot } from "@/server/risk.service";
import { requireApiKey } from "@/lib/api-key";

// Live data; never cache.
export const dynamic = "force-dynamic";

function zodErrorResponse(error: ZodError, status = 400) {
  return NextResponse.json(
    {
      error: "validation_error",
      issues: error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    },
    { status }
  );
}

function serverErrorResponse(err: unknown) {
  const message = err instanceof Error ? err.message : "Unexpected server error";
  console.error("[/api/risk/current] error:", err);
  return NextResponse.json({ error: "internal_error", message }, { status: 500 });
}

async function parseJson(request: NextRequest): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// Shared handler for POST and PUT (both append a snapshot).
async function ingest(request: NextRequest) {
  const body = await parseJson(request);
  if (body === null) {
    return NextResponse.json(
      { error: "invalid_json", message: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  const parsed = CreateRiskSnapshotSchema.safeParse(body);
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const snapshot = await recordRiskSnapshot(parsed.data);

  return NextResponse.json(
    { timestamp: new Date().toISOString(), snapshot },
    { status: 201 }
  );
}

// ─────────────────────────────────────────────────────────────
// GET /api/risk/current
// ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const auth = requireApiKey(request);
  if (auth) return auth;
  try {
    const risk = await getCurrentRisk();

    return NextResponse.json(
      { timestamp: new Date().toISOString(), risk },
      { status: 200 }
    );
  } catch (err) {
    return serverErrorResponse(err);
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/risk/current  (append live snapshot)
// ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const auth = requireApiKey(request);
  if (auth) return auth;
  try {
    return await ingest(request);
  } catch (err) {
    return serverErrorResponse(err);
  }
}

// ─────────────────────────────────────────────────────────────
// PUT /api/risk/current  (alias of POST)
// ─────────────────────────────────────────────────────────────

export async function PUT(request: NextRequest) {
  const auth = requireApiKey(request);
  if (auth) return auth;
  try {
    return await ingest(request);
  } catch (err) {
    return serverErrorResponse(err);
  }
}
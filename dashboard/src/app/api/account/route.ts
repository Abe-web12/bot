// dashboard/src/app/api/account/route.ts
// Prisma-backed Route Handler for account state.
// Replaces Flask's GET /api/account read path.
//
// GET  → current account state (latest snapshot, enriched). 200 with
//        { timestamp, account } or { timestamp, account: null } if none yet.
// POST → append a live account snapshot streamed by the Python bot.
// PUT  → alias of POST (some bot loops prefer PUT for idempotent-feeling
//        periodic pushes); both append a new time-series row.
//
// The historical curve lives at /api/account/curve (separate route file) to
// keep this handler focused on current state + ingestion.

import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { CreateAccountSnapshotSchema } from "@/schemas/account.schema";
import { getCurrentAccount, recordAccountSnapshot } from "@/server/account.service";
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
  console.error("[/api/account] error:", err);
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

  const parsed = CreateAccountSnapshotSchema.safeParse(body);
  if (!parsed.success) {
    return zodErrorResponse(parsed.error);
  }

  const snapshot = await recordAccountSnapshot(parsed.data);

  return NextResponse.json(
    { timestamp: new Date().toISOString(), snapshot },
    { status: 201 }
  );
}

// ─────────────────────────────────────────────────────────────
// GET /api/account
// ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const auth = requireApiKey(request);
  if (auth) return auth;
  try {
    const account = await getCurrentAccount();

    return NextResponse.json(
      { timestamp: new Date().toISOString(), account },
      { status: 200 }
    );
  } catch (err) {
    return serverErrorResponse(err);
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/account  (append live snapshot)
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
// PUT /api/account  (alias of POST)
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
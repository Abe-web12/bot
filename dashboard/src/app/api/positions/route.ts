// dashboard/src/app/api/positions/route.ts
// Prisma-backed Route Handler for live open positions.
// Replaces Flask's GET /api/positions read path.
//
// GET → all currently-open positions (+ count, total unrealized P&L).
// PUT → full-snapshot reconcile from the bot (upsert present, delete absent).
// POST → incremental single-position upsert (per-tick update).
//
// Response shape matches what the existing usePositions() hook expects:
// { timestamp, count, positions }.

import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { SyncPositionsSchema, UpsertPositionSchema } from "@/schemas/position.schema";
import { listPositions, syncPositions, upsertPosition } from "@/server/position.service";
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
  console.error("[/api/positions] error:", err);
  return NextResponse.json({ error: "internal_error", message }, { status: 500 });
}

async function parseJson(request: NextRequest): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// GET /api/positions
// ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const auth = requireApiKey(request);
  if (auth) return auth;
  try {
    const symbol = request.nextUrl.searchParams.get("symbol") ?? undefined;
    const result = await listPositions(symbol);

    return NextResponse.json(
      { timestamp: new Date().toISOString(), ...result },
      { status: 200 }
    );
  } catch (err) {
    return serverErrorResponse(err);
  }
}

// ─────────────────────────────────────────────────────────────
// PUT /api/positions  (full-snapshot reconcile)
// ─────────────────────────────────────────────────────────────

export async function PUT(request: NextRequest) {
  const auth = requireApiKey(request);
  if (auth) return auth;
  try {
    const body = await parseJson(request);
    if (body === null) {
      return NextResponse.json(
        { error: "invalid_json", message: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    const parsed = SyncPositionsSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const result = await syncPositions(parsed.data);

    return NextResponse.json(
      { timestamp: new Date().toISOString(), ...result },
      { status: 200 }
    );
  } catch (err) {
    return serverErrorResponse(err);
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/positions  (incremental single upsert)
// ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const auth = requireApiKey(request);
  if (auth) return auth;
  try {
    const body = await parseJson(request);
    if (body === null) {
      return NextResponse.json(
        { error: "invalid_json", message: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    const parsed = UpsertPositionSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const position = await upsertPosition(parsed.data);

    return NextResponse.json(
      { timestamp: new Date().toISOString(), position },
      { status: 201 }
    );
  } catch (err) {
    return serverErrorResponse(err);
  }
}
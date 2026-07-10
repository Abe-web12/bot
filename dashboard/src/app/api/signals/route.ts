// dashboard/src/app/api/signals/route.ts
// Prisma-backed Route Handler for strategy signals.
// Replaces Flask's GET /api/signals read path.
//
// GET  → recent signals (newest-first), filterable by symbol/direction/acted.
// POST → append a new signal emitted by the Python strategy engine.
//
// Response shape matches what the existing useSignals() hook expects:
// { timestamp, count, signals }.

import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { SignalQuerySchema, CreateSignalSchema } from "@/schemas/signal.schema";
import { listSignals, createSignal } from "@/server/signal.service";
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
  console.error("[/api/signals] error:", err);
  return NextResponse.json({ error: "internal_error", message }, { status: 500 });
}

// ─────────────────────────────────────────────────────────────
// GET /api/signals
// ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const auth = requireApiKey(request);
  if (auth) return auth;
  try {
    const sp = request.nextUrl.searchParams;

    const parsed = SignalQuerySchema.safeParse({
      limit: sp.get("limit") ?? undefined,
      symbol: sp.get("symbol") ?? undefined,
      direction: sp.get("direction") ?? undefined,
      actedOnly: sp.get("acted_only") ?? sp.get("actedOnly") ?? undefined,
    });

    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const result = await listSignals(parsed.data);

    return NextResponse.json(
      { timestamp: new Date().toISOString(), ...result },
      { status: 200 }
    );
  } catch (err) {
    return serverErrorResponse(err);
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/signals
// ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const auth = requireApiKey(request);
  if (auth) return auth;
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "invalid_json", message: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    const parsed = CreateSignalSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const signal = await createSignal(parsed.data);

    return NextResponse.json(
      { timestamp: new Date().toISOString(), signal },
      { status: 201 }
    );
  } catch (err) {
    return serverErrorResponse(err);
  }
}
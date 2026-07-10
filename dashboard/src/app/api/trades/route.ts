// dashboard/src/app/api/trades/route.ts
// First Prisma-backed Route Handler. Replaces Flask's GET /api/trades read path.
//
// GET  → paginated, symbol-filterable, sortable trade history + win-rate summary.
// POST → idempotent upsert of a closed trade written by the Python bot / Flask.
//
// Params are validated with Zod (TradeQuerySchema / CreateTradeSchema); all DB
// work is delegated to trade.service. Response shape matches what the existing
// useTrades() hook already expects (items + win_rate + pagination fields).

import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { TradeQuerySchema } from "@/schemas/trade.schema";
import { CreateTradeSchema } from "@/schemas/trade.schema";
import { listTrades, upsertTrade } from "@/server/trade.service";
import { requireApiKey } from "@/lib/api-key";

// Trade data is live and per-request; never cache this route.
export const dynamic = "force-dynamic";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

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
  const message =
    err instanceof Error ? err.message : "Unexpected server error";
  // Log server-side; return a generic message to the client.
  console.error("[/api/trades] error:", err);
  return NextResponse.json(
    { error: "internal_error", message },
    { status: 500 }
  );
}

// ─────────────────────────────────────────────────────────────
// GET /api/trades
// ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const auth = requireApiKey(request);
  if (auth) return auth;
  try {
    const sp = request.nextUrl.searchParams;

    // Map the incoming snake_case query (?page_size=) to the schema's camelCase.
    const parsed = TradeQuerySchema.safeParse({
      page: sp.get("page") ?? undefined,
      pageSize: sp.get("page_size") ?? sp.get("pageSize") ?? undefined,
      symbol: sp.get("symbol") ?? undefined,
      sort: sp.get("sort") ?? undefined,
    });

    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const result = await listTrades(parsed.data);

    return NextResponse.json(
      { timestamp: new Date().toISOString(), ...result },
      { status: 200 }
    );
  } catch (err) {
    return serverErrorResponse(err);
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/trades
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

    const parsed = CreateTradeSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const trade = await upsertTrade(parsed.data);

    return NextResponse.json(
      { timestamp: new Date().toISOString(), trade },
      { status: 201 }
    );
  } catch (err) {
    return serverErrorResponse(err);
  }
}
// dashboard/src/app/api/account/curve/route.ts
// Prisma-backed Route Handler for historical account curves.
// Replaces Flask's GET /api/charts/equity-curve, /balance-curve, etc.
//
// GET → a chart-ready, oldest-first series for one metric.
//   Query params:
//     metric = equity | balance | margin | freeMargin   (default: equity)
//     since  = ISO timestamp lower bound                (optional)
//     limit  = max points, 1..5000                       (default: 1000)
//
// Response: { timestamp, metric, count, series: [{ t, value }, ...] }
// This matches the { t, value } ChartPoint shape the existing chart hooks plot.

import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { CurveQuerySchema } from "@/schemas/account.schema";
import { getCurve } from "@/server/account.service";
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
  console.error("[/api/account/curve] error:", err);
  return NextResponse.json({ error: "internal_error", message }, { status: 500 });
}

// ─────────────────────────────────────────────────────────────
// GET /api/account/curve
// ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const auth = requireApiKey(request);
  if (auth) return auth;
  try {
    const sp = request.nextUrl.searchParams;

    const parsed = CurveQuerySchema.safeParse({
      metric: sp.get("metric") ?? undefined,
      since: sp.get("since") ?? undefined,
      limit: sp.get("limit") ?? undefined,
    });

    if (!parsed.success) {
      return zodErrorResponse(parsed.error);
    }

    const result = await getCurve(parsed.data);

    return NextResponse.json(
      { timestamp: new Date().toISOString(), ...result },
      { status: 200 }
    );
  } catch (err) {
    return serverErrorResponse(err);
  }
}
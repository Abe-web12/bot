// dashboard/src/server/account.service.ts
// Account data-access layer (Prisma queries for the AccountSnapshot domain).
//
// The latest snapshot = current account state (header/cards). The full series
// = the equity/balance/margin curves. Writes append a new snapshot per bot tick.
//
// Prisma 7: the generated client + Prisma namespace live at src/generated/prisma
// (see generator `output` in schema.prisma), so we import the Prisma types from
// "@/generated/prisma" rather than the legacy "@prisma/client" path.

import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import {
  AccountSnapshotSchema,
  AccountStateSchema,
  CreateAccountSnapshotSchema,
  ChartPointSchema,
  type AccountSnapshotDTO,
  type AccountStateDTO,
  type CreateAccountSnapshotInput,
  type ChartPointDTO,
  type CurveMetric,
  type CurveQuery,
} from "@/schemas/account.schema";

// Normalize a Prisma AccountSnapshot row into a validated, JSON-safe DTO.
function toSnapshotDTO(row: unknown): AccountSnapshotDTO {
  return AccountSnapshotSchema.parse(row);
}

// Map a DB row to the enriched current-state DTO (with derived fields).
function toStateDTO(row: {
  balance: number;
  equity: number;
  marginLevel: number | null;
}): AccountStateDTO {
  const base = AccountSnapshotSchema.parse(row);
  return AccountStateSchema.parse({
    ...base,
    // equity - balance: floating P&L of all open positions at capture time.
    unrealizedPnl: Number((row.equity - row.balance).toFixed(2)),
    // marginLevel is a percentage; expose a 0..n ratio for gauges, or null.
    marginLevelRatio:
      row.marginLevel == null ? null : Number((row.marginLevel / 100).toFixed(4)),
  });
}

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────

// Current account state = most recent snapshot. Returns null if none captured
// yet (bot hasn't pushed anything). Callers decide how to surface "no data".
export async function getCurrentAccount(): Promise<AccountStateDTO | null> {
  const row = await prisma.accountSnapshot.findFirst({
    orderBy: { capturedAt: "desc" },
  });
  return row ? toStateDTO(row) : null;
}

// Map a curve metric name to the corresponding numeric column.
function metricColumn(metric: CurveMetric): keyof Prisma.AccountSnapshotSelect {
  switch (metric) {
    case "equity":
      return "equity";
    case "balance":
      return "balance";
    case "margin":
      return "margin";
    case "freeMargin":
      return "freeMargin";
    default:
      return "equity";
  }
}

export interface CurveResult {
  metric: CurveMetric;
  count: number;
  series: ChartPointDTO[];
}

// Historical series for one metric, oldest-first (chart-ready). Optional `since`
// lower bound; `limit` caps points. We fetch newest-first with take=limit to get
// the most recent window, then reverse to ascending time for plotting.
export async function getCurve(query: CurveQuery): Promise<CurveResult> {
  const { metric, since, limit } = query;
  const column = metricColumn(metric);

  const where: Prisma.AccountSnapshotWhereInput = since
    ? { capturedAt: { gte: new Date(since) } }
    : {};

  const rows = await prisma.accountSnapshot.findMany({
    where,
    orderBy: { capturedAt: "desc" },
    take: limit,
    select: { capturedAt: true, [column]: true } as Prisma.AccountSnapshotSelect,
  });

  // rows are newest-first; reverse to oldest-first for the chart.
  const series = rows
    .slice()
    .reverse()
    .map((r) =>
      ChartPointSchema.parse({
        t: (r as Record<string, unknown>).capturedAt,
        value: (r as Record<string, unknown>)[column] as number,
      })
    );

  return { metric, count: series.length, series };
}

// ─────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────

// Append a new account snapshot (one per bot tick). Append-only time series.
export async function recordAccountSnapshot(
  input: CreateAccountSnapshotInput
): Promise<AccountSnapshotDTO> {
  const data = CreateAccountSnapshotSchema.parse(input);

  const row = await prisma.accountSnapshot.create({
    data: {
      balance: data.balance,
      equity: data.equity,
      margin: data.margin ?? 0,
      freeMargin: data.freeMargin ?? 0,
      marginLevel: data.marginLevel ?? null,
      currency: data.currency ?? "USD",
      leverage: data.leverage ?? null,
      ...(data.capturedAt ? { capturedAt: new Date(data.capturedAt) } : {}),
    },
  });

  return toSnapshotDTO(row);
}
// dashboard/src/server/risk.service.ts
// Risk data-access layer (Prisma queries for the RiskSnapshot domain).
//
// The latest snapshot = current risk state (risk page gauges). Writes append a
// new snapshot per bot/risk-engine tick. A coarse OK/WARNING/CRITICAL level is
// derived server-side so the UI colors consistently.
//
// Note: this service only needs the `prisma` client (from @/lib/prisma, which
// itself imports PrismaClient from @/generated/prisma). It does not use the
// Prisma namespace types directly, so there is no "@/generated/prisma" import
// here to update.

import { prisma } from "@/lib/prisma";
import {
  RiskSnapshotSchema,
  RiskStateSchema,
  CreateRiskSnapshotSchema,
  type RiskSnapshotDTO,
  type RiskStateDTO,
  type RiskLevel,
  type CreateRiskSnapshotInput,
} from "@/schemas/risk.schema";

// Normalize a Prisma RiskSnapshot row into a validated, JSON-safe DTO.
function toSnapshotDTO(row: unknown): RiskSnapshotDTO {
  return RiskSnapshotSchema.parse(row);
}

// Derive a coarse risk level from drawdown + exposure. Thresholds live here
// (one source of truth) rather than being scattered across UI components.
function deriveLevel(input: {
  dailyDrawdownPct: number;
  maxDrawdownPct: number;
  exposurePct: number;
}): RiskLevel {
  const { dailyDrawdownPct, maxDrawdownPct, exposurePct } = input;

  // CRITICAL: heavy drawdown or over-exposed.
  if (dailyDrawdownPct >= 5 || maxDrawdownPct >= 20 || exposurePct >= 100) {
    return "CRITICAL";
  }
  // WARNING: elevated but not breached.
  if (dailyDrawdownPct >= 3 || maxDrawdownPct >= 10 || exposurePct >= 75) {
    return "WARNING";
  }
  return "OK";
}

function toStateDTO(row: RiskSnapshotDTO): RiskStateDTO {
  return RiskStateSchema.parse({
    ...row,
    level: deriveLevel({
      dailyDrawdownPct: row.dailyDrawdownPct,
      maxDrawdownPct: row.maxDrawdownPct,
      exposurePct: row.exposurePct,
    }),
  });
}

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────

// Current risk = most recent snapshot, enriched with a derived level.
// Returns null if the risk engine hasn't pushed anything yet.
export async function getCurrentRisk(): Promise<RiskStateDTO | null> {
  const row = await prisma.riskSnapshot.findFirst({
    orderBy: { capturedAt: "desc" },
  });
  return row ? toStateDTO(toSnapshotDTO(row)) : null;
}

export interface RiskHistoryResult {
  count: number;
  snapshots: RiskSnapshotDTO[];
}

// Recent risk history, newest-first, for trend widgets. Bounded by `limit`.
export async function listRiskHistory(limit = 100): Promise<RiskHistoryResult> {
  const bounded = Math.max(1, Math.min(limit, 2000));
  const rows = await prisma.riskSnapshot.findMany({
    orderBy: { capturedAt: "desc" },
    take: bounded,
  });
  const snapshots = rows.map(toSnapshotDTO);
  return { count: snapshots.length, snapshots };
}

// ─────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────

// Append a new risk snapshot. Missing fields default to 0 / null so a partial
// push from the risk engine is still accepted.
export async function recordRiskSnapshot(
  input: CreateRiskSnapshotInput
): Promise<RiskSnapshotDTO> {
  const data = CreateRiskSnapshotSchema.parse(input);

  const row = await prisma.riskSnapshot.create({
    data: {
      dailyPnl: data.dailyPnl ?? 0,
      dailyDrawdownPct: data.dailyDrawdownPct ?? 0,
      maxDrawdownPct: data.maxDrawdownPct ?? 0,
      openRiskPct: data.openRiskPct ?? 0,
      exposurePct: data.exposurePct ?? 0,
      riskPerTradePct: data.riskPerTradePct ?? 0,
      openPositions: data.openPositions ?? 0,
      marginLevel: data.marginLevel ?? null,
      ...(data.capturedAt ? { capturedAt: new Date(data.capturedAt) } : {}),
    },
  });

  return toSnapshotDTO(row);
}
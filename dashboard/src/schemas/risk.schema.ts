// dashboard/src/schemas/risk.schema.ts
// Zod schemas + inferred types for the Risk domain.
//
// Mirrors the `RiskSnapshot` model in prisma/schema.prisma. Risk state is a
// time series of point-in-time readings (daily P&L, drawdown %, exposure %,
// open risk %, etc.). The LATEST row is "current risk"; the series can power a
// drawdown/exposure chart later.

import { z } from "zod";

// Accept Date or ISO string, always emit an ISO string on the wire.
const dateToIso = z
  .union([z.date(), z.string()])
  .transform((v) =>
    v instanceof Date ? v.toISOString() : new Date(v).toISOString()
  )
  .refine((s) => !Number.isNaN(Date.parse(s)), "invalid date");

// ─────────────────────────────────────────────────────────────
// Output DTO — a single risk snapshot as served to the dashboard
// ─────────────────────────────────────────────────────────────

export const RiskSnapshotSchema = z.object({
  id: z.string().cuid(),
  dailyPnl: z.number(),
  dailyDrawdownPct: z.number(),
  maxDrawdownPct: z.number(),
  openRiskPct: z.number(),
  exposurePct: z.number(),
  riskPerTradePct: z.number(),
  openPositions: z.number().int(),
  marginLevel: z.number().nullable(),
  capturedAt: dateToIso,
});

export type RiskSnapshotDTO = z.infer<typeof RiskSnapshotSchema>;

// ─────────────────────────────────────────────────────────────
// Output DTO — enriched "current risk" for the risk page gauges
// ─────────────────────────────────────────────────────────────

// A coarse status the UI can color-code without hardcoding thresholds itself.
export const RiskLevelSchema = z.enum(["OK", "WARNING", "CRITICAL"]);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

export const RiskStateSchema = RiskSnapshotSchema.extend({
  // Server-derived overall risk level from drawdown + exposure thresholds.
  level: RiskLevelSchema,
});

export type RiskStateDTO = z.infer<typeof RiskStateSchema>;

// ─────────────────────────────────────────────────────────────
// Input — a risk snapshot pushed by the Python bot / risk engine
// ─────────────────────────────────────────────────────────────

// Append-only time series. Server generates id/capturedAt unless the bot
// supplies its own timestamp.
export const CreateRiskSnapshotSchema = z.object({
  dailyPnl: z.number().optional(),
  dailyDrawdownPct: z.number().optional(),
  maxDrawdownPct: z.number().optional(),
  openRiskPct: z.number().optional(),
  exposurePct: z.number().optional(),
  riskPerTradePct: z.number().optional(),
  openPositions: z.number().int().optional(),
  marginLevel: z.number().nullable().optional(),
  capturedAt: z.union([z.date(), z.string()]).optional(),
});

export type CreateRiskSnapshotInput = z.infer<typeof CreateRiskSnapshotSchema>;
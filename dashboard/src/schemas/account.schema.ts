// dashboard/src/schemas/account.schema.ts
// Zod schemas + inferred types for the Account domain.
//
// Mirrors the `AccountSnapshot` model in prisma/schema.prisma. Account state is
// captured as a time series: each row is a point-in-time reading of balance,
// equity, margin, etc. The LATEST row is "current account state"; the full
// series powers the equity/balance/drawdown curves.

import { z } from "zod";

// Accept Date or ISO string, always emit an ISO string on the wire.
const dateToIso = z
  .union([z.date(), z.string()])
  .transform((v) =>
    v instanceof Date ? v.toISOString() : new Date(v).toISOString()
  )
  .refine((s) => !Number.isNaN(Date.parse(s)), "invalid date");

// ─────────────────────────────────────────────────────────────
// Output DTO — a single account snapshot as served to the dashboard
// ─────────────────────────────────────────────────────────────

export const AccountSnapshotSchema = z.object({
  id: z.cuid(),
  balance: z.number(),
  equity: z.number(),
  margin: z.number(),
  freeMargin: z.number(),
  marginLevel: z.number().nullable(),
  currency: z.string().min(1),
  leverage: z.number().int().nullable(),
  capturedAt: dateToIso,
});

export type AccountSnapshotDTO = z.infer<typeof AccountSnapshotSchema>;

// ─────────────────────────────────────────────────────────────
// Output DTO — "current account" convenience shape for the header/cards
// ─────────────────────────────────────────────────────────────

// Derived fields the UI header shows without recomputing client-side.
export const AccountStateSchema = AccountSnapshotSchema.extend({
  // equity - balance: floating P&L of all open positions at capture time.
  unrealizedPnl: z.number(),
  // marginLevel expressed as a fraction (marginLevel/100) for gauges, or null.
  marginLevelRatio: z.number().nullable(),
});

export type AccountStateDTO = z.infer<typeof AccountStateSchema>;

// ─────────────────────────────────────────────────────────────
// Output — a single point on a historical curve (equity/balance/etc.)
// ─────────────────────────────────────────────────────────────

// Matches the ChartPoint shape the existing chart hooks consume: { t, value }.
export const ChartPointSchema = z.object({
  t: dateToIso,
  value: z.number(),
});

export type ChartPointDTO = z.infer<typeof ChartPointSchema>;

// Which metric a curve request wants to plot.
export const CurveMetricSchema = z.enum([
  "equity",
  "balance",
  "margin",
  "freeMargin",
]);

export type CurveMetric = z.infer<typeof CurveMetricSchema>;

// ─────────────────────────────────────────────────────────────
// Input — an account snapshot pushed by the Python bot
// ─────────────────────────────────────────────────────────────

// The bot streams account state periodically (e.g. on each ACCOUNT_TICK). Each
// push appends a new snapshot row (append-only time series). Server generates
// id/capturedAt unless the bot supplies its own timestamp.
export const CreateAccountSnapshotSchema = z.object({
  balance: z.number(),
  equity: z.number(),
  margin: z.number().optional(),
  freeMargin: z.number().optional(),
  marginLevel: z.number().nullable().optional(),
  currency: z.string().min(1).optional(),
  leverage: z.number().int().nullable().optional(),
  capturedAt: z.union([z.date(), z.string()]).optional(),
});

export type CreateAccountSnapshotInput = z.infer<
  typeof CreateAccountSnapshotSchema
>;

// ─────────────────────────────────────────────────────────────
// Query — params for GET /api/account/curve (historical series)
// ─────────────────────────────────────────────────────────────

export const CurveQuerySchema = z.object({
  metric: CurveMetricSchema.default("equity"),
  // Optional ISO lower bound; omit to return the full retained history.
  since: z.string().datetime().optional(),
  // Cap the number of points returned (downsampling guard for huge histories).
  limit: z.coerce.number().int().min(1).max(5000).default(1000),
});

export type CurveQuery = z.infer<typeof CurveQuerySchema>;
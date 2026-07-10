// dashboard/src/schemas/signal.schema.ts
// Zod schemas + inferred types for the Signal domain.
//
// Mirrors the `Signal` model in prisma/schema.prisma. Signals are an append-only
// log of strategy evaluations: each row is a scored, directional read on a symbol
// at a point in time, optionally acted on by the bot. These schemas validate DB
// rows into JSON-safe DTOs and validate the bot's write payloads.

import { z } from "zod";

// Must match the Prisma SignalDirection enum exactly.
export const SignalDirectionSchema = z.enum(["BUY", "SELL", "NEUTRAL"]);
export type SignalDirection = z.infer<typeof SignalDirectionSchema>;

// Accept Date or ISO string, always emit an ISO string on the wire.
const dateToIso = z
  .union([z.date(), z.string()])
  .transform((v) =>
    v instanceof Date ? v.toISOString() : new Date(v).toISOString()
  )
  .refine((s) => !Number.isNaN(Date.parse(s)), "invalid date");

// indicators / evaluation are free-form JSON snapshots. Accept any JSON-ish
// object (or null) without over-constraining the strategy's internal shape.
const jsonObjectNullable = z.record(z.string(), z.unknown()).nullable();

// ─────────────────────────────────────────────────────────────
// Output DTO — a Signal as served to the dashboard
// ─────────────────────────────────────────────────────────────

export const SignalSchema = z.object({
  id: z.string().cuid(),
  symbol: z.string().min(1),
  timeframe: z.string().min(1),
  direction: SignalDirectionSchema,
  score: z.number(),
  acted: z.boolean(),
  indicators: jsonObjectNullable,
  evaluation: jsonObjectNullable,
  generatedAt: dateToIso,
});

export type SignalDTO = z.infer<typeof SignalSchema>;

// ─────────────────────────────────────────────────────────────
// Input — a signal emitted by the Python strategy engine
// ─────────────────────────────────────────────────────────────

// Append-only: the server generates id/generatedAt unless the bot supplies its
// own timestamp. Signals are never updated, so there's no upsert key.
export const CreateSignalSchema = z.object({
  symbol: z.string().min(1),
  timeframe: z.string().min(1),
  direction: SignalDirectionSchema.default("NEUTRAL"),
  score: z.number(),
  acted: z.boolean().optional(),
  indicators: z.record(z.string(), z.unknown()).nullable().optional(),
  evaluation: z.record(z.string(), z.unknown()).nullable().optional(),
  generatedAt: z.union([z.date(), z.string()]).optional(),
});

export type CreateSignalInput = z.infer<typeof CreateSignalSchema>;

// ─────────────────────────────────────────────────────────────
// Query — list/filter params for GET /api/signals
// ─────────────────────────────────────────────────────────────

// Mirrors what the existing useSignals() hook sends: limit + optional symbol.
export const SignalQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(50),
  symbol: z.string().min(1).optional(),
  direction: SignalDirectionSchema.optional(),
  actedOnly: z.coerce.boolean().optional(),
});

export type SignalQuery = z.infer<typeof SignalQuerySchema>;
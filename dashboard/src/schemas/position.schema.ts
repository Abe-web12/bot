// dashboard/src/schemas/position.schema.ts
// Zod schemas + inferred types for the Position domain.
//
// Mirrors the `Position` model in prisma/schema.prisma. Positions are live,
// short-lived rows (currently open trades) upserted on each tick. These schemas
// validate DB rows into JSON-safe DTOs and validate the bot's write payloads.

import { z } from "zod";

// Must match the Prisma TradeSide enum exactly.
export const PositionSideSchema = z.enum(["BUY", "SELL"]);
export type PositionSide = z.infer<typeof PositionSideSchema>;

// MT5 tickets are 64-bit (Prisma BigInt). Accept bigint/number/string and
// normalize to a JS number for the wire (JSON can't carry BigInt).
const ticketToNumber = z
  .union([z.bigint(), z.number(), z.string()])
  .transform((v) => {
    const n =
      typeof v === "bigint" ? Number(v) : typeof v === "string" ? Number(v) : v;
    if (!Number.isFinite(n)) {
      throw new Error("ticket must be a finite number");
    }
    return n;
  });

// Accept Date or ISO string, always emit an ISO string on the wire.
const dateToIso = z
  .union([z.date(), z.string()])
  .transform((v) =>
    v instanceof Date ? v.toISOString() : new Date(v).toISOString()
  )
  .refine((s) => !Number.isNaN(Date.parse(s)), "invalid date");

// ─────────────────────────────────────────────────────────────
// Output DTO — a Position as served to the dashboard
// ─────────────────────────────────────────────────────────────

export const PositionSchema = z.object({
  id: z.cuid(),
  ticket: ticketToNumber,
  symbol: z.string().min(1),
  side: PositionSideSchema,
  volume: z.number().positive(),
  openPrice: z.number().positive(),
  currentPrice: z.number().positive(),
  stopLoss: z.number().nonnegative().nullable(),
  takeProfit: z.number().nonnegative().nullable(),
  swap: z.number().default(0),
  commission: z.number().default(0),
  unrealizedProfit: z.number().default(0),
  openedAt: dateToIso,
  updatedAt: dateToIso,
});

export type PositionDTO = z.infer<typeof PositionSchema>;

// ─────────────────────────────────────────────────────────────
// Input — a single open position pushed by the Python bot
// ─────────────────────────────────────────────────────────────

export const UpsertPositionSchema = z.object({
  ticket: ticketToNumber,
  symbol: z.string().min(1),
  side: PositionSideSchema,
  volume: z.number().positive(),
  openPrice: z.number().positive(),
  currentPrice: z.number().positive(),
  stopLoss: z.number().nonnegative().nullable().optional(),
  takeProfit: z.number().nonnegative().nullable().optional(),
  swap: z.number().optional(),
  commission: z.number().optional(),
  unrealizedProfit: z.number().optional(),
  openedAt: z.union([z.date(), z.string()]),
});

export type UpsertPositionInput = z.infer<typeof UpsertPositionSchema>;

// ─────────────────────────────────────────────────────────────
// Input — full open-positions snapshot (bot syncs the entire live set)
// ─────────────────────────────────────────────────────────────

// The bot periodically pushes ALL currently-open positions. We treat this as
// the source of truth: upsert every ticket in the payload, delete any DB row
// whose ticket is absent (that position has closed). This schema validates the
// batch.
export const SyncPositionsSchema = z.object({
  positions: z.array(UpsertPositionSchema),
});

export type SyncPositionsInput = z.infer<typeof SyncPositionsSchema>;
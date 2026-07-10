// dashboard/src/schemas/trade.schema.ts
// Zod schemas + inferred types for the Trade domain.
//
// Mirrors the `Trade` model in prisma/schema.prisma. These schemas are the
// runtime validation boundary: Route Handlers parse DB rows / incoming payloads
// through them so malformed data never reaches the dashboard, and the inferred
// types keep the wire contract aligned with the frontend's `types/api.ts`.

import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Enums (must match the Prisma enums exactly)
// ─────────────────────────────────────────────────────────────

export const TradeSideSchema = z.enum(["BUY", "SELL"]);
export const TradeStatusSchema = z.enum(["OPEN", "CLOSED"]);

export type TradeSide = z.infer<typeof TradeSideSchema>;
export type TradeStatus = z.infer<typeof TradeStatusSchema>;

// ─────────────────────────────────────────────────────────────
// Shared field helpers
// ─────────────────────────────────────────────────────────────

// MT5 tickets are 64-bit; Prisma models them as BigInt. Accept a bigint,
// a number, or a numeric string and normalize to a JS number for the wire
// (dashboard JSON can't carry BigInt natively).
const ticketToNumber = z
  .union([z.bigint(), z.number(), z.string()])
  .transform((v) => {
    const n = typeof v === "bigint" ? Number(v) : typeof v === "string" ? Number(v) : v;
    if (!Number.isFinite(n)) {
      throw new Error("ticket must be a finite number");
    }
    return n;
  });

// Accept Date objects or ISO strings, always emit an ISO string on the wire.
const dateToIso = z
  .union([z.date(), z.string()])
  .transform((v) => (v instanceof Date ? v.toISOString() : new Date(v).toISOString()))
  .refine((s) => !Number.isNaN(Date.parse(s)), "invalid date");

const nullableDateToIso = z
  .union([z.date(), z.string(), z.null()])
  .transform((v) =>
    v === null ? null : v instanceof Date ? v.toISOString() : new Date(v).toISOString()
  );

// ─────────────────────────────────────────────────────────────
// Output schema — a Trade as served to the dashboard
// ─────────────────────────────────────────────────────────────

export const TradeSchema = z.object({
  id: z.cuid(),
  ticket: ticketToNumber,
  symbol: z.string().min(1),
  side: TradeSideSchema,
  volume: z.number().positive(),
  openPrice: z.number().positive(),
  closePrice: z.number().positive().nullable(),
  stopLoss: z.number().nonnegative().nullable(),
  takeProfit: z.number().nonnegative().nullable(),
  commission: z.number().default(0),
  swap: z.number().default(0),
  grossProfit: z.number().default(0),
  netProfit: z.number().default(0),
  pips: z.number().nullable(),
  strategy: z.string().nullable(),
  magic: z.number().int().nullable(),
  comment: z.string().nullable(),
  status: TradeStatusSchema,
  openedAt: dateToIso,
  closedAt: nullableDateToIso,
  createdAt: dateToIso,
});

export type TradeDTO = z.infer<typeof TradeSchema>;

// ─────────────────────────────────────────────────────────────
// Input schema — validating a trade written by the Python bot
// ─────────────────────────────────────────────────────────────

// Used when the bot (or Flask) POSTs a closed trade to be persisted. Server
// generates id/createdAt, so they're omitted here.
export const CreateTradeSchema = z.object({
  ticket: ticketToNumber,
  symbol: z.string().min(1),
  side: TradeSideSchema,
  volume: z.number().positive(),
  openPrice: z.number().positive(),
  closePrice: z.number().positive().nullable().optional(),
  stopLoss: z.number().nonnegative().nullable().optional(),
  takeProfit: z.number().nonnegative().nullable().optional(),
  commission: z.number().optional(),
  swap: z.number().optional(),
  grossProfit: z.number().optional(),
  netProfit: z.number().optional(),
  pips: z.number().nullable().optional(),
  strategy: z.string().nullable().optional(),
  magic: z.number().int().nullable().optional(),
  comment: z.string().nullable().optional(),
  status: TradeStatusSchema.default("CLOSED"),
  openedAt: z.union([z.date(), z.string()]),
  closedAt: z.union([z.date(), z.string(), z.null()]).optional(),
});

export type CreateTradeInput = z.infer<typeof CreateTradeSchema>;

// ─────────────────────────────────────────────────────────────
// Query schema — validating list/filter params for GET /api/trades
// ─────────────────────────────────────────────────────────────

// Mirrors the params the existing useTrades() hook sends: page, page_size,
// symbol, sort. Coerces query-string values (always strings) into typed values.
export const TradeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(50),
  symbol: z.string().min(1).optional(),
  sort: z.string().min(1).optional(),
});

export type TradeQuery = z.infer<typeof TradeQuerySchema>;
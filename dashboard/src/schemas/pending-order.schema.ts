// dashboard/src/schemas/pending-order.schema.ts
// Zod schemas + inferred types for the PendingOrder domain.

import { z } from "zod";

const dateToIso = z
  .union([z.date(), z.string()])
  .transform((v) =>
    v instanceof Date ? v.toISOString() : new Date(v).toISOString()
  )
  .refine((s) => !Number.isNaN(Date.parse(s)), "invalid date");

const nullableDateToIso = z
  .union([z.date(), z.string(), z.null()])
  .transform((v) =>
    v === null ? null : v instanceof Date ? v.toISOString() : new Date(v).toISOString()
  );

// MT5/broker tickets are 64-bit. Normalize to a JS number on the wire.
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

export const PendingOrderTypeSchema = z.enum([
  "BUY_LIMIT",
  "SELL_LIMIT",
  "BUY_STOP",
  "SELL_STOP",
]);
export type PendingOrderType = z.infer<typeof PendingOrderTypeSchema>;

export const PendingOrderStatusSchema = z.enum([
  "PENDING",
  "TRIGGERED",
  "CANCELLED",
  "EXPIRED",
  "REJECTED",
]);
export type PendingOrderStatus = z.infer<typeof PendingOrderStatusSchema>;

// ─────────────────────────────────────────────────────────────
// Output DTO
// ─────────────────────────────────────────────────────────────

export const PendingOrderSchema = z.object({
  id: z.cuid(),
  ticket: ticketToNumber,
  symbol: z.string().min(1),
  type: PendingOrderTypeSchema,
  status: PendingOrderStatusSchema,
  volume: z.number().positive(),
  price: z.number().positive(),
  stopLoss: z.number().nonnegative().nullable(),
  takeProfit: z.number().nonnegative().nullable(),
  magic: z.number().int().nullable(),
  strategy: z.string().nullable(),
  comment: z.string().nullable(),
  placedAt: dateToIso,
  expiresAt: nullableDateToIso,
  triggeredAt: nullableDateToIso,
  updatedAt: dateToIso,
});

export type PendingOrderDTO = z.infer<typeof PendingOrderSchema>;

// ─────────────────────────────────────────────────────────────
// Input — upsert (idempotent on ticket)
// ─────────────────────────────────────────────────────────────

export const UpsertPendingOrderSchema = z.object({
  ticket: ticketToNumber,
  symbol: z.string().min(1),
  type: PendingOrderTypeSchema,
  status: PendingOrderStatusSchema.default("PENDING"),
  volume: z.number().positive(),
  price: z.number().positive(),
  stopLoss: z.number().nonnegative().nullable().optional(),
  takeProfit: z.number().nonnegative().nullable().optional(),
  magic: z.number().int().nullable().optional(),
  strategy: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  placedAt: z.union([z.date(), z.string()]).optional(),
  expiresAt: z.union([z.date(), z.string(), z.null()]).optional(),
  triggeredAt: z.union([z.date(), z.string(), z.null()]).optional(),
});

export type UpsertPendingOrderInput = z.infer<typeof UpsertPendingOrderSchema>;

// ─────────────────────────────────────────────────────────────
// Input — status transition
// ─────────────────────────────────────────────────────────────

export const UpdatePendingOrderStatusSchema = z.object({
  ticket: ticketToNumber,
  status: PendingOrderStatusSchema,
  triggeredAt: z.union([z.date(), z.string(), z.null()]).optional(),
});

export type UpdatePendingOrderStatusInput = z.infer<
  typeof UpdatePendingOrderStatusSchema
>;

// ─────────────────────────────────────────────────────────────
// Query
// ─────────────────────────────────────────────────────────────

export const PendingOrderQuerySchema = z.object({
  status: PendingOrderStatusSchema.optional(),
  symbol: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

export type PendingOrderQuery = z.infer<typeof PendingOrderQuerySchema>;
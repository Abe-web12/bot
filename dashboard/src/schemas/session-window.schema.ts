// dashboard/src/schemas/session-window.schema.ts
// Zod schemas + inferred types for the SessionWindow domain.
// Times are minutes from UTC midnight (0..1439). Windows may wrap past midnight
// (endMinuteUtc < startMinuteUtc), which callers interpret as an overnight session.

import { z } from "zod";

const dateToIso = z
  .union([z.date(), z.string()])
  .transform((v) =>
    v instanceof Date ? v.toISOString() : new Date(v).toISOString()
  )
  .refine((s) => !Number.isNaN(Date.parse(s)), "invalid date");

const minuteOfDay = z.number().int().min(0).max(1439);

// ─────────────────────────────────────────────────────────────
// Output DTO
// ─────────────────────────────────────────────────────────────

export const SessionWindowSchema = z.object({
  id: z.cuid(),
  sessionName: z.string().min(1),
  startMinuteUtc: minuteOfDay,
  endMinuteUtc: minuteOfDay,
  enabled: z.boolean(),
  tradingEnabled: z.boolean(),
  symbols: z.array(z.string().min(1)),
  note: z.string().nullable(),
  createdAt: dateToIso,
  updatedAt: dateToIso,
});

export type SessionWindowDTO = z.infer<typeof SessionWindowSchema>;

// ─────────────────────────────────────────────────────────────
// Input — create
// ─────────────────────────────────────────────────────────────

export const CreateSessionWindowSchema = z.object({
  sessionName: z.string().min(1),
  startMinuteUtc: minuteOfDay,
  endMinuteUtc: minuteOfDay,
  enabled: z.boolean().optional(),
  tradingEnabled: z.boolean().optional(),
  symbols: z.array(z.string().min(1)).optional(),
  note: z.string().nullable().optional(),
});

export type CreateSessionWindowInput = z.infer<
  typeof CreateSessionWindowSchema
>;

// ─────────────────────────────────────────────────────────────
// Input — partial update
// ─────────────────────────────────────────────────────────────

export const UpdateSessionWindowSchema = z
  .object({
    sessionName: z.string().min(1).optional(),
    startMinuteUtc: minuteOfDay.optional(),
    endMinuteUtc: minuteOfDay.optional(),
    enabled: z.boolean().optional(),
    tradingEnabled: z.boolean().optional(),
    symbols: z.array(z.string().min(1)).optional(),
    note: z.string().nullable().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, "at least one field required");

export type UpdateSessionWindowInput = z.infer<
  typeof UpdateSessionWindowSchema
>;
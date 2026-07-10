// dashboard/src/schemas/bot-state.schema.ts
// Zod schemas + inferred types for the BotState domain (singleton control row).

import { z } from "zod";

const dateToIso = z
  .union([z.date(), z.string()])
  .transform((v) =>
    v instanceof Date ? v.toISOString() : new Date(v).toISOString()
  )
  .refine((s) => !Number.isNaN(Date.parse(s)), "invalid date");

export const BotModeSchema = z.enum([
  "DISABLED",
  "OBSERVE",
  "SEMI_AUTO",
  "FULL_AUTO",
]);
export type BotMode = z.infer<typeof BotModeSchema>;

// ─────────────────────────────────────────────────────────────
// Output DTO
// ─────────────────────────────────────────────────────────────

export const BotStateSchema = z.object({
  id: z.string(),
  mode: BotModeSchema,
  killSwitch: z.boolean(),
  activeStrategy: z.string().nullable(),
  maxOpenTrades: z.number().int(),
  maxDailyLossPct: z.number(),
  note: z.string().nullable(),
  updatedBy: z.string().nullable(),
  updatedAt: dateToIso,
  createdAt: dateToIso,
});

export type BotStateDTO = z.infer<typeof BotStateSchema>;

// ─────────────────────────────────────────────────────────────
// Input — partial update of the control row
// ─────────────────────────────────────────────────────────────

export const UpdateBotStateSchema = z
  .object({
    mode: BotModeSchema.optional(),
    killSwitch: z.boolean().optional(),
    activeStrategy: z.string().nullable().optional(),
    maxOpenTrades: z.number().int().min(0).max(1000).optional(),
    maxDailyLossPct: z.number().min(0).max(100).optional(),
    note: z.string().nullable().optional(),
    updatedBy: z.string().nullable().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, "at least one field required");

export type UpdateBotStateInput = z.infer<typeof UpdateBotStateSchema>;
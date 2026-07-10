// dashboard/src/schemas/decision-log.schema.ts
// Zod schemas + inferred types for the DecisionLog domain (Gemini audit trail).

import { z } from "zod";

const dateToIso = z
  .union([z.date(), z.string()])
  .transform((v) =>
    v instanceof Date ? v.toISOString() : new Date(v).toISOString()
  )
  .refine((s) => !Number.isNaN(Date.parse(s)), "invalid date");

export const DecisionActionSchema = z.enum([
  "OPEN_BUY",
  "OPEN_SELL",
  "CLOSE",
  "HOLD",
  "SKIP",
]);
export type DecisionAction = z.infer<typeof DecisionActionSchema>;

export const DecisionStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ERROR",
  "EXECUTED",
]);
export type DecisionStatus = z.infer<typeof DecisionStatusSchema>;

// ─────────────────────────────────────────────────────────────
// Output DTO
// ─────────────────────────────────────────────────────────────

export const DecisionLogSchema = z.object({
  id: z.cuid(),
  symbol: z.string().min(1),
  timeframe: z.string().nullable(),
  action: DecisionActionSchema,
  status: DecisionStatusSchema,
  model: z.string().nullable(),
  inputPrompt: z.string(),
  outputDecision: z.string(),
  rationale: z.string().nullable(),
  confidenceScore: z.number().min(0).max(1).nullable(),
  proposedSl: z.number().nullable(),
  proposedTp: z.number().nullable(),
  proposedVolume: z.number().nullable(),
  latencyMs: z.number().int().nullable(),
  error: z.string().nullable(),
  signalId: z.cuid().nullable(),
  sessionWindowId: z.cuid().nullable(),
  pendingOrderId: z.cuid().nullable(),
  tradeId: z.cuid().nullable(),
  createdAt: dateToIso,
});

export type DecisionLogDTO = z.infer<typeof DecisionLogSchema>;

// ─────────────────────────────────────────────────────────────
// Input — create (append-only audit record)
// ─────────────────────────────────────────────────────────────

export const CreateDecisionLogSchema = z.object({
  symbol: z.string().min(1),
  timeframe: z.string().nullable().optional(),
  action: DecisionActionSchema.default("SKIP"),
  status: DecisionStatusSchema.default("PENDING"),
  model: z.string().nullable().optional(),
  inputPrompt: z.string(),
  outputDecision: z.string(),
  rationale: z.string().nullable().optional(),
  confidenceScore: z.number().min(0).max(1).nullable().optional(),
  proposedSl: z.number().nullable().optional(),
  proposedTp: z.number().nullable().optional(),
  proposedVolume: z.number().nullable().optional(),
  latencyMs: z.number().int().nullable().optional(),
  error: z.string().nullable().optional(),
  signalId: z.cuid().nullable().optional(),
  sessionWindowId: z.cuid().nullable().optional(),
  pendingOrderId: z.cuid().nullable().optional(),
  tradeId: z.cuid().nullable().optional(),
});

export type CreateDecisionLogInput = z.infer<typeof CreateDecisionLogSchema>;

// ─────────────────────────────────────────────────────────────
// Input — status transition (e.g. PENDING -> EXECUTED, link a trade)
// ─────────────────────────────────────────────────────────────

export const UpdateDecisionLogSchema = z
  .object({
    status: DecisionStatusSchema.optional(),
    tradeId: z.cuid().nullable().optional(),
    pendingOrderId: z.cuid().nullable().optional(),
    error: z.string().nullable().optional(),
  })
  .refine((o) => Object.keys(o).length > 0, "at least one field required");

export type UpdateDecisionLogInput = z.infer<typeof UpdateDecisionLogSchema>;

// ─────────────────────────────────────────────────────────────
// Query
// ─────────────────────────────────────────────────────────────

export const DecisionLogQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(50),
  symbol: z.string().min(1).optional(),
  status: DecisionStatusSchema.optional(),
  action: DecisionActionSchema.optional(),
});

export type DecisionLogQuery = z.infer<typeof DecisionLogQuerySchema>;
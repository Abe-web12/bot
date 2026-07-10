// dashboard/src/server/signal.service.ts
// Signal data-access layer (Prisma queries for the Signal domain).
//
// Signals are an append-only log. Reads return newest-first with optional
// symbol/direction/acted filtering. The write path creates a single signal
// (emitted by the Python strategy engine).
//
// Prisma 7: the generated client + Prisma namespace live at src/generated/prisma
// (see generator `output` in schema.prisma), so we import the Prisma types from
// "@/generated/prisma" rather than the legacy "@prisma/client" path.

import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import {
  SignalSchema,
  CreateSignalSchema,
  type SignalDTO,
  type CreateSignalInput,
  type SignalQuery,
} from "@/schemas/signal.schema";

// Prisma stores indicators/evaluation as Json. Normalize to a plain object or
// null before the DTO validates it.
function toDTO(row: unknown): SignalDTO {
  return SignalSchema.parse(row);
}

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────

export interface SignalsResult {
  count: number;
  signals: SignalDTO[];
}

export async function listSignals(query: SignalQuery): Promise<SignalsResult> {
  const { limit, symbol, direction, actedOnly } = query;

  const where: Prisma.SignalWhereInput = {
    ...(symbol ? { symbol } : {}),
    ...(direction ? { direction } : {}),
    ...(actedOnly ? { acted: true } : {}),
  };

  const rows = await prisma.signal.findMany({
    where,
    orderBy: { generatedAt: "desc" },
    take: limit,
  });

  const signals = rows.map(toDTO);

  return { count: signals.length, signals };
}

// Latest signal for a single symbol (used by per-symbol signal widgets).
export async function getLatestSignal(symbol: string): Promise<SignalDTO | null> {
  const row = await prisma.signal.findFirst({
    where: { symbol },
    orderBy: { generatedAt: "desc" },
  });
  return row ? toDTO(row) : null;
}

// ─────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────

// Append a new signal emitted by the strategy engine.
export async function createSignal(input: CreateSignalInput): Promise<SignalDTO> {
  const data = CreateSignalSchema.parse(input);

  const row = await prisma.signal.create({
    data: {
      symbol: data.symbol,
      timeframe: data.timeframe,
      direction: data.direction,
      score: data.score,
      acted: data.acted ?? false,
      // Cast through Prisma's JSON input type; null is a valid DB Json value.
      indicators: (data.indicators ?? null) as Prisma.InputJsonValue,
      evaluation: (data.evaluation ?? null) as Prisma.InputJsonValue,
      ...(data.generatedAt ? { generatedAt: new Date(data.generatedAt) } : {}),
    },
  });

  return toDTO(row);
}
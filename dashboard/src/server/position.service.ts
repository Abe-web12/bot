// dashboard/src/server/position.service.ts
// Position data-access layer (Prisma queries for the Position domain).
//
// Positions represent the CURRENT open set. Reads return them newest-first.
// The write path is a full-snapshot reconcile: the bot sends every open
// position, we upsert those and delete any ticket no longer present, so the
// table always mirrors the live account.
//
// Prisma 7: the generated client + Prisma namespace live at src/generated/prisma
// (see generator `output` in schema.prisma), so we import the Prisma types from
// "@/generated/prisma" rather than the legacy "@prisma/client" path.

import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import {
  PositionSchema,
  UpsertPositionSchema,
  SyncPositionsSchema,
  type PositionDTO,
  type UpsertPositionInput,
  type SyncPositionsInput,
} from "@/schemas/position.schema";

// Normalize a Prisma Position row into a validated, JSON-safe DTO.
function toDTO(row: unknown): PositionDTO {
  return PositionSchema.parse(row);
}

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────

export interface PositionsResult {
  count: number;
  positions: PositionDTO[];
  total_unrealized: number;
}

// All currently-open positions, optionally filtered by symbol.
export async function listPositions(symbol?: string): Promise<PositionsResult> {
  const where: Prisma.PositionWhereInput = symbol ? { symbol } : {};

  const rows = await prisma.position.findMany({
    where,
    orderBy: { openedAt: "desc" },
  });

  const positions = rows.map(toDTO);
  const total_unrealized = Number(
    positions.reduce((sum, p) => sum + p.unrealizedProfit, 0).toFixed(2)
  );

  return {
    count: positions.length,
    positions,
    total_unrealized,
  };
}

// ─────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────

// Upsert a single position (used for incremental per-tick updates).
export async function upsertPosition(
  input: UpsertPositionInput
): Promise<PositionDTO> {
  const data = UpsertPositionSchema.parse(input);
  const openedAt = new Date(data.openedAt);

  const row = await prisma.position.upsert({
    where: { ticket: BigInt(data.ticket) },
    create: {
      ticket: BigInt(data.ticket),
      symbol: data.symbol,
      side: data.side,
      volume: data.volume,
      openPrice: data.openPrice,
      currentPrice: data.currentPrice,
      stopLoss: data.stopLoss ?? null,
      takeProfit: data.takeProfit ?? null,
      swap: data.swap ?? 0,
      commission: data.commission ?? 0,
      unrealizedProfit: data.unrealizedProfit ?? 0,
      openedAt,
    },
    update: {
      symbol: data.symbol,
      side: data.side,
      volume: data.volume,
      openPrice: data.openPrice,
      currentPrice: data.currentPrice,
      stopLoss: data.stopLoss ?? null,
      takeProfit: data.takeProfit ?? null,
      swap: data.swap ?? 0,
      commission: data.commission ?? 0,
      unrealizedProfit: data.unrealizedProfit ?? 0,
      openedAt,
    },
  });

  return toDTO(row);
}

// Full-snapshot reconcile. The bot sends the complete open-position set; we
// upsert every ticket present and delete any DB row whose ticket is absent
// (those positions have closed). Wrapped in a transaction so the dashboard
// never observes a half-synced state.
export async function syncPositions(
  input: SyncPositionsInput
): Promise<PositionsResult> {
  const { positions } = SyncPositionsSchema.parse(input);

  const incomingTickets = positions.map((p) => BigInt(p.ticket));

  await prisma.$transaction([
    // Delete positions that are no longer open.
    prisma.position.deleteMany({
      where:
        incomingTickets.length > 0
          ? { ticket: { notIn: incomingTickets } }
          : {}, // empty payload => account is flat => clear all
    }),
    // Upsert each incoming open position.
    ...positions.map((p) => {
      const openedAt = new Date(p.openedAt);
      return prisma.position.upsert({
        where: { ticket: BigInt(p.ticket) },
        create: {
          ticket: BigInt(p.ticket),
          symbol: p.symbol,
          side: p.side,
          volume: p.volume,
          openPrice: p.openPrice,
          currentPrice: p.currentPrice,
          stopLoss: p.stopLoss ?? null,
          takeProfit: p.takeProfit ?? null,
          swap: p.swap ?? 0,
          commission: p.commission ?? 0,
          unrealizedProfit: p.unrealizedProfit ?? 0,
          openedAt,
        },
        update: {
          symbol: p.symbol,
          side: p.side,
          volume: p.volume,
          openPrice: p.openPrice,
          currentPrice: p.currentPrice,
          stopLoss: p.stopLoss ?? null,
          takeProfit: p.takeProfit ?? null,
          swap: p.swap ?? 0,
          commission: p.commission ?? 0,
          unrealizedProfit: p.unrealizedProfit ?? 0,
          openedAt,
        },
      });
    }),
  ]);

  return listPositions();
}
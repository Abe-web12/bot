// dashboard/src/server/trade.service.ts
// Trade data-access layer (Prisma queries for the Trade domain).
//
// Route Handlers stay thin and call into this service. All Prisma access,
// filtering, pagination, aggregation, and DTO normalization for trades lives
// here. Output is validated through TradeSchema so what leaves this layer is
// guaranteed to match the wire contract (BigInt/Date already normalized).
//
// Prisma 7: the generated client + Prisma namespace live at src/generated/prisma
// (see generator `output` in schema.prisma), so we import the Prisma types from
// "@/generated/prisma" rather than the legacy "@prisma/client" path.

import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import {
  TradeSchema,
  CreateTradeSchema,
  type TradeDTO,
  type CreateTradeInput,
  type TradeQuery,
} from "@/schemas/trade.schema";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface WinRateSummary {
  total: number;
  wins: number;
  losses: number;
  win_rate_pct: number;
}

export interface PagedTrades {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  items: TradeDTO[];
  win_rate: WinRateSummary;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

// Normalize a Prisma Trade row into a validated, JSON-safe DTO.
// TradeSchema handles BigInt->number and Date->ISO conversions.
function toDTO(row: unknown): TradeDTO {
  return TradeSchema.parse(row);
}

// Translate the sort query param into a Prisma orderBy clause.
// Accepts "field" (asc) or "-field" (desc); falls back to newest closed first.
function buildOrderBy(
  sort?: string
): Prisma.TradeOrderByWithRelationInput {
  const allowed = new Set([
    "closedAt",
    "openedAt",
    "netProfit",
    "grossProfit",
    "pips",
    "volume",
    "symbol",
  ]);

  if (!sort) {
    return { closedAt: "desc" };
  }

  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;

  if (!allowed.has(field)) {
    return { closedAt: "desc" };
  }

  return { [field]: desc ? "desc" : "asc" } as Prisma.TradeOrderByWithRelationInput;
}

// ─────────────────────────────────────────────────────────────
// Reads
// ─────────────────────────────────────────────────────────────

// Paginated, optionally symbol-filtered list of trades plus a win-rate summary
// computed over the SAME filter (not just the current page).
export async function listTrades(query: TradeQuery): Promise<PagedTrades> {
  const { page, pageSize, symbol, sort } = query;

  const where: Prisma.TradeWhereInput = {
    status: "CLOSED",
    ...(symbol ? { symbol } : {}),
  };

  const [total, rows, wins, losses] = await Promise.all([
    prisma.trade.count({ where }),
    prisma.trade.findMany({
      where,
      orderBy: buildOrderBy(sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.trade.count({ where: { ...where, netProfit: { gt: 0 } } }),
    prisma.trade.count({ where: { ...where, netProfit: { lte: 0 } } }),
  ]);

  const decided = wins + losses;

  return {
    page,
    page_size: pageSize,
    total,
    total_pages: Math.max(1, Math.ceil(total / pageSize)),
    items: rows.map(toDTO),
    win_rate: {
      total: decided,
      wins,
      losses,
      win_rate_pct: decided === 0 ? 0 : Number(((wins / decided) * 100).toFixed(2)),
    },
  };
}

// Fetch a single trade by its MT5 ticket. Returns null if not found.
export async function getTradeByTicket(ticket: number): Promise<TradeDTO | null> {
  const row = await prisma.trade.findUnique({
    where: { ticket: BigInt(ticket) },
  });
  return row ? toDTO(row) : null;
}

// ─────────────────────────────────────────────────────────────
// Writes
// ─────────────────────────────────────────────────────────────

// Upsert a closed trade coming from the Python bot / Flask. Idempotent on
// ticket so replays or re-syncs don't create duplicates. Input is validated
// through CreateTradeSchema before touching the DB.
export async function upsertTrade(input: CreateTradeInput): Promise<TradeDTO> {
  const data = CreateTradeSchema.parse(input);

  const openedAt = new Date(data.openedAt);
  const closedAt =
    data.closedAt == null ? null : new Date(data.closedAt);

  const row = await prisma.trade.upsert({
    where: { ticket: BigInt(data.ticket) },
    create: {
      ticket: BigInt(data.ticket),
      symbol: data.symbol,
      side: data.side,
      volume: data.volume,
      openPrice: data.openPrice,
      closePrice: data.closePrice ?? null,
      stopLoss: data.stopLoss ?? null,
      takeProfit: data.takeProfit ?? null,
      commission: data.commission ?? 0,
      swap: data.swap ?? 0,
      grossProfit: data.grossProfit ?? 0,
      netProfit: data.netProfit ?? 0,
      pips: data.pips ?? null,
      strategy: data.strategy ?? null,
      magic: data.magic ?? null,
      comment: data.comment ?? null,
      status: data.status,
      openedAt,
      closedAt,
    },
    update: {
      symbol: data.symbol,
      side: data.side,
      volume: data.volume,
      openPrice: data.openPrice,
      closePrice: data.closePrice ?? null,
      stopLoss: data.stopLoss ?? null,
      takeProfit: data.takeProfit ?? null,
      commission: data.commission ?? 0,
      swap: data.swap ?? 0,
      grossProfit: data.grossProfit ?? 0,
      netProfit: data.netProfit ?? 0,
      pips: data.pips ?? null,
      strategy: data.strategy ?? null,
      magic: data.magic ?? null,
      comment: data.comment ?? null,
      status: data.status,
      openedAt,
      closedAt,
    },
  });

  return toDTO(row);
}
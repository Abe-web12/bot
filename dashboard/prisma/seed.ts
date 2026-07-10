// dashboard/prisma/seed.ts
// DEV-ONLY seed. Populates realistic sample rows so you can boot the dashboard
// and see it fully rendered before the live Python pipeline is streaming.
//
// This file is NEVER imported by the app and NEVER runs at request time. It is
// invoked manually (`npm run db:seed` / `prisma db seed`). It refuses to run
// when NODE_ENV=production so it can't clobber a live database.
//
// Run:
//   npx prisma db seed
// or add to package.json:
//   "prisma": { "seed": "tsx prisma/seed.ts" }
//   "scripts": { "db:seed": "tsx prisma/seed.ts" }

import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────
// Safety: never seed a production database.
// ─────────────────────────────────────────────────────────────

if (process.env.NODE_ENV === "production") {
  console.error("✋ Refusing to run seed in production. Aborting.");
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────
// Deterministic pseudo-random helpers (seeded) so runs are reproducible.
// ─────────────────────────────────────────────────────────────

let _s = 1234567;
function rand(): number {
  // Mulberry32-ish deterministic PRNG.
  _s |= 0;
  _s = (_s + 0x6d2b79f5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function randBetween(min: number, max: number): number {
  return min + rand() * (max - min);
}
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function round(n: number, dp = 2): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

const SYMBOLS = ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD", "AUDUSD"] as const;
const TIMEFRAMES = ["M15", "H1", "H4"] as const;
const STRATEGIES = ["trend-follow", "mean-revert", "breakout"] as const;

const now = Date.now();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

// Pip size per symbol (JPY pairs and gold differ).
function pipSize(symbol: string): number {
  if (symbol.endsWith("JPY")) return 0.01;
  if (symbol === "XAUUSD") return 0.1;
  return 0.0001;
}
function basePrice(symbol: string): number {
  switch (symbol) {
    case "EURUSD": return 1.085;
    case "GBPUSD": return 1.272;
    case "USDJPY": return 157.4;
    case "XAUUSD": return 2345.0;
    case "AUDUSD": return 0.664;
    default: return 1.0;
  }
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding dev data…");

  // Clean slate (dev only). Order respects nothing special since there are no
  // cross-model FKs in the current schema, but we clear everything we seed.
  await prisma.$transaction([
    prisma.trade.deleteMany({}),
    prisma.position.deleteMany({}),
    prisma.signal.deleteMany({}),
    prisma.accountSnapshot.deleteMany({}),
    prisma.riskSnapshot.deleteMany({}),
    prisma.marketCandle.deleteMany({}),
    prisma.logEntry.deleteMany({}),
    prisma.journalEntry.deleteMany({}),
    prisma.notification.deleteMany({}),
  ]);

  let ticketSeq = 100_000;

  // ── Closed trades (last 30 days) ───────────────────────────
  const trades: Prisma.TradeCreateManyInput[] = [];
  for (let i = 0; i < 120; i++) {
    const symbol = pick(SYMBOLS);
    const side = rand() > 0.5 ? "BUY" : "SELL";
    const openedAt = new Date(now - randBetween(1, 30) * DAY);
    const holdMs = randBetween(20 * MIN, 8 * HOUR);
    const closedAt = new Date(openedAt.getTime() + holdMs);
    const bp = basePrice(symbol);
    const openPrice = round(bp * (1 + randBetween(-0.01, 0.01)), symbol.endsWith("JPY") ? 3 : 5);
    const pips = round(randBetween(-40, 60), 1);
    const dir = side === "BUY" ? 1 : -1;
    const closePrice = round(openPrice + dir * pips * pipSize(symbol), symbol.endsWith("JPY") ? 3 : 5);
    const volume = round(pick([0.01, 0.05, 0.1, 0.2, 0.5]), 2);
    const gross = round(pips * pipSize(symbol) * volume * 100000 * (symbol === "XAUUSD" ? 0.1 : 1) / (symbol.endsWith("JPY") ? 100 : 1), 2);
    const commission = round(-volume * 7, 2);
    const swap = round(randBetween(-2, 1), 2);
    const net = round(gross + commission + swap, 2);

    trades.push({
      ticket: BigInt(ticketSeq++),
      symbol,
      side,
      volume,
      openPrice,
      closePrice,
      stopLoss: round(openPrice - dir * randBetween(20, 50) * pipSize(symbol), 5),
      takeProfit: round(openPrice + dir * randBetween(30, 90) * pipSize(symbol), 5),
      commission,
      swap,
      grossProfit: gross,
      netProfit: net,
      pips,
      strategy: pick(STRATEGIES),
      magic: 2026,
      comment: null,
      status: "CLOSED",
      openedAt,
      closedAt,
    });
  }
  await prisma.trade.createMany({ data: trades });

  // ── Open positions (live set) ──────────────────────────────
  const positions: Prisma.PositionCreateManyInput[] = [];
  const openCount = 4;
  for (let i = 0; i < openCount; i++) {
    const symbol = SYMBOLS[i % SYMBOLS.length];
    const side = rand() > 0.5 ? "BUY" : "SELL";
    const bp = basePrice(symbol);
    const openPrice = round(bp * (1 + randBetween(-0.005, 0.005)), symbol.endsWith("JPY") ? 3 : 5);
    const currentPrice = round(openPrice * (1 + randBetween(-0.004, 0.004)), symbol.endsWith("JPY") ? 3 : 5);
    const volume = round(pick([0.05, 0.1, 0.2]), 2);
    const dir = side === "BUY" ? 1 : -1;
    const floatPips = (currentPrice - openPrice) / pipSize(symbol) * dir;
    const unrealized = round(floatPips * pipSize(symbol) * volume * 100000 / (symbol.endsWith("JPY") ? 100 : 1), 2);

    positions.push({
      ticket: BigInt(ticketSeq++),
      symbol,
      side,
      volume,
      openPrice,
      currentPrice,
      stopLoss: round(openPrice - dir * randBetween(20, 50) * pipSize(symbol), 5),
      takeProfit: round(openPrice + dir * randBetween(40, 100) * pipSize(symbol), 5),
      swap: round(randBetween(-1, 0.5), 2),
      commission: round(-volume * 7, 2),
      unrealizedProfit: unrealized,
      openedAt: new Date(now - randBetween(10 * MIN, 6 * HOUR)),
    });
  }
  await prisma.position.createMany({ data: positions });

  // ── Signals (append-only log, last 3 days) ─────────────────
  const signals: Prisma.SignalCreateManyInput[] = [];
  for (let i = 0; i < 80; i++) {
    const symbol = pick(SYMBOLS);
    const score = round(randBetween(-1, 1), 3);
    const direction = score > 0.25 ? "BUY" : score < -0.25 ? "SELL" : "NEUTRAL";
    signals.push({
      symbol,
      timeframe: pick(TIMEFRAMES),
      direction,
      score,
      acted: Math.abs(score) > 0.6 && rand() > 0.4,
      indicators: {
        rsi: round(randBetween(20, 80), 1),
        ema_fast: round(basePrice(symbol) * (1 + randBetween(-0.002, 0.002)), 5),
        ema_slow: round(basePrice(symbol) * (1 + randBetween(-0.003, 0.003)), 5),
        atr: round(randBetween(0.0004, 0.0025), 5),
      } as Prisma.InputJsonValue,
      evaluation: {
        trend: pick(["up", "down", "flat"]),
        momentum: round(randBetween(-1, 1), 2),
        passed: Math.abs(score) > 0.5,
      } as Prisma.InputJsonValue,
      generatedAt: new Date(now - randBetween(1 * MIN, 3 * DAY)),
    });
  }
  await prisma.signal.createMany({ data: signals });

  // ── Account snapshots (equity curve, last 30 days hourly-ish) ──
  const accountRows: Prisma.AccountSnapshotCreateManyInput[] = [];
  let balance = 10_000;
  const points = 30 * 24; // ~hourly for 30 days
  for (let i = points; i >= 0; i--) {
    const capturedAt = new Date(now - i * HOUR);
    // Random walk with slight positive drift.
    balance = round(balance + randBetween(-25, 30), 2);
    const equity = round(balance + randBetween(-60, 60), 2);
    const margin = round(randBetween(50, 400), 2);
    accountRows.push({
      balance,
      equity,
      margin,
      freeMargin: round(equity - margin, 2),
      marginLevel: round((equity / margin) * 100, 2),
      currency: "USD",
      leverage: 100,
      capturedAt,
    });
  }
  await prisma.accountSnapshot.createMany({ data: accountRows });

  // ── Risk snapshots (last 24h, every 10 min) ────────────────
  const riskRows: Prisma.RiskSnapshotCreateManyInput[] = [];
  for (let i = 144; i >= 0; i--) {
    const capturedAt = new Date(now - i * 10 * MIN);
    const dailyDrawdownPct = round(randBetween(0, 4.5), 2);
    const maxDrawdownPct = round(randBetween(5, 18), 2);
    const exposurePct = round(randBetween(10, 90), 2);
    riskRows.push({
      dailyPnl: round(randBetween(-150, 200), 2),
      dailyDrawdownPct,
      maxDrawdownPct,
      openRiskPct: round(randBetween(0, 6), 2),
      exposurePct,
      riskPerTradePct: round(randBetween(0.5, 2), 2),
      openPositions: Math.floor(randBetween(0, 5)),
      marginLevel: round(randBetween(300, 1500), 2),
      capturedAt,
    });
  }
  await prisma.riskSnapshot.createMany({ data: riskRows });

  // ── Market candles (H1, last 100 bars per symbol) ──────────
  const candleRows: Prisma.MarketCandleCreateManyInput[] = [];
  for (const symbol of SYMBOLS) {
    let price = basePrice(symbol);
    for (let i = 100; i >= 0; i--) {
      const openTime = new Date(now - i * HOUR);
      const drift = randBetween(-0.0015, 0.0015);
      const open = round(price, symbol.endsWith("JPY") ? 3 : 5);
      const close = round(price * (1 + drift), symbol.endsWith("JPY") ? 3 : 5);
      const high = round(Math.max(open, close) * (1 + randBetween(0, 0.001)), symbol.endsWith("JPY") ? 3 : 5);
      const low = round(Math.min(open, close) * (1 - randBetween(0, 0.001)), symbol.endsWith("JPY") ? 3 : 5);
      candleRows.push({
        symbol,
        timeframe: "H1",
        openTime,
        open,
        high,
        low,
        close,
        volume: round(randBetween(500, 5000), 0),
        spread: round(randBetween(0.5, 2.5), 2),
      });
      price = close;
    }
  }
  await prisma.marketCandle.createMany({ data: candleRows });

  // ── Log entries ────────────────────────────────────────────
  const levels = ["DEBUG", "INFO", "WARNING", "ERROR"] as const;
  const logRows: Prisma.LogEntryCreateManyInput[] = [];
  for (let i = 0; i < 60; i++) {
    const level = pick(levels);
    logRows.push({
      level,
      logger: pick(["forex_bot", "mt5_bridge", "risk_engine", "strategy"]),
      message: pick([
        "Tick processed",
        "Signal evaluated",
        "Order sent to MT5",
        "Position closed",
        "Spread exceeded limit, skipping entry",
        "Reconnected to MT5 bridge",
      ]),
      context: { seq: i } as Prisma.InputJsonValue,
      createdAt: new Date(now - randBetween(1 * MIN, 2 * DAY)),
    });
  }
  await prisma.logEntry.createMany({ data: logRows });

  // ── Journal entries ────────────────────────────────────────
  const journalRows: Prisma.JournalEntryCreateManyInput[] = [];
  for (let i = 0; i < 12; i++) {
    const symbol = pick(SYMBOLS);
    journalRows.push({
      entryType: pick(["trade", "note", "system"]),
      symbol,
      title: pick([
        "Strong trend continuation",
        "Choppy session, reduced size",
        "News spike avoided",
        "Weekly review",
      ]),
      content: { note: "Auto-generated dev journal entry." } as Prisma.InputJsonValue,
      createdAt: new Date(now - randBetween(1 * HOUR, 20 * DAY)),
    });
  }
  await prisma.journalEntry.createMany({ data: journalRows });

  // ── Notifications ──────────────────────────────────────────
  const notifRows: Prisma.NotificationCreateManyInput[] = [];
  for (let i = 0; i < 15; i++) {
    const status = pick(["QUEUED", "SENT", "FAILED"] as const);
    notifRows.push({
      channel: pick(["telegram", "email"]),
      level: pick(["INFO", "WARNING", "ERROR"] as const),
      title: pick(["Trade opened", "Trade closed", "Drawdown alert", "Bot paused"]),
      body: "Auto-generated dev notification.",
      status,
      sentAt: status === "SENT" ? new Date(now - randBetween(1 * MIN, 1 * DAY)) : null,
      createdAt: new Date(now - randBetween(1 * MIN, 2 * DAY)),
    });
  }
  await prisma.notification.createMany({ data: notifRows });

  // ── Summary ────────────────────────────────────────────────
  const [tc, pc, sc, ac, rc, cc, lc, jc, nc] = await Promise.all([
    prisma.trade.count(),
    prisma.position.count(),
    prisma.signal.count(),
    prisma.accountSnapshot.count(),
    prisma.riskSnapshot.count(),
    prisma.marketCandle.count(),
    prisma.logEntry.count(),
    prisma.journalEntry.count(),
    prisma.notification.count(),
  ]);

  console.log("✅ Seed complete:");
  console.log(`   trades:            ${tc}`);
  console.log(`   positions (open):  ${pc}`);
  console.log(`   signals:           ${sc}`);
  console.log(`   account snapshots: ${ac}`);
  console.log(`   risk snapshots:    ${rc}`);
  console.log(`   market candles:    ${cc}`);
  console.log(`   log entries:       ${lc}`);
  console.log(`   journal entries:   ${jc}`);
  console.log(`   notifications:     ${nc}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
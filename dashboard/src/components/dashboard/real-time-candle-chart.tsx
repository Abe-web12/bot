"use client";

import {
  memo,
  useMemo,
  type ReactElement,
} from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  WifiOff,
} from "lucide-react";

import type { MarketTickPayload } from "@/types/websocket";

export interface MarketCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface MarketCandlesCache {
  timestamp?: string;
  symbol: string;
  timeframe: string;
  count: number;
  candles: MarketCandle[];
}

export interface MarketPriceCache extends MarketTickPayload {
  occurred_at?: string;
}

export interface RealTimeCandleChartProps {
  symbol: string;
  timeframe?: string;
  count?: number;
  height?: number;
  className?: string;
}

interface ChartCandle extends MarketCandle {
  timestamp: number;
  label: string;
  range: [number, number];
  bullish: boolean;
  live: boolean;
}

interface CandleShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ChartCandle;
}

interface CandleTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload?: ChartCandle;
  }>;
}

const TIMEFRAME_MILLISECONDS: Record<string, number> = {
  M1: 60_000,
  M5: 5 * 60_000,
  M15: 15 * 60_000,
  M30: 30 * 60_000,
  H1: 60 * 60_000,
  H4: 4 * 60 * 60_000,
  D1: 24 * 60 * 60_000,
};

function isFiniteNumber(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function parseTimestamp(value: string): number {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatAxisTime(
  timestamp: number,
  timeframe: string,
): string {
  const date = new Date(timestamp);

  if (timeframe === "D1") {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

function formatFullTime(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(timestamp));
}

function getPricePrecision(symbol: string): number {
  if (symbol.endsWith("JPY")) {
    return 3;
  }

  if (
    symbol.startsWith("XAU") ||
    symbol.startsWith("XAG")
  ) {
    return 2;
  }

  return 5;
}

function getTickMidPrice(
  tick: MarketPriceCache | undefined,
): number | null {
  if (!tick) {
    return null;
  }

  if (
    isFiniteNumber(tick.bid) &&
    isFiniteNumber(tick.ask)
  ) {
    return (tick.bid + tick.ask) / 2;
  }

  if (isFiniteNumber(tick.bid)) {
    return tick.bid;
  }

  if (isFiniteNumber(tick.ask)) {
    return tick.ask;
  }

  return null;
}

function getTickTimestamp(
  tick: MarketPriceCache | undefined,
): number {
  if (!tick) {
    return 0;
  }

  const rawTimestamp =
    tick.timestamp ??
    tick.occurred_at;

  if (!rawTimestamp) {
    return Date.now();
  }

  const parsed = parseTimestamp(rawTimestamp);
  return parsed > 0 ? parsed : Date.now();
}

function mergeLiveTick(
  candles: MarketCandle[],
  tick: MarketPriceCache | undefined,
  timeframe: string,
): Array<MarketCandle & { live?: boolean }> {
  if (candles.length === 0) {
    return [];
  }

  const midPrice = getTickMidPrice(tick);

  if (midPrice === null) {
    return candles;
  }

  const interval =
    TIMEFRAME_MILLISECONDS[timeframe] ??
    TIMEFRAME_MILLISECONDS.H1;

  const tickTimestamp = getTickTimestamp(tick);
  const bucketStart =
    Math.floor(tickTimestamp / interval) * interval;

  const nextCandles = candles.map((candle) => ({
    ...candle,
    live: false,
  }));

  const lastIndex = nextCandles.length - 1;
  const lastCandle = nextCandles[lastIndex];
  const lastTimestamp = parseTimestamp(lastCandle.time);
  const lastBucket =
    Math.floor(lastTimestamp / interval) * interval;

  if (lastBucket === bucketStart) {
    nextCandles[lastIndex] = {
      ...lastCandle,
      high: Math.max(lastCandle.high, midPrice),
      low: Math.min(lastCandle.low, midPrice),
      close: midPrice,
      live: true,
    };

    return nextCandles;
  }

  if (bucketStart > lastBucket) {
    nextCandles.push({
      time: new Date(bucketStart).toISOString(),
      open: lastCandle.close,
      high: Math.max(lastCandle.close, midPrice),
      low: Math.min(lastCandle.close, midPrice),
      close: midPrice,
      volume: 0,
      live: true,
    });
  }

  return nextCandles;
}

function CandlestickShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
}: CandleShapeProps): ReactElement | null {
  if (!payload || width <= 0) {
    return null;
  }

  const {
    open,
    high,
    low,
    close,
    bullish,
    live,
  } = payload;

  const priceRange = Math.max(high - low, Number.EPSILON);

  const priceToY = (price: number): number =>
    y + ((high - price) / priceRange) * height;

  const openY = priceToY(open);
  const closeY = priceToY(close);
  const bodyTop = Math.min(openY, closeY);
  const bodyHeight = Math.max(
    Math.abs(closeY - openY),
    1.5,
  );

  const candleWidth = Math.max(
    Math.min(width * 0.62, 12),
    3,
  );

  const centerX = x + width / 2;
  const bodyX = centerX - candleWidth / 2;

  const bodyColor = bullish
    ? "oklch(76% 0.16 160)"
    : "oklch(67% 0.19 25)";

  const liveColor = "oklch(78% 0.15 85)";
  const color = live ? liveColor : bodyColor;

  return (
    <g aria-hidden="true">
      <line
        x1={centerX}
        x2={centerX}
        y1={y}
        y2={y + height}
        stroke={color}
        strokeWidth={1.2}
        vectorEffect="non-scaling-stroke"
      />

      <rect
        x={bodyX}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        rx={1}
        fill={bullish ? color : "oklch(22% 0.02 25)"}
        stroke={color}
        strokeWidth={1.2}
        vectorEffect="non-scaling-stroke"
      />

      {live ? (
        <circle
          cx={centerX}
          cy={closeY}
          r={2.2}
          fill={liveColor}
        />
      ) : null}
    </g>
  );
}

const CandleTooltip = memo(function CandleTooltip({
  active,
  payload,
}: CandleTooltipProps): ReactElement | null {
  const candle = payload?.[0]?.payload;

  if (!active || !candle) {
    return null;
  }

  const precision = 5;
  const change = candle.close - candle.open;
  const changePercent =
    candle.open === 0
      ? 0
      : (change / candle.open) * 100;

  return (
    <div className="min-w-52 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-3 text-xs shadow-xl shadow-black/30">
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="font-medium text-zinc-200">
          {formatFullTime(candle.timestamp)}
        </span>

        {candle.live ? (
          <span className="rounded bg-amber-400/10 px-1.5 py-0.5 font-semibold uppercase tracking-[0.08em] text-amber-300">
            Live
          </span>
        ) : null}
      </div>

      <dl className="grid grid-cols-2 gap-x-5 gap-y-1.5 font-mono tabular-nums">
        <dt className="text-zinc-500">Open</dt>
        <dd className="text-right text-zinc-200">
          {candle.open.toFixed(precision)}
        </dd>

        <dt className="text-zinc-500">High</dt>
        <dd className="text-right text-emerald-300">
          {candle.high.toFixed(precision)}
        </dd>

        <dt className="text-zinc-500">Low</dt>
        <dd className="text-right text-red-300">
          {candle.low.toFixed(precision)}
        </dd>

        <dt className="text-zinc-500">Close</dt>
        <dd className="text-right text-zinc-200">
          {candle.close.toFixed(precision)}
        </dd>

        <dt className="text-zinc-500">Change</dt>
        <dd
          className={
            change >= 0
              ? "text-right text-emerald-300"
              : "text-right text-red-300"
          }
        >
          {change >= 0 ? "+" : ""}
          {changePercent.toFixed(3)}%
        </dd>
      </dl>
    </div>
  );
});

function ChartLoadingState({
  height,
}: {
  height: number;
}): ReactElement {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
      style={{ height }}
      aria-label="Loading market chart"
      aria-busy="true"
    >
      <div className="absolute inset-0 grid grid-cols-8 grid-rows-5">
        {Array.from({ length: 40 }).map((_, index) => (
          <div
            key={index}
            className="border-b border-r border-zinc-900"
          />
        ))}
      </div>

      <div className="absolute inset-x-6 top-1/2 h-24 -translate-y-1/2 animate-pulse rounded-lg bg-zinc-900" />

      <div className="absolute bottom-5 left-6 flex items-center gap-2 text-sm text-zinc-500">
        <Activity className="h-4 w-4" />
        Loading market history
      </div>
    </div>
  );
}

function ChartErrorState({
  height,
  message,
}: {
  height: number;
  message: string;
}): ReactElement {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-950 bg-red-950/20 px-6 text-center"
      style={{ height }}
      role="alert"
    >
      <AlertTriangle className="h-6 w-6 text-red-400" />

      <div>
        <p className="font-medium text-red-200">
          Market stream unavailable
        </p>
        <p className="mt-1 max-w-md text-sm leading-6 text-red-300/70">
          {message}
        </p>
      </div>
    </div>
  );
}

function ChartEmptyState({
  height,
}: {
  height: number;
}): ReactElement {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-6 text-center"
      style={{ height }}
    >
      <BarChart3 className="h-7 w-7 text-zinc-600" />

      <div>
        <p className="font-medium text-zinc-300">
          Waiting for market data
        </p>
        <p className="mt-1 max-w-md text-sm leading-6 text-zinc-500">
          Candles appear when the first validated MT5 snapshot reaches
          the cache.
        </p>
      </div>
    </div>
  );
}

function RealTimeCandleChartComponent({
  symbol,
  timeframe = "H1",
  count = 100,
  height = 430,
  className = "",
}: RealTimeCandleChartProps): ReactElement {
  /*
   * enabled:false is intentional. These observers subscribe to cache updates
   * but never invoke a query function or trigger a network refetch.
   */
  const candlesQuery = useQuery<MarketCandlesCache>({
    queryKey: [
      "market-candles",
      symbol,
      timeframe,
      count,
    ],
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const priceQuery = useQuery<MarketPriceCache>({
    queryKey: ["market-price", symbol],
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const precision = useMemo(
    () => getPricePrecision(symbol),
    [symbol],
  );

  const chartData = useMemo<ChartCandle[]>(() => {
    const source = candlesQuery.data?.candles ?? [];

    const merged = mergeLiveTick(
      source,
      priceQuery.data,
      timeframe,
    );

    return merged
      .filter(
        (candle) =>
          isFiniteNumber(candle.open) &&
          isFiniteNumber(candle.high) &&
          isFiniteNumber(candle.low) &&
          isFiniteNumber(candle.close) &&
          Boolean(candle.time),
      )
      .map((candle) => {
        const timestamp = parseTimestamp(candle.time);

        return {
          ...candle,
          timestamp,
          label: formatAxisTime(timestamp, timeframe),
          range: [candle.low, candle.high],
          bullish: candle.close >= candle.open,
          live: Boolean(candle.live),
        };
      });
  }, [
    candlesQuery.data,
    priceQuery.data,
    timeframe,
  ]);

  const priceDomain = useMemo<[number, number]>(() => {
    if (chartData.length === 0) {
      return [0, 1];
    }

    const low = Math.min(
      ...chartData.map((candle) => candle.low),
    );
    const high = Math.max(
      ...chartData.map((candle) => candle.high),
    );

    const range = Math.max(high - low, Number.EPSILON);
    const padding = range * 0.08;

    return [low - padding, high + padding];
  }, [chartData]);

  const latestPrice = useMemo(() => {
    const tickMid = getTickMidPrice(priceQuery.data);

    if (tickMid !== null) {
      return tickMid;
    }

    return chartData.at(-1)?.close ?? null;
  }, [chartData, priceQuery.data]);

  const latestCandle = chartData.at(-1);
  const latestChange =
    latestCandle
      ? latestCandle.close - latestCandle.open
      : 0;

  const isLoading =
    candlesQuery.fetchStatus === "fetching" ||
    (
      candlesQuery.status === "pending" &&
      !candlesQuery.data
    );

  const error =
    candlesQuery.error ??
    priceQuery.error;

  if (isLoading) {
    return <ChartLoadingState height={height} />;
  }

  if (error) {
    return (
      <ChartErrorState
        height={height}
        message={
          error instanceof Error
            ? error.message
            : "The cached market stream reported an unknown error."
        }
      />
    );
  }

  if (chartData.length === 0) {
    return <ChartEmptyState height={height} />;
  }

  return (
    <section
      className={`overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 ${className}`}
      aria-label={`${symbol} ${timeframe} candlestick chart`}
    >
      <header className="flex flex-col gap-3 border-b border-zinc-800 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-zinc-300">
            <Activity className="h-4 w-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-zinc-100">
                {symbol}
              </h2>

              <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-400">
                {timeframe}
              </span>
            </div>

            <p className="mt-0.5 text-xs text-zinc-500">
              MT5 market stream
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-5 sm:justify-end">
          <div className="text-right font-mono tabular-nums">
            <p className="text-lg font-semibold text-zinc-100">
              {latestPrice?.toFixed(precision) ?? "—"}
            </p>

            <p
              className={
                latestChange >= 0
                  ? "text-xs text-emerald-400"
                  : "text-xs text-red-400"
              }
            >
              {latestChange >= 0 ? "+" : ""}
              {latestChange.toFixed(precision)}
            </p>
          </div>

          <div className="flex items-center gap-1.5 pb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Live
          </div>
        </div>
      </header>

      <div
        className="relative px-1 pb-3 pt-4 sm:px-3"
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{
              top: 8,
              right: 12,
              bottom: 4,
              left: 4,
            }}
          >
            <CartesianGrid
              stroke="oklch(28% 0.012 150)"
              strokeDasharray="2 5"
              vertical={false}
            />

            <XAxis
              dataKey="timestamp"
              type="number"
              domain={["dataMin", "dataMax"]}
              scale="time"
              tickFormatter={(value: number) =>
                formatAxisTime(value, timeframe)
              }
              tick={{
                fill: "oklch(59% 0.012 150)",
                fontSize: 10,
              }}
              axisLine={false}
              tickLine={false}
              minTickGap={38}
              dy={8}
            />

            <YAxis
              domain={priceDomain}
              orientation="right"
              tickFormatter={(value: number) =>
                value.toFixed(precision)
              }
              tick={{
                fill: "oklch(62% 0.012 150)",
                fontSize: 10,
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
              }}
              axisLine={false}
              tickLine={false}
              width={72}
              dx={6}
            />

            <Tooltip
              content={<CandleTooltip />}
              cursor={{
                stroke: "oklch(62% 0.04 150)",
                strokeDasharray: "3 4",
              }}
              isAnimationActive={false}
            />

            {latestPrice !== null ? (
              <ReferenceLine
                y={latestPrice}
                stroke="oklch(78% 0.15 85)"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{
                  value: latestPrice.toFixed(precision),
                  position: "insideTopRight",
                  fill: "oklch(84% 0.12 85)",
                  fontSize: 10,
                }}
              />
            ) : null}

            <Bar
              dataKey="range"
              isAnimationActive={false}
              shape={(props: unknown) => (
                <CandlestickShape
                  {...(props as CandleShapeProps)}
                />
              )}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {!priceQuery.data ? (
        <div className="flex items-center gap-2 border-t border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs text-zinc-500">
          <WifiOff className="h-3.5 w-3.5" />
          Showing cached candles. Waiting for the next MARKET_TICK.
        </div>
      ) : null}
    </section>
  );
}

export const RealTimeCandleChart = memo(
  RealTimeCandleChartComponent,
);
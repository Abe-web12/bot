import type { Metadata } from "next";

import { AccountStats } from "@/components/dashboard/account-stats";
import { AutonomousDecisionFeed } from "@/components/dashboard/AutonomousDecisionFeed";
import { ConnectionStatus } from "@/components/dashboard/ConnectionStatus";
import { RealTimeCandleChart } from "@/components/dashboard/real-time-candle-chart";

export const metadata: Metadata = {
  title: "Market Operations | Forex Bot",
  description:
    "Real-time EURUSD market conditions, account exposure, and autonomous trading decisions.",
};

export default function MarketPage() {
  return (
    <main className="min-h-full bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-[1800px] px-3 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
        <header className="mb-5 flex min-h-20 flex-col justify-between gap-4 border-b border-zinc-800 pb-5 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-emerald-400"
                aria-hidden="true"
              />

              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-400">
                Live market operations
              </p>
            </div>

            <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
              EURUSD execution desk
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
              H1 market structure, account exposure, and autonomous
              authorization decisions from the live execution pipeline.
            </p>
          </div>

          <div className="min-h-11 shrink-0">
            <ConnectionStatus />
          </div>
        </header>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-5 xl:gap-6">
          <section
            className="grid min-w-0 gap-4 lg:col-span-2 lg:gap-5 xl:gap-6"
            aria-label="Market and account overview"
          >
            <AccountStats marginAlertThreshold={150} />

            <RealTimeCandleChart
              symbol="EURUSD"
              timeframe="H1"
              height={480}
            />
          </section>

          <aside
            className="min-w-0 lg:col-span-1 lg:sticky lg:top-6"
            aria-label="Autonomous trading decisions"
          >
            <div className="min-h-[420px] lg:h-[calc(100vh-9rem)] lg:min-h-[620px]">
              <AutonomousDecisionFeed />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
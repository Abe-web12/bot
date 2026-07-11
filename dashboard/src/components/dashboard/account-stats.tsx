"use client";

import {
  memo,
  useMemo,
  type ReactElement,
} from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Landmark,
  Scale,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

export interface AccountSnapshot {
  id?: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin?: number;
  free_margin?: number;
  marginLevel?: number | null;
  margin_level?: number | null;
  currency: string;
  leverage?: number | null;
  capturedAt?: string;
  captured_at?: string;
  unrealizedPnl?: number;
  unrealized_pnl?: number;
}

export interface AccountCacheEnvelope {
  timestamp?: string;
  account: AccountSnapshot | null;
}

export interface AccountStatsProps {
  marginAlertThreshold?: number;
  className?: string;
}

interface NormalizedAccount {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number | null;
  currency: string;
  unrealizedPnl: number;
  capturedAt: string | null;
}

function isFiniteNumber(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function isAccountEnvelope(
  value: unknown,
): value is AccountCacheEnvelope {
  return (
    value !== null &&
    typeof value === "object" &&
    "account" in value
  );
}

function normalizeAccount(
  source:
    | AccountSnapshot
    | AccountCacheEnvelope
    | undefined,
): NormalizedAccount | null {
  if (!source) {
    return null;
  }

  const account = isAccountEnvelope(source)
    ? source.account
    : source;

  if (!account) {
    return null;
  }

  if (
    !isFiniteNumber(account.balance) ||
    !isFiniteNumber(account.equity) ||
    !isFiniteNumber(account.margin)
  ) {
    return null;
  }

  const freeMargin =
    account.freeMargin ??
    account.free_margin ??
    account.equity - account.margin;

  const marginLevel =
    account.marginLevel ??
    account.margin_level ??
    (
      account.margin > 0
        ? (account.equity / account.margin) * 100
        : null
    );

  const unrealizedPnl =
    account.unrealizedPnl ??
    account.unrealized_pnl ??
    account.equity - account.balance;

  return {
    balance: account.balance,
    equity: account.equity,
    margin: account.margin,
    freeMargin:
      isFiniteNumber(freeMargin)
        ? freeMargin
        : 0,
    marginLevel:
      isFiniteNumber(marginLevel)
        ? marginLevel
        : null,
    currency: account.currency || "USD",
    unrealizedPnl:
      isFiniteNumber(unrealizedPnl)
        ? unrealizedPnl
        : 0,
    capturedAt:
      account.capturedAt ??
      account.captured_at ??
      (
        isAccountEnvelope(source)
          ? source.timestamp ?? null
          : null
      ),
  };
}

function formatCurrency(
  value: number,
  currency: string,
): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function formatFreshness(timestamp: string | null): string {
  if (!timestamp) {
    return "Live cache";
  }

  const parsed = new Date(timestamp).getTime();

  if (!Number.isFinite(parsed)) {
    return "Live cache";
  }

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - parsed) / 1000),
  );

  if (seconds < 5) {
    return "Updated now";
  }

  if (seconds < 60) {
    return `Updated ${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  return `Updated ${minutes}m ago`;
}

function AccountStatsLoading(): ReactElement {
  return (
    <section
      className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
      aria-label="Loading account metrics"
      aria-busy="true"
    >
      <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
        <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
        <div className="h-3 w-20 animate-pulse rounded bg-zinc-900" />
      </header>

      <div className="grid gap-px bg-zinc-800 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="bg-zinc-950 px-5 py-6"
          >
            <div className="h-3 w-16 animate-pulse rounded bg-zinc-800" />
            <div className="mt-4 h-7 w-32 animate-pulse rounded bg-zinc-900" />
            <div className="mt-3 h-3 w-24 animate-pulse rounded bg-zinc-900" />
          </div>
        ))}
      </div>
    </section>
  );
}

function AccountStatsError({
  message,
}: {
  message: string;
}): ReactElement {
  return (
    <section
      className="flex min-h-52 items-center justify-center rounded-xl border border-red-950 bg-red-950/20 px-6 text-center"
      role="alert"
    >
      <div>
        <AlertTriangle className="mx-auto h-6 w-6 text-red-400" />
        <p className="mt-3 font-medium text-red-200">
          Account stream unavailable
        </p>
        <p className="mt-1 max-w-md text-sm leading-6 text-red-300/70">
          {message}
        </p>
      </div>
    </section>
  );
}

function AccountStatsEmpty(): ReactElement {
  return (
    <section className="flex min-h-52 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 px-6 text-center">
      <div>
        <WalletCards className="mx-auto h-7 w-7 text-zinc-600" />
        <p className="mt-3 font-medium text-zinc-300">
          Waiting for account data
        </p>
        <p className="mt-1 max-w-md text-sm leading-6 text-zinc-500">
          Metrics appear after the first ACCOUNT_TICK reaches the
          real-time cache.
        </p>
      </div>
    </section>
  );
}

function AccountStatsComponent({
  marginAlertThreshold = 150,
  className = "",
}: AccountStatsProps): ReactElement {
  /*
   * This observer never fetches. It subscribes to the ["account"] cache entry
   * that ws-store patches when ACCOUNT_TICK messages arrive.
   */
  const accountQuery = useQuery<
    AccountSnapshot | AccountCacheEnvelope
  >({
    queryKey: ["account"],
    enabled: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const account = useMemo(
    () => normalizeAccount(accountQuery.data),
    [accountQuery.data],
  );

  const state = useMemo(() => {
    if (!account) {
      return {
        marginAlert: false,
        marginCritical: false,
        marginUsagePercent: 0,
      };
    }

    const marginAlert =
      account.marginLevel !== null &&
      account.marginLevel < marginAlertThreshold;

    const marginCritical =
      account.marginLevel !== null &&
      account.marginLevel < 100;

    const marginUsagePercent =
      account.equity <= 0
        ? 0
        : Math.min(
            100,
            Math.max(
              0,
              (account.margin / account.equity) * 100,
            ),
          );

    return {
      marginAlert,
      marginCritical,
      marginUsagePercent,
    };
  }, [account, marginAlertThreshold]);

  const isLoading =
    accountQuery.fetchStatus === "fetching" ||
    (
      accountQuery.status === "pending" &&
      !accountQuery.data
    );

  if (isLoading) {
    return <AccountStatsLoading />;
  }

  if (accountQuery.error) {
    return (
      <AccountStatsError
        message={
          accountQuery.error instanceof Error
            ? accountQuery.error.message
            : "The cached account query reported an unknown error."
        }
      />
    );
  }

  if (!account) {
    return <AccountStatsEmpty />;
  }

  const surfaceClass = state.marginCritical
    ? "border-red-900 bg-red-950/50"
    : state.marginAlert
      ? "border-red-950 bg-red-950/25"
      : "border-zinc-800 bg-zinc-950";

  const statusText = state.marginCritical
    ? "Critical margin"
    : state.marginAlert
      ? "Margin warning"
      : "Healthy";

  const statusClass = state.marginCritical
    ? "bg-red-400/10 text-red-300"
    : state.marginAlert
      ? "bg-amber-400/10 text-amber-300"
      : "bg-emerald-400/10 text-emerald-300";

  const metrics = [
    {
      label: "Equity",
      value: formatCurrency(
        account.equity,
        account.currency,
      ),
      detail:
        account.unrealizedPnl >= 0
          ? `+${formatCurrency(
              account.unrealizedPnl,
              account.currency,
            )} floating`
          : `${formatCurrency(
              account.unrealizedPnl,
              account.currency,
            )} floating`,
      detailClass:
        account.unrealizedPnl >= 0
          ? "text-emerald-400"
          : "text-red-400",
      icon: Scale,
    },
    {
      label: "Balance",
      value: formatCurrency(
        account.balance,
        account.currency,
      ),
      detail: `${formatCurrency(
        account.freeMargin,
        account.currency,
      )} free margin`,
      detailClass: "text-zinc-500",
      icon: Landmark,
    },
    {
      label: "Margin level",
      value:
        account.marginLevel === null
          ? "No exposure"
          : `${account.marginLevel.toFixed(1)}%`,
      detail:
        account.marginLevel === null
          ? "No margin currently used"
          : `${state.marginUsagePercent.toFixed(1)}% equity in use`,
      detailClass: state.marginAlert
        ? "text-red-300"
        : "text-zinc-500",
      icon: ShieldCheck,
    },
  ] as const;

  return (
    <section
      className={`overflow-hidden rounded-xl border transition-colors duration-300 ${surfaceClass} ${className}`}
      aria-label="Live account statistics"
    >
      <header className="flex flex-col gap-3 border-b border-zinc-800/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-zinc-100">
            Account exposure
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {formatFreshness(account.capturedAt)}
          </p>
        </div>

        <div
          className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.09em] ${statusClass}`}
        >
          {state.marginAlert ? (
            <AlertTriangle className="h-3 w-3" />
          ) : (
            <ShieldCheck className="h-3 w-3" />
          )}
          {statusText}
        </div>
      </header>

      <div className="grid gap-px bg-zinc-800/80 sm:grid-cols-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className={
                state.marginAlert
                  ? "bg-red-950/20 px-4 py-5 sm:px-5 sm:py-6"
                  : "bg-zinc-950 px-4 py-5 sm:px-5 sm:py-6"
              }
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
                  {metric.label}
                </p>

                <Icon className="h-4 w-4 text-zinc-600" />
              </div>

              <p className="mt-3 font-mono text-xl font-semibold tracking-tight text-zinc-100 tabular-nums lg:text-2xl">
                {metric.value}
              </p>

              <p
                className={`mt-2 text-xs font-medium tabular-nums ${metric.detailClass}`}
              >
                {metric.detail}
              </p>
            </div>
          );
        })}
      </div>

      {state.marginAlert ? (
        <div className="flex items-start gap-2.5 border-t border-red-900/60 bg-red-950/35 px-4 py-3 text-xs leading-5 text-red-200 sm:px-5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p>
            Margin level is below the configured{" "}
            <span className="font-mono font-semibold tabular-nums">
              {marginAlertThreshold.toFixed(0)}%
            </span>{" "}
            threshold. New exposure should be blocked until available
            margin recovers.
          </p>
        </div>
      ) : null}
    </section>
  );
}

export const AccountStats = memo(
  AccountStatsComponent,
);
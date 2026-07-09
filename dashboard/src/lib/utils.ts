import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | null | undefined, currency = "USD"): string {
  if (value === null || value === undefined) return "-"
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-"
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`
}

export function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined) return "-"
  return value.toFixed(decimals)
}

export function formatPips(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-"
  return value.toFixed(1)
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "-"
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "-"
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

export function formatDuration(openTime: string | null | undefined, closeTime?: string | null): string {
  if (!openTime) return "-"
  const start = new Date(openTime).getTime()
  const end = closeTime ? new Date(closeTime).getTime() : Date.now()
  const diffMs = end - start
  const hours = Math.floor(diffMs / 3600000)
  const minutes = Math.floor((diffMs % 3600000) / 60000)
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function cnFormat(value: number | null | undefined, type: "currency" | "percent" | "number" | "pips" = "number"): string {
  const fmt = value ?? 0
  if (type === "currency") return formatCurrency(fmt)
  if (type === "percent") return formatPercent(fmt)
  if (type === "pips") return formatPips(fmt)
  return formatNumber(fmt)
}

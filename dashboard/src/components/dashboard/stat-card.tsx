"use client"

import { cn, cnFormat } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string | number
  change?: number | null
  icon?: React.ReactNode
  formatter?: "currency" | "percent" | "number" | "pips"
  loading?: boolean
}

export function StatCard({ label, value, change, icon, formatter = "number", loading }: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 w-20 animate-pulse rounded bg-zinc-700" />
              <div className="h-6 w-24 animate-pulse rounded bg-zinc-700" />
              <div className="h-3 w-16 animate-pulse rounded bg-zinc-700" />
            </div>
            <div className="h-8 w-8 animate-pulse rounded bg-zinc-700" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayValue = typeof value === "number" ? cnFormat(value, formatter) : value
  const isPositive = change != null && change > 0
  const isNegative = change != null && change < 0

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-400">{label}</p>
            <p className="text-2xl font-bold text-zinc-100">{displayValue}</p>
            {change != null && (
              <div className="flex items-center gap-1">
                <span className={cn("text-xs font-medium", isPositive && "text-green-400", isNegative && "text-red-400")}>
                  {isPositive ? "▲" : isNegative ? "▼" : ""} {cnFormat(change, "percent")}
                </span>
              </div>
            )}
          </div>
          {icon && <div className="text-zinc-400">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
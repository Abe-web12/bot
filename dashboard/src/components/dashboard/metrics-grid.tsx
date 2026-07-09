"use client"

import { cn } from "@/lib/utils"

interface MetricsGridProps {
  children: React.ReactNode
  cols?: 2 | 3 | 4 | 5 | 6
}

const colClasses: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
}

export function MetricsGrid({ children, cols = 3 }: MetricsGridProps) {
  return <div className={cn("grid gap-4", colClasses[cols])}>{children}</div>
}
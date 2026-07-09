"use client"

import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
  status: "connected" | "disconnected" | "running" | "stopped" | "error" | "paused" | string
  label?: string
  pulse?: boolean
}

const statusColors: Record<string, string> = {
  connected: "bg-green-500",
  running: "bg-green-500",
  disconnected: "bg-gray-500",
  stopped: "bg-gray-500",
  error: "bg-red-500",
  paused: "bg-amber-500",
}

export function StatusIndicator({ status, label, pulse }: StatusIndicatorProps) {
  const colorClass = statusColors[status] ?? "bg-gray-500"

  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-2.5 w-2.5 rounded-full", colorClass, pulse && "animate-pulse")} />
      {label && <span className="text-xs text-zinc-400">{label}</span>}
    </div>
  )
}
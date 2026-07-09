"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface ChartContainerProps {
  title: string
  children: React.ReactNode
  loading?: boolean
  height?: number
  controls?: React.ReactNode
}

export function ChartContainer({ title, children, loading, height = 300, controls }: ChartContainerProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-zinc-200">{title}</CardTitle>
        {controls && <div className="flex items-center gap-2">{controls}</div>}
      </CardHeader>
      <CardContent>
        <div style={{ height }} className="relative">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="space-y-2 w-full px-4">
                <div className="h-3 w-full animate-pulse rounded bg-zinc-700" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-zinc-700" />
                <div className="h-3 w-4/6 animate-pulse rounded bg-zinc-700" />
                <div className="h-3 w-3/6 animate-pulse rounded bg-zinc-700" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-zinc-700" />
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </CardContent>
    </Card>
  )
}
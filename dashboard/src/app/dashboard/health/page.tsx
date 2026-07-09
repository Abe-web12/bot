"use client"

import { useHealthStatus, useMT5Health, useDatabaseStatus, useWebSocketStatus, useWorkersStatus } from "@/hooks/use-api"
import { useWsStatus } from "@/hooks/use-websocket"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Server, Database, Wifi, Bot, Cpu, MemoryStick, Activity, Globe, Brain, MessageSquare } from "lucide-react"

function HealthCard({ title, icon, ok, children }: { title: string; icon: React.ReactNode; ok: boolean; children: React.ReactNode }) {
  return (
    <Card className={cn("border-l-4", ok ? "border-l-emerald-500" : "border-l-red-500")}>
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">{icon}{title}</CardTitle>
        <Badge className={ok ? "bg-emerald-900/60 text-emerald-300" : "bg-red-900/60 text-red-300"}>{ok ? "OK" : "DOWN"}</Badge>
      </CardHeader>
      <CardContent className="p-4 pt-1 text-xs text-zinc-400 space-y-1">{children}</CardContent>
    </Card>
  )
}

function MetricRow({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={ok != null ? ok ? "text-emerald-400" : "text-red-400" : "text-zinc-200"}>{value}</span>
    </div>
  )
}

export default function HealthPage() {
  const { data: health, isLoading: healthLoading, isError: healthError, refetch: refetchHealth } = useHealthStatus()
  const { data: mt5, isLoading: mt5Loading } = useMT5Health()
  const { data: db, isLoading: dbLoading } = useDatabaseStatus()
  const { data: wsStatus, isLoading: wsLoading } = useWebSocketStatus()
  const { data: workers, isLoading: workersLoading } = useWorkersStatus()
  const { connected: wsConnected } = useWsStatus()

  if (healthError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-center">
          <p className="text-lg font-medium">Failed to load health data</p>
          <button className="text-sm underline mt-2" onClick={() => refetchHealth()}>Retry</button>
        </div>
      </div>
    )
  }

  const system = health?.system as Record<string, unknown> | undefined
  const subsystems = health?.subsystems

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-100">System Health</h2>
        <Badge className={health?.status === "healthy" ? "bg-emerald-900/60 text-emerald-300" : "bg-amber-900/60 text-amber-300"}>
          {health?.status ?? "unknown"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* API / Backend */}
        <HealthCard title="API Server" icon={<Server className="h-3.5 w-3.5" />} ok={!healthError}>
          {healthLoading ? <Skeleton className="h-16 w-full" /> : (
            <>
              <MetricRow label="Status" value={health?.status ?? "?"} ok={health?.status === "healthy"} />
              <MetricRow label="Latency" value={mt5?.latency_ms != null ? `${mt5.latency_ms.toFixed(1)}ms` : "-"} />
              <MetricRow label="Uptime" value={system?.uptime_seconds != null ? `${Math.floor((system.uptime_seconds as number) / 3600)}h ${Math.floor(((system.uptime_seconds as number) % 3600) / 60)}m` : "-"} />
            </>
          )}
        </HealthCard>

        {/* Bot Engine */}
        <HealthCard title="Bot Engine" icon={<Bot className="h-3.5 w-3.5" />} ok={subsystems?.bot?.ok ?? false}>
          {healthLoading ? <Skeleton className="h-16 w-full" /> : (
            <MetricRow label="Status" value={subsystems?.bot?.status ?? "?"} ok={subsystems?.bot?.ok} />
          )}
        </HealthCard>

        {/* MT5 Connection */}
        <HealthCard title="MT5 Terminal" icon={<Activity className="h-3.5 w-3.5" />} ok={mt5?.connected ?? false}>
          {mt5Loading ? <Skeleton className="h-16 w-full" /> : (
            <>
              <MetricRow label="Connection" value={mt5?.connection_status ?? "?"} ok={mt5?.connected} />
              <MetricRow label="Latency" value={mt5?.latency_ms != null ? `${mt5.latency_ms.toFixed(0)}ms` : "-"} />
              <MetricRow label="Account" value={mt5?.is_demo ? "DEMO" : "LIVE"} />
              {mt5?.account && (
                <MetricRow label="Balance" value={mt5.account.balance.toFixed(2)} />
              )}
            </>
          )}
        </HealthCard>

        {/* Database */}
        <HealthCard title="Database" icon={<Database className="h-3.5 w-3.5" />} ok={db?.connected ?? false}>
          {dbLoading ? <Skeleton className="h-16 w-full" /> : (
            <>
              <MetricRow label="Connection" value={db?.connected ? "Connected" : "Disconnected"} ok={db?.connected} />
              <MetricRow label="Latency" value={db?.latency_ms != null ? `${db.latency_ms.toFixed(0)}ms` : "-"} />
              <MetricRow label="Schema" value={db?.migration_version != null ? `v${db.migration_version}` : "-"} />
              {db?.integrity_errors?.length ? (
                <MetricRow label="Integrity" value={`${db.integrity_errors.length} errors`} ok={false} />
              ) : db?.integrity_errors ? (
                <MetricRow label="Integrity" value="OK" ok={true} />
              ) : null}
            </>
          )}
        </HealthCard>

        {/* WebSocket */}
        <HealthCard title="WebSocket" icon={<Wifi className="h-3.5 w-3.5" />} ok={wsConnected}>
          <MetricRow label="Status" value={wsConnected ? "Connected" : "Disconnected"} ok={wsConnected} />
          {wsStatus && (
            <>
              <MetricRow label="Connections" value={String(wsStatus.total_connections ?? 0)} />
              <MetricRow label="Sequence" value={String(wsStatus.current_sequence ?? 0)} />
            </>
          )}
        </HealthCard>

        {/* System Resources */}
        <HealthCard title="System Resources" icon={<Cpu className="h-3.5 w-3.5" />} ok={true}>
          {healthLoading ? <Skeleton className="h-16 w-full" /> : (
            <>
              <MetricRow label="CPU" value={system?.cpu_pct != null ? `${(system.cpu_pct as number).toFixed(1)}%` : "-"} />
              <MetricRow label="RAM" value={system?.ram_mb != null ? `${(system.ram_mb as number).toFixed(0)} MB` : "-"} />
              <MetricRow label="Threads" value={String(system?.active_threads ?? "-")} />
            </>
          )}
        </HealthCard>

        {/* Gemini AI */}
        <HealthCard title="Gemini AI" icon={<Brain className="h-3.5 w-3.5" />} ok={true}>
          <MetricRow label="Status" value="Available on request" />
        </HealthCard>

        {/* Telegram */}
        <HealthCard title="Telegram" icon={<MessageSquare className="h-3.5 w-3.5" />} ok={true}>
          <MetricRow label="Status" value="Available on request" />
        </HealthCard>

        {/* Workers */}
        <HealthCard title="Background Workers" icon={<MemoryStick className="h-3.5 w-3.5" />} ok={true}>
          {workersLoading ? <Skeleton className="h-16 w-full" /> : workers?.workers ? (
            Object.entries(workers.workers).map(([name, w]) => (
              <MetricRow key={name} label={name} value={w.running ? "Running" : "Stopped"} ok={w.running} />
            ))
          ) : (
            <span className="text-zinc-600">No worker data</span>
          )}
        </HealthCard>

        {/* OpenAPI */}
        <HealthCard title="API Documentation" icon={<Globe className="h-3.5 w-3.5" />} ok={true}>
          <MetricRow label="Swagger UI" value="/api/docs" />
          <MetricRow label="OpenAPI JSON" value="/api/openapi.json" />
        </HealthCard>
      </div>
    </div>
  )
}

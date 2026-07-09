"use client"

import { useState } from "react"
import { useNotifications, useNotificationQueue, useSendTestNotification } from "@/hooks/use-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime } from "@/lib/utils"
import { Bell, BellOff, Send, CheckCircle, XCircle, Clock, RefreshCw, Bot, TrendingUp, TrendingDown, AlertTriangle, Activity, Settings, Zap } from "lucide-react"

const EVENT_ICONS: Record<string, React.ReactNode> = {
  BOT_STARTED: <Bot className="h-4 w-4 text-emerald-400" />,
  BOT_STOPPED: <Bot className="h-4 w-4 text-red-400" />,
  BOT_PAUSED: <Bot className="h-4 w-4 text-amber-400" />,
  TRADE_OPENED: <TrendingUp className="h-4 w-4 text-emerald-400" />,
  TRADE_CLOSED: <TrendingDown className="h-4 w-4 text-blue-400" />,
  TRADE_REJECTED: <XCircle className="h-4 w-4 text-red-400" />,
  SL_HIT: <AlertTriangle className="h-4 w-4 text-red-400" />,
  TP_HIT: <CheckCircle className="h-4 w-4 text-emerald-400" />,
  DRAWDOWN_LIMIT_HIT: <AlertTriangle className="h-4 w-4 text-red-400" />,
  DRAWDOWN_WARNING: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  MARGIN_WARNING: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  CRITICAL_ERROR: <XCircle className="h-4 w-4 text-red-500" />,
  CONFIG_RELOADED: <Settings className="h-4 w-4 text-blue-400" />,
  ACCOUNT_TICK: <Activity className="h-4 w-4 text-zinc-400" />,
  MARKET_TICK: <Activity className="h-4 w-4 text-zinc-400" />,
  RISK_TICK: <AlertTriangle className="h-4 w-4 text-zinc-400" />,
  HEALTH_TICK: <Activity className="h-4 w-4 text-zinc-400" />,
  METRICS_TICK: <Activity className="h-4 w-4 text-zinc-400" />,
}

function EventIcon({ eventName }: { eventName: string }) {
  return EVENT_ICONS[eventName] || <Bell className="h-4 w-4 text-zinc-400" />
}

export default function NotificationsPage() {
  const { data: notifications, isLoading, isError, refetch } = useNotifications(50)
  const { data: queue, isLoading: queueLoading } = useNotificationQueue()
  const testNotification = useSendTestNotification()
  const [liveUpdates, setLiveUpdates] = useState(true)
  const [adminMode, setAdminMode] = useState(false)

  // Simulated admin check — in production use useAuth
  const isAdmin = true

  const notifs = notifications?.notifications || []

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-center">
          <p className="text-lg font-medium">Failed to load notifications</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Queue Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {queue?.telegram_enabled ? <Bell className="h-5 w-5 text-emerald-400" /> : <BellOff className="h-5 w-5 text-red-400" />}
              <div>
                <div className="text-xs text-zinc-400">Telegram</div>
                <div className="text-sm font-semibold text-zinc-100">{queue?.telegram_enabled ? "Enabled" : "Disabled"}</div>
              </div>
            </div>
            {queueLoading && <Skeleton className="h-5 w-16" />}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-xs text-zinc-400">Queue Depth</div>
                <div className="text-sm font-semibold text-zinc-100">{queue?.queue_depth ?? "-"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 text-zinc-400 ${liveUpdates ? "animate-spin" : ""}`} />
              <div>
                <div className="text-xs text-zinc-400">Live Updates</div>
                <div className="text-sm font-semibold text-zinc-100">{liveUpdates ? "ON" : "OFF"}</div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setLiveUpdates(!liveUpdates)}>
              {liveUpdates ? "Pause" : "Resume"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Admin Test Button */}
      {adminMode && isAdmin && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => testNotification.mutate()}
            disabled={testNotification.isPending}
          >
            <Bell className="h-3.5 w-3.5 mr-1" />
            {testNotification.isPending ? "Sending..." : "Test Notification"}
          </Button>
          {testNotification.isSuccess && (
            <span className="text-xs text-emerald-400 self-center">Test notification sent</span>
          )}
          {testNotification.isError && (
            <span className="text-xs text-red-400 self-center">Failed to send test</span>
          )}
        </div>
      )}

      {/* Notifications List */}
      <Card>
        <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm text-zinc-300">Recent Notifications ({notifications?.count ?? 0})</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3 w-3 mr-1" />Refresh
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : notifs.length === 0 ? (
            <div className="p-6 text-center text-zinc-600 text-sm">No notifications</div>
          ) : (
            <div className="divide-y divide-zinc-800/50">
              {notifs.map((n) => (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/20">
                  <div className="mt-0.5">
                    <EventIcon eventName={n.event_name} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-zinc-200">{n.event_name}</span>
                      <span className="text-[10px] text-zinc-500">{formatDateTime(n.occurred_at)}</span>
                    </div>
                    {n.source && <div className="text-[10px] text-zinc-600 mt-0.5">Source: {n.source}</div>}
                    {n.payload && Object.keys(n.payload).length > 0 && (
                      <pre className="text-[10px] text-zinc-500 mt-1 bg-zinc-900 p-2 rounded overflow-x-auto max-h-20">
                        {JSON.stringify(n.payload, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


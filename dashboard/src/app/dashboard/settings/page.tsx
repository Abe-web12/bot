"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react"
import { useSettings, useUpdateSettings, useBotControl, useBotAction } from "@/hooks/use-api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime } from "@/lib/utils"
import { Save, Play, Square, PauseCircle, RotateCcw, RefreshCw, Settings as SettingsIcon, History } from "lucide-react"

export default function SettingsPage() {
  const { data: settings, isLoading, isError, refetch } = useSettings()
  const updateSettings = useUpdateSettings()
  const { data: botControl, isLoading: botLoading } = useBotControl()
  const botAction = useBotAction()
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [showBotControls, setShowBotControls] = useState(false)
  const [actionResult, setActionResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleValueChange = (key: string, value: string) => {
    setEdits((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (Object.keys(edits).length === 0) return
    const changes: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(edits)) {
      const original = (settings?.overrides as Record<string, unknown>)?.[key]
      if (original !== undefined && original !== null) {
        if (typeof original === "number") changes[key] = Number(val)
        else if (typeof original === "boolean") changes[key] = val === "true" || val === "1"
        else changes[key] = val
      } else {
        changes[key] = val
      }
    }
    updateSettings.mutate(changes, {
      onSuccess: () => {
        setEdits({})
        setActionResult({ success: true, message: "Settings saved successfully" })
        setTimeout(() => setActionResult(null), 3000)
      },
      onError: () => {
        setActionResult({ success: false, message: "Failed to save settings" })
        setTimeout(() => setActionResult(null), 3000)
      },
    })
  }

  const handleBotAction = (action: string) => {
    botAction.mutate({ action }, {
      onSuccess: () => {
        setActionResult({ success: true, message: `Bot ${action} command sent` })
        setTimeout(() => setActionResult(null), 3000)
      },
      onError: () => {
        setActionResult({ success: false, message: `Failed to ${action} bot` })
        setTimeout(() => setActionResult(null), 3000)
      },
    })
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400 text-center">
          <p className="text-lg font-medium">Failed to load settings</p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    )
  }

  const overrides = (settings?.overrides || {}) as Record<string, unknown>
  const reloadableKeys = settings?.reloadable_keys || []
  const history = settings?.history || []

  return (
    <div className="space-y-4">
      {/* Bot Control Toggle */}
      <Card>
        <CardContent className="p-4">
          <button
            onClick={() => setShowBotControls(!showBotControls)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-zinc-200">Bot Controls</span>
            </div>
            <div className="text-xs text-zinc-500">
              {botLoading ? <Skeleton className="h-4 w-20" /> : botControl?.status || "Unknown"}
              <span className="ml-2">{showBotControls ? "▲" : "▼"}</span>
            </div>
          </button>
          {showBotControls && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <Button size="sm" onClick={() => handleBotAction("start")} disabled={botAction.isPending}>
                  <Play className="h-3.5 w-3.5 mr-1" /> Start
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBotAction("stop")} disabled={botAction.isPending}>
                  <Square className="h-3.5 w-3.5 mr-1" /> Stop
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleBotAction("pause")} disabled={botAction.isPending}>
                  <PauseCircle className="h-3.5 w-3.5 mr-1" /> Pause
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBotAction("resume")} disabled={botAction.isPending}>
                  <Play className="h-3.5 w-3.5 mr-1" /> Resume
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBotAction("restart")} disabled={botAction.isPending}>
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restart
                </Button>
              </div>
              {botLoading ? null : (
                <div className="mt-3 text-xs text-zinc-500">
                  Status: {botControl?.status} | Mode: {botControl?.mode} | Uptime: {botControl?.uptime_seconds ? `${Math.floor(botControl.uptime_seconds / 60)}m` : "N/A"}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Values */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm text-zinc-300">Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {Object.entries(overrides).map(([key, value]) => {
                const isReloadable = reloadableKeys.includes(key)
                const currentEdit = edits[key]
                const displayValue = currentEdit !== undefined ? currentEdit : String(value ?? "")
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-xs text-zinc-300 truncate w-48 shrink-0">{key}</span>
                      {isReloadable && (
                        <span className="text-[10px] text-amber-400 shrink-0" title="Hot-reloadable">⚡</span>
                      )}
                    </div>
                    <Input
                      className="h-8 text-xs font-mono flex-1 max-w-xs"
                      value={displayValue}
                      onChange={(e) => handleValueChange(key, e.target.value)}
                      placeholder={String(value ?? "")}
                    />
                    <span className="text-xs text-zinc-500 w-16 text-right truncate">
                      {value != null ? String(value) : "null"}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save / Status */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={Object.keys(edits).length === 0 || updateSettings.isPending} size="sm">
          {updateSettings.isPending ? <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
          Save Changes
        </Button>
        {actionResult && (
          <span className={`text-xs ${actionResult.success ? "text-emerald-400" : "text-red-400"}`}>
            {actionResult.message}
          </span>
        )}
        {updateSettings.isSuccess && !actionResult && (
          <span className="text-xs text-emerald-400">Changes applied</span>
        )}
      </div>

      {/* Change History */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
            <History className="h-3.5 w-3.5 text-zinc-500" />
            Change History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="p-6 text-center text-zinc-600 text-sm">No change history</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-zinc-400 text-xs">
                    <th className="p-3 font-medium">Key</th>
                    <th className="p-3 font-medium">Old Value</th>
                    <th className="p-3 font-medium">New Value</th>
                    <th className="p-3 font-medium">Changed At</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry: any, i: number) => (
                    <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="p-3 text-xs font-mono text-zinc-300">{entry.key}</td>
                      <td className="p-3 text-xs font-mono text-zinc-500">{String(entry.old_value ?? "null")}</td>
                      <td className="p-3 text-xs font-mono text-emerald-400">{String(entry.new_value ?? "null")}</td>
                      <td className="p-3 text-xs text-zinc-500">{formatDateTime(entry.changed_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
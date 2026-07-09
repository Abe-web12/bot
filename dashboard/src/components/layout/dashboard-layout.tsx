"use client"

import type { ReactNode } from "react"
import { useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { Bell, Settings } from "lucide-react"

import { Group as ResizablePanelGroup, Panel as ResizablePanel, Separator as ResizableHandle } from "react-resizable-panels"
import { Sidebar } from "./sidebar"
import { StatusBar } from "./status-bar"
import { ConnectionBanner } from "@/components/dashboard/connection-banner"
import { useWebSocket } from "@/hooks/use-websocket"
import { useAppStore } from "@/stores/app-store"
import { useNotifications } from "@/hooks/use-api"
import { Button } from "@/components/ui/button"

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useWsChannel } from "@/hooks/use-websocket"

import type { WsEvent } from "@/types/websocket"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/terminal": "Trading Terminal",
  "/dashboard/live-trades": "Live Trades",
  "/dashboard/trade-history": "Trade History",
  "/dashboard/signals": "Signals",
  "/dashboard/market": "Market",
  "/dashboard/analytics": "Analytics",
  "/dashboard/risk": "Risk",
  "/dashboard/journal": "Journal",
  "/dashboard/logs": "Logs",
  "/dashboard/notifications": "Notifications",
  "/dashboard/health": "System Health",
  "/dashboard/settings": "Settings",
}

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  const match = Object.entries(pageTitles).find(([key]) => pathname.startsWith(key))
  return match?.[1] ?? "Dashboard"
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { toggleSidebar, notificationCount, setNotificationCount } = useAppStore()

  const { data: notifications } = useNotifications(5)
  useWebSocket()

  useEffect(() => {
    if (notifications?.notifications?.length != null) {
      setNotificationCount(notifications.count)
    }
  }, [notifications, setNotificationCount])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "b") {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [toggleSidebar])

  useWsChannel("bot", useCallback((event: WsEvent) => {
    if (["BOT_STARTED", "BOT_STOPPED", "BOT_PAUSED", "KILL_SWITCH_TRIGGERED", "CRITICAL_ERROR", "TRADE_OPENED", "TRADE_CLOSED"].includes(event.event)) {
      setNotificationCount(notificationCount + 1)
    }
  }, [setNotificationCount, notificationCount]))

  return (
    <TooltipProvider>
      <div className="h-screen flex flex-col bg-zinc-950">
        <ConnectionBanner />

        <div className="flex flex-1 overflow-hidden">

          <ResizablePanelGroup orientation="horizontal" id="dashboard-sidebar">
          <ResizablePanel defaultSize={15} minSize={8} maxSize={25}>
            <TooltipProvider>
              <Sidebar />
            </TooltipProvider>
          </ResizablePanel>
          <ResizableHandle className="w-[3px] bg-zinc-800 hover:bg-zinc-700 active:bg-emerald-600 transition-colors data-[resize-handle-active]:bg-emerald-600" />
          <ResizablePanel defaultSize={85} minSize={50}>
            <div className="flex flex-col h-full">
              <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-5 bg-zinc-950/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">{getPageTitle(pathname)}</h1>
                  <span className="text-[10px] text-zinc-600 hidden md:inline">Ctrl+B to toggle sidebar</span>
                </div>
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-zinc-400 relative hover:text-zinc-200" onClick={() => setNotificationCount(0)}>
                          <Bell className="h-4 w-4" />
                          {notificationCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white leading-none">
                              {notificationCount > 99 ? "99+" : notificationCount}
                            </span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Notifications ({notificationCount} unread)</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-200" asChild>
                          <a href="/dashboard/settings">
                            <Settings className="h-4 w-4" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Settings</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </header>
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <StatusBar />
    </div>
    </TooltipProvider>
  )
}


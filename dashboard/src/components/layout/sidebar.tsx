"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Activity,
  History,
  Signal,
  BarChart3,
  BarChart4,
  Shield,
  BookOpen,
  ScrollText,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bot,
  Monitor,
  Terminal,
} from "lucide-react"
import { useAppStore } from "@/stores/app-store"
import { useBotStatus } from "@/hooks/use-api"
import { useWsStore } from "@/stores/ws-store"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/terminal", label: "Terminal", icon: Terminal },
  { href: "/dashboard/live-trades", label: "Live Trades", icon: Activity },
  { href: "/dashboard/trade-history", label: "Trade History", icon: History },
  { href: "/dashboard/signals", label: "Signals", icon: Signal },
  { href: "/dashboard/market", label: "Market", icon: BarChart3 },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart4 },
  { href: "/dashboard/risk", label: "Risk", icon: Shield },
  { href: "/dashboard/journal", label: "Journal", icon: BookOpen },
  { href: "/dashboard/logs", label: "Logs", icon: ScrollText },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/health", label: "System Health", icon: Monitor },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useAppStore()
  const { data: botStatus } = useBotStatus()
  const wsConnected = useWsStore((s) => s.connected)

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-zinc-950 border-r border-zinc-800 transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex items-center h-14 px-3 border-b border-zinc-800">
        <div className={cn("flex items-center gap-2", sidebarCollapsed && "justify-center w-full")}>
          <Bot className="h-6 w-6 text-emerald-500 shrink-0" />
          {!sidebarCollapsed && (
            <span className="text-sm font-semibold text-zinc-100">ForexBot</span>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md transition-colors",
                sidebarCollapsed ? "justify-center px-0 py-2" : "px-3 py-2",
                active
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-zinc-800 p-3 space-y-2">
        {!sidebarCollapsed && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900">
              <div className={cn("h-1.5 w-1.5 rounded-full", botStatus?.connection_status === "connected" ? "bg-emerald-500" : "bg-red-500")} />
              <span className="text-xs text-zinc-400">{botStatus?.bot_status ?? "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900">
              <div className={cn("h-1.5 w-1.5 rounded-full", wsConnected ? "bg-emerald-500" : "bg-red-500")} />
              <span className="text-xs text-zinc-400">WS: {wsConnected ? "Live" : "Offline"}</span>
            </div>
          </div>
        )}

        <button
          onClick={toggleSidebar}
          className={cn(
            "flex items-center gap-3 w-full rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors",
            sidebarCollapsed ? "justify-center px-0 py-2" : "px-3 py-2"
          )}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
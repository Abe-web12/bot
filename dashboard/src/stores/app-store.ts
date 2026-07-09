import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AppState {
  sidebarCollapsed: boolean
  sidebarOpen: boolean
  notificationCount: number
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setNotificationCount: (n: number) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarOpen: true,
      notificationCount: 0,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setNotificationCount: (n) => set({ notificationCount: n }),
    }),
    { name: "forex-bot-layout" }
  )
)

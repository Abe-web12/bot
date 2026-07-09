import { create } from "zustand"

interface WsState {
  connected: boolean
  currentSequence: number
  setConnected: (connected: boolean) => void
  setCurrentSequence: (seq: number) => void
}

export const useWsStore = create<WsState>((set) => ({
  connected: false,
  currentSequence: 0,
  setConnected: (connected) => set({ connected }),
  setCurrentSequence: (currentSequence) => set({ currentSequence }),
}))

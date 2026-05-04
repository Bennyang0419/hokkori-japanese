import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, DailyProgress, JLPTLevel } from '@/types'

interface AppState {
  // Auth
  profile: Profile | null
  setProfile: (p: Profile | null) => void

  // Today's progress (cached)
  todayProgress: DailyProgress | null
  setTodayProgress: (p: DailyProgress | null) => void

  // Active learning level
  activeLevel: JLPTLevel
  setActiveLevel: (l: JLPTLevel) => void

  // UI
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),

      todayProgress: null,
      setTodayProgress: (todayProgress) => set({ todayProgress }),

      activeLevel: 'N5',
      setActiveLevel: (activeLevel) => set({ activeLevel }),

      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: 'hokkori-store',
      partialize: (s) => ({ activeLevel: s.activeLevel, sidebarOpen: s.sidebarOpen }),
    }
  )
)

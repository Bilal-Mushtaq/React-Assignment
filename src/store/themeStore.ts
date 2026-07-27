import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'system' | 'light' | 'dark'

export const THEME_DEFAULTS = {
  mode: 'light' as ThemeMode,
  accent: '#0f766e',
  sidebarExpanded: true,
  baseFontSize: 15,
  borderRadius: 12,
}

export type ThemeState = {
  mode: ThemeMode
  accent: string
  sidebarExpanded: boolean
  baseFontSize: number
  borderRadius: number
  setMode: (mode: ThemeMode) => void
  setAccent: (accent: string) => void
  setSidebarExpanded: (expanded: boolean) => void
  toggleSidebarExpanded: () => void
  setBaseFontSize: (size: number) => void
  setBorderRadius: (radius: number) => void
  resetToDefaults: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ...THEME_DEFAULTS,
      setMode: (mode) => set({ mode }),
      setAccent: (accent) => set({ accent }),
      setSidebarExpanded: (sidebarExpanded) => set({ sidebarExpanded }),
      toggleSidebarExpanded: () => set((s) => ({ sidebarExpanded: !s.sidebarExpanded })),
      setBaseFontSize: (baseFontSize) => set({ baseFontSize }),
      setBorderRadius: (borderRadius) => set({ borderRadius }),
      resetToDefaults: () => set({ ...THEME_DEFAULTS }),
    }),
    {
      name: 'vigil.theme',
      version: 2,
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<{
          mode: ThemeMode
          accent: string
          sidebarExpanded: boolean
          baseFontSize: number
          borderRadius: number
        }>
        return {
          mode: state.mode ?? THEME_DEFAULTS.mode,
          accent: THEME_DEFAULTS.accent,
          sidebarExpanded: state.sidebarExpanded ?? THEME_DEFAULTS.sidebarExpanded,
          baseFontSize: THEME_DEFAULTS.baseFontSize,
          borderRadius: state.borderRadius ?? THEME_DEFAULTS.borderRadius,
        }
      },
    },
  ),
)

import { create } from 'zustand'
import type { WidgetId } from '../features/dashboard/widgets/widgetRegistry'

export type UiState = {
  mobileNavOpen: boolean
  activeWidgetId: WidgetId | null
  setMobileNavOpen: (open: boolean) => void
  toggleMobileNav: () => void
  closeMobileNav: () => void
  setActiveWidgetId: (id: WidgetId | null) => void
}

export const useUiStore = create<UiState>((set) => ({
  mobileNavOpen: false,
  activeWidgetId: null,
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
  toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
  closeMobileNav: () => set({ mobileNavOpen: false }),
  setActiveWidgetId: (activeWidgetId) => set({ activeWidgetId }),
}))

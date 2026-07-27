import { create } from 'zustand'

export type CommandPaletteState = {
  open: boolean
  query: string
  setOpen: (open: boolean) => void
  setQuery: (query: string) => void
  openPalette: () => void
  closePalette: () => void
  togglePalette: () => void
}

export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  open: false,
  query: '',

  setOpen: (open) => set((s) => ({ open, query: open ? s.query : '' })),
  setQuery: (query) => set({ query }),

  openPalette: () => set({ open: true }),
  closePalette: () => set({ open: false, query: '' }),
  togglePalette: () =>
    set((s) => ({
      open: !s.open,
      query: s.open ? '' : s.query,
    })),
}))

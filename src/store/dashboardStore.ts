import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ResponsiveLayouts } from 'react-grid-layout'
import {
  defaultPinnedWidgetIds,
  getDefaultLayouts,
  type WidgetId,
} from '../features/dashboard/widgets/widgetRegistry'
import { layoutsEqual, normalizeLayouts } from '../features/dashboard/utils/normalizeLayouts'

type Layouts = ResponsiveLayouts

type Snapshot = {
  layouts: Layouts
  collapsedById: Record<WidgetId, boolean>
  pinnedWidgetIds: WidgetId[]
}

type SetLayoutsOptions = {
  /** When false, apply layouts without touching undo history (used by undo/redo sync). */
  recordHistory?: boolean
}

export type DashboardState = Snapshot & {
  past: Snapshot[]
  future: Snapshot[]
  /** True while undo/redo is applying — grid should ignore the echo onLayoutChange. */
  isApplyingHistory: boolean
  setLayouts: (layouts: Layouts, options?: SetLayoutsOptions) => void
  toggleCollapse: (id: WidgetId) => void
  togglePinned: (id: WidgetId) => void
  undo: () => void
  redo: () => void
  exportLayout: () => string
  importLayout: (raw: string) => { ok: true } | { ok: false; error: string }
  resetToDefaults: () => void
  clearApplyingHistory: () => void
}

const makeDefaultCollapsed = (): Record<WidgetId, boolean> => ({
  kpis: false,
  cameras: false,
  alerts: false,
  incidents: false,
  analytics: false,
  activity: false,
})

const initialSnapshot: Snapshot = {
  layouts: getDefaultLayouts(),
  collapsedById: makeDefaultCollapsed(),
  pinnedWidgetIds: defaultPinnedWidgetIds,
}

function takeSnapshot(state: Snapshot): Snapshot {
  return {
    layouts: state.layouts,
    collapsedById: state.collapsedById,
    pinnedWidgetIds: state.pinnedWidgetIds,
  }
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      ...initialSnapshot,
      past: [],
      future: [],
      isApplyingHistory: false,

      clearApplyingHistory: () => set({ isApplyingHistory: false }),

      setLayouts: (layouts, options) => {
        const next = normalizeLayouts(layouts)
        const current = get().layouts
        if (layoutsEqual(current, next)) return

        const recordHistory = options?.recordHistory !== false

        if (!recordHistory) {
          set({ layouts: next })
          return
        }

        set((s) => ({
          layouts: next,
          past: [...s.past, takeSnapshot(s)].slice(-50),
          future: [],
        }))
      },

      toggleCollapse: (id) => {
        set((s) => {
          if (!(id in s.collapsedById)) return s
          return {
            collapsedById: { ...s.collapsedById, [id]: !s.collapsedById[id] },
            past: [...s.past, takeSnapshot(s)].slice(-50),
            future: [],
          }
        })
      },

      togglePinned: (id) => {
        set((s) => {
          const pinned = new Set(s.pinnedWidgetIds)
          if (pinned.has(id)) pinned.delete(id)
          else pinned.add(id)
          return {
            pinnedWidgetIds: Array.from(pinned),
            past: [...s.past, takeSnapshot(s)].slice(-50),
            future: [],
          }
        })
      },

      undo: () => {
        const state = get()
        if (state.past.length === 0) return

        const prev = state.past[state.past.length - 1]!
        const current = takeSnapshot(state)

        set({
          layouts: prev.layouts,
          collapsedById: prev.collapsedById,
          pinnedWidgetIds: prev.pinnedWidgetIds,
          past: state.past.slice(0, -1),
          future: [current, ...state.future].slice(0, 50),
          isApplyingHistory: true,
        })
      },

      redo: () => {
        const state = get()
        if (state.future.length === 0) return

        const next = state.future[0]!
        const current = takeSnapshot(state)

        set({
          layouts: next.layouts,
          collapsedById: next.collapsedById,
          pinnedWidgetIds: next.pinnedWidgetIds,
          past: [...state.past, current].slice(-50),
          future: state.future.slice(1),
          isApplyingHistory: true,
        })
      },

      exportLayout: () => {
        const payload = {
          version: 1,
          layouts: get().layouts,
          collapsedById: get().collapsedById,
          pinnedWidgetIds: get().pinnedWidgetIds,
        }
        return JSON.stringify(payload, null, 2)
      },

      importLayout: (raw) => {
        try {
          const parsed = JSON.parse(raw) as unknown
          if (!parsed || typeof parsed !== 'object') return { ok: false, error: 'Invalid JSON' }
          const p = parsed as {
            layouts?: Layouts
            collapsedById?: Record<WidgetId, boolean>
            pinnedWidgetIds?: WidgetId[]
          }

          if (!p.layouts || !p.collapsedById || !p.pinnedWidgetIds) {
            return { ok: false, error: 'Missing required fields' }
          }

          set({
            layouts: normalizeLayouts(p.layouts),
            collapsedById: p.collapsedById,
            pinnedWidgetIds: p.pinnedWidgetIds,
            past: [],
            future: [],
            isApplyingHistory: true,
          })

          return { ok: true as const }
        } catch (e) {
          return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
        }
      },

      resetToDefaults: () => {
        set((s) => ({
          ...initialSnapshot,
          past: [...s.past, takeSnapshot(s)].slice(-50),
          future: [],
          isApplyingHistory: true,
        }))
      },
    }),
    {
      name: 'vigil.dashboard',
      version: 13,
      migrate: (persisted) => {
        const state = persisted as Partial<Snapshot>
        return {
          ...state,
          layouts: getDefaultLayouts(),
          pinnedWidgetIds: defaultPinnedWidgetIds,
          collapsedById: state.collapsedById ?? makeDefaultCollapsed(),
        }
      },
      partialize: (s) => ({
        layouts: s.layouts,
        collapsedById: s.collapsedById,
        pinnedWidgetIds: s.pinnedWidgetIds,
      }),
    },
  ),
)

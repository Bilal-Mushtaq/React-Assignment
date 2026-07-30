import { create } from 'zustand'
import type { KpiSnapshot } from '../types/domain'

const DAYS = 7
const HOURS = 24

function createEmptyHeatmap(): number[][] {
  return Array.from({ length: DAYS }, () => Array.from({ length: HOURS }, () => 0))
}

export type AnalyticsState = {
  heatmap: number[][]
  /** Estimated visitors per hour for the last 24 hours */
  visitorSeries: number[]
  tickHeatmap: (day: number, hour: number, value: number) => void
  pushVisitorCount: (value: number) => void
  getKpis: () => KpiSnapshot
  setKpiOverrides: (kpis: Partial<KpiSnapshot>) => void
  kpiOverrides: Partial<KpiSnapshot>
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  heatmap: createEmptyHeatmap(),
  visitorSeries: Array.from({ length: 24 }, () => randomBase()),
  kpiOverrides: {},

  tickHeatmap: (day, hour, value) => {
    set((s) => {
      const heatmap = s.heatmap.map((row) => [...row])
      const d = Math.max(0, Math.min(DAYS - 1, day))
      const h = Math.max(0, Math.min(HOURS - 1, hour))
      // Soft cap — keeps the map from becoming a solid wall over time
      heatmap[d]![h] = Math.min(24, (heatmap[d]![h] ?? 0) + Math.min(value, 3))
      return { heatmap }
    })
  },

  pushVisitorCount: (value) => {
    set((s) => ({
      // Floor small ticks so the sparkline never collapses to hairline bars
      visitorSeries: [...s.visitorSeries.slice(1), Math.max(8, value)],
    }))
  },

  setKpiOverrides: (kpiOverrides) => set({ kpiOverrides }),

  getKpis: () => {
    const overrides = get().kpiOverrides
    return {
      activeAlerts: overrides.activeAlerts ?? 0,
      camerasOnline: overrides.camerasOnline ?? 0,
      incidentsToday: overrides.incidentsToday ?? 0,
      avgAiConfidence: overrides.avgAiConfidence ?? 0,
    }
  },
}))

function randomBase() {
  return Math.floor(Math.random() * 80) + 20
}

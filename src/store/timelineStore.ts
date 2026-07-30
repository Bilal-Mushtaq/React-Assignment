import { create } from 'zustand'
import type { Incident, AlertSeverity } from '../types/domain'
import { generateId } from '../utils/id'

const MAX_INCIDENTS = 200

export type TimelineState = {
  incidents: Incident[]
  addIncident: (input: { title: string; severity: AlertSeverity; cameraId?: string; id?: string }) => void
  resolveIncident: (id: string) => void
  reopenIncident: (id: string) => void
  getTodayCount: () => number
}

export const useTimelineStore = create<TimelineState>((set, get) => ({
  incidents: [],

  addIncident: (input) => {
    const incident: Incident = {
      id: input.id ?? generateId('incident'),
      title: input.title,
      severity: input.severity,
      cameraId: input.cameraId,
      timestamp: Date.now(),
      resolved: false,
    }
    set((s) => ({ incidents: [incident, ...s.incidents].slice(0, MAX_INCIDENTS) }))
  },

  resolveIncident: (id) => {
    set((s) => ({
      incidents: s.incidents.map((i) => (i.id === id ? { ...i, resolved: true } : i)),
    }))
  },

  reopenIncident: (id) => {
    set((s) => ({
      incidents: s.incidents.map((i) => (i.id === id ? { ...i, resolved: false } : i)),
    }))
  },

  getTodayCount: () => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return get().incidents.filter((i) => i.timestamp >= start.getTime()).length
  },
}))

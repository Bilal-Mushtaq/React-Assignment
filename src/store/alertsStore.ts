import { create } from 'zustand'
import type { Alert, AlertSeverity, AlertStatus } from '../types/domain'
import { generateId } from '../utils/id'

const MAX_ALERTS = 500

export type AlertsState = {
  alerts: Alert[]
  severityFilter: AlertSeverity | 'all'
  addAlert: (input: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { id?: string }) => void
  acknowledge: (id: string) => void
  resolve: (id: string) => void
  setSeverityFilter: (filter: AlertSeverity | 'all') => void
  getFilteredAlerts: () => Alert[]
  getActiveCount: () => number
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  alerts: [],
  severityFilter: 'all',

  addAlert: (input) => {
    const now = Date.now()
    const alert: Alert = {
      id: input.id ?? generateId('alert'),
      title: input.title,
      message: input.message,
      severity: input.severity,
      cameraId: input.cameraId,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    }
    set((s) => ({ alerts: [alert, ...s.alerts].slice(0, MAX_ALERTS) }))
  },

  acknowledge: (id) => {
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === id ? { ...a, status: 'acknowledged' as AlertStatus, updatedAt: Date.now() } : a,
      ),
    }))
  },

  resolve: (id) => {
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === id ? { ...a, status: 'resolved' as AlertStatus, updatedAt: Date.now() } : a,
      ),
    }))
  },

  setSeverityFilter: (severityFilter) => set({ severityFilter }),

  getFilteredAlerts: () => {
    const { alerts, severityFilter } = get()
    const filtered =
      severityFilter === 'all' ? alerts : alerts.filter((a) => a.severity === severityFilter)
    return filtered.filter((a) => a.status !== 'resolved').slice(0, 50)
  },

  getActiveCount: () => get().alerts.filter((a) => a.status === 'open').length,
}))

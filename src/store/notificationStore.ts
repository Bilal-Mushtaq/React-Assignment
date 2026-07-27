import { create } from 'zustand'
import type { AppNotification, NotificationGroup } from '../types/domain'
import { generateId } from '../utils/id'

const MAX_NOTIFICATIONS = 300

export type NotificationState = {
  notifications: AppNotification[]
  addNotification: (input: { title: string; body: string; group: NotificationGroup }) => void
  markRead: (id: string) => void
  markAllRead: () => void
  getUnreadCount: () => number
  getGrouped: () => Record<NotificationGroup, AppNotification[]>
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],

  addNotification: (input) => {
    const notification: AppNotification = {
      id: generateId('notif'),
      title: input.title,
      body: input.body,
      group: input.group,
      timestamp: Date.now(),
      read: false,
    }
    set((s) => ({ notifications: [notification, ...s.notifications].slice(0, MAX_NOTIFICATIONS) }))
  },

  markRead: (id) => {
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }))
  },

  markAllRead: () => {
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }))
  },

  getUnreadCount: () => get().notifications.filter((n) => !n.read).length,

  getGrouped: () => {
    const groups: Record<NotificationGroup, AppNotification[]> = {
      alerts: [],
      cameras: [],
      system: [],
    }
    for (const n of get().notifications) {
      groups[n.group].push(n)
    }
    return groups
  },
}))

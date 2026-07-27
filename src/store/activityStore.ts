import { create } from 'zustand'
import type { ActivityEvent } from '../types/domain'
import { generateId } from '../utils/id'

const MAX_ACTIVITY = 5000

export type ActivityState = {
  events: ActivityEvent[]
  totalGenerated: number
  addEvent: (input: { message: string; type: string; meta?: Record<string, string> }) => void
  seedEvents: (count: number, factory: (index: number) => Omit<ActivityEvent, 'id'>) => void
}

export const useActivityStore = create<ActivityState>((set) => ({
  events: [],
  totalGenerated: 0,

  addEvent: (input) => {
    const event: ActivityEvent = {
      id: generateId('activity'),
      type: input.type,
      message: input.message,
      timestamp: Date.now(),
      meta: input.meta,
    }
    set((s) => ({
      events: [event, ...s.events].slice(0, MAX_ACTIVITY),
      totalGenerated: s.totalGenerated + 1,
    }))
  },

  seedEvents: (count, factory) => {
    const now = Date.now()
    const seeded: ActivityEvent[] = []
    for (let i = 0; i < count; i++) {
      const base = factory(i)
      seeded.push({
        ...base,
        id: generateId('activity'),
        timestamp: now - i * randomOffsetMs(),
      })
    }
    set({ events: seeded, totalGenerated: count })
  },
}))

function randomOffsetMs() {
  return Math.floor(Math.random() * 8000) + 2000
}

import { create } from 'zustand'
import { generateId } from '../utils/id'

export type ToastTone = 'success' | 'info' | 'warning' | 'error'

export type Toast = {
  id: string
  title: string
  description?: string
  tone?: ToastTone
}

type ToastInput = Omit<Toast, 'id'> & { duration?: number }

export type ToastState = {
  toasts: Toast[]
  push: (toast: ToastInput) => string
  dismiss: (id: string) => void
}

const DEFAULT_DURATION = 3200

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  push: (input) => {
    const id = generateId('toast')
    const { duration = DEFAULT_DURATION, ...toast } = input

    set((s) => ({ toasts: [...s.toasts, { ...toast, id }].slice(-4) }))

    window.setTimeout(() => {
      get().dismiss(id)
    }, duration)

    return id
  },

  dismiss: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))

export function toast(input: ToastInput) {
  return useToastStore.getState().push(input)
}

import { formatDistanceToNow } from 'date-fns'
import type { AlertSeverity } from '../types/domain'

export function formatRelativeTime(timestamp: number) {
  return formatDistanceToNow(timestamp, { addSuffix: true })
}

export function severityTone(severity: AlertSeverity): 'danger' | 'warning' | 'info' | 'success' | 'neutral' {
  switch (severity) {
    case 'critical':
      return 'danger'
    case 'high':
      return 'warning'
    case 'medium':
      return 'info'
    case 'low':
      return 'success'
    default:
      return 'neutral'
  }
}

/** @deprecated prefer severityTone + Badge */
export function severityColor(severity: AlertSeverity) {
  switch (severity) {
    case 'critical':
      return 'text-rose-600 bg-rose-500/10 border-rose-500/30'
    case 'high':
      return 'text-amber-700 bg-amber-500/10 border-amber-500/30'
    case 'medium':
      return 'text-sky-700 bg-sky-500/10 border-sky-500/30'
    case 'low':
      return 'text-emerald-700 bg-emerald-500/10 border-emerald-500/30'
    default:
      return 'text-[color:var(--text)] bg-black/5 border-[color:var(--border)]'
  }
}

export function statusColor(status: string) {
  switch (status) {
    case 'online':
    case 'recording':
      return 'text-emerald-600'
    case 'degraded':
      return 'text-amber-600'
    case 'offline':
      return 'text-rose-600'
    default:
      return 'text-[color:var(--text)]'
  }
}

import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  Brain,
  Camera,
  PieChart,
  Radio,
  Server,
  ShieldAlert,
} from 'lucide-react'
import { SITE } from '../../constants/mockData'

export type ActivityType = 'alert' | 'camera' | 'ai' | 'incident' | 'system' | 'analytics'

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'

export type ActivityTypeMeta = {
  id: ActivityType
  label: string
  shortLabel: string
  description: string
  tone: BadgeTone
  icon: LucideIcon
  borderClass: string
  softBgClass: string
  barClass: string
}

export const ACTIVITY_TYPES: ActivityType[] = [
  'alert',
  'incident',
  'camera',
  'ai',
  'analytics',
  'system',
]

export const ACTIVITY_TYPE_META: Record<ActivityType, ActivityTypeMeta> = {
  alert: {
    id: 'alert',
    label: 'Alert',
    shortLabel: 'Alert',
    description: 'Something that may need a quick look from security or floor staff.',
    tone: 'danger',
    icon: ShieldAlert,
    borderClass: 'border-[color:color-mix(in_srgb,var(--danger)_28%,transparent)]',
    softBgClass: 'bg-[color:color-mix(in_srgb,var(--danger)_8%,transparent)]',
    barClass: 'bg-[color:var(--danger)]',
  },
  incident: {
    id: 'incident',
    label: 'Incident',
    shortLabel: 'Incident',
    description: 'A tracked case opened from an alert or operator report.',
    tone: 'warning',
    icon: AlertTriangle,
    borderClass: 'border-[color:color-mix(in_srgb,var(--warning)_28%,transparent)]',
    softBgClass: 'bg-[color:color-mix(in_srgb,var(--warning)_8%,transparent)]',
    barClass: 'bg-[color:var(--warning)]',
  },
  camera: {
    id: 'camera',
    label: 'Camera',
    shortLabel: 'Camera',
    description: `Camera health, status, or feed checks across ${SITE.short}.`,
    tone: 'info',
    icon: Camera,
    borderClass: 'border-[color:color-mix(in_srgb,var(--info)_28%,transparent)]',
    softBgClass: 'bg-[color:color-mix(in_srgb,var(--info)_8%,transparent)]',
    barClass: 'bg-[color:var(--info)]',
  },
  ai: {
    id: 'ai',
    label: 'AI',
    shortLabel: 'AI',
    description: 'Model confidence and detection certainty updates.',
    tone: 'accent',
    icon: Brain,
    borderClass: 'border-[color:var(--accent-border)]',
    softBgClass: 'bg-[color:var(--accent-bg)]',
    barClass: 'bg-[color:var(--accent)]',
  },
  analytics: {
    id: 'analytics',
    label: 'Traffic',
    shortLabel: 'Traffic',
    description: 'Visitor traffic and busy-hour analytics ticks.',
    tone: 'success',
    icon: PieChart,
    borderClass: 'border-[color:color-mix(in_srgb,var(--success)_28%,transparent)]',
    softBgClass: 'bg-[color:color-mix(in_srgb,var(--success)_8%,transparent)]',
    barClass: 'bg-[color:var(--success)]',
  },
  system: {
    id: 'system',
    label: 'Ops',
    shortLabel: 'Ops',
    description: 'Routine mall operations notes from staff and systems.',
    tone: 'neutral',
    icon: Server,
    borderClass: 'border-[color:var(--border-strong)]',
    softBgClass: 'bg-[color:var(--surface-muted)]/70',
    barClass: 'bg-[color:var(--text-muted)]',
  },
}

export function resolveActivityType(type: string): ActivityType {
  if (type in ACTIVITY_TYPE_META) return type as ActivityType
  return 'system'
}

export function getActivityTypeMeta(type: string): ActivityTypeMeta {
  return ACTIVITY_TYPE_META[resolveActivityType(type)]
}

export function activityContextBlurb(type: string): string {
  return getActivityTypeMeta(type).description
}

export type ActivityDescriptionContext = {
  cameraName?: string
  cameraStatus?: string
  zone?: string
  area?: string
  /** Matching catalog alert/incident body when we can resolve one */
  catalogDetail?: string
  severity?: string
}

/**
 * Builds a plain-language narrative for one activity row —
 * specific to this event, not just the category.
 */
export function buildActivityDescription(
  event: { type: string; message: string; meta?: Record<string, string> },
  ctx: ActivityDescriptionContext = {},
): string {
  const type = resolveActivityType(event.type)
  const zone = ctx.zone ?? event.meta?.zone
  const place = zone ? ` at ${zone}` : ''
  const camera = ctx.cameraName
  const area = ctx.area
  const severity = (ctx.severity ?? event.meta?.severity)?.toLowerCase()
  const detail = ctx.catalogDetail

  switch (type) {
    case 'alert': {
      const urgency =
        severity === 'critical'
          ? 'This was flagged as urgent — floor staff should treat it as a priority.'
          : severity === 'high'
            ? 'Priority is high; a quick check on site is recommended.'
            : severity === 'medium'
              ? 'Worth reviewing soon so it does not escalate.'
              : 'Logged for awareness; monitor if the situation continues.'
      const where = camera
        ? `Seen on ${camera}${place}.`
        : zone
          ? `Reported${place}${area ? ` (${area})` : ''}.`
          : 'Location was not attached to this log.'
      const body = detail
        ? `${event.message} ${detail}`
        : `${event.message} ${SITE.short} ops captured this as an active alert.`
      return `${body} ${where} ${urgency}`
    }
    case 'incident': {
      const where = camera
        ? `Linked feed: ${camera}${place}.`
        : zone
          ? `Opened for ${zone}${area ? ` · ${area}` : ''}.`
          : 'No camera link was stored with this incident.'
      const body = detail
        ? `${event.message} ${detail}`
        : `${event.message} An incident record was opened so the team can track follow-up.`
      return `${body} ${where} Status stays visible in the incident timeline until it is resolved.`
    }
    case 'camera': {
      const statusNote = ctx.cameraStatus
        ? ` Current feed status is ${ctx.cameraStatus}.`
        : ''
      return `${event.message} This is a camera health or status update${place || (camera ? ` for ${camera}` : '')}.${statusNote} Use the linked camera page to review the live still and related alerts.`
    }
    case 'ai': {
      return `${event.message} Vigil’s vision model refreshed its confidence for this camera${place}.${camera ? ` Feed: ${camera}.` : ''} Higher certainty usually means detections are clearer; a drop can mean a weak picture, glare, or an offline channel.`
    }
    case 'analytics': {
      return `${event.message} Mall traffic analytics were updated${place ? ` with signal from ${zone}` : ''}. These ticks feed the Visitors / hour chart and busy-hours heatmap so operators can see lunch and evening peaks without reading raw events.`
    }
    case 'system':
    default: {
      return `${event.message} Routine ${SITE.short} operations note${place}${area ? ` (${area})` : ''}.${camera ? ` Associated camera: ${camera}.` : ''} Ops and system entries keep a light audit trail of day-to-day mall activity alongside alerts and incidents.`
    }
  }
}

export const ActivityFallbackIcon = Radio

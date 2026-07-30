import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowRight, MapPin, X } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import {
  activityContextBlurb,
  buildActivityDescription,
  getActivityTypeMeta,
} from '../activityMeta'
import { formatRelativeTime } from '../../../utils/format'
import { getScenarioByCameraId } from '../../../constants/mockData'
import { useCameraStore } from '../../../store/cameraStore'
import { overlayTransition, panelTransition } from '../../../lib/motion'
import type { ActivityEvent } from '../../../types/domain'
import { cn } from '../../../lib/cn'

type ActivityDetailSheetProps = {
  event: ActivityEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function resolveCatalogDetail(event: ActivityEvent, cameraId?: string) {
  if (!cameraId) return undefined
  const scenario = getScenarioByCameraId(cameraId)
  const msg = event.message.toLowerCase()

  if (event.type === 'alert') {
    const hit = scenario.alerts.find(
      (a) =>
        msg.includes(a.title.toLowerCase()) ||
        a.title.toLowerCase().split(' ').some((w) => w.length > 4 && msg.includes(w)),
    )
    return hit?.message
  }

  if (event.type === 'incident') {
    const hit = scenario.incidents.find((i) => msg.includes(i.title.toLowerCase()))
    return hit ? `Case title on file: “${hit.title}” (${hit.severity} severity).` : undefined
  }

  if (event.type === 'system') {
    const hit = scenario.activities.find(
      (a) => msg.includes(a.toLowerCase()) || a.toLowerCase() === msg,
    )
    return hit ? `Staff log matches the ${scenario.zone} ops checklist.` : undefined
  }

  return undefined
}

export function ActivityDetailSheet({ event, open, onOpenChange }: ActivityDetailSheetProps) {
  const cameras = useCameraStore((s) => s.cameras)
  const meta = event ? getActivityTypeMeta(event.type) : null
  const Icon = meta?.icon
  const cameraId = event?.meta?.cameraId
  const camera = cameraId ? cameras.find((c) => c.id === cameraId) : undefined
  const zone = event?.meta?.zone ?? camera?.zone

  const scenario = useMemo(() => {
    if (!cameraId) return undefined
    return getScenarioByCameraId(cameraId)
  }, [cameraId])

  const description = useMemo(() => {
    if (!event) return ''
    return buildActivityDescription(event, {
      cameraName: camera?.name,
      cameraStatus: camera?.status,
      zone,
      area: scenario?.area,
      severity: event.meta?.severity,
      catalogDetail: resolveCatalogDetail(event, cameraId),
    })
  }, [event, camera, zone, scenario, cameraId])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && event && meta && Icon ? (
        <>
          <motion.button
            key="activity-overlay"
            type="button"
            aria-label="Close activity detail"
            className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
            onClick={() => onOpenChange(false)}
          />
          <motion.aside
            key="activity-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Activity detail"
            className={cn(
              'fixed inset-y-0 right-0 z-[90] flex w-full max-w-md flex-col border-l border-[color:var(--border)]',
              'bg-[color:var(--surface-elevated)] shadow-[var(--shadow-lg)] outline-none',
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={panelTransition}
          >
            <div
              className={cn(
                'relative shrink-0 border-b border-[color:var(--border)] px-5 pb-4 pt-5',
                meta.softBgClass,
              )}
            >
              <div className={cn('absolute inset-x-0 top-0 h-1', meta.barClass)} aria-hidden="true" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Badge tone={meta.tone} className="normal-case tracking-normal">
                    <Icon size={11} aria-hidden="true" />
                    {meta.label}
                  </Badge>
                  <h2 className="mt-3 text-base font-semibold leading-snug tracking-tight text-[color:var(--text-h)]">
                    {event.message}
                  </h2>
                  <p className="mt-1.5 text-xs text-[color:var(--text-muted)]">
                    {formatRelativeTime(event.timestamp)} ·{' '}
                    {format(event.timestamp, 'MMM d, yyyy · h:mm:ss a')}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-icon shrink-0 rounded-lg p-2 text-[color:var(--text-muted)] hover:text-[color:var(--text-h)] focus-ring"
                  aria-label="Close"
                  onClick={() => onOpenChange(false)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="widget-scroll min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <section className={cn('rounded-xl border p-3.5', meta.borderClass, meta.softBgClass)}>
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                  Description
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-h)]">{description}</p>
              </section>

              <section>
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                  Category
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--text)]">
                  {activityContextBlurb(event.type)}
                </p>
              </section>

              <section className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/45 p-3.5">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                  Details
                </h3>
                <dl className="mt-2.5 space-y-2.5 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-[color:var(--text-muted)]">Category</dt>
                    <dd className="text-right font-medium text-[color:var(--text-h)]">{meta.label}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-[color:var(--text-muted)]">Event ID</dt>
                    <dd className="mono text-right text-xs text-[color:var(--text-h)]">{event.id}</dd>
                  </div>
                  {zone ? (
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-[color:var(--text-muted)]">Zone</dt>
                      <dd className="inline-flex items-center gap-1 text-right font-medium text-[color:var(--text-h)]">
                        <MapPin size={12} className="opacity-60" />
                        {zone}
                      </dd>
                    </div>
                  ) : null}
                  {scenario?.area ? (
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-[color:var(--text-muted)]">Area</dt>
                      <dd className="text-right font-medium text-[color:var(--text-h)]">{scenario.area}</dd>
                    </div>
                  ) : null}
                  {event.meta?.severity ? (
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-[color:var(--text-muted)]">Severity</dt>
                      <dd className="text-right font-medium capitalize text-[color:var(--text-h)]">
                        {event.meta.severity}
                      </dd>
                    </div>
                  ) : null}
                  {Object.entries(event.meta ?? {})
                    .filter(([k]) => !['cameraId', 'zone', 'severity', 'seed'].includes(k))
                    .map(([key, value]) => (
                      <div key={key} className="flex items-start justify-between gap-3">
                        <dt className="capitalize text-[color:var(--text-muted)]">{key}</dt>
                        <dd className="text-right font-medium text-[color:var(--text-h)]">{value}</dd>
                      </div>
                    ))}
                </dl>
              </section>

              {camera ? (
                <section className="rounded-xl border border-[color:var(--border)] p-3.5 [background-image:linear-gradient(165deg,var(--highlight),transparent_55%)]">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                    Linked camera
                  </h3>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[color:var(--text-h)]">
                        {camera.name}
                      </div>
                      <div className="mt-0.5 text-xs text-[color:var(--text-muted)]">
                        {camera.zone} · {camera.status} · {Math.round(camera.aiConfidence)}% AI
                      </div>
                    </div>
                    <Link
                      to={`/cameras/${camera.id}`}
                      onClick={() => onOpenChange(false)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-2.5 text-xs font-medium text-[color:var(--text-h)] shadow-[var(--shadow-sm)] transition hover:bg-[color:var(--surface-muted)] focus-ring"
                    >
                      Open
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </section>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[color:var(--border)] px-5 py-3">
              <Link
                to="/activity"
                onClick={() => onOpenChange(false)}
                className="text-xs font-medium text-[color:var(--text-muted)] transition hover:text-[color:var(--text-h)]"
              >
                Open activity stream
              </Link>
              <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

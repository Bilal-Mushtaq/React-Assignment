import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowRight, MapPin, ShieldAlert, X } from 'lucide-react'
import { useEffect } from 'react'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { formatRelativeTime, severityTone } from '../../../utils/format'
import { getScenarioByCameraId } from '../../../constants/mockData'
import { useCameraStore } from '../../../store/cameraStore'
import { useAlertsStore } from '../../../store/alertsStore'
import { toast } from '../../../store/toastStore'
import { overlayTransition, panelTransition } from '../../../lib/motion'
import type { Alert } from '../../../types/domain'
import { cn } from '../../../lib/cn'

type AlertDetailSheetProps = {
  alert: Alert | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AlertDetailSheet({ alert, open, onOpenChange }: AlertDetailSheetProps) {
  const cameras = useCameraStore((s) => s.cameras)
  const acknowledge = useAlertsStore((s) => s.acknowledge)
  const resolve = useAlertsStore((s) => s.resolve)
  const camera = alert?.cameraId ? cameras.find((c) => c.id === alert.cameraId) : undefined
  const scenario = alert?.cameraId ? getScenarioByCameraId(alert.cameraId) : undefined

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
      {open && alert ? (
        <>
          <motion.button
            key="alert-overlay"
            type="button"
            aria-label="Close alert detail"
            className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
            onClick={() => onOpenChange(false)}
          />
          <motion.aside
            key="alert-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Alert detail"
            className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-md flex-col border-l border-[color:var(--border)] bg-[color:var(--surface-elevated)] shadow-[var(--shadow-lg)] outline-none"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={panelTransition}
          >
            <div
              className={cn(
                'relative shrink-0 border-b border-[color:var(--border)] px-5 pb-4 pt-5',
                'bg-[color:color-mix(in_srgb,var(--danger)_8%,transparent)]',
              )}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-[color:var(--danger)]" aria-hidden="true" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={severityTone(alert.severity)}>{alert.severity}</Badge>
                    <Badge tone="neutral" className="normal-case tracking-normal capitalize">
                      {alert.status}
                    </Badge>
                  </div>
                  <h2 className="mt-3 flex items-start gap-2 text-base font-semibold leading-snug tracking-tight text-[color:var(--text-h)]">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0 text-[color:var(--danger)]" />
                    {alert.title}
                  </h2>
                  <p className="mt-1.5 text-xs text-[color:var(--text-muted)]">
                    {formatRelativeTime(alert.createdAt)} · {format(alert.createdAt, 'MMM d, yyyy · h:mm:ss a')}
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
              <section className="rounded-xl border border-[color:color-mix(in_srgb,var(--danger)_28%,transparent)] bg-[color:color-mix(in_srgb,var(--danger)_8%,transparent)] p-3.5">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                  Description
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-h)]">{alert.message}</p>
                <p className="mt-2 text-sm leading-relaxed text-[color:var(--text)]">
                  {alert.severity === 'critical'
                    ? 'Urgent — floor staff should respond immediately and confirm on the linked camera if available.'
                    : alert.severity === 'high'
                      ? 'High priority. Acknowledge soon, then verify the scene before resolving.'
                      : alert.severity === 'medium'
                        ? 'Review when you can; escalate if the situation worsens.'
                        : 'Logged for awareness. Resolve once you have confirmed it is clear.'}
                  {scenario ? ` Zone context: ${scenario.zone} · ${scenario.area}.` : ''}
                </p>
              </section>

              <section className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/45 p-3.5">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                  Details
                </h3>
                <dl className="mt-2.5 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[color:var(--text-muted)]">Alert ID</dt>
                    <dd className="mono text-xs text-[color:var(--text-h)]">{alert.id}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[color:var(--text-muted)]">Status</dt>
                    <dd className="capitalize font-medium text-[color:var(--text-h)]">{alert.status}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[color:var(--text-muted)]">Updated</dt>
                    <dd className="text-[color:var(--text-h)]">{formatRelativeTime(alert.updatedAt)}</dd>
                  </div>
                  {scenario?.zone ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-[color:var(--text-muted)]">Zone</dt>
                      <dd className="inline-flex items-center gap-1 font-medium text-[color:var(--text-h)]">
                        <MapPin size={12} className="opacity-60" />
                        {scenario.zone}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>

              {camera ? (
                <section className="rounded-xl border border-[color:var(--border)] p-3.5 [background-image:linear-gradient(165deg,var(--highlight),transparent_55%)]">
                  <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                    Linked camera
                  </h3>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[color:var(--text-h)]">{camera.name}</div>
                      <div className="mt-0.5 text-xs text-[color:var(--text-muted)]">
                        {camera.zone} · {camera.status}
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

            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-[color:var(--border)] px-5 py-3">
              <Link
                to="/alerts"
                onClick={() => onOpenChange(false)}
                className="text-xs font-medium text-[color:var(--text-muted)] transition hover:text-[color:var(--text-h)]"
              >
                All alerts
              </Link>
              <div className="flex items-center gap-1.5">
                {alert.status === 'open' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      acknowledge(alert.id)
                      toast({ title: 'Alert acknowledged', description: alert.title, tone: 'info' })
                    }}
                  >
                    Ack
                  </Button>
                ) : null}
                {alert.status !== 'resolved' ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      resolve(alert.id)
                      toast({ title: 'Alert resolved', description: alert.title, tone: 'success' })
                      onOpenChange(false)
                    }}
                  >
                    Resolve
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => onOpenChange(false)}>
                    Done
                  </Button>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

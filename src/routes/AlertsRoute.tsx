import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ShieldAlert } from 'lucide-react'
import { AlertDetailSheet } from '../features/alerts/components/AlertDetailSheet'
import { AlertsSkeleton } from '../components/common/PageSkeletons'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { DotFilterChip, SegmentedFilter, type FilterDotTone } from '../components/ui/filter-chips'
import { usePageReady } from '../hooks/usePageReady'
import { SITE, getScenarioByCameraId } from '../constants/mockData'
import { useAlertsStore } from '../store/alertsStore'
import { useCameraStore } from '../store/cameraStore'
import { toast } from '../store/toastStore'
import { staggerContainer, staggerItem } from '../lib/motion'
import { formatRelativeTime, severityTone } from '../utils/format'
import type { Alert, AlertSeverity, AlertStatus } from '../types/domain'

const SEVERITY_CHIPS: Array<{ id: AlertSeverity | 'all'; label: string; tone: FilterDotTone }> = [
  { id: 'all', label: 'All', tone: 'neutral' },
  { id: 'critical', label: 'Critical', tone: 'danger' },
  { id: 'high', label: 'High', tone: 'warning' },
  { id: 'medium', label: 'Medium', tone: 'info' },
  { id: 'low', label: 'Low', tone: 'success' },
]

const STATUS_OPTIONS: Array<{ id: AlertStatus | 'all'; label: string }> = [
  { id: 'open', label: 'Open' },
  { id: 'acknowledged', label: 'Acked' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'all', label: 'All' },
]

export default function AlertsRoute() {
  const ready = usePageReady('alerts', 380)
  const alerts = useAlertsStore((s) => s.alerts)
  const acknowledge = useAlertsStore((s) => s.acknowledge)
  const resolve = useAlertsStore((s) => s.resolve)
  const cameras = useCameraStore((s) => s.cameras)
  const [severity, setSeverity] = useState<AlertSeverity | 'all'>('all')
  const [status, setStatus] = useState<AlertStatus | 'all'>('open')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Alert | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return alerts.filter((alert) => {
      if (severity !== 'all' && alert.severity !== severity) return false
      if (status !== 'all' && alert.status !== status) return false
      if (!q) return true
      const zone = alert.cameraId ? getScenarioByCameraId(alert.cameraId).zone : ''
      return [alert.title, alert.message, alert.severity, alert.status, zone].join(' ').toLowerCase().includes(q)
    })
  }, [alerts, severity, status, query])

  const counts = useMemo(() => {
    const byStatus =
      status === 'all' ? alerts : alerts.filter((a) => a.status === status)
    const severityCounts: Record<string, number> = { all: byStatus.length }
    for (const s of ['critical', 'high', 'medium', 'low'] as AlertSeverity[]) {
      severityCounts[s] = byStatus.filter((a) => a.severity === s).length
    }
    return {
      severity: severityCounts,
      open: alerts.filter((a) => a.status === 'open').length,
      criticalOpen: alerts.filter((a) => a.status !== 'resolved' && a.severity === 'critical').length,
    }
  }, [alerts, status])

  if (!ready) return <AlertsSkeleton />

  return (
    <motion.div
      className="flex h-full min-h-0 flex-col gap-4 pb-6"
      aria-label="Alerts"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <motion.header
        variants={staggerItem}
        className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-elevated)_88%,transparent)] p-4 shadow-[var(--shadow-sm)] backdrop-blur-md [background-image:linear-gradient(180deg,var(--highlight),transparent_40%)]"
      >
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
            {SITE.name}
          </div>
          <h2 className="mt-1 flex items-center gap-2 text-lg font-bold tracking-tight text-[color:var(--text-h)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[color:color-mix(in_srgb,var(--danger)_12%,transparent)] text-[color:var(--danger)]">
              <ShieldAlert size={16} />
            </span>
            Alerts
          </h2>
          <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">
            Acknowledge, resolve, or open the linked camera · click a row for detail
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="danger" className="normal-case tracking-normal">
            {counts.open} open
          </Badge>
          {counts.criticalOpen > 0 ? (
            <Badge tone="danger" className="normal-case tracking-normal">
              {counts.criticalOpen} critical
            </Badge>
          ) : null}
        </div>
      </motion.header>

      <motion.div variants={staggerItem} className="flex flex-col gap-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search alerts, zones…"
              className="h-10 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] pl-9 pr-3 text-sm text-[color:var(--text-h)] shadow-[var(--shadow-sm)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--accent-border)] focus:ring-2 focus:ring-[color:var(--accent)]/25"
            />
          </label>
          <SegmentedFilter
            aria-label="Status"
            value={status}
            options={STATUS_OPTIONS}
            onChange={setStatus}
          />
        </div>

        <div
          className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Severity"
        >
          {SEVERITY_CHIPS.map((chip) => (
            <DotFilterChip
              key={chip.id}
              active={severity === chip.id}
              label={chip.label}
              tone={chip.tone}
              count={counts.severity[chip.id] ?? 0}
              onClick={() => setSeverity(chip.id)}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="min-h-0 flex-1 space-y-2 overflow-auto rounded-2xl border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-elevated)_92%,transparent)] p-3 shadow-[var(--shadow-sm)] sm:p-4"
      >
        {filtered.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <div className="text-sm font-medium text-[color:var(--text-h)]">No matching alerts</div>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">Try another severity or status filter.</p>
          </div>
        ) : (
          filtered.map((alert) => {
            const cam = alert.cameraId ? cameras.find((c) => c.id === alert.cameraId) : undefined
            return (
              <div
                key={alert.id}
                className="group rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 p-3 transition hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-sm)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left focus-ring rounded-lg"
                    onClick={() => setSelected(alert)}
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={severityTone(alert.severity)}>{alert.severity}</Badge>
                      <Badge tone="neutral" className="normal-case tracking-normal capitalize">
                        {alert.status}
                      </Badge>
                      <span className="text-[10px] text-[color:var(--text-muted)]">
                        {formatRelativeTime(alert.createdAt)}
                      </span>
                    </div>
                    <div className="mt-1.5 text-sm font-semibold text-[color:var(--text-h)] group-hover:underline">
                      {alert.title}
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-[color:var(--text-muted)]">{alert.message}</div>
                    {cam ? (
                      <div className="mt-1.5 text-[10px] text-[color:var(--text-muted)]">{cam.zone} · {cam.name}</div>
                    ) : null}
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    {alert.cameraId ? (
                      <Link
                        to={`/cameras/${alert.cameraId}`}
                        className="inline-flex h-7 items-center rounded-lg px-2 text-xs font-medium text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-h)] focus-ring"
                      >
                        Camera
                      </Link>
                    ) : null}
                    {alert.status === 'open' ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
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
                        className="h-7 px-2"
                        onClick={() => {
                          resolve(alert.id)
                          toast({ title: 'Alert resolved', description: alert.title, tone: 'success' })
                        }}
                      >
                        Resolve
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </motion.div>

      <AlertDetailSheet
        alert={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      />
    </motion.div>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ActivitySquare, Search } from 'lucide-react'
import { IncidentDetailSheet } from '../features/incidents/components/IncidentDetailSheet'
import { IncidentsSkeleton } from '../components/common/PageSkeletons'
import { Badge } from '../components/ui/badge'
import { DotFilterChip, SegmentedFilter, type FilterDotTone } from '../components/ui/filter-chips'
import { usePageReady } from '../hooks/usePageReady'
import { SITE, getScenarioByCameraId } from '../constants/mockData'
import { useCameraStore } from '../store/cameraStore'
import { useTimelineStore } from '../store/timelineStore'
import { cn } from '../lib/cn'
import { staggerContainer, staggerItem } from '../lib/motion'
import { formatRelativeTime, severityTone } from '../utils/format'
import type { AlertSeverity, Incident } from '../types/domain'

const SEVERITY_CHIPS: Array<{ id: AlertSeverity | 'all'; label: string; tone: FilterDotTone }> = [
  { id: 'all', label: 'All', tone: 'neutral' },
  { id: 'critical', label: 'Critical', tone: 'danger' },
  { id: 'high', label: 'High', tone: 'warning' },
  { id: 'medium', label: 'Medium', tone: 'info' },
  { id: 'low', label: 'Low', tone: 'success' },
]

type StatusFilter = 'all' | 'open' | 'resolved'

const STATUS_OPTIONS: Array<{ id: StatusFilter; label: string }> = [
  { id: 'open', label: 'Open' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'all', label: 'All' },
]

const spineColor: Record<AlertSeverity, string> = {
  critical: 'bg-[color:var(--danger)] ring-[color:color-mix(in_srgb,var(--danger)_20%,transparent)]',
  high: 'bg-[color:var(--warning)] ring-[color:color-mix(in_srgb,var(--warning)_20%,transparent)]',
  medium: 'bg-[color:var(--info)] ring-[color:color-mix(in_srgb,var(--info)_20%,transparent)]',
  low: 'bg-[color:var(--success)] ring-[color:color-mix(in_srgb,var(--success)_20%,transparent)]',
}

export default function IncidentsRoute() {
  const ready = usePageReady('incidents', 380)
  const incidents = useTimelineStore((s) => s.incidents)
  const cameras = useCameraStore((s) => s.cameras)
  const [severity, setSeverity] = useState<AlertSeverity | 'all'>('all')
  const [status, setStatus] = useState<StatusFilter>('open')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Incident | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return incidents.filter((incident) => {
      if (severity !== 'all' && incident.severity !== severity) return false
      if (status === 'open' && incident.resolved) return false
      if (status === 'resolved' && !incident.resolved) return false
      if (!q) return true
      const zone = incident.cameraId ? getScenarioByCameraId(incident.cameraId).zone : ''
      return [incident.title, incident.severity, zone].join(' ').toLowerCase().includes(q)
    })
  }, [incidents, severity, status, query])

  const counts = useMemo(() => {
    const byStatus =
      status === 'all'
        ? incidents
        : status === 'open'
          ? incidents.filter((i) => !i.resolved)
          : incidents.filter((i) => i.resolved)
    const severityCounts: Record<string, number> = { all: byStatus.length }
    for (const s of ['critical', 'high', 'medium', 'low'] as AlertSeverity[]) {
      severityCounts[s] = byStatus.filter((i) => i.severity === s).length
    }
    return {
      severity: severityCounts,
      open: incidents.filter((i) => !i.resolved).length,
      today: useTimelineStore.getState().getTodayCount(),
    }
  }, [incidents, status])

  if (!ready) return <IncidentsSkeleton />

  return (
    <motion.div
      className="flex h-full min-h-0 flex-col gap-4 pb-6"
      aria-label="Incidents"
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
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[color:color-mix(in_srgb,var(--warning)_12%,transparent)] text-[color:var(--warning)]">
              <ActivitySquare size={16} />
            </span>
            Incident timeline
          </h2>
          <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">
            Tracked cases across the mall · click any row for detail and resolve
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge tone="warning" className="normal-case tracking-normal">
            {counts.open} open
          </Badge>
          <Badge tone="neutral" className="normal-case tracking-normal">
            {counts.today} today
          </Badge>
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
              placeholder="Search incidents, zones…"
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
        className="min-h-0 flex-1 space-y-0 overflow-auto rounded-2xl border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-elevated)_92%,transparent)] p-3 shadow-[var(--shadow-sm)] sm:p-4"
      >
        {filtered.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <div className="text-sm font-medium text-[color:var(--text-h)]">No matching incidents</div>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">Try another filter or clear search.</p>
          </div>
        ) : (
          filtered.map((incident, index) => {
            const cam = incident.cameraId
              ? cameras.find((c) => c.id === incident.cameraId)
              : undefined
            return (
              <div key={incident.id} className="relative flex gap-3 pl-1">
                <div className="relative flex w-3 shrink-0 flex-col items-center">
                  <span
                    className={cn(
                      'mt-4 h-2.5 w-2.5 rounded-full ring-4',
                      spineColor[incident.severity],
                    )}
                  />
                  {index < filtered.length - 1 ? (
                    <span className="mt-1 w-px flex-1 bg-[color:var(--border)]" aria-hidden="true" />
                  ) : null}
                </div>
                <div className="mb-2 min-w-0 flex-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 p-3 transition hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-sm)]">
                  <button
                    type="button"
                    onClick={() => setSelected(incident)}
                    className="w-full text-left focus-ring rounded-lg"
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={severityTone(incident.severity)}>{incident.severity}</Badge>
                      <Badge
                        tone={incident.resolved ? 'success' : 'warning'}
                        className="normal-case tracking-normal"
                      >
                        {incident.resolved ? 'Resolved' : 'Open'}
                      </Badge>
                      <span className="text-[10px] text-[color:var(--text-muted)]">
                        {formatRelativeTime(incident.timestamp)}
                      </span>
                    </div>
                    <div className="mt-1.5 text-sm font-semibold text-[color:var(--text-h)]">{incident.title}</div>
                  </button>
                  {cam ? (
                    <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-[color:var(--text-muted)]">
                      <span>
                        {cam.zone} · {cam.name}
                      </span>
                      <Link
                        to={`/cameras/${cam.id}`}
                        className="font-medium text-[color:var(--accent)] hover:underline focus-ring rounded"
                      >
                        Camera
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })
        )}
      </motion.div>

      <IncidentDetailSheet
        incident={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      />
    </motion.div>
  )
}

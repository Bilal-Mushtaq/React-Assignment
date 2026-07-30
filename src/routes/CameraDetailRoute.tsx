import { Link, Navigate, useParams } from 'react-router-dom'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Building2,
  Clock3,
  MapPin,
  Radio,
  ShieldAlert,
  Signal,
  SignalLow,
  SignalZero,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { StatusDot } from '../components/ui/status-dot'
import { CameraFeedPreview } from '../components/camera/CameraFeedPreview'
import { CameraDetailSkeleton } from '../components/common/PageSkeletons'
import {
  ActivityVolumeBars,
  AlertSeverityBars,
  ConfidenceSparkline,
} from '../components/charts/CameraCharts'
import { usePageReady } from '../hooks/usePageReady'
import { formatDuration, useNow } from '../hooks/useNow'
import { SITE, getScenarioForCamera } from '../constants/mockData'
import { useActivityStore } from '../store/activityStore'
import { useAlertsStore } from '../store/alertsStore'
import { useCameraStore } from '../store/cameraStore'
import { useTimelineStore } from '../store/timelineStore'
import { toast } from '../store/toastStore'
import { cn } from '../lib/cn'
import { easeOutSoft, fadeQuick, staggerContainer, staggerItem } from '../lib/motion'
import { formatRelativeTime, severityTone } from '../utils/format'
import type { AlertSeverity, CameraStatus } from '../types/domain'

type TabId = 'alerts' | 'activity' | 'incidents'

const TAB_META: Array<{ id: TabId; label: string; icon: typeof ShieldAlert }> = [
  { id: 'alerts', label: 'Alerts', icon: ShieldAlert },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'incidents', label: 'Incidents', icon: Radio },
]

function statusLabel(status: CameraStatus) {
  if (status === 'recording') return 'Recording'
  if (status === 'degraded') return 'Picture weak'
  if (status === 'offline') return 'Offline'
  return 'Online'
}

export default function CameraDetailRoute() {
  const { cameraId = '' } = useParams()
  const ready = usePageReady(`camera-${cameraId}`, 360)
  const cameras = useCameraStore((s) => s.cameras)
  const camera = useCameraStore((s) => s.cameras.find((c) => c.id === cameraId))
  const alerts = useAlertsStore((s) => s.alerts)
  const acknowledge = useAlertsStore((s) => s.acknowledge)
  const resolve = useAlertsStore((s) => s.resolve)
  const activity = useActivityStore((s) => s.events)
  const incidents = useTimelineStore((s) => s.incidents)
  const now = useNow(1000)
  const [tab, setTab] = useState<TabId>('alerts')

  const scenario = camera ? getScenarioForCamera(camera) : null

  const relatedAlerts = useMemo(
    () => alerts.filter((a) => a.cameraId === cameraId && a.status !== 'resolved').slice(0, 20),
    [alerts, cameraId],
  )

  const relatedActivity = useMemo(
    () =>
      activity
        .filter((e) => e.meta?.cameraId === cameraId || (scenario && e.message.includes(scenario.zone)))
        .slice(0, 40),
    [activity, cameraId, scenario],
  )

  const relatedIncidents = useMemo(
    () => incidents.filter((i) => i.cameraId === cameraId).slice(0, 16),
    [incidents, cameraId],
  )

  const severityCounts = useMemo(() => {
    const next: Record<AlertSeverity, number> = { critical: 0, high: 0, medium: 0, low: 0 }
    for (const alert of relatedAlerts) next[alert.severity] += 1
    return next
  }, [relatedAlerts])

  const activityVolumes = useMemo(() => {
    const buckets = Array.from({ length: 10 }, () => 0)
    const span = 45 * 60 * 1000
    const start = now - span
    for (const event of relatedActivity) {
      if (event.timestamp < start) continue
      const idx = Math.min(9, Math.floor(((event.timestamp - start) / span) * 10))
      buckets[idx] += 1
    }
    // Soft fallback so empty charts still feel alive
    if (buckets.every((v) => v === 0)) {
      return [1, 2, 1, 3, 2, 4, 3, 2, 3, 2]
    }
    return buckets
  }, [relatedActivity, now])

  const neighborCameras = useMemo(() => {
    if (!camera) return []
    const idx = cameras.findIndex((c) => c.id === camera.id)
    if (idx < 0) return cameras.slice(0, 4)
    const order = [...cameras.slice(idx + 1), ...cameras.slice(0, idx)]
    return order.slice(0, 4)
  }, [cameras, camera])

  if (!ready) return <CameraDetailSkeleton />

  if (!camera || !scenario) {
    return <Navigate to="/cameras" replace />
  }

  const isOffline = camera.status === 'offline'
  const isDegraded = camera.status === 'degraded'
  const isRecording = camera.status === 'recording'
  const isLive = camera.status === 'online' || isRecording
  const confidencePct = Math.min(100, Math.max(0, Math.round(camera.aiConfidence)))
  const uptime = formatDuration(Math.max(0, now - camera.statusChangedAt))

  return (
    <motion.div
      className="space-y-5 pb-10"
      aria-label={`${camera.name} details`}
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-2">
        <Link
          to="/cameras"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-[color:var(--text)] transition hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-h)] focus-ring"
        >
          <ArrowLeft size={14} />
          All cameras
        </Link>
        <span className="text-[11px] text-[color:var(--text-muted)]">{SITE.name}</span>
        <span className="text-[11px] text-[color:var(--text-muted)]">/</span>
        <span className="text-[11px] font-medium text-[color:var(--text-h)]">{camera.zone}</span>
      </motion.div>

      <motion.section
        variants={staggerItem}
        className="overflow-hidden rounded-2xl border border-[color:var(--border)] shadow-[var(--shadow-md)] [background-image:linear-gradient(180deg,var(--highlight),transparent_18%)]"
      >
        <div className="grid lg:grid-cols-[1.4fr_1fr] lg:items-stretch">
          <CameraFeedPreview
            cameraId={camera.id}
            status={camera.status}
            size="hero"
            priority
            className="min-h-[280px] p-4 sm:min-h-[340px] lg:h-full lg:min-h-[380px]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge
                  tone={isOffline ? 'danger' : isRecording ? 'danger' : 'success'}
                  className="border-white/10 bg-black/40 text-white backdrop-blur-sm"
                >
                  <StatusDot
                    status={isOffline ? 'offline' : isDegraded ? 'degraded' : isRecording ? 'recording' : 'live'}
                    pulse={isLive}
                  />
                  {isOffline ? 'OFFLINE' : isRecording ? 'RECORDING' : 'LIVE'}
                </Badge>
                {isDegraded ? (
                  <Badge tone="warning" className="border-white/10 bg-black/40 text-amber-100 backdrop-blur-sm">
                    Weak picture
                  </Badge>
                ) : null}
              </div>
              <span className="mono rounded-md bg-black/40 px-2 py-1 text-[10px] text-white/75 backdrop-blur-sm">
                {camera.id.replace('cam_', 'CH-').toUpperCase()}
              </span>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1
                  className="text-xl font-bold tracking-tight text-white drop-shadow sm:text-2xl"
                  style={{ color: '#ffffff' }}
                >
                  {camera.name}
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-white/80">
                  <MapPin size={12} />
                  {camera.zone}
                  <span className="opacity-50">·</span>
                  {scenario.area}
                </p>
              </div>
              <div className="rounded-lg bg-black/45 px-2.5 py-1.5 text-right backdrop-blur-sm">
                <div className="text-[10px] uppercase tracking-wide text-white/60">AI certainty</div>
                <div className="mono text-lg font-semibold tabular-nums text-white">{confidencePct}%</div>
              </div>
            </div>
          </CameraFeedPreview>

          <div className="flex min-h-[250px] flex-col gap-4 bg-[color:var(--surface-elevated)] p-4 sm:min-h-[320px] sm:p-5 lg:min-h-[350px]">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
                Live status
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm text-[color:var(--text-h)]">
                {isOffline ? <SignalZero size={16} /> : isDegraded ? <SignalLow size={16} /> : <Signal size={16} />}
                <span className="font-semibold">{statusLabel(camera.status)}</span>
                <span className="text-[color:var(--text-muted)]">·</span>
                <span className="mono text-xs tabular-nums text-[color:var(--text-muted)]">{uptime}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/50 p-3 [background-image:linear-gradient(165deg,var(--highlight),transparent_50%)]">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[color:var(--text-muted)]">
                  <ShieldAlert size={11} />
                  Open alerts
                </div>
                <div className="mt-1 text-xl font-bold tabular-nums text-[color:var(--text-h)]">
                  {relatedAlerts.length}
                </div>
              </div>
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/50 p-3 [background-image:linear-gradient(165deg,var(--highlight),transparent_50%)]">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[color:var(--text-muted)]">
                  <Radio size={11} />
                  Incidents
                </div>
                <div className="mt-1 text-xl font-bold tabular-nums text-[color:var(--text-h)]">
                  {relatedIncidents.length}
                </div>
              </div>
            </div>

            <div className="flex-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/35 p-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-[color:var(--text-muted)]">
                <Building2 size={11} />
                Location
              </div>
              <p className="mt-1.5 text-sm font-medium text-[color:var(--text-h)]">{scenario.area}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[color:var(--text-muted)]">
                Part of {SITE.name}. Charts and lists below only belong to this camera.
              </p>
            </div>

            <div className="mt-auto">
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-[color:var(--text-muted)]">
                <span>AI certainty</span>
                <span className="mono tabular-nums text-[color:var(--text-h)]">{confidencePct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[color:var(--border)]">
                <motion.div
                  className={cn(
                    'h-full rounded-full',
                    isOffline
                      ? 'bg-[color:var(--danger)]/70'
                      : confidencePct >= 85
                        ? 'bg-[color:var(--success)]'
                        : confidencePct >= 70
                          ? 'bg-[color:var(--warning)]'
                          : 'bg-[color:var(--danger)]',
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${isOffline ? Math.min(confidencePct, 35) : confidencePct}%` }}
                  transition={{ duration: 0.55, ease: easeOutSoft }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section variants={staggerItem} className="grid gap-3 lg:grid-cols-3">
        <div className="flex min-h-[13.5rem] flex-col rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4 shadow-[var(--shadow-sm)] [background-image:linear-gradient(180deg,var(--highlight),transparent_40%)]">
          <div className="mb-2 shrink-0">
            <h3 className="text-sm font-semibold text-[color:var(--text-h)]">AI certainty trend</h3>
            <p className="mt-0.5 text-[11px] text-[color:var(--text-muted)]">Hover points for readings</p>
          </div>
          <ConfidenceSparkline value={confidencePct} offline={isOffline} className="min-h-0 flex-1" />
        </div>

        <div className="flex min-h-[13.5rem] flex-col rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4 shadow-[var(--shadow-sm)] [background-image:linear-gradient(180deg,var(--highlight),transparent_40%)]">
          <div className="mb-2 shrink-0">
            <h3 className="text-sm font-semibold text-[color:var(--text-h)]">Alert mix</h3>
            <p className="mt-0.5 text-[11px] text-[color:var(--text-muted)]">Open alerts by urgency</p>
          </div>
          {relatedAlerts.length === 0 ? (
            <p className="flex flex-1 items-center justify-center text-center text-xs text-[color:var(--text-muted)]">
              No open alerts to chart
            </p>
          ) : (
            <AlertSeverityBars counts={severityCounts} className="min-h-0 flex-1" />
          )}
        </div>

        <div className="flex min-h-[13.5rem] flex-col rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4 shadow-[var(--shadow-sm)] [background-image:linear-gradient(180deg,var(--highlight),transparent_40%)]">
          <div className="mb-2 shrink-0">
            <h3 className="text-sm font-semibold text-[color:var(--text-h)]">Activity pulse</h3>
            <p className="mt-0.5 text-[11px] text-[color:var(--text-muted)]">Hover bars · last ~45 minutes</p>
          </div>
          <ActivityVolumeBars values={activityVolumes} className="min-h-0 flex-1" />
        </div>
      </motion.section>

      <motion.section variants={staggerItem} className="space-y-3">
        <LayoutGroup>
          <div
            className="relative flex gap-1 overflow-x-auto rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-1.5 shadow-[var(--shadow-sm)]"
            role="tablist"
            aria-label="Camera related data"
          >
            {TAB_META.map((item) => {
              const Icon = item.icon
              const count =
                item.id === 'alerts'
                  ? relatedAlerts.length
                  : item.id === 'activity'
                    ? relatedActivity.length
                    : relatedIncidents.length
              const active = tab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    'relative flex min-w-[7.5rem] flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition focus-ring',
                    active
                      ? 'text-[color:var(--text-h)]'
                      : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-h)]',
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="camera-tab-pill"
                      className="absolute inset-0 rounded-xl bg-[color:var(--accent-bg)] shadow-[inset_0_0_0_1px_var(--accent-border)]"
                      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className="relative z-[1] inline-flex items-center gap-2">
                    <Icon size={14} className={active ? 'text-[color:var(--accent)]' : undefined} />
                    {item.label}
                    <span
                      className={cn(
                        'mono rounded-md px-1.5 py-0.5 text-[10px] tabular-nums',
                        active
                          ? 'bg-[color:var(--surface-elevated)] text-[color:var(--text-h)]'
                          : 'bg-[color:var(--surface-muted)] text-[color:var(--text-muted)]',
                      )}
                    >
                      {count}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </LayoutGroup>

        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={fadeQuick}
            className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-3 shadow-[var(--shadow-sm)] sm:p-4"
            role="tabpanel"
          >
            {tab === 'alerts' ? (
              relatedAlerts.length === 0 ? (
                <EmptyState title="No open alerts" body="Nothing urgent on this camera right now." />
              ) : (
                <ul className="widget-scroll max-h-[22rem] space-y-2 overflow-y-auto pr-1">
                  {relatedAlerts.map((alert) => (
                    <li
                      key={alert.id}
                      className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 p-3 [background-image:linear-gradient(165deg,var(--highlight),transparent_55%)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge tone={severityTone(alert.severity)}>{alert.severity}</Badge>
                            {alert.status === 'acknowledged' ? (
                              <Badge tone="neutral" className="normal-case tracking-normal">
                                Seen
                              </Badge>
                            ) : null}
                            <span className="inline-flex items-center gap-1 text-[10px] text-[color:var(--text-muted)]">
                              <Clock3 size={10} />
                              {formatRelativeTime(alert.createdAt)}
                            </span>
                          </div>
                          <div className="mt-1.5 text-sm font-semibold text-[color:var(--text-h)]">{alert.title}</div>
                          <p className="mt-0.5 text-xs leading-relaxed text-[color:var(--text-muted)]">{alert.message}</p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          {alert.status === 'open' ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7"
                              onClick={() => {
                                acknowledge(alert.id)
                                toast({ title: 'Marked as seen', description: alert.title, tone: 'info' })
                              }}
                            >
                              Seen
                            </Button>
                          ) : null}
                          <Button
                            size="sm"
                            variant="primary"
                            className="h-7"
                            onClick={() => {
                              resolve(alert.id)
                              toast({ title: 'Alert resolved', description: alert.title, tone: 'success' })
                            }}
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            ) : null}

            {tab === 'activity' ? (
              relatedActivity.length === 0 ? (
                <EmptyState title="No activity yet" body="Live updates for this camera will show up here." />
              ) : (
                <ul className="widget-scroll max-h-[22rem] space-y-2 overflow-y-auto pr-1">
                  {relatedActivity.map((event) => (
                    <li
                      key={event.id}
                      className="flex items-start gap-2.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 p-3 [background-image:linear-gradient(165deg,var(--highlight),transparent_55%)]"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[color:var(--text-h)]">{event.message}</p>
                        <p className="mt-1 inline-flex items-center gap-1 text-[10px] text-[color:var(--text-muted)]">
                          <Clock3 size={10} />
                          {formatRelativeTime(event.timestamp)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            ) : null}

            {tab === 'incidents' ? (
              relatedIncidents.length === 0 ? (
                <EmptyState title="No incidents" body="No logged incidents tied to this camera." />
              ) : (
                <ul className="widget-scroll max-h-[22rem] space-y-2 overflow-y-auto pr-1">
                  {relatedIncidents.map((incident) => (
                    <li
                      key={incident.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 px-3 py-2.5 [background-image:linear-gradient(165deg,var(--highlight),transparent_55%)]"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-[color:var(--text-h)]">{incident.title}</div>
                        <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-[color:var(--text-muted)]">
                          <Clock3 size={10} />
                          {formatRelativeTime(incident.timestamp)}
                        </div>
                      </div>
                      <Badge tone={severityTone(incident.severity)}>{incident.severity}</Badge>
                    </li>
                  ))}
                </ul>
              )
            ) : null}
          </motion.div>
        </AnimatePresence>
      </motion.section>

      <motion.section variants={staggerItem} className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-[color:var(--text-h)]">Nearby feeds</h3>
          <Link
            to="/cameras"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[color:var(--text-muted)] hover:text-[color:var(--text-h)]"
          >
            View all
            <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {neighborCameras.map((cam) => {
            return (
              <Link
                key={cam.id}
                to={`/cameras/${cam.id}`}
                className="group overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] shadow-[var(--shadow-sm)] transition hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-md)] focus-ring"
              >
                <CameraFeedPreview
                  cameraId={cam.id}
                  status={cam.status}
                  size="sm"
                  showCorners={false}
                  className="h-36 p-2"
                >
                  <div />
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] text-white/90 backdrop-blur-sm">
                      {cam.zone}
                    </span>
                    <ArrowRight
                      size={12}
                      className="shrink-0 text-white/50 transition group-hover:translate-x-0.5 group-hover:text-white/90"
                    />
                  </div>
                </CameraFeedPreview>
                <div className="p-2.5">
                  <div className="truncate text-xs font-semibold text-[color:var(--text-h)] group-hover:underline">
                    {cam.name}
                  </div>
                  <div className="mt-0.5 truncate text-[10px] text-[color:var(--text-muted)]">
                    {statusLabel(cam.status)} · {Math.round(cam.aiConfidence)}% AI
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </motion.section>
    </motion.div>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-[140px] flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)]/35 px-4 text-center">
      <div className="text-sm font-medium text-[color:var(--text-h)]">{title}</div>
      <p className="mt-1 text-xs text-[color:var(--text-muted)]">{body}</p>
    </div>
  )
}

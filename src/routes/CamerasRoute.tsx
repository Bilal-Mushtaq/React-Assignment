import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Camera,
  MapPin,
  Signal,
  SignalLow,
  SignalZero,
} from 'lucide-react'
import { useMemo } from 'react'
import { Badge } from '../components/ui/badge'
import { StatusDot } from '../components/ui/status-dot'
import { CameraFeedPreview } from '../components/camera/CameraFeedPreview'
import { CamerasSkeleton } from '../components/common/PageSkeletons'
import { usePageReady } from '../hooks/usePageReady'
import { formatDuration, useNow } from '../hooks/useNow'
import { SITE, getScenarioForCamera } from '../constants/mockData'
import { useCameraStore } from '../store/cameraStore'
import { useAlertsStore } from '../store/alertsStore'
import { cn } from '../lib/cn'
import { staggerContainer, staggerItem } from '../lib/motion'
import type { CameraStatus } from '../types/domain'

function statusLabel(status: CameraStatus) {
  if (status === 'recording') return 'Recording'
  if (status === 'degraded') return 'Picture weak'
  if (status === 'offline') return 'Offline'
  return 'Online'
}

export default function CamerasRoute() {
  const ready = usePageReady('cameras', 420)
  const cameras = useCameraStore((s) => s.cameras)
  const alerts = useAlertsStore((s) => s.alerts)
  const now = useNow(1000)
  const navigate = useNavigate()

  const openAlertCountByCamera = useMemo(() => {
    const map = new Map<string, number>()
    for (const alert of alerts) {
      if (alert.status === 'resolved' || !alert.cameraId) continue
      map.set(alert.cameraId, (map.get(alert.cameraId) ?? 0) + 1)
    }
    return map
  }, [alerts])

  const counts = useMemo(() => {
    const next = { online: 0, recording: 0, degraded: 0, offline: 0 }
    for (const cam of cameras) next[cam.status] += 1
    return next
  }, [cameras])

  if (!ready) return <CamerasSkeleton />

  return (
    <motion.div
      className="space-y-4 pb-8"
      aria-label="Cameras"
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
          <h2 className="mt-1 text-lg font-bold tracking-tight text-[color:var(--text-h)]">Camera feeds</h2>
          <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">
            Open any camera to see alerts, activity, and what is happening there right now
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="success" className="gap-1 normal-case tracking-normal">
            <StatusDot status="live" pulse />
            {counts.online + counts.recording} live
          </Badge>
          {counts.degraded > 0 ? (
            <Badge tone="warning" className="normal-case tracking-normal">
              {counts.degraded} weak
            </Badge>
          ) : null}
          {counts.offline > 0 ? (
            <Badge tone="danger" className="normal-case tracking-normal">
              {counts.offline} offline
            </Badge>
          ) : null}
        </div>
      </motion.header>

      <motion.div
        variants={staggerItem}
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        {cameras.map((camera) => {
          const scenario = getScenarioForCamera(camera)
          const isOffline = camera.status === 'offline'
          const isDegraded = camera.status === 'degraded'
          const isRecording = camera.status === 'recording'
          const isLive = camera.status === 'online' || isRecording
          const openAlerts = openAlertCountByCamera.get(camera.id) ?? 0
          const uptime = formatDuration(Math.max(0, now - camera.statusChangedAt))

          return (
            <button
              key={camera.id}
              type="button"
              onClick={() => navigate(`/cameras/${camera.id}`)}
              className={cn(
                'group flex flex-col overflow-hidden rounded-2xl border text-left shadow-[var(--shadow-sm)] transition focus-ring',
                'bg-[color:color-mix(in_srgb,var(--surface-elevated)_92%,transparent)] [background-image:linear-gradient(180deg,var(--highlight),transparent_30%)]',
                isOffline
                  ? 'border-[color:color-mix(in_srgb,var(--danger)_30%,transparent)] hover:border-[color:color-mix(in_srgb,var(--danger)_50%,transparent)]'
                  : isDegraded
                    ? 'border-[color:color-mix(in_srgb,var(--warning)_30%,transparent)] hover:border-[color:color-mix(in_srgb,var(--warning)_50%,transparent)]'
                    : 'border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-md)]',
              )}
              aria-label={`Open ${camera.name}`}
            >
              <CameraFeedPreview
                cameraId={camera.id}
                status={camera.status}
                size="md"
                className="h-48 p-2.5 sm:h-52"
              >
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    tone={isOffline ? 'danger' : isRecording ? 'danger' : 'success'}
                    className="border-white/10 bg-black/35 text-white backdrop-blur-sm"
                  >
                    <StatusDot
                      status={isOffline ? 'offline' : isDegraded ? 'degraded' : isRecording ? 'recording' : 'live'}
                      pulse={isLive}
                    />
                    {isOffline ? 'OFF' : isRecording ? 'REC' : 'LIVE'}
                  </Badge>
                  {openAlerts > 0 ? (
                    <Badge tone="danger" className="border-white/10 bg-black/40 text-white backdrop-blur-sm">
                      {openAlerts} alert{openAlerts === 1 ? '' : 's'}
                    </Badge>
                  ) : null}
                </div>
                <div className="flex items-end justify-between gap-2">
                  <span className="inline-flex max-w-[80%] items-center gap-1 truncate rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] text-white/90 backdrop-blur-sm">
                    <MapPin size={10} className="shrink-0 opacity-70" />
                    <span className="truncate">{camera.zone}</span>
                  </span>
                  <ArrowRight
                    size={14}
                    className="shrink-0 text-white/50 transition group-hover:translate-x-0.5 group-hover:text-white/90"
                    aria-hidden="true"
                  />
                </div>
              </CameraFeedPreview>

              <div className="flex flex-1 flex-col gap-2 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[color:var(--text-h)]">{camera.name}</div>
                    <div className="mt-0.5 truncate text-[11px] text-[color:var(--text-muted)]">{scenario.area}</div>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--accent-bg)] text-[color:var(--accent)]">
                    <Camera size={14} aria-hidden="true" />
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[color:var(--text-muted)]">
                  <span className="inline-flex items-center gap-1">
                    {isOffline ? (
                      <SignalZero size={12} />
                    ) : isDegraded ? (
                      <SignalLow size={12} />
                    ) : (
                      <Signal size={12} />
                    )}
                    {statusLabel(camera.status)}
                  </span>
                  <span className="opacity-40">·</span>
                  <span className="mono tabular-nums">{uptime}</span>
                  <span className="opacity-40">·</span>
                  <span className="mono tabular-nums text-[color:var(--text-h)]">
                    {Math.round(camera.aiConfidence)}% AI
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </motion.div>

      <motion.p variants={staggerItem} className="text-center text-[11px] text-[color:var(--text-muted)]">
        Tip: click a feed to open its detail page, or press Ctrl+K and search a camera name.
      </motion.p>
    </motion.div>
  )
}

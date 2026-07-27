import { memo, useMemo } from 'react'
import { MapPin, Signal, SignalLow, SignalZero, Video } from 'lucide-react'
import { useCameraStore } from '../../../store/cameraStore'
import { formatDuration, useNow } from '../../../hooks/useNow'
import { Badge } from '../../../components/ui/badge'
import { StatusDot } from '../../../components/ui/status-dot'
import { cn } from '../../../lib/cn'
import type { CameraStatus } from '../../../types/domain'

function statusTone(status: CameraStatus): 'success' | 'warning' | 'danger' | 'info' {
  if (status === 'online') return 'success'
  if (status === 'recording') return 'info'
  if (status === 'degraded') return 'warning'
  return 'danger'
}

function statusLabel(status: CameraStatus) {
  if (status === 'recording') return 'Recording'
  if (status === 'degraded') return 'Degraded'
  if (status === 'offline') return 'Offline'
  return 'Online'
}

const CameraCard = memo(function CameraCard({
  id,
  name,
  zone,
  status,
  aiConfidence,
  statusChangedAt,
  now,
}: {
  id: string
  name: string
  zone: string
  status: CameraStatus
  aiConfidence: number
  statusChangedAt: number
  now: number
}) {
  const uptime = formatDuration(Math.max(0, now - statusChangedAt))
  const confidencePct = Math.min(100, Math.max(0, aiConfidence))
  const isOffline = status === 'offline'
  const isDegraded = status === 'degraded'
  const isRecording = status === 'recording'
  const isLive = status === 'online' || isRecording

  return (
    <article
      className={cn(
        'group flex min-h-[210px] shrink-0 flex-col overflow-hidden rounded-xl border bg-[color:var(--surface-muted)]/45 transition duration-300 ease-out',
        isOffline
          ? 'border-rose-500/25 hover:border-rose-500/40'
          : isDegraded
            ? 'border-amber-500/25 hover:border-amber-500/40'
            : 'border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-sm)]',
      )}
      aria-label={`Camera ${name}`}
    >
      <div
        className={cn(
          'camera-preview relative flex aspect-[16/10] flex-col justify-between overflow-hidden p-2',
          isOffline && 'camera-preview--offline',
          isDegraded && 'camera-preview--degraded',
        )}
      >
        {/* HUD corner brackets */}
        <span className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t border-white/35" aria-hidden="true" />
        <span className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t border-white/35" aria-hidden="true" />
        <span className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l border-white/35" aria-hidden="true" />
        <span className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b border-r border-white/35" aria-hidden="true" />

        {isLive ? <span className="camera-scanline" aria-hidden="true" /> : null}

        {isOffline ? (
          <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-1 bg-black/45">
            <span className="mono text-[10px] font-semibold tracking-[0.18em] text-rose-200/90">NO SIGNAL</span>
          </div>
        ) : null}

        <div className="relative z-[2] flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Badge
              tone={isOffline ? 'danger' : isRecording ? 'info' : 'success'}
              className="border-white/10 bg-black/35 text-white backdrop-blur-sm"
            >
              <StatusDot
                status={isOffline ? 'offline' : isDegraded ? 'degraded' : 'live'}
                pulse={isLive}
              />
              {isOffline ? 'OFF' : isRecording ? 'REC' : 'LIVE'}
            </Badge>
            {isDegraded ? (
              <Badge tone="warning" className="border-white/10 bg-black/35 text-amber-100 backdrop-blur-sm">
                Weak
              </Badge>
            ) : null}
          </div>
          <span className="mono rounded-md bg-black/35 px-1.5 py-0.5 text-[9px] text-white/70 backdrop-blur-sm">
            {id.replace('cam_', 'CH-').toUpperCase()}
          </span>
        </div>

        <div className="relative z-[2] flex items-end justify-between gap-2">
          <span className="inline-flex max-w-[70%] items-center gap-1 truncate rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] text-white/85 backdrop-blur-sm">
            <MapPin size={10} className="shrink-0 opacity-70" aria-hidden="true" />
            <span className="truncate">{zone}</span>
          </span>
          <span className="mono rounded-md bg-black/35 px-1.5 py-0.5 text-[9px] tabular-nums text-white/65 backdrop-blur-sm">
            {confidencePct.toFixed(0)}% AI
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-[12px] font-semibold tracking-tight text-[color:var(--text-h)]">{name}</div>
            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-[color:var(--text-muted)]">
              {isOffline ? (
                <SignalZero size={11} aria-hidden="true" />
              ) : isDegraded ? (
                <SignalLow size={11} aria-hidden="true" />
              ) : (
                <Signal size={11} aria-hidden="true" />
              )}
              <span className="truncate">{statusLabel(status)}</span>
              <span className="opacity-40">·</span>
              <span className="mono tabular-nums">{uptime}</span>
            </div>
          </div>
          <Badge tone={statusTone(status)} className="shrink-0 capitalize">
            {status}
          </Badge>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-[10px] text-[color:var(--text-muted)]">
            <span>AI confidence</span>
            <span className="mono tabular-nums text-[color:var(--text-h)]">{confidencePct.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500 ease-out',
                isOffline
                  ? 'bg-rose-500/70'
                  : confidencePct >= 85
                    ? 'bg-emerald-500'
                    : confidencePct >= 70
                      ? 'bg-amber-500'
                      : 'bg-rose-500',
              )}
              style={{ width: `${isOffline ? Math.min(confidencePct, 35) : confidencePct}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  )
})

export function CamerasWidget() {
  const cameras = useCameraStore((s) => s.cameras)
  const now = useNow(1000)
  const visible = cameras.slice(0, 6)

  const counts = useMemo(() => {
    const next = { online: 0, recording: 0, degraded: 0, offline: 0 }
    for (const cam of cameras) {
      next[cam.status] += 1
    }
    return next
  }, [cameras])

  return (
    <div className="flex h-full min-h-0 flex-col" aria-label="Cameras widget">
      <div className="mb-2.5 flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-[color:var(--text-muted)]">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[color:var(--accent-bg)] text-[color:var(--accent)]">
            <Video size={12} aria-hidden="true" />
          </span>
          <span>
            <span className="font-medium text-[color:var(--text-h)]">{visible.length}</span> of {cameras.length}{' '}
            feeds
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <Badge tone="success" className="gap-1 normal-case tracking-normal">
            <StatusDot status="live" pulse />
            {counts.online + counts.recording}
          </Badge>
          {counts.degraded > 0 ? (
            <Badge tone="warning" className="normal-case tracking-normal">
              {counts.degraded} weak
            </Badge>
          ) : null}
          {counts.offline > 0 ? (
            <Badge tone="danger" className="normal-case tracking-normal">
              {counts.offline} off
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="widget-scroll grid min-h-0 flex-1 grid-cols-1 gap-2.5 overflow-auto sm:grid-cols-2 xl:grid-cols-2">
        {visible.map((camera) => (
          <CameraCard key={camera.id} {...camera} now={now} />
        ))}
      </div>
    </div>
  )
}

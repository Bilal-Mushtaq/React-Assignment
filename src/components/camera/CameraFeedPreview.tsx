import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  getCameraFeedLabel,
  getCameraFeedSrc,
  getCameraFeedSrcSet,
  type CameraFeedSize,
} from '../../constants/cameraFeeds'
import { cn } from '../../lib/cn'
import type { CameraStatus } from '../../types/domain'

type Phase = 'connecting' | 'ready' | 'error'

type CameraFeedPreviewProps = {
  cameraId: string
  status: CameraStatus
  size?: CameraFeedSize
  /** Eager load for above-the-fold / hero feeds */
  priority?: boolean
  showCorners?: boolean
  showScanline?: boolean
  className?: string
  children?: ReactNode
}

export function CameraFeedPreview({
  cameraId,
  status,
  size = 'md',
  priority = false,
  showCorners = true,
  showScanline = true,
  className,
  children,
}: CameraFeedPreviewProps) {
  const [phase, setPhase] = useState<Phase>('connecting')
  const imgRef = useRef<HTMLImageElement | null>(null)
  const connectStarted = useRef(Date.now())
  const readyTimer = useRef<number | null>(null)
  const failTimer = useRef<number | null>(null)
  const settled = useRef(false)

  const isOffline = status === 'offline'
  const isDegraded = status === 'degraded'
  const isLive = status === 'online' || status === 'recording'
  const src = getCameraFeedSrc(cameraId, size)
  const srcSet = getCameraFeedSrcSet(cameraId, size)
  const label = getCameraFeedLabel(cameraId)

  const clearTimers = () => {
    if (readyTimer.current !== null) {
      window.clearTimeout(readyTimer.current)
      readyTimer.current = null
    }
    if (failTimer.current !== null) {
      window.clearTimeout(failTimer.current)
      failTimer.current = null
    }
  }

  const markReady = () => {
    if (settled.current) return
    settled.current = true
    clearTimers()
    const minHold = 720
    const wait = Math.max(0, minHold - (Date.now() - connectStarted.current))
    readyTimer.current = window.setTimeout(() => setPhase('ready'), wait)
  }

  const markError = () => {
    if (settled.current) return
    settled.current = true
    clearTimers()
    setPhase('error')
  }

  useEffect(() => {
    settled.current = false
    connectStarted.current = Date.now()
    setPhase('connecting')

    // Cached images often skip onLoad after Strict Mode remount — poll complete.
    const syncCached = () => {
      const img = imgRef.current
      if (img && img.complete && img.naturalWidth > 0) markReady()
    }
    const raf = window.requestAnimationFrame(syncCached)
    const poll = window.setInterval(syncCached, 120)

    // Never hang on "Acquiring feed" if the network stalls
    failTimer.current = window.setTimeout(() => {
      const img = imgRef.current
      if (img && img.complete && img.naturalWidth > 0) markReady()
      else markError()
    }, 8000)

    return () => {
      window.cancelAnimationFrame(raf)
      window.clearInterval(poll)
      clearTimers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-arm when source changes
  }, [cameraId, src])

  return (
    <div
      className={cn(
        'camera-feed',
        isOffline && 'camera-feed--offline',
        isDegraded && 'camera-feed--degraded',
        phase === 'ready' && 'camera-feed--ready',
        className,
      )}
      data-status={status}
      data-phase={phase}
    >
      <div className="camera-feed__base" aria-hidden="true" />

      {phase === 'connecting' ? (
        <div className="camera-feed__connecting" aria-live="polite">
          <div className="camera-feed__shimmer" aria-hidden="true" />
          <div className="camera-feed__connect-ui">
            <span className="camera-feed__pulse-ring" aria-hidden="true" />
            <span className="camera-feed__connect-label mono">Acquiring feed</span>
            <span className="camera-feed__connect-bars" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>
        </div>
      ) : null}

      {phase === 'error' ? (
        <div className="camera-feed__connecting">
          <span className="camera-feed__connect-label mono">Feed unavailable</span>
        </div>
      ) : null}

      <img
        ref={imgRef}
        key={src}
        src={src}
        srcSet={srcSet || undefined}
        sizes={
          size === 'hero'
            ? '(max-width: 1024px) 100vw, 60vw'
            : size === 'lg'
              ? '(max-width: 640px) 100vw, 50vw'
              : '(max-width: 640px) 100vw, 360px'
        }
        alt=""
        role="presentation"
        decoding="async"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        draggable={false}
        onLoad={markReady}
        onError={markError}
        className={cn(
          'camera-feed__img',
          phase === 'ready' && 'is-visible',
          isLive && phase === 'ready' && 'camera-feed__img--live',
        )}
      />

      <div className="camera-feed__glass" aria-hidden="true" />
      {showScanline && isLive && phase === 'ready' ? (
        <span className="camera-scanline" aria-hidden="true" />
      ) : null}

      {showCorners ? (
        <>
          <span className="camera-feed__corner camera-feed__corner--tl" aria-hidden="true" />
          <span className="camera-feed__corner camera-feed__corner--tr" aria-hidden="true" />
          <span className="camera-feed__corner camera-feed__corner--bl" aria-hidden="true" />
          <span className="camera-feed__corner camera-feed__corner--br" aria-hidden="true" />
        </>
      ) : null}

      {isOffline && phase === 'ready' ? (
        <div className="camera-feed__nosignal">
          <span className="mono text-[10px] font-semibold tracking-[0.2em] text-rose-200/90 sm:text-[11px]">
            NO SIGNAL
          </span>
          <span className="mt-1 max-w-[14rem] text-center text-[10px] text-white/55">
            Last frame retained · {label}
          </span>
        </div>
      ) : null}

      {isDegraded && phase === 'ready' && !isOffline ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-0.5 overflow-hidden">
          <span className="camera-feed__degrade-bar" />
        </div>
      ) : null}

      <div className="camera-feed__chrome">{children}</div>
    </div>
  )
}

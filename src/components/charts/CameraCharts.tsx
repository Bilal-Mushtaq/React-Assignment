import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useId, useMemo, useState } from 'react'
import { cn } from '../../lib/cn'
import { easeOutSoft } from '../../lib/motion'

type SeverityKey = 'critical' | 'high' | 'medium' | 'low'

const SEVERITY_META: Record<SeverityKey, { label: string; color: string }> = {
  critical: { label: 'Urgent', color: 'var(--danger)' },
  high: { label: 'Important', color: 'var(--warning)' },
  medium: { label: 'Notice', color: 'var(--info)' },
  low: { label: 'Info', color: 'var(--accent)' },
}

export function AlertSeverityBars({
  counts,
  className,
}: {
  counts: Record<SeverityKey, number>
  className?: string
}) {
  const total = Math.max(1, Object.values(counts).reduce((a, b) => a + b, 0))
  const reduced = useReducedMotion()
  const [active, setActive] = useState<SeverityKey | null>(null)
  const entries = (Object.keys(SEVERITY_META) as SeverityKey[]).map((key) => ({
    key,
    ...SEVERITY_META[key],
    value: counts[key] ?? 0,
  }))

  return (
    <div className={cn('flex h-full flex-col justify-end gap-3', className)} aria-label="Alert mix chart">
      {entries.map((row, i) => {
        const pct = Math.round((row.value / total) * 100)
        const isActive = active === row.key
        return (
          <button
            key={row.key}
            type="button"
            className="group space-y-1.5 text-left focus-ring rounded-lg"
            onMouseEnter={() => setActive(row.key)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(row.key)}
            onBlur={() => setActive(null)}
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className={cn('font-medium', isActive ? 'text-[color:var(--text-h)]' : 'text-[color:var(--text)]')}>
                {row.label}
              </span>
              <span className="mono tabular-nums text-[color:var(--text-muted)]">
                {row.value}
                <span className="ml-1 opacity-60">({pct}%)</span>
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[color:var(--border)]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: row.color }}
                initial={reduced ? false : { width: 0 }}
                animate={{
                  width: `${pct}%`,
                  filter: isActive ? 'brightness(1.15)' : 'brightness(1)',
                }}
                transition={{ duration: 0.55, delay: i * 0.06, ease: easeOutSoft }}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}

export function ConfidenceSparkline({
  value,
  offline,
  className,
}: {
  value: number
  offline?: boolean
  className?: string
}) {
  const reduced = useReducedMotion()
  const gradId = useId()
  const [hover, setHover] = useState<number | null>(null)

  const points = useMemo(() => {
    const target = offline ? Math.min(value, 18) : value
    const seed = Math.max(8, target)
    return Array.from({ length: 16 }, (_, i) => {
      const wave = Math.sin(i * 0.85) * 5 + Math.cos(i * 0.32) * 3
      const drift = ((i - 15) / 15) * 7
      return Math.max(4, Math.min(99, seed + wave + drift))
    })
  }, [value, offline])

  const w = 400
  const h = 140
  const padX = 6
  const padY = 10
  const min = Math.min(...points)
  const max = Math.max(...points)
  const span = Math.max(1, max - min)

  const coords = points.map((p, i) => {
    const x = padX + (i / (points.length - 1)) * (w - padX * 2)
    const y = h - padY - ((p - min) / span) * (h - padY * 2)
    return { x, y, value: Math.round(p) }
  })

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
  const area = `${line} L${coords[coords.length - 1]!.x},${h} L${coords[0]!.x},${h} Z`
  const stroke = offline
    ? 'var(--danger)'
    : value >= 85
      ? 'var(--success)'
      : value >= 70
        ? 'var(--warning)'
        : 'var(--danger)'

  const active = hover !== null ? coords[hover]! : coords[coords.length - 1]!

  return (
    <div
      className={cn('relative flex h-full min-h-[7.5rem] w-full flex-col', className)}
      aria-label="AI certainty trend"
      onMouseLeave={() => setHover(null)}
    >
      <AnimatePresence>
        {hover !== null ? (
          <motion.div
            key={hover}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute left-0 right-0 top-0 z-[2] flex justify-center"
          >
            <span className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--text-h)] shadow-[var(--shadow-sm)]">
              Reading {active.value}%
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="mt-auto h-full min-h-[7.5rem] w-full flex-1"
        role="img"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.4" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={padX}
            x2={w - padX}
            y1={padY + t * (h - padY * 2)}
            y2={padY + t * (h - padY * 2)}
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="4 6"
            opacity="0.7"
          />
        ))}

        <motion.path
          d={area}
          fill={`url(#${gradId})`}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke={stroke}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          initial={reduced ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: easeOutSoft }}
        />

        {coords.map((c, i) => (
          <g key={i}>
            <circle
              cx={c.x}
              cy={c.y}
              r="14"
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
            />
            <motion.circle
              cx={c.x}
              cy={c.y}
              r={hover === i ? 5.5 : i === coords.length - 1 ? 4.5 : 0}
              fill={stroke}
              initial={false}
              animate={{ r: hover === i ? 5.5 : i === coords.length - 1 ? 4.5 : hover === null ? 0 : 2.5 }}
              transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            />
          </g>
        ))}
      </svg>
    </div>
  )
}

export function ActivityVolumeBars({
  values,
  className,
}: {
  values: number[]
  className?: string
}) {
  const reduced = useReducedMotion()
  const max = Math.max(1, ...values)
  const [active, setActive] = useState<number | null>(null)

  return (
    <div className={cn('relative flex h-full min-h-[7.5rem] flex-col', className)} aria-label="Recent activity volume">
      {/* Fixed overlay slot — never changes card height on hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex h-5 items-center justify-center">
        <AnimatePresence mode="wait">
          {active !== null ? (
            <motion.span
              key={active}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.15 }}
              className="rounded-md border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--text-h)] shadow-[var(--shadow-sm)]"
            >
              Slot {active + 1}: {values[active]} event{values[active] === 1 ? '' : 's'}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="mt-auto flex min-h-[6.5rem] flex-1 items-end gap-1.5 pt-6">
        {values.map((v, i) => {
          const pct = Math.max(10, (v / max) * 100)
          const isActive = active === i
          return (
            <motion.button
              key={i}
              type="button"
              className="group relative flex h-full min-h-[6.5rem] flex-1 items-end rounded-t-md focus-ring"
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              aria-label={`Time slot ${i + 1}: ${v} events`}
            >
              <motion.div
                className={cn(
                  'relative w-full overflow-hidden rounded-t-md',
                  isActive ? 'bg-[color:var(--accent)]' : 'bg-[color:var(--accent)]/55',
                )}
                initial={reduced ? false : { height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 0.45, delay: i * 0.035, ease: easeOutSoft }}
                style={{ transformOrigin: 'bottom' }}
                whileHover={reduced ? undefined : { filter: 'brightness(1.12)' }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.28),transparent_55%)] opacity-70" />
              </motion.div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

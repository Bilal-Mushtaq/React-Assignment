import { Fragment, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Footprints,
  PieChart,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { TrafficSkeleton } from '../components/common/PageSkeletons'
import { Badge } from '../components/ui/badge'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { usePageReady } from '../hooks/usePageReady'
import { SITE } from '../constants/mockData'
import { buildZoneTraffic } from '../features/traffic/zoneTraffic'
import { useAnalyticsStore } from '../store/analyticsStore'
import { cn } from '../lib/cn'
import { easeOutSoft, staggerContainer, staggerItem } from '../lib/motion'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function formatHour(hour: number) {
  const suffix = hour < 12 ? 'AM' : 'PM'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h}:00 ${suffix}`
}

function formatHourShort(hour: number) {
  const suffix = hour < 12 ? 'a' : 'p'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h}${suffix}`
}

function intensityLabel(pct: number) {
  if (pct >= 75) return 'Packed'
  if (pct >= 45) return 'Busy'
  if (pct >= 20) return 'Steady'
  if (pct > 0) return 'Light'
  return 'Quiet'
}

function colorMixPct(value: number, max: number) {
  if (max <= 0 || value <= 0) return 0
  return Math.round(12 + Math.sqrt(value / max) * 72)
}

function estimateVisitors(score: number) {
  return Math.round(score * 18)
}

function ChartTip({
  show,
  placement = 'above',
  children,
}: {
  show: boolean
  placement?: 'above' | 'below'
  children: ReactNode
}) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.span
          initial={{ opacity: 0, y: placement === 'above' ? 6 : -6, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: placement === 'above' ? 4 : -4, scale: 0.96 }}
          transition={{ duration: 0.16, ease: easeOutSoft }}
          className={cn(
            'pointer-events-none absolute left-1/2 z-30 w-max max-w-[12rem] -translate-x-1/2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-2.5 py-1.5 text-left shadow-[var(--shadow-md)]',
            placement === 'above' ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          {children}
        </motion.span>
      ) : null}
    </AnimatePresence>
  )
}

function KpiCard({
  label,
  value,
  suffix,
  hint,
  icon: Icon,
  delay = 0,
}: {
  label: string
  value: number
  suffix?: string
  hint: string
  icon: typeof Users
  delay?: number
}) {
  const animated = useAnimatedNumber(value, 1000 + delay * 80)
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: delay * 0.07, ease: easeOutSoft }}
      className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-elevated)_92%,transparent)] p-4 shadow-[var(--shadow-sm)] [background-image:linear-gradient(165deg,var(--highlight),transparent_55%)]"
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[color:var(--accent)]/10 blur-2xl"
        aria-hidden="true"
      />
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--accent-bg)] text-[color:var(--accent)]">
          <Icon size={16} aria-hidden="true" />
        </div>
        <Badge tone="accent" className="normal-case tracking-normal">
          Live
        </Badge>
      </div>
      <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
        {label}
      </div>
      <div className="mt-1 mono text-2xl font-bold tabular-nums tracking-tight text-[color:var(--text-h)] sm:text-3xl">
        {animated.toLocaleString()}
        {suffix ? <span className="ml-1 text-base font-semibold text-[color:var(--text-muted)]">{suffix}</span> : null}
      </div>
      <p className="mt-1 text-[11px] text-[color:var(--text-muted)]">{hint}</p>
    </motion.div>
  )
}

export default function TrafficRoute() {
  const ready = usePageReady('traffic', 420)
  const series = useAnalyticsStore((s) => s.visitorSeries)
  const heatmap = useAnalyticsStore((s) => s.heatmap)
  const reduced = useReducedMotion()

  const seriesTotal = useMemo(() => series.reduce((a, b) => a + b, 0), [series])
  const peak = Math.max(...series, 0)
  const peakIdx = series.indexOf(peak)
  const seriesMax = Math.max(1, ...series)
  const liveRate = series[series.length - 1] ?? 0

  const weekdayTotals = useMemo(
    () =>
      heatmap.map((row, day) => ({
        day,
        label: DAY_LABELS[day]!,
        full: DAY_FULL[day]!,
        total: row.reduce((a, v) => a + estimateVisitors(v), 0),
      })),
    [heatmap],
  )
  const weekdayMax = Math.max(1, ...weekdayTotals.map((d) => d.total))
  const weekdayWeekTotal = useMemo(
    () => weekdayTotals.reduce((a, d) => a + d.total, 0),
    [weekdayTotals],
  )
  const busiestDay = weekdayTotals.reduce((best, d) => (d.total > best.total ? d : best), weekdayTotals[0]!)

  const zones = useMemo(() => buildZoneTraffic(seriesTotal), [seriesTotal])
  const zoneMax = Math.max(1, ...zones.map((z) => z.visitors))

  const heatmapMax = Math.max(0, ...heatmap.flat())

  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number } | null>(null)

  if (!ready) return <TrafficSkeleton />

  return (
    <motion.div
      className="space-y-5 pb-10"
      aria-label="Mall traffic"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Hero */}
      <motion.header
        variants={staggerItem}
        className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] p-5 shadow-[var(--shadow-md)] sm:p-6"
        style={{
          background:
            'linear-gradient(135deg, color-mix(in srgb, var(--accent) 18%, var(--surface-elevated)), var(--surface-elevated) 55%, color-mix(in srgb, var(--info) 10%, var(--surface-elevated)))',
        }}
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-[color:var(--accent)]/20 blur-3xl"
          animate={reduced ? undefined : { x: [0, 24, 0], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 bottom-0 h-36 w-36 rounded-full bg-[color:var(--info)]/15 blur-3xl"
          animate={reduced ? undefined : { y: [0, -16, 0], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
              <Sparkles size={12} className="text-[color:var(--accent)]" />
              {SITE.name}
            </div>
            <h2 className="mt-1.5 flex items-center gap-2.5 text-2xl font-bold tracking-tight text-[color:var(--text-h)] sm:text-3xl">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--accent-bg)] text-[color:var(--accent)] shadow-[var(--shadow-sm)]">
                <PieChart size={18} />
              </span>
              Mall Traffic
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-[color:var(--text-muted)]">
              {SITE.short} visitor intelligence — hourly footfall, zone mix, and when the mall runs hottest.
            </p>
          </div>
          <Badge tone="accent" className="gap-1.5 normal-case tracking-normal">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--accent)] opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--accent)]" />
            </span>
            Live estimates
          </Badge>
        </div>
      </motion.header>

      {/* KPI strip */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Visitors today"
          value={seriesTotal}
          hint="Estimated footfall across the last 24 hours"
          icon={Users}
          delay={0}
        />
        <KpiCard
          label="Peak hour"
          value={peak}
          suffix={`/ ${formatHourShort(peakIdx)}`}
          hint="Highest hourly count in this window"
          icon={TrendingUp}
          delay={1}
        />
        <KpiCard
          label="Live rate"
          value={liveRate}
          suffix="/hr"
          hint="Latest rolling visitor estimate"
          icon={Footprints}
          delay={2}
        />
        <KpiCard
          label="Busiest day"
          value={busiestDay?.total ?? 0}
          suffix={busiestDay ? `· ${busiestDay.label}` : undefined}
          hint="Highest day total from the week map"
          icon={Clock3}
          delay={3}
        />
      </div>

      {/* Visitors / hour — hero chart */}
      <motion.section
        variants={staggerItem}
        className="rounded-2xl border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-elevated)_94%,transparent)] p-4 shadow-[var(--shadow-sm)] sm:p-5"
      >
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-[color:var(--text-h)]">
              Visitors / hour
            </h3>
            <p className="text-xs text-[color:var(--text-muted)]">
              Last 24 hours · hover a bar for the exact count
            </p>
          </div>
          <AnimatePresence mode="wait">
            {hoveredBar !== null ? (
              <motion.div
                key="hover"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="mono text-right text-xs text-[color:var(--text-h)]"
              >
                <span className="text-lg font-bold text-[color:var(--accent)]">
                  {series[hoveredBar]?.toLocaleString()}
                </span>
                <span className="text-[color:var(--text-muted)]"> visitors</span>
                <span className="text-[color:var(--text-muted)]"> · {formatHour(hoveredBar)}</span>
              </motion.div>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-[color:var(--text-muted)]"
              >
                Peak {peak.toLocaleString()} visitors · {formatHourShort(peakIdx)}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div
          className="flex h-52 items-end gap-1 overflow-visible sm:h-64 sm:gap-1.5"
          onMouseLeave={() => setHoveredBar(null)}
        >
          {series.map((value, idx) => {
            const height = Math.max(8, (value / seriesMax) * 100)
            const active = hoveredBar === idx
            const dimmed = hoveredBar !== null && !active
            const isPeak = idx === peakIdx
            const share = seriesTotal === 0 ? 0 : Math.round((value / seriesTotal) * 100)
            return (
              <motion.button
                key={idx}
                type="button"
                initial={reduced ? false : { scaleY: 0, opacity: 0 }}
                animate={{
                  scaleY: 1,
                  opacity: dimmed ? 0.35 : 1,
                  height: `${height}%`,
                }}
                transition={{
                  scaleY: { duration: 0.55, delay: idx * 0.018, ease: easeOutSoft },
                  height: { duration: 0.35, ease: easeOutSoft },
                  opacity: { duration: 0.2 },
                }}
                whileHover={reduced ? undefined : { scaleX: 1.15 }}
                onMouseEnter={() => setHoveredBar(idx)}
                onFocus={() => setHoveredBar(idx)}
                className={cn(
                  'relative origin-bottom flex-1 rounded-t-md outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]',
                  active || isPeak
                    ? 'z-10 bg-[color:var(--accent)] shadow-[0_0_20px_var(--accent-glow)]'
                    : 'bg-[color:var(--accent)]/70 hover:bg-[color:var(--accent)]',
                )}
                aria-label={`${formatHour(idx)}: ${value.toLocaleString()} visitors, ${share}% of day${isPeak ? ', peak hour' : ''}`}
              >
                <ChartTip show={active}>
                  <div className="text-[10px] font-semibold text-[color:var(--text-h)]">
                    {formatHour(idx)}
                    {isPeak ? (
                      <span className="ml-1.5 rounded bg-[color:var(--accent-bg)] px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-[color:var(--accent)]">
                        Peak
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 text-[10px] text-[color:var(--text-muted)]">
                    <span className="mono font-semibold text-[color:var(--accent)]">
                      {value.toLocaleString()}
                    </span>{' '}
                    visitors
                    <span className="mx-1 opacity-40">·</span>
                    {share}% of day
                  </div>
                </ChartTip>
              </motion.button>
            )
          })}
        </div>
        <div className="mt-2 flex justify-between text-[9px] tabular-nums text-[color:var(--text-muted)] sm:text-[10px]">
          <span>12a</span>
          <span>6a</span>
          <span>12p</span>
          <span>6p</span>
          <span>11p</span>
        </div>
      </motion.section>

      {/* Zone flow + weekday */}
      <div className="grid gap-4 lg:grid-cols-5">
        <motion.section
          variants={staggerItem}
          className="rounded-2xl border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-elevated)_94%,transparent)] p-4 shadow-[var(--shadow-sm)] sm:p-5 lg:col-span-3"
        >
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-[color:var(--text-h)]">
                Zone mix
              </h3>
              <p className="text-xs text-[color:var(--text-muted)]">
                Share of footfall by area · open a camera from any zone
              </p>
            </div>
          </div>
          <div className="space-y-2.5">
            {zones.slice(0, 8).map((zone, i) => {
              const active = hoveredZone === zone.zone
              const dimmed = hoveredZone !== null && !active
              const width = (zone.visitors / zoneMax) * 100
              return (
                <motion.div
                  key={zone.zone}
                  initial={reduced ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: dimmed ? 0.4 : 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4, ease: easeOutSoft }}
                  onMouseEnter={() => setHoveredZone(zone.zone)}
                  onMouseLeave={() => setHoveredZone(null)}
                  className="group relative"
                >
                  <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                    <Link
                      to={`/cameras/${zone.cameraId}`}
                      className="inline-flex min-w-0 items-center gap-1 font-medium text-[color:var(--text-h)] hover:underline"
                      aria-label={`${zone.zone}: ${zone.visitors.toLocaleString()} visitors, ${zone.share}% of mall · open camera`}
                    >
                      <span className="truncate">{zone.zone}</span>
                      <ArrowUpRight size={11} className="shrink-0 opacity-0 transition group-hover:opacity-70" />
                    </Link>
                    <span className="mono shrink-0 tabular-nums text-[color:var(--text-muted)]">
                      {zone.visitors.toLocaleString()} · {zone.share}%
                    </span>
                  </div>
                  <div className="relative">
                    <div className="h-2.5 overflow-hidden rounded-full bg-[color:var(--border)]">
                      <motion.div
                        className="h-full rounded-full bg-[color:var(--accent)]"
                        initial={reduced ? false : { width: 0 }}
                        animate={{
                          width: `${width}%`,
                          filter: active ? 'brightness(1.2)' : 'brightness(1)',
                        }}
                        transition={{ duration: 0.65, delay: 0.15 + i * 0.05, ease: easeOutSoft }}
                      />
                    </div>
                    <ChartTip show={active} placement="above">
                      <div className="text-[10px] font-semibold text-[color:var(--text-h)]">{zone.zone}</div>
                      <div className="mt-0.5 text-[10px] text-[color:var(--text-muted)]">
                        {zone.area}
                      </div>
                      <div className="mt-1 text-[10px] text-[color:var(--text-muted)]">
                        <span className="mono font-semibold text-[color:var(--accent)]">
                          {zone.visitors.toLocaleString()}
                        </span>{' '}
                        visitors
                        <span className="mx-1 opacity-40">·</span>
                        {zone.share}% of mall
                      </div>
                    </ChartTip>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        <motion.section
          variants={staggerItem}
          className="flex flex-col rounded-2xl border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-elevated)_94%,transparent)] p-4 shadow-[var(--shadow-sm)] sm:p-5 lg:col-span-2"
        >
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-[color:var(--text-h)]">
                Weekday pulse
              </h3>
              <p className="text-xs text-[color:var(--text-muted)]">
                Sun–Sat totals · hover a day for volume
              </p>
            </div>
            <AnimatePresence mode="wait">
              {hoveredDay !== null ? (
                <motion.div
                  key="day-hover"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mono text-right text-xs text-[color:var(--text-h)]"
                >
                  <span className="font-semibold text-[color:var(--accent)]">
                    ~{weekdayTotals[hoveredDay]?.total.toLocaleString()}
                  </span>
                  <span className="text-[color:var(--text-muted)]"> visitors</span>
                  <span className="text-[color:var(--text-muted)]">
                    {' '}
                    · {weekdayTotals[hoveredDay]?.full}
                  </span>
                </motion.div>
              ) : (
                <motion.span
                  key="day-idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-[color:var(--text-muted)]"
                >
                  Lead {busiestDay?.label} · ~{busiestDay?.total.toLocaleString()} visitors
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div
            className="flex min-h-0 flex-1 items-end gap-1.5 overflow-visible sm:gap-2"
            style={{ minHeight: '13rem' }}
            onMouseLeave={() => setHoveredDay(null)}
          >
            {weekdayTotals.map((d, i) => {
              const height = Math.max(12, (d.total / weekdayMax) * 100)
              const active = hoveredDay === d.day
              const dimmed = hoveredDay !== null && !active
              const isBusy = d.day === busiestDay?.day
              const share =
                weekdayWeekTotal === 0 ? 0 : Math.round((d.total / weekdayWeekTotal) * 100)
              return (
                <motion.button
                  key={d.day}
                  type="button"
                  initial={reduced ? false : { scaleY: 0, opacity: 0 }}
                  animate={{
                    scaleY: 1,
                    opacity: dimmed ? 0.35 : 1,
                    height: `${height}%`,
                  }}
                  transition={{
                    scaleY: { duration: 0.55, delay: 0.12 + i * 0.05, ease: easeOutSoft },
                    height: { duration: 0.35, ease: easeOutSoft },
                    opacity: { duration: 0.2 },
                  }}
                  whileHover={reduced ? undefined : { scaleX: 1.08 }}
                  onMouseEnter={() => setHoveredDay(d.day)}
                  onFocus={() => setHoveredDay(d.day)}
                  className={cn(
                    'relative origin-bottom flex-1 rounded-t-md outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]',
                    active || isBusy
                      ? 'z-10 bg-[color:var(--accent)] shadow-[0_0_16px_var(--accent-glow)]'
                      : 'bg-[color:var(--accent)]/65 hover:bg-[color:var(--accent)]',
                  )}
                  aria-label={`${d.full}: about ${d.total.toLocaleString()} visitors, ${share}% of week${isBusy ? ', busiest day' : ''}`}
                >
                  <ChartTip show={active}>
                    <div className="text-[10px] font-semibold text-[color:var(--text-h)]">
                      {d.full}
                      {isBusy ? (
                        <span className="ml-1.5 rounded bg-[color:var(--accent-bg)] px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-[color:var(--accent)]">
                          Busiest
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-0.5 text-[10px] text-[color:var(--text-muted)]">
                      <span className="mono font-semibold text-[color:var(--accent)]">
                        ~{d.total.toLocaleString()}
                      </span>{' '}
                      visitors
                      <span className="mx-1 opacity-40">·</span>
                      {share}% of week
                    </div>
                  </ChartTip>
                </motion.button>
              )
            })}
          </div>
          <div className="mt-2 flex justify-between gap-1.5 px-0.5 text-[10px] font-semibold text-[color:var(--text-muted)]">
            {weekdayTotals.map((d) => (
              <span
                key={d.day}
                className={cn(
                  'flex-1 text-center',
                  (hoveredDay === d.day || d.day === busiestDay?.day) && 'text-[color:var(--accent)]',
                )}
              >
                {d.label}
              </span>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Heatmap */}
      <motion.section
        variants={staggerItem}
        className="rounded-2xl border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-elevated)_94%,transparent)] p-4 shadow-[var(--shadow-sm)] sm:p-5"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-[color:var(--text-h)]">
              Busy hours
            </h3>
            <p className="text-xs text-[color:var(--text-muted)]">
              Week × hour density · lunch and evening bands stand out
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[color:var(--text-muted)]">
            <span>Quiet</span>
            <span className="flex h-2 w-20 overflow-hidden rounded-sm">
              <span className="flex-1 bg-[color:color-mix(in_srgb,var(--accent)_12%,transparent)]" />
              <span className="flex-1 bg-[color:color-mix(in_srgb,var(--accent)_40%,transparent)]" />
              <span className="flex-1 bg-[color:color-mix(in_srgb,var(--accent)_70%,transparent)]" />
            </span>
            <span>Packed</span>
          </div>
        </div>

        <div
          className="grid min-h-[24rem] grid-cols-[36px_repeat(24,minmax(0,1fr))] grid-rows-[auto_repeat(7,minmax(32px,1fr))] gap-1.5 overflow-visible text-[9px] text-[color:var(--text-muted)] sm:min-h-[28rem]"
          onMouseLeave={() => setHoveredCell(null)}
        >
          <div />
          {Array.from({ length: 24 }).map((_, h) => (
            <div
              key={h}
              className={cn(
                'text-center tabular-nums',
                hoveredCell?.hour === h && 'font-semibold text-[color:var(--accent)]',
              )}
            >
              {h % 6 === 0 ? h : ''}
            </div>
          ))}
          {heatmap.map((row, day) => (
            <Fragment key={day}>
              <div
                className={cn(
                  'flex items-center text-[10px] font-medium',
                  hoveredCell?.day === day && 'text-[color:var(--accent)]',
                )}
              >
                {DAY_LABELS[day]}
              </div>
              {row.map((value, hour) => {
                const intensity = heatmapMax === 0 ? 0 : Math.round((value / heatmapMax) * 100)
                const mix = colorMixPct(value, heatmapMax)
                const active = hoveredCell?.day === day && hoveredCell?.hour === hour
                const dimmed = hoveredCell !== null && !active
                const visitorsEst = estimateVisitors(value)
                const level = intensityLabel(intensity)
                return (
                  <button
                    key={`${day}-${hour}`}
                    type="button"
                    onMouseEnter={() => setHoveredCell({ day, hour })}
                    onFocus={() => setHoveredCell({ day, hour })}
                    className={cn(
                      'relative min-h-[32px] rounded-[4px] outline-none transition-all duration-200',
                      'focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]',
                      active && 'z-10 scale-[1.3] rounded shadow-[0_0_10px_var(--accent-glow)]',
                      dimmed && 'opacity-35',
                    )}
                    style={{
                      backgroundColor:
                        value === 0
                          ? 'color-mix(in srgb, var(--border) 35%, transparent)'
                          : `color-mix(in srgb, var(--accent) ${mix}%, transparent)`,
                    }}
                    aria-label={`${DAY_FULL[day]} ${formatHour(hour)}: about ${visitorsEst.toLocaleString()} visitors, ${level}`}
                  >
                    <ChartTip show={active} placement={day < 3 ? 'below' : 'above'}>
                      <div className="text-[10px] font-semibold text-[color:var(--text-h)]">
                        {DAY_FULL[day]} · {formatHour(hour)}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                        <span className="mono font-semibold text-[color:var(--accent)]">
                          ~{visitorsEst.toLocaleString()}
                        </span>
                        <span className="text-[color:var(--text-muted)]">visitors</span>
                        <span className="text-[color:var(--border-strong)]">·</span>
                        <span
                          className={cn(
                            'rounded px-1 py-px text-[9px] font-semibold uppercase tracking-wide',
                            intensity >= 45
                              ? 'bg-[color:var(--accent-bg)] text-[color:var(--accent)]'
                              : 'bg-[color:var(--surface-muted)] text-[color:var(--text-muted)]',
                          )}
                        >
                          {level}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="h-1 flex-1 overflow-hidden rounded-full bg-[color:var(--border)]">
                          <span
                            className="block h-full rounded-full bg-[color:var(--accent)]"
                            style={{ width: `${intensity}%` }}
                          />
                        </span>
                        <span className="mono text-[9px] text-[color:var(--text-muted)]">{intensity}%</span>
                      </div>
                    </ChartTip>
                  </button>
                )
              })}
            </Fragment>
          ))}
        </div>
      </motion.section>

      <motion.p variants={staggerItem} className="text-center text-[11px] text-[color:var(--text-muted)]">
        Tip: open a zone’s camera for the live feed ·{' '}
        <Link to="/cameras" className="inline-flex items-center gap-0.5 font-medium text-[color:var(--accent)] hover:underline">
          All cameras
          <ArrowRight size={11} />
        </Link>
      </motion.p>
    </motion.div>
  )
}

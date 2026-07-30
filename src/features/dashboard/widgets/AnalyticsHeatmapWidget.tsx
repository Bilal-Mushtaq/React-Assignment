import { Fragment, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useAnalyticsStore } from '../../../store/analyticsStore'
import { SITE } from '../../../constants/mockData'
import { cn } from '../../../lib/cn'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type HoveredBar = { idx: number; value: number; share: number }
type HoveredCell = { day: number; hour: number; value: number; intensity: number }

function intensityLabel(pct: number) {
  if (pct >= 75) return 'Packed'
  if (pct >= 45) return 'Busy'
  if (pct >= 20) return 'Steady'
  if (pct > 0) return 'Light'
  return 'Closed / quiet'
}

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

/** Ease mid-tones so the heatmap doesn't look like a solid accent wall */
function colorMixPct(value: number, max: number) {
  if (max <= 0 || value <= 0) return 0
  const t = Math.sqrt(value / max)
  return Math.round(12 + t * 72)
}

/** Heatmap cells are a relative score — scale to a readable visitor estimate */
function estimateVisitors(score: number) {
  return Math.round(score * 18)
}

export function AnalyticsHeatmapWidget() {
  const heatmap = useAnalyticsStore((s) => s.heatmap)
  const series = useAnalyticsStore((s) => s.visitorSeries)
  const max = Math.max(0, ...heatmap.flat())
  const seriesMax = Math.max(1, ...series)
  const seriesTotal = useMemo(() => series.reduce((a, b) => a + b, 0), [series])
  const peak = Math.max(...series, 0)
  const peakIdx = series.indexOf(peak)
  const empty = max === 0 && series.every((v) => v === 0)

  const [hoveredBar, setHoveredBar] = useState<HoveredBar | null>(null)
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null)

  const busyCells = useMemo(
    () => heatmap.flat().filter((v) => v > 0).length,
    [heatmap],
  )

  return (
    <div className="flex h-full min-h-0 flex-col gap-3" aria-label="Mall visitor traffic analytics">
      <div className="flex shrink-0 items-center justify-end">
        <Link
          to="/traffic"
          className="inline-flex items-center gap-0.5 rounded-lg px-1.5 py-1 text-[10px] font-semibold text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-h)] focus-ring"
        >
          Full page
          <ArrowRight size={11} />
        </Link>
      </div>
      {empty ? (
        <div className="flex h-full min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 px-4 text-center">
          <div className="text-sm font-medium text-[color:var(--text-h)]">No traffic data yet</div>
          <p className="mt-1 text-xs text-[color:var(--text-muted)]">
            Visitor counts and busy hours will fill as {SITE.short} cameras report activity.
          </p>
        </div>
      ) : (
        <>
          <div className="relative flex min-h-[10rem] flex-[0.42] flex-col overflow-visible rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/50 p-2.5">
            <div className="mb-1.5 flex shrink-0 items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                  Visitors / hour
                </span>
                <p className="truncate text-[10px] text-[color:var(--text-muted)]">
                  {SITE.name} · last 24 hours
                </p>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                {hoveredBar ? (
                  <motion.span
                    key="bar-info"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="mono text-right text-[10px] text-[color:var(--text-h)]"
                  >
                    <span className="font-semibold text-[color:var(--accent)]">{hoveredBar.value}</span>
                    <span className="text-[color:var(--text-muted)]"> visitors</span>
                    <span className="text-[color:var(--text-muted)]"> · </span>
                    {formatHourShort(hoveredBar.idx)}
                    <span className="text-[color:var(--text-muted)]"> · </span>
                    {hoveredBar.share}% of day
                  </motion.span>
                ) : (
                  <motion.span
                    key="bar-peak"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="mono text-right text-[10px] text-[color:var(--text-muted)]"
                  >
                    busiest <span className="font-medium text-[color:var(--text-h)]">{peak}</span>
                    {peakIdx >= 0 ? (
                      <>
                        <span> @ {formatHourShort(peakIdx)}</span>
                      </>
                    ) : null}
                    <span> · Σ {seriesTotal.toLocaleString()}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div
              className="flex min-h-0 flex-1 items-end gap-0.5 px-0.5"
              onMouseLeave={() => setHoveredBar(null)}
            >
              {series.map((value, idx) => {
                const raw = seriesMax === 0 ? 0 : (value / seriesMax) * 100
                // Visual floor so small values still read as bars (UX)
                const height = value <= 0 ? 0 : Math.max(raw, 18)
                const active = hoveredBar?.idx === idx
                const dimmed = hoveredBar !== null && !active
                const share = seriesTotal === 0 ? 0 : Math.round((value / seriesTotal) * 100)
                return (
                  <motion.button
                    key={idx}
                    type="button"
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{
                      scaleY: 1,
                      opacity: dimmed ? 0.35 : 1,
                      height: `${height}%`,
                    }}
                    transition={{
                      scaleY: { duration: 0.45, delay: idx * 0.012, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.18 },
                      height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                    }}
                    whileHover={{ scaleX: 1.2 }}
                    onMouseEnter={() => setHoveredBar({ idx, value, share })}
                    onFocus={() => setHoveredBar({ idx, value, share })}
                    onBlur={() => setHoveredBar(null)}
                    className={cn(
                      'relative origin-bottom flex-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]',
                      active
                        ? 'z-10 bg-[color:var(--accent)] shadow-[0_0_12px_var(--accent-glow)]'
                        : 'bg-[color:var(--accent)]/75 hover:bg-[color:var(--accent)]',
                    )}
                    aria-label={`${formatHour(idx)}: about ${value} visitors (${share}% of the day)`}
                  >
                    <AnimatePresence>
                      {active ? (
                        <motion.span
                          initial={{ opacity: 0, y: 6, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 w-max -translate-x-1/2 rounded-md border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-2 py-1.5 text-[10px] shadow-[var(--shadow-md)]"
                        >
                          <div className="font-semibold text-[color:var(--text-h)]">{formatHour(idx)}</div>
                          <div className="mt-0.5 text-[color:var(--text-muted)]">
                            ~<span className="mono font-semibold text-[color:var(--accent)]">{value}</span>{' '}
                            visitors
                            <span className="mx-1 opacity-40">·</span>
                            {share}% of day
                          </div>
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </div>

            <div className="mt-1.5 flex justify-between px-0.5 text-[8px] tabular-nums text-[color:var(--text-muted)]">
              <span>12a</span>
              <span>6a</span>
              <span>12p</span>
              <span>6p</span>
              <span>11p</span>
            </div>
          </div>

          <div className="widget-scroll relative min-h-0 flex-[0.58] overflow-auto rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/50 p-2.5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                  Busy hours
                </span>
                <p className="truncate text-[10px] text-[color:var(--text-muted)]">
                  Week × hour · {busyCells} open slots · lunch & evening peak
                </p>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                {hoveredCell ? (
                  <motion.div
                    key="cell-info"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-wrap items-center gap-1.5 text-[10px]"
                  >
                    <span className="font-semibold text-[color:var(--text-h)]">
                      {DAY_LABELS[hoveredCell.day]} {formatHour(hoveredCell.hour)}
                    </span>
                    <span className="text-[color:var(--text-muted)]">·</span>
                    <span className="mono font-semibold text-[color:var(--accent)]">
                      ~{estimateVisitors(hoveredCell.value)}
                    </span>
                    <span
                      className={cn(
                        'rounded px-1 py-px text-[9px] font-semibold uppercase tracking-wide',
                        hoveredCell.intensity >= 45
                          ? 'bg-[color:var(--accent-bg)] text-[color:var(--accent)]'
                          : 'bg-[color:var(--surface-elevated)] text-[color:var(--text-muted)]',
                      )}
                    >
                      {intensityLabel(hoveredCell.intensity)}
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="legend"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5 text-[9px] text-[color:var(--text-muted)]"
                    aria-label="Intensity legend"
                  >
                    <span>Quiet</span>
                    <span className="flex h-2 w-16 overflow-hidden rounded-sm">
                      <span className="flex-1 bg-[color:color-mix(in_srgb,var(--accent)_12%,transparent)]" />
                      <span className="flex-1 bg-[color:color-mix(in_srgb,var(--accent)_40%,transparent)]" />
                      <span className="flex-1 bg-[color:color-mix(in_srgb,var(--accent)_70%,transparent)]" />
                    </span>
                    <span>Packed</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className="grid h-[calc(100%-2.25rem)] min-h-[11rem] grid-cols-[30px_repeat(24,minmax(0,1fr))] grid-rows-[auto_repeat(7,minmax(0,1fr))] gap-1 text-[8px] text-[color:var(--text-muted)]"
              onMouseLeave={() => setHoveredCell(null)}
            >
              <div />
              {Array.from({ length: 24 }).map((_, h) => (
                <div
                  key={h}
                  className={cn(
                    'text-center tabular-nums transition-colors duration-150',
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
                      'flex items-center text-[9px] font-medium transition-colors duration-150',
                      hoveredCell?.day === day && 'text-[color:var(--accent)]',
                    )}
                  >
                    {DAY_LABELS[day]}
                  </div>
                  {row.map((value, hour) => {
                    const intensity = max === 0 ? 0 : Math.round((value / max) * 100)
                    const mix = colorMixPct(value, max)
                    const active = hoveredCell?.day === day && hoveredCell?.hour === hour
                    const dimmed = hoveredCell !== null && !active
                    const visitorsEst = estimateVisitors(value)

                    return (
                      <button
                        key={`${day}-${hour}`}
                        type="button"
                        onMouseEnter={() => setHoveredCell({ day, hour, value, intensity })}
                        onFocus={() => setHoveredCell({ day, hour, value, intensity })}
                        onBlur={() => setHoveredCell(null)}
                        aria-label={`${DAY_FULL[day]} ${formatHour(hour)}: about ${visitorsEst} visitors, ${intensityLabel(intensity)}`}
                        className={cn(
                          'relative min-h-0 w-full rounded-[3px] outline-none transition-all duration-200 ease-out',
                          'focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--surface-muted)]',
                          active &&
                            'z-10 scale-[1.25] rounded-[4px] shadow-[0_0_10px_var(--accent-glow)] ring-1 ring-[color:var(--accent-border)]',
                          dimmed && 'opacity-35',
                        )}
                        style={{
                          backgroundColor:
                            value === 0
                              ? 'color-mix(in srgb, var(--border) 35%, transparent)'
                              : `color-mix(in srgb, var(--accent) ${mix}%, transparent)`,
                        }}
                      >
                        <AnimatePresence>
                          {active ? (
                            <motion.span
                              initial={{ opacity: 0, y: 8, scale: 0.92 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 4, scale: 0.96 }}
                              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                              className={cn(
                                'pointer-events-none absolute left-1/2 z-30 w-max -translate-x-1/2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-2.5 py-1.5 shadow-[var(--shadow-md)]',
                                day < 3 ? 'top-full mt-2' : 'bottom-full mb-2',
                              )}
                            >
                              <div className="text-[10px] font-semibold text-[color:var(--text-h)]">
                                {DAY_FULL[day]} · {formatHour(hour)}
                              </div>
                              <div className="mt-0.5 text-[10px] text-[color:var(--text-muted)]">
                                {SITE.short} foot traffic
                              </div>
                              <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                                <span className="mono font-semibold text-[color:var(--accent)]">
                                  ~{visitorsEst}
                                </span>
                                <span className="text-[color:var(--text-muted)]">visitors</span>
                                <span className="text-[color:var(--border-strong)]">·</span>
                                <span className="font-medium text-[color:var(--text-h)]">
                                  {intensityLabel(intensity)}
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
                            </motion.span>
                          ) : null}
                        </AnimatePresence>
                      </button>
                    )
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

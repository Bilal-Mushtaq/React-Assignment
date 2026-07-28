import { Fragment, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAnalyticsStore } from '../../../store/analyticsStore'
import { cn } from '../../../lib/cn'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type HoveredBar = { idx: number; value: number }
type HoveredCell = { day: number; hour: number; value: number; intensity: number }

function intensityLabel(pct: number) {
  if (pct >= 75) return 'Peak'
  if (pct >= 45) return 'High'
  if (pct >= 20) return 'Moderate'
  if (pct > 0) return 'Low'
  return 'Quiet'
}

function formatHour(hour: number) {
  const suffix = hour < 12 ? 'AM' : 'PM'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h}:00 ${suffix}`
}

export function AnalyticsHeatmapWidget() {
  const heatmap = useAnalyticsStore((s) => s.heatmap)
  const series = useAnalyticsStore((s) => s.eventRateSeries)
  const max = Math.max(0, ...heatmap.flat())
  const seriesMax = Math.max(0, ...series)
  const peak = Math.max(...series, 0)
  const empty = max === 0 && seriesMax === 0

  const [hoveredBar, setHoveredBar] = useState<HoveredBar | null>(null)
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null)

  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5" aria-label="Analytics and heatmap widget">
      {empty ? (
        <div className="flex h-full min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 px-4 text-center">
          <div className="text-sm font-medium text-[color:var(--text-h)]">No analytics yet</div>
          <p className="mt-1 text-xs text-[color:var(--text-muted)]">Event rate and density will fill as the engine runs.</p>
        </div>
      ) : (
        <>
          <div className="relative shrink-0 overflow-visible rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/50 p-2.5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                Event rate
              </span>
              <AnimatePresence mode="wait" initial={false}>
                {hoveredBar ? (
                  <motion.span
                    key="bar-info"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="mono text-[10px] text-[color:var(--text-h)]"
                  >
                    Slot {hoveredBar.idx + 1}
                    <span className="text-[color:var(--text-muted)]"> · </span>
                    <span className="font-semibold text-[color:var(--accent)]">{hoveredBar.value}</span>
                    <span className="text-[color:var(--text-muted)]"> events</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="bar-peak"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="mono text-[10px] text-[color:var(--text-muted)]"
                  >
                    peak <span className="font-medium text-[color:var(--text-h)]">{peak}</span> · 24h
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="flex h-14 items-end gap-0.5" onMouseLeave={() => setHoveredBar(null)}>
              {series.map((value, idx) => {
                const height = seriesMax === 0 ? 0 : (value / seriesMax) * 100
                const active = hoveredBar?.idx === idx
                const dimmed = hoveredBar !== null && !active
                return (
                  <motion.button
                    key={idx}
                    type="button"
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{
                      scaleY: 1,
                      opacity: dimmed ? 0.35 : 1,
                      height: `${Math.max(height, value > 0 ? 4 : 0)}%`,
                    }}
                    transition={{
                      scaleY: { duration: 0.45, delay: idx * 0.012, ease: [0.16, 1, 0.3, 1] },
                      opacity: { duration: 0.18 },
                      height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                    }}
                    whileHover={{ scaleY: 1.08, scaleX: 1.35 }}
                    onMouseEnter={() => setHoveredBar({ idx, value })}
                    onFocus={() => setHoveredBar({ idx, value })}
                    onBlur={() => setHoveredBar(null)}
                    className={cn(
                      'relative origin-bottom flex-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]',
                      active
                        ? 'z-10 bg-[color:var(--accent)] shadow-[0_0_12px_var(--accent-glow)]'
                        : 'bg-[color:var(--accent)]/75 hover:bg-[color:var(--accent)]',
                    )}
                    style={{ minHeight: value > 0 ? 2 : 0 }}
                    aria-label={`Event rate slot ${idx + 1}: ${value} events`}
                  >
                    <AnimatePresence>
                      {active ? (
                        <motion.span
                          initial={{ opacity: 0, y: 6, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-2 py-1 text-[10px] shadow-[var(--shadow-md)]"
                        >
                          <span className="font-semibold text-[color:var(--text-h)]">{value}</span>
                          <span className="text-[color:var(--text-muted)]"> events</span>
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div className="widget-scroll relative min-h-0 flex-1 overflow-auto rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/50 p-2.5">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                Density heatmap
              </span>
              <AnimatePresence mode="wait" initial={false}>
                {hoveredCell ? (
                  <motion.div
                    key="cell-info"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5 text-[10px]"
                  >
                    <span className="font-semibold text-[color:var(--text-h)]">
                      {DAY_LABELS[hoveredCell.day]} {formatHour(hoveredCell.hour)}
                    </span>
                    <span className="text-[color:var(--text-muted)]">·</span>
                    <span className="mono font-semibold text-[color:var(--accent)]">{hoveredCell.value}</span>
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
                    <span>Low</span>
                    <span className="flex h-2 w-16 overflow-hidden rounded-sm">
                      <span className="flex-1 bg-[color:color-mix(in_srgb,var(--accent)_10%,transparent)]" />
                      <span className="flex-1 bg-[color:color-mix(in_srgb,var(--accent)_40%,transparent)]" />
                      <span className="flex-1 bg-[color:color-mix(in_srgb,var(--accent)_75%,transparent)]" />
                    </span>
                    <span>High</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div
              className="grid grid-cols-[28px_repeat(24,minmax(0,1fr))] gap-px text-[8px] text-[color:var(--text-muted)]"
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
                    const mix = max === 0 ? 0 : Math.round((value / max) * 90)
                    const active =
                      hoveredCell?.day === day && hoveredCell?.hour === hour
                    const dimmed = hoveredCell !== null && !active

                    return (
                      <button
                        key={`${day}-${hour}`}
                        type="button"
                        onMouseEnter={() => setHoveredCell({ day, hour, value, intensity })}
                        onFocus={() => setHoveredCell({ day, hour, value, intensity })}
                        onBlur={() => setHoveredCell(null)}
                        aria-label={`${DAY_FULL[day]} ${formatHour(hour)}: ${value} events, ${intensityLabel(intensity)} density`}
                        className={cn(
                          'relative aspect-square rounded-[2px] outline-none transition-all duration-200 ease-out',
                          'focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--surface-muted)]',
                          active &&
                            'z-10 scale-[1.55] rounded-[3px] shadow-[0_0_10px_var(--accent-glow)] ring-1 ring-[color:var(--accent-border)]',
                          dimmed && 'opacity-40',
                        )}
                        style={{
                          backgroundColor:
                            value === 0
                              ? 'color-mix(in srgb, var(--border) 55%, transparent)'
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
                                {DAY_FULL[day]}
                              </div>
                              <div className="mt-0.5 flex items-center gap-1.5 text-[10px]">
                                <span className="text-[color:var(--text-muted)]">{formatHour(hour)}</span>
                                <span className="text-[color:var(--border-strong)]">·</span>
                                <span className="mono font-semibold text-[color:var(--accent)]">{value}</span>
                                <span className="text-[color:var(--text-muted)]">events</span>
                              </div>
                              <div className="mt-1 flex items-center gap-1.5">
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

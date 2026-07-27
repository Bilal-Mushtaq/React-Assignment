import { Fragment } from 'react'
import { useAnalyticsStore } from '../../../store/analyticsStore'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function AnalyticsHeatmapWidget() {
  const heatmap = useAnalyticsStore((s) => s.heatmap)
  const series = useAnalyticsStore((s) => s.eventRateSeries)
  const max = Math.max(1, ...heatmap.flat())
  const seriesMax = Math.max(1, ...series)

  return (
    <div className="flex h-full min-h-0 flex-col gap-2.5" aria-label="Analytics and heatmap widget">
      <div className="shrink-0 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/50 p-2.5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
            Event rate
          </span>
          <span className="mono text-[10px] text-[color:var(--text-muted)]">24h</span>
        </div>
        <div className="flex h-12 items-end gap-0.5">
          {series.map((value, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-sm bg-[color:var(--accent)]/80 transition-all"
              style={{ height: `${Math.max(10, (value / seriesMax) * 100)}%` }}
              title={`Bucket ${idx + 1}: ${value}`}
            />
          ))}
        </div>
      </div>

      <div className="widget-scroll min-h-0 flex-1 overflow-auto rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/50 p-2.5">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
          Density heatmap
        </div>
        <div className="grid grid-cols-[28px_repeat(24,minmax(0,1fr))] gap-px text-[8px] text-[color:var(--text-muted)]">
          <div />
          {Array.from({ length: 24 }).map((_, h) => (
            <div key={h} className="text-center">
              {h % 6 === 0 ? h : ''}
            </div>
          ))}
          {heatmap.map((row, day) => (
            <Fragment key={day}>
              <div className="flex items-center text-[9px] font-medium">{DAY_LABELS[day]}</div>
              {row.map((value, hour) => (
                <div
                  key={`${day}-${hour}`}
                  title={`${DAY_LABELS[day]} ${hour}:00 — ${value}`}
                  className="aspect-square rounded-[2px] transition-colors"
                  style={{
                    backgroundColor: `color-mix(in srgb, var(--accent) ${Math.round((value / max) * 90)}%, transparent)`,
                  }}
                />
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

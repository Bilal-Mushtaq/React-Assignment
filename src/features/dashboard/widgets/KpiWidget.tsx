import { Activity, Camera, Radar, ShieldAlert } from 'lucide-react'
import { useAnalyticsStore } from '../../../store/analyticsStore'
import { AnimatedCounter } from '../../../components/common/AnimatedCounter'
import { cn } from '../../../lib/cn'

const KPI_META = [
  {
    key: 'activeAlerts' as const,
    label: 'Active Alerts',
    suffix: '',
    icon: ShieldAlert,
    tone: 'text-rose-500 bg-rose-500/10',
  },
  {
    key: 'camerasOnline' as const,
    label: 'Cameras Online',
    suffix: '',
    icon: Camera,
    tone: 'text-emerald-500 bg-emerald-500/10',
  },
  {
    key: 'incidentsToday' as const,
    label: 'Incidents Today',
    suffix: '',
    icon: Activity,
    tone: 'text-amber-500 bg-amber-500/10',
  },
  {
    key: 'avgAiConfidence' as const,
    label: 'Avg AI Confidence',
    suffix: '%',
    icon: Radar,
    tone: 'text-[color:var(--accent)] bg-[color:var(--accent-bg)]',
  },
]

export function KpiWidget() {
  const activeAlerts = useAnalyticsStore((s) => s.kpiOverrides.activeAlerts ?? 0)
  const camerasOnline = useAnalyticsStore((s) => s.kpiOverrides.camerasOnline ?? 0)
  const incidentsToday = useAnalyticsStore((s) => s.kpiOverrides.incidentsToday ?? 0)
  const avgAiConfidence = useAnalyticsStore((s) => s.kpiOverrides.avgAiConfidence ?? 0)

  const kpis = { activeAlerts, camerasOnline, incidentsToday, avgAiConfidence }

  return (
    <div className="grid h-full grid-cols-2 gap-2" aria-label="KPI widget">
      {KPI_META.map((item) => {
        const Icon = item.icon
        const value = kpis[item.key]
        return (
          <div
            key={item.key}
            className="relative overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/70 p-3 transition hover:border-[color:var(--border-strong)]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg', item.tone)}>
                <Icon size={14} aria-hidden="true" />
              </div>
            </div>
            <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
              {item.label}
            </div>
            <div className="mt-1 text-xl font-bold tabular-nums tracking-tight text-[color:var(--text-h)]">
              <AnimatedCounter value={value} suffix={item.suffix} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

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
    tone: 'text-[color:var(--danger)] bg-[color:color-mix(in_srgb,var(--danger)_12%,transparent)]',
  },
  {
    key: 'camerasOnline' as const,
    label: 'Cameras Online',
    suffix: '',
    icon: Camera,
    tone: 'text-[color:var(--success)] bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)]',
  },
  {
    key: 'incidentsToday' as const,
    label: 'Incidents Today',
    suffix: '',
    icon: Activity,
    tone: 'text-[color:var(--warning)] bg-[color:color-mix(in_srgb,var(--warning)_12%,transparent)]',
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
        const isZero = value === 0
        return (
          <div
            key={item.key}
            className="relative overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/70 p-3 transition hover:border-[color:var(--border-strong)]"
          >
            <div
              className={cn(
                'text-xl font-bold tabular-nums tracking-tight',
                isZero ? 'text-[color:var(--text-muted)]' : 'text-[color:var(--text-h)]',
              )}
            >
              <AnimatedCounter value={value} suffix={item.suffix} />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md', item.tone)}>
                <Icon size={12} aria-hidden="true" />
              </div>
              <div className="min-w-0 text-[10px] font-semibold uppercase leading-tight tracking-[0.1em] text-[color:var(--text-muted)]">
                {item.label}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

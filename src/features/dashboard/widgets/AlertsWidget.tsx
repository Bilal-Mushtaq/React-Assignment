import { useMemo } from 'react'
import { useAlertsStore } from '../../../store/alertsStore'
import type { AlertSeverity } from '../../../types/domain'
import { formatRelativeTime, severityTone } from '../../../utils/format'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { cn } from '../../../lib/cn'

const FILTERS: Array<AlertSeverity | 'all'> = ['all', 'critical', 'high', 'medium', 'low']

export function AlertsWidget() {
  const severityFilter = useAlertsStore((s) => s.severityFilter)
  const alertsRaw = useAlertsStore((s) => s.alerts)
  const setSeverityFilter = useAlertsStore((s) => s.setSeverityFilter)
  const acknowledge = useAlertsStore((s) => s.acknowledge)
  const resolve = useAlertsStore((s) => s.resolve)

  const alerts = useMemo(() => {
    const filtered =
      severityFilter === 'all' ? alertsRaw : alertsRaw.filter((a) => a.severity === severityFilter)
    return filtered.filter((a) => a.status !== 'resolved').slice(0, 30)
  }, [alertsRaw, severityFilter])

  return (
    <div className="flex h-full min-h-0 flex-col" aria-label="Alerts widget">
      <div className="flex shrink-0 flex-wrap gap-1" role="group" aria-label="Severity filters">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setSeverityFilter(filter)}
            className={cn(
              'rounded-lg border px-2 py-1 text-[10px] font-semibold capitalize transition focus-ring',
              severityFilter === filter
                ? 'border-[color:var(--accent-border)] bg-[color:var(--accent-bg)] text-[color:var(--text-h)]'
                : 'border-[color:var(--border)] text-[color:var(--text-muted)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-h)]',
            )}
            aria-pressed={severityFilter === filter}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="widget-scroll mt-2 min-h-0 flex-1 space-y-1.5 overflow-auto">
        {alerts.length === 0 ? (
          <div className="flex h-full min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 px-4 text-center">
            <div className="text-sm font-medium text-[color:var(--text-h)]">All clear</div>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">No alerts match this severity filter.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 p-2.5 transition hover:border-[color:var(--border-strong)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone={severityTone(alert.severity)}>{alert.severity}</Badge>
                    <span className="text-[10px] text-[color:var(--text-muted)]">
                      {formatRelativeTime(alert.createdAt)}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-xs font-semibold text-[color:var(--text-h)]">{alert.title}</div>
                  <div className="mt-0.5 line-clamp-1 text-[11px] text-[color:var(--text-muted)]">{alert.message}</div>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  {alert.status === 'open' ? (
                    <Button size="sm" className="h-7 px-2" onClick={() => acknowledge(alert.id)}>
                      Ack
                    </Button>
                  ) : null}
                  {alert.status !== 'resolved' ? (
                    <Button size="sm" variant="primary" className="h-7 px-2" onClick={() => resolve(alert.id)}>
                      Resolve
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

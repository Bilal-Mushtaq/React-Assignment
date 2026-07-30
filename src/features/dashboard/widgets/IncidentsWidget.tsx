import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useTimelineStore } from '../../../store/timelineStore'
import { formatRelativeTime, severityTone } from '../../../utils/format'
import { Badge } from '../../../components/ui/badge'
import { cn } from '../../../lib/cn'
import type { AlertSeverity } from '../../../types/domain'

const spineColor: Record<AlertSeverity, string> = {
  critical: 'bg-[color:var(--danger)] ring-[color:color-mix(in_srgb,var(--danger)_20%,transparent)]',
  high: 'bg-[color:var(--warning)] ring-[color:color-mix(in_srgb,var(--warning)_20%,transparent)]',
  medium: 'bg-[color:var(--info)] ring-[color:color-mix(in_srgb,var(--info)_20%,transparent)]',
  low: 'bg-[color:var(--success)] ring-[color:color-mix(in_srgb,var(--success)_20%,transparent)]',
}

export function IncidentsWidget() {
  const allIncidents = useTimelineStore((s) => s.incidents)
  const incidents = useMemo(() => allIncidents.slice(0, 20), [allIncidents])

  return (
    <div className="flex h-full min-h-0 flex-col" aria-label="Incident timeline widget">
      <div className="mb-1.5 flex shrink-0 items-center justify-between text-[11px] text-[color:var(--text-muted)]">
        <span className="font-medium text-[color:var(--text)]">Recent timeline</span>
        <div className="flex items-center gap-2">
          <span className="mono tabular-nums text-[color:var(--text-h)]">{incidents.length}</span>
          <Link
            to="/incidents"
            className="inline-flex items-center gap-0.5 rounded-lg px-1.5 py-1 text-[10px] font-semibold text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-h)] focus-ring"
          >
            All
            <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      <div className="widget-scroll min-h-0 flex-1 space-y-2 pr-2 overflow-auto">
        {incidents.length === 0 ? (
          <div className="flex h-full min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 px-4 text-center">
            <div className="text-sm font-medium text-[color:var(--text-h)]">No incidents</div>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">Timeline will populate as events arrive.</p>
          </div>
        ) : (
          incidents.map((incident, index) => (
            <div key={incident.id} className="relative flex gap-3 pl-1">
              <div className="relative flex w-3 shrink-0 flex-col items-center">
                <span
                  className={cn('mt-1.5 h-2 w-2 rounded-full ring-4', spineColor[incident.severity] ?? spineColor.medium)}
                />
                {index < incidents.length - 1 ? (
                  <span className="mt-1 w-px flex-1 bg-[color:var(--border)]" aria-hidden="true" />
                ) : null}
              </div>
              <div className="mb-1 min-w-0 flex-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 p-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone={severityTone(incident.severity)}>{incident.severity}</Badge>
                  <span className="text-[10px] text-[color:var(--text-muted)]">
                    {formatRelativeTime(incident.timestamp)}
                  </span>
                </div>
                <div className="mt-1 text-xs font-semibold text-[color:var(--text-h)]">{incident.title}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

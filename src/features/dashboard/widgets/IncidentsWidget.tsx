import { useMemo } from 'react'
import { useTimelineStore } from '../../../store/timelineStore'
import { formatRelativeTime, severityTone } from '../../../utils/format'
import { Badge } from '../../../components/ui/badge'

export function IncidentsWidget() {
  const allIncidents = useTimelineStore((s) => s.incidents)
  const incidents = useMemo(() => allIncidents.slice(0, 20), [allIncidents])

  return (
    <div className="flex h-full min-h-0 flex-col" aria-label="Incident timeline widget">
      <div className="widget-scroll min-h-0 flex-1 space-y-2 overflow-auto">
        {incidents.length === 0 ? (
          <div className="flex h-full min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 px-4 text-center">
            <div className="text-sm font-medium text-[color:var(--text-h)]">No incidents</div>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">Timeline will populate as events arrive.</p>
          </div>
        ) : (
          incidents.map((incident, index) => (
            <div key={incident.id} className="relative flex gap-3 pl-1">
              <div className="relative flex w-3 shrink-0 flex-col items-center">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-[color:var(--accent)] ring-4 ring-[color:var(--accent-bg)]" />
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

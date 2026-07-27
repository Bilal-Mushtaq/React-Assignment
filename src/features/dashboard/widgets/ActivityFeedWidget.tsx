import { memo } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { useActivityStore } from '../../../store/activityStore'
import { formatRelativeTime } from '../../../utils/format'
import { Badge } from '../../../components/ui/badge'

const ActivityRow = memo(function ActivityRow({
  message,
  type,
  timestamp,
}: {
  message: string
  type: string
  timestamp: number
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 p-2.5">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--accent)] ring-4 ring-[color:var(--accent-bg)]" />
      <div className="min-w-0 flex-1">
        <div className="text-xs leading-snug text-[color:var(--text-h)]">{message}</div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          <Badge tone="neutral">{type}</Badge>
          <span className="text-[10px] text-[color:var(--text-muted)]">{formatRelativeTime(timestamp)}</span>
        </div>
      </div>
    </div>
  )
})

export function ActivityFeedWidget() {
  const events = useActivityStore((s) => s.events)
  const totalGenerated = useActivityStore((s) => s.totalGenerated)

  return (
    <div className="flex h-full min-h-0 flex-col" aria-label="Activity feed widget">
      <div className="mb-2 flex shrink-0 items-center justify-between text-[11px] text-[color:var(--text-muted)]">
        <span>Virtualized stream</span>
        <span className="mono font-medium text-[color:var(--text-h)]">{totalGenerated.toLocaleString()}</span>
      </div>

      <div className="min-h-0 flex-1">
        {events.length === 0 ? (
          <div className="flex h-full min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 px-4 text-center">
            <div className="text-sm font-medium text-[color:var(--text-h)]">Waiting for events</div>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">Live activity will appear here.</p>
          </div>
        ) : (
          <Virtuoso
            style={{ height: '100%' }}
            className="widget-scroll h-full"
            data={events}
            itemContent={(_index, event) => (
              <div className="pb-1.5">
                <ActivityRow message={event.message} type={event.type} timestamp={event.timestamp} />
              </div>
            )}
          />
        )}
      </div>
    </div>
  )
}

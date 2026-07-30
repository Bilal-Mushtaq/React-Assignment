import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Virtuoso } from 'react-virtuoso'
import { ArrowRight, Radio } from 'lucide-react'
import { useActivityStore } from '../../../store/activityStore'
import { ActivityRow } from '../../activity/components/ActivityRow'
import { ActivityDetailSheet } from '../../activity/components/ActivityDetailSheet'
import type { ActivityEvent } from '../../../types/domain'

export function ActivityFeedWidget() {
  const events = useActivityStore((s) => s.events)
  const totalGenerated = useActivityStore((s) => s.totalGenerated)
  const [selected, setSelected] = useState<ActivityEvent | null>(null)

  const preview = useMemo(() => events, [events])

  return (
    <div className="flex h-full min-h-0 flex-col" aria-label="Activity feed widget">
      <div className="mb-2 flex shrink-0 items-center justify-between gap-2 text-[11px] text-[color:var(--text-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[color:var(--accent-bg)] text-[color:var(--accent)]">
            <Radio size={12} aria-hidden="true" />
          </span>
          Live stream
        </span>
        <div className="flex items-center gap-2">
          <span className="mono font-medium text-[color:var(--text-h)]">
            {totalGenerated.toLocaleString()}
          </span>
          <Link
            to="/activity"
            className="inline-flex items-center gap-0.5 rounded-lg px-1.5 py-1 text-[10px] font-semibold text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-h)] focus-ring"
          >
            All
            <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {preview.length === 0 ? (
          <div className="flex h-full min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 px-4 text-center">
            <div className="text-sm font-medium text-[color:var(--text-h)]">Waiting for events</div>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">Live activity will appear here.</p>
          </div>
        ) : (
          <Virtuoso
            style={{ height: '100%' }}
            className="widget-scroll h-full"
            data={preview}
            itemContent={(_index, event) => (
              <div className="pb-1.5">
                <ActivityRow event={event} compact onSelect={setSelected} />
              </div>
            )}
          />
        )}
      </div>

      <ActivityDetailSheet
        event={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      />
    </div>
  )
}

import { memo } from 'react'
import { ChevronRight } from 'lucide-react'
import { Badge } from '../../../components/ui/badge'
import { getActivityTypeMeta } from '../activityMeta'
import { formatRelativeTime } from '../../../utils/format'
import type { ActivityEvent } from '../../../types/domain'
import { cn } from '../../../lib/cn'

type ActivityRowProps = {
  event: ActivityEvent
  onSelect?: (event: ActivityEvent) => void
  selected?: boolean
  compact?: boolean
}

export const ActivityRow = memo(function ActivityRow({
  event,
  onSelect,
  selected = false,
  compact = false,
}: ActivityRowProps) {
  const meta = getActivityTypeMeta(event.type)
  const Icon = meta.icon
  const zone = event.meta?.zone

  return (
    <button
      type="button"
      onClick={() => onSelect?.(event)}
      className={cn(
        'group relative flex w-full items-start gap-2.5 overflow-hidden rounded-xl border text-left transition duration-200 focus-ring',
        compact ? 'p-2.5' : 'p-3',
        meta.borderClass,
        meta.softBgClass,
        'hover:brightness-[1.03] hover:shadow-[var(--shadow-sm)]',
        selected && 'ring-2 ring-[color:var(--accent)] ring-offset-1 ring-offset-[color:var(--surface)]',
      )}
      aria-label={`${meta.label}: ${event.message}`}
    >
      <span className={cn('absolute inset-y-0 left-0 w-0.5', meta.barClass)} aria-hidden="true" />

      <span
        className={cn(
          'mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)]/80',
        )}
      >
        <Icon size={13} className="text-[color:var(--text-h)] opacity-80" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            'leading-snug text-[color:var(--text-h)]',
            compact ? 'text-xs' : 'text-[13px]',
          )}
        >
          {event.message}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge tone={meta.tone} className="normal-case tracking-normal">
            {meta.shortLabel}
          </Badge>
          {zone ? (
            <span className="truncate text-[10px] text-[color:var(--text-muted)]">{zone}</span>
          ) : null}
          <span className="text-[10px] text-[color:var(--text-muted)]">
            {formatRelativeTime(event.timestamp)}
          </span>
        </div>
      </div>

      <ChevronRight
        size={14}
        className="mt-1 shrink-0 text-[color:var(--text-muted)] opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
        aria-hidden="true"
      />
    </button>
  )
})

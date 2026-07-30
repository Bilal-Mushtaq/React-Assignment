import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Virtuoso } from 'react-virtuoso'
import { Radio, Search } from 'lucide-react'
import { ActivityDetailSheet } from '../features/activity/components/ActivityDetailSheet'
import { ActivityRow } from '../features/activity/components/ActivityRow'
import {
  ACTIVITY_TYPES,
  getActivityTypeMeta,
  type ActivityType,
} from '../features/activity/activityMeta'
import { ActivitySkeleton } from '../components/common/PageSkeletons'
import { Badge } from '../components/ui/badge'
import { usePageReady } from '../hooks/usePageReady'
import { SITE } from '../constants/mockData'
import { useActivityStore } from '../store/activityStore'
import { cn } from '../lib/cn'
import { staggerContainer, staggerItem } from '../lib/motion'
import type { ActivityEvent } from '../types/domain'

type FilterId = 'all' | ActivityType

export default function ActivityRoute() {
  const ready = usePageReady('activity', 380)
  const events = useActivityStore((s) => s.events)
  const totalGenerated = useActivityStore((s) => s.totalGenerated)
  const [filter, setFilter] = useState<FilterId>('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ActivityEvent | null>(null)

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: events.length }
    for (const type of ACTIVITY_TYPES) map[type] = 0
    for (const event of events) {
      map[event.type] = (map[event.type] ?? 0) + 1
    }
    return map
  }, [events])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return events.filter((event) => {
      if (filter !== 'all' && event.type !== filter) return false
      if (!q) return true
      const hay = [event.message, event.type, event.meta?.zone ?? '', event.id].join(' ').toLowerCase()
      return hay.includes(q)
    })
  }, [events, filter, query])

  if (!ready) return <ActivitySkeleton />

  return (
    <motion.div
      className="flex h-full min-h-0 flex-col gap-4 pb-6"
      aria-label="Activity stream"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <motion.header
        variants={staggerItem}
        className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-elevated)_88%,transparent)] p-4 shadow-[var(--shadow-sm)] backdrop-blur-md [background-image:linear-gradient(180deg,var(--highlight),transparent_40%)]"
      >
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
            {SITE.name}
          </div>
          <h2 className="mt-1 flex items-center gap-2 text-lg font-bold tracking-tight text-[color:var(--text-h)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[color:var(--accent-bg)] text-[color:var(--accent)]">
              <Radio size={16} aria-hidden="true" />
            </span>
            Activity stream
          </h2>
          <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">
            Color-coded ops timeline · click any row for full detail
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge tone="accent" className="normal-case tracking-normal">
            {filtered.length.toLocaleString()} shown
          </Badge>
          <Badge tone="neutral" className="mono normal-case tracking-normal">
            Σ {totalGenerated.toLocaleString()}
          </Badge>
        </div>
      </motion.header>

      <motion.div variants={staggerItem} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]"
            aria-hidden="true"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages, zones, IDs…"
            className="h-10 w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] pl-9 pr-3 text-sm text-[color:var(--text-h)] shadow-[var(--shadow-sm)] outline-none transition placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--accent-border)] focus:ring-2 focus:ring-[color:var(--accent)]/25"
          />
        </label>
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Filter by category"
      >
        <FilterChip
          active={filter === 'all'}
          label="All"
          count={counts.all ?? 0}
          onClick={() => setFilter('all')}
        />
        {ACTIVITY_TYPES.map((type) => {
          const meta = getActivityTypeMeta(type)
          return (
            <FilterChip
              key={type}
              active={filter === type}
              label={meta.shortLabel}
              count={counts[type] ?? 0}
              tone={meta.tone}
              barClass={meta.barClass}
              onClick={() => setFilter(type)}
            />
          )
        })}
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-elevated)_92%,transparent)] shadow-[var(--shadow-sm)]"
      >
        {filtered.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center px-4 text-center">
            <div className="text-sm font-medium text-[color:var(--text-h)]">No matching activity</div>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">
              Try another category or clear the search.
            </p>
          </div>
        ) : (
          <Virtuoso
            style={{ height: 'min(70vh, 640px)' }}
            className="widget-scroll"
            data={filtered}
            itemContent={(_index, event) => (
              <div className="px-3 pb-2 pt-1 first:pt-3 last:pb-3 sm:px-4">
                <ActivityRow
                  event={event}
                  selected={selected?.id === event.id}
                  onSelect={setSelected}
                />
              </div>
            )}
          />
        )}
      </motion.div>

      <ActivityDetailSheet
        event={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      />
    </motion.div>
  )
}

function FilterChip({
  active,
  label,
  count,
  tone,
  barClass,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'
  barClass?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'relative inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-xl border px-3 py-2 text-xs font-semibold transition focus-ring',
        active
          ? 'border-[color:var(--accent-border)] bg-[color:var(--accent-bg)] text-[color:var(--text-h)]'
          : 'border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--text-muted)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-h)]',
      )}
    >
      {barClass ? (
        <span className={cn('h-1.5 w-1.5 rounded-full', barClass)} aria-hidden="true" />
      ) : null}
      {label}
      <Badge tone={active ? tone ?? 'accent' : 'neutral'} className="normal-case tracking-normal">
        {count.toLocaleString()}
      </Badge>
    </button>
  )
}

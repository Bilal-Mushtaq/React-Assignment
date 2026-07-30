import { cn } from '../../lib/cn'
import { Badge } from '../../components/ui/badge'

export type FilterDotTone = 'neutral' | 'danger' | 'warning' | 'info' | 'success' | 'accent'

const DOT: Record<FilterDotTone, string> = {
  neutral: 'bg-[color:var(--text-muted)]',
  danger: 'bg-[color:var(--danger)]',
  warning: 'bg-[color:var(--warning)]',
  info: 'bg-[color:var(--info)]',
  success: 'bg-[color:var(--success)]',
  accent: 'bg-[color:var(--accent)]',
}

type DotChipProps = {
  active: boolean
  label: string
  count?: number
  tone?: FilterDotTone
  onClick: () => void
}

/** Activity-style chip: colored dot + label + optional count */
export function DotFilterChip({ active, label, count, tone = 'neutral', onClick }: DotChipProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'relative inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-xl border px-3 py-2 text-xs font-semibold capitalize transition focus-ring',
        active
          ? 'border-[color:var(--accent-border)] bg-[color:var(--accent-bg)] text-[color:var(--text-h)]'
          : 'border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--text-muted)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text-h)]',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', DOT[tone])} aria-hidden="true" />
      {label}
      {typeof count === 'number' ? (
        <Badge
          tone={active ? (tone === 'neutral' ? 'accent' : tone) : 'neutral'}
          className="normal-case tracking-normal"
        >
          {count.toLocaleString()}
        </Badge>
      ) : null}
    </button>
  )
}

type SegmentOption<T extends string> = {
  id: T
  label: string
}

type SegmentedProps<T extends string> = {
  value: T
  options: Array<SegmentOption<T>>
  onChange: (value: T) => void
  'aria-label'?: string
}

/** Compact pill segmented control for status / mode */
export function SegmentedFilter<T extends string>({
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex shrink-0 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/50 p-0.5 shadow-[var(--shadow-sm)]"
    >
      {options.map((opt) => {
        const active = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              'rounded-[10px] px-3 py-1.5 text-xs font-semibold capitalize transition focus-ring',
              active
                ? 'bg-[color:var(--surface-elevated)] text-[color:var(--text-h)] shadow-[var(--shadow-sm)]'
                : 'text-[color:var(--text-muted)] hover:text-[color:var(--text-h)]',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

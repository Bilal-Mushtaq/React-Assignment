import { cn } from '../../lib/cn'

type Status = 'online' | 'offline' | 'degraded' | 'recording' | 'live'

const colors: Record<Status, string> = {
  online: 'bg-[color:var(--success)]',
  live: 'bg-[color:var(--success)]',
  recording: 'bg-[color:var(--danger)]',
  degraded: 'bg-[color:var(--warning)]',
  offline: 'bg-[color:var(--danger)]',
}

export function StatusDot({
  status,
  pulse = false,
  className,
}: {
  status: Status | string
  pulse?: boolean
  className?: string
}) {
  const color = colors[status as Status] ?? 'bg-[color:var(--text-muted)]'

  return (
    <span
      className={cn('inline-block h-1.5 w-1.5 shrink-0 rounded-full', color, pulse && 'live-dot', className)}
      aria-hidden="true"
    />
  )
}

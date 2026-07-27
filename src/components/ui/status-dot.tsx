import { cn } from '../../lib/cn'

type Status = 'online' | 'offline' | 'degraded' | 'recording' | 'live'

const colors: Record<Status, string> = {
  online: 'bg-emerald-500',
  recording: 'bg-emerald-500',
  live: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  offline: 'bg-rose-500',
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

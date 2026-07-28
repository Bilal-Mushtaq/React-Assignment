import type { PropsWithChildren } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'

const tones: Record<Tone, string> = {
  neutral: 'bg-[color:var(--surface-muted)] text-[color:var(--text)] border-[color:var(--border)]',
  accent: 'bg-[color:var(--accent-bg)] text-[color:var(--accent)] border-[color:var(--accent-border)]',
  success:
    'bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)] text-[color:var(--success)] border-[color:color-mix(in_srgb,var(--success)_30%,transparent)]',
  warning:
    'bg-[color:color-mix(in_srgb,var(--warning)_12%,transparent)] text-[color:var(--warning)] border-[color:color-mix(in_srgb,var(--warning)_30%,transparent)]',
  danger:
    'bg-[color:color-mix(in_srgb,var(--danger)_12%,transparent)] text-[color:var(--danger)] border-[color:color-mix(in_srgb,var(--danger)_30%,transparent)]',
  info:
    'bg-[color:color-mix(in_srgb,var(--info)_12%,transparent)] text-[color:var(--info)] border-[color:color-mix(in_srgb,var(--info)_30%,transparent)]',
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: PropsWithChildren<{ tone?: Tone; className?: string }>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

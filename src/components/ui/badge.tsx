import type { PropsWithChildren } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'

const tones: Record<Tone, string> = {
  neutral: 'bg-[color:var(--surface-muted)] text-[color:var(--text)] border-[color:var(--border)]',
  accent: 'bg-[color:var(--accent-bg)] text-[color:var(--accent)] border-[color:var(--accent-border)]',
  success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  danger: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  info: 'bg-sky-500/10 text-sky-600 border-sky-500/30',
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

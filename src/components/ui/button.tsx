import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant
    size?: Size
  }
>

const variants: Record<Variant, string> = {
  primary:
    'bg-[color:var(--accent)] text-[color:var(--accent-fg)] shadow-[var(--shadow-sm)] hover:brightness-110 active:brightness-95',
  secondary:
    'border border-[color:var(--border)] bg-[color:var(--surface-elevated)] text-[color:var(--text-h)] hover:bg-[color:var(--surface-muted)] hover:border-[color:var(--border-strong)]',
  ghost: 'text-[color:var(--text)] hover:bg-black/5 hover:text-[color:var(--text-h)]',
  danger: 'border border-rose-500/30 bg-rose-500/10 text-rose-600 hover:bg-rose-500/15',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-2.5 text-xs gap-1.5',
  md: 'h-9 px-3 text-sm gap-2',
}

export function Button({
  children,
  className,
  variant = 'secondary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all focus-ring disabled:pointer-events-none disabled:opacity-45',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

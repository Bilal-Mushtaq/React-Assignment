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
    'bg-[color:var(--accent)] text-[color:var(--accent-fg)] shadow-[var(--shadow-sm)] hover:brightness-110 active:brightness-95 [box-shadow:0_1px_0_var(--highlight-strong)_inset,var(--shadow-sm)]',
  secondary:
    'border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-elevated)_90%,transparent)] text-[color:var(--text-h)] shadow-[var(--shadow-sm)] backdrop-blur-sm hover:bg-[color:var(--surface-muted)] hover:border-[color:var(--border-strong)]',
  ghost: 'text-[color:var(--text)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-h)]',
  danger:
    'border border-[color:color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--danger)_10%,transparent)] text-[color:var(--danger)] hover:bg-[color:color-mix(in_srgb,var(--danger)_15%,transparent)]',
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
        'inline-flex cursor-pointer items-center justify-center rounded-lg font-medium transition-all focus-ring disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-45',
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

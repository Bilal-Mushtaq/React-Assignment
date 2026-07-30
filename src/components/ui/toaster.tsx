import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useToastStore, type Toast, type ToastTone } from '../../store/toastStore'
import { cn } from '../../lib/cn'
import { toastTransition } from '../../lib/motion'

const TONE_META: Record<
  ToastTone,
  { icon: typeof CheckCircle2; border: string; iconClass: string; bg: string }
> = {
  success: {
    icon: CheckCircle2,
    border: 'border-[color:color-mix(in_srgb,var(--success)_35%,transparent)]',
    iconClass: 'text-[color:var(--success)]',
    bg: 'bg-[color:color-mix(in_srgb,var(--success)_8%,var(--surface-elevated))]',
  },
  info: {
    icon: Info,
    border: 'border-[color:color-mix(in_srgb,var(--info)_35%,transparent)]',
    iconClass: 'text-[color:var(--info)]',
    bg: 'bg-[color:color-mix(in_srgb,var(--info)_8%,var(--surface-elevated))]',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-[color:color-mix(in_srgb,var(--warning)_35%,transparent)]',
    iconClass: 'text-[color:var(--warning)]',
    bg: 'bg-[color:color-mix(in_srgb,var(--warning)_8%,var(--surface-elevated))]',
  },
  error: {
    icon: XCircle,
    border: 'border-[color:color-mix(in_srgb,var(--danger)_35%,transparent)]',
    iconClass: 'text-[color:var(--danger)]',
    bg: 'bg-[color:color-mix(in_srgb,var(--danger)_8%,var(--surface-elevated))]',
  },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const tone = toast.tone ?? 'info'
  const meta = TONE_META[tone]
  const Icon = meta.icon

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss(toast.id)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onDismiss, toast.id])

  return (
    <motion.div
      layout
      role="status"
      initial={{ opacity: 0, y: 18, scale: 0.96, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: -20, scale: 0.96, filter: 'blur(3px)' }}
      transition={toastTransition}
      className={cn(
        'pointer-events-auto flex w-[min(22rem,calc(100vw-2rem))] items-start gap-2.5 rounded-xl border p-3 shadow-[var(--shadow-lg)] backdrop-blur-sm',
        meta.border,
        meta.bg,
      )}
    >
      <span className={cn('mt-0.5 shrink-0', meta.iconClass)} aria-hidden="true">
        <Icon size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold tracking-tight text-[color:var(--text-h)]">{toast.title}</div>
        {toast.description ? (
          <div className="mt-0.5 line-clamp-2 text-xs text-[color:var(--text-muted)]">{toast.description}</div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-md p-1 text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-h)] focus-ring"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-4 z-[200] flex flex-col gap-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((item) => (
          <ToastItem key={item.id} toast={item} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}

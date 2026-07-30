import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Camera, ShieldAlert, Server, X } from 'lucide-react'
import { useNotificationStore } from '../../../store/notificationStore'
import { formatRelativeTime } from '../../../utils/format'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { cn } from '../../../lib/cn'
import { overlayTransition, panelTransition } from '../../../lib/motion'
import type { AppNotification, NotificationGroup } from '../../../types/domain'

type FilterId = 'all' | NotificationGroup

const GROUP_META: Record<
  NotificationGroup,
  {
    label: string
    icon: typeof Bell
    tone: 'danger' | 'info' | 'neutral'
    unreadClass: string
  }
> = {
  alerts: {
    label: 'Alerts',
    icon: ShieldAlert,
    tone: 'danger',
    unreadClass:
      'border-[color:color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--danger)_10%,transparent)]',
  },
  cameras: {
    label: 'Cameras',
    icon: Camera,
    tone: 'info',
    unreadClass:
      'border-[color:color-mix(in_srgb,var(--info)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--info)_10%,transparent)]',
  },
  system: {
    label: 'System',
    icon: Server,
    tone: 'neutral',
    unreadClass: 'border-[color:var(--border-strong)] bg-[color:var(--surface-muted)]',
  },
}

const FILTERS: Array<{ id: FilterId; label: string; icon: typeof Bell }> = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'alerts', label: 'Alerts', icon: ShieldAlert },
  { id: 'cameras', label: 'Cameras', icon: Camera },
  { id: 'system', label: 'System', icon: Server },
]

function NotificationRow({
  n,
  onRead,
}: {
  n: AppNotification
  onRead: (id: string) => void
}) {
  const meta = GROUP_META[n.group]
  const Icon = meta.icon

  return (
    <button
      type="button"
      className={cn(
        'w-full rounded-xl border p-2.5 text-left transition hover:bg-[color:var(--surface-muted)] focus-ring',
        n.read ? 'border-transparent opacity-70' : meta.unreadClass,
      )}
      onClick={() => onRead(n.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={meta.tone} className="normal-case tracking-normal">
              <Icon size={10} aria-hidden="true" />
              {meta.label}
            </Badge>
            {!n.read ? (
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" aria-label="Unread" />
            ) : null}
          </div>
          <div className="mt-1.5 truncate text-sm font-semibold text-[color:var(--text-h)]">{n.title}</div>
          <div className="mt-0.5 line-clamp-2 text-xs text-[color:var(--text-muted)]">{n.body}</div>
        </div>
        <span className="shrink-0 pt-0.5 text-[10px] text-[color:var(--text-muted)]">
          {formatRelativeTime(n.timestamp)}
        </span>
      </div>
    </button>
  )
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<FilterId>('all')
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const allNotifications = useNotificationStore((s) => s.notifications)
  const markRead = useNotificationStore((s) => s.markRead)
  const markAllRead = useNotificationStore((s) => s.markAllRead)

  const counts = useMemo(() => {
    const next: Record<FilterId, number> = { all: 0, alerts: 0, cameras: 0, system: 0 }
    for (const n of allNotifications) {
      next.all += 1
      next[n.group] += 1
    }
    return next
  }, [allNotifications])

  const unreadCount = useMemo(
    () => allNotifications.filter((n) => !n.read).length,
    [allNotifications],
  )

  const unreadByFilter = useMemo(() => {
    const next: Record<FilterId, number> = { all: 0, alerts: 0, cameras: 0, system: 0 }
    for (const n of allNotifications) {
      if (!n.read) {
        next.all += 1
        next[n.group] += 1
      }
    }
    return next
  }, [allNotifications])

  const visible = useMemo(() => {
    const list =
      filter === 'all' ? allNotifications : allNotifications.filter((n) => n.group === filter)
    return list.slice(0, 80)
  }, [allNotifications, filter])

  const filterUnread = unreadByFilter[filter]
  const headerUnreadLabel =
    filter === 'all'
      ? `${unreadCount} unread · newest first`
      : `${filterUnread} unread in ${GROUP_META[filter].label.toLowerCase()} · ${unreadCount} total`

  const handleMarkAllRead = () => {
    markAllRead(filter === 'all' ? undefined : filter)
  }

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node
      if (panelRef.current?.contains(target)) return
      if (triggerRef.current?.contains(target)) return
      close()
    }

    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        className="btn-icon relative rounded-xl p-2 focus-ring"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        aria-controls="notification-center"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={17} />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--danger)] px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <>
                  <motion.button
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={overlayTransition}
                    className="fixed inset-0 z-[180] cursor-default bg-black/35 sm:bg-black/20"
                    aria-label="Close notifications"
                    onClick={close}
                  />
                  <motion.div
                    ref={panelRef}
                    id="notification-center"
                    initial={{ opacity: 0, y: 20, scale: 0.97, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 12, scale: 0.98, filter: 'blur(3px)' }}
                    transition={panelTransition}
                    className={cn(
                      'fixed z-[190] flex flex-col overflow-hidden border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-elevated)_92%,transparent)] shadow-[var(--shadow-lg)] backdrop-blur-xl',
                      '[background-image:linear-gradient(180deg,var(--highlight),transparent_24%)]',
                      'inset-x-0 bottom-0 max-h-[min(88svh,40rem)] rounded-t-2xl',
                      'sm:inset-auto sm:right-12 sm:top-16 sm:bottom-auto sm:left-auto sm:max-h-[min(32rem,calc(100svh-5.5rem))] sm:w-[24rem] sm:rounded-2xl sm:origin-top-right',
                      'md:right-16',
                    )}
                    role="dialog"
                    aria-label="Notification center"
                    aria-modal="true"
                  >
                    <div className="flex shrink-0 justify-center pt-2 sm:hidden" aria-hidden="true">
                      <span className="h-1 w-10 rounded-full bg-[color:var(--border-strong)]" />
                    </div>

                    <div className="flex shrink-0 items-start justify-between gap-3 px-4 pb-2 pt-3">
                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-[color:var(--text-h)]">Notifications</h2>
                        <p className="text-[11px] text-[color:var(--text-muted)]">{headerUnreadLabel}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleMarkAllRead}
                          disabled={filterUnread === 0}
                          aria-label={
                            filter === 'all'
                              ? 'Mark all notifications as read'
                              : `Mark all ${GROUP_META[filter].label.toLowerCase()} notifications as read`
                          }
                        >
                          Mark all read
                        </Button>
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-h)] focus-ring sm:hidden"
                          onClick={close}
                          aria-label="Close notifications"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    <div
                      className="shrink-0 border-b border-[color:var(--border)] px-3 pb-3"
                      role="tablist"
                      aria-label="Notification categories"
                    >
                      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {FILTERS.map((item) => {
                          const Icon = item.icon
                          const active = filter === item.id
                          const total = counts[item.id]
                          const unread = unreadByFilter[item.id]
                          return (
                            <button
                              key={item.id}
                              type="button"
                              role="tab"
                              aria-selected={active}
                              onClick={() => setFilter(item.id)}
                              className={cn(
                                'inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition focus-ring',
                                active
                                  ? 'border-[color:var(--accent-border)] bg-[color:var(--accent-bg)] text-[color:var(--text-h)]'
                                  : 'border-[color:var(--border)] text-[color:var(--text-muted)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-h)]',
                              )}
                            >
                              <Icon size={12} aria-hidden="true" />
                              <span>{item.label}</span>
                              <span
                                className={cn(
                                  'mono inline-flex min-w-4 items-center justify-center rounded-md px-1 py-px text-[10px] tabular-nums',
                                  active
                                    ? unread > 0
                                      ? 'bg-[color:var(--accent)] text-[color:var(--accent-fg)]'
                                      : 'bg-[color:var(--surface-elevated)] text-[color:var(--text-muted)]'
                                    : unread > 0
                                      ? 'bg-[color:color-mix(in_srgb,var(--danger)_12%,transparent)] text-[color:var(--danger)]'
                                      : 'bg-[color:var(--surface-muted)] text-[color:var(--text-muted)]',
                                )}
                              >
                                {unread > 0 ? unread : total}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="widget-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                      {visible.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--text-muted)]">
                            <Bell size={18} aria-hidden="true" />
                          </span>
                          <div className="text-sm font-medium text-[color:var(--text-h)]">
                            {allNotifications.length === 0 ? 'All quiet' : 'Nothing here'}
                          </div>
                          <p className="text-xs text-[color:var(--text-muted)]">
                            {allNotifications.length === 0
                              ? 'New alerts and camera events will show up here.'
                              : `No ${filter === 'all' ? '' : GROUP_META[filter].label.toLowerCase() + ' '}notifications yet.`}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {visible.map((n) => (
                            <NotificationRow key={n.id} n={n} onRead={markRead} />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  )
}

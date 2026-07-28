import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Camera, ShieldAlert, Server } from 'lucide-react'
import { useNotificationStore } from '../../../store/notificationStore'
import { formatRelativeTime } from '../../../utils/format'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { cn } from '../../../lib/cn'
import type { AppNotification, NotificationGroup } from '../../../types/domain'

const GROUP_META: Array<{
  id: NotificationGroup
  label: string
  icon: typeof Bell
  tone: 'danger' | 'info' | 'neutral'
  unreadClass: string
}> = [
  {
    id: 'alerts',
    label: 'Alerts',
    icon: ShieldAlert,
    tone: 'danger',
    unreadClass:
      'border-[color:color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--danger)_10%,transparent)]',
  },
  {
    id: 'cameras',
    label: 'Cameras',
    icon: Camera,
    tone: 'info',
    unreadClass:
      'border-[color:color-mix(in_srgb,var(--info)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--info)_10%,transparent)]',
  },
  {
    id: 'system',
    label: 'System',
    icon: Server,
    tone: 'neutral',
    unreadClass: 'border-[color:var(--border-strong)] bg-[color:var(--surface-muted)]',
  },
]

function NotificationRow({
  n,
  unreadClass,
  onRead,
}: {
  n: AppNotification
  unreadClass: string
  onRead: (id: string) => void
}) {
  return (
    <button
      type="button"
      className={cn(
        'w-full rounded-xl border p-2.5 text-left transition hover:bg-[color:var(--surface-muted)] focus-ring',
        n.read ? 'border-transparent opacity-70' : unreadClass,
      )}
      onClick={() => onRead(n.id)}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold text-[color:var(--text-h)]">{n.title}</span>
        <span className="shrink-0 text-[10px] text-[color:var(--text-muted)]">
          {formatRelativeTime(n.timestamp)}
        </span>
      </div>
      <div className="mt-0.5 text-xs text-[color:var(--text-muted)]">{n.body}</div>
    </button>
  )
}

export function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const allNotifications = useNotificationStore((s) => s.notifications)
  const markRead = useNotificationStore((s) => s.markRead)
  const markAllRead = useNotificationStore((s) => s.markAllRead)

  const grouped = useMemo(() => {
    const groups: Record<NotificationGroup, AppNotification[]> = {
      alerts: [],
      cameras: [],
      system: [],
    }
    for (const n of allNotifications.slice(0, 60)) {
      groups[n.group].push(n)
    }
    return groups
  }, [allNotifications])

  const unreadCount = useMemo(
    () => allNotifications.filter((n) => !n.read).length,
    [allNotifications],
  )

  const unreadByGroup = useMemo(() => {
    const counts: Record<NotificationGroup, number> = { alerts: 0, cameras: 0, system: 0 }
    for (const n of allNotifications) {
      if (!n.read) counts[n.group] += 1
    }
    return counts
  }, [allNotifications])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        className="relative rounded-xl p-2 text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-h)] focus-ring"
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

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 cursor-default bg-transparent"
              aria-label="Close notifications"
              onClick={() => {
                setOpen(false)
                triggerRef.current?.focus()
              }}
            />
            <motion.div
              ref={panelRef}
              id="notification-center"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="absolute right-0 z-50 mt-2 w-[22rem] origin-top-right overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] shadow-[var(--shadow-lg)]"
              role="dialog"
              aria-label="Notification center"
              aria-modal="true"
            >
              <div className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-3">
                <div>
                  <h2 className="text-sm font-bold text-[color:var(--text-h)]">Notifications</h2>
                  <p className="text-[11px] text-[color:var(--text-muted)]">
                    {unreadCount} unread · grouped by source
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={markAllRead} disabled={unreadCount === 0}>
                  Mark all read
                </Button>
              </div>

              <div className="widget-scroll max-h-96 overflow-y-auto p-2">
                {allNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] text-[color:var(--text-muted)]">
                      <Bell size={18} aria-hidden="true" />
                    </span>
                    <div className="text-sm font-medium text-[color:var(--text-h)]">All quiet</div>
                    <p className="text-xs text-[color:var(--text-muted)]">New alerts and camera events will show up here.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {GROUP_META.map((group) => {
                      const items = grouped[group.id]
                      if (items.length === 0) return null
                      const Icon = group.icon
                      return (
                        <section key={group.id} aria-label={`${group.label} notifications`}>
                          <div className="mb-1.5 flex items-center justify-between px-1">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-[color:var(--text-muted)]">
                              <Icon size={12} aria-hidden="true" />
                              {group.label}
                            </div>
                            <Badge tone={group.tone} className="normal-case tracking-normal">
                              {unreadByGroup[group.id] > 0
                                ? `${unreadByGroup[group.id]} unread`
                                : `${items.length}`}
                            </Badge>
                          </div>
                          <div className="space-y-1.5">
                            {items.map((n) => (
                              <NotificationRow
                                key={n.id}
                                n={n}
                                unreadClass={group.unreadClass}
                                onRead={markRead}
                              />
                            ))}
                          </div>
                        </section>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

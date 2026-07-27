import { useEffect, useMemo, useRef, useState } from 'react'
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
}> = [
  { id: 'alerts', label: 'Alerts', icon: ShieldAlert, tone: 'danger' },
  { id: 'cameras', label: 'Cameras', icon: Camera, tone: 'info' },
  { id: 'system', label: 'System', icon: Server, tone: 'neutral' },
]

function NotificationRow({
  n,
  onRead,
}: {
  n: AppNotification
  onRead: (id: string) => void
}) {
  return (
    <button
      type="button"
      className={cn(
        'w-full rounded-xl border p-2.5 text-left transition hover:bg-[color:var(--surface-muted)] focus-ring',
        n.read
          ? 'border-transparent opacity-70'
          : 'border-[color:var(--accent-border)] bg-[color:var(--accent-bg)]',
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
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="relative">
      <button
        type="button"
        className="relative rounded-xl p-2 text-[color:var(--text-h)] transition hover:bg-[color:var(--surface-muted)] focus-ring"
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

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div
            ref={panelRef}
            id="notification-center"
            className="absolute right-0 z-50 mt-2 w-[22rem] overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] shadow-[var(--shadow-lg)]"
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
                <p className="py-10 text-center text-sm text-[color:var(--text-muted)]">No notifications yet.</p>
              ) : (
                <div className="space-y-3">
                  {GROUP_META.map((group) => {
                    const items = grouped[group.id]
                    if (items.length === 0) return null
                    const Icon = group.icon
                    return (
                      <section key={group.id} aria-label={`${group.label} notifications`}>
                        <div className="mb-1.5 flex items-center justify-between px-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
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
                            <NotificationRow key={n.id} n={n} onRead={markRead} />
                          ))}
                        </div>
                      </section>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

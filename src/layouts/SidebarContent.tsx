import { Sparkles, X } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ActivitySquare,
  Bell,
  Camera,
  LayoutDashboard,
  PieChart,
  Settings as SettingsIcon,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { useUiStore } from '../store/uiStore'
import { Badge } from '../components/ui/badge'
import { StatusDot } from '../components/ui/status-dot'
import { scrollToWidget } from '../features/command-palette/utils/scrollToWidget'
import type { WidgetId } from '../features/dashboard/widgets/widgetRegistry'

export const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, widgetId: null as WidgetId | null },
  { to: '/dashboard', label: 'Cameras', icon: Camera, widgetId: 'cameras' as WidgetId },
  { to: '/dashboard', label: 'Alerts', icon: Bell, widgetId: 'alerts' as WidgetId },
  { to: '/dashboard', label: 'Incidents', icon: ActivitySquare, widgetId: 'incidents' as WidgetId },
  { to: '/dashboard', label: 'Analytics', icon: PieChart, widgetId: 'analytics' as WidgetId },
  { to: '/dashboard', label: 'Activity', icon: Sparkles, widgetId: 'activity' as WidgetId },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, widgetId: null as WidgetId | null },
] as const

type SidebarContentProps = {
  expanded: boolean
  onNavigate?: () => void
  showClose?: boolean
  onClose?: () => void
}

export function SidebarContent({ expanded, onNavigate, showClose, onClose }: SidebarContentProps) {
  const location = useLocation()

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex shrink-0 items-center border-b border-[color:var(--border)]',
          expanded ? 'justify-between px-4 pb-3.5 pt-5' : 'justify-center px-2 pb-3 pt-5',
        )}
      >
        <div className={cn('flex min-w-0 items-center', expanded ? 'gap-3' : 'justify-center')}>
          <div
            aria-hidden="true"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--accent)] text-[color:var(--accent-fg)] shadow-[var(--shadow-sm)]"
          >
            <Sparkles size={18} />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[color:var(--surface)] bg-emerald-400" />
          </div>

          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.div
                key="brand"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="min-w-0 overflow-hidden"
              >
                <div className="truncate text-md font-bold tracking-tight text-[color:var(--text-h)]">Vigil</div>
                <div className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
                  AI Ops Center
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {showClose ? (
          <button
            type="button"
            className="rounded-lg p-2 text-[color:var(--text-h)] hover:bg-black/5 lg:hidden focus-ring"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      <nav
        className={cn(
          'min-h-0 flex-1 space-y-0.5 overflow-y-auto py-2',
          expanded ? 'px-2' : 'px-1.5',
        )}
        aria-label="Sidebar navigation"
      >
        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              key="section-label"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]"
            >
              Operations
            </motion.div>
          ) : null}
        </AnimatePresence>

        {navItems.map((item) => {
          const Icon = item.icon
          const isSettings = item.to === '/settings'
          const isActiveRoute = isSettings
            ? location.pathname.startsWith('/settings')
            : location.pathname.startsWith('/dashboard') && item.label === 'Dashboard'

          return (
            <NavLink
              key={item.label}
              to={item.to}
              title={expanded ? undefined : item.label}
              onClick={(e) => {
                if (item.widgetId && location.pathname.startsWith('/dashboard')) {
                  e.preventDefault()
                  scrollToWidget(item.widgetId)
                }
                onNavigate?.()
              }}
              className={cn(
                'group relative flex items-center rounded-xl text-sm font-medium outline-none transition-all focus-ring',
                expanded ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5',
                isActiveRoute
                  ? 'bg-[color:var(--accent-bg)] text-[color:var(--text-h)] shadow-[inset_0_0_0_1px_var(--accent-border)]'
                  : 'text-[color:var(--text)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-h)]',
              )}
            >
              {!expanded && isActiveRoute ? (
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[color:var(--accent)]"
                  aria-hidden="true"
                />
              ) : null}

              <Icon
                size={18}
                className={cn(
                  'shrink-0 transition-colors',
                  isActiveRoute ? 'text-[color:var(--accent)]' : 'text-[color:var(--text-muted)] group-hover:text-[color:var(--text-h)]',
                )}
                aria-hidden="true"
              />

              <AnimatePresence initial={false}>
                {expanded ? (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="truncate overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </NavLink>
          )
        })}
      </nav>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="footer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mt-auto shrink-0 border-t border-[color:var(--border)] bg-[color:var(--surface)] p-3"
          >
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[color:var(--text-h)]">System</span>
                <Badge tone="success">
                  <StatusDot status="live" pulse />
                  Live
                </Badge>
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[color:var(--text-muted)]">
                Event engine streaming simulated ops telemetry.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="footer-collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-auto shrink-0 border-t border-[color:var(--border)] p-3"
          >
            <div className="flex justify-center" title="System live">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]">
                <StatusDot status="live" pulse />
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function MobileSidebar() {
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen)
  const closeMobileNav = useUiStore((s) => s.closeMobileNav)

  return (
    <AnimatePresence>
      {mobileNavOpen ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] lg:hidden"
            aria-label="Close navigation menu"
            onClick={closeMobileNav}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 36 }}
            className="fixed inset-y-0 left-0 z-50 w-72 border-r border-[color:var(--border)] bg-[color:var(--surface)] shadow-[var(--shadow-lg)] lg:hidden"
            aria-label="Mobile navigation"
          >
            <SidebarContent expanded showClose onClose={closeMobileNav} onNavigate={closeMobileNav} />
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}

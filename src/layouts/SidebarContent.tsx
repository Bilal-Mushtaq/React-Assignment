import { useState } from 'react'
import { ChevronDown, Radio, Sparkles, X } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
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
import { useAlertsStore } from '../store/alertsStore'
import { Badge } from '../components/ui/badge'
import { StatusDot } from '../components/ui/status-dot'
import { scrollToWidget } from '../features/command-palette/utils/scrollToWidget'
import type { WidgetId } from '../features/dashboard/widgets/widgetRegistry'
import { fadeQuick, fadeSoft } from '../lib/motion'

const dashboardChildren: Array<{
  label: string
  icon: typeof Camera
  widgetId: WidgetId
}> = [
  { label: 'Cameras', icon: Camera, widgetId: 'cameras' },
  { label: 'Activity', icon: Radio, widgetId: 'activity' },
  { label: 'Incidents', icon: ActivitySquare, widgetId: 'incidents' },
  { label: 'Analytics', icon: PieChart, widgetId: 'analytics' },
  { label: 'Alerts', icon: Bell, widgetId: 'alerts' },
]

type SidebarContentProps = {
  expanded: boolean
  onNavigate?: () => void
  showClose?: boolean
  onClose?: () => void
}

export function SidebarContent({ expanded, onNavigate, showClose, onClose }: SidebarContentProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const activeWidgetId = useUiStore((s) => s.activeWidgetId)
  const setActiveWidgetId = useUiStore((s) => s.setActiveWidgetId)
  const activeAlerts = useAlertsStore(
    (s) => s.alerts.filter((a) => a.status !== 'resolved').length,
  )
  const [dashboardOpen, setDashboardOpen] = useState(true)

  const onDashboard = location.pathname.startsWith('/dashboard')
  const onSettings = location.pathname.startsWith('/settings')

  const goDashboard = () => {
    setActiveWidgetId(null)
    if (!onDashboard) navigate('/dashboard')
    setDashboardOpen(true)
    onNavigate?.()
  }

  const goWidget = (widgetId: WidgetId) => {
    if (!onDashboard) {
      navigate('/dashboard')
      window.setTimeout(() => scrollToWidget(widgetId), 280)
    } else {
      scrollToWidget(widgetId)
    }
    setDashboardOpen(true)
    onNavigate?.()
  }

  return (
    <div className="relative flex h-full flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-[color:var(--accent)]/35"
      />

      <div
        className={cn(
          'flex shrink-0 items-center border-b border-[color:var(--border)]',
          expanded ? 'justify-between px-4 pb-3.5 pt-5' : 'justify-center px-2 pb-3 pt-5',
        )}
      >
        <div className={cn('flex min-w-0 items-center', expanded ? 'gap-3' : 'justify-center')}>
          <div
            aria-hidden="true"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color:var(--accent-border)] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--accent)_88%,white),var(--accent))] text-[color:var(--accent-fg)] shadow-[var(--shadow-md)]"
          >
            <Sparkles size={17} strokeWidth={2.25} />
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[color:var(--surface)] bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]" />
          </div>

          <AnimatePresence initial={false}>
            {expanded ? (
              <motion.div
                key="brand"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={fadeSoft}
                className="min-w-0 overflow-hidden"
              >
                <div className="truncate text-lg font-bold tracking-tight text-[color:var(--text-h)]">Vigil</div>
                <div className="truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                  AI Ops Center
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {showClose ? (
          <button
            type="button"
            className="rounded-lg p-2 text-[color:var(--text-h)] transition hover:bg-[color:var(--surface-muted)] lg:hidden focus-ring"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      <nav
        className={cn('min-h-0 flex-1 space-y-1 overflow-y-auto py-2', expanded ? 'px-2' : 'px-1.5')}
        aria-label="Sidebar navigation"
      >
        <AnimatePresence initial={false}>
          {expanded ? (
            <motion.div
              key="section-label"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={fadeQuick}
              className="overflow-hidden px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]"
            >
              Operations
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className={cn(expanded && dashboardOpen && onDashboard && 'rounded-2xl bg-[color:var(--surface-muted)]/55 p-1')}>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              title={expanded ? undefined : 'Dashboard'}
              aria-label="Dashboard"
              onClick={goDashboard}
              className={cn(
                'group relative flex min-w-0 flex-1 items-center rounded-xl text-sm font-medium outline-none transition-all duration-300 ease-out focus-ring',
                expanded ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5',
                onDashboard && !activeWidgetId
                  ? 'bg-[color:var(--accent-bg)] text-[color:var(--text-h)] shadow-[inset_0_0_0_1px_var(--accent-border)]'
                  : onDashboard
                    ? 'text-[color:var(--text-h)]'
                    : 'text-[color:var(--text)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-h)]',
              )}
            >
              {!expanded && onDashboard && !activeWidgetId ? (
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[color:var(--accent)]"
                  aria-hidden="true"
                />
              ) : null}
              <LayoutDashboard
                size={18}
                className={cn(
                  'shrink-0 transition-colors duration-300 ease-out',
                  onDashboard && !activeWidgetId
                    ? 'text-[color:var(--accent)]'
                    : onDashboard
                      ? 'text-[color:var(--text-h)]'
                      : 'text-[color:var(--text-muted)] group-hover:text-[color:var(--text-h)]',
                )}
                aria-hidden="true"
              />
              {expanded ? <span className="truncate">Dashboard</span> : null}
            </button>

            {expanded ? (
              <button
                type="button"
                className="rounded-lg p-2 text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-h)] focus-ring"
                aria-expanded={dashboardOpen}
                aria-label={dashboardOpen ? 'Collapse dashboard widgets' : 'Expand dashboard widgets'}
                onClick={() => setDashboardOpen((v) => !v)}
              >
                <ChevronDown
                  size={16}
                  className={cn('transition-transform duration-300 ease-out', dashboardOpen ? 'rotate-0' : '-rotate-90')}
                />
              </button>
            ) : null}
          </div>

          <AnimatePresence initial={false}>
            {expanded && dashboardOpen ? (
              <motion.div
                key="dashboard-children-expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div
                  className="relative ml-4 mt-0.5 space-y-0.5 border-l border-[color:var(--border)] py-1 pl-2"
                  role="group"
                  aria-label="Dashboard widgets"
                >
                  {dashboardChildren.map((item) => {
                    const Icon = item.icon
                    const active = onDashboard && activeWidgetId === item.widgetId
                    return (
                      <button
                        key={item.widgetId}
                        type="button"
                        onClick={() => goWidget(item.widgetId)}
                        className={cn(
                          'group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium outline-none transition-all duration-300 ease-out focus-ring',
                          active
                            ? 'bg-[color:var(--accent-bg)] text-[color:var(--text-h)]'
                            : 'text-[color:var(--text)] hover:bg-[color:var(--surface-elevated)] hover:text-[color:var(--text-h)]',
                        )}
                      >
                        {active ? (
                          <span
                            className="absolute -left-[9px] top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[color:var(--accent)]"
                            aria-hidden="true"
                          />
                        ) : null}
                        <Icon
                          size={15}
                          className={cn(
                            'shrink-0 transition-colors',
                            active
                              ? 'text-[color:var(--accent)]'
                              : 'text-[color:var(--text-muted)] group-hover:text-[color:var(--text-h)]',
                          )}
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {!expanded ? (
            <div className="mt-0.5 space-y-0.5" role="group" aria-label="Dashboard widgets">
              {dashboardChildren.map((item) => {
                const Icon = item.icon
                const active = onDashboard && activeWidgetId === item.widgetId
                return (
                  <button
                    key={item.widgetId}
                    type="button"
                    title={item.label}
                    aria-label={item.label}
                    onClick={() => goWidget(item.widgetId)}
                    className={cn(
                      'group relative flex w-full items-center justify-center rounded-xl p-2.5 outline-none transition-all duration-300 ease-out focus-ring',
                      active
                        ? 'bg-[color:var(--accent-bg)] text-[color:var(--text-h)]'
                        : 'text-[color:var(--text)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-h)]',
                    )}
                  >
                    {active ? (
                      <span
                        className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[color:var(--accent)]"
                        aria-hidden="true"
                      />
                    ) : null}
                    <Icon
                      size={18}
                      className={cn(
                        'shrink-0 transition-colors',
                        active
                          ? 'text-[color:var(--accent)]'
                          : 'text-[color:var(--text-muted)] group-hover:text-[color:var(--text-h)]',
                      )}
                      aria-hidden="true"
                    />
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>

        <NavLink
          to="/settings"
          title={expanded ? undefined : 'Settings'}
          onClick={() => {
            setActiveWidgetId(null)
            onNavigate?.()
          }}
          className={cn(
            'group relative flex items-center rounded-xl text-sm font-medium outline-none transition-all duration-300 ease-out focus-ring',
            expanded ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5',
            onSettings
              ? 'bg-[color:var(--accent-bg)] text-[color:var(--text-h)] shadow-[inset_0_0_0_1px_var(--accent-border)]'
              : 'text-[color:var(--text)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-h)]',
          )}
        >
          {!expanded && onSettings ? (
            <span
              className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[color:var(--accent)]"
              aria-hidden="true"
            />
          ) : null}
          <SettingsIcon
            size={18}
            className={cn(
              'shrink-0 transition-colors duration-300 ease-out',
              onSettings ? 'text-[color:var(--accent)]' : 'text-[color:var(--text-muted)] group-hover:text-[color:var(--text-h)]',
            )}
            aria-hidden="true"
          />
          {expanded ? <span className="truncate">Settings</span> : null}
        </NavLink>
      </nav>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="footer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={fadeSoft}
            className="mt-auto shrink-0 border-t border-[color:var(--border)] p-3"
          >
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-muted)_85%,transparent)] p-3 shadow-[var(--shadow-sm)] [background-image:linear-gradient(180deg,var(--highlight),transparent_50%)]">
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
            transition={fadeQuick}
            className="mt-auto shrink-0 border-t border-[color:var(--border)] p-3"
          >
            <div className="flex justify-center" title={`${activeAlerts} open alerts · system live`}>
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
            className="fixed inset-0 z-40 bg-[color:color-mix(in_srgb,var(--bg)_40%,black)] backdrop-blur-[2px] lg:hidden"
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

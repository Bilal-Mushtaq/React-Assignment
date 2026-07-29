import { Menu, Moon, PanelLeft, Search, Settings as SettingsIcon, Sun } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { NotificationPanel } from '../features/notifications/components/NotificationPanel'
import { useCommandPaletteStore } from '../store/commandPaletteStore'
import { useThemeStore } from '../store/themeStore'
import { useUiStore } from '../store/uiStore'
import { useActivityStore } from '../store/activityStore'
import { cn } from '../lib/cn'

function isApplePlatform() {
  if (typeof navigator === 'undefined') return false
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform
  const source = platform ?? navigator.platform ?? navigator.userAgent
  return /Mac|iPhone|iPad|iPod/i.test(source)
}

const PAGE_META: Record<string, { eyebrow: string; title: string }> = {
  '/dashboard': { eyebrow: 'Operations', title: 'Dashboard' },
  '/settings': { eyebrow: 'Preferences', title: 'Settings' },
}

export function TopNavBar() {
  const location = useLocation()
  const openPalette = useCommandPaletteStore((s) => s.openPalette)
  const toggleMobileNav = useUiStore((s) => s.toggleMobileNav)
  const sidebarExpanded = useThemeStore((s) => s.sidebarExpanded)
  const toggleSidebarExpanded = useThemeStore((s) => s.toggleSidebarExpanded)
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)
  const totalGenerated = useActivityStore((s) => s.totalGenerated)

  const isDark =
    mode === 'dark' ||
    (mode === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  const toggleTheme = () => setMode(isDark ? 'light' : 'dark')

  const meta =
    Object.entries(PAGE_META).find(([path]) => location.pathname.startsWith(path))?.[1] ??
    PAGE_META['/dashboard']

  const shortcut = isApplePlatform() ? '⌘K' : 'Ctrl+K'

  return (
    <header
      className="chrome-glass z-30 flex h-14 shrink-0 items-center justify-between border-b border-[color:var(--border)] px-4 lg:px-5"
      aria-label="Top navigation"
    >
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <button
          type="button"
          className="btn-icon rounded-lg p-2 text-[color:var(--text-h)] focus-ring lg:hidden"
          onClick={toggleMobileNav}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <button
          type="button"
          className={cn(
            'btn-icon hidden rounded-lg p-2 focus-ring lg:inline-flex',
            !sidebarExpanded && 'bg-[color:var(--surface-muted)] text-[color:var(--text-h)]',
          )}
          onClick={toggleSidebarExpanded}
          aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-pressed={!sidebarExpanded}
        >
          <PanelLeft size={18} />
        </button>

        <div className="hidden h-5 w-px bg-[color:var(--border)] lg:block" aria-hidden="true" />

        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-muted)]">
            {meta.eyebrow}
          </div>
          <h1 className="truncate text-[15px] font-bold tracking-tight text-[color:var(--text-h)]">{meta.title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="mr-1 hidden items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)]/80 px-3 py-1.5 text-[11px] text-[color:var(--text-muted)] xl:flex">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="font-medium text-[color:var(--text)]">Events</span>
          <span className="mono font-semibold tabular-nums text-[color:var(--text-h)]">
            {totalGenerated.toLocaleString()}
          </span>
        </div>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)]/90 px-3 py-2 text-sm text-[color:var(--text-h)] shadow-[var(--shadow-sm)] transition hover:border-[color:var(--accent-border)] hover:bg-[color:var(--surface-muted)] focus-ring sm:min-w-[11.5rem] sm:px-3.5"
          aria-label="Open command palette"
          onClick={openPalette}
        >
          <Search size={15} className="text-[color:var(--text-muted)]" />
          <span className="hidden flex-1 text-left text-xs text-[color:var(--text-muted)] md:inline">Search ops…</span>
          <kbd className="mono hidden rounded-md border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-1.5 py-0.5 text-[10px] text-[color:var(--text-muted)] lg:inline">
            {shortcut}
          </kbd>
        </button>

        <button
          type="button"
          className="btn-icon rounded-xl p-2 focus-ring"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <NotificationPanel />

        <Link
          to="/settings"
          className="btn-icon rounded-xl p-2 focus-ring"
          aria-label="Settings"
        >
          <SettingsIcon size={17} />
        </Link>
      </div>
    </header>
  )
}

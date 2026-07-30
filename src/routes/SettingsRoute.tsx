import { Monitor, Moon, Palette, PanelLeft, RotateCcw, Sun, Type } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { SettingsSkeleton } from '../components/common/PageSkeletons'
import { usePageReady } from '../hooks/usePageReady'
import { cn } from '../lib/cn'
import { THEME_DEFAULTS, useThemeStore, type ThemeMode } from '../store/themeStore'

const MODE_OPTIONS: Array<{
  value: ThemeMode
  label: string
  description: string
  icon: typeof Sun
}> = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright surfaces for daytime ops',
    icon: Sun,
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Low-glare command center look',
    icon: Moon,
  },
  {
    value: 'system',
    label: 'System',
    description: 'Follow OS appearance setting',
    icon: Monitor,
  },
]

const ACCENT_PRESETS = ['#AEAFB5', '#FFFFFF', '#161B2A', '#8B8D96', '#C8C9CE', '#4A5568'] as const

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-3 border-b border-[color:var(--border)] pb-2.5">
      <h3 className="text-[13px] font-semibold text-[color:var(--text-h)]">{title}</h3>
      <p className="mt-0.5 text-[11px] text-[color:var(--text-muted)]">{description}</p>
    </div>
  )
}

export default function SettingsRoute() {
  const ready = usePageReady('settings', 420, true)
  const mode = useThemeStore((s) => s.mode)
  const accent = useThemeStore((s) => s.accent)
  const baseFontSize = useThemeStore((s) => s.baseFontSize)
  const borderRadius = useThemeStore((s) => s.borderRadius)
  const sidebarExpanded = useThemeStore((s) => s.sidebarExpanded)
  const setMode = useThemeStore((s) => s.setMode)
  const setAccent = useThemeStore((s) => s.setAccent)
  const setBaseFontSize = useThemeStore((s) => s.setBaseFontSize)
  const setBorderRadius = useThemeStore((s) => s.setBorderRadius)
  const setSidebarExpanded = useThemeStore((s) => s.setSidebarExpanded)
  const resetToDefaults = useThemeStore((s) => s.resetToDefaults)

  const isDefault =
    mode === THEME_DEFAULTS.mode &&
    accent.toLowerCase() === THEME_DEFAULTS.accent.toLowerCase() &&
    baseFontSize === THEME_DEFAULTS.baseFontSize &&
    borderRadius === THEME_DEFAULTS.borderRadius &&
    sidebarExpanded === THEME_DEFAULTS.sidebarExpanded

  if (!ready) return <SettingsSkeleton />

  return (
    <div className="w-full space-y-4 pb-8" aria-label="Settings">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-elevated)_88%,transparent)] p-4 shadow-[var(--shadow-sm)] backdrop-blur-md [background-image:linear-gradient(180deg,var(--highlight),transparent_40%)]">
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-[color:var(--text-h)]">Appearance</h2>
          <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">
            Theme, accent, and density — changes apply instantly
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={resetToDefaults}
          disabled={isDefault}
          aria-label="Reset appearance settings to defaults"
        >
          <RotateCcw size={14} />
          Reset defaults
        </Button>
      </header>

      <section className="widget-surface rounded-2xl p-4">
        <SectionTitle title="Theme mode" description="Choose how Vigil renders across screens" />

        <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Theme mode">
          {MODE_OPTIONS.map((option) => {
            const Icon = option.icon
            const selected = mode === option.value
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setMode(option.value)}
                className={cn(
                  'group rounded-2xl border p-3.5 text-left transition focus-ring',
                  selected
                    ? 'border-[color:var(--accent-border)] bg-[color:var(--accent-bg)] shadow-[inset_0_0_0_1px_var(--accent-border)]'
                    : 'border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 hover:border-[color:var(--border-strong)] hover:bg-[color:var(--surface-muted)]',
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition',
                    selected
                      ? 'bg-[color:var(--accent)] text-[color:var(--accent-fg)]'
                      : 'bg-[color:var(--surface-elevated)] text-[color:var(--text-muted)] group-hover:text-[color:var(--text-h)]',
                  )}
                >
                  <Icon size={15} aria-hidden="true" />
                </span>
                <div className="mt-2.5 text-[13px] font-semibold text-[color:var(--text-h)]">{option.label}</div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-[color:var(--text-muted)]">{option.description}</p>
              </button>
            )
          })}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="widget-surface rounded-2xl p-4">
          <SectionTitle title="Accent color" description="Brand highlight used across controls" />

          <div className="flex flex-wrap items-center gap-2">
            {ACCENT_PRESETS.map((preset) => {
              const selected = accent.toLowerCase() === preset.toLowerCase()
              return (
                <button
                  key={preset}
                  type="button"
                  aria-label={`Set accent to ${preset}`}
                  aria-pressed={selected}
                  onClick={() => setAccent(preset)}
                  className={cn(
                    'h-8 w-8 rounded-lg border-2 transition focus-ring',
                    selected
                      ? 'border-[color:var(--text-h)] shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--accent-border)]'
                      : 'border-transparent hover:border-[color:var(--border-strong)]',
                  )}
                  style={{ backgroundColor: preset }}
                />
              )
            })}
            <label className="relative ml-1 inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-muted)]/50 px-2.5 text-xs font-medium text-[color:var(--text-h)] transition hover:bg-[color:var(--surface-muted)]">
              <Palette size={12} aria-hidden="true" />
              Custom
              <input
                type="color"
                value={accent}
                aria-label="Custom accent color"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={(e) => setAccent(e.target.value)}
              />
              <span
                className="h-3.5 w-3.5 rounded-md border border-[color:var(--border)]"
                style={{ backgroundColor: accent }}
                aria-hidden="true"
              />
            </label>
          </div>

          <div className="mt-3 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">
              Preview
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="primary">
                Primary action
              </Button>
              <Button size="sm" variant="secondary">
                Secondary
              </Button>
              <Badge tone="accent">Accent badge</Badge>
              <span className="mono text-[11px] text-[color:var(--text-muted)]">{accent.toUpperCase()}</span>
            </div>
          </div>
        </section>

        <section className="widget-surface rounded-2xl p-4">
          <SectionTitle title="Sidebar" description="Default desktop navigation width" />

          <button
            type="button"
            role="switch"
            aria-checked={sidebarExpanded}
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className={cn(
              'flex w-full items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition focus-ring',
              sidebarExpanded
                ? 'border-[color:var(--accent-border)] bg-[color:var(--accent-bg)]'
                : 'border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 hover:bg-[color:var(--surface-muted)]',
            )}
          >
            <div className="flex items-start gap-2.5">
              <PanelLeft size={16} className="mt-0.5 text-[color:var(--accent)]" aria-hidden="true" />
              <div>
                <div className="text-[13px] font-semibold text-[color:var(--text-h)]">Expanded sidebar</div>
                <p className="mt-0.5 text-[11px] text-[color:var(--text-muted)]">
                  {sidebarExpanded ? 'Labels and system status are visible.' : 'Icon-only compact navigation.'}
                </p>
              </div>
            </div>
            <span
              className={cn(
                'relative h-6 w-11 shrink-0 rounded-full transition',
                sidebarExpanded ? 'bg-[color:var(--accent)]' : 'bg-[color:var(--border-strong)]',
              )}
              aria-hidden="true"
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition',
                  sidebarExpanded ? 'left-5' : 'left-0.5',
                )}
              />
            </span>
          </button>
        </section>
      </div>

      <section className="widget-surface rounded-2xl p-4">
        <SectionTitle title="Density & radius" description="Live adjustments — no apply step needed" />

        <div className="grid gap-4 lg:grid-cols-2">
          <label className="block rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/35 p-3.5">
            <div className="mb-3 flex items-center gap-2">
              <Type size={14} className="text-[color:var(--accent)]" aria-hidden="true" />
              <span className="mono rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-2 py-1 text-[11px] font-medium text-[color:var(--text-h)]">
                {baseFontSize}px
              </span>
              <span className="text-[13px] font-semibold text-[color:var(--text-h)]">Font size</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="mono w-8 text-left text-[11px] text-[color:var(--text-muted)]">14</span>
              <input
                type="range"
                min={14}
                max={22}
                step={1}
                value={baseFontSize}
                aria-label="Font size"
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[color:var(--border)] accent-[color:var(--accent)]"
                onChange={(e) => setBaseFontSize(Number(e.target.value))}
              />
              <span className="mono w-8 text-right text-[11px] text-[color:var(--text-muted)]">22</span>
            </div>
          </label>

          <label className="block rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/35 p-3.5">
            <div className="mb-3 flex items-center gap-2">
              <span className="mono rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-2 py-1 text-[11px] font-medium text-[color:var(--text-h)]">
                {borderRadius}px
              </span>
              <span className="text-[13px] font-semibold text-[color:var(--text-h)]">Border radius</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="mono w-8 text-left text-[11px] text-[color:var(--text-muted)]">6</span>
              <input
                type="range"
                min={6}
                max={18}
                step={1}
                value={borderRadius}
                aria-label="Border radius"
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[color:var(--border)] accent-[color:var(--accent)]"
                onChange={(e) => setBorderRadius(Number(e.target.value))}
              />
              <span className="mono w-8 text-right text-[11px] text-[color:var(--text-muted)]">18</span>
            </div>
            <div
              className="mt-3 h-9 border border-[color:var(--accent-border)] bg-[color:var(--accent-bg)]"
              style={{ borderRadius: `${borderRadius}px` }}
              aria-hidden="true"
            />
          </label>
        </div>
      </section>
    </div>
  )
}

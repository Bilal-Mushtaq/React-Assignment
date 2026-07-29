import { type PropsWithChildren, useEffect } from 'react'
import { useThemeStore } from '../../store/themeStore'

function resolveEffectiveMode(mode: 'system' | 'light' | 'dark') {
  if (mode !== 'system') return mode
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function accentForeground(hex: string) {
  const raw = hex.replace('#', '')
  if (raw.length < 6) return '#161B2A'
  const r = Number.parseInt(raw.slice(0, 2), 16)
  const g = Number.parseInt(raw.slice(2, 4), 16)
  const b = Number.parseInt(raw.slice(4, 6), 16)
  if ([r, g, b].some((n) => Number.isNaN(n))) return '#161B2A'
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#161B2A' : '#FFFFFF'
}

function withAlpha(hex: string, alphaHex: string) {
  const raw = hex.replace('#', '')
  if (raw.length !== 6) return hex
  return `#${raw}${alphaHex}`
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const mode = useThemeStore((s) => s.mode)
  const accent = useThemeStore((s) => s.accent)
  const sidebarExpanded = useThemeStore((s) => s.sidebarExpanded)
  const baseFontSize = useThemeStore((s) => s.baseFontSize)
  const borderRadius = useThemeStore((s) => s.borderRadius)

  useEffect(() => {
    const root = document.documentElement

    const applyTheme = () => {
      const effectiveMode = resolveEffectiveMode(mode)
      root.dataset.theme = effectiveMode
      root.style.setProperty('--accent', accent)
      root.style.setProperty('--accent-fg', accentForeground(accent))
      root.style.setProperty('--accent-bg', withAlpha(accent, '1a'))
      root.style.setProperty('--accent-border', withAlpha(accent, '59'))
      root.style.setProperty('--accent-glow', withAlpha(accent, '2e'))
      root.style.setProperty('--radius', `${borderRadius}px`)
      root.style.setProperty('--base-font-size', `${baseFontSize}px`)
      root.style.setProperty('--sidebar-expanded', sidebarExpanded ? '1' : '0')
    }

    applyTheme()

    if (mode !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [mode, accent, sidebarExpanded, baseFontSize, borderRadius])

  return children
}

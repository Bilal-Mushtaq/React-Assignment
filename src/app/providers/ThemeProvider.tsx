import { type PropsWithChildren, useEffect } from 'react'
import { useThemeStore } from '../../store/themeStore'

function resolveEffectiveMode(mode: 'system' | 'light' | 'dark') {
  if (mode !== 'system') return mode
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
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
      root.style.setProperty('--accent-bg', `${accent}1a`)
      root.style.setProperty('--accent-border', `${accent}59`)
      root.style.setProperty('--accent-glow', `${accent}2e`)
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

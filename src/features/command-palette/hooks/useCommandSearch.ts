import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SITE } from '../../../constants/mockData'
import { widgetDefinitions } from '../../dashboard/widgets/widgetRegistry'
import { useAlertsStore } from '../../../store/alertsStore'
import { useCameraStore } from '../../../store/cameraStore'
import { useThemeStore } from '../../../store/themeStore'
import type { CommandGroup, CommandItem } from '../types'
import { scrollToWidget } from '../utils/scrollToWidget'

function matchesQuery(item: Pick<CommandItem, 'title' | 'subtitle' | 'keywords'>, query: string) {
  if (!query.trim()) return true
  const q = query.trim().toLowerCase()
  const haystack = [item.title, item.subtitle ?? '', ...item.keywords].join(' ').toLowerCase()
  return haystack.includes(q)
}

function groupItems(items: CommandItem[]): CommandGroup[] {
  const order: Array<CommandGroup['label']> = ['Navigation', 'Widgets', 'Cameras', 'Alerts', 'Actions']
  const map = new Map<string, CommandItem[]>()

  for (const item of items) {
    const label =
      item.category === 'navigation'
        ? 'Navigation'
        : item.category === 'widget'
          ? 'Widgets'
          : item.category === 'camera'
            ? 'Cameras'
            : item.category === 'alert'
              ? 'Alerts'
              : 'Actions'
    const list = map.get(label) ?? []
    list.push(item)
    map.set(label, list)
  }

  return order
    .filter((label) => map.has(label))
    .map((label) => ({ label, items: map.get(label)! }))
}

export function useCommandSearch(query: string) {
  const navigate = useNavigate()
  const cameras = useCameraStore((s) => s.cameras)
  const alerts = useAlertsStore((s) => s.alerts)
  const setMode = useThemeStore((s) => s.setMode)

  return useMemo(() => {
    const items: CommandItem[] = []

    const navItems: CommandItem[] = [
      {
        id: 'nav-dashboard',
        category: 'navigation',
        title: 'Go to Dashboard',
        subtitle: '/dashboard',
        keywords: ['home', 'overview', 'command center'],
        onSelect: () => navigate('/dashboard'),
      },
      {
        id: 'nav-cameras',
        category: 'navigation',
        title: 'Go to Cameras',
        subtitle: `/cameras · ${SITE.name}`,
        keywords: ['feeds', 'mall', 'alnakheel', 'cameras'],
        onSelect: () => navigate('/cameras'),
      },
      {
        id: 'nav-activity',
        category: 'navigation',
        title: 'Go to Activity',
        subtitle: '/activity · live ops stream',
        keywords: ['feed', 'events', 'timeline', 'activity', 'log'],
        onSelect: () => navigate('/activity'),
      },
      {
        id: 'nav-alerts',
        category: 'navigation',
        title: 'Go to Alerts',
        subtitle: '/alerts · acknowledge & resolve',
        keywords: ['alert', 'critical', 'severity', 'ack'],
        onSelect: () => navigate('/alerts'),
      },
      {
        id: 'nav-incidents',
        category: 'navigation',
        title: 'Go to Incidents',
        subtitle: '/incidents · case timeline',
        keywords: ['incident', 'case', 'timeline'],
        onSelect: () => navigate('/incidents'),
      },
      {
        id: 'nav-traffic',
        category: 'navigation',
        title: 'Go to Mall Traffic',
        subtitle: '/traffic · visitors & busy hours',
        keywords: ['analytics', 'heatmap', 'visitors', 'traffic', 'charts'],
        onSelect: () => navigate('/traffic'),
      },
      {
        id: 'nav-settings',
        category: 'navigation',
        title: 'Go to Settings',
        subtitle: '/settings',
        keywords: ['theme', 'preferences', 'customization'],
        onSelect: () => navigate('/settings'),
      },
    ]

    items.push(...navItems.filter((item) => matchesQuery(item, query)))

    for (const def of Object.values(widgetDefinitions)) {
      const item: CommandItem = {
        id: `widget-${def.id}`,
        category: 'widget',
        title: def.title,
        subtitle: 'Dashboard widget',
        keywords: [def.id, 'widget', 'panel'],
        onSelect: () => {
          navigate('/dashboard')
          scrollToWidget(def.id)
        },
      }
      if (matchesQuery(item, query)) items.push(item)
    }

    for (const camera of cameras) {
      const item: CommandItem = {
        id: `camera-${camera.id}`,
        category: 'camera',
        title: camera.name,
        subtitle: `${camera.zone} · ${camera.status} · AI ${camera.aiConfidence}%`,
        keywords: [camera.id, camera.zone, camera.status, 'camera', 'feed', 'mall'],
        onSelect: () => navigate(`/cameras/${camera.id}`),
      }
      if (matchesQuery(item, query)) items.push(item)
    }

    for (const alert of alerts.slice(0, 40)) {
      const item: CommandItem = {
        id: `alert-${alert.id}`,
        category: 'alert',
        title: alert.title,
        subtitle: `${alert.severity} · ${alert.status}`,
        keywords: [alert.severity, alert.status, alert.message, 'alert', 'incident'],
        onSelect: () => {
          if (alert.cameraId) navigate(`/cameras/${alert.cameraId}`)
          else {
            navigate('/dashboard')
            scrollToWidget('alerts')
          }
        },
      }
      if (matchesQuery(item, query)) items.push(item)
    }

    const actions: CommandItem[] = [
      {
        id: 'action-light',
        category: 'action',
        title: 'Switch to Light Theme',
        keywords: ['theme', 'light', 'appearance'],
        onSelect: () => setMode('light'),
      },
      {
        id: 'action-dark',
        category: 'action',
        title: 'Switch to Dark Theme',
        keywords: ['theme', 'dark', 'appearance'],
        onSelect: () => setMode('dark'),
      },
      {
        id: 'action-system',
        category: 'action',
        title: 'Use System Theme',
        keywords: ['theme', 'system', 'appearance'],
        onSelect: () => setMode('system'),
      },
    ]

    items.push(...actions.filter((item) => matchesQuery(item, query)))

    return {
      groups: groupItems(items),
      flatItems: items,
      total: items.length,
    }
  }, [query, cameras, alerts, navigate, setMode])
}

import type { JSX } from 'react'
import type { Layout, ResponsiveLayouts } from 'react-grid-layout'
import { ActivityFeedWidget } from './ActivityFeedWidget'
import { AnalyticsHeatmapWidget } from './AnalyticsHeatmapWidget'
import { AlertsWidget } from './AlertsWidget'
import { CamerasWidget } from './CamerasWidget'
import { IncidentsWidget } from './IncidentsWidget'
import { KpiWidget } from './KpiWidget'

export type WidgetId = 'kpis' | 'cameras' | 'alerts' | 'incidents' | 'analytics' | 'activity'

export type WidgetDefinition = {
  id: WidgetId
  title: string
  component: () => JSX.Element
}

export const widgetDefinitions: Record<WidgetId, WidgetDefinition> = {
  kpis: { id: 'kpis', title: 'KPI Cards', component: KpiWidget },
  cameras: { id: 'cameras', title: 'Cameras', component: CamerasWidget },
  alerts: { id: 'alerts', title: 'Alert Panel', component: AlertsWidget },
  incidents: { id: 'incidents', title: 'Incident Timeline', component: IncidentsWidget },
  analytics: { id: 'analytics', title: 'Analytics & Heatmap', component: AnalyticsHeatmapWidget },
  activity: { id: 'activity', title: 'Activity Feed', component: ActivityFeedWidget },
}

export const defaultPinnedWidgetIds: WidgetId[] = []

export function getDefaultLayouts(): ResponsiveLayouts {
  const lg: Layout = [
    { i: 'kpis', x: 0, y: 0, w: 3, h: 6, minW: 2, minH: 5 },
    { i: 'cameras', x: 3, y: 0, w: 6, h: 16, minW: 3, minH: 10 },
    { i: 'activity', x: 9, y: 0, w: 3, h: 11, minW: 2, minH: 5 },
    { i: 'incidents', x: 0, y: 6, w: 3, h: 9, minW: 2, minH: 5 },
    { i: 'analytics', x: 0, y: 16, w: 8, h: 9, minW: 3, minH: 5 },
    { i: 'alerts', x: 8, y: 16, w: 4, h: 9, minW: 2, minH: 5 },
  ]

  const md: Layout = [
    { i: 'kpis', x: 0, y: 0, w: 8, h: 6, minW: 4, minH: 4 },
    { i: 'cameras', x: 0, y: 5, w: 8, h: 14, minW: 4, minH: 10 },
    { i: 'alerts', x: 0, y: 19, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'incidents', x: 4, y: 19, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'analytics', x: 0, y: 25, w: 5, h: 6, minW: 3, minH: 4 },
    { i: 'activity', x: 5, y: 25, w: 3, h: 6, minW: 2, minH: 4 },
  ]

  const sm: Layout = [
    { i: 'kpis', x: 0, y: 0, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'cameras', x: 0, y: 5, w: 6, h: 14, minW: 4, minH: 10 },
    { i: 'alerts', x: 0, y: 19, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'incidents', x: 0, y: 25, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'analytics', x: 0, y: 31, w: 6, h: 6, minW: 4, minH: 4 },
    { i: 'activity', x: 0, y: 37, w: 6, h: 6, minW: 4, minH: 4 },
  ]

  return { lg, md, sm }
}

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low'
export type AlertStatus = 'open' | 'acknowledged' | 'resolved'

export type Alert = {
  id: string
  title: string
  message: string
  severity: AlertSeverity
  status: AlertStatus
  cameraId?: string
  createdAt: number
  updatedAt: number
}

export type CameraStatus = 'online' | 'offline' | 'degraded' | 'recording'

export type Camera = {
  id: string
  name: string
  zone: string
  status: CameraStatus
  aiConfidence: number
  lastEventAt: number
  statusChangedAt: number
}

export type ActivityEvent = {
  id: string
  type: string
  message: string
  timestamp: number
  meta?: Record<string, string>
}

export type Incident = {
  id: string
  title: string
  severity: AlertSeverity
  cameraId?: string
  timestamp: number
  resolved: boolean
}

export type NotificationGroup = 'alerts' | 'cameras' | 'system'

export type AppNotification = {
  id: string
  group: NotificationGroup
  title: string
  body: string
  timestamp: number
  read: boolean
}

export type KpiSnapshot = {
  activeAlerts: number
  camerasOnline: number
  incidentsToday: number
  avgAiConfidence: number
}

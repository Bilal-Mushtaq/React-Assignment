import type { AlertSeverity, CameraStatus } from './domain'

export type SimulatedEvent =
  | { type: 'alert.created'; payload: { alertId: string; title: string; message: string; severity: AlertSeverity; cameraId?: string } }
  | { type: 'camera.status'; payload: { cameraId: string; status: CameraStatus } }
  | { type: 'camera.confidence'; payload: { cameraId: string; confidence: number } }
  | { type: 'incident.created'; payload: { incidentId: string; title: string; severity: AlertSeverity; cameraId?: string } }
  | { type: 'activity.logged'; payload: { message: string; eventType: string; meta?: Record<string, string> } }
  | { type: 'notification.created'; payload: { title: string; body: string; group: 'alerts' | 'cameras' | 'system' } }
  | { type: 'analytics.tick'; payload: { hour: number; day: number; value: number } }

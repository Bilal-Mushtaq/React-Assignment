import type { SimulatedEvent } from '../types/events'
import type { AlertSeverity, CameraStatus } from '../types/domain'
import { useActivityStore } from '../store/activityStore'
import { useAlertsStore } from '../store/alertsStore'
import { useAnalyticsStore } from '../store/analyticsStore'
import { useCameraStore } from '../store/cameraStore'
import { useNotificationStore } from '../store/notificationStore'
import { useTimelineStore } from '../store/timelineStore'
import { ACTIVITY_MESSAGES, ALERT_TITLES, INCIDENT_TITLES } from '../constants/mockData'
import { generateId } from '../utils/id'
import { pickRandom, randomBetween, randomFloat } from '../utils/random'

const SEVERITIES: AlertSeverity[] = ['critical', 'high', 'medium', 'low']
const CAMERA_STATUSES: CameraStatus[] = ['online', 'offline', 'degraded', 'recording']

export function dispatchSimulatedEvent(event: SimulatedEvent) {
  switch (event.type) {
    case 'alert.created': {
      useAlertsStore.getState().addAlert({
        id: event.payload.alertId,
        title: event.payload.title,
        message: event.payload.message,
        severity: event.payload.severity,
        cameraId: event.payload.cameraId,
      })
      syncKpis()
      break
    }
    case 'camera.status': {
      useCameraStore.getState().updateStatus(event.payload.cameraId, event.payload.status)
      syncKpis()
      break
    }
    case 'camera.confidence': {
      useCameraStore.getState().updateConfidence(event.payload.cameraId, event.payload.confidence)
      syncKpis()
      break
    }
    case 'incident.created': {
      useTimelineStore.getState().addIncident({
        id: event.payload.incidentId,
        title: event.payload.title,
        severity: event.payload.severity,
        cameraId: event.payload.cameraId,
      })
      syncKpis()
      break
    }
    case 'activity.logged': {
      useActivityStore.getState().addEvent({
        message: event.payload.message,
        type: event.payload.eventType,
        meta: event.payload.meta,
      })
      break
    }
    case 'notification.created': {
      useNotificationStore.getState().addNotification({
        title: event.payload.title,
        body: event.payload.body,
        group: event.payload.group,
      })
      break
    }
    case 'analytics.tick': {
      useAnalyticsStore
        .getState()
        .tickHeatmap(event.payload.day, event.payload.hour, event.payload.value)
      useAnalyticsStore.getState().pushEventRate(event.payload.value)
      break
    }
    default:
      break
  }
}

export function syncKpis() {
  useAnalyticsStore.getState().setKpiOverrides({
    activeAlerts: useAlertsStore.getState().getActiveCount(),
    camerasOnline: useCameraStore.getState().getOnlineCount(),
    incidentsToday: useTimelineStore.getState().getTodayCount(),
    avgAiConfidence: useCameraStore.getState().getAverageConfidence(),
  })
}

export function generateRandomEvents(batchSize: number): SimulatedEvent[] {
  const cameras = useCameraStore.getState().cameras
  const events: SimulatedEvent[] = []

  for (let i = 0; i < batchSize; i++) {
    const camera = pickRandom(cameras)
    const roll = randomBetween(1, 100)

    if (roll <= 22) {
      const severity = pickRandom(SEVERITIES)
      const title = pickRandom(ALERT_TITLES)
      events.push({
        type: 'alert.created',
        payload: {
          alertId: generateId('alert'),
          title,
          message: `${title} near ${camera.zone}.`,
          severity,
          cameraId: camera.id,
        },
      })
      events.push({
        type: 'notification.created',
        payload: {
          title: `New ${severity} alert`,
          body: title,
          group: 'alerts',
        },
      })
      events.push({
        type: 'activity.logged',
        payload: {
          message: `Alert raised on ${camera.name}`,
          eventType: 'alert',
          meta: { cameraId: camera.id, severity },
        },
      })
    } else if (roll <= 40) {
      const status = pickRandom(CAMERA_STATUSES)
      events.push({
        type: 'camera.status',
        payload: { cameraId: camera.id, status },
      })
      events.push({
        type: 'notification.created',
        payload: {
          title: 'Camera status changed',
          body: `${camera.name} is now ${status}`,
          group: 'cameras',
        },
      })
      events.push({
        type: 'activity.logged',
        payload: {
          message: `${camera.name} status → ${status}`,
          eventType: 'camera',
          meta: { cameraId: camera.id },
        },
      })
    } else if (roll <= 55) {
      const confidence = randomFloat(65, 99)
      events.push({
        type: 'camera.confidence',
        payload: { cameraId: camera.id, confidence },
      })
      events.push({
        type: 'activity.logged',
        payload: {
          message: `AI confidence updated on ${camera.name} (${confidence}%)`,
          eventType: 'ai',
          meta: { cameraId: camera.id },
        },
      })
    } else if (roll <= 68) {
      const severity = pickRandom(['high', 'medium', 'critical'] as AlertSeverity[])
      const title = pickRandom(INCIDENT_TITLES)
      events.push({
        type: 'incident.created',
        payload: {
          incidentId: generateId('incident'),
          title,
          severity,
          cameraId: camera.id,
        },
      })
      events.push({
        type: 'activity.logged',
        payload: {
          message: `Incident logged: ${title}`,
          eventType: 'incident',
          meta: { cameraId: camera.id },
        },
      })
    } else if (roll <= 88) {
      events.push({
        type: 'activity.logged',
        payload: {
          message: `${pickRandom(ACTIVITY_MESSAGES)} — ${camera.name}`,
          eventType: 'system',
          meta: { cameraId: camera.id },
        },
      })
    } else {
      const now = new Date()
      events.push({
        type: 'analytics.tick',
        payload: {
          day: now.getDay(),
          hour: now.getHours(),
          value: randomBetween(1, 8),
        },
      })
      events.push({
        type: 'activity.logged',
        payload: {
          message: 'Analytics pipeline processed event batch',
          eventType: 'analytics',
        },
      })
    }
  }

  return events
}

export function seedInitialSimulationData() {
  const cameras = useCameraStore.getState().cameras

  useActivityStore.getState().seedEvents(1200, (index) => ({
    type: index % 4 === 0 ? 'alert' : index % 3 === 0 ? 'camera' : 'system',
    message: `${pickRandom(ACTIVITY_MESSAGES)} — ${pickRandom(cameras).name}`,
    timestamp: Date.now() - index * 5000,
    meta: { seed: 'true' },
  }))

  for (let i = 0; i < 18; i++) {
    const camera = pickRandom(cameras)
    useAlertsStore.getState().addAlert({
      title: pickRandom(ALERT_TITLES),
      message: `Historical alert on ${camera.zone}`,
      severity: pickRandom(SEVERITIES),
      cameraId: camera.id,
    })
  }

  for (let i = 0; i < 12; i++) {
    const camera = pickRandom(cameras)
    useTimelineStore.getState().addIncident({
      title: pickRandom(INCIDENT_TITLES),
      severity: pickRandom(SEVERITIES),
      cameraId: camera.id,
    })
  }

  const seedNotifs: Array<{ title: string; body: string; group: 'alerts' | 'cameras' | 'system' }> = [
    { group: 'alerts', title: 'Critical alert backlog', body: '3 critical alerts awaiting review' },
    { group: 'alerts', title: 'High severity spike', body: 'Perimeter zone exceeded threshold' },
    { group: 'cameras', title: 'Feed health check', body: 'CAM-05 confidence dipped below 75%' },
    { group: 'cameras', title: 'Camera recovered', body: 'CAM-02 is back online' },
    { group: 'system', title: 'Event engine online', body: 'Live simulation stream started' },
    { group: 'system', title: 'Layout persisted', body: 'Dashboard state saved to local storage' },
  ]
  for (const n of seedNotifs) {
    useNotificationStore.getState().addNotification(n)
  }

  const analytics = useAnalyticsStore.getState()
  const heatmap = analytics.heatmap.map((row) => [...row])
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      heatmap[d]![h] = randomBetween(0, 12)
    }
  }
  useAnalyticsStore.setState({ heatmap })

  syncKpis()
}

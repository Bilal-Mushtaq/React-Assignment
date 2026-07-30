import type { SimulatedEvent } from '../types/events'
import type { AlertSeverity, CameraStatus } from '../types/domain'
import { useActivityStore } from '../store/activityStore'
import { useAlertsStore } from '../store/alertsStore'
import { useAnalyticsStore } from '../store/analyticsStore'
import { useCameraStore } from '../store/cameraStore'
import { useNotificationStore } from '../store/notificationStore'
import { useTimelineStore } from '../store/timelineStore'
import {
  SITE,
  buildSiteVisitorTraffic,
  buildSiteHeatmap,
  getScenarioForCamera,
  pickActivityFor,
  pickAlertFor,
  pickIncidentFor,
  type CameraScenario,
} from '../constants/mockData'
import { generateId } from '../utils/id'
import { pickRandom, randomBetween, randomFloat } from '../utils/random'

function nextCameraStatus(scenario: CameraScenario, current: CameraStatus): CameraStatus {
  if (scenario.id === 'cam_12') {
    return pickRandom(['offline', 'offline', 'degraded', 'online'] as CameraStatus[])
  }
  if (scenario.id === 'cam_9') {
    return pickRandom(['degraded', 'degraded', 'online', 'recording'] as CameraStatus[])
  }
  if (current === 'recording') {
    return pickRandom(['recording', 'online', 'online'] as CameraStatus[])
  }
  if (current === 'offline') {
    return pickRandom(['offline', 'degraded', 'online'] as CameraStatus[])
  }
  return pickRandom(['online', 'online', 'recording', 'degraded'] as CameraStatus[])
}

function confidenceFor(scenario: CameraScenario): number {
  if (scenario.id === 'cam_12') return randomFloat(0, 18)
  if (scenario.id === 'cam_9') return randomFloat(68, 82)
  return randomFloat(Math.max(70, scenario.confidence - 8), Math.min(99, scenario.confidence + 4))
}

function severityLabel(severity: AlertSeverity) {
  if (severity === 'critical') return 'Urgent'
  if (severity === 'high') return 'Important'
  if (severity === 'medium') return 'Notice'
  return 'Info'
}

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
      // Heatmap uses a small density bump; series gets the visitor estimate
      const density = Math.min(3, Math.max(1, Math.round(event.payload.value / 80)))
      useAnalyticsStore
        .getState()
        .tickHeatmap(event.payload.day, event.payload.hour, density)
      useAnalyticsStore.getState().pushVisitorCount(event.payload.value)
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
    const scenario = getScenarioForCamera(camera)
    const roll = randomBetween(1, 100)

    if (roll <= 22) {
      const alert = pickAlertFor(scenario)
      events.push({
        type: 'alert.created',
        payload: {
          alertId: generateId('alert'),
          title: alert.title,
          message: alert.message,
          severity: alert.severity,
          cameraId: camera.id,
        },
      })
      events.push({
        type: 'notification.created',
        payload: {
          title: `${severityLabel(alert.severity)} · ${scenario.zone}`,
          body: `${alert.title} — seen on ${camera.name}`,
          group: 'alerts',
        },
      })
      events.push({
        type: 'activity.logged',
        payload: {
          message: `${scenario.zone}: ${alert.title}`,
          eventType: 'alert',
          meta: { cameraId: camera.id, zone: scenario.zone, severity: alert.severity },
        },
      })
    } else if (roll <= 40) {
      const status = nextCameraStatus(scenario, camera.status)
      const statusText =
        status === 'online'
          ? 'back online'
          : status === 'offline'
            ? 'went offline'
            : status === 'degraded'
              ? 'picture quality dropped'
              : 'is recording'
      events.push({
        type: 'camera.status',
        payload: { cameraId: camera.id, status },
      })
      events.push({
        type: 'notification.created',
        payload: {
          title: `${camera.name} ${statusText}`,
          body: `${scenario.zone} (${scenario.area})`,
          group: 'cameras',
        },
      })
      events.push({
        type: 'activity.logged',
        payload: {
          message: `${camera.name} ${statusText}`,
          eventType: 'camera',
          meta: { cameraId: camera.id, zone: scenario.zone },
        },
      })
    } else if (roll <= 55) {
      const confidence = Math.round(confidenceFor(scenario))
      events.push({
        type: 'camera.confidence',
        payload: { cameraId: camera.id, confidence },
      })
      events.push({
        type: 'activity.logged',
        payload: {
          message: `${camera.name} AI certainty now ${confidence}%`,
          eventType: 'ai',
          meta: { cameraId: camera.id, zone: scenario.zone },
        },
      })
    } else if (roll <= 68) {
      const incident = pickIncidentFor(scenario)
      events.push({
        type: 'incident.created',
        payload: {
          incidentId: generateId('incident'),
          title: incident.title,
          severity: incident.severity,
          cameraId: camera.id,
        },
      })
      events.push({
        type: 'activity.logged',
        payload: {
          message: `Incident opened: ${incident.title}`,
          eventType: 'incident',
          meta: { cameraId: camera.id, zone: scenario.zone },
        },
      })
    } else if (roll <= 88) {
      events.push({
        type: 'activity.logged',
        payload: {
          message: pickActivityFor(scenario),
          eventType: 'system',
          meta: { cameraId: camera.id, zone: scenario.zone },
        },
      })
    } else {
      const now = new Date()
      const hour = now.getHours()
      // Approximate live visitor count for this hour (mall-shaped curve)
      let visitors = 20
      if (hour >= 10 && hour <= 14) visitors = randomBetween(140, 240)
      else if (hour >= 17 && hour <= 20) visitors = randomBetween(160, 260)
      else if (hour >= 8 && hour <= 21) visitors = randomBetween(70, 140)
      else visitors = randomBetween(12, 40)
      events.push({
        type: 'analytics.tick',
        payload: {
          day: now.getDay(),
          hour,
          value: visitors,
        },
      })
      events.push({
        type: 'activity.logged',
        payload: {
          message: `Visitor count updated · ${scenario.zone} (~${visitors}/hr across ${SITE.short})`,
          eventType: 'analytics',
          meta: { zone: scenario.zone },
        },
      })
    }
  }

  return events
}

export function seedInitialSimulationData() {
  const cameras = useCameraStore.getState().cameras

  useActivityStore.getState().seedEvents(1400, (index) => {
    const camera = cameras[index % cameras.length]!
    const scenario = getScenarioForCamera(camera)
    const kind = index % 6
    const baseMeta: Record<string, string> = {
      cameraId: camera.id,
      zone: scenario.zone,
      seed: 'true',
    }

    if (kind === 0) {
      const alert = scenario.alerts[index % scenario.alerts.length]!
      return {
        type: 'alert',
        message: `${scenario.zone}: ${alert.title}`,
        timestamp: Date.now() - index * 5000,
        meta: { ...baseMeta, severity: alert.severity },
      }
    }
    if (kind === 1) {
      const incident = scenario.incidents[index % scenario.incidents.length]!
      return {
        type: 'incident',
        message: `Incident opened: ${incident.title}`,
        timestamp: Date.now() - index * 5000,
        meta: { ...baseMeta, severity: incident.severity },
      }
    }
    if (kind === 2) {
      return {
        type: 'camera',
        message: `${camera.name} checked · ${scenario.zone}`,
        timestamp: Date.now() - index * 5000,
        meta: baseMeta,
      }
    }
    if (kind === 3) {
      return {
        type: 'ai',
        message: `${camera.name} AI certainty ${Math.round(scenario.confidence || 12)}%`,
        timestamp: Date.now() - index * 5000,
        meta: baseMeta,
      }
    }
    return {
      type: 'system',
      message: scenario.activities[index % scenario.activities.length]!,
      timestamp: Date.now() - index * 5000,
      meta: baseMeta,
    }
  })

  // Varied open alerts across the mall — each tied to its own place
  const alertSeeds: Array<{ cameraIndex: number; alertIndex: number }> = [
    { cameraIndex: 2, alertIndex: 0 }, // lost child — plaza
    { cameraIndex: 4, alertIndex: 2 }, // jewelry loitering
    { cameraIndex: 1, alertIndex: 0 }, // bag in food court
    { cameraIndex: 11, alertIndex: 0 }, // loading bay offline
    { cameraIndex: 9, alertIndex: 0 }, // emergency exit
    { cameraIndex: 0, alertIndex: 1 }, // slip at entrance
    { cameraIndex: 7, alertIndex: 1 }, // unattended child play area
    { cameraIndex: 5, alertIndex: 0 }, // barrier stuck
    { cameraIndex: 6, alertIndex: 3 }, // cinema let-out
    { cameraIndex: 8, alertIndex: 2 }, // unknown in staff hall
    { cameraIndex: 3, alertIndex: 1 }, // circling car
    { cameraIndex: 10, alertIndex: 1 }, // roof after hours
    { cameraIndex: 1, alertIndex: 1 }, // food spill
    { cameraIndex: 4, alertIndex: 0 }, // jewelry linger
    { cameraIndex: 0, alertIndex: 0 }, // crowd at doors
    { cameraIndex: 7, alertIndex: 2 }, // overcrowded play
    { cameraIndex: 9, alertIndex: 1 }, // door ajar
    { cameraIndex: 5, alertIndex: 2 }, // wrong-way car
    { cameraIndex: 2, alertIndex: 2 }, // fountain climb
    { cameraIndex: 6, alertIndex: 1 }, // cinema spill
    { cameraIndex: 3, alertIndex: 0 }, // double park
    { cameraIndex: 8, alertIndex: 0 }, // staff door open
  ]

  for (const seed of alertSeeds) {
    const camera = cameras[seed.cameraIndex]!
    const scenario = getScenarioForCamera(camera)
    const alert = scenario.alerts[seed.alertIndex % scenario.alerts.length]!
    useAlertsStore.getState().addAlert({
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      cameraId: camera.id,
    })
  }

  const incidentSeeds = [2, 4, 1, 11, 9, 0, 7, 5, 6, 8, 3, 10, 1, 4, 9, 2] as const
  for (let i = 0; i < incidentSeeds.length; i++) {
    const camera = cameras[incidentSeeds[i]!]!
    const scenario = getScenarioForCamera(camera)
    const incident = scenario.incidents[i % scenario.incidents.length]!
    useTimelineStore.getState().addIncident({
      title: incident.title,
      severity: incident.severity,
      cameraId: camera.id,
    })
  }

  const seedNotifs: Array<{ title: string; body: string; group: 'alerts' | 'cameras' | 'system' }> = [
    {
      group: 'alerts',
      title: 'Urgent · Central Plaza',
      body: 'Lost child reported near the fountain — check CAM-03',
    },
    {
      group: 'alerts',
      title: 'Important · Jewelry Row',
      body: 'Someone lingering at the jewelry display with face partly covered',
    },
    {
      group: 'cameras',
      title: 'CAM-12 not working',
      body: 'Loading Bay camera is offline — a guard was sent to watch in person',
    },
    {
      group: 'cameras',
      title: 'CAM-09 picture is fuzzy',
      body: 'Service Corridor camera needs a check — image quality dropped',
    },
    {
      group: 'system',
      title: `${SITE.name} is live`,
      body: SITE.tagline,
    },
    {
      group: 'system',
      title: 'Shift note ready',
      body: 'Watch Loading Bay blind spot and keep an eye on Kids Play Area',
    },
    {
      group: 'alerts',
      title: 'Notice · Food Court',
      body: 'Backpack left alone at table 14 — staff notified',
    },
    {
      group: 'alerts',
      title: 'Urgent · Emergency Stairs',
      body: 'Exit door opened without a fire alarm — East wing',
    },
  ]
  for (const n of seedNotifs) {
    useNotificationStore.getState().addNotification(n)
  }

  useAnalyticsStore.setState({
    heatmap: buildSiteHeatmap(),
    visitorSeries: buildSiteVisitorTraffic(),
  })

  syncKpis()
}

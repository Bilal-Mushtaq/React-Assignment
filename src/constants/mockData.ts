import type { Camera } from '../types/domain'
import { generateId } from '../utils/id'
import { randomFloat } from '../utils/random'

const ZONES = ['North Gate', 'Loading Dock', 'Lobby', 'Parking A', 'Server Room', 'Perimeter East'] as const
const STATUSES = ['online', 'online', 'online', 'recording', 'degraded', 'offline'] as const

export const CAMERA_NAMES = [
  'CAM-01 North Gate',
  'CAM-02 Loading Dock',
  'CAM-03 Lobby',
  'CAM-04 Parking A',
  'CAM-05 Server Room',
  'CAM-06 Perimeter East',
  'CAM-07 Warehouse',
  'CAM-08 Reception',
  'CAM-09 Roof Access',
  'CAM-10 Emergency Exit',
  'CAM-11 Courtyard',
  'CAM-12 Basement',
] as const

export function createInitialCameras(): Camera[] {
  const now = Date.now()
  return CAMERA_NAMES.map((name, index) => ({
    id: `cam_${index + 1}`,
    name,
    zone: ZONES[index % ZONES.length]!,
    status: STATUSES[index % STATUSES.length]!,
    aiConfidence: randomFloat(72, 98),
    lastEventAt: now - index * 60_000,
    statusChangedAt: now - index * 120_000,
  }))
}

export const ALERT_TITLES = [
  'Unauthorized access detected',
  'Motion in restricted zone',
  'Object left unattended',
  'Perimeter breach attempt',
  'Crowd density threshold exceeded',
  'Vehicle stopped in no-park zone',
  'Face match below confidence threshold',
  'Camera tampering suspected',
] as const

export const INCIDENT_TITLES = [
  'Intrusion attempt — North Gate',
  'Suspicious package — Lobby',
  'Tailgating detected — Server Room',
  'After-hours movement — Warehouse',
  'License plate flagged — Parking A',
] as const

export const ACTIVITY_MESSAGES = [
  'AI model inference completed',
  'Recording segment archived',
  'PTZ preset applied',
  'Night vision mode enabled',
  'Edge node heartbeat received',
  'Object tracking session started',
  'Analytics pipeline synced',
  'Thermal anomaly scan finished',
] as const

export function seedId() {
  return generateId('seed')
}

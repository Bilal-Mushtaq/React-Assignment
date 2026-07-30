import { SITE_CAMERAS } from '../../constants/mockData'

/** Relative foot-traffic weight per AlNakheel zone (showcase distribution) */
const ZONE_WEIGHT: Record<string, number> = {
  'Central Plaza': 1.35,
  'Food Court': 1.28,
  'Main Entrance': 1.18,
  'Cinema Lobby': 1.05,
  'Kids Play Area': 0.95,
  'Jewelry Row': 0.72,
  'Parking Level 2': 0.88,
  'Parking Exit': 0.7,
  'Roof Garden': 0.55,
  'Service Corridor': 0.28,
  'Emergency Stairs': 0.18,
  'Loading Bay': 0.32,
}

export type ZoneTrafficRow = {
  zone: string
  area: string
  cameraId: string
  visitors: number
  share: number
}

/** Split today's visitor total across mall zones with stable weights */
export function buildZoneTraffic(dayTotal: number): ZoneTrafficRow[] {
  const rows = SITE_CAMERAS.map((cam) => {
    const weight = ZONE_WEIGHT[cam.zone] ?? 0.5
    return { cam, weight }
  })
  const weightSum = rows.reduce((a, r) => a + r.weight, 0)
  const mapped = rows.map(({ cam, weight }) => {
    const visitors = Math.max(4, Math.round((dayTotal * weight) / weightSum))
    return {
      zone: cam.zone,
      area: cam.area,
      cameraId: cam.id,
      visitors,
      share: 0,
    }
  })
  const sum = mapped.reduce((a, r) => a + r.visitors, 0) || 1
  return mapped
    .map((r) => ({ ...r, share: Math.round((r.visitors / sum) * 100) }))
    .sort((a, b) => b.visitors - a.visitors)
}

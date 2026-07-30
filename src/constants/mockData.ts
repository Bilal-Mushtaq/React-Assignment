import type { AlertSeverity, Camera, CameraStatus } from '../types/domain'
import { pickRandom, randomBetween, randomFloat } from '../utils/random'

export const SITE = {
  name: 'AlNakheel Mall',
  short: 'AlNakheel',
  tagline: 'Shopping mall · 12 security cameras',
} as const

export type CameraScenario = {
  id: string
  name: string
  zone: string
  area: string
  status: CameraStatus
  confidence: number
  alerts: Array<{ title: string; message: string; severity: AlertSeverity }>
  incidents: Array<{ title: string; severity: AlertSeverity }>
  activities: string[]
}

/**
 * AlNakheel Mall camera map.
 * Alerts / incidents / activity always match the camera’s place — plain everyday language.
 */
export const SITE_CAMERAS: CameraScenario[] = [
  {
    id: 'cam_1',
    name: 'CAM-01 Main Entrance',
    zone: 'Main Entrance',
    area: 'Ground floor · Front doors',
    status: 'recording',
    confidence: 94,
    alerts: [
      {
        title: 'Crowd building at doors',
        message: 'A large group is waiting at the Main Entrance during opening hour.',
        severity: 'medium',
      },
      {
        title: 'Someone slipped near the doors',
        message: 'A shopper may have fallen on the wet mat just inside Main Entrance.',
        severity: 'high',
      },
      {
        title: 'Door held open too long',
        message: 'The Main Entrance sliding doors stayed open for more than a minute.',
        severity: 'low',
      },
      {
        title: 'Person looking upset at security desk',
        message: 'A guest is arguing with staff at the Main Entrance welcome desk.',
        severity: 'medium',
      },
    ],
    incidents: [
      { title: 'Slip near Main Entrance doors', severity: 'high' },
      { title: 'Opening-hour rush at Main Entrance', severity: 'medium' },
    ],
    activities: [
      'Main Entrance doors unlocked for opening',
      'Welcome desk staffed — Main Entrance',
      'Morning foot traffic climbing at Main Entrance',
      'Entrance mat cleaned after rain',
      'Guest guided to directory at Main Entrance',
    ],
  },
  {
    id: 'cam_2',
    name: 'CAM-02 Food Court',
    zone: 'Food Court',
    area: 'Level 2 · Dining',
    status: 'online',
    confidence: 91,
    alerts: [
      {
        title: 'Bag left on a table',
        message: 'A backpack has been sitting alone at Food Court table 14 for several minutes.',
        severity: 'high',
      },
      {
        title: 'Spill near seating',
        message: 'A drink spill is spreading on the floor by the Food Court soda machines.',
        severity: 'medium',
      },
      {
        title: 'Long queue at popular stall',
        message: 'The burger stall line is blocking the Food Court walkway.',
        severity: 'low',
      },
      {
        title: 'Kids running between tables',
        message: 'Children are running through the busy Food Court seating area.',
        severity: 'low',
      },
    ],
    incidents: [
      { title: 'Unattended bag — Food Court table 14', severity: 'high' },
      { title: 'Spill cleaned — Food Court walkway', severity: 'medium' },
    ],
    activities: [
      'Food Court lunch rush starting',
      'Table 14 cleared by cleaning team',
      'New tray stack delivered to Food Court',
      'Music volume lowered in Food Court',
      'Guest found seat near Food Court windows',
    ],
  },
  {
    id: 'cam_3',
    name: 'CAM-03 Central Plaza',
    zone: 'Central Plaza',
    area: 'Ground floor · Fountain',
    status: 'online',
    confidence: 96,
    alerts: [
      {
        title: 'Lost child reported',
        message: 'A parent reported a missing child near the Central Plaza fountain.',
        severity: 'critical',
      },
      {
        title: 'Event setup blocking path',
        message: 'Display stands are narrowing the walkway around Central Plaza.',
        severity: 'medium',
      },
      {
        title: 'Person climbing fountain edge',
        message: 'Someone is standing on the rim of the Central Plaza fountain.',
        severity: 'high',
      },
      {
        title: 'Balloon seller crowding aisle',
        message: 'A pop-up seller is blocking the main aisle at Central Plaza.',
        severity: 'low',
      },
    ],
    incidents: [
      { title: 'Lost child — Central Plaza fountain', severity: 'critical' },
      { title: 'Fountain safety stop — Central Plaza', severity: 'high' },
    ],
    activities: [
      'Central Plaza fountain lights turned on',
      'Weekend market tents checked at Plaza',
      'Family reunion at Central Plaza information desk',
      'Plaza event posters approved for this Saturday',
      'Floor polishing finished around fountain',
    ],
  },
  {
    id: 'cam_4',
    name: 'CAM-04 Parking Level 2',
    zone: 'Parking Level 2',
    area: 'Garage · Level 2',
    status: 'online',
    confidence: 89,
    alerts: [
      {
        title: 'Car parked across two spaces',
        message: 'A silver SUV is taking two spots near Parking Level 2 elevators.',
        severity: 'low',
      },
      {
        title: 'Car circling for a long time',
        message: 'The same car has been looping Parking Level 2 for over 10 minutes.',
        severity: 'medium',
      },
      {
        title: 'Person walking alone late',
        message: 'Someone is walking through empty Parking Level 2 after mall closing.',
        severity: 'medium',
      },
      {
        title: 'Exit ramp backup',
        message: 'Cars are lined up at the Parking Level 2 exit gate.',
        severity: 'low',
      },
    ],
    incidents: [
      { title: 'Parking dispute — Level 2 elevators', severity: 'medium' },
      { title: 'Exit gate backup — Parking Level 2', severity: 'low' },
    ],
    activities: [
      'Parking Level 2 about 70% full',
      'Family found their car near Elevator B',
      'Electric charging stall P2-08 now free',
      'Parking ticket machine restocked',
      'Garage lights checked on Level 2',
    ],
  },
  {
    id: 'cam_5',
    name: 'CAM-05 Jewelry Storefront',
    zone: 'Jewelry Row',
    area: 'Level 1 · Luxury corridor',
    status: 'recording',
    confidence: 97,
    alerts: [
      {
        title: 'Person lingering at display',
        message: 'Someone has been standing at the Jewelry Row window for a long time without going inside.',
        severity: 'high',
      },
      {
        title: 'Group gathered at store doors',
        message: 'A small group is crowding the Jewelry Storefront entrance.',
        severity: 'medium',
      },
      {
        title: 'Hoodie and backpack by showcase',
        message: 'A person with face partly covered is standing very close to a jewelry display.',
        severity: 'critical',
      },
      {
        title: 'Store opened after hours signal',
        message: 'Jewelry Row staff door opened outside normal mall hours.',
        severity: 'high',
      },
    ],
    incidents: [
      { title: 'Suspicious loitering — Jewelry Row', severity: 'high' },
      { title: 'Security walkthrough — Jewelry Storefront', severity: 'medium' },
    ],
    activities: [
      'Jewelry store opened for business',
      'Security escort requested for cash drop',
      'Display window lights dimmed for closing',
      'Staff locked Jewelry Row cabinets',
      'Quiet evening on Luxury corridor',
    ],
  },
  {
    id: 'cam_6',
    name: 'CAM-06 Parking Exit',
    zone: 'Parking Exit',
    area: 'Garage · Street exit',
    status: 'online',
    confidence: 88,
    alerts: [
      {
        title: 'Barrier arm stuck up',
        message: 'The Parking Exit barrier is stuck open and cars are rolling through.',
        severity: 'high',
      },
      {
        title: 'Driver arguing at the booth',
        message: 'A driver is arguing with the attendant at Parking Exit.',
        severity: 'medium',
      },
      {
        title: 'Wrong-way car detected',
        message: 'A car entered against the flow near Parking Exit.',
        severity: 'critical',
      },
      {
        title: 'Ticket machine not working',
        message: 'Guests are stuck because the Parking Exit ticket reader failed.',
        severity: 'medium',
      },
    ],
    incidents: [
      { title: 'Barrier stuck open — Parking Exit', severity: 'high' },
      { title: 'Wrong-way vehicle — Parking Exit', severity: 'critical' },
    ],
    activities: [
      'Parking Exit barrier reset successfully',
      'Attendant booth shift change completed',
      'Evening rush at Parking Exit',
      'Guest helped with lost parking ticket',
      'Street lights on near Parking Exit road',
    ],
  },
  {
    id: 'cam_7',
    name: 'CAM-07 Cinema Lobby',
    zone: 'Cinema Lobby',
    area: 'Level 3 · Movies',
    status: 'online',
    confidence: 92,
    alerts: [
      {
        title: 'Very long ticket line',
        message: 'The Cinema Lobby ticket line is spilling into the hallway.',
        severity: 'low',
      },
      {
        title: 'Spill by popcorn stand',
        message: 'Butter and drink mess near the Cinema Lobby popcorn counter.',
        severity: 'medium',
      },
      {
        title: 'Teen group being loud',
        message: 'A loud group is blocking seats in the Cinema Lobby waiting area.',
        severity: 'low',
      },
      {
        title: 'Movie let-out surge',
        message: 'A large crowd is exiting into Cinema Lobby after a sold-out show.',
        severity: 'medium',
      },
    ],
    incidents: [
      { title: 'Crowd after movie — Cinema Lobby', severity: 'medium' },
      { title: 'Spill cleaned — Cinema popcorn stand', severity: 'low' },
    ],
    activities: [
      'Next show starts in 20 minutes — Cinema',
      'Popcorn machine refilled',
      'Ticket kiosks restarted in Cinema Lobby',
      'Disabled seating request handled at Cinema',
      'Late guest guided to Screen 4',
    ],
  },
  {
    id: 'cam_8',
    name: 'CAM-08 Kids Play Area',
    zone: 'Kids Play Area',
    area: 'Level 2 · Soft play',
    status: 'online',
    confidence: 95,
    alerts: [
      {
        title: 'Child climbed play structure edge',
        message: 'A child is on the outer edge of the soft-play structure.',
        severity: 'high',
      },
      {
        title: 'Parent not nearby',
        message: 'A small child is alone near Kids Play Area exit for several minutes.',
        severity: 'high',
      },
      {
        title: 'Too many kids inside zone',
        message: 'Kids Play Area is over the safe number of children.',
        severity: 'medium',
      },
      {
        title: 'Toy left in walkway',
        message: 'Ride-on toys are blocking the path by Kids Play Area.',
        severity: 'low',
      },
    ],
    incidents: [
      { title: 'Unattended child — Kids Play Area', severity: 'high' },
      { title: 'Overcrowding pause — Kids Play Area', severity: 'medium' },
    ],
    activities: [
      'Kids Play Area soft mats cleaned',
      'Parent found child near play exit',
      'Play capacity back to green',
      'Birthday party setup in Kids Play Area',
      'Safety announcement played near play zone',
    ],
  },
  {
    id: 'cam_9',
    name: 'CAM-09 Service Corridor',
    zone: 'Service Corridor',
    area: 'Back-of-house · Staff only',
    status: 'degraded',
    confidence: 74,
    alerts: [
      {
        title: 'Staff door left open',
        message: 'The Service Corridor door to the mall is propped open.',
        severity: 'medium',
      },
      {
        title: 'Camera picture is fuzzy',
        message: 'CAM-09 Service Corridor image quality dropped — needs a wipe or check.',
        severity: 'low',
      },
      {
        title: 'Unknown person in staff hall',
        message: 'Someone without a visible staff badge is in the Service Corridor.',
        severity: 'high',
      },
      {
        title: 'Cart blocking fire path',
        message: 'A supply cart is sitting in the Service Corridor exit lane.',
        severity: 'high',
      },
    ],
    incidents: [
      { title: 'Propped staff door — Service Corridor', severity: 'medium' },
      { title: 'Unknown guest in staff hall', severity: 'high' },
    ],
    activities: [
      'Delivery crates moved through Service Corridor',
      'Staff break schedule posted on corridor board',
      'CAM-09 focus check requested',
      'Fire path cleared in Service Corridor',
      'Night locks set on staff-only doors',
    ],
  },
  {
    id: 'cam_10',
    name: 'CAM-10 Emergency Stairs',
    zone: 'Emergency Stairs',
    area: 'East wing · Exit stair',
    status: 'online',
    confidence: 93,
    alerts: [
      {
        title: 'Emergency exit opened',
        message: 'Someone opened the Emergency Stairs door without a fire alarm.',
        severity: 'critical',
      },
      {
        title: 'Door did not close fully',
        message: 'Emergency Stairs door is slightly open after being used.',
        severity: 'medium',
      },
      {
        title: 'Person sitting on stairs',
        message: 'Someone is sitting on the Emergency Stairs landing.',
        severity: 'low',
      },
      {
        title: 'Bags stored in stairwell',
        message: 'Shopping bags were left on the Emergency Stairs steps.',
        severity: 'medium',
      },
    ],
    incidents: [
      { title: 'Exit door opened — Emergency Stairs', severity: 'critical' },
      { title: 'Stairwell blocked by bags', severity: 'medium' },
    ],
    activities: [
      'Emergency Stairs door closed and checked',
      'Monthly fire drill reminder for East wing',
      'Exit lights tested on Emergency Stairs',
      'Stairwell cleared of shopping bags',
      'Guest redirected to public elevators',
    ],
  },
  {
    id: 'cam_11',
    name: 'CAM-11 Roof Garden',
    zone: 'Roof Garden',
    area: 'Rooftop · Open air',
    status: 'online',
    confidence: 90,
    alerts: [
      {
        title: 'Too windy for umbrella seating',
        message: 'Umbrellas are tipping over in the Roof Garden dining area.',
        severity: 'medium',
      },
      {
        title: 'Guest past closing ropes',
        message: 'Someone walked past the closed signs into Roof Garden after hours.',
        severity: 'medium',
      },
      {
        title: 'Crowded sunset viewing',
        message: 'Roof Garden railings are crowded with people watching the sunset.',
        severity: 'low',
      },
      {
        title: 'Spilled drink on walkway',
        message: 'A drink spill is on the Roof Garden path near the stairs.',
        severity: 'low',
      },
    ],
    incidents: [
      { title: 'After-hours guest — Roof Garden', severity: 'medium' },
      { title: 'Wind caution — Roof Garden seating', severity: 'low' },
    ],
    activities: [
      'Roof Garden cafe opened for lunch',
      'Umbrellas closed due to wind',
      'Sunset crowd thinning on Roof Garden',
      'Planters watered on rooftop',
      'Roof access gate locked for night',
    ],
  },
  {
    id: 'cam_12',
    name: 'CAM-12 Loading Bay',
    zone: 'Loading Bay',
    area: 'Behind mall · Trucks',
    status: 'offline',
    confidence: 0,
    alerts: [
      {
        title: 'Camera not working',
        message: 'CAM-12 Loading Bay is offline — staff cannot see truck arrivals right now.',
        severity: 'high',
      },
      {
        title: 'Truck waiting with no view',
        message: 'A delivery truck is waiting at Loading Bay while the camera is still down.',
        severity: 'medium',
      },
      {
        title: 'Bay door open with no camera',
        message: 'Loading Bay door sensors say open, but CAM-12 has no live picture.',
        severity: 'critical',
      },
      {
        title: 'Repair ticket still open',
        message: 'Facilities has not fixed CAM-12 Loading Bay yet today.',
        severity: 'medium',
      },
    ],
    incidents: [
      { title: 'Blind spot — Loading Bay camera down', severity: 'high' },
      { title: 'Delivery wait — Loading Bay', severity: 'medium' },
    ],
    activities: [
      'Repair requested again for CAM-12 Loading Bay',
      'Guard sent to watch Loading Bay in person',
      'Morning produce truck signed in without camera',
      'Loading Bay lights confirmed on',
      'Temp radio check with dock staff',
    ],
  },
]

export function getScenarioByCameraId(cameraId: string): CameraScenario {
  return SITE_CAMERAS.find((c) => c.id === cameraId) ?? SITE_CAMERAS[0]!
}

export function getScenarioForCamera(camera: Pick<Camera, 'id'>): CameraScenario {
  return getScenarioByCameraId(camera.id)
}

export function createInitialCameras(): Camera[] {
  const now = Date.now()
  return SITE_CAMERAS.map((scenario, index) => ({
    id: scenario.id,
    name: scenario.name,
    zone: scenario.zone,
    status: scenario.status,
    aiConfidence: scenario.confidence > 0 ? scenario.confidence : randomFloat(0, 12),
    lastEventAt: now - index * 75_000,
    statusChangedAt: now - index * 140_000,
  }))
}

export function pickAlertFor(scenario: CameraScenario) {
  return pickRandom(scenario.alerts)
}

export function pickIncidentFor(scenario: CameraScenario) {
  return pickRandom(scenario.incidents)
}

export function pickActivityFor(scenario: CameraScenario) {
  return pickRandom(scenario.activities)
}

export function buildSiteHeatmap(): number[][] {
  const heatmap: number[][] = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0))

  for (let d = 0; d < 7; d++) {
    const isWeekend = d === 0 || d === 6
    for (let h = 0; h < 24; h++) {
      let base = 0

      // Quiet overnight
      if (h >= 0 && h <= 7) {
        base = Math.random() < 0.12 ? 1 : 0
      } else if (h >= 8 && h <= 9) {
        // Soft open
        base = isWeekend ? (Math.random() < 0.45 ? randomBetween(1, 3) : 0) : randomBetween(1, 4)
      } else if (h >= 10 && h <= 11) {
        base = isWeekend ? randomBetween(3, 7) : randomBetween(2, 5)
      } else if (h >= 12 && h <= 14) {
        // Lunch peak
        base = isWeekend ? randomBetween(5, 10) : randomBetween(4, 8)
      } else if (h >= 15 && h <= 16) {
        base = isWeekend ? randomBetween(2, 5) : randomBetween(1, 4)
      } else if (h >= 17 && h <= 20) {
        // Evening shoppers — strongest band
        base = isWeekend ? randomBetween(6, 12) : randomBetween(4, 9)
      } else if (h >= 21 && h <= 22) {
        base = isWeekend ? randomBetween(2, 5) : Math.random() < 0.55 ? randomBetween(1, 3) : 0
      } else {
        base = Math.random() < 0.2 ? 1 : 0
      }

      // Sprinkle quiet gaps even in busy bands so the map breathes
      if (base > 0 && Math.random() < 0.18) base = 0

      heatmap[d]![h] = base
    }
  }
  return heatmap
}

/** Estimated visitors / hour across AlNakheel for the last 24h */
export function buildSiteVisitorTraffic(): number[] {
  return Array.from({ length: 24 }, (_, h) => {
    if (h < 8) return 12 + Math.floor(Math.random() * 18) // overnight / early staff
    if (h < 11) return 60 + Math.floor(Math.random() * 50) // open + morning shoppers
    if (h < 15) return 140 + Math.floor(Math.random() * 90) // lunch rush
    if (h < 18) return 90 + Math.floor(Math.random() * 60) // afternoon lull
    if (h < 21) return 160 + Math.floor(Math.random() * 100) // evening peak
    return 35 + Math.floor(Math.random() * 40) // closing
  })
}

/** @deprecated use buildSiteVisitorTraffic */
export const buildSiteEventRate = buildSiteVisitorTraffic

/** @deprecated use SITE */
export const CAMPUS = SITE
/** @deprecated use SITE_CAMERAS */
export const CAMPUS_CAMERAS = SITE_CAMERAS
export const buildCampusHeatmap = buildSiteHeatmap
export const buildCampusEventRate = buildSiteVisitorTraffic

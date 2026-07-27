import {
  dispatchSimulatedEvent,
  generateRandomEvents,
  seedInitialSimulationData,
  syncKpis,
} from './eventDispatcher'
import { randomBetween } from '../utils/random'

type EngineState = {
  timerId: ReturnType<typeof setTimeout> | null
  running: boolean
  seeded: boolean
}

const state: EngineState = {
  timerId: null,
  running: false,
  seeded: false,
}

function scheduleNextTick() {
  const delay = randomBetween(2000, 5000)
  state.timerId = setTimeout(() => {
    if (!state.running) return

    const batchSize = randomBetween(1, 2)
    const events = generateRandomEvents(batchSize)
    for (const event of events) {
      dispatchSimulatedEvent(event)
    }
    syncKpis()

    scheduleNextTick()
  }, delay)
}

export const eventEngine = {
  start() {
    if (state.running) return

    if (!state.seeded) {
      seedInitialSimulationData()
      state.seeded = true
    }

    state.running = true
    scheduleNextTick()
  },

  stop() {
    state.running = false
    if (state.timerId) {
      clearTimeout(state.timerId)
      state.timerId = null
    }
  },

  isRunning() {
    return state.running
  },
}

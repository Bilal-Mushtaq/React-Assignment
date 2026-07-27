import { useEffect, useState } from 'react'

const listeners = new Set<() => void>()
let intervalId: ReturnType<typeof setInterval> | null = null

/** Single shared clock — avoids N intervals when many components need live timers. */
export function useNow(tickMs = 1000) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const onTick = () => setTick((t) => t + 1)
    listeners.add(onTick)

    if (!intervalId) {
      intervalId = setInterval(() => {
        listeners.forEach((listener) => listener())
      }, tickMs)
    }

    return () => {
      listeners.delete(onTick)
      if (listeners.size === 0 && intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }
  }, [tickMs])

  return Date.now()
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

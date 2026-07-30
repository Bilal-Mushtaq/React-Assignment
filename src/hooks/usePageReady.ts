import { useEffect, useState } from 'react'

/** Routes that already finished their first skeleton handoff this page load. */
const warmedRoutes = new Set<string>()

/**
 * Artificial delay so route skeletons remain visible for a cleaner handoff.
 * After a route has warmed once, subsequent navigations skip the wait —
 * avoids blank → skeleton → content flashes when returning to a page.
 *
 * Pass `enabled: false` until brand boot completes so the timer doesn't
 * burn during the overlay (which made skeletons feel too short).
 */
export function usePageReady(routeKey: string, delayMs = 520, enabled = true) {
  const alreadyWarm = warmedRoutes.has(routeKey)
  const [ready, setReady] = useState(alreadyWarm && enabled)

  useEffect(() => {
    if (!enabled) {
      setReady(false)
      return
    }

    if (warmedRoutes.has(routeKey)) {
      setReady(true)
      return
    }

    setReady(false)
    const id = window.setTimeout(() => {
      warmedRoutes.add(routeKey)
      setReady(true)
    }, delayMs)

    return () => window.clearTimeout(id)
  }, [routeKey, delayMs, enabled])

  return ready
}

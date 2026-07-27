import { useEffect, useState } from 'react'

/** Brief artificial delay so route skeletons remain visible for a cleaner handoff. */
export function usePageReady(delayMs = 520) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(false)
    const id = window.setTimeout(() => setReady(true), delayMs)
    return () => window.clearTimeout(id)
  }, [delayMs])

  return ready
}

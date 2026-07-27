import { type PropsWithChildren, useEffect } from 'react'
import { eventEngine } from '../../services/eventEngine'

export function EventEngineProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const id = window.setTimeout(() => eventEngine.start(), 100)
    return () => {
      window.clearTimeout(id)
      eventEngine.stop()
    }
  }, [])

  return children
}

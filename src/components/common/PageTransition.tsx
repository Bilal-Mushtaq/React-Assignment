import { motion, useReducedMotion } from 'framer-motion'
import type { PropsWithChildren } from 'react'
import { easeOutSoft } from '../../lib/motion'

/* Soft enter on route change */
export function PageTransition({ children }: PropsWithChildren) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className="min-h-0">{children}</div>
  }

  return (
    <motion.div
      className="min-h-0"
      initial={{ opacity: 0.72, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: easeOutSoft }}
    >
      {children}
    </motion.div>
  )
}

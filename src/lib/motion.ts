/** Shared Framer Motion presets — premium, low-bounce, ops-console feel */

export const easeOutSoft = [0.16, 1, 0.3, 1] as const
export const easeInOutSoft = [0.45, 0, 0.55, 1] as const
export const easeEmphasized = [0.22, 1, 0.36, 1] as const

export const springSoft = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 34,
  mass: 0.85,
}

export const springSnappy = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 36,
  mass: 0.75,
}

export const springSidebar = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 34,
  mass: 0.85,
}

export const fadeSoft = {
  duration: 0.28,
  ease: easeOutSoft,
}

export const fadeQuick = {
  duration: 0.2,
  ease: easeOutSoft,
}

export const fadeLift = {
  duration: 0.38,
  ease: easeOutSoft,
}

export const overlayTransition = {
  duration: 0.22,
  ease: easeOutSoft,
}

export const panelTransition = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 34,
  mass: 0.8,
}

export const toastTransition = {
  type: 'spring' as const,
  stiffness: 460,
  damping: 36,
  mass: 0.7,
}

/** Page enter — soft lift, no bounce */
export const pageEnter = {
  initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -6, filter: 'blur(3px)' },
  transition: { duration: 0.32, ease: easeOutSoft },
}

/** Shell reveal after brand boot */
export const shellReveal = {
  initial: { opacity: 0, y: 14, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.55, ease: easeOutSoft },
}

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.06,
    },
  },
}

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: fadeLift },
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

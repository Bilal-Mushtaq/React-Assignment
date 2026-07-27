/** Shared Framer Motion presets — soft, low-bounce easing */

export const easeOutSoft = [0.16, 1, 0.3, 1] as const

export const springSoft = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 32,
  mass: 0.9,
}

export const springSidebar = {
  type: 'spring' as const,
  stiffness: 220,
  damping: 30,
  mass: 1,
}

export const fadeSoft = {
  duration: 0.28,
  ease: easeOutSoft,
}

export const fadeQuick = {
  duration: 0.22,
  ease: easeOutSoft,
}

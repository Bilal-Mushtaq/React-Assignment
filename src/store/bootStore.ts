import { create } from 'zustand'

function prefersReducedMotionSync(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

type BootState = {
  /** True after the brand boot finishes (or is skipped). */
  complete: boolean
  /** True if the boot overlay ran on this page load (for staggered dashboard reveal). */
  playedThisSession: boolean
  completeBoot: (played: boolean) => void
}

export const useBootStore = create<BootState>((set) => ({
  // Only skip waiting when reduced motion — boot runs on every hard refresh otherwise
  complete: prefersReducedMotionSync(),
  playedThisSession: false,
  completeBoot: (played) => set({ complete: true, playedThisSession: played }),
}))

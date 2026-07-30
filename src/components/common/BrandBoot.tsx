import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { easeOutSoft, springSoft } from '../../lib/motion'
import { useBootStore } from '../../store/bootStore'

const STATUS_LINES = ['Calibrating sensors', 'Syncing camera grid', 'Ops feed online']

  /** Total held visible before exit — leave soon after last status. */
const BOOT_HOLD_MS = 1680
const STATUS_STEP_MS = 520
const EXIT_MS = 0.36

export function BrandBoot() {
  const reduced = useReducedMotion()
  const completeBoot = useBootStore((s) => s.completeBoot)
  const [visible, setVisible] = useState(false)
  const [statusIndex, setStatusIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const settledRef = useRef(false)

  const settle = (played: boolean) => {
    if (settledRef.current) return
    settledRef.current = true
    completeBoot(played)
  }

  /** Reveal shell under the fading overlay so we never sit on a blank navy frame. */
  const beginExit = () => {
    settle(true)
    setVisible(false)
  }

  const beginExitRef = useRef(beginExit)
  beginExitRef.current = beginExit

  useEffect(() => {
    if (reduced === null) return

    if (reduced) {
      settle(false)
      return
    }

    setVisible(true)
    setProgress(0)

    const statusTimer = window.setInterval(() => {
      setStatusIndex((i) => Math.min(i + 1, STATUS_LINES.length - 1))
    }, STATUS_STEP_MS)

    const started = performance.now()
    const progressTimer = window.setInterval(() => {
      const pct = Math.min(100, ((performance.now() - started) / BOOT_HOLD_MS) * 100)
      setProgress(pct)
    }, 32)

    const doneTimer = window.setTimeout(() => {
      beginExitRef.current()
    }, BOOT_HOLD_MS)

    return () => {
      window.clearInterval(statusTimer)
      window.clearInterval(progressTimer)
      window.clearTimeout(doneTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        beginExitRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible])

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="brand-boot"
          role="dialog"
          aria-label="Vigil is starting"
          aria-live="polite"
          className="fixed inset-0 z-[300] flex cursor-pointer flex-col items-center justify-center overflow-hidden text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -12, filter: 'blur(10px)' }}
          transition={{ duration: EXIT_MS, ease: easeOutSoft }}
          onClick={beginExit}
        >
          {/* Layered atmosphere — no moving scan lines */}
          <div className="absolute inset-0 bg-[#0b0e16]" aria-hidden="true" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 55% 40% at 50% 38%, rgba(174,175,181,0.16), transparent 70%),
                radial-gradient(ellipse 40% 30% at 20% 80%, rgba(52,211,153,0.06), transparent 60%),
                radial-gradient(ellipse 35% 28% at 85% 70%, rgba(255,255,255,0.04), transparent 55%)
              `,
            }}
          />
          <div
            aria-hidden="true"
            className="boot-noise pointer-events-none absolute inset-0 opacity-[0.035]"
          />

          <motion.div
            className="relative z-[1] flex w-full max-w-sm flex-col items-center px-6 text-center"
            initial="hidden"
            animate="show"
            exit="leave"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
              leave: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.78, y: 16 },
                show: { opacity: 1, scale: 1, y: 0, transition: springSoft },
                leave: { opacity: 0, scale: 0.92, y: -8, transition: { duration: 0.25 } },
              }}
              className="relative mb-7"
            >
              <span
                aria-hidden="true"
                className="absolute -inset-5 rounded-full bg-[radial-gradient(circle,rgba(174,175,181,0.28),transparent_68%)] blur-md"
              />
              <span
                aria-hidden="true"
                className="boot-ring absolute -inset-3 rounded-[1.35rem] border border-white/10"
              />
              <div className="relative flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-2xl border border-white/20 bg-[linear-gradient(145deg,#d4d5d9,#aeafb5_55%,#9899a0)] text-[#161b2a] shadow-[0_16px_48px_-12px_rgba(174,175,181,0.65)]">
                <Sparkles size={30} strokeWidth={2.2} />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b0e16] bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.75)]" />
              </div>
            </motion.div>

            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 14, letterSpacing: '0.08em' },
                show: {
                  opacity: 1,
                  y: 0,
                  letterSpacing: '-0.03em',
                  transition: { duration: 0.5, ease: easeOutSoft },
                },
                leave: { opacity: 0, y: -6, transition: { duration: 0.2 } },
              }}
              className="font-[family-name:var(--heading)] text-4xl font-bold tracking-tight text-white sm:text-5xl"
              style={{ color: '#ffffff' }}
            >
              Vigil
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOutSoft } },
                leave: { opacity: 0, transition: { duration: 0.18 } },
              }}
              className="mt-4 pt-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#aeafb5]"
            >
              AI Ops Center
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.4 } },
                leave: { opacity: 0, transition: { duration: 0.16 } },
              }}
              className="mt-10 w-full max-w-[13.5rem]"
            >
              <div className="h-[2px] overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#aeafb5]/50 via-[#e8e8ea] to-[#aeafb5]/50"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'linear', duration: 0.08 }}
                />
              </div>

              <div className="mt-4 flex min-h-[1.25rem] items-center justify-center gap-2 text-[12px] text-[#8b8d96]">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/45" />
                  <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={STATUS_LINES[statusIndex]}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.22, ease: easeOutSoft }}
                    className="mono tracking-wide"
                  >
                    {STATUS_LINES[statusIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.7, duration: 0.35 }}
            className="absolute bottom-8 text-[10px] uppercase tracking-[0.2em] text-[#7e818c]"
          >
            Click or Esc to skip
          </motion.p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

import { Outlet, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { SkipLink } from '../components/common/SkipLink'
import { BrandBoot } from '../components/common/BrandBoot'
import { Toaster } from '../components/ui/toaster'
import { CommandPalette } from '../features/command-palette/components/CommandPalette'
import { PageTransition } from '../components/common/PageTransition'
import { useBootStore } from '../store/bootStore'
import { shellReveal, springSidebar } from '../lib/motion'
import { SidebarNav } from './SidebarNav'
import { TopNavBar } from './TopNavBar'

export default function ShellLayout() {
  const bootComplete = useBootStore((s) => s.complete)
  const location = useLocation()
  const reduced = useReducedMotion()

  return (
    <div className="shell-outer relative flex h-svh overflow-hidden text-[color:var(--text)]">
      <SkipLink />
      <BrandBoot />
      <CommandPalette />
      <Toaster />

      <motion.div
        className="flex h-full min-h-0 w-full overflow-hidden"
        initial={reduced ? false : shellReveal.initial}
        animate={
          bootComplete
            ? shellReveal.animate
            : { opacity: 0, y: 10, scale: 0.99 }
        }
        transition={reduced ? { duration: 0 } : { duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
        style={{ pointerEvents: bootComplete ? 'auto' : 'none' }}
      >
        <SidebarNav />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col p-2.5 sm:p-3 lg:pl-0">
          <motion.div
            className="shell-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
            initial={false}
            animate={bootComplete ? { opacity: 1 } : { opacity: 0.9 }}
            transition={springSidebar}
          >
            <TopNavBar />

            <main
              id="main-content"
              className="main-scroll shell-main-bg min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-4 lg:px-6"
              aria-label="Main content"
              tabIndex={-1}
            >
              <ErrorBoundary>
                {/* No AnimatePresence mode="wait" — that left main blank between routes */}
                <PageTransition key={location.pathname}>
                  <Outlet />
                </PageTransition>
              </ErrorBoundary>
            </main>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

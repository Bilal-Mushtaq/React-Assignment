import { motion } from 'framer-motion'
import { useThemeStore } from '../store/themeStore'
import { springSidebar } from '../lib/motion'
import { MobileSidebar, SidebarContent } from './SidebarContent'

const SIDEBAR_EXPANDED = 248
const SIDEBAR_COLLAPSED = 72

export function SidebarNav() {
  const sidebarExpanded = useThemeStore((s) => s.sidebarExpanded)

  return (
    <>
      <MobileSidebar />

      <motion.aside
        aria-label="Primary"
        initial={false}
        animate={{ width: sidebarExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED }}
        transition={springSidebar}
        className="relative hidden h-full shrink-0 overflow-hidden border-r border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_92%,transparent)] backdrop-blur-md lg:block"
      >
        <SidebarContent expanded={sidebarExpanded} />
      </motion.aside>
    </>
  )
}

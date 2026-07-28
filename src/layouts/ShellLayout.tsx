import { Outlet } from 'react-router-dom'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { SkipLink } from '../components/common/SkipLink'
import { Toaster } from '../components/ui/toaster'
import { CommandPalette } from '../features/command-palette/components/CommandPalette'
import { SidebarNav } from './SidebarNav'
import { TopNavBar } from './TopNavBar'

export default function ShellLayout() {
  return (
    <div className="flex h-svh overflow-hidden bg-[color:var(--surface)] text-[color:var(--text)]">
      <SkipLink />
      <CommandPalette />
      <Toaster />

      <SidebarNav />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col p-3 lg:pl-0">
        <div className="shell-panel flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden shadow-[var(--shadow-lg)]">
          <TopNavBar />

          <main
            id="main-content"
            className="main-scroll shell-main-bg min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-4 lg:px-6"
            aria-label="Main content"
            tabIndex={-1}
          >
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  )
}

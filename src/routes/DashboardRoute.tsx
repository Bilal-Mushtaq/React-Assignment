import { Download, RotateCcw, Redo2, Undo2, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { WidgetGrid } from '../features/dashboard/components/WidgetGrid'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { DashboardSkeleton } from '../components/common/PageSkeletons'
import { usePageReady } from '../hooks/usePageReady'
import { useDashboardStore } from '../store/dashboardStore'
import { useCommandPaletteStore } from '../store/commandPaletteStore'

export default function DashboardRoute() {
  const ready = usePageReady()
  const [importError, setImportError] = useState<string | null>(null)

  const pastLength = useDashboardStore((s) => s.past.length)
  const futureLength = useDashboardStore((s) => s.future.length)
  const canUndo = pastLength > 0
  const canRedo = futureLength > 0
  const undo = useDashboardStore((s) => s.undo)
  const redo = useDashboardStore((s) => s.redo)
  const exportLayout = useDashboardStore((s) => s.exportLayout)
  const importLayout = useDashboardStore((s) => s.importLayout)
  const resetToDefaults = useDashboardStore((s) => s.resetToDefaults)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (useCommandPaletteStore.getState().open) return
      const mod = event.ctrlKey || event.metaKey
      if (!mod) return
      const key = event.key.toLowerCase()
      if (key === 'z' && !event.shiftKey) {
        event.preventDefault()
        useDashboardStore.getState().undo()
      } else if (key === 'y' || (key === 'z' && event.shiftKey)) {
        event.preventDefault()
        useDashboardStore.getState().redo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleExport = () => {
    const raw = exportLayout()
    const blob = new Blob([raw], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vigil-dashboard-layout.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = async (file: File) => {
    setImportError(null)
    try {
      const raw = await file.text()
      const result = importLayout(raw)
      if (!result.ok) setImportError(result.error)
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Failed to import')
    }
  }

  if (!ready) return <DashboardSkeleton />

  return (
    <div className="space-y-4" aria-label="Dashboard">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)]/80 p-4 shadow-[var(--shadow-sm)] backdrop-blur-sm">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-[color:var(--text-h)]">Operations board</h2>
            <Badge tone="accent">Editable</Badge>
          </div>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-[color:var(--text-muted)]">
            Drag by the handle, resize from corners, pin to lock, or collapse widgets. Layout persists in local storage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button size="sm" onClick={undo} disabled={!canUndo} aria-label="Undo layout changes">
            <Undo2 size={14} />
            Undo
          </Button>
          <Button size="sm" onClick={redo} disabled={!canRedo} aria-label="Redo layout changes">
            <Redo2 size={14} />
            Redo
          </Button>
          <Button size="sm" onClick={resetToDefaults} aria-label="Reset dashboard layout to defaults">
            <RotateCcw size={14} />
            Reset
          </Button>
          <Button size="sm" variant="primary" onClick={handleExport} aria-label="Export dashboard layout">
            <Download size={14} />
            Export
          </Button>
          <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-2.5 text-xs font-medium text-[color:var(--text-h)] shadow-[var(--shadow-sm)] transition hover:bg-[color:var(--surface-muted)] hover:border-[color:var(--border-strong)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[color:var(--accent)]">
            <Upload size={14} />
            Import
            <input
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void handleImportFile(f)
              }}
              aria-label="Import dashboard layout file"
            />
          </label>
        </div>
      </div>

      {importError ? (
        <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-600">
          {importError}
        </div>
      ) : null}

      <WidgetGrid />
    </div>
  )
}

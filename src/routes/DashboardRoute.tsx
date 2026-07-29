import { useEffect, useRef, useState } from 'react'
import { Download, RotateCcw, Redo2, Undo2, Upload } from 'lucide-react'
import { WidgetGrid } from '../features/dashboard/components/WidgetGrid'
import { Button } from '../components/ui/button'
import { DashboardSkeleton } from '../components/common/PageSkeletons'
import { usePageReady } from '../hooks/usePageReady'
import { useDashboardStore } from '../store/dashboardStore'
import { useCommandPaletteStore } from '../store/commandPaletteStore'

export default function DashboardRoute() {
  const ready = usePageReady()
  const [importError, setImportError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-elevated)_88%,transparent)] p-4 shadow-[var(--shadow-sm)] backdrop-blur-md [background-image:linear-gradient(180deg,var(--highlight),transparent_40%)]">
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-[color:var(--text-h)]">Operations board</h2>
          <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">
            Drag handles to rearrange · pin to lock · layout saves automatically
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)]/70 p-0.5 shadow-[var(--shadow-sm)]">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 rounded-md"
              onClick={undo}
              disabled={!canUndo}
              aria-label="Undo layout changes"
            >
              <Undo2 size={14} />
              Undo
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 rounded-md"
              onClick={redo}
              disabled={!canRedo}
              aria-label="Redo layout changes"
            >
              <Redo2 size={14} />
              Redo
            </Button>
          </div>
          <Button size="sm" variant="ghost" onClick={resetToDefaults} aria-label="Reset dashboard layout to defaults">
            <RotateCcw size={14} />
            Reset
          </Button>
          <Button size="sm" variant="secondary" onClick={handleExport} aria-label="Export dashboard layout">
            <Download size={14} />
            Export
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Import dashboard layout"
          >
            <Upload size={14} />
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void handleImportFile(f)
              e.target.value = ''
            }}
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      </div>

      {importError ? (
        <div className="rounded-xl border border-[color:color-mix(in_srgb,var(--danger)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--danger)_10%,transparent)] px-4 py-3 text-sm text-[color:var(--danger)]">
          {importError}
        </div>
      ) : null}

      <WidgetGrid />
    </div>
  )
}

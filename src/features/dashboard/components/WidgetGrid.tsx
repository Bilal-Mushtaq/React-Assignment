import { memo, useMemo, useCallback, useEffect, useRef, useState } from 'react'
import {
  ResponsiveGridLayout,
  verticalCompactor,
  type Layout,
  type LayoutItem,
  type ResponsiveLayouts,
} from 'react-grid-layout'
import { gridBounds, minMaxSize } from 'react-grid-layout/core'
import { Star, ChevronsDownUp, GripVertical, Lock } from 'lucide-react'
import { useDashboardStore } from '../../../store/dashboardStore'
import { widgetDefinitions, type WidgetId } from '../widgets/widgetRegistry'
import { cn } from '../../../lib/cn'
import { layoutsEqual, normalizeLayouts } from '../utils/normalizeLayouts'
import { compactOnly, fitMovedAndCompact } from '../utils/adaptiveFit'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const collapsedHeight = 2

const BREAKPOINTS = { lg: 880, md: 720, sm: 0 } as const
const COLS = { lg: 12, md: 8, sm: 6 } as const
type Breakpoint = keyof typeof COLS

function applyLayoutConstraints(
  layouts: ResponsiveLayouts,
  collapsedById: Record<string, boolean>,
  pinnedIds: Set<string>,
) {
  const safe = normalizeLayouts(layouts)
  const next: ResponsiveLayouts = {}
  for (const bp of Object.keys(safe)) {
    const row = safe[bp]
    if (!row || !Array.isArray(row)) continue
    next[bp] = row.map((item) => {
      const collapsed = collapsedById[item.i]
      const pinned = pinnedIds.has(item.i)
      return {
        ...item,
        h: collapsed ? Math.min(item.h, collapsedHeight) : item.h,
        static: pinned,
      }
    })
  }
  return next
}

type WidgetFrameProps = {
  widgetId: WidgetId
  collapsed: boolean
  pinned: boolean
  onToggleCollapse: (id: WidgetId) => void
  onTogglePinned: (id: WidgetId) => void
}

const WidgetFrame = memo(function WidgetFrame({
  widgetId,
  collapsed,
  pinned,
  onToggleCollapse,
  onTogglePinned,
}: WidgetFrameProps) {
  const def = widgetDefinitions[widgetId]
  const Content = def.component

  return (
    <section
      data-widget-card
      data-pinned={pinned ? 'true' : undefined}
      aria-label={def.title}
      className="widget-surface group/widget flex h-full min-h-0 w-full flex-col"
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-[color:var(--border)] bg-[color:color-mix(in_srgb,var(--surface-muted)_78%,transparent)] px-3 py-2.5">
        <div
          className={cn(
            'flex min-w-0 flex-1 select-none items-center gap-2',
            pinned ? 'cursor-default' : 'widget-drag-handle cursor-grab active:cursor-grabbing',
          )}
          title={pinned ? 'Unpin to move or resize' : 'Drag to rearrange'}
        >
          <span
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-md border border-transparent text-[color:var(--text-muted)] transition',
              !pinned && 'group-hover/widget:border-[color:var(--border)] group-hover/widget:bg-[color:var(--surface-elevated)]',
            )}
          >
            {pinned ? <Lock size={12} aria-hidden="true" /> : <GripVertical size={13} aria-hidden="true" />}
          </span>
          <span className="truncate text-[13px] font-semibold tracking-tight text-[color:var(--text-h)]">
            {def.title}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className={cn(
              'rounded-lg p-1.5 transition focus-ring',
              pinned
                ? 'text-[color:var(--warning)] hover:bg-[color:color-mix(in_srgb,var(--warning)_12%,transparent)]'
                : 'text-[color:var(--text-muted)] hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-h)]',
            )}
            onClick={() => onTogglePinned(widgetId)}
            aria-label={pinned ? 'Unpin widget (allow drag and resize)' : 'Pin widget (lock position)'}
            aria-pressed={pinned}
          >
            <Star size={14} fill={pinned ? 'currentColor' : 'none'} />
          </button>

          <button
            type="button"
            className="rounded-lg p-1.5 text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-h)] focus-ring"
            onClick={() => onToggleCollapse(widgetId)}
            aria-label={collapsed ? 'Expand widget' : 'Collapse widget'}
          >
            <ChevronsDownUp
              size={14}
              style={{
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 120ms ease',
              }}
            />
          </button>
        </div>
      </header>

      {!collapsed ? (
        <div className="min-h-0 flex-1 select-text overflow-hidden p-3">
          <Content />
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 text-[11px] text-[color:var(--text-muted)]">
          <span className="font-medium text-[color:var(--text)]">{def.title}</span>
          <span aria-hidden="true">·</span>
          <span>Collapsed</span>
          {pinned ? (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[color:var(--warning)]">Pinned</span>
            </>
          ) : null}
        </div>
      )}
    </section>
  )
})

export function WidgetGrid() {
  const containerRef = useRef<HTMLDivElement>(null)
  const layouts = useDashboardStore((s) => s.layouts)
  const collapsedById = useDashboardStore((s) => s.collapsedById)
  const pinnedWidgetIds = useDashboardStore((s) => s.pinnedWidgetIds)
  const setLayouts = useDashboardStore((s) => s.setLayouts)
  const toggleCollapse = useDashboardStore((s) => s.toggleCollapse)
  const togglePinned = useDashboardStore((s) => s.togglePinned)
  const isApplyingHistory = useDashboardStore((s) => s.isApplyingHistory)
  const clearApplyingHistory = useDashboardStore((s) => s.clearApplyingHistory)

  const pinnedSet = useMemo(() => new Set(pinnedWidgetIds), [pinnedWidgetIds])
  const effectiveLayouts = useMemo(
    () => applyLayoutConstraints(layouts, collapsedById, pinnedSet),
    [layouts, collapsedById, pinnedSet],
  )

  const [width, setWidth] = useState(0)
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('lg')
  const isInteractingRef = useRef(false)
  const skipMountCommitRef = useRef(true)
  const skipNextLayoutChangeRef = useRef(false)
  const dragSessionRef = useRef<{ id: string; preferredW: number } | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => setWidth(el.getBoundingClientRect().width)
    update()

    const observer = new ResizeObserver(() => update())
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isApplyingHistory) return
    const id = window.setTimeout(() => clearApplyingHistory(), 0)
    return () => window.clearTimeout(id)
  }, [isApplyingHistory, clearApplyingHistory])

  const persistLayout = useCallback(
    (nextForBreakpoint: Layout) => {
      const cols = COLS[breakpoint] ?? 12
      const compacted = compactOnly(nextForBreakpoint, cols)
      const next: ResponsiveLayouts = {
        ...useDashboardStore.getState().layouts,
        [breakpoint]: compacted,
      }
      const current = useDashboardStore.getState().layouts
      if (layoutsEqual(current, next)) return
      setLayouts(next)
    },
    [breakpoint, setLayouts],
  )

  const handleLayoutChange = useCallback(
    (_layout: Layout, _allLayouts: ResponsiveLayouts) => {
      // Persist only from drag/resize stop. Mid-drag + mount echoes cause update loops.
      if (skipMountCommitRef.current) {
        skipMountCommitRef.current = false
        return
      }
      if (skipNextLayoutChangeRef.current) {
        skipNextLayoutChangeRef.current = false
        return
      }
      if (isInteractingRef.current) return
      if (useDashboardStore.getState().isApplyingHistory) return
    },
    [],
  )

  const markDragStart = useCallback(
    (_layout: Layout, _oldItem: LayoutItem | null, newItem: LayoutItem | null) => {
      isInteractingRef.current = true
      if (newItem) {
        dragSessionRef.current = { id: newItem.i, preferredW: newItem.w }
      }
    },
    [],
  )

  const markResizeStart = useCallback(
    (_layout: Layout, _oldItem: LayoutItem | null, newItem: LayoutItem | null) => {
      isInteractingRef.current = true
      if (newItem) {
        dragSessionRef.current = { id: newItem.i, preferredW: newItem.w }
      }
    },
    [],
  )

  const commitDrag = useCallback(
    (layout: Layout, _oldItem: LayoutItem | null, newItem: LayoutItem | null) => {
      isInteractingRef.current = false
      skipNextLayoutChangeRef.current = true

      const cols = COLS[breakpoint] ?? 12
      const session = dragSessionRef.current
      const movedId = newItem?.i ?? session?.id ?? null
      const preferredW = session?.preferredW ?? newItem?.w

      dragSessionRef.current = null

      const next = fitMovedAndCompact(layout, cols, movedId, preferredW)
      const merged: ResponsiveLayouts = {
        ...useDashboardStore.getState().layouts,
        [breakpoint]: next,
      }
      if (layoutsEqual(useDashboardStore.getState().layouts, merged)) return
      setLayouts(merged)
    },
    [breakpoint, setLayouts],
  )

  const commitResize = useCallback(
    (layout: Layout) => {
      isInteractingRef.current = false
      skipNextLayoutChangeRef.current = true
      dragSessionRef.current = null
      persistLayout(layout)
    },
    [persistLayout],
  )

  const widgetIds = useMemo(() => Object.keys(widgetDefinitions) as WidgetId[], [])

  if (width === 0) {
    return (
      <div
        ref={containerRef}
        className="h-96 animate-pulse rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]"
        aria-busy="true"
      />
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full max-w-full overflow-hidden"
      aria-label="Dashboard widget grid"
    >
      <ResponsiveGridLayout
        className="layout vigil-grid"
        width={width}
        layouts={effectiveLayouts}
        compactor={verticalCompactor}
        constraints={[gridBounds, minMaxSize]}
        dragConfig={{
          handle: '.widget-drag-handle',
          threshold: 5,
        }}
        resizeConfig={{
          enabled: true,
          // Corner + edges only — avoids the default dotted SVG handles on every side
          handles: ['se', 'e', 's'],
        }}
        onLayoutChange={handleLayoutChange}
        onBreakpointChange={(bp) => setBreakpoint(bp as Breakpoint)}
        onDragStart={markDragStart}
        onResizeStart={markResizeStart}
        onDragStop={commitDrag}
        onResizeStop={commitResize}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={40}
        margin={[12, 12]}
        containerPadding={[0, 0]}
      >
        {widgetIds.map((id) => (
          <div key={id} id={`widget-${id}`} className="min-h-0">
            <WidgetFrame
              widgetId={id}
              collapsed={!!collapsedById[id]}
              pinned={pinnedSet.has(id)}
              onToggleCollapse={toggleCollapse}
              onTogglePinned={togglePinned}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  )
}

import type { Layout, LayoutItem } from 'react-grid-layout'
import { verticalCompactor } from 'react-grid-layout'

function overlapsVertically(aY: number, aH: number, bY: number, bH: number) {
  return aY < bY + bH && aY + aH > bY
}

export function getAvailableWidth(
  layout: Layout,
  itemId: string,
  x: number,
  y: number,
  h: number,
  cols: number,
): number {
  const start = Math.max(0, Math.min(Math.floor(x), cols - 1))
  let free = 0

  for (let col = start; col < cols; col++) {
    const blocked = layout.some((other) => {
      if (other.i === itemId) return false
      if (!overlapsVertically(y, h, other.y, other.h)) return false
      return other.x <= col && other.x + other.w > col
    })
    if (blocked) break
    free += 1
  }

  return free
}

export function fitItemWidth(
  layout: Layout,
  item: LayoutItem,
  cols: number,
  preferredW: number,
): LayoutItem {
  const minW = Math.max(1, item.minW ?? 1)
  const available = getAvailableWidth(layout, item.i, item.x, item.y, item.h, cols)
  const maxAtEdge = Math.max(0, cols - item.x)

  // Fully blocked or too tight for this widget — keep size, compaction will reflow.
  if (available < minW) return item

  const nextW = Math.max(minW, Math.min(preferredW, available, maxAtEdge))
  if (nextW === item.w) return item
  return { ...item, w: nextW }
}

/**
 * Fit only the moved item (when known), then vertical-compact.
 * Fitting every item every time can fight RGL and cause update loops.
 */
export function fitMovedAndCompact(
  layout: Layout,
  cols: number,
  movedId?: string | null,
  preferredW?: number,
): Layout {
  const next = layout.map((item) => {
    if (movedId && item.i === movedId && !item.static) {
      return fitItemWidth(layout, item, cols, preferredW ?? item.w)
    }
    return { ...item }
  })

  return verticalCompactor.compact(next, cols)
}

export function compactOnly(layout: Layout, cols: number): Layout {
  return verticalCompactor.compact(
    layout.map((item) => ({ ...item })),
    cols,
  )
}

import type { Layout, LayoutItem, ResponsiveLayouts } from 'react-grid-layout'
import { getDefaultLayouts } from '../widgets/widgetRegistry'

function isLayoutItem(item: unknown): item is LayoutItem {
  if (!item || typeof item !== 'object') return false
  const o = item as Record<string, unknown>
  return (
    typeof o.i === 'string' &&
    typeof o.x === 'number' &&
    typeof o.y === 'number' &&
    typeof o.w === 'number' &&
    typeof o.h === 'number'
  )
}

function isLayout(value: unknown): value is Layout {
  return Array.isArray(value) && value.length > 0 && value.every(isLayoutItem)
}

function itemKey(item: LayoutItem) {
  return `${item.i}:${item.x}:${item.y}:${item.w}:${item.h}`
}

/** Compare layouts by position/size only (ignore RGL transient props). */
export function layoutsEqual(a: ResponsiveLayouts, b: ResponsiveLayouts) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const bp of keys) {
    const left = a[bp]
    const right = b[bp]
    if (!left && !right) continue
    if (!left || !right || left.length !== right.length) return false
    const sortedLeft = [...left].map(itemKey).sort()
    const sortedRight = [...right].map(itemKey).sort()
    for (let i = 0; i < sortedLeft.length; i++) {
      if (sortedLeft[i] !== sortedRight[i]) return false
    }
  }
  return true
}

/** Ensures persisted / callback layouts match ResponsiveLayouts shape. */
export function normalizeLayouts(input: unknown): ResponsiveLayouts {
  const defaults = getDefaultLayouts()

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return defaults
  }

  const raw = input as Record<string, unknown>
  const normalized: ResponsiveLayouts = {}
  let validBreakpointCount = 0

  for (const [bp, value] of Object.entries(raw)) {
    if (isLayout(value)) {
      normalized[bp] = value.map((item) => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h,
        minW: item.minW,
        minH: item.minH,
        maxW: item.maxW,
        maxH: item.maxH,
        static: item.static,
      }))
      validBreakpointCount += 1
    }
  }

  if (validBreakpointCount === 0) {
    return defaults
  }

  for (const [bp, value] of Object.entries(defaults)) {
    if (!normalized[bp]) {
      normalized[bp] = value
    }
  }

  return normalized
}

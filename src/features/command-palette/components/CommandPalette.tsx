import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import {
  AlertTriangle,
  Camera,
  LayoutDashboard,
  Moon,
  PanelTop,
  Search,
  Settings,
  Sun,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useCommandPaletteStore } from '../../../store/commandPaletteStore'
import { useCommandPaletteShortcut } from '../hooks/useCommandPaletteShortcut'
import { useCommandSearch } from '../hooks/useCommandSearch'
import type { CommandCategory, CommandItem } from '../types'

function categoryIcon(category: CommandCategory) {
  switch (category) {
    case 'navigation':
      return LayoutDashboard
    case 'widget':
      return PanelTop
    case 'camera':
      return Camera
    case 'alert':
      return AlertTriangle
    case 'action':
      return Sun
    default:
      return Search
  }
}

function CommandResultRow({
  item,
  active,
  onSelect,
  onHover,
}: {
  item: CommandItem
  active: boolean
  onSelect: () => void
  onHover: () => void
}) {
  const Icon = categoryIcon(item.category)

  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
        className={[
          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition',
          active
            ? 'bg-[color:var(--accent-bg)] text-[color:var(--text-h)] shadow-[inset_0_0_0_1px_var(--accent-border)]'
            : 'text-[color:var(--text-h)] hover:bg-[color:var(--surface-muted)]',
        ].join(' ')}
      onMouseEnter={onHover}
      onClick={onSelect}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[color:var(--border)] bg-black/5">
        <Icon size={16} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{item.title}</span>
        {item.subtitle ? (
          <span className="block truncate text-xs text-[color:var(--text)]">{item.subtitle}</span>
        ) : null}
      </span>
    </button>
  )
}

export function CommandPalette() {
  useCommandPaletteShortcut()

  const open = useCommandPaletteStore((s) => s.open)
  const query = useCommandPaletteStore((s) => s.query)
  const setQuery = useCommandPaletteStore((s) => s.setQuery)
  const closePalette = useCommandPaletteStore((s) => s.closePalette)
  const openPalette = useCommandPaletteStore((s) => s.openPalette)

  const { groups, flatItems, total } = useCommandSearch(query)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setActiveIndex(0)
  }, [query, open])

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 0)
      return () => window.clearTimeout(id)
    }
  }, [open])

  const runCommand = useCallback(
    (item: CommandItem) => {
      item.onSelect()
      closePalette()
    },
    [closePalette],
  )

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, Math.max(0, flatItems.length - 1)))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = flatItems[activeIndex]
      if (item) runCommand(item)
    }
  }

  let runningIndex = -1

  return (
    <Dialog.Root open={open} onOpenChange={(next) => (next ? openPalette() : closePalette())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-[3px]" />
        <Dialog.Content
          className="fixed left-1/2 top-[12vh] z-[101] w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] shadow-[var(--shadow-lg)] outline-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
          aria-describedby={undefined}
        >
          <VisuallyHidden.Root>
            <Dialog.Title>Command palette</Dialog.Title>
          </VisuallyHidden.Root>

          <div className="flex items-center gap-2 border-b border-[color:var(--border)] px-4 py-3">
            <Search size={18} className="shrink-0 text-[color:var(--text)]" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder="Search cameras, alerts, widgets, actions…"
              className="w-full bg-transparent text-sm text-[color:var(--text-h)] outline-none placeholder:text-[color:var(--text)]"
              aria-label="Search command palette"
              role="combobox"
              aria-expanded="true"
              aria-controls="command-palette-listbox"
              aria-autocomplete="list"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="hidden rounded border border-[color:var(--border)] px-1.5 py-0.5 text-[10px] text-[color:var(--text)] sm:inline">
              Esc
            </kbd>
          </div>

          <div
            id="command-palette-listbox"
            role="listbox"
            aria-label="Search results"
            className="max-h-[min(420px,55vh)] overflow-y-auto p-2"
          >
            {total === 0 ? (
              <div className="px-3 py-10 text-center text-sm text-[color:var(--text)]">
                No results for &ldquo;{query}&rdquo;
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label} className="mb-2">
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--text)]">
                    {group.label}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      runningIndex += 1
                      const index = runningIndex
                      return (
                        <CommandResultRow
                          key={item.id}
                          item={item}
                          active={index === activeIndex}
                          onSelect={() => runCommand(item)}
                          onHover={() => setActiveIndex(index)}
                        />
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[color:var(--border)] px-4 py-2 text-[10px] text-[color:var(--text)]">
            <span>{total} result{total === 1 ? '' : 's'}</span>
            <span className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-[color:var(--border)] px-1">↑</kbd>
                <kbd className="rounded border border-[color:var(--border)] px-1">↓</kbd>
                navigate
              </span>
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-[color:var(--border)] px-1">↵</kbd>
                select
              </span>
              <span className="inline-flex items-center gap-1">
                <Moon size={10} aria-hidden="true" />
                <Settings size={10} aria-hidden="true" />
                actions
              </span>
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

import type { CSSProperties, ReactNode } from 'react'
import { cn } from '../../lib/cn'

function Bone({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={cn('animate-pulse rounded-xl bg-[color:var(--surface-muted)]', className)} style={style} />
  )
}

function WidgetCardSkeleton({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] shadow-[var(--shadow-sm)]',
        className,
      )}
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-[color:var(--border)] bg-[color:var(--surface-muted)]/60 px-3 py-2.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Bone className="h-6 w-6 shrink-0 rounded-md" />
          <Bone className="h-3.5 w-24" />
        </div>
        <div className="flex items-center gap-1">
          <Bone className="h-6 w-6 rounded-lg" />
          <Bone className="h-6 w-6 rounded-lg" />
        </div>
      </header>
      <div className="min-h-0 flex-1 p-3">{children}</div>
    </section>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)]/80 p-4 shadow-[var(--shadow-sm)]">
        <div className="min-w-0 flex-1 space-y-2">
          <Bone className="h-5 w-44" />
          <Bone className="h-3 w-72 max-w-full" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Bone className="h-8 w-16 rounded-lg" />
          <Bone className="h-8 w-16 rounded-lg" />
          <Bone className="h-8 w-16 rounded-lg" />
          <Bone className="h-8 w-20 rounded-lg" />
          <Bone className="h-8 w-20 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-8 lg:grid-cols-12">
        {/* KPI Cards */}
        <WidgetCardSkeleton className="min-h-[220px] md:col-span-8 lg:col-span-3">
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/50 p-3"
              >
                <div className="flex items-center gap-2">
                  <Bone className="h-7 w-7 rounded-lg" />
                  <Bone className="h-2.5 w-14" />
                </div>
                <Bone className="mt-3 h-6 w-16" />
                <Bone className="mt-2 h-2 w-10" />
              </div>
            ))}
          </div>
        </WidgetCardSkeleton>

        {/* Cameras */}
        <WidgetCardSkeleton className="min-h-[300px] md:col-span-8 lg:col-span-6">
          <div className="grid h-full grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/50"
              >
                <Bone className="h-20 w-full rounded-none rounded-t-xl sm:h-24" />
                <div className="space-y-1.5 p-2">
                  <Bone className="h-2.5 w-20" />
                  <Bone className="h-1.5 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </WidgetCardSkeleton>

        {/* Alerts */}
        <WidgetCardSkeleton className="min-h-[300px] md:col-span-4 lg:col-span-3">
          <div className="mb-2 flex gap-1.5">
            <Bone className="h-6 w-12 rounded-lg" />
            <Bone className="h-6 w-14 rounded-lg" />
            <Bone className="h-6 w-16 rounded-lg" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 p-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <Bone className="h-2.5 w-16" />
                  <Bone className="h-2 w-10" />
                </div>
                <Bone className="mt-2 h-2.5 w-full" />
                <Bone className="mt-1.5 h-2 w-[70%]" />
              </div>
            ))}
          </div>
        </WidgetCardSkeleton>

        {/* Incidents */}
        <WidgetCardSkeleton className="min-h-[260px] md:col-span-4 lg:col-span-4">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-2.5">
                <Bone className="mt-1 h-2 w-2 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 p-2.5">
                  <Bone className="h-2.5 w-28" />
                  <Bone className="mt-2 h-2 w-full" />
                  <Bone className="mt-1.5 h-2 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </WidgetCardSkeleton>

        {/* Analytics */}
        <WidgetCardSkeleton className="min-h-[260px] md:col-span-5 lg:col-span-5">
          <div className="flex h-full flex-col gap-2.5">
            <div className="flex h-16 items-end gap-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/50 p-2.5">
              {[40, 65, 45, 80, 55, 70, 50, 75].map((h, i) => (
                <Bone key={i} className="flex-1 rounded-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-8 gap-1 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/50 p-2.5">
              {Array.from({ length: 24 }).map((_, i) => (
                <Bone key={i} className="aspect-square rounded-[2px]" />
              ))}
            </div>
          </div>
        </WidgetCardSkeleton>

        {/* Activity */}
        <WidgetCardSkeleton className="min-h-[260px] md:col-span-3 lg:col-span-3">
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-muted)]/40 p-2.5"
              >
                <Bone className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Bone className="h-2.5 w-full" />
                  <Bone className="h-2 w-20" />
                </div>
              </div>
            ))}
          </div>
        </WidgetCardSkeleton>
      </div>
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <div className="w-full space-y-4 pb-8" aria-busy="true" aria-label="Loading settings">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)]/80 p-4 shadow-[var(--shadow-sm)]">
        <div className="min-w-0 flex-1 space-y-2">
          <Bone className="h-5 w-28" />
          <Bone className="h-3 w-80 max-w-full" />
        </div>
        <Bone className="h-8 w-36 rounded-lg" />
      </div>

      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4 shadow-[var(--shadow-sm)]">
        <div className="mb-3 flex items-center gap-2">
          <Bone className="h-7 w-7 rounded-lg" />
          <div className="space-y-1.5">
            <Bone className="h-3.5 w-24" />
            <Bone className="h-2.5 w-40" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Bone className="h-28" />
          <Bone className="h-28" />
          <Bone className="h-28" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4 shadow-[var(--shadow-sm)]">
          <div className="mb-3 flex items-center gap-2">
            <Bone className="h-7 w-7 rounded-lg" />
            <div className="space-y-1.5">
              <Bone className="h-3.5 w-28" />
              <Bone className="h-2.5 w-36" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Bone key={i} className="h-8 w-8 rounded-full" />
            ))}
            <Bone className="h-8 w-24 rounded-lg" />
          </div>
          <Bone className="mt-3 h-16" />
        </div>

        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4 shadow-[var(--shadow-sm)]">
          <div className="mb-3 flex items-center gap-2">
            <Bone className="h-7 w-7 rounded-lg" />
            <div className="space-y-1.5">
              <Bone className="h-3.5 w-20" />
              <Bone className="h-2.5 w-40" />
            </div>
          </div>
          <Bone className="h-20" />
        </div>
      </div>

      <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-4 shadow-[var(--shadow-sm)]">
        <div className="mb-4 flex items-center gap-2">
          <Bone className="h-7 w-7 rounded-lg" />
          <div className="space-y-1.5">
            <Bone className="h-3.5 w-32" />
            <Bone className="h-2.5 w-44" />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Bone className="h-24" />
          <Bone className="h-32" />
        </div>
      </div>
    </div>
  )
}

import type { WidgetId } from '../../dashboard/widgets/widgetRegistry'

export function scrollToWidget(widgetId: WidgetId) {
  window.setTimeout(() => {
    const el = document.getElementById(`widget-${widgetId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el?.classList.add('ring-2', 'ring-[color:var(--accent)]')
    window.setTimeout(() => {
      el?.classList.remove('ring-2', 'ring-[color:var(--accent)]')
    }, 1200)
  }, 120)
}

import type { WidgetId } from '../../dashboard/widgets/widgetRegistry'
import { useUiStore } from '../../../store/uiStore'

export function scrollToWidget(widgetId: WidgetId) {
  useUiStore.getState().setActiveWidgetId(widgetId)

  window.setTimeout(() => {
    const wrap = document.getElementById(`widget-${widgetId}`)
    const card = (wrap?.querySelector('[data-widget-card]') as HTMLElement | null) ?? wrap
    if (!card) return

    card.scrollIntoView({ behavior: 'smooth', block: 'center' })
    card.classList.remove('widget-focus-flash')
    // Retrigger animation if already focused
    void card.offsetWidth
    card.classList.add('widget-focus-flash')

    window.setTimeout(() => {
      card.classList.remove('widget-focus-flash')
    }, 1600)
  }, 120)
}

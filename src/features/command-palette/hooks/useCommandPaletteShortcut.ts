import { useEffect } from 'react'
import { useCommandPaletteStore } from '../../../store/commandPaletteStore'

export function useCommandPaletteShortcut() {
  const togglePalette = useCommandPaletteStore((s) => s.togglePalette)
  const closePalette = useCommandPaletteStore((s) => s.closePalette)
  const open = useCommandPaletteStore((s) => s.open)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isModK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'
      if (isModK) {
        event.preventDefault()
        togglePalette()
        return
      }

      if (event.key === 'Escape' && open) {
        event.preventDefault()
        closePalette()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [togglePalette, closePalette, open])
}

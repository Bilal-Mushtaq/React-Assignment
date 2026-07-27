export type CommandCategory = 'navigation' | 'widget' | 'camera' | 'alert' | 'action'

export type CommandItem = {
  id: string
  category: CommandCategory
  title: string
  subtitle?: string
  keywords: string[]
  onSelect: () => void
}

export type CommandGroup = {
  label: string
  items: CommandItem[]
}

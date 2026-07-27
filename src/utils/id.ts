let counter = 0

export function generateId(prefix = 'evt') {
  counter += 1
  return `${prefix}_${Date.now()}_${counter}_${Math.random().toString(36).slice(2, 7)}`
}

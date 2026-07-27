export function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pickRandom<T>(items: readonly T[]): T {
  return items[randomBetween(0, items.length - 1)]!
}

export function randomFloat(min: number, max: number, decimals = 1) {
  const value = Math.random() * (max - min) + min
  return Number(value.toFixed(decimals))
}

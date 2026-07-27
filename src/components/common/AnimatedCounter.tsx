import { motion, useMotionValueEvent, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

type AnimatedCounterProps = {
  value: number
  suffix?: string
  decimals?: number
  className?: string
}

export function AnimatedCounter({ value, suffix = '', decimals = 0, className }: AnimatedCounterProps) {
  const spring = useSpring(value, { stiffness: 140, damping: 22, mass: 0.6 })
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  useMotionValueEvent(spring, 'change', (latest) => {
    const factor = 10 ** decimals
    setDisplay(Math.round(latest * factor) / factor)
  })

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : display.toLocaleString(undefined, { maximumFractionDigits: 0 })

  return (
    <motion.span className={className} layout>
      {formatted}
      {suffix}
    </motion.span>
  )
}

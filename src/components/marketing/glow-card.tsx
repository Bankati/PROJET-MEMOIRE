/**
 * Carte avec effet de glow qui suit le curseur.
 * Inspirée des meilleures interfaces SaaS (Stripe, Linear).
 * Utilise un gradient radial positionné dynamiquement via CSS variables.
 */
'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

type GlowCardProps = Readonly<{
  children: React.ReactNode
  className?: string
  glowColor?: string
}>

export function GlowCard({
  children,
  className = '',
  glowColor = 'rgba(36, 73, 118, 0.15)',
}: GlowCardProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduce || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      ref.current.style.setProperty('--glow-x', `${x}px`)
      ref.current.style.setProperty('--glow-y', `${y}px`)
    },
    [reduce]
  )
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/70 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800/70 dark:bg-zinc-950/55',
        className
      )}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8%' }}
      transition={{ type: 'spring', stiffness: 260, damping: 28 }}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at var(--glow-x, 50%) var(--glow-y, 50%), ${glowColor}, transparent 40%)`,
        }}
        aria-hidden
      />
      <div className="relative">{children}</div>
    </motion.div>
  )
}

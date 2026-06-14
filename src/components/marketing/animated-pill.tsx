/**
 * Pastille hero avec micro-interaction au survol / tap.
 * L’icône doit être passée en children (élément React), pas en prop composant,
 * pour rester compatible avec les Server Components.
 */
'use client'

import type * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export function AnimatedPill({ label, children }: { label: string; children: React.ReactNode }) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200/70 bg-white/70 px-3 py-2 shadow-sm shadow-zinc-900/5 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/45 dark:shadow-black/25"
      whileHover={
        reduce ? undefined : { scale: 1.03, boxShadow: '0 12px 40px -12px rgba(36,73,118,0.25)' }
      }
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
    >
      <span className="bg-lbs-blue/10 text-lbs-blue grid size-8 place-items-center rounded-xl">
        {children}
      </span>
      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{label}</span>
    </motion.div>
  )
}

/**
 * Fond héros premium avec orbes animées et grille de points décorative.
 * Gère prefers-reduced-motion pour l'accessibilité.
 */
'use client'

import { motion, useReducedMotion } from 'framer-motion'

export function LiveHeroBg() {
  const prefersReducedMotion = useReducedMotion()
  if (prefersReducedMotion) {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle_at_center,rgba(36,73,118,0.18),transparent_60%)] blur-3xl" />
        <div className="absolute right-[-10%] -bottom-60 h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(33,65,108,0.14),transparent_60%)] blur-3xl" />
        <div className="absolute top-1/3 left-[-15%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(128,0,0,0.08),transparent_60%)] blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(24,24,27,0.04)_1px,transparent_0)] [background-size:24px_24px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(244,244,245,0.04)_1px,transparent_0)]" />
      </div>
    )
  }
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute -top-40 left-1/4 h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle_at_center,rgba(36,73,118,0.18),transparent_60%)] blur-3xl"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.7, 1, 0.7],
          x: [0, 30, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute right-[-10%] -bottom-60 h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle_at_center,rgba(33,65,108,0.14),transparent_60%)] blur-3xl"
        animate={{
          scale: [1.04, 1, 1.04],
          x: [0, -24, 0],
          y: [0, 16, 0],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute top-1/3 left-[-15%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,rgba(128,0,0,0.08),transparent_60%)] blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(24,24,27,0.04)_1px,transparent_0)] [background-size:24px_24px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(244,244,245,0.04)_1px,transparent_0)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent dark:from-black" />
    </div>
  )
}

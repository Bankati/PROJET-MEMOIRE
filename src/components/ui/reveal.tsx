/**
 * Wrapper d'animation générique : fait apparaître ses enfants en fondu + léger
 * mouvement vers le haut. Garde framer-motion isolé dans un petit composant
 * client pour que la page appelante puisse rester un Server Component.
 */
'use client'

import * as React from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'

type RevealProps = Readonly<{
  children: React.ReactNode
  className?: string
  delay?: number
}>

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

export function Reveal({ children, className, delay = 0 }: RevealProps): React.JSX.Element {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 28,
        delay,
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * En-tête de section réutilisable avec badge, titre et sous-titre.
 * Intègre le composant Reveal pour l'animation d'entrée au scroll.
 */
'use client'

import { Reveal } from '@/components/marketing/reveal'
import { Badge } from '@/components/ui/badge'

type SectionHeadingProps = Readonly<{
  badge?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}>

export function SectionHeading({ badge, title, subtitle, align = 'center' }: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left'
  return (
    <Reveal>
      <div className={`max-w-3xl ${alignClass}`}>
        {badge && (
          <Badge variant="lbs" className="mb-4 text-xs font-semibold tracking-[0.15em] uppercase">
            {badge}
          </Badge>
        )}
        <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl lg:text-5xl dark:text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-4 text-lg leading-relaxed text-pretty text-zinc-600 dark:text-zinc-300">
            {subtitle}
          </p>
        )}
      </div>
    </Reveal>
  )
}

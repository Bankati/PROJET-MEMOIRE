'use client'
/**
 * Composant Label accessible pour les formulaires.
 * Adapté au design system LBS avec support du dark mode.
 */
import * as React from 'react'

import { cn } from '@/lib/utils'

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm leading-4 font-medium text-zinc-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-zinc-300',
        className
      )}
      {...props}
    />
  )
)
Label.displayName = 'Label'

export { Label }

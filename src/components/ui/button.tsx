/**
 * shadcn/ui - Button
 * Base button component with variants, used across the marketing landing page.
 */
'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lbs-blue/30 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.96] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-b from-lbs-blue to-lbs-blue-2 text-white shadow-sm shadow-lbs-blue/25 hover:shadow-md hover:shadow-lbs-blue/40 hover:brightness-[1.12] active:brightness-[0.9]',
        secondary:
          'bg-zinc-900 text-white hover:bg-zinc-700 active:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:active:bg-zinc-200',
        outline:
          'border border-zinc-200/80 bg-white/40 text-zinc-900 hover:bg-zinc-100 hover:border-zinc-300 active:bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:hover:border-zinc-600 dark:active:bg-zinc-700',
        ghost:
          'hover:bg-zinc-100 hover:text-zinc-900 active:bg-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:active:bg-zinc-700',
        link: 'text-lbs-blue underline-offset-4 hover:underline hover:text-lbs-blue-2 active:opacity-70',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-6',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { buttonVariants }

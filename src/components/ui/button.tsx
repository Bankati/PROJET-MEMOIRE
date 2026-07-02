'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244976]/30 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-b from-[#244976] to-[#1d3d68] text-white shadow-sm shadow-[#244976]/20 hover:brightness-[1.1] hover:shadow-md hover:shadow-[#244976]/30 active:brightness-[0.92]',
        secondary:
          'bg-gray-900 text-white hover:bg-gray-700 active:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300 dark:active:bg-gray-200',
        outline:
          'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100 dark:border-white/[0.12] dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/5 dark:hover:border-white/20',
        ghost:
          'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-white/[0.06] dark:hover:text-white dark:active:bg-white/10',
        link: 'text-[#244976] underline-offset-4 hover:underline hover:text-[#1d3d68] active:opacity-70 dark:text-blue-300',
        destructive:
          'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm shadow-red-500/20',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 rounded-lg px-3.5 text-xs',
        lg: 'h-11 px-7 text-base',
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

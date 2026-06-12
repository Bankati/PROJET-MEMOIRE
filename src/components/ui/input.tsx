/**
 * Composant Input réutilisable pour les formulaires.
 * Adapté au design system LBS avec styles cohérents et support dark mode.
 */
import { cn } from '@/lib/utils'
import * as React from 'react'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'focus:border-lbs-blue focus:ring-lbs-blue/20 flex h-10 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 shadow-sm transition-all placeholder:text-zinc-400 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-[#0f1729] dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20',
          type === 'search' &&
            '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none',
          type === 'file' &&
            'p-0 pr-3 text-zinc-400 italic file:me-3 file:h-full file:border-0 file:border-r file:border-solid file:border-zinc-200 file:bg-transparent file:px-3 file:text-sm file:font-medium file:text-zinc-700 file:not-italic dark:file:border-white/15 dark:file:text-zinc-300',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }

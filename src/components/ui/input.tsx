import { cn } from '@/lib/utils'
import * as React from 'react'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-sm transition-all placeholder:text-gray-400',
          'focus:border-[#244976] focus:ring-2 focus:ring-[#244976]/15 focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:border-white/[0.12] dark:bg-[#1e2535] dark:text-white dark:placeholder:text-gray-500',
          'dark:focus:border-blue-400 dark:focus:ring-blue-400/20',
          type === 'search' &&
            '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none',
          type === 'file' &&
            'p-0 pr-3 text-gray-400 italic file:me-3 file:h-full file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-transparent file:px-3 file:text-sm file:font-medium file:text-gray-700 file:not-italic dark:file:border-white/[0.12] dark:file:text-gray-300',
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

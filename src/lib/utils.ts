/**
 * Shared frontend utilities.
 * `cn()` is the standard shadcn/ui helper to merge Tailwind classNames safely.
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

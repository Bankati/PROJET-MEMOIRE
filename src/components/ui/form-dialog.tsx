'use client'
/**
 * Dialog animé plein écran centré pour les formulaires.
 * Inspiré du MissionSuccessDialog avec backdrop blur, animation scale+opacity,
 * et fermeture au clic extérieur / touche Escape.
 * Adapté au design system LBS avec support complet du dark mode.
 */
import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type FormDialogProps = Readonly<{
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
  maxWidth?: string
}>

export const FormDialog = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  className,
  maxWidth = 'max-w-lg',
}: FormDialogProps): React.JSX.Element => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )
  useEffect(() => {
    if (!isOpen) {
      return
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])
  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm dark:bg-black/70"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              'relative z-10 w-full overflow-hidden rounded-2xl border border-zinc-200/70 bg-white shadow-2xl dark:border-white/10 dark:bg-[#1a2332]',
              maxWidth,
              className
            )}
          >
            <div className="relative p-6">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 size-8 rounded-full text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200"
                onClick={onClose}
                aria-label="Fermer"
              >
                <X className="size-4" />
              </Button>
              <div className="mb-5 flex items-start gap-3">
                {icon ? (
                  <div className="bg-lbs-blue/10 dark:bg-lbs-blue/20 grid size-10 shrink-0 place-items-center rounded-xl">
                    {icon}
                  </div>
                ) : null}
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h2>
                  {description ? (
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
                  ) : null}
                </div>
              </div>
              {children}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

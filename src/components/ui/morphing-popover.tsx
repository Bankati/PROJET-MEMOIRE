'use client'
/**
 * Composant MorphingPopover avec animation fluide (motion/react).
 * Utilisé pour les formulaires de création/modification en popover animé.
 * Source : serafimcloud/morphing-popover adapté au design system LBS.
 */
import {
  useState,
  useId,
  useRef,
  useEffect,
  createContext,
  useContext,
  isValidElement,
} from 'react'
import { AnimatePresence, MotionConfig, motion, Transition, Variants } from 'motion/react'
import { useClickOutside } from '@/hooks/use-click-outside'
import { cn } from '@/lib/utils'

const TRANSITION: Transition = {
  type: 'spring',
  bounce: 0.1,
  duration: 0.4,
}

type MorphingPopoverContextValue = Readonly<{
  isOpen: boolean
  open: () => void
  close: () => void
  uniqueId: string
  variants?: Variants
}>

const MorphingPopoverContext = createContext<MorphingPopoverContextValue | null>(null)

function usePopoverLogic({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: Readonly<{
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}> = {}): Readonly<{
  isOpen: boolean
  open: () => void
  close: () => void
  uniqueId: string
}> {
  const uniqueId: string = useId()
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(defaultOpen)
  const isOpen: boolean = controlledOpen ?? uncontrolledOpen
  const open = (): void => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(true)
    }
    onOpenChange?.(true)
  }
  const close = (): void => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(false)
    }
    onOpenChange?.(false)
  }
  return { isOpen, open, close, uniqueId }
}

type MorphingPopoverProps = Readonly<{
  children: React.ReactNode
  transition?: Transition
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variants?: Variants
  className?: string
}> &
  React.ComponentProps<'div'>

function MorphingPopover({
  children,
  transition = TRANSITION,
  defaultOpen,
  open,
  onOpenChange,
  variants,
  className,
  ...props
}: MorphingPopoverProps): React.JSX.Element {
  const popoverLogic = usePopoverLogic({ defaultOpen, open, onOpenChange })
  return (
    <MorphingPopoverContext.Provider value={{ ...popoverLogic, variants }}>
      <MotionConfig transition={transition}>
        <div
          className={cn('relative flex items-center justify-center', className)}
          key={popoverLogic.uniqueId}
          {...props}
        >
          {children}
        </div>
      </MotionConfig>
    </MorphingPopoverContext.Provider>
  )
}

type MorphingPopoverTriggerProps = Readonly<{
  asChild?: boolean
  children: React.ReactNode
  className?: string
}> &
  React.ComponentProps<typeof motion.button>

function MorphingPopoverTrigger({
  children,
  className,
  asChild = false,
  ...props
}: MorphingPopoverTriggerProps): React.JSX.Element {
  const context = useContext(MorphingPopoverContext)
  if (!context) {
    throw new Error('MorphingPopoverTrigger must be used within MorphingPopover')
  }
  if (asChild && isValidElement(children)) {
    const MotionComponent = motion.create(
      children.type as React.ForwardRefExoticComponent<Record<string, unknown>>
    )
    const childProps = children.props as Record<string, unknown>
    return (
      <MotionComponent
        {...childProps}
        onClick={context.open}
        layoutId={`popover-trigger-${context.uniqueId}`}
        className={childProps.className as string | undefined}
        key={context.uniqueId}
        aria-expanded={context.isOpen}
        aria-controls={`popover-content-${context.uniqueId}`}
      />
    )
  }
  return (
    <motion.div
      key={context.uniqueId}
      layoutId={`popover-trigger-${context.uniqueId}`}
      onClick={context.open}
    >
      <motion.button
        {...props}
        layoutId={`popover-label-${context.uniqueId}`}
        key={context.uniqueId}
        className={className}
        aria-expanded={context.isOpen}
        aria-controls={`popover-content-${context.uniqueId}`}
      >
        {children}
      </motion.button>
    </motion.div>
  )
}

type MorphingPopoverContentProps = Readonly<{
  children: React.ReactNode
  className?: string
}> &
  React.ComponentProps<typeof motion.div>

function MorphingPopoverContent({
  children,
  className,
  ...props
}: MorphingPopoverContentProps): React.JSX.Element | null {
  const context = useContext(MorphingPopoverContext)
  if (!context) {
    throw new Error('MorphingPopoverContent must be used within MorphingPopover')
  }
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, context.close)
  useEffect(() => {
    if (!context.isOpen) {
      return
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        context.close()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [context.isOpen, context.close, context])
  return (
    <AnimatePresence>
      {context.isOpen ? (
        <motion.div
          {...props}
          ref={ref}
          layoutId={`popover-trigger-${context.uniqueId}`}
          key={context.uniqueId}
          id={`popover-content-${context.uniqueId}`}
          role="dialog"
          aria-modal="true"
          className={cn(
            'absolute z-50 overflow-hidden rounded-2xl border border-zinc-200/70 bg-white p-4 text-zinc-900 shadow-xl dark:border-white/10 dark:bg-[#1a2332] dark:text-zinc-50',
            className
          )}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={context.variants}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export { MorphingPopover, MorphingPopoverTrigger, MorphingPopoverContent }
export type { MorphingPopoverProps, MorphingPopoverTriggerProps, MorphingPopoverContentProps }

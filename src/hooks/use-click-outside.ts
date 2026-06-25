/**
 * Hook personnalisé pour détecter les clics en dehors d'un élément.
 * Utilisé par le MorphingPopover pour fermer le contenu au clic extérieur.
 */
import { RefObject, useEffect } from 'react'

type Handler = (event: MouseEvent | TouchEvent) => void

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  handler: Handler,
  mouseEvent: 'mousedown' | 'mouseup' = 'mousedown'
): void {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent): void => {
      const el = ref?.current
      const target = event.target
      if (!el || !(target instanceof Node) || el.contains(target)) {
        return
      }
      handler(event)
    }
    document.addEventListener(mouseEvent, listener)
    document.addEventListener('touchstart', listener)
    return () => {
      document.removeEventListener(mouseEvent, listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler, mouseEvent])
}

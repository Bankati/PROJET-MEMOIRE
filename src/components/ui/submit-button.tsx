'use client'

import { useFormStatus } from 'react-dom'

import { Button, type ButtonProps } from '@/components/ui/button'

const Spinner = (): React.JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    className="size-4 shrink-0 animate-spin"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

/**
 * Bouton de soumission avec indicateur de chargement automatique.
 * Utilise useFormStatus pour détecter l'état pending du formulaire parent.
 *
 * Usage :
 *   <form action={monServerAction}>
 *     <SubmitButton>Enregistrer</SubmitButton>
 *   </form>
 */
export const SubmitButton = ({
  children,
  disabled,
  className,
  ...props
}: ButtonProps): React.JSX.Element => {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={pending ? `cursor-wait ${className ?? ''}`.trim() : className}
      {...props}
    >
      {pending ? (
        <>
          <Spinner />
          <span className="opacity-70">{children}</span>
        </>
      ) : (
        children
      )}
    </Button>
  )
}

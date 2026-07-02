/**
 * Page de réinitialisation du mot de passe avec interface OTP premium.
 * Deux étapes : vérification OTP (design glassmorphism bleu) puis nouveau mot de passe.
 */
import type { Metadata } from 'next'
import { Suspense } from 'react'

import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Réinitialiser le mot de passe',
  description: "Validez l'OTP et choisissez un nouveau mot de passe.",
}

export default function ResetPasswordPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f4f7fe] dark:bg-[#0b1120]">
          <p className="text-sm text-gray-400">Chargement...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}

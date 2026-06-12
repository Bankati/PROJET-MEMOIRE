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
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-zinc-950">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <p className="text-sm text-zinc-400">Chargement...</p>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}

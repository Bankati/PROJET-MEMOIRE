import type { Metadata } from 'next'
import Link from 'next/link'

import { AuthShell } from '@/components/auth/auth-shell'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Accédez à la plateforme LBS Call Center.',
}

// NextAuth v5 beta redirige vers /login?error=CredentialsSignin sur échec d'auth,
// même quand redirect:false est demandé depuis le client. On affiche l'erreur ici
// pour couvrir les deux cas (état React du LoginForm + param URL).
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: 'Identifiants invalides.',
  Default: 'Une erreur est survenue. Veuillez réessayer.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>
}) {
  const params = (await searchParams) ?? {}
  const authError = params.error
  const errorMessage = authError
    ? (AUTH_ERROR_MESSAGES[authError] ?? AUTH_ERROR_MESSAGES.Default)
    : null

  return (
    <AuthShell
      title="Connexion"
      description="Identifiez-vous pour accéder à LBS Call Center."
      footerLabel="Mot de passe oublié ?"
      footerHref="/forgot-password"
      footerText="Cliquez ici."
    >
      {errorMessage && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-red-300/40 bg-red-50/70 px-3 py-2 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/25 dark:text-red-300"
        >
          {errorMessage}
        </p>
      )}
      <LoginForm />
      <div className="mt-4 flex items-center justify-center">
        <Link
          href="/setup-super-admin"
          className="hover:text-lbs-blue text-xs font-medium text-zinc-500 dark:text-zinc-400 dark:hover:text-blue-300"
        >
          Première utilisation: initialiser le super-admin
        </Link>
      </div>
    </AuthShell>
  )
}

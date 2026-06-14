'use client'
/**
 * Formulaire de connexion avec Auth.js.
 */
import { signIn } from 'next-auth/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

export const LoginForm = (): React.JSX.Element => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Identifiants invalides.')
        return
      }

      // Hard redirect pour forcer le rechargement des cookies de session
      window.location.href = '/dashboard'
    } catch {
      setError("Le serveur est indisponible. Vérifiez le lancement de l'application.")
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <form className="space-y-4" onSubmit={handleSubmit} suppressHydrationWarning>
      <div className="space-y-2 text-left">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="vous@etablissement.fr"
          value={email}
          onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
            setEmail(event.target.value)
          }
          className="ring-lbs-blue/0 focus:border-lbs-blue/50 focus:ring-lbs-blue/20 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 transition outline-none placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
          required
          suppressHydrationWarning
        />
      </div>
      <div className="space-y-2 text-left">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
            setPassword(event.target.value)
          }
          className="focus:border-lbs-blue/50 focus:ring-lbs-blue/20 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 transition outline-none placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          required
          suppressHydrationWarning
        />
      </div>
      {error ? (
        <p className="rounded-lg border border-red-300/40 bg-red-50/70 px-3 py-2 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/25 dark:text-red-300">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        className="mt-2 w-full"
        disabled={isSubmitting}
        suppressHydrationWarning
      >
        {isSubmitting ? 'Connexion...' : 'Se connecter'}
      </Button>
    </form>
  )
}

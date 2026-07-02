'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'

export const LoginForm = (): React.JSX.Element => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) {
        setError('Identifiants invalides. Vérifiez votre e-mail et mot de passe.')
        return
      }
      window.location.href = '/dashboard'
    } catch {
      setError("Le serveur est indisponible. Vérifiez le lancement de l'application.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} suppressHydrationWarning>
      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400"
        >
          E-mail
        </label>
        <div className="relative">
          <Mail className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="vous@etablissement.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-[#244976] focus:bg-white focus:ring-2 focus:ring-[#244976]/15 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:bg-white/[0.08] dark:focus:ring-blue-400/15"
            required
            suppressHydrationWarning
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400"
        >
          Mot de passe
        </label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-10 pl-10 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-[#244976] focus:bg-white focus:ring-2 focus:ring-[#244976]/15 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:focus:border-blue-400 dark:focus:bg-white/[0.08] dark:focus:ring-blue-400/15"
            required
            suppressHydrationWarning
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            tabIndex={-1}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {/* Error */}
      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {/* Submit */}
      <Button
        type="submit"
        className="mt-1 h-11 w-full text-sm"
        disabled={isSubmitting}
        suppressHydrationWarning
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Connexion...
          </>
        ) : (
          'Se connecter'
        )}
      </Button>
    </form>
  )
}

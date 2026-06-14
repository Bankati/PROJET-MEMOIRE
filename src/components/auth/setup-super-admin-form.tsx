'use client'
/**
 * Formulaire d'initialisation du premier super-admin.
 */
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

type SetupResponse = Readonly<{
  ok: boolean
  message?: string
}>

export const SetupSuperAdminForm = (): React.JSX.Element => {
  const router = useRouter()
  const [fullName, setFullName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [feedback, setFeedback] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setFeedback('')
    setIsSubmitting(true)
    const response: Response = await fetch('/api/auth/setup-super-admin', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ fullName, email, password }),
    })
    const payload: SetupResponse = await response.json()
    if (!payload.ok) {
      setFeedback(payload.message ?? 'Initialisation impossible.')
      setIsSubmitting(false)
      return
    }
    router.push('/login')
    router.refresh()
  }
  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2 text-left">
        <label htmlFor="fullName" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          Nom complet
        </label>
        <input
          id="fullName"
          value={fullName}
          onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
            setFullName(event.target.value)
          }
          className="focus:border-lbs-blue/50 focus:ring-lbs-blue/20 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 transition outline-none focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          required
        />
      </div>
      <div className="space-y-2 text-left">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
            setEmail(event.target.value)
          }
          className="focus:border-lbs-blue/50 focus:ring-lbs-blue/20 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 transition outline-none focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          required
        />
      </div>
      <div className="space-y-2 text-left">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
            setPassword(event.target.value)
          }
          className="focus:border-lbs-blue/50 focus:ring-lbs-blue/20 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 transition outline-none focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
          required
        />
      </div>
      {feedback ? (
        <p className="rounded-lg border border-red-300/40 bg-red-50/70 px-3 py-2 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/25 dark:text-red-300">
          {feedback}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Initialisation...' : 'Créer le super-admin'}
      </Button>
    </form>
  )
}

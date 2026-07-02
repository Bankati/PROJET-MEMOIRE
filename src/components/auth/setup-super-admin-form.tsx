'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, Lock, Mail, User } from 'lucide-react'

import { Button } from '@/components/ui/button'

type SetupResponse = Readonly<{
  ok: boolean
  message?: string
}>

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#244976] focus:bg-white focus:ring-2 focus:ring-[#244976]/15 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:bg-white/[0.08]'

const labelClass = 'text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400'

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
      <div className="space-y-1.5">
        <label htmlFor="fullName" className={labelClass}>
          Nom complet
        </label>
        <div className="relative">
          <User className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            id="fullName"
            type="text"
            placeholder="Prénom Nom"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="email" className={labelClass}>
          E-mail
        </label>
        <div className="relative">
          <Mail className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            id="email"
            type="email"
            placeholder="super-admin@lbs.tg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className={labelClass}>
          Mot de passe
        </label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            id="password"
            type="password"
            placeholder="Minimum 6 caractères"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            required
            minLength={6}
          />
        </div>
      </div>

      {feedback ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-300">
          {feedback}
        </p>
      ) : null}

      <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Initialisation...
          </>
        ) : (
          'Créer le super-admin'
        )}
      </Button>
    </form>
  )
}

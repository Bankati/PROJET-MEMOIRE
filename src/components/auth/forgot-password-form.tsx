'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Loader2, Mail, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'

type ForgotResponse = Readonly<{
  ok: boolean
  message: string
  otpCode?: string
}>

export const ForgotPasswordForm = (): React.JSX.Element => {
  const router = useRouter()
  const [email, setEmail] = useState<string>('')
  const [feedback, setFeedback] = useState<string>('')
  const [otpCode, setOtpCode] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setIsSubmitting(true)
    setFeedback('')
    setOtpCode('')
    let payload: ForgotResponse
    try {
      const response: Response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      payload = await response.json()
    } catch {
      setFeedback('Une erreur réseau est survenue. Veuillez réessayer.')
      setIsSubmitting(false)
      return
    }
    setFeedback(payload.message)
    setOtpCode(payload.otpCode ?? '')
    setIsSubmitting(false)
    if (payload.ok) {
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`)
      }, 2000)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400"
        >
          E-mail du compte
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
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:border-[#244976] focus:bg-white focus:ring-2 focus:ring-[#244976]/15 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:bg-white/[0.08]"
            required
          />
        </div>
      </div>

      {feedback ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
          {feedback}
        </p>
      ) : null}

      {otpCode ? (
        <div className="rounded-xl border border-[#244976]/25 bg-[#244976]/8 px-4 py-3 text-sm text-[#244976] dark:border-blue-400/25 dark:bg-blue-400/10 dark:text-blue-300">
          <p>
            OTP de démonstration : <span className="font-bold">{otpCode}</span>
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Redirection en cours...</p>
        </div>
      ) : null}

      <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Envoi...
          </>
        ) : (
          <>
            <Send className="size-4" /> Générer un OTP (3 min)
          </>
        )}
      </Button>
    </form>
  )
}

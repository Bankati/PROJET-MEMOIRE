'use client'
/**
 * Formulaire de réinitialisation en deux étapes :
 * Étape 1 — Saisie de l'OTP avec design cohérent avec la page de connexion.
 * Étape 2 — Définition du nouveau mot de passe.
 * Utilise l'API /api/auth/reset-password pour valider l'OTP et changer le mot de passe.
 */
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback, useEffect, useRef } from 'react'
import { CheckCircle2, KeyRound, Loader2, Lock, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type ResetResponse = Readonly<{
  ok: boolean
  message?: string
}>
type ForgotResponse = Readonly<{
  ok: boolean
  message: string
  otpCode?: string
}>
type ResetStep = 'otp' | 'password' | 'success'

const OTP_LENGTH: number = 6
const OTP_EXPIRY_SECONDS: number = 600

export const ResetPasswordForm = (): React.JSX.Element => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromQuery: string = searchParams.get('email') ?? ''
  const [step, setStep] = useState<ResetStep>('otp')
  const [email] = useState<string>(emailFromQuery)
  const [otpValues, setOtpValues] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ''))
  const [newPassword, setNewPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [feedback, setFeedback] = useState<string>('')
  const [feedbackType, setFeedbackType] = useState<'error' | 'success'>('error')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [countdown, setCountdown] = useState<number>(OTP_EXPIRY_SECONDS)
  const [canResend, setCanResend] = useState<boolean>(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (step !== 'otp') return
    setCountdown(OTP_EXPIRY_SECONDS)
    setCanResend(false)
    const timer: ReturnType<typeof setInterval> = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [step])

  const formatCountdown = useCallback((): string => {
    const minutes: number = Math.floor(countdown / 60)
    const seconds: number = countdown % 60
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }, [countdown])

  const handleOtpChange = useCallback(
    (index: number, value: string): void => {
      if (value.length > 1) {
        const chars: string[] = value.replace(/\D/g, '').split('').slice(0, OTP_LENGTH)
        const newOtp: string[] = [...otpValues]
        chars.forEach((char, i) => {
          if (index + i < OTP_LENGTH) {
            newOtp[index + i] = char
          }
        })
        setOtpValues(newOtp)
        const nextIndex: number = Math.min(index + chars.length, OTP_LENGTH - 1)
        inputRefs.current[nextIndex]?.focus()
        return
      }
      const newOtp: string[] = [...otpValues]
      newOtp[index] = value.replace(/\D/g, '')
      setOtpValues(newOtp)
      setFeedback('')
      if (value.length > 0 && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    },
    [otpValues]
  )

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
      if (e.key === 'Backspace' && otpValues[index] === '' && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
      if (e.key === 'ArrowLeft' && index > 0) {
        e.preventDefault()
        inputRefs.current[index - 1]?.focus()
      }
      if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
        e.preventDefault()
        inputRefs.current[index + 1]?.focus()
      }
    },
    [otpValues]
  )

  const handleOtpPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault()
    const pastedData: string = e.clipboardData.getData('text').trim().replace(/\D/g, '')
    const chars: string[] = pastedData.split('').slice(0, OTP_LENGTH)
    const newOtp: string[] = Array.from({ length: OTP_LENGTH }, () => '')
    chars.forEach((char, i) => {
      newOtp[i] = char
    })
    setOtpValues(newOtp)
    const nextIndex: number = Math.min(chars.length, OTP_LENGTH - 1)
    inputRefs.current[nextIndex]?.focus()
  }, [])

  const handleVerifyOtp = useCallback(async (): Promise<void> => {
    const otpCode: string = otpValues.join('')
    if (otpCode.length !== OTP_LENGTH) {
      setFeedback('Veuillez saisir le code complet.')
      setFeedbackType('error')
      return
    }
    if (email.trim().length === 0) {
      setFeedback('Veuillez saisir votre adresse e-mail.')
      setFeedbackType('error')
      return
    }
    setStep('password')
    setFeedback('')
  }, [otpValues, email])

  const handleResetPassword = useCallback(async (): Promise<void> => {
    if (newPassword.length < 6) {
      setFeedback('Le mot de passe doit contenir au moins 6 caractères.')
      setFeedbackType('error')
      return
    }
    if (newPassword !== confirmPassword) {
      setFeedback('Les mots de passe ne correspondent pas.')
      setFeedbackType('error')
      return
    }
    setIsSubmitting(true)
    setFeedback('')
    const otpCode: string = otpValues.join('')
    const response: Response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, otpCode, newPassword }),
    })
    const payload: ResetResponse = await response.json()
    if (!payload.ok) {
      setFeedback(payload.message ?? 'Réinitialisation impossible. Vérifiez votre OTP.')
      setFeedbackType('error')
      setIsSubmitting(false)
      return
    }
    setStep('success')
    setIsSubmitting(false)
  }, [otpValues, email, newPassword, confirmPassword])

  const handleResendOtp = useCallback(async (): Promise<void> => {
    if (email.trim().length === 0) {
      setFeedback('Saisissez votre e-mail pour renvoyer le code.')
      setFeedbackType('error')
      return
    }
    setIsSubmitting(true)
    const response: Response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const payload: ForgotResponse = await response.json()
    setFeedback(payload.otpCode ? `Nouveau code : ${payload.otpCode}` : payload.message)
    setFeedbackType('success')
    setCountdown(OTP_EXPIRY_SECONDS)
    setCanResend(false)
    setOtpValues(Array.from({ length: OTP_LENGTH }, () => ''))
    setIsSubmitting(false)
  }, [email])

  const renderShell = (
    title: string,
    description: string,
    children: React.ReactNode
  ): React.JSX.Element => (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7fe] px-5 py-12 dark:bg-[#0b1120]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-3">
          <Image
            src="/LBS%20LOGO.jpeg"
            alt="Lomé Business School"
            width={40}
            height={40}
            className="rounded-xl border border-gray-200 object-cover dark:border-white/10"
            priority
          />
          <span className="text-base font-bold text-gray-900 dark:text-white">LBS Call Center</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-white/[0.08] dark:bg-[#1e2535]">
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">{title}</h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
          <div className="mt-6">{children}</div>
          <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
            <Link
              href="/login"
              className="font-semibold text-[#244976] hover:underline dark:text-blue-300"
            >
              Retour à la connexion
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-600">
          © {new Date().getFullYear()} LBS Call Center
        </p>
      </div>
    </div>
  )

  if (step === 'success') {
    return renderShell(
      'Mot de passe mis à jour',
      'Votre mot de passe a été réinitialisé avec succès.',
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="grid size-16 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-500/15">
            <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
        </p>
        <button
          type="button"
          onClick={() => {
            router.push('/login')
            router.refresh()
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-6 py-3 text-sm font-medium text-white shadow-lg transition hover:brightness-110"
        >
          Se connecter
        </button>
      </div>
    )
  }

  if (step === 'password') {
    return renderShell(
      'Nouveau mot de passe',
      'Définissez votre nouveau mot de passe sécurisé.',
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="newPassword"
            className="text-sm font-medium text-gray-600 dark:text-gray-300"
          >
            Nouveau mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value)
                setFeedback('')
              }}
              placeholder="Minimum 6 caractères"
              className="focus:border-lbs-blue focus:ring-lbs-blue/20 w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-sm text-gray-900 transition outline-none focus:bg-white focus:ring-2 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:focus:bg-white/[0.08]"
              required
              minLength={6}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-600 dark:text-gray-300"
          >
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                setFeedback('')
              }}
              placeholder="Répétez le mot de passe"
              className="focus:border-lbs-blue focus:ring-lbs-blue/20 w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-sm text-gray-900 transition outline-none focus:bg-white focus:ring-2 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:focus:bg-white/[0.08]"
              required
              minLength={6}
            />
          </div>
        </div>
        {feedback.length > 0 ? (
          <p
            className={`rounded-xl border px-4 py-2.5 text-sm ${
              feedbackType === 'error'
                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/30 dark:bg-red-500/10 dark:text-red-300'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-500/10 dark:text-emerald-300'
            }`}
          >
            {feedback}
          </p>
        ) : null}
        <button
          type="button"
          onClick={handleResetPassword}
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-6 py-3 text-sm font-medium text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ShieldCheck className="size-4" />
          )}
          {isSubmitting ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
        </button>
        <button
          type="button"
          onClick={() => {
            setStep('otp')
            setFeedback('')
          }}
          className="w-full text-center text-sm text-gray-500 transition hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
        >
          ← Modifier le code OTP
        </button>
      </div>
    )
  }

  return renderShell(
    'Vérification OTP',
    emailFromQuery.length > 0
      ? `Entrez le code envoyé à ${emailFromQuery}`
      : 'Entrez le code envoyé à votre adresse e-mail.',
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Code de vérification
        </label>
        <div className="flex justify-center gap-2">
          {Array.from({ length: OTP_LENGTH }).map((_, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={otpValues[index]}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              onPaste={handleOtpPaste}
              disabled={isSubmitting}
              autoFocus={index === 0}
              className="focus:border-lbs-blue focus:ring-lbs-blue/20 size-12 rounded-xl border border-gray-200 bg-gray-50 text-center text-lg font-semibold text-gray-900 transition outline-none focus:bg-white focus:ring-2 disabled:opacity-50 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-white dark:focus:bg-white/[0.08]"
            />
          ))}
        </div>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          {countdown > 0 ? (
            <>
              Code valide pendant{' '}
              <span className="text-lbs-blue font-medium dark:text-blue-300">
                {formatCountdown()}
              </span>
            </>
          ) : (
            <span className="text-amber-600 dark:text-amber-400">Le code a expiré.</span>
          )}
        </p>
      </div>
      {feedback.length > 0 ? (
        <p
          className={`rounded-xl border px-4 py-2.5 text-sm ${
            feedbackType === 'error'
              ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-800/30 dark:bg-red-500/10 dark:text-red-300'
              : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-500/10 dark:text-emerald-300'
          }`}
        >
          {feedback}
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleVerifyOtp}
        disabled={isSubmitting || otpValues.join('').length !== OTP_LENGTH}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-6 py-3 text-sm font-medium text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <KeyRound className="size-4" />
        )}
        {isSubmitting ? 'Vérification...' : 'Vérifier le code'}
      </button>
      <div className="text-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">Pas reçu le code ? </span>
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={!canResend || isSubmitting}
          className="text-lbs-blue text-sm font-medium transition hover:underline disabled:text-gray-400 disabled:no-underline dark:text-blue-300 dark:disabled:text-gray-500"
        >
          Renvoyer
        </button>
      </div>
    </div>
  )
}

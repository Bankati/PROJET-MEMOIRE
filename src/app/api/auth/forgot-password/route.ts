import { NextResponse } from 'next/server'

import { createPasswordResetOtp } from '@/lib/auth/auth-service'
import { sendPasswordResetOtp } from '@/lib/email'

type ForgotPayload = Readonly<{ email: string }>

export const POST = async (request: Request): Promise<Response> => {
  const payloadRaw: unknown = await request.json().catch(() => null)
  if (
    typeof payloadRaw !== 'object' ||
    payloadRaw === null ||
    !('email' in payloadRaw) ||
    typeof payloadRaw.email !== 'string'
  ) {
    return NextResponse.json({ ok: false, message: 'Adresse e-mail invalide.' }, { status: 400 })
  }
  const payload: ForgotPayload = { email: payloadRaw.email }
  const otpCode: string | null = await createPasswordResetOtp({ email: payload.email })

  // Si l'utilisateur n'existe pas, on répond de façon identique pour éviter l'énumération de comptes
  if (otpCode === null) {
    return NextResponse.json({
      ok: true,
      message: 'Si ce compte existe, un email a été envoyé.',
    })
  }

  try {
    await sendPasswordResetOtp({ to: payload.email, otpCode })
  } catch (err) {
    console.error('[forgot-password] Erreur envoi email:', err)
    return NextResponse.json(
      { ok: false, message: "Erreur lors de l'envoi de l'email. Réessayez." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    message: 'Un code de vérification a été envoyé à votre adresse email.',
  })
}

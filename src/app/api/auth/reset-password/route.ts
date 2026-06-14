/**
 * Endpoint de confirmation OTP et changement mot de passe.
 */
import { NextResponse } from 'next/server'

import { resetUserPasswordWithOtp } from '@/lib/auth/auth-service'

type ResetPayload = Readonly<{
  email: string
  otpCode: string
  newPassword: string
}>

export const POST = async (request: Request): Promise<Response> => {
  const payloadRaw: unknown = await request.json().catch(() => null)
  if (
    typeof payloadRaw !== 'object' ||
    payloadRaw === null ||
    !('email' in payloadRaw) ||
    !('otpCode' in payloadRaw) ||
    !('newPassword' in payloadRaw) ||
    typeof payloadRaw.email !== 'string' ||
    typeof payloadRaw.otpCode !== 'string' ||
    typeof payloadRaw.newPassword !== 'string'
  ) {
    return NextResponse.json({ ok: false, message: 'Payload invalide.' }, { status: 400 })
  }
  const payload: ResetPayload = {
    email: payloadRaw.email,
    otpCode: payloadRaw.otpCode,
    newPassword: payloadRaw.newPassword,
  }
  const isUpdated: boolean = await resetUserPasswordWithOtp({
    email: payload.email,
    code: payload.otpCode,
    newPassword: payload.newPassword,
  })
  if (!isUpdated) {
    return NextResponse.json({ ok: false, message: 'OTP invalide ou expiré.' }, { status: 400 })
  }
  return NextResponse.json({ ok: true })
}

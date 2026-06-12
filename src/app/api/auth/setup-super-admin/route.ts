/**
 * Endpoint d'initialisation du premier super-admin.
 */
import { NextResponse } from 'next/server'

import { createInitialSuperAdmin } from '@/lib/auth/auth-service'

type SetupPayload = Readonly<{
  email: string
  fullName: string
  password: string
}>

export const POST = async (request: Request): Promise<Response> => {
  const payloadRaw: unknown = await request.json().catch(() => null)
  if (
    typeof payloadRaw !== 'object' ||
    payloadRaw === null ||
    !('email' in payloadRaw) ||
    !('fullName' in payloadRaw) ||
    !('password' in payloadRaw) ||
    typeof payloadRaw.email !== 'string' ||
    typeof payloadRaw.fullName !== 'string' ||
    typeof payloadRaw.password !== 'string'
  ) {
    return NextResponse.json({ ok: false, message: 'Payload invalide.' }, { status: 400 })
  }
  const payload: SetupPayload = {
    email: payloadRaw.email,
    fullName: payloadRaw.fullName,
    password: payloadRaw.password,
  }
  const isCreated: boolean = await createInitialSuperAdmin(payload)
  if (!isCreated) {
    return NextResponse.json(
      { ok: false, message: 'Initialisation déjà effectuée.' },
      { status: 409 }
    )
  }
  return NextResponse.json({ ok: true })
}

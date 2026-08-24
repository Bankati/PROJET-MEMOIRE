import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

export const runtime = 'nodejs'

// Appelé par le middleware (Edge, sans accès base de données) pour confirmer
// qu'une session JWT structurellement valide correspond encore à un utilisateur
// actif en base — le callback jwt de `auth.ts` fait la vérification réelle.
export const GET = async (): Promise<Response> => {
  const session = await auth()
  return NextResponse.json({ valid: !!session?.user })
}

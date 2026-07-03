import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { listDocuments, deleteDocument } from '@/lib/ai/vector-store'

export const GET = async (): Promise<Response> => {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 })
  }

  try {
    const documents = await listDocuments()
    return NextResponse.json({ ok: true, documents })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Impossible de récupérer les documents.' },
      { status: 500 }
    )
  }
}

export const DELETE = async (request: Request): Promise<Response> => {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 })
  }

  let documentName: string
  try {
    const body = (await request.json()) as { document_name?: string }
    documentName = (body.document_name ?? '').trim()
  } catch {
    return NextResponse.json({ ok: false, error: 'Requête JSON invalide.' }, { status: 400 })
  }

  if (documentName.length === 0) {
    return NextResponse.json({ ok: false, error: 'Nom du document manquant.' }, { status: 400 })
  }

  try {
    const { ok, error } = await deleteDocument({ documentName })

    if (!ok) {
      return NextResponse.json({ ok: false, error }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: `Document "${documentName}" supprimé.` })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Impossible de supprimer le document.' },
      { status: 500 }
    )
  }
}

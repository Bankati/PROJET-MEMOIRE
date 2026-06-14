import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { listDocuments, deleteDocument } from '@/lib/ai/vector-store'

export const GET = async (): Promise<Response> => {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 })
  }

  const documents = await listDocuments()
  return NextResponse.json({ ok: true, documents })
}

export const DELETE = async (request: Request): Promise<Response> => {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 })
  }

  const body = (await request.json()) as { document_name?: string }
  const documentName = (body.document_name ?? '').trim()

  if (documentName.length === 0) {
    return NextResponse.json({ ok: false, error: 'Nom du document manquant.' }, { status: 400 })
  }

  const { ok, error } = await deleteDocument({ documentName })

  if (!ok) {
    return NextResponse.json({ ok: false, error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, message: `Document "${documentName}" supprimé.` })
}

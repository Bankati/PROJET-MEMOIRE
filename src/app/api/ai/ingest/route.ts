import { createCohere } from '@ai-sdk/cohere'
import { embedMany } from 'ai'
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { env } from '@/lib/env'
import { storeChunks } from '@/lib/ai/vector-store'
import { uploadRagDocument } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 60

const chunkText = ({
  text,
  chunkSize = 600,
  overlap = 80,
}: Readonly<{ text: string; chunkSize?: number; overlap?: number }>): string[] => {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
  const chunks: string[] = []
  let current = ''

  for (const para of paragraphs) {
    if (current.length + para.length + 1 <= chunkSize) {
      current = current.length > 0 ? `${current}\n\n${para}` : para
    } else {
      if (current.length > 0) {
        chunks.push(current)
        const words = current.split(' ')
        const overlapWords = words.slice(-Math.floor(overlap / 5))
        current = overlapWords.join(' ')
      }
      if (para.length > chunkSize) {
        const sentences = para.split(/(?<=[.!?])\s+/)
        for (const sentence of sentences) {
          if (current.length + sentence.length + 1 <= chunkSize) {
            current = current.length > 0 ? `${current} ${sentence}` : sentence
          } else {
            if (current.length > 0) chunks.push(current)
            current = sentence
          }
        }
      } else {
        current = para
      }
    }
  }

  if (current.length > 0) chunks.push(current)
  return chunks.filter((c) => c.trim().length > 20)
}

export const POST = async (request: Request): Promise<Response> => {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'super_admin')) {
    return NextResponse.json({ ok: false, error: 'Non autorisé.' }, { status: 401 })
  }

  if (!env.COHERE_API_KEY) {
    return NextResponse.json({ ok: false, error: 'COHERE_API_KEY manquant.' }, { status: 503 })
  }

  let file: File | null = null
  try {
    const formData = await request.formData()
    const fileEntry = formData.get('file')
    file = fileEntry instanceof File ? fileEntry : null
  } catch {
    return NextResponse.json({ ok: false, error: 'Formulaire invalide.' }, { status: 400 })
  }

  if (!file) {
    return NextResponse.json({ ok: false, error: 'Aucun fichier fourni.' }, { status: 400 })
  }

  const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown']
  if (
    !allowedTypes.includes(file.type) &&
    !file.name.endsWith('.pdf') &&
    !file.name.endsWith('.txt') &&
    !file.name.endsWith('.md')
  ) {
    return NextResponse.json(
      { ok: false, error: 'Format non supporté. Utilisez PDF, TXT ou MD.' },
      { status: 400 }
    )
  }

  const arrayBuffer = await file.arrayBuffer()
  let rawText = ''

  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    try {
      type PdfParseInstance = { getText: () => Promise<{ text: string }> }
      type PdfParseModule = { PDFParse: new (opts: { data: Buffer }) => PdfParseInstance }
      // pdf-parse ships no TypeScript declarations; unknown→type assertion is the only approach
      const { PDFParse } = (await import('pdf-parse')) as unknown as PdfParseModule
      const parser: PdfParseInstance = new PDFParse({ data: Buffer.from(arrayBuffer) })
      const pdfData = await parser.getText()
      rawText = pdfData.text
    } catch (err) {
      console.error('Échec du parsing PDF (pdf-parse) :', err)
      return NextResponse.json(
        {
          ok: false,
          error:
            'Impossible de lire ce PDF (fichier corrompu, protégé par mot de passe, ou scanné sans texte). Essayez de le ré-exporter (par ex. "Imprimer en PDF") puis réessayez.',
        },
        { status: 400 }
      )
    }
  } else {
    rawText = new TextDecoder().decode(arrayBuffer)
  }

  try {
    rawText = rawText
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .trim()

    if (rawText.length < 50) {
      return NextResponse.json(
        { ok: false, error: 'Le document ne contient pas assez de texte.' },
        { status: 400 }
      )
    }

    const textChunks = chunkText({ text: rawText })

    if (textChunks.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Impossible d'extraire du texte du document." },
        { status: 400 }
      )
    }

    const cohere = createCohere({ apiKey: env.COHERE_API_KEY })
    const embeddingModel = cohere.embedding('embed-multilingual-v3.0')

    // embedMany regroupe automatiquement les textes par lots de 96 (limite Cohere par appel)
    // au lieu d'un appel HTTP par segment — indispensable dès qu'un document dépasse une
    // centaine de segments, sous peine de heurter la limite de débit de l'API (429).
    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: textChunks,
      maxParallelCalls: 3,
    })

    const fileName = file.name
    const documentName = fileName.replace(/\.[^/.]+$/, '')

    // Upload original file to Supabase Storage
    const { publicUrl, storagePath } = await uploadRagDocument({
      documentName,
      fileBuffer: Buffer.from(arrayBuffer),
      contentType: file.type || 'application/octet-stream',
    })

    const chunksToStore = textChunks.map((content, index) => ({
      document_name: documentName,
      content,
      metadata: {
        chunk_index: index,
        total_chunks: textChunks.length,
        file_name: fileName,
        storage_path: storagePath ?? undefined,
        storage_url: publicUrl ?? undefined,
      },
      embedding: embeddings[index],
    }))

    const { stored, error } = await storeChunks({ chunks: chunksToStore })

    if (error) {
      return NextResponse.json({ ok: false, error }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      document_name: documentName,
      chunks_stored: stored,
      storage_url: publicUrl,
      storage_path: storagePath,
      message: `${stored} segment${stored > 1 ? 's' : ''} indexé${stored > 1 ? 's' : ''} avec succès.`,
    })
  } catch (err) {
    console.error('Échec du traitement du document (après extraction du texte) :', err)
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? `Échec du traitement : ${err.message}`
            : 'Échec du traitement du document.',
      },
      { status: 500 }
    )
  }
}

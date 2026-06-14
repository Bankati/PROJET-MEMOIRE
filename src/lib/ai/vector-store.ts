import { getSupabaseClient } from '@/lib/supabase'

type DocumentChunk = Readonly<{
  id: string
  document_name: string
  content: string
  metadata: Record<string, unknown>
  similarity: number
}>

type StoredDocument = Readonly<{
  document_name: string
  chunk_count: number
  created_at: string
}>

type ChunkToStore = Readonly<{
  document_name: string
  content: string
  metadata: Record<string, unknown>
  embedding: number[]
}>

export const searchSimilarChunks = async ({
  queryEmbedding,
  matchThreshold = 0.5,
  matchCount = 5,
}: Readonly<{
  queryEmbedding: number[]
  matchThreshold?: number
  matchCount?: number
}>): Promise<DocumentChunk[]> => {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase.rpc('match_document_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
  })

  if (error) {
    console.error('pgvector search error:', error.message)
    return []
  }

  return (data as DocumentChunk[]) ?? []
}

export const storeChunks = async ({
  chunks,
}: Readonly<{
  chunks: ChunkToStore[]
}>): Promise<{ stored: number; error: string | null }> => {
  const supabase = getSupabaseClient()
  if (!supabase) return { stored: 0, error: 'Supabase non configuré.' }

  const { error } = await supabase.from('document_chunks').insert(chunks)

  if (error) {
    console.error('pgvector insert error:', error.message)
    return { stored: 0, error: error.message }
  }

  return { stored: chunks.length, error: null }
}

export const listDocuments = async (): Promise<StoredDocument[]> => {
  const supabase = getSupabaseClient()
  if (!supabase) return []

  const { data, error } = await supabase.rpc('list_rag_documents')

  if (error) {
    console.error('list documents error:', error.message)
    return []
  }

  return (data as StoredDocument[]) ?? []
}

export const deleteDocument = async ({
  documentName,
}: Readonly<{
  documentName: string
}>): Promise<{ ok: boolean; error: string | null }> => {
  const supabase = getSupabaseClient()
  if (!supabase) return { ok: false, error: 'Supabase non configuré.' }

  const { error } = await supabase
    .from('document_chunks')
    .delete()
    .eq('document_name', documentName)

  if (error) {
    console.error('delete document error:', error.message)
    return { ok: false, error: error.message }
  }

  return { ok: true, error: null }
}

export const buildContextFromChunks = ({
  chunks,
}: Readonly<{ chunks: DocumentChunk[] }>): string => {
  if (chunks.length === 0) return ''
  return chunks.map((chunk) => chunk.content).join('\n\n---\n\n')
}

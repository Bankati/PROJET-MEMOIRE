-- ============================================================
-- RAG — pgvector setup pour LBS Call Center
-- À exécuter UNE SEULE FOIS dans l'éditeur SQL de Supabase.
-- ============================================================

-- 1. Activer l'extension pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Table des chunks de documents (base de connaissances)
CREATE TABLE IF NOT EXISTS document_chunks (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_name TEXT        NOT NULL,
  content       TEXT        NOT NULL,
  metadata      JSONB       NOT NULL DEFAULT '{}',
  embedding     VECTOR(1536),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Index IVFFlat pour la recherche cosinus rapide
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
  ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- 4. Fonction de recherche de similarité
CREATE OR REPLACE FUNCTION match_document_chunks(
  query_embedding VECTOR(1536),
  match_threshold FLOAT  DEFAULT 0.5,
  match_count     INT    DEFAULT 5
)
RETURNS TABLE (
  id            UUID,
  document_name TEXT,
  content       TEXT,
  metadata      JSONB,
  similarity    FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_name,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  WHERE dc.embedding IS NOT NULL
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 5. Fonction pour lister les documents distincts
CREATE OR REPLACE FUNCTION list_rag_documents()
RETURNS TABLE (
  document_name TEXT,
  chunk_count   BIGINT,
  created_at    TIMESTAMPTZ
)
LANGUAGE sql
AS $$
  SELECT
    document_name,
    COUNT(*)       AS chunk_count,
    MIN(created_at) AS created_at
  FROM document_chunks
  GROUP BY document_name
  ORDER BY MIN(created_at) DESC;
$$;

/**
 * Supabase client for storage operations (profile images, etc.).
 * Uses the service role key for server-side operations.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

import { env } from "@/lib/env";

let supabaseClient: SupabaseClient | null = null;

/**
 * Get the Supabase client instance.
 * Returns null if Supabase is not configured.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  if (supabaseClient === null) {
    supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseClient;
};

/**
 * Storage bucket name for profile avatars.
 */
export const AVATAR_BUCKET = "profils_images";

/**
 * Storage bucket name for RAG source documents (PDF, TXT, MD).
 */
export const RAG_DOCUMENTS_BUCKET = "rag_documents";

/**
 * Upload a profile avatar to Supabase Storage.
 * Returns the public URL of the uploaded image, or null on failure.
 */
const ensureBucket = async (supabase: SupabaseClient, bucketName: string): Promise<void> => {
  const { error } = await supabase.storage.createBucket(bucketName, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
  });
  // Ignore "already exists" error
  if (error && !error.message.toLowerCase().includes("already exists")) {
    console.error(`Failed to create bucket "${bucketName}":`, error.message);
  }
};

export const uploadAvatar = async ({
  userId,
  file,
  contentType,
}: Readonly<{
  userId: string;
  file: Buffer;
  contentType: string;
}>): Promise<string | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn("Supabase not configured, avatar upload skipped.");
    return null;
  }
  const extension = contentType.split("/")[1] ?? "jpg";
  const filePath = `${userId}/avatar.${extension}`;

  let { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, { contentType, upsert: true });

  if (error?.message?.toLowerCase().includes("bucket not found") ||
      error?.message?.toLowerCase().includes("not found")) {
    await ensureBucket(supabase, AVATAR_BUCKET);
    const retry = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, file, { contentType, upsert: true });
    error = retry.error;
  }

  if (error) {
    console.error("Avatar upload error:", error.message);
    return null;
  }
  const { data: publicUrlData } = supabase.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(filePath);
  return publicUrlData.publicUrl;
};

/**
 * Delete a user's avatar from Supabase Storage.
 */
export const deleteAvatar = async ({
  userId,
}: Readonly<{
  userId: string;
}>): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return false;
  }
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.webp`]);
  if (error) {
    console.error("Avatar delete error:", error.message);
    return false;
  }
  return true;
};

/**
 * Upload a RAG source document to Supabase Storage.
 * Returns the public URL of the uploaded file, or null on failure.
 */
export const uploadRagDocument = async ({
  documentName,
  fileBuffer,
  contentType,
}: Readonly<{
  documentName: string;
  fileBuffer: Buffer;
  contentType: string;
}>): Promise<{ publicUrl: string | null; storagePath: string | null }> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    console.warn("Supabase not configured, RAG document upload skipped.");
    return { publicUrl: null, storagePath: null };
  }
  const extension = contentType.split("/")[1] ?? "pdf";
  const safeName = documentName.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filePath = `${safeName}_${Date.now()}.${extension}`;
  const { error } = await supabase.storage
    .from(RAG_DOCUMENTS_BUCKET)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: false,
    });
  if (error) {
    console.error("RAG document upload error:", error.message);
    return { publicUrl: null, storagePath: null };
  }
  const { data: publicUrlData } = supabase.storage
    .from(RAG_DOCUMENTS_BUCKET)
    .getPublicUrl(filePath);
  return { publicUrl: publicUrlData.publicUrl, storagePath: filePath };
};

/**
 * Delete a RAG source document from Supabase Storage.
 */
export const deleteRagDocument = async ({
  storagePath,
}: Readonly<{
  storagePath: string;
}>): Promise<boolean> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return false;
  }
  const { error } = await supabase.storage
    .from(RAG_DOCUMENTS_BUCKET)
    .remove([storagePath]);
  if (error) {
    console.error("RAG document delete error:", error.message);
    return false;
  }
  return true;
};

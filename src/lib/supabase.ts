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
 * Upload a profile avatar to Supabase Storage.
 * Returns the public URL of the uploaded image, or null on failure.
 */
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
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(filePath, file, {
      contentType,
      upsert: true,
    });
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

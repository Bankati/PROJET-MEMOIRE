/**
 * POST /api/profile/avatar
 * Reçoit un fichier image, l'upload dans Supabase Storage (bucket profils_images)
 * et enregistre l'URL publique dans la table users.
 */
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { uploadAvatar } from "@/lib/supabase";

const ALLOWED_TYPES: ReadonlySet<string> = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES: number = 2 * 1024 * 1024; // 2 MB

export const POST = async (request: Request): Promise<Response> => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "Non authentifié." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, message: "Requête invalide." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "Aucun fichier fourni." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ ok: false, message: "Format non supporté. Utilisez JPEG, PNG ou WebP." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ ok: false, message: "Fichier trop volumineux (max 2 Mo)." }, { status: 400 });
  }

  const buffer: Buffer = Buffer.from(await file.arrayBuffer());
  const avatarUrl: string | null = await uploadAvatar({
    userId: session.user.id,
    file: buffer,
    contentType: file.type,
  });

  if (!avatarUrl) {
    return NextResponse.json({ ok: false, message: "Erreur lors de l'upload. Vérifiez la configuration Supabase Storage." }, { status: 500 });
  }

  await db.update(users).set({ avatarUrl, updatedAt: new Date() }).where(eq(users.id, session.user.id));

  return NextResponse.json({ ok: true, avatarUrl });
};

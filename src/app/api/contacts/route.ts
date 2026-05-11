/**
 * API Route pour la création manuelle d'un contact.
 * Insère le contact et le lie à la campagne sélectionnée.
 * Gère la déduplication par numéro de téléphone normalisé.
 */
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contacts, campaignContacts, campaigns } from "@/db/schema";

type CreateContactResult = Readonly<{
  ok: boolean;
  message: string;
  contactId?: string;
}>;

const normalizePhone = ({ phone }: Readonly<{ phone: string }>): string => {
  return phone.replace(/\s+/g, "").replace(/^00/, "+");
};

export const POST = async (request: Request): Promise<Response> => {
  const session = await auth();
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
    return NextResponse.json({ ok: false, message: "Non autorisé." }, { status: 401 });
  }

  const formData = await request.formData();

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phonePrimary = String(formData.get("phonePrimary") ?? "").trim();
  const phoneSecondary = String(formData.get("phoneSecondary") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const schoolName = String(formData.get("schoolName") ?? "").trim();
  const desiredProgram = String(formData.get("desiredProgram") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const campaignId = String(formData.get("campaignId") ?? "").trim();

  if (firstName.length === 0 && lastName.length === 0) {
    return NextResponse.json(
      { ok: false, message: "Le prénom ou le nom est obligatoire." },
      { status: 400 }
    );
  }
  if (phonePrimary.length === 0) {
    return NextResponse.json(
      { ok: false, message: "Le numéro de téléphone principal est obligatoire." },
      { status: 400 }
    );
  }
  if (campaignId.length === 0) {
    return NextResponse.json(
      { ok: false, message: "Veuillez sélectionner une campagne." },
      { status: 400 }
    );
  }

  const campaignExists = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(eq(campaigns.id, campaignId))
    .limit(1);
  if (campaignExists.length === 0) {
    return NextResponse.json(
      { ok: false, message: "Campagne introuvable." },
      { status: 400 }
    );
  }

  const normalizedPrimary = normalizePhone({ phone: phonePrimary });
  const normalizedSecondary = phoneSecondary.length > 0 ? normalizePhone({ phone: phoneSecondary }) : "";
  const displayName = firstName.length > 0 ? firstName : lastName;

  try {
    const existing = await db
      .select({ id: contacts.id })
      .from(contacts)
      .where(eq(contacts.normalizedPhonePrimary, normalizedPrimary))
      .limit(1);

    let contactId: string;
    if (existing.length > 0) {
      contactId = existing[0].id;
    } else {
      const [newContact] = await db.insert(contacts).values({
        firstName: firstName.length > 0 ? firstName : displayName,
        lastName: lastName.length > 0 ? lastName : null,
        email: email.length > 0 ? email : null,
        phonePrimary,
        phoneSecondary: phoneSecondary.length > 0 ? phoneSecondary : null,
        normalizedPhonePrimary: normalizedPrimary,
        normalizedPhoneSecondary: normalizedSecondary.length > 0 ? normalizedSecondary : null,
        schoolName: schoolName.length > 0 ? schoolName : null,
        desiredProgram: desiredProgram.length > 0 ? desiredProgram : null,
        city: city.length > 0 ? city : null,
      }).returning({ id: contacts.id });
      contactId = newContact.id;
    }

    await db.insert(campaignContacts).values({
      campaignId,
      contactId,
      source: "manual_form",
      importedByAdminId: session.user.id,
    }).onConflictDoNothing();

    const result: CreateContactResult = {
      ok: true,
      message: "Contact ajouté avec succès.",
      contactId,
    };
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { ok: false, message: "Erreur lors de l'ajout du contact." },
      { status: 500 }
    );
  }
};

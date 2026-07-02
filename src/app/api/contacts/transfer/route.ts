import { NextResponse } from 'next/server'
import { and, eq, inArray, or } from 'drizzle-orm'

import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import { campaignContacts, campaigns } from '@/db/schema'

type TransferBody = Readonly<{
  ccIds: string[]
  targetCampaignId: string
}>

export const POST = async (request: Request): Promise<Response> => {
  const user = await requireRole({ allowedRoles: ['admin'] })

  const isTransferBody = (v: unknown): v is TransferBody =>
    typeof v === 'object' && v !== null && 'ccIds' in v && 'targetCampaignId' in v

  const bodyRaw: unknown = await request.json().catch(() => null)
  if (!isTransferBody(bodyRaw)) {
    return NextResponse.json({ ok: false, message: 'Paramètres invalides.' }, { status: 400 })
  }

  const { ccIds, targetCampaignId } = bodyRaw

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (
    !Array.isArray(ccIds) ||
    ccIds.length === 0 ||
    !ccIds.every((id) => typeof id === 'string' && UUID_RE.test(id)) ||
    typeof targetCampaignId !== 'string' ||
    !UUID_RE.test(targetCampaignId)
  ) {
    return NextResponse.json({ ok: false, message: 'Données invalides.' }, { status: 400 })
  }

  try {
    /* La campagne cible doit être accessible : soit owned, soit publique */
    const [targetCampaign] = await db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(
        and(
          eq(campaigns.id, targetCampaignId),
          or(eq(campaigns.createdByAdminId, user.id), eq(campaigns.visibility, 'public'))
        )
      )
      .limit(1)

    if (!targetCampaign) {
      return NextResponse.json(
        { ok: false, message: 'Campagne cible introuvable ou non autorisée.' },
        { status: 404 }
      )
    }

    /* Les contacts source doivent venir de campagnes accessibles : owned ou publiques */
    const adminCampaignIds = (
      await db
        .select({ id: campaigns.id })
        .from(campaigns)
        .where(or(eq(campaigns.createdByAdminId, user.id), eq(campaigns.visibility, 'public')))
    ).map((c) => c.id)

    const sourceCCs =
      adminCampaignIds.length > 0
        ? await db
            .select({ contactId: campaignContacts.contactId })
            .from(campaignContacts)
            .where(
              and(
                inArray(campaignContacts.id, ccIds),
                inArray(campaignContacts.campaignId, adminCampaignIds)
              )
            )
        : []

    if (sourceCCs.length === 0) {
      return NextResponse.json(
        { ok: false, message: 'Aucun contact trouvé ou non autorisé.' },
        { status: 404 }
      )
    }

    const uniqueContactIds = [...new Set(sourceCCs.map((cc) => cc.contactId))]

    const inserted = await db
      .insert(campaignContacts)
      .values(
        uniqueContactIds.map((contactId) => ({
          campaignId: targetCampaignId,
          contactId,
          source: 'campaign_reuse' as const,
          importedByAdminId: user.id,
        }))
      )
      .onConflictDoNothing()
      .returning({ id: campaignContacts.id })

    const transferred = inserted.length
    const skipped = uniqueContactIds.length - transferred

    return NextResponse.json({
      ok: true,
      transferred,
      skipped,
      message:
        skipped === 0
          ? `${transferred} contact(s) transféré(s) avec succès.`
          : `${transferred} transféré(s), ${skipped} déjà présent(s) dans la campagne cible.`,
    })
  } catch {
    return NextResponse.json({ ok: false, message: 'Erreur lors du transfert.' }, { status: 500 })
  }
}

/**
 * Page de gestion des campagnes pour l'administrateur.
 */
import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Contact, Globe, Lock, Megaphone, Pencil, Trash2, X } from 'lucide-react'
import { and, desc, eq, count } from 'drizzle-orm'

import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import { campaigns, campaignContacts } from '@/db/schema'
import type { CampaignStatus } from '@/db/schema'
import { campaignAccessCondition } from '@/lib/campaign-access'
import { CampaignDialogForm } from '@/components/admin/campaign-dialog-form'
import { CampaignEditPanel } from '@/components/admin/campaign-edit-panel'
import { uploadCampaignScript } from '@/lib/supabase'
import { CAMPAIGN_STATUS_LABELS, CAMPAIGN_STATUS_STYLES } from '@/lib/status-styles'

const PDF_MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10 Mo

const resolvePdfUrl = async ({
  formData,
  campaignId,
  currentPdfUrl,
}: Readonly<{
  formData: FormData
  campaignId: string
  currentPdfUrl: string | null
}>): Promise<string | null> => {
  const file = formData.get('pdfFile')
  if (!(file instanceof File) || file.size === 0) {
    return currentPdfUrl
  }
  if (file.type !== 'application/pdf' || file.size > PDF_MAX_SIZE_BYTES) {
    return currentPdfUrl
  }
  const buffer = Buffer.from(await file.arrayBuffer())
  const uploadedUrl = await uploadCampaignScript({
    campaignId,
    fileBuffer: buffer,
    contentType: file.type,
  })
  return uploadedUrl ?? currentPdfUrl
}

type SearchParams = Readonly<Record<string, string | string[] | undefined>>

const readParam = ({ sp, key }: Readonly<{ sp: SearchParams; key: string }>): string => {
  const raw: string | string[] | undefined = sp[key]
  if (typeof raw === 'string') return raw
  return Array.isArray(raw) ? (raw[0] ?? '') : ''
}

async function createCampaign(formData: FormData): Promise<void> {
  'use server'
  const user = await requireRole({ allowedRoles: ['admin'] })
  const title: string = (formData.get('title') as string | null) ?? ''
  const year: number = Number(formData.get('year') ?? new Date().getFullYear())
  const baseScript: string = (formData.get('baseScript') as string | null) ?? ''
  const details: string = (formData.get('details') as string | null) ?? ''
  const visibilityRaw = (formData.get('visibility') as string | null) ?? 'private'
  const visibility = visibilityRaw === 'public' ? 'public' : 'private'
  if (title.trim().length === 0 || baseScript.trim().length === 0) {
    redirect('/dashboard/admin/campaigns?notice=missing_fields')
  }
  try {
    // L'ID est généré avant l'insertion pour pouvoir uploader le PDF (qui a besoin
    // d'un campaignId pour son chemin de storage) avant d'écrire quoi que ce soit en base —
    // ainsi un échec d'upload n'a jamais créé de campagne partielle sans PDF.
    const campaignId = randomUUID()
    const pdfUrl = await resolvePdfUrl({ formData, campaignId, currentPdfUrl: null })
    await db.insert(campaigns).values({
      id: campaignId,
      title: title.trim(),
      year,
      baseScript: baseScript.trim(),
      details: details.trim().length > 0 ? details.trim() : null,
      pdfUrl,
      status: 'active',
      visibility,
      createdByAdminId: user.id,
    })
  } catch {
    redirect('/dashboard/admin/campaigns?notice=error')
  }
  redirect('/dashboard/admin/campaigns?notice=created')
}

async function updateCampaign(formData: FormData): Promise<void> {
  'use server'
  const user = await requireRole({ allowedRoles: ['admin'] })
  const campaignId = (formData.get('campaignId') as string | null) ?? ''
  const title = (formData.get('title') as string | null) ?? ''
  const year = Number(formData.get('year') ?? new Date().getFullYear())
  const baseScript = (formData.get('baseScript') as string | null) ?? ''
  const details = (formData.get('details') as string | null) ?? ''
  const currentPdfUrlRaw = (formData.get('currentPdfUrl') as string | null) ?? ''
  const status = (formData.get('status') as string | null) ?? 'draft'
  const visibilityRaw = (formData.get('visibility') as string | null) ?? 'private'
  const visibility = visibilityRaw === 'public' ? 'public' : 'private'
  if (campaignId.length === 0 || title.trim().length === 0) {
    redirect('/dashboard/admin/campaigns?notice=missing_fields')
  }
  try {
    const pdfUrl = await resolvePdfUrl({
      formData,
      campaignId,
      currentPdfUrl: currentPdfUrlRaw.trim().length > 0 ? currentPdfUrlRaw.trim() : null,
    })
    await db
      .update(campaigns)
      .set({
        title: title.trim(),
        year,
        baseScript: baseScript.trim(),
        details: details.trim().length > 0 ? details.trim() : null,
        pdfUrl,
        status: status as CampaignStatus,
        visibility,
        updatedAt: new Date(),
      })
      .where(and(eq(campaigns.id, campaignId), eq(campaigns.createdByAdminId, user.id)))
  } catch {
    redirect('/dashboard/admin/campaigns?notice=error')
  }
  redirect('/dashboard/admin/campaigns?notice=updated')
}

async function deleteCampaign(formData: FormData): Promise<void> {
  'use server'
  const user = await requireRole({ allowedRoles: ['admin'] })
  const campaignId = (formData.get('campaignId') as string | null) ?? ''
  if (campaignId.length > 0) {
    try {
      await db
        .delete(campaigns)
        .where(and(eq(campaigns.id, campaignId), eq(campaigns.createdByAdminId, user.id)))
    } catch {
      redirect('/dashboard/admin/campaigns?notice=error')
    }
    redirect('/dashboard/admin/campaigns?notice=deleted')
  }
  redirect('/dashboard/admin/campaigns?notice=error')
}

export default async function AdminCampaignsPage({
  searchParams,
}: Readonly<{ searchParams?: Promise<SearchParams> }>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ['admin'] })
  const sp: SearchParams = (await searchParams) ?? {}
  const notice = readParam({ sp, key: 'notice' })
  const editId = readParam({ sp, key: 'edit' })

  const [myCampaigns, contactCountsResult] = await Promise.all([
    db
      .select({
        id: campaigns.id,
        title: campaigns.title,
        year: campaigns.year,
        status: campaigns.status,
        visibility: campaigns.visibility,
        baseScript: campaigns.baseScript,
        details: campaigns.details,
        pdfUrl: campaigns.pdfUrl,
        createdAt: campaigns.createdAt,
        createdByAdminId: campaigns.createdByAdminId,
      })
      .from(campaigns)
      .where(campaignAccessCondition({ adminId: user.id }))
      .orderBy(desc(campaigns.createdAt)),
    db
      .select({ campaignId: campaignContacts.campaignId, contactCount: count(campaignContacts.id) })
      .from(campaignContacts)
      .groupBy(campaignContacts.campaignId),
  ])
  const contactCountMap = new Map(contactCountsResult.map((r) => [r.campaignId, r.contactCount]))

  const editCampaign = editId.length > 0 ? myCampaigns.find((c) => c.id === editId) : undefined
  const isEditingOwned = editCampaign !== undefined && editCampaign.createdByAdminId === user.id

  const noticeMessages: Readonly<Record<string, { text: string; type: 'success' | 'error' }>> = {
    created: { text: 'Campagne créée avec succès.', type: 'success' },
    updated: { text: 'Campagne mise à jour.', type: 'success' },
    deleted: { text: 'Campagne supprimée.', type: 'success' },
    missing_fields: { text: 'Veuillez remplir tous les champs obligatoires.', type: 'error' },
    error: { text: 'Une erreur est survenue.', type: 'error' },
  }
  const currentNotice = notice.length > 0 ? noticeMessages[notice] : undefined

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-white">
            {isEditingOwned ? `Modifier — ${editCampaign.title}` : 'Campagnes'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {isEditingOwned
              ? 'Modifiez les informations, le script et les paramètres de votre campagne.'
              : "Créez et gérez vos campagnes d'appels"}
          </p>
        </div>
        {!isEditingOwned ? (
          <div className="shrink-0">
            <CampaignDialogForm
              mode="create"
              createAction={createCampaign}
              updateAction={updateCampaign}
            />
          </div>
        ) : null}
      </div>

      {/* Notice */}
      {currentNotice ? (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${
            currentNotice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
          }`}
        >
          {currentNotice.text}
          <a href="/dashboard/admin/campaigns" className="ml-auto">
            <X className="size-4" />
          </a>
        </div>
      ) : null}

      {/* ── Inline edit panel ── */}
      {isEditingOwned ? (
        <CampaignEditPanel
          campaign={{ ...editCampaign, contactCount: contactCountMap.get(editCampaign.id) ?? 0 }}
          updateAction={updateCampaign}
          deleteAction={deleteCampaign}
        />
      ) : (
        <>
          {/* ── Campaign grid ── */}
          {myCampaigns.length === 0 ? (
            <div className="dark:bg-lbs-surface-dark rounded-2xl border border-zinc-200/70 bg-white py-16 text-center dark:border-white/10">
              <Megaphone className="mx-auto mb-3 size-10 text-zinc-200 dark:text-zinc-700" />
              <p className="text-sm font-medium text-zinc-500">Aucune campagne créée.</p>
              <p className="mt-1 text-xs text-zinc-400">
                Commencez par créer votre première campagne.
              </p>
              <div className="mt-4 flex justify-center">
                <CampaignDialogForm
                  mode="create"
                  createAction={createCampaign}
                  updateAction={updateCampaign}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Cartes — écrans étroits */}
              <div className="grid gap-4 sm:hidden">
                {myCampaigns.map((campaign) => {
                  const isOwned = campaign.createdByAdminId === user.id
                  const contacts = contactCountMap.get(campaign.id) ?? 0
                  return (
                    <div
                      key={campaign.id}
                      className="dark:bg-lbs-surface-dark relative flex flex-col rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/10"
                    >
                      <div
                        className={`h-1 w-full rounded-t-2xl ${
                          campaign.status === 'active'
                            ? 'bg-emerald-400'
                            : campaign.status === 'paused'
                              ? 'bg-amber-400'
                              : campaign.status === 'draft'
                                ? 'bg-zinc-300 dark:bg-zinc-600'
                                : campaign.status === 'completed'
                                  ? 'bg-blue-400'
                                  : 'bg-zinc-200 dark:bg-zinc-700'
                        }`}
                      />
                      <div className="flex flex-1 flex-col p-5">
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-semibold text-zinc-800 dark:text-white">
                                {campaign.title}
                              </p>
                              {!isOwned ? (
                                <span className="shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                                  Partagée
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-0.5 text-xs text-zinc-400">{campaign.year}</p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${CAMPAIGN_STATUS_STYLES[campaign.status] ?? CAMPAIGN_STATUS_STYLES.draft}`}
                          >
                            {CAMPAIGN_STATUS_LABELS[campaign.status] ?? campaign.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Contact className="size-3.5" />
                            {contacts} contact{contacts !== 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            {campaign.visibility === 'public' ? (
                              <>
                                <Globe className="size-3.5 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  Publique
                                </span>
                              </>
                            ) : (
                              <>
                                <Lock className="size-3.5" />
                                Privée
                              </>
                            )}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-white/5">
                          <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                            <Calendar className="size-3" />
                            {campaign.createdAt.toLocaleDateString('fr-FR')}
                          </span>
                          <div className="flex items-center gap-1">
                            {isOwned ? (
                              <>
                                <Link
                                  href={`/dashboard/admin/campaigns?edit=${campaign.id}`}
                                  className="hover:border-lbs-blue/40 hover:bg-lbs-blue/5 hover:text-lbs-blue flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition dark:border-white/10 dark:text-zinc-400 dark:hover:text-blue-300"
                                >
                                  <Pencil className="size-3.5" />
                                  Modifier
                                </Link>
                                <form action={deleteCampaign} className="inline">
                                  <input type="hidden" name="campaignId" value={campaign.id} />
                                  <button
                                    type="submit"
                                    className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </form>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Tableau — écrans larges */}
              <div className="dark:bg-lbs-surface-dark hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm sm:block dark:border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 text-xs text-zinc-500 uppercase dark:border-white/10">
                        <th className="px-5 py-3">Campagne</th>
                        <th className="px-5 py-3">Statut</th>
                        <th className="px-5 py-3">Visibilité</th>
                        <th className="px-5 py-3">Contacts</th>
                        <th className="px-5 py-3">Créée le</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myCampaigns.map((campaign) => {
                        const isOwned = campaign.createdByAdminId === user.id
                        const contacts = contactCountMap.get(campaign.id) ?? 0
                        return (
                          <tr
                            key={campaign.id}
                            className="border-b border-zinc-100 transition last:border-b-0 hover:bg-zinc-50/50 dark:border-white/5 dark:hover:bg-white/5"
                          >
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-zinc-800 dark:text-white">
                                  {campaign.title}
                                </p>
                                {!isOwned ? (
                                  <span className="shrink-0 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
                                    Partagée
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-xs text-zinc-400">{campaign.year}</p>
                            </td>
                            <td className="px-5 py-3">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${CAMPAIGN_STATUS_STYLES[campaign.status] ?? CAMPAIGN_STATUS_STYLES.draft}`}
                              >
                                {CAMPAIGN_STATUS_LABELS[campaign.status] ?? campaign.status}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              {campaign.visibility === 'public' ? (
                                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                  <Globe className="size-3.5" />
                                  Publique
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
                                  <Lock className="size-3.5" />
                                  Privée
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3 text-zinc-600 dark:text-zinc-300">
                              {contacts}
                            </td>
                            <td className="px-5 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                              {campaign.createdAt.toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-5 py-3">
                              {isOwned ? (
                                <div className="flex items-center justify-end gap-1">
                                  <Link
                                    href={`/dashboard/admin/campaigns?edit=${campaign.id}`}
                                    className="hover:border-lbs-blue/40 hover:bg-lbs-blue/5 hover:text-lbs-blue flex items-center gap-1.5 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition dark:border-white/10 dark:text-zinc-400 dark:hover:text-blue-300"
                                  >
                                    <Pencil className="size-3.5" />
                                    Modifier
                                  </Link>
                                  <form action={deleteCampaign} className="inline">
                                    <input type="hidden" name="campaignId" value={campaign.id} />
                                    <button
                                      type="submit"
                                      className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                                      title="Supprimer"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </button>
                                  </form>
                                </div>
                              ) : (
                                <div className="text-right text-xs text-zinc-300">—</div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

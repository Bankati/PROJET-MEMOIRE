/**
 * Page de gestion des campagnes pour l'administrateur.
 */
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Contact, Globe, Lock, Megaphone, Pencil, Trash2, X } from 'lucide-react'
import { and, desc, eq, count, or } from 'drizzle-orm'

import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import { campaigns, campaignContacts } from '@/db/schema'
import { CampaignDialogForm } from '@/components/admin/campaign-dialog-form'
import { CampaignEditPanel } from '@/components/admin/campaign-edit-panel'

type SearchParams = Readonly<Record<string, string | string[] | undefined>>

const readParam = ({ sp, key }: Readonly<{ sp: SearchParams; key: string }>): string => {
  const raw: string | string[] | undefined = sp[key]
  if (typeof raw === 'string') return raw
  return Array.isArray(raw) ? (raw[0] ?? '') : ''
}

const statusLabelMap: Readonly<Record<string, string>> = {
  draft: 'Brouillon',
  active: 'Active',
  paused: 'En pause',
  completed: 'Terminée',
  archived: 'Archivée',
}

const statusColorMap: Readonly<Record<string, string>> = {
  draft: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700/40 dark:text-zinc-300',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  paused: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  archived: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-700/40 dark:text-zinc-400',
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
  const pdfUrl: string = (formData.get('pdfUrl') as string | null) ?? ''
  if (title.trim().length === 0 || baseScript.trim().length === 0) {
    redirect('/dashboard/admin/campaigns?notice=missing_fields')
  }
  await db.insert(campaigns).values({
    title: title.trim(),
    year,
    baseScript: baseScript.trim(),
    details: details.trim().length > 0 ? details.trim() : null,
    pdfUrl: pdfUrl.trim().length > 0 ? pdfUrl.trim() : null,
    status: 'draft',
    visibility,
    createdByAdminId: user.id,
  })
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
  const pdfUrl = (formData.get('pdfUrl') as string | null) ?? ''
  const status = (formData.get('status') as string | null) ?? 'draft'
  const visibilityRaw = (formData.get('visibility') as string | null) ?? 'private'
  const visibility = visibilityRaw === 'public' ? 'public' : 'private'
  if (campaignId.length === 0 || title.trim().length === 0) {
    redirect('/dashboard/admin/campaigns?notice=missing_fields')
  }
  await db
    .update(campaigns)
    .set({
      title: title.trim(),
      year,
      baseScript: baseScript.trim(),
      details: details.trim().length > 0 ? details.trim() : null,
      pdfUrl: pdfUrl.trim().length > 0 ? pdfUrl.trim() : null,
      status: status as 'draft' | 'active' | 'paused' | 'completed' | 'archived',
      visibility,
      updatedAt: new Date(),
    })
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.createdByAdminId, user.id)))
  redirect('/dashboard/admin/campaigns?notice=updated')
}

async function deleteCampaign(formData: FormData): Promise<void> {
  'use server'
  const user = await requireRole({ allowedRoles: ['admin'] })
  const campaignId = (formData.get('campaignId') as string | null) ?? ''
  if (campaignId.length > 0) {
    await db
      .delete(campaigns)
      .where(and(eq(campaigns.id, campaignId), eq(campaigns.createdByAdminId, user.id)))
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

  const myCampaigns = await db
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
    .where(or(eq(campaigns.createdByAdminId, user.id), eq(campaigns.visibility, 'public')))
    .orderBy(desc(campaigns.createdAt))

  const contactCountsResult = await db
    .select({ campaignId: campaignContacts.campaignId, contactCount: count(campaignContacts.id) })
    .from(campaignContacts)
    .groupBy(campaignContacts.campaignId)
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
            <div className="rounded-2xl border border-zinc-200/70 bg-white py-16 text-center dark:border-white/10 dark:bg-[#1a2332]">
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
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {myCampaigns.map((campaign) => {
                const isOwned = campaign.createdByAdminId === user.id
                const contacts = contactCountMap.get(campaign.id) ?? 0
                return (
                  <div
                    key={campaign.id}
                    className="group relative flex flex-col rounded-2xl border border-zinc-200/70 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#1a2332]"
                  >
                    {/* Top strip — status color */}
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
                      {/* Title row */}
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
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColorMap[campaign.status]}`}
                        >
                          {statusLabelMap[campaign.status]}
                        </span>
                      </div>

                      {/* Stats row */}
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

                      {/* Script preview */}
                      <p className="mt-3 line-clamp-2 flex-1 text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
                        {campaign.baseScript}
                      </p>

                      {/* Footer */}
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
          )}
        </>
      )}
    </div>
  )
}

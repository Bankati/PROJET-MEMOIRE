/**
 * Page de gestion des agents pour l'administrateur.
 * Liste des agents avec création, activation/désactivation et réactivation.
 * Un admin ne voit que ses propres agents (managedByAdminId).
 */
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Clock, Power, RefreshCcw, Users, X, XCircle } from 'lucide-react'
import { and, desc, eq, count } from 'drizzle-orm'

import { requireRole } from '@/lib/auth/server-auth'
import { hashPassword } from '@/lib/auth/password'
import { db } from '@/lib/db'
import { campaigns, users, callResults } from '@/db/schema'
import { AgentDialogForm } from '@/components/admin/agent-dialog-form'

type SearchParams = Readonly<Record<string, string | string[] | undefined>>

const readParam = ({ sp, key }: Readonly<{ sp: SearchParams; key: string }>): string => {
  const raw: string | string[] | undefined = sp[key]
  if (typeof raw === 'string') {
    return raw
  }
  return Array.isArray(raw) ? (raw[0] ?? '') : ''
}

const statusLabelMap: Readonly<Record<string, string>> = {
  active: 'Actif',
  inactive: 'Inactif',
  expired: 'Expiré',
}

const statusColorMap: Readonly<Record<string, string>> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  inactive: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-700/40 dark:text-zinc-300',
  expired: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
}

const statusIconMap: Readonly<Record<string, React.ReactNode>> = {
  active: <CheckCircle2 className="size-3.5" />,
  inactive: <XCircle className="size-3.5" />,
  expired: <Clock className="size-3.5" />,
}

async function createAgent(formData: FormData): Promise<void> {
  'use server'
  const admin = await requireRole({ allowedRoles: ['admin'] })
  const fullName: string = (formData.get('fullName') as string | null) ?? ''
  const email: string = (formData.get('email') as string | null) ?? ''
  const password: string = (formData.get('password') as string | null) ?? ''
  const campaignId: string = (formData.get('campaignId') as string | null) ?? ''
  if (fullName.trim().length === 0 || email.trim().length === 0 || password.length < 6) {
    redirect('/dashboard/admin/agents?notice=missing_fields')
    return
  }
  const campaign =
    campaignId.length > 0
      ? await db
          .select({ endsAt: campaigns.endsAt })
          .from(campaigns)
          .where(and(eq(campaigns.id, campaignId), eq(campaigns.createdByAdminId, admin.id)))
          .limit(1)
      : []
  const expiresAt: Date | null =
    campaign.length > 0 && campaign[0].endsAt ? campaign[0].endsAt : null
  await db.insert(users).values({
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    passwordHash: hashPassword({ password }),
    role: 'agent',
    status: 'active',
    managedByAdminId: admin.id,
    createdByUserId: admin.id,
    campaignAccessExpiresAt: expiresAt,
  })
  redirect('/dashboard/admin/agents?notice=created')
}

async function toggleAgentStatus(formData: FormData): Promise<void> {
  'use server'
  const admin = await requireRole({ allowedRoles: ['admin'] })
  const agentId: string = (formData.get('agentId') as string | null) ?? ''
  const newStatus: string = (formData.get('newStatus') as string | null) ?? ''
  if (agentId.length === 0) {
    redirect('/dashboard/admin/agents?notice=error')
    return
  }
  await db
    .update(users)
    .set({
      status: newStatus as 'active' | 'inactive' | 'expired',
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, agentId), eq(users.managedByAdminId, admin.id)))
  redirect('/dashboard/admin/agents?notice=updated')
}

async function reactivateAgent(formData: FormData): Promise<void> {
  'use server'
  const admin = await requireRole({ allowedRoles: ['admin'] })
  const agentId: string = (formData.get('agentId') as string | null) ?? ''
  const campaignId: string = (formData.get('campaignId') as string | null) ?? ''
  if (agentId.length === 0 || campaignId.length === 0) {
    redirect('/dashboard/admin/agents?notice=missing_fields')
    return
  }
  const campaign = await db
    .select({ endsAt: campaigns.endsAt })
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.createdByAdminId, admin.id)))
    .limit(1)
  const expiresAt: Date | null =
    campaign.length > 0 && campaign[0].endsAt ? campaign[0].endsAt : null
  await db
    .update(users)
    .set({
      status: 'active',
      campaignAccessExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, agentId), eq(users.managedByAdminId, admin.id)))
  redirect('/dashboard/admin/agents?notice=reactivated')
}

export default async function AdminAgentsPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>
}>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ['admin'] })
  const sp: SearchParams = (await searchParams) ?? {}
  const notice: string = readParam({ sp, key: 'notice' })
  const reactivateId: string = readParam({ sp, key: 'reactivate' })
  const [myAgents, myCampaigns, agentCallCounts] = await Promise.all([
    db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        status: users.status,
        campaignAccessExpiresAt: users.campaignAccessExpiresAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(eq(users.role, 'agent'), eq(users.managedByAdminId, user.id)))
      .orderBy(desc(users.createdAt)),
    db
      .select({ id: campaigns.id, title: campaigns.title })
      .from(campaigns)
      .where(eq(campaigns.createdByAdminId, user.id))
      .orderBy(desc(campaigns.createdAt)),
    db
      .select({ agentId: callResults.agentId, callCount: count(callResults.id) })
      .from(callResults)
      .innerJoin(users, eq(callResults.agentId, users.id))
      .where(eq(users.managedByAdminId, user.id))
      .groupBy(callResults.agentId),
  ])
  const callCountMap: ReadonlyMap<string, number> = new Map(
    agentCallCounts.map((r) => [r.agentId, r.callCount])
  )
  const noticeMessages: Readonly<Record<string, { text: string; type: 'success' | 'error' }>> = {
    created: { text: 'Agent créé avec succès.', type: 'success' },
    updated: { text: "Statut de l'agent mis à jour.", type: 'success' },
    reactivated: { text: 'Agent réactivé pour la campagne.', type: 'success' },
    missing_fields: { text: 'Veuillez remplir tous les champs obligatoires.', type: 'error' },
    error: { text: 'Une erreur est survenue.', type: 'error' },
  }
  const currentNotice = notice.length > 0 ? noticeMessages[notice] : undefined
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-white">Agents</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Gérez vos agents et leurs accès aux campagnes
          </p>
        </div>
        {reactivateId.length === 0 ? (
          <div className="shrink-0">
            <AgentDialogForm campaigns={myCampaigns} createAction={createAgent} />
          </div>
        ) : null}
      </div>
      {currentNotice ? (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${
            currentNotice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
          }`}
        >
          {currentNotice.text}
          <a href="/dashboard/admin/agents" className="ml-auto">
            <X className="size-4" />
          </a>
        </div>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total agents</p>
            <Users className="size-4 text-blue-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{myAgents.length}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Actifs</p>
            <CheckCircle2 className="size-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
            {myAgents.filter((a) => a.status === 'active').length}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Expirés</p>
            <Clock className="size-4 text-rose-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
            {myAgents.filter((a) => a.status === 'expired').length}
          </p>
        </div>
      </div>
      {reactivateId.length > 0 ? (
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <h2 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-white">
            Réactiver l&apos;agent pour une campagne
          </h2>
          <form action={reactivateAgent} className="space-y-4">
            <input type="hidden" name="agentId" value={reactivateId} />
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Campagne *
              </label>
              <select
                name="campaignId"
                required
                className="focus:border-lbs-blue w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 transition outline-none dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
              >
                <option value="">Sélectionner une campagne</option>
                {myCampaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
              >
                <RefreshCcw className="size-4" />
                Réactiver
              </button>
              <a
                href="/dashboard/admin/agents"
                className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-600 transition hover:bg-zinc-50 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/10"
              >
                Annuler
              </a>
            </div>
          </form>
        </div>
      ) : null}
      {reactivateId.length === 0 ? (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {myAgents.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200/70 bg-white py-10 text-center dark:border-white/10 dark:bg-[#1a2332]">
                <Users className="mx-auto mb-2 size-8 text-zinc-300" />
                <p className="text-sm text-zinc-400">Aucun agent. Créez votre premier agent.</p>
              </div>
            ) : (
              myAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a2332]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-semibold text-white">
                        {agent.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-zinc-800 dark:text-white">
                          {agent.fullName}
                        </p>
                        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                          {agent.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColorMap[agent.status]}`}
                    >
                      {statusIconMap[agent.status]}
                      {statusLabelMap[agent.status]}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{callCountMap.get(agent.id) ?? 0} appels</span>
                    <span>
                      Expire :{' '}
                      {agent.campaignAccessExpiresAt
                        ? agent.campaignAccessExpiresAt.toLocaleDateString('fr-FR')
                        : '—'}
                    </span>
                  </div>
                  <div className="mt-3">
                    {agent.status === 'active' ? (
                      <form action={toggleAgentStatus}>
                        <input type="hidden" name="agentId" value={agent.id} />
                        <input type="hidden" name="newStatus" value="inactive" />
                        <button
                          type="submit"
                          className="w-full rounded-xl border border-amber-200 bg-amber-50 py-2 text-xs font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                        >
                          Désactiver
                        </button>
                      </form>
                    ) : (
                      <Link
                        href={`/dashboard/admin/agents?reactivate=${agent.id}`}
                        className="block w-full rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-center text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                      >
                        Réactiver
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden rounded-2xl border border-zinc-200/70 bg-white shadow-sm sm:block dark:border-white/10 dark:bg-[#1a2332]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs text-zinc-500 uppercase dark:border-white/10">
                    <th className="px-5 py-3">Agent</th>
                    <th className="px-5 py-3">Statut</th>
                    <th className="px-5 py-3">Appels</th>
                    <th className="px-5 py-3">Expiration</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myAgents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-zinc-400">
                        <Users className="mx-auto mb-2 size-8 text-zinc-300" />
                        Aucun agent. Créez votre premier agent.
                      </td>
                    </tr>
                  ) : (
                    myAgents.map((agent) => (
                      <tr
                        key={agent.id}
                        className="border-b border-zinc-100 transition hover:bg-zinc-50/50 dark:border-white/5 dark:hover:bg-white/5"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-semibold text-white">
                              {agent.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-zinc-800 dark:text-white">
                                {agent.fullName}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {agent.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColorMap[agent.status]}`}
                          >
                            {statusIconMap[agent.status]}
                            {statusLabelMap[agent.status]}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-medium text-zinc-800 dark:text-white">
                          {callCountMap.get(agent.id) ?? 0}
                        </td>
                        <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                          {agent.campaignAccessExpiresAt
                            ? agent.campaignAccessExpiresAt.toLocaleDateString('fr-FR')
                            : '—'}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="inline-flex items-center gap-1">
                            {agent.status === 'active' ? (
                              <form action={toggleAgentStatus} className="inline">
                                <input type="hidden" name="agentId" value={agent.id} />
                                <input type="hidden" name="newStatus" value="inactive" />
                                <button
                                  type="submit"
                                  className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-amber-50 hover:text-amber-600 dark:text-zinc-400 dark:hover:bg-amber-500/10"
                                  title="Désactiver"
                                >
                                  <Power className="size-4" />
                                </button>
                              </form>
                            ) : (
                              <Link
                                href={`/dashboard/admin/agents?reactivate=${agent.id}`}
                                className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-emerald-50 hover:text-emerald-600 dark:text-zinc-400 dark:hover:bg-emerald-500/10"
                                title="Réactiver"
                              >
                                <RefreshCcw className="size-4" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

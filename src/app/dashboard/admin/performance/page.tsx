/**
 * Page de performances pour l'administrateur.
 * KPI globaux, performances par agent, par campagne, avec graphiques et filtres.
 */
import { BarChart3, Phone, PhoneMissed, Send, TrendingUp, Users } from 'lucide-react'
import { and, count, desc, eq, gte, inArray, lte, or, sql } from 'drizzle-orm'
import Link from 'next/link'

import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import {
  agentContactAssignments,
  callResults,
  campaignContacts,
  campaigns,
  users,
} from '@/db/schema'
import { extractCount, readParam } from '@/lib/dashboard-utils'

type SearchParams = Readonly<Record<string, string | string[] | undefined>>

const buildDefaultFrom = (): string => {
  const d = new Date()
  d.setMonth(d.getMonth() - 3)
  return d.toISOString().slice(0, 10)
}
const buildDefaultTo = (): string => new Date().toISOString().slice(0, 10)

export default async function AdminPerformancePage({
  searchParams,
}: Readonly<{ searchParams?: Promise<SearchParams> }>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ['admin'] })
  const sp: SearchParams = (await searchParams) ?? {}
  const campaignFilter = readParam({ sp, key: 'campaign' })
  const agentFilter = readParam({ sp, key: 'agent' })
  const dateFromStr = readParam({ sp, key: 'from' }) || buildDefaultFrom()
  const dateToStr = readParam({ sp, key: 'to' }) || buildDefaultTo()
  const dateFrom = new Date(dateFromStr)
  const dateTo = new Date(dateToStr + 'T23:59:59.999Z')

  // Phase 2: myCampaigns + allAgents en parallèle (indépendants)
  // Les statistiques agents sont visibles par tout admin, indépendamment du rattachement (managedByAdminId).
  const [myCampaigns, allAgents] = await Promise.all([
    db
      .select({ id: campaigns.id, title: campaigns.title })
      .from(campaigns)
      .where(or(eq(campaigns.createdByAdminId, user.id), eq(campaigns.visibility, 'public')))
      .orderBy(desc(campaigns.createdAt)),
    db
      .select({ id: users.id, fullName: users.fullName })
      .from(users)
      .where(eq(users.role, 'agent'))
      .orderBy(users.fullName),
  ])
  const myCampaignIds = myCampaigns.map((c) => c.id)

  const hasCampaigns = myCampaignIds.length > 0
  const callConditions: ReturnType<typeof and>[] = [
    gte(callResults.createdAt, dateFrom),
    lte(callResults.createdAt, dateTo),
  ]
  if (campaignFilter.length > 0) {
    callConditions.push(eq(callResults.campaignId, campaignFilter))
  } else if (hasCampaigns) {
    callConditions.push(inArray(callResults.campaignId, myCampaignIds))
  }
  if (agentFilter.length > 0) callConditions.push(eq(callResults.agentId, agentFilter))
  const callWhereClause = and(...callConditions)

  // Phase 3: Toutes les requêtes dépendantes de myCampaignIds en parallèle
  const phase3 = hasCampaigns
    ? await Promise.all([
        db
          .select({ value: count(callResults.id) })
          .from(callResults)
          .where(callWhereClause)
          .then((r) => r[0]?.value ?? 0),
        db
          .select({ value: count(callResults.id) })
          .from(callResults)
          .where(and(callWhereClause, eq(callResults.outcome, 'false_number')))
          .then((r) => r[0]?.value ?? 0),
        db
          .select({ value: count(callResults.id) })
          .from(callResults)
          .where(and(callWhereClause, eq(callResults.isWhatsappRedirected, true)))
          .then((r) => r[0]?.value ?? 0),
        db
          .select({ value: count(callResults.id) })
          .from(callResults)
          .where(and(callWhereClause, eq(callResults.outcome, 'interested')))
          .then((r) => r[0]?.value ?? 0),
        db
          .select({
            agentId: callResults.agentId,
            agentName: users.fullName,
            totalCalls: count(callResults.id),
            whatsappCalls: sql<number>`count(case when ${callResults.isWhatsappRedirected} then 1 end)`,
          })
          .from(callResults)
          .innerJoin(users, eq(callResults.agentId, users.id))
          .where(callWhereClause)
          .groupBy(callResults.agentId, users.fullName)
          .orderBy(desc(count(callResults.id))),
        db
          .select({
            agentId: agentContactAssignments.agentId,
            assignedCount: count(agentContactAssignments.id),
          })
          .from(agentContactAssignments)
          .innerJoin(
            campaignContacts,
            eq(agentContactAssignments.campaignContactId, campaignContacts.id)
          )
          .where(inArray(campaignContacts.campaignId, myCampaignIds))
          .groupBy(agentContactAssignments.agentId),
        db
          .select({
            campaignId: callResults.campaignId,
            campaignTitle: campaigns.title,
            totalCalls: count(callResults.id),
          })
          .from(callResults)
          .innerJoin(campaigns, eq(callResults.campaignId, campaigns.id))
          .where(callWhereClause)
          .groupBy(callResults.campaignId, campaigns.title)
          .orderBy(desc(count(callResults.id))),
        db
          .select({
            campaignId: campaignContacts.campaignId,
            totalContacts: count(campaignContacts.id),
          })
          .from(campaignContacts)
          .where(inArray(campaignContacts.campaignId, myCampaignIds))
          .groupBy(campaignContacts.campaignId),
      ])
    : null

  const [
    totalCallsCount = 0,
    falseNumbersCount = 0,
    whatsappCount = 0,
    interestedCount = 0,
    agentPerformance = [],
    agentAssignedCounts = [],
    campaignPerformance = [],
    campaignContactCounts = [],
  ] = phase3 ?? []

  const falseRate =
    totalCallsCount === 0 ? 0 : Math.round((falseNumbersCount / totalCallsCount) * 100)
  const whatsappRate =
    totalCallsCount === 0 ? 0 : Math.round((whatsappCount / totalCallsCount) * 100)
  const interestedRate =
    totalCallsCount === 0 ? 0 : Math.round((interestedCount / totalCallsCount) * 100)

  const assignedMap = new Map(agentAssignedCounts.map((a) => [a.agentId, a.assignedCount]))
  const contactCountMap = new Map(campaignContactCounts.map((c) => [c.campaignId, c.totalContacts]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Performances</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Analysez les résultats de vos campagnes et agents
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <form className="grid items-end gap-3 sm:grid-cols-2 md:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Campagne
            </label>
            <select
              name="campaign"
              defaultValue={campaignFilter}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
            >
              <option value="">Toutes</option>
              {myCampaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Agent
            </label>
            <select
              name="agent"
              defaultValue={agentFilter}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
            >
              <option value="">Tous</option>
              {allAgents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Du
            </label>
            <input
              name="from"
              type="date"
              defaultValue={dateFromStr}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Au
            </label>
            <input
              name="to"
              type="date"
              defaultValue={dateToStr}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-[42px] items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] text-sm font-medium text-white shadow-sm transition hover:brightness-110"
          >
            <BarChart3 className="size-3.5" />
            Filtrer
          </button>
        </form>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#1a2332]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total appels</p>
            <Phone className="size-4 text-blue-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{totalCallsCount}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#1a2332]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Faux numéros</p>
            <PhoneMissed className="size-4 text-rose-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
            {falseNumbersCount}
          </p>
          <p className="mt-1 text-xs text-zinc-400">{falseRate}% du total</p>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#1a2332]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">WhatsApp</p>
            <Send className="size-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{whatsappCount}</p>
          <p className="mt-1 text-xs text-zinc-400">{whatsappRate}% du total</p>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#1a2332]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Intéressés</p>
            <TrendingUp className="size-4 text-amber-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{interestedCount}</p>
          <p className="mt-1 text-xs text-zinc-400">{interestedRate}% du total</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Agent performance table */}
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-white">
            <Users className="size-4 text-blue-400" />
            Performance par agent
          </h3>
          {agentPerformance.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-400">Aucune donnée disponible.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs text-zinc-500 uppercase dark:border-white/10">
                    <th className="px-3 py-2">Agent</th>
                    <th className="px-3 py-2">Appels</th>
                    <th className="px-3 py-2">Contacts WhatsApp</th>
                    <th className="px-3 py-2">Progression</th>
                  </tr>
                </thead>
                <tbody>
                  {agentPerformance.map((agent) => {
                    const assigned = assignedMap.get(agent.agentId) ?? 0
                    const progress =
                      assigned === 0 ? 0 : Math.round((agent.totalCalls / assigned) * 100)
                    const waCount = extractCount({ value: agent.whatsappCalls })
                    return (
                      <tr
                        key={agent.agentId}
                        className="border-b border-zinc-100 dark:border-white/5"
                      >
                        <td className="px-3 py-3 font-medium">
                          <Link
                            href={`/dashboard/admin/performance/${agent.agentId}${campaignFilter.length > 0 ? `?campaign=${campaignFilter}` : ''}`}
                            className="text-[#244976] transition hover:underline dark:text-blue-300"
                          >
                            {agent.agentName}
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-zinc-600 dark:text-zinc-300">
                          {agent.totalCalls}
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                            <Send className="size-3" /> {waCount}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                                style={{ width: `${Math.min(100, progress)}%` }}
                              />
                            </div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {progress}%
                            </span>
                          </div>
                          <p className="mt-0.5 text-[10px] text-zinc-400">
                            {agent.totalCalls}/{assigned} assignés
                          </p>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Campaign performance table */}
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-white">
            <TrendingUp className="size-4 text-emerald-400" />
            Performance par campagne
          </h3>
          {campaignPerformance.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-400">Aucune donnée disponible.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-xs text-zinc-500 uppercase dark:border-white/10">
                    <th className="px-3 py-2">Campagne</th>
                    <th className="px-3 py-2">Appels</th>
                    <th className="px-3 py-2">Total Contacts</th>
                    <th className="px-3 py-2">Progression</th>
                  </tr>
                </thead>
                <tbody>
                  {campaignPerformance.map((campaign) => {
                    const totalContacts = contactCountMap.get(campaign.campaignId) ?? 0
                    const progress =
                      totalContacts === 0
                        ? 0
                        : Math.round((campaign.totalCalls / totalContacts) * 100)
                    return (
                      <tr
                        key={campaign.campaignId}
                        className="border-b border-zinc-100 dark:border-white/5"
                      >
                        <td className="px-3 py-3 font-medium text-zinc-800 dark:text-white">
                          {campaign.campaignTitle}
                        </td>
                        <td className="px-3 py-3 text-zinc-600 dark:text-zinc-300">
                          {campaign.totalCalls}
                        </td>
                        <td className="px-3 py-3 text-zinc-600 dark:text-zinc-300">
                          {totalContacts}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                                style={{ width: `${Math.min(100, progress)}%` }}
                              />
                            </div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {progress}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

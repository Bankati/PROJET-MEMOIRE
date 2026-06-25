import { and, count, desc, eq, gte, inArray, or, sql } from 'drizzle-orm'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  BarChart3,
  Calendar,
  Clock,
  Phone,
  PhoneMissed,
  Send,
  Target,
  TrendingUp,
  User,
} from 'lucide-react'

import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import {
  agentContactAssignments,
  callResults,
  campaignContacts,
  campaigns,
  contacts,
  users,
} from '@/db/schema'

type Params = Readonly<{ agentId: string }>
type SearchParams = Readonly<Record<string, string | string[] | undefined>>

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const readParam = ({ sp, key }: Readonly<{ sp: SearchParams; key: string }>): string => {
  const raw: string | string[] | undefined = sp[key]
  if (typeof raw === 'string') return raw
  return Array.isArray(raw) ? (raw[0] ?? '') : ''
}

const OUTCOME_LABELS: Readonly<Record<string, string>> = {
  interested: 'Intéressé',
  not_interested: 'Pas intéressé',
  callback: 'Rappel',
  no_answer: 'Pas de réponse',
  false_number: 'Faux numéro',
  whatsapp_follow_up: 'Suivi WhatsApp',
  other: 'Autre',
}

const OUTCOME_STYLES: Readonly<Record<string, string>> = {
  interested: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  not_interested: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  callback: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  no_answer: 'bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-400',
  false_number: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  whatsapp_follow_up: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  other: 'bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-400',
}

const OUTCOME_COLORS: Readonly<Record<string, string>> = {
  interested: '#10b981',
  not_interested: '#f43f5e',
  callback: '#f59e0b',
  no_answer: '#71717a',
  false_number: '#ef4444',
  whatsapp_follow_up: '#3b82f6',
  other: '#a1a1aa',
}

const formatDuration = (seconds: number): string => {
  if (seconds === 0) return '—'
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

const buildAreaPath = ({
  values,
  maxValue,
  w,
  h,
}: Readonly<{ values: readonly number[]; maxValue: number; w: number; h: number }>): Readonly<{
  linePath: string
  areaPath: string
}> => {
  if (values.length === 0) return { linePath: '', areaPath: '' }
  const safe = Math.max(1, maxValue)
  const pts = values.map((v, i) => {
    const x = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w
    const y = h - (v / safe) * h
    return `${x},${y}`
  })
  const line = `M ${pts.join(' L ')}`
  return {
    linePath: line,
    areaPath: `${line} L ${(pts.at(-1) ?? '').split(',')[0]},${h} L ${(pts[0] ?? '').split(',')[0]},${h} Z`,
  }
}

export default async function AdminAgentPerformanceDetailPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<Params>
  searchParams?: Promise<SearchParams>
}>): Promise<React.JSX.Element> {
  const admin = await requireRole({ allowedRoles: ['admin'] })
  const { agentId } = await params

  if (!UUID_PATTERN.test(agentId)) {
    redirect('/dashboard/admin/performance')
  }

  const sp: SearchParams = (await searchParams) ?? {}
  const campaignFilter = readParam({ sp, key: 'campaign' })

  const [agentUser] = await db
    .select({ id: users.id, fullName: users.fullName, email: users.email })
    .from(users)
    .where(
      and(eq(users.id, agentId), eq(users.managedByAdminId, admin.id), eq(users.role, 'agent'))
    )
    .limit(1)

  if (!agentUser) {
    redirect('/dashboard/admin/performance')
  }

  const myCampaigns = await db
    .select({ id: campaigns.id, title: campaigns.title })
    .from(campaigns)
    .where(or(eq(campaigns.createdByAdminId, admin.id), eq(campaigns.visibility, 'public')))
    .orderBy(desc(campaigns.createdAt))

  const myCampaignIds = myCampaigns.map((c) => c.id)

  const campaignWhere =
    campaignFilter.length > 0
      ? eq(callResults.campaignId, campaignFilter)
      : myCampaignIds.length > 0
        ? inArray(callResults.campaignId, myCampaignIds)
        : undefined

  const baseWhere = and(eq(callResults.agentId, agentId), campaignWhere)

  const assignedWhere = and(
    eq(agentContactAssignments.agentId, agentId),
    campaignFilter.length > 0
      ? eq(campaignContacts.campaignId, campaignFilter)
      : myCampaignIds.length > 0
        ? inArray(campaignContacts.campaignId, myCampaignIds)
        : undefined
  )

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    totalCallsResult,
    whatsappResult,
    falseNumbersResult,
    interestedResult,
    assignedResult,
    outcomeBreakdown,
    dailyActivity,
    campaignBreakdown,
    calls,
  ] = await Promise.all([
    db
      .select({ value: count(callResults.id) })
      .from(callResults)
      .where(baseWhere),
    db
      .select({ value: count(callResults.id) })
      .from(callResults)
      .where(and(baseWhere, eq(callResults.isWhatsappRedirected, true))),
    db
      .select({ value: count(callResults.id) })
      .from(callResults)
      .where(and(baseWhere, eq(callResults.outcome, 'false_number'))),
    db
      .select({ value: count(callResults.id) })
      .from(callResults)
      .where(and(baseWhere, eq(callResults.outcome, 'interested'))),
    db
      .select({ value: count(agentContactAssignments.id) })
      .from(agentContactAssignments)
      .innerJoin(
        campaignContacts,
        eq(agentContactAssignments.campaignContactId, campaignContacts.id)
      )
      .where(assignedWhere),
    // Répartition par résultat
    db
      .select({ outcome: callResults.outcome, value: count(callResults.id) })
      .from(callResults)
      .where(baseWhere)
      .groupBy(callResults.outcome)
      .orderBy(desc(count(callResults.id))),
    // Activité journalière — 30 derniers jours
    db
      .select({
        day: sql<string>`to_char(${callResults.createdAt}, 'YYYY-MM-DD')`,
        value: count(callResults.id),
      })
      .from(callResults)
      .where(and(baseWhere, gte(callResults.createdAt, thirtyDaysAgo)))
      .groupBy(sql`to_char(${callResults.createdAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${callResults.createdAt}, 'YYYY-MM-DD') asc`),
    // Performance par campagne
    db
      .select({
        campaignId: callResults.campaignId,
        campaignTitle: campaigns.title,
        totalCalls: count(callResults.id),
        whatsappCalls: sql<number>`count(case when ${callResults.isWhatsappRedirected} then 1 end)`,
        interestedCalls: sql<number>`count(case when ${callResults.outcome} = 'interested' then 1 end)`,
        falseCalls: sql<number>`count(case when ${callResults.outcome} = 'false_number' then 1 end)`,
      })
      .from(callResults)
      .innerJoin(campaigns, eq(callResults.campaignId, campaigns.id))
      .where(
        and(
          eq(callResults.agentId, agentId),
          myCampaignIds.length > 0 ? inArray(callResults.campaignId, myCampaignIds) : undefined
        )
      )
      .groupBy(callResults.campaignId, campaigns.title)
      .orderBy(desc(count(callResults.id))),
    // Liste détaillée
    db
      .select({
        id: callResults.id,
        outcome: callResults.outcome,
        durationSeconds: callResults.durationSeconds,
        notes: callResults.notes,
        isWhatsappRedirected: callResults.isWhatsappRedirected,
        createdAt: callResults.createdAt,
        contactFirstName: contacts.firstName,
        contactLastName: contacts.lastName,
        contactPhone: contacts.phonePrimary,
        contactSchool: contacts.schoolName,
        campaignTitle: campaigns.title,
      })
      .from(callResults)
      .innerJoin(contacts, eq(callResults.contactId, contacts.id))
      .innerJoin(campaigns, eq(callResults.campaignId, campaigns.id))
      .where(baseWhere)
      .orderBy(desc(callResults.createdAt))
      .limit(200),
  ])

  const totalCalls = totalCallsResult[0]?.value ?? 0
  const whatsappCount = whatsappResult[0]?.value ?? 0
  const falseCount = falseNumbersResult[0]?.value ?? 0
  const interestedCount = interestedResult[0]?.value ?? 0
  const assignedCount = assignedResult[0]?.value ?? 0
  const progressRate = assignedCount === 0 ? 0 : Math.round((totalCalls / assignedCount) * 100)
  const conversionRate = totalCalls === 0 ? 0 : Math.round((interestedCount / totalCalls) * 100)

  // Donut segments from outcome breakdown
  const donutTotal = Math.max(1, totalCalls)
  const donutSegments = outcomeBreakdown.map((row) => ({
    outcome: row.outcome,
    label: OUTCOME_LABELS[row.outcome] ?? row.outcome,
    color: OUTCOME_COLORS[row.outcome] ?? '#a1a1aa',
    count: row.value,
    percent: Math.round((row.value / donutTotal) * 100),
  }))

  // Daily activity chart — fill 30 days
  const dailyMap = new Map(dailyActivity.map((r) => [r.day, r.value]))
  const dailyPoints: Array<{ label: string; shortLabel: string; value: number }> = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    dailyPoints.push({
      label: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      shortLabel: d.toLocaleDateString('fr-FR', { day: 'numeric' }),
      value: dailyMap.get(key) ?? 0,
    })
  }
  const chartMax = Math.max(...dailyPoints.map((p) => p.value), 1)
  const { linePath, areaPath } = buildAreaPath({
    values: dailyPoints.map((p) => p.value),
    maxValue: chartMax,
    w: 600,
    h: 120,
  })

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/dashboard/admin/performance"
            className="mb-1 inline-flex items-center gap-1 text-xs text-zinc-400 transition hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            ← Retour aux performances
          </Link>
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-[#244976] to-[#21416C] text-white shadow-sm">
              <User className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {agentUser.fullName}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{agentUser.email}</p>
            </div>
          </div>
        </div>
        <span className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500 dark:border-white/10 dark:bg-white/10 dark:text-zinc-400">
          {calls.length} appel{calls.length !== 1 ? 's' : ''}
          {campaignFilter.length > 0 ? ' (filtrés)' : ''}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Total appels</p>
            <Phone className="size-4 text-blue-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{totalCalls}</p>
          <p className="mt-1 text-xs text-zinc-400">{assignedCount} assignés</p>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Progression</p>
            <TrendingUp className="size-4 text-violet-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{progressRate}%</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-400 to-violet-600 transition-all"
              style={{ width: `${Math.min(100, progressRate)}%` }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Taux de conversion</p>
            <Target className="size-4 text-amber-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{conversionRate}%</p>
          <p className="mt-1 text-xs text-zinc-400">
            {interestedCount} intéressé{interestedCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">WhatsApp</p>
            <Send className="size-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{whatsappCount}</p>
          <p className="mt-1 text-xs text-zinc-400">
            {totalCalls === 0 ? 0 : Math.round((whatsappCount / totalCalls) * 100)}% du total
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Faux numéros</p>
            <PhoneMissed className="size-4 text-rose-400" />
          </div>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{falseCount}</p>
          <p className="mt-1 text-xs text-zinc-400">
            {totalCalls === 0 ? 0 : Math.round((falseCount / totalCalls) * 100)}% du total
          </p>
        </div>
      </div>

      {/* Statistiques avancées */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Donut — répartition résultats */}
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <p className="mb-4 text-sm font-semibold text-zinc-800 dark:text-white">
            Répartition des résultats
          </p>
          {donutSegments.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">Aucune donnée</p>
          ) : (
            <>
              <div className="flex justify-center">
                <svg viewBox="0 0 120 120" className="size-36">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="14"
                    className="dark:stroke-zinc-700"
                  />
                  {(() => {
                    let offset = 0
                    return donutSegments.map((seg) => {
                      const circ = 2 * Math.PI * 50
                      const dash = (seg.percent / 100) * circ
                      const off = -offset * (circ / 100)
                      const el = (
                        <circle
                          key={seg.outcome}
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke={seg.color}
                          strokeWidth="14"
                          strokeDasharray={`${dash} ${circ - dash}`}
                          strokeDashoffset={off}
                          strokeLinecap="round"
                          transform="rotate(-90 60 60)"
                        />
                      )
                      offset += seg.percent
                      return el
                    })
                  })()}
                  <text
                    x="60"
                    y="56"
                    textAnchor="middle"
                    className="fill-zinc-800 dark:fill-white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {totalCalls}
                  </text>
                  <text x="60" y="69" textAnchor="middle" fill="#71717a" fontSize="7">
                    appels
                  </text>
                </svg>
              </div>
              <div className="mt-4 space-y-2">
                {donutSegments.map((seg) => (
                  <div key={seg.outcome} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: seg.color }}
                      />
                      {seg.label}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-800 dark:text-white">
                        {seg.count}
                      </span>
                      <span className="w-8 text-right text-zinc-400">{seg.percent}%</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Courbe activité journalière */}
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm lg:col-span-2 dark:border-white/10 dark:bg-[#1a2332]">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-800 dark:text-white">
              Activité journalière — 30 derniers jours
            </p>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
              {dailyPoints.reduce((s, p) => s + p.value, 0)} appels
            </span>
          </div>
          {areaPath.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-400">Aucune activité sur la période</p>
          ) : (
            <>
              <svg viewBox="0 0 600 120" className="h-32 w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`grad-${agentId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#244976" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#244976" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path d={areaPath} fill={`url(#grad-${agentId})`} />
                <path
                  d={linePath}
                  fill="none"
                  stroke="#244976"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-1 flex justify-between text-[10px] text-zinc-400">
                {dailyPoints
                  .filter((_, i) => i % 5 === 0 || i === dailyPoints.length - 1)
                  .map((p) => (
                    <span key={p.label}>{p.label}</span>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Performance par campagne */}
      {campaignBreakdown.length > 1 ? (
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <p className="mb-4 text-sm font-semibold text-zinc-800 dark:text-white">
            Performance par campagne
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-medium text-zinc-500 uppercase dark:border-white/10">
                  <th className="px-3 py-2">Campagne</th>
                  <th className="px-3 py-2 text-right">Appels</th>
                  <th className="px-3 py-2 text-right">Intéressés</th>
                  <th className="px-3 py-2 text-right">WhatsApp</th>
                  <th className="px-3 py-2 text-right">Faux n°</th>
                  <th className="px-3 py-2">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {campaignBreakdown.map((row) => {
                  const total = row.totalCalls
                  const interested = Number(row.interestedCalls)
                  const rate = total === 0 ? 0 : Math.round((interested / total) * 100)
                  return (
                    <tr
                      key={row.campaignId}
                      className="border-b border-zinc-100 dark:border-white/5"
                    >
                      <td className="px-3 py-3 font-medium text-zinc-800 dark:text-white">
                        {row.campaignTitle}
                      </td>
                      <td className="px-3 py-3 text-right text-zinc-600 dark:text-zinc-300">
                        {total}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                          {interested}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right text-zinc-600 dark:text-zinc-300">
                        {Number(row.whatsappCalls)}
                      </td>
                      <td className="px-3 py-3 text-right text-zinc-600 dark:text-zinc-300">
                        {Number(row.falseCalls)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                              style={{ width: `${Math.min(100, rate)}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* Filtre campagne */}
      <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <form className="flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="detail-campaign"
              className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400"
            >
              Filtrer les appels par campagne
            </label>
            <select
              id="detail-campaign"
              name="campaign"
              defaultValue={campaignFilter}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
            >
              <option value="">Toutes les campagnes</option>
              {myCampaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex h-[42px] items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-4 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
          >
            <BarChart3 className="size-3.5" />
            Filtrer
          </button>
          {campaignFilter.length > 0 ? (
            <Link
              href={`/dashboard/admin/performance/${agentId}`}
              className="inline-flex h-[42px] items-center rounded-xl border border-zinc-200 px-4 text-sm text-zinc-500 transition hover:bg-zinc-50 dark:border-white/15 dark:text-zinc-400 dark:hover:bg-white/10"
            >
              Réinitialiser
            </Link>
          ) : null}
        </form>
      </div>

      {/* Liste des appels */}
      {calls.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-white py-16 text-center dark:border-white/10 dark:bg-[#1a2332]">
          <div className="grid size-14 place-items-center rounded-2xl bg-zinc-100 dark:bg-white/10">
            <Phone className="size-7 text-zinc-400 dark:text-zinc-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Aucun appel enregistré
            </p>
            <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
              {campaignFilter.length > 0
                ? 'Aucun appel pour cette campagne.'
                : "Cet agent n'a pas encore effectué d'appels."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {calls.map((call) => (
            <div
              key={call.id}
              className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#244976] to-[#21416C] shadow-sm">
                    <Phone className="size-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-white">
                      {call.contactFirstName} {call.contactLastName ?? ''}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      {call.contactSchool ?? call.contactPhone}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      OUTCOME_STYLES[call.outcome] ??
                      'bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-400'
                    }`}
                  >
                    {OUTCOME_LABELS[call.outcome] ?? call.outcome}
                  </span>
                  {call.isWhatsappRedirected ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      <Send className="size-3" />
                      WhatsApp
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-400 dark:text-zinc-500">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatDuration(call.durationSeconds)}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {call.createdAt.toLocaleDateString('fr-FR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span>{call.campaignTitle}</span>
              </div>

              {call.notes && call.notes.trim().length > 0 ? (
                <div className="mt-3 rounded-xl bg-zinc-50 px-3.5 py-2.5 dark:bg-white/5">
                  <p className="mb-1 text-[11px] font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
                    Commentaire
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-700 dark:text-zinc-200">
                    {call.notes}
                  </p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

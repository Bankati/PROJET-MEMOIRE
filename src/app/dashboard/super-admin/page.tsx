/**
 * Dashboard super-admin — statistiques et campagnes fusionnées.
 */
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Crown,
  Filter,
  Globe,
  Phone,
  PhoneMissed,
  Send,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { and, count, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm'

import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import { campaigns, callResults, campaignContacts, users } from '@/db/schema'
import { DashboardFilters } from '@/components/super-admin/dashboard-filters'
import { CampaignDetailsModal } from '@/components/super-admin/campaign-details-modal'
import { extractCount, formatDuration, formatTimeAgo, readParam } from '@/lib/dashboard-utils'

type SearchParams = Readonly<Record<string, string | string[] | undefined>>
type CurvePoint = Readonly<{ label: string; calls: number }>
type CampaignTableRow = Readonly<{
  id: string
  title: string
  adminName: string
  totalContacts: number
  totalCalls: number
  whatsappConversions: number
  falseNumbers: number
  interestedCount: number
  topAgents: ReadonlyArray<
    Readonly<{ agentName: string; totalCalls: number; whatsappCount: number }>
  >
}>
const buildCurvePoints = ({
  monthlyCalls,
  from,
  to,
}: Readonly<{
  monthlyCalls: ReadonlyMap<string, number>
  from: Date
  to: Date
}>): readonly CurvePoint[] => {
  const points: CurvePoint[] = []
  const cursor = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), 1))
  const endMonth = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 1))
  while (cursor <= endMonth) {
    const key = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, '0')}`
    points.push({
      label: cursor.toLocaleString('fr-FR', { month: 'short' }),
      calls: monthlyCalls.get(key) ?? 0,
    })
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }
  return points
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
    areaPath: `${line} L ${pts[pts.length - 1].split(',')[0]},${h} L ${pts[0].split(',')[0]},${h} Z`,
  }
}
const buildSparkline = ({ n }: Readonly<{ n: number }>): string => {
  const p = [n * 0.3, n * 0.5, n * 0.4, n * 0.7, n * 0.6, n * 0.9, n]
  const mx = Math.max(...p, 1)
  return p.map((v, i) => `${(i / (p.length - 1)) * 100},${40 - (v / mx) * 35}`).join(' ')
}
const buildDefaultFrom = (): string => {
  const d = new Date()
  d.setMonth(d.getMonth() - 6)
  return d.toISOString().slice(0, 10)
}
const buildDefaultTo = (): string => new Date().toISOString().slice(0, 10)

export default async function SuperAdminDashboardPage({
  searchParams,
}: Readonly<{ searchParams?: Promise<SearchParams> }>): Promise<React.JSX.Element> {
  await requireRole({ allowedRoles: ['super_admin'] })
  const sp: SearchParams = (await searchParams) ?? {}
  const campaignFilter = readParam({ sp, key: 'campaign' })
  const dateFromStr = readParam({ sp, key: 'from' }) || buildDefaultFrom()
  const dateToStr = readParam({ sp, key: 'to' }) || buildDefaultTo()
  const dateFrom = new Date(dateFromStr)
  const dateTo = new Date(dateToStr + 'T23:59:59.999Z')

  // Pure computation — no DB calls needed
  const callConditions: ReturnType<typeof and>[] = [
    gte(callResults.createdAt, dateFrom),
    lte(callResults.createdAt, dateTo),
  ]
  if (campaignFilter.length > 0) callConditions.push(eq(callResults.campaignId, campaignFilter))
  const callWhereClause = and(...callConditions)

  const rangeDays = Math.max(1, Math.ceil((dateTo.getTime() - dateFrom.getTime()) / 86400000))
  const prevDateFrom = new Date(dateFrom.getTime() - rangeDays * 86400000)
  const prevConditions: ReturnType<typeof and>[] = [
    gte(callResults.createdAt, prevDateFrom),
    lte(callResults.createdAt, dateFrom),
  ]
  if (campaignFilter.length > 0) prevConditions.push(eq(callResults.campaignId, campaignFilter))

  // Phase 2: All independent DB queries in one parallel round-trip
  const [
    campaignOptions,
    [activeAdminsCount, activeAgentsCount, activeCampaignsCount],
    totalCallsCount,
    falseNumbersCount,
    whatsappCount,
    interestedCount,
    avgDurationRaw,
    prevCallsCount,
    monthlyCallsResult,
    recentAdmins,
    allCampaigns,
  ] = await Promise.all([
    db
      .select({ id: campaigns.id, title: campaigns.title })
      .from(campaigns)
      .orderBy(desc(campaigns.createdAt)),
    Promise.all([
      db
        .select({ value: count(users.id) })
        .from(users)
        .where(and(eq(users.role, 'admin'), eq(users.status, 'active')))
        .then((r) => r[0]?.value ?? 0),
      db
        .select({ value: count(users.id) })
        .from(users)
        .where(and(eq(users.role, 'agent'), eq(users.status, 'active')))
        .then((r) => r[0]?.value ?? 0),
      db
        .select({ value: count(campaigns.id) })
        .from(campaigns)
        .where(eq(campaigns.status, 'active'))
        .then((r) => r[0]?.value ?? 0),
    ]),
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
        value: sql<number>`coalesce(round(avg(${callResults.durationSeconds})::numeric, 0), 0)`,
      })
      .from(callResults)
      .where(callWhereClause),
    db
      .select({ value: count(callResults.id) })
      .from(callResults)
      .where(and(...prevConditions))
      .then((r) => r[0]?.value ?? 0),
    db
      .select({
        month: sql<string>`to_char(date_trunc('month', ${callResults.createdAt}), 'YYYY-MM')`,
        value: count(callResults.id),
      })
      .from(callResults)
      .where(callWhereClause)
      .groupBy(sql`date_trunc('month', ${callResults.createdAt})`)
      .orderBy(sql`date_trunc('month', ${callResults.createdAt}) asc`),
    db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, 'admin'))
      .orderBy(desc(users.createdAt))
      .limit(5),
    db
      .select({
        id: campaigns.id,
        title: campaigns.title,
        adminId: campaigns.createdByAdminId,
        adminName: users.fullName,
      })
      .from(campaigns)
      .innerJoin(users, eq(campaigns.createdByAdminId, users.id))
      .orderBy(desc(campaigns.createdAt))
      .limit(20),
  ])

  const avgDuration = extractCount({ value: avgDurationRaw[0]?.value ?? 0 })
  const falseRate =
    totalCallsCount === 0 ? 0 : Math.round((falseNumbersCount / totalCallsCount) * 100)
  const whatsappRate =
    totalCallsCount === 0 ? 0 : Math.round((whatsappCount / totalCallsCount) * 100)
  const interestedRate =
    totalCallsCount === 0 ? 0 : Math.round((interestedCount / totalCallsCount) * 100)
  const callsTrend =
    prevCallsCount === 0
      ? totalCallsCount > 0
        ? 100
        : 0
      : Math.round(((totalCallsCount - prevCallsCount) / prevCallsCount) * 100)

  const monthlyMap: ReadonlyMap<string, number> = new Map(
    monthlyCallsResult
      .filter((e) => typeof e.month === 'string')
      .map((e) => [e.month as string, e.value])
  )
  const curvePoints = buildCurvePoints({ monthlyCalls: monthlyMap, from: dateFrom, to: dateTo })
  const callValues = curvePoints.map((p) => p.calls)
  const chartMax = Math.max(...callValues, 1)
  const { linePath, areaPath } = buildAreaPath({
    values: callValues,
    maxValue: chartMax,
    w: 500,
    h: 160,
  })

  // Phase 3: Eliminate N+1 — 6 GROUP BY queries replace up to 120 per-campaign round-trips
  const allCampaignIds = allCampaigns.map((c) => c.id)
  let campaignTableData: readonly CampaignTableRow[] = []

  if (allCampaignIds.length > 0) {
    const [
      contactsGrouped,
      callsGrouped,
      whatsappGrouped,
      falseGrouped,
      interestedGrouped,
      agentsGrouped,
    ] = await Promise.all([
      db
        .select({ campaignId: campaignContacts.campaignId, value: count(campaignContacts.id) })
        .from(campaignContacts)
        .where(inArray(campaignContacts.campaignId, allCampaignIds))
        .groupBy(campaignContacts.campaignId),
      db
        .select({ campaignId: callResults.campaignId, value: count(callResults.id) })
        .from(callResults)
        .where(inArray(callResults.campaignId, allCampaignIds))
        .groupBy(callResults.campaignId),
      db
        .select({ campaignId: callResults.campaignId, value: count(callResults.id) })
        .from(callResults)
        .where(
          and(
            inArray(callResults.campaignId, allCampaignIds),
            eq(callResults.isWhatsappRedirected, true)
          )
        )
        .groupBy(callResults.campaignId),
      db
        .select({ campaignId: callResults.campaignId, value: count(callResults.id) })
        .from(callResults)
        .where(
          and(
            inArray(callResults.campaignId, allCampaignIds),
            eq(callResults.outcome, 'false_number')
          )
        )
        .groupBy(callResults.campaignId),
      db
        .select({ campaignId: callResults.campaignId, value: count(callResults.id) })
        .from(callResults)
        .where(
          and(
            inArray(callResults.campaignId, allCampaignIds),
            eq(callResults.outcome, 'interested')
          )
        )
        .groupBy(callResults.campaignId),
      db
        .select({
          campaignId: callResults.campaignId,
          agentName: users.fullName,
          totalCalls: count(callResults.id),
          whatsappCount: sql<number>`count(case when ${callResults.isWhatsappRedirected} then 1 end)`,
        })
        .from(callResults)
        .innerJoin(users, eq(callResults.agentId, users.id))
        .where(inArray(callResults.campaignId, allCampaignIds))
        .groupBy(callResults.campaignId, users.fullName)
        .orderBy(callResults.campaignId, desc(count(callResults.id))),
    ])

    const contactsMap = new Map(contactsGrouped.map((r) => [r.campaignId, r.value]))
    const callsMap = new Map(callsGrouped.map((r) => [r.campaignId, r.value]))
    const whatsappMap = new Map(whatsappGrouped.map((r) => [r.campaignId, r.value]))
    const falseMap = new Map(falseGrouped.map((r) => [r.campaignId, r.value]))
    const interestedMap = new Map(interestedGrouped.map((r) => [r.campaignId, r.value]))
    const agentsMap = new Map<
      string,
      { agentName: string; totalCalls: number; whatsappCount: number }[]
    >()
    for (const agent of agentsGrouped) {
      const existing = agentsMap.get(agent.campaignId) ?? []
      existing.push({
        agentName: agent.agentName,
        totalCalls: agent.totalCalls,
        whatsappCount: extractCount({ value: agent.whatsappCount }),
      })
      agentsMap.set(agent.campaignId, existing)
    }

    campaignTableData = allCampaigns.map((camp) => ({
      id: camp.id,
      title: camp.title,
      adminName: camp.adminName,
      totalContacts: contactsMap.get(camp.id) ?? 0,
      totalCalls: callsMap.get(camp.id) ?? 0,
      whatsappConversions: whatsappMap.get(camp.id) ?? 0,
      falseNumbers: falseMap.get(camp.id) ?? 0,
      interestedCount: interestedMap.get(camp.id) ?? 0,
      topAgents: (agentsMap.get(camp.id) ?? []).slice(0, 5),
    }))
  }

  const selectedCampaignTitle =
    campaignFilter.length > 0
      ? (campaignOptions.find((c) => c.id === campaignFilter)?.title ?? 'Campagne')
      : 'Toutes les campagnes'

  const statCards = [
    {
      label: 'Appels totaux',
      value: `${totalCallsCount}`,
      gradient: 'from-blue-500 to-blue-600',
      n: totalCallsCount,
      badge: `${callsTrend >= 0 ? '+' : ''}${callsTrend}%`,
    },
    {
      label: 'Faux numéros',
      value: `${falseNumbersCount}`,
      gradient: 'from-violet-400 to-violet-500',
      n: falseNumbersCount,
      badge: `${falseRate}%`,
    },
    {
      label: 'WhatsApp envoyés',
      value: `${whatsappCount}`,
      gradient: 'from-cyan-400 to-cyan-500',
      n: whatsappCount,
      badge: `${whatsappRate}%`,
    },
    {
      label: 'Intéressés',
      value: `${interestedCount}`,
      gradient: 'from-emerald-400 to-emerald-500',
      n: interestedCount,
      badge: `${interestedRate}%`,
    },
  ]

  return (
    <div className="space-y-6">
      {/* ── Hero banner ── */}
      <div className="relative rounded-2xl">
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl"
          style={{
            backgroundImage: "url('/superadmin.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a3354]/90 via-[#244976]/80 to-[#1a3354]/60" />
        </div>
        <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
            <Sparkles className="size-3.5" />
            LBS Call Center — Super Administration
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Performance &amp; engagement
          </h1>
          <p className="mt-1 max-w-xl text-sm text-white/70">
            Pilotez l&apos;ensemble de la plateforme et analysez les indicateurs globaux en temps
            réel.
          </p>

          <div className="mt-6 space-y-3">
            <DashboardFilters
              campaigns={campaignOptions}
              currentCampaign={campaignFilter}
              currentFrom={dateFromStr}
              currentTo={dateToStr}
              hero
            />

            {campaignFilter.length > 0 ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm">
                <Filter className="size-3.5 shrink-0" />
                <span className="opacity-70">Filtré sur :</span>
                <span className="font-medium">{selectedCampaignTitle}</span>
                <a
                  href="/dashboard/super-admin"
                  className="ml-4 text-xs underline opacity-60 hover:opacity-100"
                >
                  Réinitialiser
                </a>
              </div>
            ) : null}
          </div>

          <p className="mt-4 text-xs text-white/50">
            Période : {dateFromStr.split('-').reverse().join('/')} →{' '}
            {dateToStr.split('-').reverse().join('/')}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Administrateurs actifs',
            value: activeAdminsCount,
            icon: <Crown className="size-4 text-amber-400" />,
            hint: 'Comptes de supervision',
          },
          {
            label: 'Campagnes actives',
            value: activeCampaignsCount,
            icon: <Globe className="size-4 text-blue-400" />,
            hint: 'En cours',
          },
          {
            label: 'Agents actifs',
            value: activeAgentsCount,
            icon: <Users className="size-4 text-emerald-400" />,
            hint: 'Disponibles',
          },
          {
            label: "Volume d'appels",
            value: totalCallsCount,
            icon: <Phone className="size-4 text-violet-400" />,
            hint: `Du ${dateFromStr} au ${dateToStr}`,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#1a2332]"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{kpi.label}</p>
              {kpi.icon}
            </div>
            <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">{kpi.value}</p>
            <p className="mt-1 text-xs text-zinc-400">{kpi.hint}</p>
          </div>
        ))}
      </div>

      {/* Chart + donut */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm lg:col-span-2 dark:border-white/10 dark:bg-[#1a2332]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Appels — {selectedCampaignTitle}
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{totalCallsCount}</p>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${callsTrend >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'}`}
            >
              {callsTrend >= 0 ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {callsTrend >= 0 ? '+' : ''}
              {callsTrend}% vs période précédente
            </span>
          </div>
          <svg viewBox="0 0 500 160" className="h-40 w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="saAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#244976" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#244976" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {areaPath.length > 0 ? (
              <>
                <path d={areaPath} fill="url(#saAreaGrad)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="#244976"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            ) : null}
          </svg>
          <div className="mt-2 flex justify-between text-[11px] text-zinc-400">
            {curvePoints.map((p) => (
              <span key={p.label}>{p.label}</span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <p className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Indicateurs clés
          </p>
          <div className="space-y-3">
            {[
              {
                label: 'Faux numéros',
                value: falseNumbersCount,
                rate: falseRate,
                icon: <PhoneMissed className="size-3.5 text-rose-400" />,
                color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
              },
              {
                label: 'WhatsApp',
                value: whatsappCount,
                rate: whatsappRate,
                icon: <Send className="size-3.5 text-emerald-400" />,
                color:
                  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
              },
              {
                label: 'Intéressés',
                value: interestedCount,
                rate: interestedRate,
                icon: <TrendingUp className="size-3.5 text-blue-400" />,
                color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
              },
              {
                label: 'Durée moy.',
                value: formatDuration({ seconds: avgDuration }),
                rate: null,
                icon: <Phone className="size-3.5 text-violet-400" />,
                color: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-2.5 dark:bg-white/5"
              >
                {row.icon}
                <p className="flex-1 text-sm text-zinc-700 dark:text-zinc-200">{row.label}</p>
                <p className="font-semibold text-zinc-900 dark:text-white">{row.value}</p>
                {row.rate !== null ? (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${row.color}`}>
                    {row.rate}%
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat gradient cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 text-white shadow-lg transition-transform duration-300 hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white/80">{card.label}</p>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">
                {card.badge}
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold">{card.value}</p>
            <svg
              viewBox="0 0 100 40"
              className="absolute right-0 bottom-0 h-12 w-24 opacity-40"
              preserveAspectRatio="none"
            >
              <polyline
                fill="none"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="2"
                points={buildSparkline({ n: card.n })}
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Monthly trend + recent activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            <BarChart3 className="text-lbs-blue size-4" />
            Détail mensuel
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs text-zinc-500 uppercase dark:border-white/10">
                  <th className="px-2 py-2">Mois</th>
                  <th className="px-2 py-2">Appels</th>
                </tr>
              </thead>
              <tbody>
                {curvePoints.map((point) => (
                  <tr key={point.label} className="border-b border-zinc-100 dark:border-white/5">
                    <td className="px-2 py-2.5 font-medium text-zinc-800 dark:text-zinc-200">
                      {point.label}
                    </td>
                    <td className="px-2 py-2.5 text-zinc-600 dark:text-zinc-300">{point.calls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-white">
            <Sparkles className="size-4 text-amber-400" />
            Activité récente
          </h3>
          {recentAdmins.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-400">Aucune activité récente.</p>
          ) : (
            <div className="space-y-4">
              {recentAdmins.map((admin, idx) => (
                <div key={admin.id} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-semibold text-white">
                      {admin.fullName.charAt(0).toUpperCase()}
                    </div>
                    {idx === 0 ? (
                      <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-400 dark:border-[#1a2332]" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800 dark:text-white">
                      {admin.fullName}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {admin.email}
                    </p>
                  </div>
                  <p className="shrink-0 text-[11px] text-zinc-400">
                    {formatTimeAgo({ date: admin.createdAt })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Campaigns table with details modal */}
      <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-white">
          <Globe className="size-4 text-blue-400" />
          Campagnes — vue détaillée
        </h3>
        <CampaignDetailsModal campaigns={campaignTableData} />
      </div>
    </div>
  )
}

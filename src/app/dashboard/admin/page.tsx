/**
 * Dashboard administrateur — KPI, graphiques, top agents, filtre par établissement.
 */
import {
  ArrowDownRight,
  ArrowUpRight,
  Contact,
  Filter,
  Megaphone,
  Phone,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react'
import { and, asc, count, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm'
import Link from 'next/link'

import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import {
  campaigns,
  campaignContacts,
  agentContactAssignments,
  callResults,
  contacts,
  users,
} from '@/db/schema'
import { AdminDashboardFilters } from '@/components/admin/dashboard-filters'
import { extractCount, formatTimeAgo, readParam } from '@/lib/dashboard-utils'

type SearchParams = Readonly<Record<string, string | string[] | undefined>>
type CurvePoint = Readonly<{ label: string; calls: number }>

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

export default async function AdminDashboardPage({
  searchParams,
}: Readonly<{ searchParams?: Promise<SearchParams> }>): Promise<React.JSX.Element> {
  // ── Phase 1 : auth (bloquant — on a besoin de user.id pour toutes les requêtes) ──
  const user = await requireRole({ allowedRoles: ['admin'] })
  const sp: SearchParams = (await searchParams) ?? {}
  const campaignFilter = readParam({ sp, key: 'campaign' })
  const schoolFilter = readParam({ sp, key: 'school' })
  const dateFromStr = readParam({ sp, key: 'from' }) || buildDefaultFrom()
  const dateToStr = readParam({ sp, key: 'to' }) || buildDefaultTo()
  const dateFrom = new Date(dateFromStr)
  const dateTo = new Date(dateToStr + 'T23:59:59.999Z')

  // ── Phase 2 : requêtes indépendantes qui ne dépendent que de user.id ──
  const [
    campaignOptions,
    myAgentsCount,
    activeCampaignsCount,
    myContactsCount,
    recentAgents,
    currentCampaignRow,
  ] = await Promise.all([
    db
      .select({ id: campaigns.id, title: campaigns.title })
      .from(campaigns)
      .where(eq(campaigns.createdByAdminId, user.id))
      .orderBy(desc(campaigns.createdAt)),

    db
      .select({ value: count(users.id) })
      .from(users)
      .where(
        and(
          eq(users.role, 'agent'),
          eq(users.managedByAdminId, user.id),
          eq(users.status, 'active')
        )
      )
      .then((r) => r[0]?.value ?? 0),

    db
      .select({ value: count(campaigns.id) })
      .from(campaigns)
      .where(and(eq(campaigns.createdByAdminId, user.id), eq(campaigns.status, 'active')))
      .then((r) => r[0]?.value ?? 0),

    db
      .select({ value: count(campaignContacts.id) })
      .from(campaignContacts)
      .where(
        and(
          eq(campaignContacts.importedByAdminId, user.id),
          ...(campaignFilter.length > 0 ? [eq(campaignContacts.campaignId, campaignFilter)] : [])
        )
      )
      .then((r) => r[0]?.value ?? 0),

    db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(eq(users.role, 'agent'), eq(users.managedByAdminId, user.id)))
      .orderBy(desc(users.createdAt))
      .limit(5),

    db
      .select({ id: campaigns.id, title: campaigns.title })
      .from(campaigns)
      .where(eq(campaigns.createdByAdminId, user.id))
      .orderBy(
        sql`case when ${campaigns.status} = 'active' then 0 else 1 end asc`,
        desc(campaigns.createdAt)
      )
      .limit(1)
      .then((r) => r[0]),
  ])

  const adminCampaignIds = campaignOptions.map((c) => c.id)
  const hasCampaigns = adminCampaignIds.length > 0
  const currentCampaign = currentCampaignRow

  // ── Conditions construites après Phase 2 ──
  const callConditions: ReturnType<typeof and>[] = [
    gte(callResults.createdAt, dateFrom),
    lte(callResults.createdAt, dateTo),
  ]
  if (campaignFilter.length > 0) {
    callConditions.push(eq(callResults.campaignId, campaignFilter))
  } else if (hasCampaigns) {
    callConditions.push(inArray(callResults.campaignId, adminCampaignIds as string[]))
  }
  if (schoolFilter.length > 0) {
    callConditions.push(eq(contacts.schoolName, schoolFilter))
  }
  const callWhereClause = and(...callConditions)
  const needsContactsJoin = schoolFilter.length > 0

  const rangeDays = Math.max(1, Math.ceil((dateTo.getTime() - dateFrom.getTime()) / 86400000))
  const prevDateFrom = new Date(dateFrom.getTime() - rangeDays * 86400000)
  const prevConditions: ReturnType<typeof and>[] = [
    gte(callResults.createdAt, prevDateFrom),
    lte(callResults.createdAt, dateFrom),
  ]
  if (campaignFilter.length > 0) {
    prevConditions.push(eq(callResults.campaignId, campaignFilter))
  } else if (hasCampaigns) {
    prevConditions.push(inArray(callResults.campaignId, adminCampaignIds as string[]))
  }

  // ── Phase 3 : toutes les requêtes dépendantes en parallèle ──
  const [
    schoolOptions,
    totalCallsCount,
    [falseNumbersCount, whatsappCount, notInterestedCount],
    assignedContactsCount,
    prevCallsCount,
    monthlyCallsResult,
    topAgents,
    monthlyByOutcome,
    campaignRows,
  ] = await Promise.all([
    // schoolOptions
    hasCampaigns
      ? db
          .selectDistinct({ schoolName: contacts.schoolName })
          .from(contacts)
          .innerJoin(campaignContacts, eq(campaignContacts.contactId, contacts.id))
          .where(
            and(
              inArray(campaignContacts.campaignId, adminCampaignIds),
              sql`${contacts.schoolName} is not null`
            )
          )
          .orderBy(contacts.schoolName)
      : Promise.resolve([]),

    // totalCallsCount
    hasCampaigns
      ? needsContactsJoin
        ? db
            .select({ value: count(callResults.id) })
            .from(callResults)
            .innerJoin(contacts, eq(callResults.contactId, contacts.id))
            .where(callWhereClause)
            .then((r) => r[0]?.value ?? 0)
        : db
            .select({ value: count(callResults.id) })
            .from(callResults)
            .where(callWhereClause)
            .then((r) => r[0]?.value ?? 0)
      : Promise.resolve(0),

    // [falseNumbersCount, whatsappCount, notInterestedCount]
    hasCampaigns
      ? Promise.all([
          needsContactsJoin
            ? db
                .select({ value: count(callResults.id) })
                .from(callResults)
                .innerJoin(contacts, eq(callResults.contactId, contacts.id))
                .where(and(callWhereClause, eq(callResults.outcome, 'false_number')))
                .then((r) => r[0]?.value ?? 0)
            : db
                .select({ value: count(callResults.id) })
                .from(callResults)
                .where(and(callWhereClause, eq(callResults.outcome, 'false_number')))
                .then((r) => r[0]?.value ?? 0),
          needsContactsJoin
            ? db
                .select({ value: count(callResults.id) })
                .from(callResults)
                .innerJoin(contacts, eq(callResults.contactId, contacts.id))
                .where(and(callWhereClause, eq(callResults.isWhatsappRedirected, true)))
                .then((r) => r[0]?.value ?? 0)
            : db
                .select({ value: count(callResults.id) })
                .from(callResults)
                .where(and(callWhereClause, eq(callResults.isWhatsappRedirected, true)))
                .then((r) => r[0]?.value ?? 0),
          needsContactsJoin
            ? db
                .select({ value: count(callResults.id) })
                .from(callResults)
                .innerJoin(contacts, eq(callResults.contactId, contacts.id))
                .where(and(callWhereClause, eq(callResults.outcome, 'not_interested')))
                .then((r) => r[0]?.value ?? 0)
            : db
                .select({ value: count(callResults.id) })
                .from(callResults)
                .where(and(callWhereClause, eq(callResults.outcome, 'not_interested')))
                .then((r) => r[0]?.value ?? 0),
        ])
      : Promise.resolve([0, 0, 0] as [number, number, number]),

    // assignedContactsCount
    hasCampaigns
      ? db
          .select({ value: count(agentContactAssignments.id) })
          .from(agentContactAssignments)
          .innerJoin(
            campaignContacts,
            eq(agentContactAssignments.campaignContactId, campaignContacts.id)
          )
          .where(
            campaignFilter.length > 0
              ? eq(campaignContacts.campaignId, campaignFilter)
              : inArray(campaignContacts.campaignId, adminCampaignIds as string[])
          )
          .then((r) => r[0]?.value ?? 0)
      : Promise.resolve(0),

    // prevCallsCount
    hasCampaigns
      ? db
          .select({ value: count(callResults.id) })
          .from(callResults)
          .where(and(...prevConditions))
          .then((r) => r[0]?.value ?? 0)
      : Promise.resolve(0),

    // monthlyCallsResult
    hasCampaigns
      ? needsContactsJoin
        ? db
            .select({
              month: sql<string>`to_char(date_trunc('month', ${callResults.createdAt}), 'YYYY-MM')`,
              value: count(callResults.id),
            })
            .from(callResults)
            .innerJoin(contacts, eq(callResults.contactId, contacts.id))
            .where(callWhereClause)
            .groupBy(sql`date_trunc('month', ${callResults.createdAt})`)
            .orderBy(sql`date_trunc('month', ${callResults.createdAt}) asc`)
        : db
            .select({
              month: sql<string>`to_char(date_trunc('month', ${callResults.createdAt}), 'YYYY-MM')`,
              value: count(callResults.id),
            })
            .from(callResults)
            .where(callWhereClause)
            .groupBy(sql`date_trunc('month', ${callResults.createdAt})`)
            .orderBy(sql`date_trunc('month', ${callResults.createdAt}) asc`)
      : Promise.resolve([]),

    // topAgents
    hasCampaigns
      ? db
          .select({
            agentId: callResults.agentId,
            agentName: users.fullName,
            totalCalls: count(callResults.id),
            whatsappCalls: sql<number>`count(case when ${callResults.isWhatsappRedirected} then 1 end)`,
          })
          .from(callResults)
          .innerJoin(users, eq(callResults.agentId, users.id))
          .where(
            and(
              inArray(callResults.campaignId, adminCampaignIds as string[]),
              gte(callResults.createdAt, dateFrom),
              lte(callResults.createdAt, dateTo)
            )
          )
          .groupBy(callResults.agentId, users.fullName)
          .orderBy(desc(count(callResults.id)))
          .limit(5)
      : Promise.resolve([]),

    // monthlyByOutcome
    hasCampaigns
      ? db
          .select({
            month: sql<string>`to_char(date_trunc('month', ${callResults.createdAt}), 'YYYY-MM')`,
            outcome: callResults.outcome,
            isWhatsapp: callResults.isWhatsappRedirected,
            value: count(callResults.id),
          })
          .from(callResults)
          .where(callWhereClause)
          .groupBy(
            sql`date_trunc('month', ${callResults.createdAt})`,
            callResults.outcome,
            callResults.isWhatsappRedirected
          )
          .orderBy(sql`date_trunc('month', ${callResults.createdAt}) asc`)
      : Promise.resolve([]),

    // campaignRows
    currentCampaign
      ? db
          .select({
            ccId: campaignContacts.id,
            firstName: contacts.firstName,
            lastName: contacts.lastName,
            phonePrimary: contacts.phonePrimary,
            schoolName: contacts.schoolName,
            assignmentStatus: agentContactAssignments.status,
            agentName: users.fullName,
          })
          .from(campaignContacts)
          .innerJoin(contacts, eq(campaignContacts.contactId, contacts.id))
          .leftJoin(
            agentContactAssignments,
            eq(agentContactAssignments.campaignContactId, campaignContacts.id)
          )
          .leftJoin(users, eq(agentContactAssignments.agentId, users.id))
          .where(eq(campaignContacts.campaignId, currentCampaign.id))
          .orderBy(asc(campaignContacts.createdAt))
          .limit(8)
      : Promise.resolve([]),
  ])

  const falseRate =
    totalCallsCount === 0 ? 0 : Math.round((falseNumbersCount / totalCallsCount) * 100)
  const whatsappRate =
    totalCallsCount === 0 ? 0 : Math.round((whatsappCount / totalCallsCount) * 100)
  const notInterestedRate =
    totalCallsCount === 0 ? 0 : Math.round((notInterestedCount / totalCallsCount) * 100)

  const callCompletionRate =
    assignedContactsCount === 0
      ? 0
      : Math.min(100, Math.round((totalCallsCount / assignedContactsCount) * 100))

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

  // Build per-outcome monthly maps
  const monthlyFalseMap = new Map<string, number>()
  const monthlyWhatsappMap = new Map<string, number>()
  const monthlyNotInterestedMap = new Map<string, number>()
  for (const row of monthlyByOutcome) {
    const m = row.month as string
    if (row.outcome === 'false_number')
      monthlyFalseMap.set(m, (monthlyFalseMap.get(m) ?? 0) + row.value)
    if (row.isWhatsapp) monthlyWhatsappMap.set(m, (monthlyWhatsappMap.get(m) ?? 0) + row.value)
    if (row.outcome === 'not_interested')
      monthlyNotInterestedMap.set(m, (monthlyNotInterestedMap.get(m) ?? 0) + row.value)
  }

  const falseValues = curvePoints.map((_, idx) => {
    const key = new Date(Date.UTC(dateFrom.getUTCFullYear(), dateFrom.getUTCMonth() + idx, 1))
      .toISOString()
      .slice(0, 7)
    return monthlyFalseMap.get(key) ?? 0
  })
  const whatsappValues = curvePoints.map((_, idx) => {
    const key = new Date(Date.UTC(dateFrom.getUTCFullYear(), dateFrom.getUTCMonth() + idx, 1))
      .toISOString()
      .slice(0, 7)
    return monthlyWhatsappMap.get(key) ?? 0
  })
  const notInterestedValues = curvePoints.map((_, idx) => {
    const key = new Date(Date.UTC(dateFrom.getUTCFullYear(), dateFrom.getUTCMonth() + idx, 1))
      .toISOString()
      .slice(0, 7)
    return monthlyNotInterestedMap.get(key) ?? 0
  })
  const multiChartMax = Math.max(...falseValues, ...whatsappValues, ...notInterestedValues, 1)
  const { linePath: falseLine } = buildAreaPath({
    values: falseValues,
    maxValue: multiChartMax,
    w: 500,
    h: 140,
  })
  const { linePath: whatsappLine } = buildAreaPath({
    values: whatsappValues,
    maxValue: multiChartMax,
    w: 500,
    h: 140,
  })
  const { linePath: notInterestedLine } = buildAreaPath({
    values: notInterestedValues,
    maxValue: multiChartMax,
    w: 500,
    h: 140,
  })

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
      gradient: 'from-rose-400 to-rose-500',
      n: falseNumbersCount,
      badge: `${falseRate}%`,
    },
    {
      label: 'WhatsApp envoyés',
      value: `${whatsappCount}`,
      gradient: 'from-emerald-400 to-emerald-500',
      n: whatsappCount,
      badge: `${whatsappRate}%`,
    },
    {
      label: "Taux d'appels",
      value: `${callCompletionRate}%`,
      gradient: 'from-amber-400 to-orange-400',
      n: callCompletionRate,
      badge: `${totalCallsCount}/${assignedContactsCount}`,
    },
  ]

  const donutTotal = Math.max(1, totalCallsCount)
  const othersCount = Math.max(
    0,
    totalCallsCount - falseNumbersCount - whatsappCount - notInterestedCount
  )
  const donutSegments = [
    { percent: Math.round((othersCount / donutTotal) * 100), color: '#244976', label: 'Autres' },
    { percent: falseRate, color: '#ef4444', label: 'Faux n°' },
    { percent: whatsappRate, color: '#22c55e', label: 'Absent WA' },
    { percent: notInterestedRate, color: '#f59e0b', label: 'Pas intéressé' },
  ]

  const selectedCampaignTitle =
    campaignFilter.length > 0
      ? (campaignOptions.find((c) => c.id === campaignFilter)?.title ?? 'Campagne')
      : 'Toutes mes campagnes'

  const currentUrl = new URL('http://x/dashboard/admin')
  if (campaignFilter.length > 0) currentUrl.searchParams.set('campaign', campaignFilter)
  if (dateFromStr) currentUrl.searchParams.set('from', dateFromStr)
  if (dateToStr) currentUrl.searchParams.set('to', dateToStr)
  const baseFilterUrl = currentUrl.search

  return (
    <div className="space-y-6">
      {/* ── Hero banner ── */}
      <div className="relative rounded-2xl">
        {/* Background image + overlay in their own overflow-hidden wrapper so the
            outer container stays overflow-visible and CampaignSelect dropdowns escape */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl"
          style={{
            backgroundImage: "url('/lbs.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a3354]/90 via-[#244976]/80 to-[#1a3354]/60" />
        </div>

        <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10">
          {/* eyebrow */}
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
            <Sparkles className="size-3.5" />
            LBS Call Center
          </div>

          {/* title */}
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Performance &amp; engagement
          </h1>
          <p className="mt-1 max-w-xl text-sm text-white/70">
            Recherchez, triez et identifiez instantanément les profils les plus performants et les
            plus investis.
          </p>

          {/* filters */}
          <div className="mt-6 space-y-3">
            <AdminDashboardFilters
              campaigns={campaignOptions}
              currentCampaign={campaignFilter}
              currentFrom={dateFromStr}
              currentTo={dateToStr}
              hero
            />

            {/* School filter chips */}
            {schoolOptions.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-white/60">Établissement :</span>
                <a
                  href={`/dashboard/admin${baseFilterUrl}`}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    schoolFilter.length === 0
                      ? 'border-white bg-white/20 text-white'
                      : 'border-white/30 text-white/70 hover:border-white hover:text-white'
                  }`}
                >
                  Tous
                </a>
                {schoolOptions.map((s) =>
                  s.schoolName ? (
                    <a
                      key={s.schoolName}
                      href={`/dashboard/admin${baseFilterUrl}&school=${encodeURIComponent(s.schoolName)}`}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        schoolFilter === s.schoolName
                          ? 'border-white bg-white/20 text-white'
                          : 'border-white/30 text-white/70 hover:border-white hover:text-white'
                      }`}
                    >
                      {s.schoolName}
                    </a>
                  ) : null
                )}
              </div>
            ) : null}

            {/* Active filter banner */}
            {campaignFilter.length > 0 || schoolFilter.length > 0 ? (
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm">
                <Filter className="size-3.5 shrink-0" />
                {campaignFilter.length > 0 ? (
                  <>
                    <span className="opacity-70">Campagne :</span>{' '}
                    <span className="font-medium">{selectedCampaignTitle}</span>
                  </>
                ) : null}
                {schoolFilter.length > 0 ? (
                  <>
                    <span className="ml-2 opacity-70">École :</span>{' '}
                    <span className="font-medium">{schoolFilter}</span>
                  </>
                ) : null}
                <a
                  href="/dashboard/admin"
                  className="ml-4 text-xs underline opacity-60 hover:opacity-100"
                >
                  Réinitialiser
                </a>
              </div>
            ) : null}
          </div>

          {/* period hint */}
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
            label: 'Campagnes actives',
            value: activeCampaignsCount,
            icon: <Megaphone className="size-4 text-blue-400" />,
            hint: 'Créées par vous',
          },
          {
            label: 'Contacts importés',
            value: myContactsCount,
            icon: <Contact className="size-4 text-emerald-400" />,
            hint: selectedCampaignTitle,
          },
          {
            label: 'Agents actifs',
            value: myAgentsCount,
            icon: <Users className="size-4 text-violet-400" />,
            hint: 'Sous votre gestion',
          },
          {
            label: "Volume d'appels",
            value: totalCallsCount,
            icon: <Phone className="size-4 text-amber-400" />,
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

      {/* Multi-series line chart + donut */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm lg:col-span-2 dark:border-white/10 dark:bg-[#1a2332]">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Évolution des appels — {selectedCampaignTitle}
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                {totalCallsCount} appels
              </p>
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
              {callsTrend}% vs période préc.
            </span>
          </div>
          <div className="mb-2 flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-5 rounded-full bg-rose-500" />
              Faux numéro
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-5 rounded-full bg-emerald-500" />
              Absent WhatsApp
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-5 rounded-full bg-amber-500" />
              Pas intéressé
            </span>
          </div>
          <svg viewBox="0 0 500 140" className="h-36 w-full" preserveAspectRatio="none">
            {falseLine.length > 0 ? (
              <path
                d={falseLine}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            {whatsappLine.length > 0 ? (
              <path
                d={whatsappLine}
                fill="none"
                stroke="#22c55e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
            {notInterestedLine.length > 0 ? (
              <path
                d={notInterestedLine}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </svg>
          <div className="mt-1 flex justify-between text-[11px] text-zinc-400">
            {curvePoints.map((p) => (
              <span key={p.label}>{p.label}</span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <p className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Répartition des résultats
          </p>
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 120 120" className="size-32">
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
                      key={seg.label}
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
            </svg>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            {donutSegments.map((seg) => (
              <div key={seg.label}>
                <p className="text-base font-bold text-zinc-900 dark:text-white">{seg.percent}%</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="size-2 rounded-full" style={{ background: seg.color }} />
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{seg.label}</p>
                </div>
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

      {/* Top Agents + Recent Agents */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Agents */}
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-white">
            <Trophy className="size-4 text-amber-400" />
            Top Agents
          </h3>
          {topAgents.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-400">Aucun appel enregistré.</p>
          ) : (
            <div className="space-y-3">
              {topAgents.map((agent, idx) => (
                <div key={agent.agentId} className="flex items-center gap-3">
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      idx === 0
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                        : idx === 1
                          ? 'bg-zinc-100 text-zinc-600 dark:bg-white/10 dark:text-zinc-300'
                          : 'bg-zinc-50 text-zinc-500 dark:bg-white/5 dark:text-zinc-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-semibold text-white">
                    {agent.agentName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800 dark:text-white">
                      {agent.agentName}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {agent.totalCalls} appels
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    {extractCount({ value: agent.whatsappCalls })} WA
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Agents */}
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-white">
            <Sparkles className="size-4 text-amber-400" />
            Agents récents
          </h3>
          {recentAgents.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-400">
              Aucun agent créé pour le moment.
            </p>
          ) : (
            <div className="space-y-4">
              {recentAgents.map((agent, idx) => (
                <div key={agent.id} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-semibold text-white">
                      {agent.fullName.charAt(0).toUpperCase()}
                    </div>
                    {idx === 0 ? (
                      <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-400 dark:border-[#1a2332]" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800 dark:text-white">
                      {agent.fullName}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {agent.email}
                    </p>
                  </div>
                  <p className="shrink-0 text-[11px] text-zinc-400">
                    {formatTimeAgo({ date: agent.createdAt })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Campagne en cours */}
      <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-white">
            <Contact className="size-4 text-blue-400" />
            {currentCampaign ? (
              <>
                Campagne en cours
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  {currentCampaign.title}
                </span>
              </>
            ) : (
              'Campagne en cours'
            )}
          </h3>
          <Link
            href="/dashboard/admin/contacts"
            className="text-xs text-[#244976] hover:underline dark:text-blue-300"
          >
            Voir tous →
          </Link>
        </div>
        {campaignRows.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">
            Aucun contact dans cette campagne.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs font-medium text-zinc-500 uppercase dark:border-white/10">
                  <th className="px-3 py-2">Nom</th>
                  <th className="px-3 py-2">École</th>
                  <th className="px-3 py-2">Téléphone</th>
                  <th className="px-3 py-2">Agent</th>
                  <th className="px-3 py-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {campaignRows.map((c) => (
                  <tr
                    key={c.ccId}
                    className="border-b border-zinc-100 transition hover:bg-zinc-50 dark:border-white/5 dark:hover:bg-white/5"
                  >
                    <td className="px-3 py-3 font-medium text-zinc-800 dark:text-white">
                      {c.firstName} {c.lastName ?? ''}
                    </td>
                    <td className="px-3 py-3 text-zinc-500 dark:text-zinc-400">
                      {c.schoolName ?? '—'}
                    </td>
                    <td className="px-3 py-3 text-zinc-500 dark:text-zinc-400">{c.phonePrimary}</td>
                    <td className="px-3 py-3 text-zinc-500 dark:text-zinc-400">
                      {c.agentName ?? (
                        <span className="text-zinc-300 dark:text-zinc-600">Non assigné</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {c.assignmentStatus === 'completed' ? (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                          Traité
                        </span>
                      ) : c.assignmentStatus !== null ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                          En attente
                        </span>
                      ) : (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
                          Non assigné
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

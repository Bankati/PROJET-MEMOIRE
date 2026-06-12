/**
 * Page principale du dashboard agent.
 * KPI personnels (appels effectués, faux numéros, WhatsApp, durée moyenne).
 * L'agent ne voit que ses propres données et performances.
 */
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Contact,
  Percent,
  Phone,
  PhoneMissed,
  Send,
  Sparkles,
  Target,
} from 'lucide-react'
import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm'
import Link from 'next/link'

import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import {
  agentContactAssignments,
  callResults,
  campaignContacts,
  campaigns,
  contacts,
} from '@/db/schema'

type CurvePoint = Readonly<{ label: string; calls: number }>

const buildCurvePoints = ({
  dailyCalls,
  days,
}: Readonly<{
  dailyCalls: ReadonlyMap<string, number>
  days: number
}>): readonly CurvePoint[] => {
  const points: CurvePoint[] = []
  const now: Date = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d: Date = new Date(now)
    d.setDate(d.getDate() - i)
    const key: string = d.toISOString().slice(0, 10)
    const label: string = d.toLocaleDateString('fr-FR', { weekday: 'short' })
    points.push({ label, calls: dailyCalls.get(key) ?? 0 })
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
  if (values.length === 0) {
    return { linePath: '', areaPath: '' }
  }
  const safe: number = Math.max(1, maxValue)
  const pts: string[] = values.map((v, i) => {
    const x: number = values.length === 1 ? w / 2 : (i / (values.length - 1)) * w
    const y: number = h - (v / safe) * h
    return `${x},${y}`
  })
  const line: string = `M ${pts.join(' L ')}`
  return {
    linePath: line,
    areaPath: `${line} L ${pts[pts.length - 1].split(',')[0]},${h} L ${pts[0].split(',')[0]},${h} Z`,
  }
}

const buildSparkline = ({ n }: Readonly<{ n: number }>): string => {
  const p: readonly number[] = [n * 0.3, n * 0.5, n * 0.4, n * 0.7, n * 0.6, n * 0.9, n]
  const mx: number = Math.max(...p, 1)
  return p.map((v, i) => `${(i / (p.length - 1)) * 100},${40 - (v / mx) * 35}`).join(' ')
}

export default async function AgentDashboardPage(): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ['agent'] })
  const now: Date = new Date()
  const sevenDaysAgo: Date = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const fourteenDaysAgo: Date = new Date(now)
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  const assignedContactsResult: Array<{ value: number }> = await db
    .select({ value: count(agentContactAssignments.id) })
    .from(agentContactAssignments)
    .where(eq(agentContactAssignments.agentId, user.id))
  const assignedContactsCount: number = assignedContactsResult[0]?.value ?? 0

  const pendingContactsResult: Array<{ value: number }> = await db
    .select({ value: count(agentContactAssignments.id) })
    .from(agentContactAssignments)
    .where(
      and(
        eq(agentContactAssignments.agentId, user.id),
        eq(agentContactAssignments.status, 'pending')
      )
    )
  const pendingContactsCount: number = pendingContactsResult[0]?.value ?? 0

  const completedContactsResult: Array<{ value: number }> = await db
    .select({ value: count(agentContactAssignments.id) })
    .from(agentContactAssignments)
    .where(
      and(
        eq(agentContactAssignments.agentId, user.id),
        eq(agentContactAssignments.status, 'completed')
      )
    )
  const completedContactsCount: number = completedContactsResult[0]?.value ?? 0

  const totalCallsResult: Array<{ value: number }> = await db
    .select({ value: count(callResults.id) })
    .from(callResults)
    .where(and(eq(callResults.agentId, user.id), gte(callResults.createdAt, sevenDaysAgo)))
  const totalCallsCount: number = totalCallsResult[0]?.value ?? 0

  const prevCallsResult: Array<{ value: number }> = await db
    .select({ value: count(callResults.id) })
    .from(callResults)
    .where(
      and(
        eq(callResults.agentId, user.id),
        gte(callResults.createdAt, fourteenDaysAgo),
        lte(callResults.createdAt, sevenDaysAgo)
      )
    )
  const prevCallsCount: number = prevCallsResult[0]?.value ?? 0
  const callsTrend: number =
    prevCallsCount === 0
      ? totalCallsCount > 0
        ? 100
        : 0
      : Math.round(((totalCallsCount - prevCallsCount) / prevCallsCount) * 100)

  const falseNumbersResult: Array<{ value: number }> = await db
    .select({ value: count(callResults.id) })
    .from(callResults)
    .where(
      and(
        eq(callResults.agentId, user.id),
        eq(callResults.outcome, 'false_number'),
        gte(callResults.createdAt, sevenDaysAgo)
      )
    )
  const falseNumbersCount: number = falseNumbersResult[0]?.value ?? 0

  const whatsappResult: Array<{ value: number }> = await db
    .select({ value: count(callResults.id) })
    .from(callResults)
    .where(
      and(
        eq(callResults.agentId, user.id),
        eq(callResults.isWhatsappRedirected, true),
        gte(callResults.createdAt, sevenDaysAgo)
      )
    )
  const whatsappCount: number = whatsappResult[0]?.value ?? 0

  const callRate: number =
    assignedContactsCount > 0
      ? Math.round((completedContactsCount / assignedContactsCount) * 100)
      : 0

  const falseRate: number =
    totalCallsCount === 0 ? 0 : Math.round((falseNumbersCount / totalCallsCount) * 100)
  const whatsappRate: number =
    totalCallsCount === 0 ? 0 : Math.round((whatsappCount / totalCallsCount) * 100)

  const dailyCallsResult: Array<{ day: string | null; value: number }> = await db
    .select({
      day: sql<string>`to_char(${callResults.createdAt}, 'YYYY-MM-DD')`,
      value: count(callResults.id),
    })
    .from(callResults)
    .where(and(eq(callResults.agentId, user.id), gte(callResults.createdAt, sevenDaysAgo)))
    .groupBy(sql`to_char(${callResults.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${callResults.createdAt}, 'YYYY-MM-DD') asc`)
  const dailyMap: ReadonlyMap<string, number> = new Map(
    dailyCallsResult.filter((e) => typeof e.day === 'string').map((e) => [e.day as string, e.value])
  )
  const curvePoints: readonly CurvePoint[] = buildCurvePoints({ dailyCalls: dailyMap, days: 7 })
  const callValues: readonly number[] = curvePoints.map((p) => p.calls)
  const chartMax: number = Math.max(...callValues, 1)
  const { linePath, areaPath } = buildAreaPath({
    values: callValues,
    maxValue: chartMax,
    w: 500,
    h: 160,
  })

  const recentContacts = await db
    .select({
      assignmentId: agentContactAssignments.id,
      ccId: agentContactAssignments.campaignContactId,
      status: agentContactAssignments.status,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      phonePrimary: contacts.phonePrimary,
      schoolName: contacts.schoolName,
      campaignTitle: campaigns.title,
    })
    .from(agentContactAssignments)
    .innerJoin(campaignContacts, eq(agentContactAssignments.campaignContactId, campaignContacts.id))
    .innerJoin(contacts, eq(campaignContacts.contactId, contacts.id))
    .innerJoin(campaigns, eq(campaignContacts.campaignId, campaigns.id))
    .where(eq(agentContactAssignments.agentId, user.id))
    .orderBy(desc(agentContactAssignments.assignedAt))
    .limit(5)

  const statCards: readonly {
    label: string
    value: string
    gradient: string
    n: number
    badge: string
  }[] = [
    {
      label: 'Appels effectués',
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
      value: `${callRate}%`,
      gradient: 'from-violet-500 to-purple-600',
      n: callRate,
      badge: `${completedContactsCount}/${assignedContactsCount}`,
    },
  ]

  const donutTotal: number = Math.max(1, totalCallsCount)
  const normalCount: number = totalCallsCount - falseNumbersCount - whatsappCount
  const donutSegments: readonly { percent: number; color: string; label: string }[] = [
    {
      percent: Math.round((Math.max(0, normalCount) / donutTotal) * 100),
      color: '#244976',
      label: 'Normaux',
    },
    { percent: falseRate, color: '#ef4444', label: 'Faux n°' },
    { percent: whatsappRate, color: '#22c55e', label: 'WhatsApp' },
  ]

  return (
    <div className="space-y-6">
      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/agent.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a3354] via-[#244976]/90 to-transparent" />
        </div>
        <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm">
            <Sparkles className="size-3.5" />
            LBS Call Center — Espace agent
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Performance &amp; engagement
          </h1>
          <p className="mt-1 max-w-xl text-sm text-white/70">
            Suivez vos appels, vos contacts assignés et vos performances en temps réel.
          </p>
          <div className="mt-5 flex flex-wrap gap-4">
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
              <p className="text-[10px] font-medium tracking-wide text-white/60 uppercase">
                Appels cette semaine
              </p>
              <p className="mt-0.5 text-2xl font-bold text-white">{totalCallsCount}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
              <p className="text-[10px] font-medium tracking-wide text-white/60 uppercase">
                Contacts assignés
              </p>
              <p className="mt-0.5 text-2xl font-bold text-white">{assignedContactsCount}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
              <p className="text-[10px] font-medium tracking-wide text-white/60 uppercase">
                Taux d&apos;appels
              </p>
              <p className="mt-0.5 text-2xl font-bold text-white">{callRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Contacts assignés',
            value: assignedContactsCount,
            icon: <Contact className="size-4 text-blue-400" />,
            hint: 'Total attribués',
          },
          {
            label: 'En attente',
            value: pendingContactsCount,
            icon: <Target className="size-4 text-amber-400" />,
            hint: 'À traiter',
          },
          {
            label: 'Traités',
            value: completedContactsCount,
            icon: <CheckCircle2 className="size-4 text-emerald-400" />,
            hint: 'Appels finalisés',
          },
          {
            label: 'Appels (7j)',
            value: totalCallsCount,
            icon: <Phone className="size-4 text-violet-400" />,
            hint: 'Cette semaine',
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
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm lg:col-span-2 dark:border-white/10 dark:bg-[#1a2332]">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                Mes appels — 7 derniers jours
              </p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{totalCallsCount}</p>
            </div>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                callsTrend >= 0
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
              }`}
            >
              {callsTrend >= 0 ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {callsTrend >= 0 ? '+' : ''}
              {callsTrend}% vs semaine précédente
            </span>
          </div>
          <svg viewBox="0 0 500 160" className="h-40 w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="agentAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#244976" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#244976" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {areaPath.length > 0 ? (
              <>
                <path d={areaPath} fill="url(#agentAreaGrad)" />
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
            {curvePoints.map((p, i) => (
              <span key={i}>{p.label}</span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <p className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Répartition des appels
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
                let offset: number = 0
                return donutSegments.map((seg) => {
                  const circ: number = 2 * Math.PI * 50
                  const dash: number = (seg.percent / 100) * circ
                  const off: number = -offset * (circ / 100)
                  const el: React.JSX.Element = (
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
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            {donutSegments.map((seg) => (
              <div key={seg.label}>
                <p className="text-lg font-bold text-zinc-900 dark:text-white">{seg.percent}%</p>
                <div className="flex items-center justify-center gap-1">
                  <span className="size-2 rounded-full" style={{ background: seg.color }} />
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{seg.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
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
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-white">
              <Contact className="size-4 text-blue-400" />
              Contacts récents
            </h3>
            <Link
              href="/dashboard/agent/contacts"
              className="text-lbs-blue text-xs hover:underline dark:text-blue-300"
            >
              Voir tous
            </Link>
          </div>
          {recentContacts.length === 0 ? (
            <p className="py-6 text-center text-sm text-zinc-400">
              Aucun contact assigné pour le moment.
            </p>
          ) : (
            <div className="space-y-3">
              {recentContacts.map((c) => (
                <Link
                  key={c.assignmentId}
                  href={`/dashboard/agent/contacts/${c.ccId}`}
                  className="hover:border-lbs-blue/30 flex items-center gap-3 rounded-xl border border-zinc-100 p-3 transition hover:bg-zinc-50 dark:border-white/5 dark:hover:border-blue-500/30 dark:hover:bg-white/5"
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-semibold text-white">
                    {c.firstName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-800 dark:text-white">
                      {c.firstName} {c.lastName ?? ''}
                    </p>
                    <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {c.schoolName ?? c.phonePrimary}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.status === 'completed' ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        Traité
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                        En attente
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <h3 className="mb-4 text-sm font-semibold text-zinc-800 dark:text-white">
            Indicateurs clés
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs text-zinc-500 uppercase dark:border-white/10">
                  <th className="px-2 py-2">Indicateur</th>
                  <th className="px-2 py-2">Valeur</th>
                  <th className="px-2 py-2">Taux</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100 dark:border-white/5">
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-200">
                    <span className="inline-flex items-center gap-1.5">
                      <PhoneMissed className="size-3.5 text-rose-400" />
                      Faux numéros
                    </span>
                  </td>
                  <td className="px-2 py-3 font-semibold text-zinc-900 dark:text-white">
                    {falseNumbersCount}
                  </td>
                  <td className="px-2 py-3">
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                      {falseRate}%
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-zinc-100 dark:border-white/5">
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-200">
                    <span className="inline-flex items-center gap-1.5">
                      <Send className="size-3.5 text-emerald-400" />
                      WhatsApp
                    </span>
                  </td>
                  <td className="px-2 py-3 font-semibold text-zinc-900 dark:text-white">
                    {whatsappCount}
                  </td>
                  <td className="px-2 py-3">
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      {whatsappRate}%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-2 py-3 text-zinc-700 dark:text-zinc-200">
                    <span className="inline-flex items-center gap-1.5">
                      <Percent className="size-3.5 text-violet-500" />
                      Taux d&apos;appels
                    </span>
                  </td>
                  <td className="px-2 py-3 font-semibold text-zinc-900 dark:text-white">
                    {completedContactsCount}/{assignedContactsCount}
                  </td>
                  <td className="px-2 py-3">
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                      {callRate}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

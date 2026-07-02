/**
 * Page d'export pour l'administrateur.
 * Permet de générer un rapport PDF avec KPI, graphiques et mise en forme visuelle.
 * L'admin peut choisir la campagne et la période à exporter.
 */
import { BarChart3, Download, FileText, Phone, PhoneMissed, Send, Timer } from 'lucide-react'
import { and, count, desc, eq, gte, inArray, lte, or, sql } from 'drizzle-orm'

import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import { callResults, campaigns } from '@/db/schema'
import { extractCount, formatDuration, readParam } from '@/lib/dashboard-utils'

type SearchParams = Readonly<Record<string, string | string[] | undefined>>

const buildDefaultFrom = (): string => {
  const d: Date = new Date()
  d.setMonth(d.getMonth() - 3)
  return d.toISOString().slice(0, 10)
}

const buildDefaultTo = (): string => {
  return new Date().toISOString().slice(0, 10)
}

export default async function AdminExportPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>
}>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ['admin'] })
  const sp: SearchParams = (await searchParams) ?? {}
  const campaignFilter: string = readParam({ sp, key: 'campaign' })
  const dateFromStr: string = readParam({ sp, key: 'from' }) || buildDefaultFrom()
  const dateToStr: string = readParam({ sp, key: 'to' }) || buildDefaultTo()
  const dateFrom: Date = new Date(dateFromStr)
  const dateTo: Date = new Date(dateToStr + 'T23:59:59.999Z')
  const myCampaigns = await db
    .select({ id: campaigns.id, title: campaigns.title })
    .from(campaigns)
    .where(or(eq(campaigns.createdByAdminId, user.id), eq(campaigns.visibility, 'public')))
    .orderBy(desc(campaigns.createdAt))
  const myCampaignIds: string[] = myCampaigns.map((c) => c.id)
  const hasCampaigns: boolean = myCampaignIds.length > 0
  const callConditions: ReturnType<typeof and>[] = [
    gte(callResults.createdAt, dateFrom),
    lte(callResults.createdAt, dateTo),
  ]
  if (campaignFilter.length > 0) {
    callConditions.push(eq(callResults.campaignId, campaignFilter))
  } else if (hasCampaigns) {
    callConditions.push(inArray(callResults.campaignId, myCampaignIds))
  }
  const callWhereClause = and(...callConditions)
  const totalCallsResult: Array<{ value: number }> = hasCampaigns
    ? await db
        .select({ value: count(callResults.id) })
        .from(callResults)
        .where(callWhereClause)
    : [{ value: 0 }]
  const totalCallsCount: number = totalCallsResult[0]?.value ?? 0
  const falseNumbersResult: Array<{ value: number }> = hasCampaigns
    ? await db
        .select({ value: count(callResults.id) })
        .from(callResults)
        .where(and(callWhereClause, eq(callResults.outcome, 'false_number')))
    : [{ value: 0 }]
  const falseNumbersCount: number = falseNumbersResult[0]?.value ?? 0
  const whatsappResult: Array<{ value: number }> = hasCampaigns
    ? await db
        .select({ value: count(callResults.id) })
        .from(callResults)
        .where(and(callWhereClause, eq(callResults.isWhatsappRedirected, true)))
    : [{ value: 0 }]
  const whatsappCount: number = whatsappResult[0]?.value ?? 0
  const avgDurationResult: Array<{ value: number | string | null }> = hasCampaigns
    ? await db
        .select({
          value: sql<number>`coalesce(round(avg(${callResults.durationSeconds})::numeric, 0), 0)`,
        })
        .from(callResults)
        .where(callWhereClause)
    : [{ value: 0 }]
  const avgDuration: number = extractCount({ value: avgDurationResult[0]?.value ?? 0 })
  const falseRate: number =
    totalCallsCount === 0 ? 0 : Math.round((falseNumbersCount / totalCallsCount) * 100)
  const whatsappRate: number =
    totalCallsCount === 0 ? 0 : Math.round((whatsappCount / totalCallsCount) * 100)
  const selectedTitle: string =
    campaignFilter.length > 0
      ? (myCampaigns.find((c) => c.id === campaignFilter)?.title ?? 'Campagne')
      : 'Toutes mes campagnes'
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Export</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Générez un rapport PDF de vos performances
        </p>
      </div>
      <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <form className="grid items-end gap-3 sm:grid-cols-2 md:grid-cols-4">
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
            Prévisualiser
          </button>
        </form>
      </div>
      <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#1a2332]">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-800 sm:text-lg dark:text-white">
              Rapport — {selectedTitle}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Période : {dateFromStr} au {dateToStr}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110 sm:w-auto"
          >
            <Download className="size-4" />
            Télécharger PDF
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-100 p-4 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Phone className="size-4 text-blue-400" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Total appels</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
              {totalCallsCount}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-100 p-4 dark:border-white/10">
            <div className="flex items-center gap-2">
              <PhoneMissed className="size-4 text-rose-400" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Faux numéros</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
              {falseNumbersCount}
            </p>
            <p className="mt-0.5 text-xs text-zinc-400">{falseRate}%</p>
          </div>
          <div className="rounded-xl border border-zinc-100 p-4 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Send className="size-4 text-emerald-400" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">WhatsApp</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">{whatsappCount}</p>
            <p className="mt-0.5 text-xs text-zinc-400">{whatsappRate}%</p>
          </div>
          <div className="rounded-xl border border-zinc-100 p-4 dark:border-white/10">
            <div className="flex items-center gap-2">
              <Timer className="size-4 text-amber-400" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Durée moyenne</p>
            </div>
            <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
              {formatDuration({ seconds: avgDuration })}
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-zinc-100 p-4 text-center dark:border-white/10">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Appels normaux</p>
            <p className="text-lbs-blue mt-1 text-3xl font-bold">
              {Math.max(0, totalCallsCount - falseNumbersCount - whatsappCount)}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-100 p-4 text-center dark:border-white/10">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              Taux de faux numéros
            </p>
            <p className="mt-1 text-3xl font-bold text-rose-500">{falseRate}%</p>
          </div>
          <div className="rounded-xl border border-zinc-100 p-4 text-center dark:border-white/10">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">Taux WhatsApp</p>
            <p className="mt-1 text-3xl font-bold text-emerald-500">{whatsappRate}%</p>
          </div>
        </div>
        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-white/15">
          <FileText className="mx-auto mb-3 size-10 text-zinc-300 dark:text-zinc-600" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Le rapport PDF sera généré avec ces données.
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            Le fichier inclura les KPI, graphiques et la mise en forme visuelle complète.
          </p>
        </div>
      </div>
    </div>
  )
}

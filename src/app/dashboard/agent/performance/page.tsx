import { and, desc, eq } from 'drizzle-orm'
import Link from 'next/link'
import { BarChart3, Calendar, Clock, Phone, Send } from 'lucide-react'

import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import { callResults, campaigns, contacts } from '@/db/schema'

type SearchParams = Readonly<Record<string, string | string[] | undefined>>

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

const formatDuration = (seconds: number): string => {
  if (seconds === 0) return '—'
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

export default async function AgentPerformancePage({
  searchParams,
}: Readonly<{ searchParams?: Promise<SearchParams> }>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ['agent'] })
  const sp: SearchParams = (await searchParams) ?? {}
  const campaignFilter = readParam({ sp, key: 'campaign' })

  const agentCampaigns = await db
    .selectDistinct({ id: campaigns.id, title: campaigns.title, createdAt: campaigns.createdAt })
    .from(callResults)
    .innerJoin(campaigns, eq(callResults.campaignId, campaigns.id))
    .where(eq(callResults.agentId, user.id))
    .orderBy(desc(campaigns.createdAt))

  const calls = await db
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
    .where(
      and(
        eq(callResults.agentId, user.id),
        campaignFilter.length > 0 ? eq(callResults.campaignId, campaignFilter) : undefined
      )
    )
    .orderBy(desc(callResults.createdAt))
    .limit(200)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Mes appels</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Historique détaillé de vos appels et commentaires
          </p>
        </div>
        <span className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500 dark:border-white/10 dark:bg-white/10 dark:text-zinc-400">
          {calls.length} appel{calls.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Filtre campagne */}
      <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <form className="flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="perf-campaign"
              className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400"
            >
              Campagne
            </label>
            <select
              id="perf-campaign"
              name="campaign"
              defaultValue={campaignFilter}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 outline-none dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
            >
              <option value="">Toutes mes campagnes</option>
              {agentCampaigns.map((c) => (
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
              href="/dashboard/agent/performance"
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
                : 'Vos appels apparaîtront ici une fois effectués.'}
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
              {/* En-tête */}
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

              {/* Méta */}
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

              {/* Commentaire */}
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

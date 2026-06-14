import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Info,
  ListChecks,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Star,
} from 'lucide-react'
import { and, count, eq, ne, sql } from 'drizzle-orm'

import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import {
  agentContactAssignments,
  callResults,
  campaignContacts,
  campaigns,
  contacts,
} from '@/db/schema'
import { CallCenterTabs } from '@/components/agent/call-center-tabs'
import { AgentCallPanel } from '@/components/agent/agent-call-panel'

type PageProps = Readonly<{ params: Promise<{ id: string }> }>

async function submitCallResult(formData: FormData): Promise<void> {
  'use server'
  const user = await requireRole({ allowedRoles: ['agent'] })
  const assignmentId = (formData.get('assignmentId') as string | null) ?? ''
  const campaignId = (formData.get('campaignId') as string | null) ?? ''
  const contactId = (formData.get('contactId') as string | null) ?? ''
  const dialedPhone = (formData.get('dialedPhone') as string | null) ?? ''
  const outcome = (formData.get('outcome') as string | null) ?? ''
  const durationSecondsStr = (formData.get('durationSeconds') as string | null) ?? '0'
  const notes = (formData.get('notes') as string | null) ?? ''
  const isWhatsappRedirected = formData.get('isWhatsappRedirected') === 'true'

  if (assignmentId.length === 0 || outcome.length === 0) {
    redirect(`/dashboard/agent/contacts?notice=missing_fields`)
    return
  }

  const durationSeconds = Math.max(0, parseInt(durationSecondsStr, 10) || 0)

  await db.insert(callResults).values({
    assignmentId,
    campaignId,
    contactId,
    agentId: user.id,
    dialedPhone,
    durationSeconds,
    outcome: outcome as
      | 'interested'
      | 'not_interested'
      | 'callback'
      | 'no_answer'
      | 'false_number'
      | 'whatsapp_follow_up'
      | 'other',
    notes: notes.trim().length > 0 ? notes.trim() : null,
    isWhatsappRedirected,
  })

  await db
    .update(agentContactAssignments)
    .set({ status: 'completed', completedAt: new Date() })
    .where(eq(agentContactAssignments.id, assignmentId))

  redirect('/dashboard/agent/contacts?notice=call_saved')
}

export default async function AgentContactDetailPage({
  params,
}: PageProps): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ['agent'] })
  const { id } = await params

  const assignment = await db
    .select({
      assignmentId: agentContactAssignments.id,
      ccId: agentContactAssignments.campaignContactId,
      status: agentContactAssignments.status,
      assignedAt: agentContactAssignments.assignedAt,
      contactId: contacts.id,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      phonePrimary: contacts.phonePrimary,
      phoneSecondary: contacts.phoneSecondary,
      email: contacts.email,
      schoolName: contacts.schoolName,
      desiredProgram: contacts.desiredProgram,
      city: contacts.city,
      campaignId: campaigns.id,
      campaignTitle: campaigns.title,
      campaignScript: campaigns.baseScript,
      campaignDetails: campaigns.details,
      pdfUrl: campaigns.pdfUrl,
    })
    .from(agentContactAssignments)
    .innerJoin(campaignContacts, eq(agentContactAssignments.campaignContactId, campaignContacts.id))
    .innerJoin(contacts, eq(campaignContacts.contactId, contacts.id))
    .innerJoin(campaigns, eq(campaignContacts.campaignId, campaigns.id))
    .where(
      and(
        eq(agentContactAssignments.campaignContactId, id),
        eq(agentContactAssignments.agentId, user.id)
      )
    )
    .limit(1)

  if (assignment.length === 0) notFound()

  const contact = assignment[0]
  const contactName = `${contact.firstName} ${contact.lastName ?? ''}`.trim()
  const isCompleted = contact.status === 'completed'

  // Récupération séparée des champs jsonb/enum pour éviter les erreurs Drizzle
  const [extraData] = await db
    .select({
      metadataText: sql<string | null>`cast(${contacts.metadata} as text)`,
      ccNotes: campaignContacts.notes,
    })
    .from(campaignContacts)
    .innerJoin(contacts, eq(campaignContacts.contactId, contacts.id))
    .innerJoin(
      agentContactAssignments,
      eq(agentContactAssignments.campaignContactId, campaignContacts.id)
    )
    .where(and(eq(campaignContacts.id, id), eq(agentContactAssignments.agentId, user.id)))
    .limit(1)

  const contactMetadata: Record<string, unknown> = extraData?.metadataText
    ? JSON.parse(extraData.metadataText)
    : {}
  const contactCcNotes = extraData?.ccNotes ?? null

  const dynamicScript = contact.campaignScript
    .replace(/\{prénom\}/gi, contact.firstName)
    .replace(/\{nom\}/gi, contact.lastName ?? '')
    .replace(/\{école\}/gi, contact.schoolName ?? 'votre établissement')
    .replace(/\{ville\}/gi, contact.city ?? 'votre ville')
    .replace(/\{filière\}/gi, contact.desiredProgram ?? 'votre filière souhaitée')

  // Progress for this agent in this campaign
  const progressResult = await db
    .select({
      total: count(agentContactAssignments.id),
      completed: sql<number>`count(case when ${agentContactAssignments.status} = 'completed' then 1 end)`,
    })
    .from(agentContactAssignments)
    .innerJoin(campaignContacts, eq(agentContactAssignments.campaignContactId, campaignContacts.id))
    .where(
      and(
        eq(agentContactAssignments.agentId, user.id),
        eq(campaignContacts.campaignId, contact.campaignId)
      )
    )

  const progress = progressResult[0] ?? { total: 0, completed: 0 }
  const totalNum = typeof progress.total === 'number' ? progress.total : Number(progress.total)
  const completedNum =
    typeof progress.completed === 'number' ? progress.completed : Number(progress.completed)
  const progressPct = totalNum === 0 ? 0 : Math.round((completedNum / totalNum) * 100)

  // Next contacts in queue
  const queueContacts = await db
    .select({
      ccId: agentContactAssignments.campaignContactId,
      firstName: contacts.firstName,
      lastName: contacts.lastName,
      schoolName: contacts.schoolName,
    })
    .from(agentContactAssignments)
    .innerJoin(campaignContacts, eq(agentContactAssignments.campaignContactId, campaignContacts.id))
    .innerJoin(contacts, eq(campaignContacts.contactId, contacts.id))
    .where(
      and(
        eq(agentContactAssignments.agentId, user.id),
        eq(campaignContacts.campaignId, contact.campaignId),
        eq(agentContactAssignments.status, 'pending'),
        ne(agentContactAssignments.campaignContactId, id)
      )
    )
    .limit(5)

  const assignedDate = contact.assignedAt.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-2 sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard/agent/contacts"
            className="grid size-9 shrink-0 place-items-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/10"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-zinc-900 sm:text-xl dark:text-white">
              {contactName}
            </h1>
            <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
              {contact.campaignTitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <CheckCircle2 className="size-3.5" /> Traité
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              En attente
            </span>
          )}
          <a
            href={`tel:${contact.phonePrimary}`}
            className="border-lbs-blue/30 bg-lbs-blue/5 text-lbs-blue hover:bg-lbs-blue inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium transition hover:text-white dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300"
          >
            <Phone className="size-4" /> Appeler
          </a>
          <a
            href={`https://wa.me/${contact.phonePrimary.replace(/[\s+]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
          >
            <MessageCircle className="size-4" /> WhatsApp
          </a>
        </div>
      </div>

      {/* 3-panel layout */}
      <div className="grid gap-4 lg:grid-cols-[260px_1fr_300px]">
        {/* ── LEFT PANEL ── */}
        <div className="flex flex-col gap-4">
          {/* Campaign + progress */}
          <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
                Campagne active
              </p>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <p className="font-bold text-zinc-800 dark:text-white">{contact.campaignTitle}</p>
            {contact.campaignDetails ? (
              <p className="mt-1 line-clamp-2 text-xs text-zinc-400 dark:text-zinc-500">
                {contact.campaignDetails}
              </p>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-zinc-50 px-3 py-2 dark:bg-white/5">
                <div className="flex items-center gap-1 text-[10px] tracking-wider text-zinc-400 uppercase">
                  <CalendarDays className="size-3" /> Date
                </div>
                <p className="mt-0.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                  {assignedDate}
                </p>
              </div>
              <div className="rounded-xl bg-zinc-50 px-3 py-2 dark:bg-white/5">
                <div className="flex items-center gap-1 text-[10px] tracking-wider text-zinc-400 uppercase">
                  <Clock className="size-3" /> Statut
                </div>
                <p
                  className={`mt-0.5 text-xs font-semibold ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}
                >
                  {isCompleted ? 'Traité' : 'En attente'}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] tracking-wider text-zinc-400 uppercase">
                  <ListChecks className="size-3" /> Progression
                </div>
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  {completedNum} <span className="font-normal text-zinc-400">/</span> {totalNum}
                </p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#244976] to-[#21416C] transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Contact full info */}
          <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
            <p className="mb-3 text-[10px] font-semibold tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
              Contact
            </p>

            {/* Avatar + name */}
            <div className="mb-4 flex items-center gap-3">
              <div className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-lg font-bold text-white">
                {contact.firstName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-zinc-900 dark:text-white">{contactName}</p>
                {contact.schoolName ? (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{contact.schoolName}</p>
                ) : null}
                {contact.city ? (
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">{contact.city}</p>
                ) : null}
              </div>
            </div>

            {/* ── Filière souhaitée — info clé pour l'argumentaire ── */}
            {contact.desiredProgram ? (
              <div className="mb-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2.5 dark:border-amber-500/30 dark:from-amber-500/10 dark:to-orange-500/10">
                <div className="mb-1 flex items-center gap-1.5">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  <p className="text-[10px] font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                    Filière souhaitée
                  </p>
                </div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                  {contact.desiredProgram}
                </p>
              </div>
            ) : null}

            {/* Details grid */}
            <div className="space-y-3">
              {/* Téléphones — action directe */}
              <div className="flex items-start gap-3">
                <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
                  <Phone className="size-3.5 text-blue-500 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400">Tél. principal</p>
                  <a
                    href={`tel:${contact.phonePrimary}`}
                    className="hover:text-lbs-blue text-sm font-semibold text-zinc-800 dark:text-white"
                  >
                    {contact.phonePrimary}
                  </a>
                  {contact.phoneSecondary ? (
                    <>
                      <p className="mt-1 text-[10px] text-zinc-400">Tél. secondaire</p>
                      <a
                        href={`tel:${contact.phoneSecondary}`}
                        className="hover:text-lbs-blue block text-sm font-semibold text-zinc-700 dark:text-zinc-200"
                      >
                        {contact.phoneSecondary}
                      </a>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Email */}
              {contact.email ? (
                <div className="flex items-start gap-3">
                  <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-violet-50 dark:bg-violet-500/10">
                    <Mail className="size-3.5 text-violet-500 dark:text-violet-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400">Email</p>
                    <p className="text-sm font-medium break-all text-zinc-700 dark:text-zinc-200">
                      {contact.email}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Établissement d'origine */}
              {contact.schoolName ? (
                <div className="flex items-start gap-3">
                  <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-amber-50 dark:bg-amber-500/10">
                    <Building2 className="size-3.5 text-amber-500 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400">Établissement d&apos;origine</p>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                      {contact.schoolName}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Ville */}
              {contact.city ? (
                <div className="flex items-start gap-3">
                  <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                    <MapPin className="size-3.5 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400">Ville</p>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                      {contact.city}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Niveau / filière si pas de desiredProgram mais metadata */}
              {!contact.desiredProgram && contactMetadata && Object.keys(contactMetadata).length > 0
                ? Object.entries(contactMetadata).map(([key, value]) =>
                    value != null && value !== '' ? (
                      <div key={key} className="flex items-start gap-3">
                        <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-zinc-50 dark:bg-white/5">
                          <Info className="size-3.5 text-zinc-500 dark:text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-[10px] text-zinc-400">
                            {key.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                          </p>
                          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                            {String(value)}
                          </p>
                        </div>
                      </div>
                    ) : null
                  )
                : null}

              {/* Notes */}
              {contactCcNotes ? (
                <div className="flex items-start gap-3">
                  <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-orange-50 dark:bg-orange-500/10">
                    <FileText className="size-3.5 text-orange-500 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-400">Notes</p>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                      {contactCcNotes}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Séparateur + infos contextuelles */}
              <div className="border-t border-zinc-100 pt-3 dark:border-white/5">
                <p className="mb-2 text-[10px] font-semibold tracking-wider text-zinc-300 uppercase dark:text-zinc-600">
                  Contexte dossier
                </p>
                <div className="space-y-2.5">
                  {/* Niveau scolaire depuis metadata si présent */}
                  {contactMetadata?.['niveau_scolaire'] || contactMetadata?.['niveau'] ? (
                    <div className="flex items-start gap-3">
                      <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-indigo-50 dark:bg-indigo-500/10">
                        <BookOpen className="size-3.5 text-indigo-500 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-zinc-400">Niveau scolaire</p>
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                          {String(
                            contactMetadata?.['niveau_scolaire'] ??
                              contactMetadata?.['niveau'] ??
                              '—'
                          )}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Date d'assignation */}
                  <div className="flex items-center gap-3">
                    <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-zinc-50 dark:bg-white/5">
                      <CalendarDays className="size-3.5 text-zinc-400 dark:text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-400">Assigné le</p>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {assignedDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Queue */}
          {queueContacts.length > 0 ? (
            <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase dark:text-zinc-500">
                  File d&apos;attente
                </p>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                  {totalNum - completedNum}
                </span>
              </div>
              <div className="space-y-1">
                {queueContacts.map((q, idx) => (
                  <Link
                    key={q.ccId}
                    href={`/dashboard/agent/contacts/${q.ccId}`}
                    className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-zinc-50 dark:hover:bg-white/5"
                  >
                    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-zinc-300 to-zinc-400 text-xs font-semibold text-white dark:from-zinc-600 dark:to-zinc-700">
                      {q.firstName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-800 dark:text-white">
                        {q.firstName} {q.lastName ?? ''}
                      </p>
                      <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">
                        {q.schoolName ?? '—'}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-zinc-300 dark:text-zinc-600">
                      {idx + 1}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* ── CENTER PANEL — Script / IA / Docs tabs ── */}
        <div>
          <CallCenterTabs
            script={dynamicScript}
            contactName={contactName}
            schoolName={contact.schoolName}
            desiredProgram={contact.desiredProgram}
            campaignTitle={contact.campaignTitle}
            baseScript={contact.campaignScript}
            pdfUrl={contact.pdfUrl}
          />
        </div>

        {/* ── RIGHT PANEL — Result form + dialer ── */}
        <div>
          {isCompleted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                    Appel traité
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    Le résultat a été enregistré.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <AgentCallPanel
              assignmentId={contact.assignmentId}
              campaignId={contact.campaignId}
              contactId={contact.contactId}
              phonePrimary={contact.phonePrimary}
              phoneSecondary={contact.phoneSecondary}
              contactName={contactName}
              submitAction={submitCallResult}
            />
          )}
        </div>
      </div>
    </div>
  )
}

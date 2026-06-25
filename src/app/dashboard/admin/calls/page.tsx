/**
 * Mes contacts — administrateur.
 * Même interface que l'agent : liste filtrée des contacts assignés avec accès à la fiche d'appel.
 */
import Link from 'next/link'
import { CheckCircle2, Contact, Eye, Filter, MessageCircle, Phone, Search, X } from 'lucide-react'
import { and, desc, eq } from 'drizzle-orm'

import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import { agentContactAssignments, campaignContacts, campaigns, contacts } from '@/db/schema'

type SearchParams = Readonly<Record<string, string | string[] | undefined>>

const readParam = ({ sp, key }: Readonly<{ sp: SearchParams; key: string }>): string => {
  const raw: string | string[] | undefined = sp[key]
  if (typeof raw === 'string') return raw
  return Array.isArray(raw) ? (raw[0] ?? '') : ''
}

export default async function AdminCallsPage({
  searchParams,
}: Readonly<{ searchParams?: Promise<SearchParams> }>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ['admin'] })
  const sp: SearchParams = (await searchParams) ?? {}
  const statusFilter = readParam({ sp, key: 'status' })
  const searchQuery = readParam({ sp, key: 'q' })
  const schoolFilter = readParam({ sp, key: 'school' })
  const notice = readParam({ sp, key: 'notice' })

  const noticeMessages: Readonly<Record<string, { text: string; type: 'success' | 'error' }>> = {
    call_saved: { text: "Résultat d'appel enregistré avec succès.", type: 'success' },
    missing_fields: { text: 'Veuillez remplir tous les champs obligatoires.', type: 'error' },
    error: { text: 'Une erreur est survenue.', type: 'error' },
  }
  const currentNotice = notice.length > 0 ? noticeMessages[notice] : undefined

  const conditions: ReturnType<typeof and>[] = [eq(agentContactAssignments.agentId, user.id)]
  if (statusFilter === 'pending') conditions.push(eq(agentContactAssignments.status, 'pending'))
  else if (statusFilter === 'completed')
    conditions.push(eq(agentContactAssignments.status, 'completed'))
  else if (statusFilter === 'in_progress')
    conditions.push(eq(agentContactAssignments.status, 'in_progress'))

  let contactsList = await db
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
      city: contacts.city,
      campaignTitle: campaigns.title,
    })
    .from(agentContactAssignments)
    .innerJoin(campaignContacts, eq(agentContactAssignments.campaignContactId, campaignContacts.id))
    .innerJoin(contacts, eq(campaignContacts.contactId, contacts.id))
    .innerJoin(campaigns, eq(campaignContacts.campaignId, campaigns.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(agentContactAssignments.assignedAt))
    .limit(200)

  if (searchQuery.length > 0) {
    const q = searchQuery.toLowerCase()
    contactsList = contactsList.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        (c.lastName?.toLowerCase().includes(q) ?? false) ||
        c.phonePrimary.includes(q) ||
        (c.schoolName?.toLowerCase().includes(q) ?? false) ||
        (c.city?.toLowerCase().includes(q) ?? false)
    )
  }

  if (schoolFilter.length > 0) {
    contactsList = contactsList.filter((c) => c.schoolName === schoolFilter)
  }

  const allSchools = Array.from(
    new Set(
      contactsList
        .map((c) => c.schoolName)
        .filter((s): s is string => typeof s === 'string' && s.length > 0)
    )
  ).sort()

  const statusCounts = {
    all: contactsList.length,
    pending: contactsList.filter((c) => c.status === 'pending').length,
    in_progress: contactsList.filter((c) => c.status === 'in_progress').length,
    completed: contactsList.filter((c) => c.status === 'completed').length,
  }

  const buildHref = (overrides: Record<string, string>): string => {
    const params = new URLSearchParams()
    const base = { status: statusFilter, q: searchQuery, school: schoolFilter, ...overrides }
    for (const [k, v] of Object.entries(base)) {
      if (v.length > 0) params.set(k, v)
    }
    const qs = params.toString()
    return `/dashboard/admin/calls${qs.length > 0 ? `?${qs}` : ''}`
  }

  const statusBadge = (status: string): React.JSX.Element => {
    if (status === 'completed')
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          <CheckCircle2 className="size-3" />
          Traité
        </span>
      )
    if (status === 'in_progress')
      return (
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
          En cours
        </span>
      )
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
        En attente
      </span>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-white">
          Mes contacts
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Contacts qui vous ont été assignés pour appel
        </p>
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
          <Link href="/dashboard/admin/calls" className="ml-auto">
            <X className="size-4" />
          </Link>
        </div>
      ) : null}

      {/* Status filters + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: `Tous (${statusCounts.all})`, value: '' },
            { label: `En attente (${statusCounts.pending})`, value: 'pending' },
            { label: `En cours (${statusCounts.in_progress})`, value: 'in_progress' },
            { label: `Traités (${statusCounts.completed})`, value: 'completed' },
          ].map((tab) => (
            <Link
              key={tab.value}
              href={buildHref({ status: tab.value })}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === tab.value
                  ? tab.value === ''
                    ? 'border-lbs-blue bg-lbs-blue/10 text-lbs-blue dark:border-blue-400 dark:bg-blue-500/15 dark:text-blue-300'
                    : tab.value === 'pending'
                      ? 'border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-400 dark:bg-amber-500/15 dark:text-amber-300'
                      : tab.value === 'in_progress'
                        ? 'border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/15 dark:text-blue-300'
                        : 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-400 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : 'hover:border-lbs-blue hover:text-lbs-blue border-zinc-200 text-zinc-600 dark:border-white/15 dark:text-zinc-300'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        <form method="GET" className="flex items-center gap-2">
          {statusFilter.length > 0 ? (
            <input type="hidden" name="status" value={statusFilter} />
          ) : null}
          {schoolFilter.length > 0 ? (
            <input type="hidden" name="school" value={schoolFilter} />
          ) : null}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              name="q"
              placeholder="Rechercher..."
              defaultValue={searchQuery}
              className="focus:border-lbs-blue focus:ring-lbs-blue/20 w-full rounded-xl border border-zinc-200 bg-white py-2 pr-4 pl-10 text-sm text-zinc-800 transition outline-none focus:ring-2 sm:w-56 dark:border-white/15 dark:bg-[#0f1729] dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-white/15 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
          >
            <Filter className="size-4" />
          </button>
        </form>
      </div>

      {/* School filter */}
      {allSchools.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Établissement :
          </span>
          <Link
            href={buildHref({ school: '' })}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${schoolFilter.length === 0 ? 'border-lbs-blue bg-lbs-blue/10 text-lbs-blue dark:border-blue-400 dark:bg-blue-500/15 dark:text-blue-300' : 'hover:border-lbs-blue hover:text-lbs-blue border-zinc-200 text-zinc-600 dark:border-white/15 dark:text-zinc-300'}`}
          >
            Tous
          </Link>
          {allSchools.map((school) => (
            <Link
              key={school}
              href={buildHref({ school })}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${schoolFilter === school ? 'border-lbs-blue bg-lbs-blue/10 text-lbs-blue dark:border-blue-400 dark:bg-blue-500/15 dark:text-blue-300' : 'hover:border-lbs-blue hover:text-lbs-blue border-zinc-200 text-zinc-600 dark:border-white/15 dark:text-zinc-300'}`}
            >
              {school}
            </Link>
          ))}
        </div>
      ) : null}

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {contactsList.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200/70 bg-white py-10 text-center dark:border-white/10 dark:bg-[#1a2332]">
            <Contact className="mx-auto mb-2 size-8 text-zinc-300" />
            <p className="text-sm text-zinc-400">Aucun contact trouvé.</p>
          </div>
        ) : (
          contactsList.map((c) => (
            <div
              key={c.assignmentId}
              className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a2332]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-semibold text-white">
                    {c.firstName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-zinc-800 dark:text-white">
                      {c.firstName} {c.lastName ?? ''}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{c.campaignTitle}</p>
                  </div>
                </div>
                {statusBadge(c.status)}
              </div>
              <div className="mt-3 space-y-1.5">
                <a
                  href={`tel:${c.phonePrimary}`}
                  className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200"
                >
                  <Phone className="size-3.5 shrink-0 text-zinc-400" />
                  {c.phonePrimary}
                </a>
                {c.schoolName ? (
                  <p className="pl-5 text-xs text-zinc-500 dark:text-zinc-400">
                    {c.schoolName}
                    {c.city ? ` — ${c.city}` : ''}
                  </p>
                ) : null}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <a
                  href={`tel:${c.phonePrimary}`}
                  className="bg-lbs-blue flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white transition hover:brightness-110"
                >
                  <Phone className="size-3.5" /> Appeler
                </a>
                <Link
                  href={`/dashboard/admin/calls/${c.ccId}`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/5"
                >
                  <Eye className="size-3.5" /> Voir fiche
                </Link>
                <a
                  href={`https://wa.me/${c.phonePrimary.replace(/\s+/g, '').replace(/^\+/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-9 shrink-0 place-items-center rounded-xl border border-zinc-200 text-emerald-600 transition hover:bg-emerald-50 dark:border-white/15 dark:text-emerald-400"
                  title="WhatsApp"
                >
                  <MessageCircle className="size-4" />
                </a>
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
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Téléphone</th>
                <th className="px-5 py-3">Établissement / Ville</th>
                <th className="px-5 py-3">Campagne</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contactsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-zinc-400">
                    <Contact className="mx-auto mb-2 size-8 text-zinc-300" />
                    Aucun contact trouvé.
                  </td>
                </tr>
              ) : (
                contactsList.map((c) => (
                  <tr
                    key={c.assignmentId}
                    className="border-b border-zinc-100 transition hover:bg-zinc-50/50 dark:border-white/5 dark:hover:bg-white/5"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/admin/calls/${c.ccId}`}
                        className="group flex items-center gap-3"
                      >
                        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-semibold text-white">
                          {c.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="group-hover:text-lbs-blue truncate font-medium text-zinc-800 dark:text-white dark:group-hover:text-blue-300">
                            {c.firstName} {c.lastName ?? ''}
                          </p>
                          {c.email ? (
                            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                              {c.email}
                            </p>
                          ) : null}
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <a
                        href={`tel:${c.phonePrimary}`}
                        className="hover:text-lbs-blue font-medium text-zinc-700 dark:text-zinc-200"
                      >
                        {c.phonePrimary}
                      </a>
                      {c.phoneSecondary ? (
                        <p className="text-xs text-zinc-400">{c.phoneSecondary}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-zinc-700 dark:text-zinc-200">{c.schoolName ?? '—'}</p>
                      {c.city ? <p className="text-xs text-zinc-400">{c.city}</p> : null}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                        {c.campaignTitle}
                      </span>
                    </td>
                    <td className="px-5 py-3">{statusBadge(c.status)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <a
                          href={`tel:${c.phonePrimary}`}
                          className="border-lbs-blue/30 bg-lbs-blue/5 text-lbs-blue hover:bg-lbs-blue inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition hover:text-white dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300"
                          title="Appeler"
                        >
                          <Phone className="size-3.5" /> Appeler
                        </a>
                        <Link
                          href={`/dashboard/admin/calls/${c.ccId}`}
                          className="hover:text-lbs-blue rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/10"
                          title="Voir fiche"
                        >
                          <Eye className="size-4" />
                        </Link>
                        <a
                          href={`https://wa.me/${c.phonePrimary.replace(/\s+/g, '').replace(/^\+/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-emerald-50 hover:text-emerald-600 dark:text-zinc-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                          title="WhatsApp"
                        >
                          <MessageCircle className="size-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

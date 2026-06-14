import { and, desc, eq, inArray } from 'drizzle-orm'
import { Bell, Building2, Calendar, Phone, User } from 'lucide-react'
import Link from 'next/link'

import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import { callResults, campaigns, campaignContacts, contacts, users } from '@/db/schema'

export default async function AdminRappelsPage(): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ['admin'] })

  const myCampaigns = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(eq(campaigns.createdByAdminId, user.id))
  const myCampaignIds = myCampaigns.map((c) => c.id)

  const rappels =
    myCampaignIds.length > 0
      ? await db
          .select({
            callId: callResults.id,
            contactFirstName: contacts.firstName,
            contactLastName: contacts.lastName,
            contactPhone: contacts.phonePrimary,
            contactSchool: contacts.schoolName,
            contactCity: contacts.city,
            campaignTitle: campaigns.title,
            campaignId: callResults.campaignId,
            ccId: campaignContacts.id,
            agentName: users.fullName,
            notes: callResults.notes,
            createdAt: callResults.createdAt,
          })
          .from(callResults)
          .innerJoin(contacts, eq(callResults.contactId, contacts.id))
          .innerJoin(campaigns, eq(callResults.campaignId, campaigns.id))
          .innerJoin(
            campaignContacts,
            and(
              eq(campaignContacts.contactId, contacts.id),
              eq(campaignContacts.campaignId, callResults.campaignId)
            )
          )
          .innerJoin(users, eq(callResults.agentId, users.id))
          .where(
            and(eq(callResults.outcome, 'callback'), inArray(callResults.campaignId, myCampaignIds))
          )
          .orderBy(desc(callResults.createdAt))
          .limit(200)
      : []

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-white">Rappels</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Contacts ayant demandé à être rappelés — {rappels.length} rappel
          {rappels.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {rappels.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200/70 bg-white py-10 text-center dark:border-white/10 dark:bg-[#1a2332]">
            <Bell className="mx-auto mb-2 size-8 text-zinc-300" />
            <p className="text-sm text-zinc-400">Aucun rappel planifié.</p>
          </div>
        ) : (
          rappels.map((r) => (
            <div
              key={r.callId}
              className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a2332]"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-semibold text-white">
                  {r.contactFirstName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-zinc-800 dark:text-white">
                    {r.contactFirstName} {r.contactLastName ?? ''}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{r.campaignTitle}</p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                  Rappel
                </span>
              </div>
              <div className="mt-3 space-y-1.5">
                <a
                  href={`tel:${r.contactPhone}`}
                  className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200"
                >
                  <Phone className="size-3.5 shrink-0 text-zinc-400" />
                  {r.contactPhone}
                </a>
                {r.contactSchool ? (
                  <p className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <Building2 className="size-3.5 shrink-0 text-zinc-400" />
                    {r.contactSchool}
                  </p>
                ) : null}
                <p className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <User className="size-3.5 shrink-0 text-zinc-400" />
                  Agent : {r.agentName}
                </p>
                <p className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <Calendar className="size-3.5 shrink-0 text-zinc-400" />
                  {r.createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </p>
                {r.notes ? <p className="pl-5 text-xs text-zinc-400 italic">{r.notes}</p> : null}
              </div>
              <div className="mt-3">
                <Link
                  href={`/dashboard/admin/contacts/${r.ccId}`}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                >
                  <Phone className="size-3.5" /> Rappeler
                </Link>
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
                <th className="px-5 py-3">Établissement</th>
                <th className="px-5 py-3">Campagne</th>
                <th className="px-5 py-3">Agent</th>
                <th className="px-5 py-3">Note</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rappels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center">
                    <Bell className="mx-auto mb-2 size-8 text-zinc-300" />
                    <p className="text-sm text-zinc-400">Aucun rappel planifié pour le moment.</p>
                    <p className="text-xs text-zinc-300 dark:text-zinc-500">
                      Les rappels s&apos;ajoutent automatiquement quand un agent enregistre un
                      résultat &quot;Rappel&quot;.
                    </p>
                  </td>
                </tr>
              ) : (
                rappels.map((r) => (
                  <tr
                    key={r.callId}
                    className="border-b border-zinc-100 transition hover:bg-zinc-50/50 dark:border-white/5 dark:hover:bg-white/5"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-semibold text-white">
                          {r.contactFirstName.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium text-zinc-800 dark:text-white">
                          {r.contactFirstName} {r.contactLastName ?? ''}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-zinc-700 dark:text-zinc-200">{r.contactPhone}</td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-300">
                      {r.contactSchool ?? '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                        {r.campaignTitle}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-300">{r.agentName}</td>
                    <td className="max-w-[180px] px-5 py-3">
                      {r.notes ? (
                        <p
                          className="truncate text-xs text-zinc-500 dark:text-zinc-400"
                          title={r.notes}
                        >
                          {r.notes}
                        </p>
                      ) : (
                        <span className="text-xs text-zinc-300 dark:text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                      {r.createdAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/dashboard/admin/contacts/${r.ccId}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                      >
                        <Phone className="size-3.5" /> Rappeler
                      </Link>
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

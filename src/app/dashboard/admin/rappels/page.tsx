/**
 * Page de rappels admin — contacts avec résultat "callback" sur les campagnes de l'admin.
 */
import { and, desc, eq, inArray } from "drizzle-orm";
import { Bell, Phone } from "lucide-react";
import Link from "next/link";

import { requireRole } from "@/lib/auth/server-auth";
import { db } from "@/lib/db";
import { callResults, campaigns, campaignContacts, contacts, users } from "@/db/schema";

export default async function AdminRappelsPage(): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ["admin"] });

  const myCampaigns = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(eq(campaigns.createdByAdminId, user.id));
  const myCampaignIds = myCampaigns.map((c) => c.id);

  const rappels = myCampaignIds.length > 0
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
        .innerJoin(campaignContacts, and(
          eq(campaignContacts.contactId, contacts.id),
          eq(campaignContacts.campaignId, callResults.campaignId)
        ))
        .innerJoin(users, eq(callResults.agentId, users.id))
        .where(and(
          eq(callResults.outcome, "callback"),
          inArray(callResults.campaignId, myCampaignIds),
        ))
        .orderBy(desc(callResults.createdAt))
        .limit(200)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Rappels</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Contacts ayant demandé à être rappelés — {rappels.length} rappel{rappels.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-white/10">
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
                    <p className="text-xs text-zinc-300 dark:text-zinc-500">Les rappels s&apos;ajoutent automatiquement quand un agent enregistre un résultat &quot;Rappel&quot;.</p>
                  </td>
                </tr>
              ) : (
                rappels.map((r) => (
                  <tr key={r.callId} className="border-b border-zinc-100 transition hover:bg-zinc-50/50 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xs font-semibold text-white">
                          {r.contactFirstName.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium text-zinc-800 dark:text-white">{r.contactFirstName} {r.contactLastName ?? ""}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-zinc-700 dark:text-zinc-200">{r.contactPhone}</td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-300">{r.contactSchool ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                        {r.campaignTitle}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-zinc-600 dark:text-zinc-300">{r.agentName}</td>
                    <td className="px-5 py-3 max-w-[180px]">
                      {r.notes ? (
                        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400" title={r.notes}>{r.notes}</p>
                      ) : (
                        <span className="text-xs text-zinc-300 dark:text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                      {r.createdAt.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
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
  );
}

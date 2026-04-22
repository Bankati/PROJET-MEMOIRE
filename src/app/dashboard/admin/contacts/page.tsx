/**
 * Page contacts admin — tableau simplifié avec filtre par établissement.
 * Chaque ligne a un bouton redirigeant vers la page d'appel.
 */
import Link from "next/link";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { Phone } from "lucide-react";

import { requireRole } from "@/lib/auth/server-auth";
import { db } from "@/lib/db";
import { campaigns, campaignContacts, contacts } from "@/db/schema";

type SearchParams = Readonly<Record<string, string | string[] | undefined>>;

const readParam = ({ sp, key }: Readonly<{ sp: SearchParams; key: string }>): string => {
  const raw: string | string[] | undefined = sp[key];
  if (typeof raw === "string") return raw;
  return Array.isArray(raw) ? (raw[0] ?? "") : "";
};

export default async function AdminContactsPage({
  searchParams,
}: Readonly<{ searchParams?: Promise<SearchParams> }>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ["admin"] });
  const sp: SearchParams = (await searchParams) ?? {};
  const schoolFilter = readParam({ sp, key: "school" });
  const campaignFilter = readParam({ sp, key: "campaign" });

  const myCampaigns = await db
    .select({ id: campaigns.id, title: campaigns.title })
    .from(campaigns)
    .where(eq(campaigns.createdByAdminId, user.id))
    .orderBy(desc(campaigns.createdAt));
  const myCampaignIds = myCampaigns.map((c) => c.id);

  // Distinct schools
  const schoolOptions = myCampaignIds.length > 0
    ? await db
        .selectDistinct({ schoolName: contacts.schoolName })
        .from(contacts)
        .innerJoin(campaignContacts, eq(campaignContacts.contactId, contacts.id))
        .where(and(inArray(campaignContacts.campaignId, myCampaignIds), sql`${contacts.schoolName} is not null`))
        .orderBy(contacts.schoolName)
    : [];

  const contactConditions: ReturnType<typeof and>[] = [];
  if (campaignFilter.length > 0) {
    contactConditions.push(eq(campaignContacts.campaignId, campaignFilter));
  } else if (myCampaignIds.length > 0) {
    contactConditions.push(inArray(campaignContacts.campaignId, myCampaignIds));
  }
  if (schoolFilter.length > 0) {
    contactConditions.push(eq(contacts.schoolName, schoolFilter));
  }

  const contactsList = myCampaignIds.length > 0
    ? await db
        .select({
          ccId: campaignContacts.id,
          campaignTitle: campaigns.title,
          firstName: contacts.firstName,
          lastName: contacts.lastName,
          phonePrimary: contacts.phonePrimary,
          email: contacts.email,
          schoolName: contacts.schoolName,
          city: contacts.city,
        })
        .from(campaignContacts)
        .innerJoin(contacts, eq(campaignContacts.contactId, contacts.id))
        .innerJoin(campaigns, eq(campaignContacts.campaignId, campaigns.id))
        .where(contactConditions.length > 0 ? and(...contactConditions) : undefined)
        .orderBy(desc(campaignContacts.createdAt))
        .limit(200)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Contacts</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Consultez et appelez vos prospects</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Campaign filter */}
        {myCampaigns.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Campagne :</span>
            <Link
              href={schoolFilter.length > 0 ? `/dashboard/admin/contacts?school=${encodeURIComponent(schoolFilter)}` : "/dashboard/admin/contacts"}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${campaignFilter.length === 0 ? "border-lbs-blue bg-lbs-blue/10 text-lbs-blue dark:border-blue-400 dark:bg-blue-500/15 dark:text-blue-300" : "border-zinc-200 text-zinc-600 hover:border-lbs-blue hover:text-lbs-blue dark:border-white/15 dark:text-zinc-300"}`}
            >
              Toutes
            </Link>
            {myCampaigns.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/admin/contacts?campaign=${c.id}${schoolFilter.length > 0 ? `&school=${encodeURIComponent(schoolFilter)}` : ""}`}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${campaignFilter === c.id ? "border-lbs-blue bg-lbs-blue/10 text-lbs-blue dark:border-blue-400 dark:bg-blue-500/15 dark:text-blue-300" : "border-zinc-200 text-zinc-600 hover:border-lbs-blue hover:text-lbs-blue dark:border-white/15 dark:text-zinc-300"}`}
              >
                {c.title}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {/* School filter */}
      {schoolOptions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Établissement :</span>
          <Link
            href={campaignFilter.length > 0 ? `/dashboard/admin/contacts?campaign=${campaignFilter}` : "/dashboard/admin/contacts"}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${schoolFilter.length === 0 ? "border-lbs-blue bg-lbs-blue/10 text-lbs-blue dark:border-blue-400 dark:bg-blue-500/15 dark:text-blue-300" : "border-zinc-200 text-zinc-600 hover:border-lbs-blue hover:text-lbs-blue dark:border-white/15 dark:text-zinc-300"}`}
          >
            Tous
          </Link>
          {schoolOptions.map((s) => s.schoolName ? (
            <Link
              key={s.schoolName}
              href={`/dashboard/admin/contacts?school=${encodeURIComponent(s.schoolName)}${campaignFilter.length > 0 ? `&campaign=${campaignFilter}` : ""}`}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${schoolFilter === s.schoolName ? "border-lbs-blue bg-lbs-blue/10 text-lbs-blue dark:border-blue-400 dark:bg-blue-500/15 dark:text-blue-300" : "border-zinc-200 text-zinc-600 hover:border-lbs-blue hover:text-lbs-blue dark:border-white/15 dark:text-zinc-300"}`}
            >
              {s.schoolName}
            </Link>
          ) : null)}
        </div>
      ) : null}

      {/* Contacts table */}
      <div className="rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-white/10">
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Téléphone</th>
                <th className="px-5 py-3">Établissement</th>
                <th className="px-5 py-3">Ville</th>
                <th className="px-5 py-3">Campagne</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {contactsList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-zinc-400">
                    Aucun contact trouvé.
                  </td>
                </tr>
              ) : (
                contactsList.map((c) => (
                  <tr key={c.ccId} className="border-b border-zinc-100 transition hover:bg-zinc-50/50 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-xs font-semibold text-white">
                          {c.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-zinc-800 dark:text-white">{c.firstName} {c.lastName ?? ""}</p>
                          {c.email ? <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{c.email}</p> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-zinc-700 dark:text-zinc-200">{c.phonePrimary}</td>
                    <td className="px-5 py-3 text-zinc-700 dark:text-zinc-200">{c.schoolName ?? "—"}</td>
                    <td className="px-5 py-3 text-zinc-700 dark:text-zinc-200">{c.city ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                        {c.campaignTitle}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/dashboard/admin/contacts/${c.ccId}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-lbs-blue/30 bg-lbs-blue/5 px-3 py-1.5 text-xs font-medium text-lbs-blue transition hover:bg-lbs-blue hover:text-white dark:border-blue-400/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/30"
                      >
                        <Phone className="size-3.5" />
                        Appeler
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

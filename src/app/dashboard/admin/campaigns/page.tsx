/**
 * Page de gestion des campagnes pour l'administrateur.
 * Liste des campagnes avec création, modification et consultation détaillée.
 * L'admin ne voit que ses propres campagnes (créateur ou collaborateur).
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Eye,
  Megaphone,
  Trash2,
  X,
} from "lucide-react";
import { and, desc, eq, count } from "drizzle-orm";

import { requireRole } from "@/lib/auth/server-auth";
import { db } from "@/lib/db";
import { campaigns, campaignContacts } from "@/db/schema";
import { CampaignDialogForm } from "@/components/admin/campaign-dialog-form";

type SearchParams = Readonly<Record<string, string | string[] | undefined>>;

const readParam = ({ sp, key }: Readonly<{ sp: SearchParams; key: string }>): string => {
  const raw: string | string[] | undefined = sp[key];
  if (typeof raw === "string") {
    return raw;
  }
  return Array.isArray(raw) ? (raw[0] ?? "") : "";
};

const statusLabelMap: Readonly<Record<string, string>> = {
  draft: "Brouillon",
  active: "Active",
  paused: "En pause",
  completed: "Terminée",
  archived: "Archivée",
};

const statusColorMap: Readonly<Record<string, string>> = {
  draft: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700/40 dark:text-zinc-300",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  paused: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  archived: "bg-zinc-100 text-zinc-500 dark:bg-zinc-700/40 dark:text-zinc-400",
};

async function createCampaign(formData: FormData): Promise<void> {
  "use server";
  const user = await requireRole({ allowedRoles: ["admin"] });
  const title: string = (formData.get("title") as string | null) ?? "";
  const year: number = Number(formData.get("year") ?? new Date().getFullYear());
  const baseScript: string = (formData.get("baseScript") as string | null) ?? "";
  const details: string = (formData.get("details") as string | null) ?? "";
  if (title.trim().length === 0 || baseScript.trim().length === 0) {
    redirect("/dashboard/admin/campaigns?notice=missing_fields");
    return;
  }
  const pdfUrl: string = (formData.get("pdfUrl") as string | null) ?? "";
  await db.insert(campaigns).values({
    title: title.trim(),
    year,
    baseScript: baseScript.trim(),
    details: details.trim().length > 0 ? details.trim() : null,
    pdfUrl: pdfUrl.trim().length > 0 ? pdfUrl.trim() : null,
    status: "draft",
    createdByAdminId: user.id,
  });
  redirect("/dashboard/admin/campaigns?notice=created");
}

async function updateCampaign(formData: FormData): Promise<void> {
  "use server";
  const user = await requireRole({ allowedRoles: ["admin"] });
  const campaignId: string = (formData.get("campaignId") as string | null) ?? "";
  const title: string = (formData.get("title") as string | null) ?? "";
  const year: number = Number(formData.get("year") ?? new Date().getFullYear());
  const baseScript: string = (formData.get("baseScript") as string | null) ?? "";
  const details: string = (formData.get("details") as string | null) ?? "";
  const pdfUrlUpdate: string = (formData.get("pdfUrl") as string | null) ?? "";
  const status: string = (formData.get("status") as string | null) ?? "draft";
  if (campaignId.length === 0 || title.trim().length === 0) {
    redirect("/dashboard/admin/campaigns?notice=missing_fields");
    return;
  }
  await db.update(campaigns).set({
    title: title.trim(),
    year,
    baseScript: baseScript.trim(),
    details: details.trim().length > 0 ? details.trim() : null,
    pdfUrl: pdfUrlUpdate.trim().length > 0 ? pdfUrlUpdate.trim() : null,
    status: status as "draft" | "active" | "paused" | "completed" | "archived",
    updatedAt: new Date(),
  }).where(and(eq(campaigns.id, campaignId), eq(campaigns.createdByAdminId, user.id)));
  redirect("/dashboard/admin/campaigns?notice=updated");
}

async function deleteCampaign(formData: FormData): Promise<void> {
  "use server";
  const user = await requireRole({ allowedRoles: ["admin"] });
  const campaignId: string = (formData.get("campaignId") as string | null) ?? "";
  if (campaignId.length === 0) {
    redirect("/dashboard/admin/campaigns?notice=error");
    return;
  }
  await db.delete(campaigns).where(and(eq(campaigns.id, campaignId), eq(campaigns.createdByAdminId, user.id)));
  redirect("/dashboard/admin/campaigns?notice=deleted");
}

export default async function AdminCampaignsPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ["admin"] });
  const sp: SearchParams = (await searchParams) ?? {};
  const notice: string = readParam({ sp, key: "notice" });
  const viewId: string = readParam({ sp, key: "view" });
  const myCampaigns = await db
    .select({
      id: campaigns.id,
      title: campaigns.title,
      year: campaigns.year,
      status: campaigns.status,
      baseScript: campaigns.baseScript,
      details: campaigns.details,
      pdfUrl: campaigns.pdfUrl,
      createdAt: campaigns.createdAt,
    })
    .from(campaigns)
    .where(eq(campaigns.createdByAdminId, user.id))
    .orderBy(desc(campaigns.createdAt));
  const contactCountsResult = await db
    .select({
      campaignId: campaignContacts.campaignId,
      contactCount: count(campaignContacts.id),
    })
    .from(campaignContacts)
    .groupBy(campaignContacts.campaignId);
  const contactCountMap: ReadonlyMap<string, number> = new Map(
    contactCountsResult.map((r) => [r.campaignId, r.contactCount]),
  );
  const viewCampaign = viewId.length > 0 ? myCampaigns.find((c) => c.id === viewId) : undefined;
  const noticeMessages: Readonly<Record<string, { text: string; type: "success" | "error" }>> = {
    created: { text: "Campagne créée avec succès.", type: "success" },
    updated: { text: "Campagne mise à jour.", type: "success" },
    deleted: { text: "Campagne supprimée.", type: "success" },
    missing_fields: { text: "Veuillez remplir tous les champs obligatoires.", type: "error" },
    error: { text: "Une erreur est survenue.", type: "error" },
  };
  const currentNotice = notice.length > 0 ? noticeMessages[notice] : undefined;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Campagnes</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Créez et gérez vos campagnes d&apos;appels</p>
        </div>
        {viewId.length === 0 ? (
          <CampaignDialogForm
            mode="create"
            createAction={createCampaign}
            updateAction={updateCampaign}
          />
        ) : null}
      </div>
      {currentNotice ? (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${
          currentNotice.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
            : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
        }`}>
          {currentNotice.text}
          <a href="/dashboard/admin/campaigns" className="ml-auto"><X className="size-4" /></a>
        </div>
      ) : null}
      {viewCampaign ? (
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">{viewCampaign.title}</h2>
            <a href="/dashboard/admin/campaigns" className="rounded-lg border border-zinc-200 p-2 text-zinc-500 transition hover:bg-zinc-50 dark:border-white/15 dark:text-zinc-400 dark:hover:bg-white/10"><X className="size-4" /></a>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-100 p-4 dark:border-white/10">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Année</p>
              <p className="mt-1 text-lg font-semibold text-zinc-800 dark:text-white">{viewCampaign.year}</p>
            </div>
            <div className="rounded-xl border border-zinc-100 p-4 dark:border-white/10">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Statut</p>
              <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColorMap[viewCampaign.status]}`}>{statusLabelMap[viewCampaign.status]}</span>
            </div>
            <div className="rounded-xl border border-zinc-100 p-4 dark:border-white/10">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Contacts</p>
              <p className="mt-1 text-lg font-semibold text-zinc-800 dark:text-white">{contactCountMap.get(viewCampaign.id) ?? 0}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">Script</p>
            <div className="rounded-xl bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700 dark:bg-white/5 dark:text-zinc-300">{viewCampaign.baseScript}</div>
          </div>
          {viewCampaign.details ? (
            <div className="mt-4">
              <p className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">Détails</p>
              <div className="rounded-xl bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700 dark:bg-white/5 dark:text-zinc-300">{viewCampaign.details}</div>
            </div>
          ) : null}
        </div>
      ) : null}
      {viewId.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-white/10">
                  <th className="px-5 py-3">Nom</th>
                  <th className="px-5 py-3">Année</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Contacts</th>
                  <th className="px-5 py-3">Créée le</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-zinc-400">
                      <Megaphone className="mx-auto mb-2 size-8 text-zinc-300" />
                      Aucune campagne créée. Commencez par en créer une.
                    </td>
                  </tr>
                ) : (
                  myCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-zinc-100 transition hover:bg-zinc-50/50 dark:border-white/5 dark:hover:bg-white/5">
                      <td className="px-5 py-3 font-medium text-zinc-800 dark:text-white">{campaign.title}</td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-300">{campaign.year}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColorMap[campaign.status]}`}>
                          {statusLabelMap[campaign.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-zinc-600 dark:text-zinc-300">{contactCountMap.get(campaign.id) ?? 0}</td>
                      <td className="px-5 py-3 text-zinc-500 dark:text-zinc-400">
                        <span className="inline-flex items-center gap-1"><Calendar className="size-3" />{campaign.createdAt.toLocaleDateString("fr-FR")}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link href={`/dashboard/admin/campaigns?view=${campaign.id}`} className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-lbs-blue dark:text-zinc-400 dark:hover:bg-white/10" title="Voir"><Eye className="size-4" /></Link>
                          <CampaignDialogForm
                            mode="edit"
                            campaign={{ id: campaign.id, title: campaign.title, year: campaign.year, baseScript: campaign.baseScript, details: campaign.details, pdfUrl: campaign.pdfUrl, status: campaign.status }}
                            createAction={createCampaign}
                            updateAction={updateCampaign}
                          />
                          <form action={deleteCampaign} className="inline">
                            <input type="hidden" name="campaignId" value={campaign.id} />
                            <button type="submit" className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-rose-50 hover:text-rose-600 dark:text-zinc-400 dark:hover:bg-rose-500/10" title="Supprimer"><Trash2 className="size-4" /></button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

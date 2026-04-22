/**
 * Interface d'appel pour l'administrateur.
 * Sélection de contact, composeur, affichage du script, saisie du résultat post-appel.
 * L'admin peut aussi passer des appels directement (auto-attribution).
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  MessageCircle,
  Phone,
  PhoneCall,
  PhoneOff,
  Send,
  X,
} from "lucide-react";
import { and, desc, eq, inArray } from "drizzle-orm";

import { requireRole } from "@/lib/auth/server-auth";
import { db } from "@/lib/db";
import {
  campaigns,
  campaignContacts,
  contacts,
  agentContactAssignments,
  callResults,
} from "@/db/schema";

type SearchParams = Readonly<Record<string, string | string[] | undefined>>;

const readParam = ({ sp, key }: Readonly<{ sp: SearchParams; key: string }>): string => {
  const raw: string | string[] | undefined = sp[key];
  if (typeof raw === "string") {
    return raw;
  }
  return Array.isArray(raw) ? (raw[0] ?? "") : "";
};

const outcomeLabels: Readonly<Record<string, string>> = {
  interested: "Intéressé",
  not_interested: "Pas intéressé",
  callback: "Rappeler",
  no_answer: "Pas de réponse",
  false_number: "Faux numéro",
  whatsapp_follow_up: "Suivi WhatsApp",
  other: "Autre",
};

async function submitCallResult(formData: FormData): Promise<void> {
  "use server";
  const user = await requireRole({ allowedRoles: ["admin"] });
  const assignmentId: string = (formData.get("assignmentId") as string | null) ?? "";
  const campaignId: string = (formData.get("campaignId") as string | null) ?? "";
  const contactId: string = (formData.get("contactId") as string | null) ?? "";
  const dialedPhone: string = (formData.get("dialedPhone") as string | null) ?? "";
  const outcome: string = (formData.get("outcome") as string | null) ?? "";
  const durationSeconds: number = Number(formData.get("durationSeconds") ?? 0);
  const notes: string = (formData.get("notes") as string | null) ?? "";
  const isWhatsapp: boolean = (formData.get("isWhatsapp") as string | null) === "on";
  if (outcome.length === 0 || dialedPhone.length === 0) {
    redirect("/dashboard/admin/calls?notice=missing_fields");
    return;
  }
  await db.insert(callResults).values({
    assignmentId,
    campaignId,
    contactId,
    agentId: user.id,
    dialedPhone,
    outcome: outcome as "interested" | "not_interested" | "callback" | "no_answer" | "false_number" | "whatsapp_follow_up" | "other",
    durationSeconds: Math.max(0, durationSeconds),
    notes: notes.trim().length > 0 ? notes.trim() : null,
    isWhatsappRedirected: isWhatsapp,
  });
  await db.update(agentContactAssignments).set({
    status: "completed",
    completedAt: new Date(),
  }).where(eq(agentContactAssignments.id, assignmentId));
  redirect("/dashboard/admin/calls?notice=saved");
}

export default async function AdminCallsPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ["admin"] });
  const sp: SearchParams = (await searchParams) ?? {};
  const notice: string = readParam({ sp, key: "notice" });
  const selectedContact: string = readParam({ sp, key: "contact" });
  const myCampaigns = await db
    .select({ id: campaigns.id, title: campaigns.title, baseScript: campaigns.baseScript })
    .from(campaigns)
    .where(eq(campaigns.createdByAdminId, user.id))
    .orderBy(desc(campaigns.createdAt));
  const myCampaignIds: string[] = myCampaigns.map((c) => c.id);
  const pendingAssignments = myCampaignIds.length > 0
    ? await db
        .select({
          assignmentId: agentContactAssignments.id,
          campaignContactId: agentContactAssignments.campaignContactId,
          ccCampaignId: campaignContacts.campaignId,
          contactId: contacts.id,
          firstName: contacts.firstName,
          lastName: contacts.lastName,
          phonePrimary: contacts.phonePrimary,
          phoneSecondary: contacts.phoneSecondary,
          schoolName: contacts.schoolName,
          city: contacts.city,
          email: contacts.email,
        })
        .from(agentContactAssignments)
        .innerJoin(campaignContacts, eq(agentContactAssignments.campaignContactId, campaignContacts.id))
        .innerJoin(contacts, eq(campaignContacts.contactId, contacts.id))
        .where(and(
          eq(agentContactAssignments.agentId, user.id),
          eq(agentContactAssignments.status, "pending"),
          inArray(campaignContacts.campaignId, myCampaignIds),
        ))
        .orderBy(desc(agentContactAssignments.assignedAt))
        .limit(50)
    : [];
  const selectedContactData = selectedContact.length > 0
    ? pendingAssignments.find((a) => a.assignmentId === selectedContact)
    : undefined;
  const selectedCampaign = selectedContactData
    ? myCampaigns.find((c) => c.id === selectedContactData.ccCampaignId)
    : undefined;
  const noticeMessages: Readonly<Record<string, { text: string; type: "success" | "error" }>> = {
    saved: { text: "Résultat d'appel enregistré.", type: "success" },
    missing_fields: { text: "Veuillez remplir les champs obligatoires.", type: "error" },
  };
  const currentNotice = notice.length > 0 ? noticeMessages[notice] : undefined;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Appels</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Sélectionnez un contact et passez votre appel</p>
      </div>
      {currentNotice ? (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${
          currentNotice.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
            : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
        }`}>
          {currentNotice.text}
          <a href="/dashboard/admin/calls" className="ml-auto"><X className="size-4" /></a>
        </div>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-2xl border border-zinc-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-white">
              <Phone className="size-4 text-blue-400" />
              Contacts à appeler ({pendingAssignments.length})
            </h3>
            {pendingAssignments.length === 0 ? (
              <p className="py-4 text-center text-sm text-zinc-400">Aucun contact assigné en attente.</p>
            ) : (
              <div className="space-y-2">
                {pendingAssignments.map((a) => (
                  <Link
                    key={a.assignmentId}
                    href={`/dashboard/admin/calls?contact=${a.assignmentId}`}
                    className={`block rounded-xl border p-3 transition ${
                      selectedContact === a.assignmentId
                        ? "border-lbs-blue bg-lbs-blue/5 dark:border-blue-400 dark:bg-blue-500/10"
                        : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50 dark:border-white/5 dark:hover:border-white/10 dark:hover:bg-white/5"
                    }`}
                  >
                    <p className="text-sm font-medium text-zinc-800 dark:text-white">{a.firstName} {a.lastName ?? ""}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{a.phonePrimary}</p>
                    {a.schoolName ? <p className="mt-0.5 text-xs text-zinc-400">{a.schoolName}</p> : null}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4 lg:col-span-2">
          {selectedContactData ? (
            <>
              <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">
                    {selectedContactData.firstName} {selectedContactData.lastName ?? ""}
                  </h3>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://wa.me/${selectedContactData.phonePrimary.replace(/\s+/g, "").replace(/^\+/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                    >
                      <MessageCircle className="size-3.5" />
                      WhatsApp
                    </a>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-zinc-50 p-3 dark:bg-white/5">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Téléphone principal</p>
                    <p className="mt-0.5 font-medium text-zinc-800 dark:text-white">{selectedContactData.phonePrimary}</p>
                  </div>
                  {selectedContactData.phoneSecondary ? (
                    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-white/5">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Téléphone secondaire</p>
                      <p className="mt-0.5 font-medium text-zinc-800 dark:text-white">{selectedContactData.phoneSecondary}</p>
                    </div>
                  ) : null}
                  {selectedContactData.schoolName ? (
                    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-white/5">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Établissement</p>
                      <p className="mt-0.5 font-medium text-zinc-800 dark:text-white">{selectedContactData.schoolName}</p>
                    </div>
                  ) : null}
                  {selectedContactData.city ? (
                    <div className="rounded-xl bg-zinc-50 p-3 dark:bg-white/5">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Ville</p>
                      <p className="mt-0.5 font-medium text-zinc-800 dark:text-white">{selectedContactData.city}</p>
                    </div>
                  ) : null}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <a
                    href={`tel:${selectedContactData.phonePrimary}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
                  >
                    <PhoneCall className="size-4" />
                    Appeler ({selectedContactData.phonePrimary})
                  </a>
                  {selectedContactData.phoneSecondary ? (
                    <a
                      href={`tel:${selectedContactData.phoneSecondary}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-white/15 dark:bg-[#0f1729] dark:text-zinc-200"
                    >
                      <Phone className="size-4" />
                      N° secondaire
                    </a>
                  ) : null}
                </div>
              </div>
              {selectedCampaign ? (
                <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-white">
                    <Send className="size-4 text-blue-400" />
                    Script — {selectedCampaign.title}
                  </h3>
                  <div className="rounded-xl bg-blue-50/50 p-4 text-sm leading-relaxed text-zinc-700 dark:bg-blue-500/5 dark:text-zinc-300">
                    {selectedCampaign.baseScript}
                  </div>
                </div>
              ) : null}
              <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-white">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  Résultat de l&apos;appel
                </h3>
                <form action={submitCallResult} className="space-y-4">
                  <input type="hidden" name="assignmentId" value={selectedContactData.assignmentId} />
                  <input type="hidden" name="campaignId" value={selectedContactData.ccCampaignId} />
                  <input type="hidden" name="contactId" value={selectedContactData.contactId} />
                  <input type="hidden" name="dialedPhone" value={selectedContactData.phonePrimary} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Résultat *</label>
                      <select name="outcome" required className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-lbs-blue dark:border-white/15 dark:bg-[#0f1729] dark:text-white">
                        <option value="">Sélectionner</option>
                        {Object.entries(outcomeLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Durée (secondes)</label>
                      <input name="durationSeconds" type="number" min={0} defaultValue={0} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-lbs-blue focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/15 dark:bg-[#0f1729] dark:text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</label>
                    <textarea name="notes" rows={3} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-lbs-blue focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/15 dark:bg-[#0f1729] dark:text-white" placeholder="Observations, suivi à prévoir..." />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <input name="isWhatsapp" type="checkbox" className="size-4 rounded border-zinc-300 text-lbs-blue" />
                      Redirigé vers WhatsApp
                    </label>
                  </div>
                  <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110">
                    <CheckCircle2 className="size-4" />
                    Enregistrer le résultat
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white dark:border-white/10 dark:bg-[#1a2332]">
              <div className="text-center">
                <PhoneOff className="mx-auto mb-3 size-10 text-zinc-300 dark:text-zinc-600" />
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Sélectionnez un contact à gauche pour commencer un appel</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

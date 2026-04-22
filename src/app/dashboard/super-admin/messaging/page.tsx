/**
 * Page de messagerie diffusion du super-admin.
 * Envoi d'un message à l'ensemble des administrateurs actifs.
 */
import { and, count, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Send, Users } from "lucide-react";

import { requireRole } from "@/lib/auth/server-auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";

type SearchParams = Readonly<Record<string, string | string[] | undefined>>;

const readFormValue = ({
  formData,
  key,
}: Readonly<{
  formData: FormData;
  key: string;
}>): string => {
  const val: FormDataEntryValue | null = formData.get(key);
  return typeof val === "string" ? val.trim() : "";
};
const readParam = ({
  searchParams,
  key,
}: Readonly<{
  searchParams: SearchParams;
  key: string;
}>): string => {
  const raw: string | string[] | undefined = searchParams[key];
  if (typeof raw === "string") {
    return raw;
  }
  if (Array.isArray(raw)) {
    return raw[0] ?? "";
  }
  return "";
};

const broadcastAction = async (formData: FormData): Promise<void> => {
  "use server";
  await requireRole({ allowedRoles: ["super_admin"] });
  const subject: string = readFormValue({ formData, key: "subject" });
  const message: string = readFormValue({ formData, key: "message" });
  if (subject.length < 3 || message.length < 8) {
    redirect("/dashboard/super-admin/messaging?notice=Le+message+doit+contenir+un+objet+(3+car.)+et+un+contenu+(8+car.)+valides.");
  }
  const targetAdmins: Array<{ value: number }> = await db
    .select({ value: count(users.id) })
    .from(users)
    .where(and(eq(users.role, "admin"), eq(users.status, "active")));
  const targetCount: number = targetAdmins[0]?.value ?? 0;
  redirect(
    `/dashboard/super-admin/messaging?notice=Message+envoyé+à+${targetCount}+administrateurs+actifs.&success=true`,
  );
};

export default async function MessagingPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>): Promise<React.JSX.Element> {
  await requireRole({ allowedRoles: ["super_admin"] });
  const resolvedParams: SearchParams = (await searchParams) ?? {};
  const notice: string = readParam({ searchParams: resolvedParams, key: "notice" });
  const isSuccess: boolean = readParam({ searchParams: resolvedParams, key: "success" }) === "true";
  const activeAdminsResult: Array<{ value: number }> = await db
    .select({ value: count(users.id) })
    .from(users)
    .where(and(eq(users.role, "admin"), eq(users.status, "active")));
  const activeAdminsCount: number = activeAdminsResult[0]?.value ?? 0;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Messagerie</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Diffusez un message à tous les administrateurs actifs</p>
      </div>
      {notice.length > 0 ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            isSuccess
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
              : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
          }`}
        >
          {notice}
        </div>
      ) : null}
      <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#244976] to-[#21416C] text-white shadow-sm">
            <Users className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-white">Destinataires</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {activeAdminsCount} administrateur{activeAdminsCount > 1 ? "s" : ""} actif{activeAdminsCount > 1 ? "s" : ""} recevront ce message
            </p>
          </div>
        </div>
      </div>
      <form action={broadcastAction} className="space-y-4" suppressHydrationWarning>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="subject" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Objet du message
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                required
                minLength={3}
                placeholder="Ex: Mise à jour des procédures d'appel"
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-lbs-blue focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="message" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Contenu du message
              </label>
              <textarea
                id="message"
                name="message"
                required
                minLength={8}
                rows={6}
                placeholder="Rédigez ici votre communication à l'ensemble des administrateurs..."
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-lbs-blue focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
              />
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-6 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
        >
          <Send className="size-4" />
          Envoyer à tous les administrateurs
        </button>
      </form>
    </div>
  );
}

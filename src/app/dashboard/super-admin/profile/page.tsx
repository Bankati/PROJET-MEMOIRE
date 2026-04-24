/**
 * Page profil du super-admin.
 * Photo de profil uploadée via Supabase Storage, changement de mot de passe.
 */
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { KeyRound, Shield } from "lucide-react";

import { requireRole } from "@/lib/auth/server-auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { AvatarUpload } from "@/components/shared/avatar-upload";

type SearchParams = Readonly<Record<string, string | string[] | undefined>>;

const readParam = ({
  searchParams,
  key,
}: Readonly<{ searchParams: SearchParams; key: string }>): string => {
  const raw: string | string[] | undefined = searchParams[key];
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw[0] ?? "";
  return "";
};

const changePasswordAction = async (formData: FormData): Promise<void> => {
  "use server";
  const user = await requireRole({ allowedRoles: ["super_admin"] });
  const newPassword: string = ((formData.get("newPassword") as string | null) ?? "").trim();
  const confirmPassword: string = ((formData.get("confirmPassword") as string | null) ?? "").trim();
  if (newPassword.length === 0) {
    redirect("/dashboard/super-admin/profile?notice=Veuillez+saisir+un+nouveau+mot+de+passe.&success=false");
    return;
  }
  if (newPassword.length < 8) {
    redirect("/dashboard/super-admin/profile?notice=Le+mot+de+passe+doit+contenir+au+moins+8+caractères.&success=false");
    return;
  }
  if (newPassword !== confirmPassword) {
    redirect("/dashboard/super-admin/profile?notice=Les+mots+de+passe+ne+correspondent+pas.&success=false");
    return;
  }
  await db.update(users).set({ passwordHash: hashPassword({ password: newPassword }), updatedAt: new Date() }).where(eq(users.id, user.id));
  redirect("/dashboard/super-admin/profile?notice=Mot+de+passe+mis+à+jour+avec+succès.&success=true");
};

export default async function ProfilePage({
  searchParams,
}: Readonly<{ searchParams?: Promise<SearchParams> }>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ["super_admin"] });
  const resolvedParams: SearchParams = (await searchParams) ?? {};
  const notice: string = readParam({ searchParams: resolvedParams, key: "notice" });
  const isSuccess: boolean = readParam({ searchParams: resolvedParams, key: "success" }) === "true";

  const userRecord = await db
    .select({ id: users.id, fullName: users.fullName, email: users.email, avatarUrl: users.avatarUrl, createdAt: users.createdAt })
    .from(users).where(eq(users.id, user.id)).limit(1)
    .then((rows) => rows[0]);

  const initials: string = user.fullName.trim().split(" ").filter((w) => w.length > 0).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("") || "U";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Mon profil</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Gérez vos informations personnelles et votre sécurité</p>
      </div>

      {notice.length > 0 ? (
        <div className={`rounded-xl border px-4 py-3 text-sm ${
          isSuccess
            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
            : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
        }`}>
          {notice}
        </div>
      ) : null}

      {/* Carte identité */}
      <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <div className="flex items-center gap-6">
          <AvatarUpload
            currentAvatarUrl={userRecord?.avatarUrl ?? null}
            initials={initials}
            size="lg"
            shape="rounded"
          />
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">{user.fullName}</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{user.email}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
              <Shield className="size-3" />
              Super-Admin
            </span>
            {userRecord?.createdAt ? (
              <p className="mt-2 text-xs text-zinc-400">
                Compte créé le {userRecord.createdAt.toLocaleDateString("fr-FR")}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Mot de passe */}
      <form action={changePasswordAction} className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1a2332]" suppressHydrationWarning>
        <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-800 dark:text-white">
          <KeyRound className="size-4 text-lbs-blue" />
          Sécurité — Mot de passe
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="newPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Nouveau mot de passe
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              minLength={8}
              placeholder="Minimum 8 caractères"
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-lbs-blue focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
              suppressHydrationWarning
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              minLength={8}
              placeholder="Répétez le mot de passe"
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-lbs-blue focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
            />
          </div>
        </div>
        <button
          type="submit"
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-6 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
        >
          <KeyRound className="size-4" />
          Mettre à jour le mot de passe
        </button>
      </form>
    </div>
  );
}

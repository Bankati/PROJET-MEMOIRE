/**
 * Page de profil de l'agent.
 * Affichage et modification des informations personnelles et du mot de passe.
 */
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Key,
  Mail,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";
import { eq } from "drizzle-orm";

import { requireRole } from "@/lib/auth/server-auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { AvatarUpload } from "@/components/shared/avatar-upload";

type SearchParams = Readonly<Record<string, string | string[] | undefined>>;

const readParam = ({ sp, key }: Readonly<{ sp: SearchParams; key: string }>): string => {
  const raw: string | string[] | undefined = sp[key];
  if (typeof raw === "string") return raw;
  return Array.isArray(raw) ? (raw[0] ?? "") : "";
};

async function updateProfile(formData: FormData): Promise<void> {
  "use server";
  const user = await requireRole({ allowedRoles: ["agent"] });
  const fullName: string = (formData.get("fullName") as string | null) ?? "";
  if (fullName.trim().length === 0) {
    redirect("/dashboard/agent/profile?notice=missing_fields");
    return;
  }
  await db.update(users).set({ fullName: fullName.trim(), updatedAt: new Date() }).where(eq(users.id, user.id));
  redirect("/dashboard/agent/profile?notice=profile_updated");
}

async function changePassword(formData: FormData): Promise<void> {
  "use server";
  const user = await requireRole({ allowedRoles: ["agent"] });
  const currentPassword: string = (formData.get("currentPassword") as string | null) ?? "";
  const newPassword: string = (formData.get("newPassword") as string | null) ?? "";
  const confirmPassword: string = (formData.get("confirmPassword") as string | null) ?? "";
  if (newPassword.length < 6) {
    redirect("/dashboard/agent/profile?notice=password_too_short");
    return;
  }
  if (newPassword !== confirmPassword) {
    redirect("/dashboard/agent/profile?notice=password_mismatch");
    return;
  }
  const currentUser = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, user.id)).limit(1);
  if (currentUser.length === 0 || !verifyPassword({ password: currentPassword, storedHash: currentUser[0].passwordHash })) {
    redirect("/dashboard/agent/profile?notice=wrong_password");
    return;
  }
  await db.update(users).set({ passwordHash: hashPassword({ password: newPassword }), updatedAt: new Date() }).where(eq(users.id, user.id));
  redirect("/dashboard/agent/profile?notice=password_updated");
}

export default async function AgentProfilePage({
  searchParams,
}: Readonly<{ searchParams?: Promise<SearchParams> }>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ["agent"] });
  const sp: SearchParams = (await searchParams) ?? {};
  const notice: string = readParam({ sp, key: "notice" });
  const currentUser = await db
    .select({ fullName: users.fullName, email: users.email, avatarUrl: users.avatarUrl, createdAt: users.createdAt })
    .from(users).where(eq(users.id, user.id)).limit(1);
  const profile = currentUser[0];
  const initials: string = profile.fullName.trim().split(" ").filter((w) => w.length > 0).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join("") || "A";
  const noticeMessages: Readonly<Record<string, { text: string; type: "success" | "error" }>> = {
    profile_updated: { text: "Profil mis à jour avec succès.", type: "success" },
    password_updated: { text: "Mot de passe modifié avec succès.", type: "success" },
    missing_fields: { text: "Veuillez remplir tous les champs obligatoires.", type: "error" },
    password_too_short: { text: "Le nouveau mot de passe doit contenir au moins 6 caractères.", type: "error" },
    password_mismatch: { text: "Les mots de passe ne correspondent pas.", type: "error" },
    wrong_password: { text: "Le mot de passe actuel est incorrect.", type: "error" },
  };
  const currentNotice = notice.length > 0 ? noticeMessages[notice] : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Mon profil</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Gérez vos informations personnelles</p>
      </div>
      {currentNotice ? (
        <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm ${
          currentNotice.type === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
            : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
        }`}>
          {currentNotice.text}
          <Link href="/dashboard/agent/profile" className="ml-auto"><X className="size-4" /></Link>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Carte identité */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
            <div className="mb-4">
              <AvatarUpload
                currentAvatarUrl={profile.avatarUrl ?? null}
                initials={initials}
                size="md"
                shape="circle"
              />
            </div>
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-white">{profile.fullName}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{profile.email}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              <Shield className="size-3" />
              Agent
            </div>
            <p className="mt-4 text-xs text-zinc-400">Membre depuis le {profile.createdAt.toLocaleDateString("fr-FR")}</p>
          </div>
        </div>

        {/* Formulaires */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-white">
              <User className="size-4 text-blue-400" />
              Informations personnelles
            </h3>
            <form action={updateProfile} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Nom complet *</label>
                <input name="fullName" type="text" required defaultValue={profile.fullName} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-lbs-blue focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/15 dark:bg-[#0f1729] dark:text-white" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
                <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-500 dark:border-white/15 dark:bg-white/5 dark:text-zinc-400">
                  <Mail className="size-4" />
                  {profile.email}
                </div>
                <p className="mt-1 text-xs text-zinc-400">L&apos;email ne peut pas être modifié.</p>
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110">
                <Save className="size-4" />
                Enregistrer
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-white">
              <Key className="size-4 text-amber-400" />
              Changer le mot de passe
            </h3>
            <form action={changePassword} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Mot de passe actuel *</label>
                <input name="currentPassword" type="password" required className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-lbs-blue focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/15 dark:bg-[#0f1729] dark:text-white" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Nouveau mot de passe *</label>
                  <input name="newPassword" type="password" required minLength={6} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-lbs-blue focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/15 dark:bg-[#0f1729] dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirmer *</label>
                  <input name="confirmPassword" type="password" required minLength={6} className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 outline-none transition focus:border-lbs-blue focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/15 dark:bg-[#0f1729] dark:text-white" />
                </div>
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110">
                <Key className="size-4" />
                Changer le mot de passe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

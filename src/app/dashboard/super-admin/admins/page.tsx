/**
 * Page dédiée à la gestion des administrateurs.
 * Création, modification et suppression de comptes admin.
 */
import { and, count, eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Pencil, Plus, Trash2, UserCog } from "lucide-react";

import { requireRole } from "@/lib/auth/server-auth";
import { db } from "@/lib/db";
import { campaigns, users } from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";

type SearchParams = Readonly<Record<string, string | string[] | undefined>>;
type UserStatus = "active" | "inactive" | "expired";
type AdminRow = Readonly<{
  id: string;
  fullName: string;
  email: string;
  status: UserStatus;
  createdAt: Date;
  campaignCount: number;
}>;

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
const isUserStatus = (v: string): v is UserStatus => {
  return v === "active" || v === "inactive" || v === "expired";
};
const buildNoticeUrl = ({ notice, mode }: Readonly<{ notice: string; mode?: string }>): string => {
  const params: URLSearchParams = new URLSearchParams();
  params.set("notice", notice);
  if (mode) {
    params.set("mode", mode);
  }
  return `/dashboard/super-admin/admins?${params.toString()}`;
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

const createAdminAction = async (formData: FormData): Promise<void> => {
  "use server";
  const superAdmin = await requireRole({ allowedRoles: ["super_admin"] });
  const fullName: string = readFormValue({ formData, key: "fullName" });
  const email: string = readFormValue({ formData, key: "email" }).toLowerCase();
  const password: string = readFormValue({ formData, key: "password" });
  if (fullName.length < 3 || email.length < 5 || password.length < 8) {
    redirect(buildNoticeUrl({ notice: "Informations invalides. Nom (3+), email, mot de passe (8+) requis.", mode: "create" }));
  }
  const existing: Array<{ id: string }> = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    redirect(buildNoticeUrl({ notice: "Cet email est déjà associé à un compte existant.", mode: "create" }));
  }
  const passwordHash: string = hashPassword({ password });
  await db.insert(users).values({
    email,
    fullName,
    passwordHash,
    role: "admin",
    status: "active",
    createdByUserId: superAdmin.id,
  });
  redirect(buildNoticeUrl({ notice: `Administrateur "${fullName}" créé avec succès.` }));
};
const updateAdminAction = async (formData: FormData): Promise<void> => {
  "use server";
  await requireRole({ allowedRoles: ["super_admin"] });
  const adminId: string = readFormValue({ formData, key: "adminId" });
  const fullName: string = readFormValue({ formData, key: "fullName" });
  const email: string = readFormValue({ formData, key: "email" }).toLowerCase();
  const statusValue: string = readFormValue({ formData, key: "status" });
  if (adminId.length === 0 || fullName.length < 3 || email.length < 5 || !isUserStatus(statusValue)) {
    redirect(buildNoticeUrl({ notice: "Informations de modification invalides." }));
  }
  const duplicate: Array<{ id: string }> = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, email), ne(users.id, adminId)))
    .limit(1);
  if (duplicate.length > 0) {
    redirect(buildNoticeUrl({ notice: "Cet email est déjà utilisé par un autre compte." }));
  }
  await db
    .update(users)
    .set({ fullName, email, status: statusValue, updatedAt: new Date() })
    .where(and(eq(users.id, adminId), eq(users.role, "admin")));
  redirect(buildNoticeUrl({ notice: `Administrateur "${fullName}" mis à jour.` }));
};
const deleteAdminAction = async (formData: FormData): Promise<void> => {
  "use server";
  const superAdmin = await requireRole({ allowedRoles: ["super_admin"] });
  const adminId: string = readFormValue({ formData, key: "adminId" });
  if (adminId.length === 0 || adminId === superAdmin.id) {
    redirect(buildNoticeUrl({ notice: "Suppression impossible pour ce compte." }));
  }
  const linkedCampaigns: Array<{ value: number }> = await db
    .select({ value: count(campaigns.id) })
    .from(campaigns)
    .where(eq(campaigns.createdByAdminId, adminId));
  if ((linkedCampaigns[0]?.value ?? 0) > 0) {
    redirect(buildNoticeUrl({ notice: "Cet administrateur gère des campagnes. Réattribuez-les avant suppression." }));
  }
  await db
    .update(users)
    .set({ managedByAdminId: null, updatedAt: new Date() })
    .where(eq(users.managedByAdminId, adminId));
  await db.delete(users).where(and(eq(users.id, adminId), eq(users.role, "admin")));
  redirect(buildNoticeUrl({ notice: "Compte administrateur supprimé." }));
};

export default async function AdminsPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>;
}>): Promise<React.JSX.Element> {
  await requireRole({ allowedRoles: ["super_admin"] });
  const resolvedParams: SearchParams = (await searchParams) ?? {};
  const notice: string = readParam({ searchParams: resolvedParams, key: "notice" });
  const mode: string = readParam({ searchParams: resolvedParams, key: "mode" });
  const editId: string = readParam({ searchParams: resolvedParams, key: "edit" });
  const adminRecords = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, "admin"));
  const campaignCounts = await db
    .select({
      adminId: campaigns.createdByAdminId,
      value: count(campaigns.id),
    })
    .from(campaigns)
    .groupBy(campaigns.createdByAdminId);
  const campaignMap: ReadonlyMap<string, number> = new Map(
    campaignCounts.map((e) => [e.adminId, e.value]),
  );
  const adminRows: readonly AdminRow[] = adminRecords.map((r) => ({
    id: r.id,
    fullName: r.fullName,
    email: r.email,
    status: r.status,
    createdAt: r.createdAt,
    campaignCount: campaignMap.get(r.id) ?? 0,
  }));
  const editingAdmin: AdminRow | undefined = editId.length > 0
    ? adminRows.find((a) => a.id === editId)
    : undefined;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Gestion des administrateurs</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Créez, modifiez ou supprimez des comptes administrateurs</p>
        </div>
        {mode !== "create" ? (
          <a
            href="/dashboard/super-admin/admins?mode=create"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
          >
            <Plus className="size-4" />
            Créer un administrateur
          </a>
        ) : null}
      </div>
      {notice.length > 0 ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {notice}
        </div>
      ) : null}
      {mode === "create" ? (
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-800 dark:text-white">
            <UserCog className="size-5 text-lbs-blue" />
            Nouveau compte administrateur
          </h2>
          <form action={createAdminAction} className="grid gap-4 md:grid-cols-3" suppressHydrationWarning>
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nom complet</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                minLength={3}
                placeholder="Jean Dupont"
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-lbs-blue focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@plateforme.com"
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-lbs-blue focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Minimum 8 caractères"
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-lbs-blue focus:ring-2 focus:ring-lbs-blue/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
              />
            </div>
            <div className="flex items-end gap-3 md:col-span-3">
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-5 text-sm font-medium text-white transition hover:brightness-110"
              >
                <Plus className="size-4" />
                Créer le compte
              </button>
              <a
                href="/dashboard/super-admin/admins"
                className="inline-flex h-10 items-center rounded-xl border border-zinc-200 px-4 text-sm text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                Annuler
              </a>
            </div>
          </form>
        </div>
      ) : null}
      {editingAdmin ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6 shadow-sm dark:border-blue-500/20 dark:bg-blue-500/5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-800 dark:text-white">
            <Pencil className="size-5 text-blue-500" />
            Modifier — {editingAdmin.fullName}
          </h2>
          <form action={updateAdminAction} className="grid gap-4 md:grid-cols-2" suppressHydrationWarning>
            <input type="hidden" name="adminId" value={editingAdmin.id} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nom complet</label>
              <input
                name="fullName"
                type="text"
                required
                defaultValue={editingAdmin.fullName}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
              <input
                name="email"
                type="email"
                required
                defaultValue={editingAdmin.email}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Statut</label>
              <select
                name="status"
                defaultValue={editingAdmin.status}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none transition focus:border-blue-400 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
                <option value="expired">Expiré</option>
              </select>
            </div>
            <div className="flex items-end gap-3 md:col-span-2">
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Enregistrer les modifications
              </button>
              <a
                href="/dashboard/super-admin/admins"
                className="inline-flex h-10 items-center rounded-xl border border-zinc-200 px-4 text-sm text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                Annuler
              </a>
            </div>
          </form>
        </div>
      ) : null}
      <div className="rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-white/10 dark:text-zinc-400">
                <th className="px-5 py-3">Administrateur</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Campagnes</th>
                <th className="px-5 py-3">Créé le</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-zinc-400">
                    Aucun administrateur créé pour le moment.
                  </td>
                </tr>
              ) : (
                adminRows.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-100 transition hover:bg-zinc-50/60 dark:border-white/5 dark:hover:bg-white/5">
                    <td className="px-5 py-4">
                      <p className="font-medium text-zinc-900 dark:text-white">{row.fullName}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{row.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          row.status === "active"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : row.status === "inactive"
                              ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-500/15 dark:text-zinc-300"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                        }`}
                      >
                        {row.status === "active" ? "Actif" : row.status === "inactive" ? "Inactif" : "Expiré"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-700 dark:text-zinc-200">{row.campaignCount}</td>
                    <td className="px-5 py-4 text-zinc-500 dark:text-zinc-400">{row.createdAt.toISOString().slice(0, 10)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/dashboard/super-admin/admins?edit=${row.id}`}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10"
                          title="Modifier"
                        >
                          <Pencil className="size-3.5" />
                        </a>
                        <form action={deleteAdminAction}>
                          <input type="hidden" name="adminId" value={row.id} />
                          <button
                            type="submit"
                            className="inline-flex size-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/10"
                            title="Supprimer"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
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
    </div>
  );
}

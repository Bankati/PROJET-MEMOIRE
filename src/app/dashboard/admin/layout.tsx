/**
 * Layout partagé pour toutes les pages de l'administrateur.
 * Le AdminLayoutShell client gère l'état collapse/expand de la sidebar.
 * Architecture identique au super-admin avec identité visuelle LBS Blue.
 */
import { eq } from "drizzle-orm";

import { AdminLayoutShell } from "@/components/admin/layout-shell";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { requireRole } from "@/lib/auth/server-auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ["admin"] });
  const row = await db.select({ avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, user.id)).limit(1).then((r) => r[0]);
  return (
    <AdminLayoutShell>
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar fullName={user.fullName} avatarUrl={row?.avatarUrl ?? null} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </AdminLayoutShell>
  );
}

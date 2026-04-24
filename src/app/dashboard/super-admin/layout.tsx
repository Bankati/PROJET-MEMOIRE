/**
 * Layout partagé pour toutes les pages du super-admin.
 * Le LayoutShell client gère l'état collapse/expand de la sidebar.
 */
import { eq } from "drizzle-orm";

import { LayoutShell } from "@/components/super-admin/layout-shell";
import { SuperAdminSidebar } from "@/components/super-admin/sidebar";
import { SuperAdminTopbar } from "@/components/super-admin/topbar";
import { requireRole } from "@/lib/auth/server-auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";

export default async function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ["super_admin"] });
  const row = await db.select({ avatarUrl: users.avatarUrl }).from(users).where(eq(users.id, user.id)).limit(1).then((r) => r[0]);
  return (
    <LayoutShell>
      <SuperAdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <SuperAdminTopbar fullName={user.fullName} avatarUrl={row?.avatarUrl ?? null} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </LayoutShell>
  );
}

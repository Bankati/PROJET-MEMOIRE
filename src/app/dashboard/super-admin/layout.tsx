/**
 * Layout partagé pour toutes les pages du super-admin.
 * Le LayoutShell client gère l'état collapse/expand de la sidebar.
 */
import { LayoutShell } from "@/components/super-admin/layout-shell";
import { SuperAdminSidebar } from "@/components/super-admin/sidebar";
import { SuperAdminTopbar } from "@/components/super-admin/topbar";
import { requireRole } from "@/lib/auth/server-auth";

export default async function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ["super_admin"] });
  return (
    <LayoutShell>
      <SuperAdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <SuperAdminTopbar fullName={user.fullName} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </LayoutShell>
  );
}

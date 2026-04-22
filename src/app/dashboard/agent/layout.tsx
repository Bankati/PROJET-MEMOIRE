/**
 * Layout partagé pour toutes les pages de l'agent.
 * Le AgentLayoutShell client gère l'état collapse/expand de la sidebar.
 * Architecture identique à l'admin avec identité visuelle LBS Blue.
 */
import { AgentLayoutShell } from "@/components/agent/layout-shell";
import { AgentSidebar } from "@/components/agent/sidebar";
import { AgentTopbar } from "@/components/agent/topbar";
import { requireRole } from "@/lib/auth/server-auth";

export default async function AgentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ["agent"] });
  return (
    <AgentLayoutShell>
      <AgentSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AgentTopbar fullName={user.fullName} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </AgentLayoutShell>
  );
}

/**
 * Layout partagé pour toutes les pages de l'agent.
 * Le AgentLayoutShell client gère l'état collapse/expand de la sidebar.
 * Architecture identique à l'admin avec identité visuelle LBS Blue.
 */
import { eq } from 'drizzle-orm'

import { AgentLayoutShell } from '@/components/agent/layout-shell'
import { AgentSidebar } from '@/components/agent/sidebar'
import { AgentTopbar } from '@/components/agent/topbar'
import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import { users } from '@/db/schema'

export default async function AgentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ['agent'] })
  const row = await db
    .select({ avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)
    .then((r) => r[0])
  return (
    <AgentLayoutShell>
      <AgentSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AgentTopbar fullName={user.fullName} avatarUrl={row?.avatarUrl ?? null} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">{children}</main>
      </div>
    </AgentLayoutShell>
  )
}

import { and, desc, eq, gte } from 'drizzle-orm'

import { AgentLayoutShell } from '@/components/agent/layout-shell'
import { AgentSidebar } from '@/components/agent/sidebar'
import { AgentTopbar } from '@/components/agent/topbar'
import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import { broadcastMessages, users } from '@/db/schema'

export default async function AgentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ['agent'] })

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [row, notifications] = await Promise.all([
    db
      .select({ avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)
      .then((r) => r[0]),
    db
      .select({
        id: broadcastMessages.id,
        message: broadcastMessages.message,
        createdAt: broadcastMessages.createdAt,
        senderName: users.fullName,
      })
      .from(broadcastMessages)
      .innerJoin(users, eq(broadcastMessages.sentByUserId, users.id))
      .where(
        and(
          eq(broadcastMessages.recipientRole, 'agent'),
          gte(broadcastMessages.createdAt, since24h)
        )
      )
      .orderBy(desc(broadcastMessages.createdAt))
      .limit(20),
  ])

  const notificationIds = notifications.map((n) => n.id)

  return (
    <AgentLayoutShell notificationIds={notificationIds}>
      <AgentSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AgentTopbar
          fullName={user.fullName}
          avatarUrl={row?.avatarUrl ?? null}
          notifications={notifications}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">{children}</main>
      </div>
    </AgentLayoutShell>
  )
}

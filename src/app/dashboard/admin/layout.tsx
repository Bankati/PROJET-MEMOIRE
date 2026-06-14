/**
 * Layout partagé pour toutes les pages de l'administrateur.
 * Le AdminLayoutShell client gère l'état collapse/expand de la sidebar.
 * Architecture identique au super-admin avec identité visuelle LBS Blue.
 */
import { desc, eq } from 'drizzle-orm'

import { AdminLayoutShell } from '@/components/admin/layout-shell'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminTopbar } from '@/components/admin/topbar'
import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import { broadcastMessages, users } from '@/db/schema'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): Promise<React.JSX.Element> {
  const user = await requireRole({ allowedRoles: ['admin'] })
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
      .where(eq(broadcastMessages.recipientRole, 'admin'))
      .orderBy(desc(broadcastMessages.createdAt))
      .limit(20),
  ])
  const notificationIds = notifications.map((n) => n.id)
  return (
    <AdminLayoutShell notificationIds={notificationIds}>
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar
          fullName={user.fullName}
          avatarUrl={row?.avatarUrl ?? null}
          notifications={notifications}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">{children}</main>
      </div>
    </AdminLayoutShell>
  )
}

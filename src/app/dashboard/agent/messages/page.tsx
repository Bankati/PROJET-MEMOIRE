import { and, desc, eq, gte } from 'drizzle-orm'
import { Megaphone, MessageSquare } from 'lucide-react'

import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import { broadcastMessages, users } from '@/db/schema'
import { MarkAgentMessagesRead } from '@/components/agent/mark-messages-read'

export default async function AgentMessagesPage(): Promise<React.JSX.Element> {
  await requireRole({ allowedRoles: ['agent'] })

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const messages = await db
    .select({
      id: broadcastMessages.id,
      message: broadcastMessages.message,
      createdAt: broadcastMessages.createdAt,
      senderName: users.fullName,
    })
    .from(broadcastMessages)
    .innerJoin(users, eq(broadcastMessages.sentByUserId, users.id))
    .where(
      and(eq(broadcastMessages.recipientRole, 'agent'), gte(broadcastMessages.createdAt, since24h))
    )
    .orderBy(desc(broadcastMessages.createdAt))
    .limit(50)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <MarkAgentMessagesRead />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Messages</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Communications reçues de votre administration
          </p>
        </div>
        <span className="rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500 dark:border-white/10 dark:bg-white/10 dark:text-zinc-400">
          Dernières 24h
        </span>
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-white py-16 text-center dark:border-white/10 dark:bg-[#1a2332]">
          <div className="grid size-14 place-items-center rounded-2xl bg-zinc-100 dark:bg-white/10">
            <MessageSquare className="size-7 text-zinc-400 dark:text-zinc-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Aucun message</p>
            <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
              Aucune communication reçue au cours des dernières 24 heures.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#244976] to-[#21416C] shadow-sm">
                  <Megaphone className="size-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-white">
                    {msg.senderName}
                  </p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    {msg.createdAt.toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-zinc-700 dark:text-zinc-200">
                {msg.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

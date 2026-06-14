import { desc, eq } from 'drizzle-orm'
import { Megaphone, MessageSquare } from 'lucide-react'

import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import { broadcastMessages, users } from '@/db/schema'
import { MarkMessagesRead } from '@/components/admin/mark-messages-read'

export default async function AdminMessagesPage(): Promise<React.JSX.Element> {
  await requireRole({ allowedRoles: ['admin'] })

  const messages = await db
    .select({
      id: broadcastMessages.id,
      message: broadcastMessages.message,
      createdAt: broadcastMessages.createdAt,
      senderName: users.fullName,
    })
    .from(broadcastMessages)
    .innerJoin(users, eq(broadcastMessages.sentByUserId, users.id))
    .orderBy(desc(broadcastMessages.createdAt))
    .limit(100)

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentCount = messages.filter((m) => m.createdAt >= sevenDaysAgo).length

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <MarkMessagesRead />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Messages</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Communications diffusées par la direction
          </p>
        </div>
        {recentCount > 0 ? (
          <span className="border-lbs-blue/30 bg-lbs-blue/10 text-lbs-blue inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold dark:border-blue-400/30 dark:bg-blue-500/15 dark:text-blue-300">
            <span className="bg-lbs-blue size-1.5 rounded-full dark:bg-blue-400" />
            {recentCount} nouveau{recentCount > 1 ? 'x' : ''} cette semaine
          </span>
        ) : null}
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-200 bg-white py-16 text-center dark:border-white/10 dark:bg-[#1a2332]">
          <div className="grid size-14 place-items-center rounded-2xl bg-zinc-100 dark:bg-white/10">
            <MessageSquare className="size-7 text-zinc-400 dark:text-zinc-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Aucun message</p>
            <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
              La direction n&apos;a pas encore envoyé de communication.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const isRecent = msg.createdAt >= sevenDaysAgo
            return (
              <div
                key={msg.id}
                className={`relative rounded-2xl border bg-white p-5 shadow-sm transition dark:bg-[#1a2332] ${
                  isRecent
                    ? 'border-lbs-blue/30 dark:border-blue-400/20'
                    : 'border-zinc-200/70 dark:border-white/10'
                }`}
              >
                {isRecent ? (
                  <span className="bg-lbs-blue/10 text-lbs-blue absolute top-4 right-4 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase dark:bg-blue-500/15 dark:text-blue-300">
                    <span className="bg-lbs-blue size-1.5 animate-pulse rounded-full dark:bg-blue-400" />
                    Nouveau
                  </span>
                ) : null}

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
            )
          })}
        </div>
      )}
    </div>
  )
}

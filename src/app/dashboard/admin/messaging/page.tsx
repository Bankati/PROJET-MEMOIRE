import { and, count, desc, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { Megaphone, Send } from 'lucide-react'

import { requireRole } from '@/lib/auth/server-auth'
import { db } from '@/lib/db'
import { broadcastMessages, users } from '@/db/schema'

type SearchParams = Readonly<Record<string, string | string[] | undefined>>

const readParam = ({
  searchParams,
  key,
}: Readonly<{ searchParams: SearchParams; key: string }>): string => {
  const raw: string | string[] | undefined = searchParams[key]
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw)) return raw[0] ?? ''
  return ''
}

const broadcastAction = async (formData: FormData): Promise<void> => {
  'use server'
  const admin = await requireRole({ allowedRoles: ['admin'] })
  const message: string = ((formData.get('message') as string | null) ?? '').trim()
  if (message.length < 8) {
    redirect(
      '/dashboard/admin/messaging?notice=Le+message+doit+contenir+au+moins+8+caractères.&success=false'
    )
    return
  }
  const [row] = await db
    .select({ value: count(users.id) })
    .from(users)
    .where(and(eq(users.role, 'agent'), eq(users.status, 'active')))
  const recipientCount: number = row?.value ?? 0
  await db.insert(broadcastMessages).values({
    sentByUserId: admin.id,
    message,
    recipientCount,
    recipientRole: 'agent',
  })
  redirect(
    `/dashboard/admin/messaging?notice=Message+envoyé+à+${recipientCount}+agent${recipientCount > 1 ? 's' : ''}+actif${recipientCount > 1 ? 's' : ''}.&success=true`
  )
}

export default async function AdminMessagingPage({
  searchParams,
}: Readonly<{
  searchParams?: Promise<SearchParams>
}>): Promise<React.JSX.Element> {
  const admin = await requireRole({ allowedRoles: ['admin'] })
  const resolvedParams: SearchParams = (await searchParams) ?? {}
  const notice: string = readParam({ searchParams: resolvedParams, key: 'notice' })
  const isSuccess: boolean = readParam({ searchParams: resolvedParams, key: 'success' }) === 'true'

  const [agentRow] = await db
    .select({ value: count(users.id) })
    .from(users)
    .where(and(eq(users.role, 'agent'), eq(users.status, 'active')))
  const activeAgentsCount: number = agentRow?.value ?? 0

  const history = await db
    .select({
      id: broadcastMessages.id,
      message: broadcastMessages.message,
      recipientCount: broadcastMessages.recipientCount,
      createdAt: broadcastMessages.createdAt,
      senderName: users.fullName,
    })
    .from(broadcastMessages)
    .innerJoin(users, eq(broadcastMessages.sentByUserId, users.id))
    .where(
      and(
        eq(broadcastMessages.sentByUserId, admin.id),
        eq(broadcastMessages.recipientRole, 'agent')
      )
    )
    .orderBy(desc(broadcastMessages.createdAt))
    .limit(50)

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Messagerie agents</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Diffusez un message à tous les agents actifs
        </p>
      </div>

      {notice.length > 0 ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            isSuccess
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
              : 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
          }`}
        >
          {notice}
        </div>
      ) : null}

      {/* Destinataires */}
      <div className="rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#244976] to-[#21416C] text-white shadow-sm">
            <Megaphone className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-white">Destinataires</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {activeAgentsCount} agent{activeAgentsCount > 1 ? 's' : ''} actif
              {activeAgentsCount > 1 ? 's' : ''} recevront ce message
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form action={broadcastAction} className="space-y-4" suppressHydrationWarning>
        <div className="rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          <div className="space-y-1.5">
            <label
              htmlFor="message"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              minLength={8}
              rows={5}
              placeholder="Rédigez ici votre communication à l'ensemble des agents..."
              className="focus:border-lbs-blue focus:ring-lbs-blue/20 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 transition outline-none focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100"
            />
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#244976] to-[#21416C] px-6 text-sm font-medium text-white shadow-sm transition hover:brightness-110"
        >
          <Send className="size-4" />
          Envoyer à tous les agents
        </button>
      </form>

      {/* Historique */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-zinc-800 dark:text-white">Historique</h2>
        <div className="rounded-2xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/10 dark:bg-[#1a2332]">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Megaphone className="size-8 text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm text-zinc-400 dark:text-zinc-500">
                Aucun message envoyé pour l&apos;instant.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-xs text-zinc-400 uppercase dark:border-white/10 dark:text-zinc-500">
                    <th className="px-5 py-3">Message</th>
                    <th className="px-5 py-3 whitespace-nowrap">Agents</th>
                    <th className="px-5 py-3 whitespace-nowrap">Envoyé le</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((msg) => (
                    <tr
                      key={msg.id}
                      className="border-b border-zinc-50 last:border-0 dark:border-white/5"
                    >
                      <td className="max-w-xs px-5 py-3">
                        <p className="line-clamp-2 text-zinc-800 dark:text-zinc-100">
                          {msg.message}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                          par {msg.senderName}
                        </p>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className="bg-lbs-blue/10 text-lbs-blue inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium dark:bg-blue-500/15 dark:text-blue-300">
                          {msg.recipientCount} agent{msg.recipientCount > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs whitespace-nowrap text-zinc-400 dark:text-zinc-500">
                        {msg.createdAt.toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

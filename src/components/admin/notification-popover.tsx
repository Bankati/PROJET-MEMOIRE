'use client'

import { Bell, Megaphone } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useNotifications } from '@/components/admin/layout-shell'

type NotificationItem = Readonly<{
  id: string
  message: string
  senderName: string
  createdAt: Date
}>

type NotificationPopoverProps = Readonly<{
  notifications: readonly NotificationItem[]
}>

function Dot({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      width="6"
      height="6"
      fill="currentColor"
      viewBox="0 0 6 6"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  )
}

const formatRelative = (date: Date): string => {
  const now = Date.now()
  const diff = now - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export const NotificationPopover = ({
  notifications,
}: NotificationPopoverProps): React.JSX.Element => {
  const { unreadCount, isRead, markAsRead, markAllAsRead } = useNotifications()

  const items = notifications.map((n) => ({
    ...n,
    unread: !isRead(n.id),
  }))

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          suppressHydrationWarning
          className="relative grid size-9 place-items-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/10"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="bg-lbs-blue absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={8} className="w-80 p-1">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Notifications</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-lbs-blue text-xs font-medium hover:underline dark:text-blue-400"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
        <div className="mx-1 my-1 h-px bg-zinc-200 dark:bg-white/10" />

        {/* Empty state */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <Bell className="size-8 text-zinc-300 dark:text-zinc-600" />
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Aucune notification</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {items.map((notif) => (
              <div
                key={notif.id}
                className="rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-white/5"
              >
                <div className="relative flex items-start gap-3 pe-4">
                  <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-[#244976] to-[#21416C]">
                    <Megaphone className="size-3.5 text-white" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => markAsRead(notif.id)}
                      className="w-full text-left after:absolute after:inset-0"
                    >
                      <p className="line-clamp-2 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          {notif.senderName}
                        </span>{' '}
                        {notif.message}
                      </p>
                    </button>
                    <p
                      className="text-[11px] text-zinc-400 dark:text-zinc-500"
                      suppressHydrationWarning
                    >
                      {formatRelative(notif.createdAt)}
                    </p>
                  </div>
                  {notif.unread && (
                    <div className="absolute end-0 top-1/2 -translate-y-1/2">
                      <span className="sr-only">Non lu</span>
                      <Dot className="text-lbs-blue" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

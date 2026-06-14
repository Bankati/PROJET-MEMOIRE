'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Clock, Menu } from 'lucide-react'

import { LogoutButton } from '@/components/auth/logout-button'
import { ThemeSwitch } from '@/components/ui/theme-switch-button'
import { useAdminSidebar } from '@/components/admin/layout-shell'
import { NotificationPopover } from '@/components/admin/notification-popover'

type Notification = Readonly<{
  id: string
  message: string
  senderName: string
  createdAt: Date
}>

type TopbarProps = Readonly<{
  fullName: string
  avatarUrl: string | null
  notifications?: readonly Notification[]
}>

const extractInitials = ({ fullName }: Readonly<{ fullName: string }>): string => {
  const parts: string[] = fullName
    .trim()
    .split(' ')
    .filter((w) => w.length > 0)
  if (parts.length === 0) return 'A'
  return parts
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
}

const pageTitleMap: Readonly<Record<string, string>> = {
  '/dashboard/admin': 'Dashboard',
  '/dashboard/admin/campaigns': 'Campagnes',
  '/dashboard/admin/contacts': 'Contacts',
  '/dashboard/admin/prospects': 'Prospects',
  '/dashboard/admin/agents': 'Agents',
  '/dashboard/admin/calls': 'Mes contacts',
  '/dashboard/admin/assistant': 'Assistant IA',
  '/dashboard/admin/performance': 'Performances',
  '/dashboard/admin/export': 'Export',
  '/dashboard/admin/profile': 'Mon profil',
  '/dashboard/admin/messages': 'Messages',
  '/dashboard/admin/rappels': 'Rappels',
}

const buildPageTitle = ({ pathname }: Readonly<{ pathname: string }>): string => {
  if (pageTitleMap[pathname]) return pageTitleMap[pathname]
  if (pathname.startsWith('/dashboard/admin/calls/')) return 'Mes contacts'
  if (pathname.startsWith('/dashboard/admin/campaigns/')) return 'Campagnes'
  if (pathname.startsWith('/dashboard/admin/contacts/')) return 'Contacts'
  if (pathname.startsWith('/dashboard/admin/agents/')) return 'Agents'
  return 'Administration'
}

const buildGreeting = (): string => {
  const hour: number = new Date().getHours()
  if (hour < 12) return 'Bonjour'
  if (hour < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

export const AdminTopbar = ({
  fullName,
  avatarUrl,
  notifications = [],
}: TopbarProps): React.JSX.Element => {
  const pathname: string = usePathname()
  const { toggle, openMobile } = useAdminSidebar()
  const initials: string = extractInitials({ fullName })
  const pageTitle: string = buildPageTitle({ pathname })
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    const updateTime = (): void => {
      setCurrentTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
    }
    updateTime()
    const interval: ReturnType<typeof setInterval> = setInterval(updateTime, 30000)
    return () => clearInterval(interval)
  }, [])

  /* Sur mobile → ouvre le drawer ; sur desktop → collapse/expand */
  const handleMenu = useCallback((): void => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      openMobile()
    } else {
      toggle()
    }
  }, [openMobile, toggle])

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200/70 bg-white px-3 sm:h-16 sm:px-6 dark:border-white/10 dark:bg-[#111827]">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={handleMenu}
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 dark:border-white/15 dark:text-zinc-300 dark:hover:bg-white/10"
          aria-label="Menu"
        >
          <Menu className="size-4" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-zinc-800 sm:text-lg dark:text-white">
            {pageTitle}
          </h2>
          <p className="hidden text-[11px] text-zinc-400 sm:block dark:text-zinc-500">
            {buildGreeting()}, {fullName.split(' ')[0]}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-3">
        {currentTime.length > 0 ? (
          <div className="hidden items-center gap-1.5 rounded-lg border border-zinc-100 px-2.5 py-1.5 text-xs text-zinc-500 md:flex dark:border-white/10 dark:text-zinc-400">
            <Clock className="size-3" />
            {currentTime}
          </div>
        ) : null}
        <NotificationPopover notifications={notifications} />
        <ThemeSwitch />
        <Link
          href="/dashboard/admin/profile"
          className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-2 py-1.5 transition hover:bg-zinc-100 sm:px-3 dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/15"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={fullName}
              className="size-7 rounded-full object-cover sm:size-8"
            />
          ) : (
            <div className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-[#244976] to-[#21416C] text-xs font-semibold text-white sm:size-8">
              {initials}
            </div>
          )}
          <div className="hidden text-left sm:block">
            <p className="max-w-[120px] truncate text-sm font-medium text-zinc-800 dark:text-white">
              {fullName}
            </p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Administrateur</p>
          </div>
        </Link>
        <LogoutButton />
      </div>
    </header>
  )
}

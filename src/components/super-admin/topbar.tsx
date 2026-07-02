'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Clock, Megaphone, Menu, Search } from 'lucide-react'

import { LogoutButton } from '@/components/auth/logout-button'
import { ThemeSwitch } from '@/components/ui/theme-switch-button'
import { useSidebar } from '@/components/super-admin/layout-shell'

type TopbarProps = Readonly<{
  fullName: string
  avatarUrl: string | null
}>

const extractInitials = ({ fullName }: Readonly<{ fullName: string }>): string => {
  const parts: string[] = fullName
    .trim()
    .split(' ')
    .filter((w) => w.length > 0)
  if (parts.length === 0) return 'U'
  return parts
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('')
}

const buildPageTitle = ({ pathname }: Readonly<{ pathname: string }>): string => {
  const map: Readonly<Record<string, string>> = {
    '/dashboard/super-admin': 'Dashboard',
    '/dashboard/super-admin/admins': 'Administrateurs',
    '/dashboard/super-admin/campaigns': 'Campagnes',
    '/dashboard/super-admin/analytics': 'Statistiques',
    '/dashboard/super-admin/messaging': 'Messagerie',
    '/dashboard/super-admin/profile': 'Mon profil',
  }
  return map[pathname] ?? 'Super-Admin'
}

const buildGreeting = (): string => {
  const hour: number = new Date().getHours()
  if (hour < 12) return 'Bonjour'
  if (hour < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

export const SuperAdminTopbar = ({ fullName, avatarUrl }: TopbarProps): React.JSX.Element => {
  const pathname: string = usePathname()
  const { toggle, openMobile } = useSidebar()
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

  const handleMenu = useCallback((): void => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      openMobile()
    } else {
      toggle()
    }
  }, [openMobile, toggle])

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-100 bg-white px-3 sm:h-16 sm:px-5 dark:border-white/[0.08] dark:bg-[#0f172a]">
      {/* Left: menu toggle + page info */}
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <button
          type="button"
          onClick={handleMenu}
          className="grid size-9 shrink-0 place-items-center rounded-xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 dark:border-white/[0.12] dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
          aria-label="Menu"
        >
          <Menu className="size-4" />
        </button>
        <div className="hidden min-w-0 sm:block">
          <h2 className="truncate text-sm font-semibold text-gray-900 sm:text-base dark:text-white">
            {pageTitle}
          </h2>
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            {buildGreeting()}, {fullName.split(' ')[0]}
          </p>
        </div>
        <h2 className="truncate text-sm font-semibold text-gray-900 sm:hidden dark:text-white">
          {pageTitle}
        </h2>
      </div>

      {/* Center: Search bar — inspired by Fundex */}
      <div className="hidden flex-1 items-center justify-center md:flex">
        <div className="flex w-full max-w-sm items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-400 transition-colors hover:border-gray-300 dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-gray-500 dark:hover:border-white/[0.16]">
          <Search className="size-4 shrink-0" />
          <span className="flex-1 truncate select-none">Rechercher campagne, admin...</span>
          <kbd className="ml-auto shrink-0 rounded-md border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:border-white/[0.12] dark:text-gray-500">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: actions */}
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {currentTime.length > 0 ? (
          <div className="hidden items-center gap-1.5 rounded-xl border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 md:flex dark:border-white/[0.1] dark:text-gray-400">
            <Clock className="size-3" />
            {currentTime}
          </div>
        ) : null}

        <Link
          href="/dashboard/super-admin/messaging"
          className="relative grid size-9 shrink-0 place-items-center rounded-xl border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 dark:border-white/[0.12] dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
          aria-label="Messagerie"
        >
          <Megaphone className="size-4" />
          <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#244976]" />
        </Link>

        <ThemeSwitch />

        <Link
          href="/dashboard/super-admin/profile"
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-2 py-1.5 transition hover:bg-gray-100 sm:px-2.5 dark:border-white/[0.12] dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
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
            <p className="max-w-[110px] truncate text-xs font-semibold text-gray-900 dark:text-white">
              {fullName}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">Super-Admin</p>
          </div>
        </Link>

        <LogoutButton />
      </div>
    </header>
  )
}

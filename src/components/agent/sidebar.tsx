'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import {
  BarChart3,
  Bell,
  ChevronsLeft,
  ChevronsRight,
  Contact,
  Headphones,
  LayoutDashboard,
  MessageSquare,
  UserCircle2,
  X,
  Zap,
} from 'lucide-react'

import { useAgentSidebar, useAgentNotifications } from '@/components/agent/layout-shell'

type NavItem = Readonly<{
  id: string
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}>

type NavSection = Readonly<{
  label: string
  items: readonly NavItem[]
}>

const isActiveRoute = ({
  pathname,
  href,
}: Readonly<{ pathname: string; href: string }>): boolean => {
  if (href === '/dashboard/agent') return pathname === '/dashboard/agent'
  return pathname.startsWith(href)
}

export const AgentSidebar = (): React.JSX.Element => {
  const pathname: string = usePathname()
  const { isCollapsed, toggle, isMobileOpen, closeMobile } = useAgentSidebar()
  const { unreadCount } = useAgentNotifications()

  const navSections: readonly NavSection[] = [
    {
      label: "Vue d'ensemble",
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/dashboard/agent',
          icon: <LayoutDashboard className="size-[18px] shrink-0" />,
        },
      ],
    },
    {
      label: 'Terrain',
      items: [
        {
          id: 'contacts',
          label: 'Mes contacts',
          href: '/dashboard/agent/contacts',
          icon: <Contact className="size-[18px] shrink-0" />,
        },
        {
          id: 'rappels',
          label: 'Rappels',
          href: '/dashboard/agent/rappels',
          icon: <Bell className="size-[18px] shrink-0" />,
        },
        {
          id: 'performance',
          label: 'Mes appels',
          href: '/dashboard/agent/performance',
          icon: <BarChart3 className="size-[18px] shrink-0" />,
        },
      ],
    },
    {
      label: 'Communication',
      items: [
        {
          id: 'messages',
          label: 'Messages',
          href: '/dashboard/agent/messages',
          icon: <MessageSquare className="size-[18px] shrink-0" />,
          badge: unreadCount,
        },
      ],
    },
    {
      label: 'Compte',
      items: [
        {
          id: 'profile',
          label: 'Mon profil',
          href: '/dashboard/agent/profile',
          icon: <UserCircle2 className="size-[18px] shrink-0" />,
        },
      ],
    },
  ]

  useEffect(() => {
    closeMobile()
  }, [pathname, closeMobile])

  return (
    <aside
      className={[
        'flex shrink-0 flex-col bg-white dark:bg-[#0f172a]',
        'border-r border-gray-100 dark:border-white/[0.08]',
        'fixed inset-y-0 left-0 z-50 h-screen w-[260px]',
        'transform transition-transform duration-300 ease-in-out',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:relative lg:inset-auto lg:z-auto lg:h-full lg:translate-x-0',
        isCollapsed ? 'lg:w-[72px]' : 'lg:w-[240px]',
      ].join(' ')}
    >
      {/* Close button — mobile only */}
      <button
        type="button"
        onClick={closeMobile}
        aria-label="Fermer le menu"
        className="absolute top-3 right-3 grid size-7 place-items-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 lg:hidden"
      >
        <X className="size-4" />
      </button>

      {/* Logo */}
      <div
        className={`flex items-center py-5 transition-all duration-300 ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-5'}`}
      >
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#244976] text-sm font-bold text-white shadow-sm">
          L
        </div>
        {isCollapsed ? null : (
          <div className="min-w-0 overflow-hidden">
            <span className="block truncate text-sm font-bold text-gray-900 dark:text-white">
              LBS Center
            </span>
            <span className="block truncate text-[10px] text-gray-400 dark:text-gray-500">
              Espace agent
            </span>
          </div>
        )}
      </div>

      <div className="mx-4 mb-2 h-px bg-gray-100 dark:bg-white/[0.08]" />

      {/* Navigation */}
      <nav className={`flex-1 space-y-0.5 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {navSections.map((section, sectionIdx) => (
          <div key={section.label} className={isCollapsed ? '' : 'mb-1'}>
            {isCollapsed ? null : (
              <p
                className={`mb-1 ${sectionIdx === 0 ? 'mt-1' : 'mt-3'} px-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase dark:text-gray-600`}
              >
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const isActive: boolean = isActiveRoute({ pathname, href: item.href })
              const showBadge = (item.badge ?? 0) > 0
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={[
                    'group relative flex items-center rounded-xl transition-all duration-200',
                    isCollapsed ? 'mx-auto justify-center p-2.5' : 'gap-3 px-3 py-2.5',
                    'text-sm',
                    isActive
                      ? 'bg-[#EBF3FC] font-semibold text-[#244976] dark:bg-[#244976]/15 dark:text-blue-300'
                      : 'font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
                  ].join(' ')}
                >
                  {isActive && !isCollapsed ? (
                    <span className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#244976] dark:bg-blue-400" />
                  ) : null}
                  <span className="relative shrink-0">
                    {item.icon}
                    {showBadge && isCollapsed ? (
                      <span className="absolute -top-1 -right-1 size-2 rounded-full bg-red-400" />
                    ) : null}
                  </span>
                  {isCollapsed ? null : (
                    <span className="flex flex-1 items-center truncate">
                      <span className="truncate">{item.label}</span>
                      {showBadge ? (
                        <span className="ml-auto shrink-0 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] leading-none font-bold text-white">
                          {item.badge}
                        </span>
                      ) : null}
                    </span>
                  )}
                  {isCollapsed ? (
                    <span className="pointer-events-none absolute left-full ml-2 rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 dark:bg-zinc-800">
                      {item.label}
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="mx-4 mb-3 h-px bg-gray-100 dark:bg-white/[0.08]" />

      {/* Collapse toggle */}
      <div className={`pb-3 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <button
          type="button"
          onClick={toggle}
          className="hidden w-full items-center justify-center gap-2 rounded-xl border border-gray-100 py-2 text-xs font-medium text-gray-400 transition-all duration-200 hover:bg-gray-50 hover:text-gray-600 lg:flex dark:border-white/[0.08] dark:text-gray-500 dark:hover:bg-white/5 dark:hover:text-gray-300"
        >
          {isCollapsed ? (
            <ChevronsRight className="size-4" />
          ) : (
            <>
              <ChevronsLeft className="size-4" />
              <span>Réduire</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom role card — inspired by Fundex "Upgrade to pro" */}
      {isCollapsed ? null : (
        <div className="px-4 pb-5">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#244976] to-[#1a3354] p-4 shadow-md">
            <div className="mb-2 flex items-center gap-2">
              <div className="grid size-6 place-items-center rounded-lg bg-white/15">
                <Headphones className="size-3.5 text-blue-200" />
              </div>
              <p className="text-xs font-semibold text-white">Agent LBS</p>
            </div>
            <p className="text-[11px] leading-relaxed text-white/55">
              Gérez vos appels et suivez vos performances en temps réel
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              <Zap className="size-3 text-yellow-300" />
              <span className="text-[10px] font-medium text-yellow-300">LBS Call Center v1.0</span>
            </div>
            <div className="pointer-events-none absolute -right-4 -bottom-4 size-20 rounded-full bg-white/[0.04]" />
            <div className="pointer-events-none absolute -right-1 -bottom-7 size-12 rounded-full bg-white/[0.04]" />
          </div>
        </div>
      )}
    </aside>
  )
}

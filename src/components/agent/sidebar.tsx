'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import {
  Bell,
  ChevronsLeft,
  ChevronsRight,
  Contact,
  LayoutDashboard,
  UserCircle2,
  X,
} from 'lucide-react'

import { useAgentSidebar } from '@/components/agent/layout-shell'

type NavItem = Readonly<{
  id: string
  label: string
  href: string
  icon: React.ReactNode
}>

const navItems: readonly NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard/agent',
    icon: <LayoutDashboard className="size-[18px] shrink-0" />,
  },
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
    id: 'profile',
    label: 'Mon profil',
    href: '/dashboard/agent/profile',
    icon: <UserCircle2 className="size-[18px] shrink-0" />,
  },
]

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

  useEffect(() => {
    closeMobile()
  }, [pathname, closeMobile])

  return (
    <aside
      className={[
        'flex shrink-0 flex-col bg-gradient-to-b from-[#244976] via-[#21416C] to-[#1a3354]',
        'dark:from-[#152c4c] dark:via-[#112240] dark:to-[#0d1a33]',
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
        className="absolute top-3 right-3 grid size-7 place-items-center rounded-lg text-white/50 transition hover:bg-white/[0.15] hover:text-white active:bg-white/20 lg:hidden"
      >
        <X className="size-4" />
      </button>

      <div
        className={`flex items-center py-6 transition-all duration-300 ${isCollapsed ? 'justify-center px-2' : 'gap-2.5 px-6'}`}
      >
        <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/20 text-sm font-bold text-white shadow-inner">
          L
        </div>
        {isCollapsed ? null : (
          <div className="min-w-0 overflow-hidden">
            <span className="block truncate text-base font-semibold tracking-wide text-white">
              LBS Center
            </span>
            <span className="block truncate text-[10px] text-white/50">Espace agent</span>
          </div>
        )}
      </div>
      <div className="mx-4 mb-3 h-px bg-white/15" />
      <nav className={`flex-1 space-y-0.5 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {navItems.map((item) => {
          const isActive: boolean = isActiveRoute({ pathname, href: item.href })
          return (
            <Link
              key={item.id}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`group relative flex items-center rounded-xl transition-all duration-200 ${
                isCollapsed ? 'justify-center px-0 py-2.5 lg:justify-center' : 'gap-3 px-4 py-2.5'
              } text-sm font-medium ${
                isActive
                  ? 'bg-white/20 text-white shadow-sm'
                  : 'text-white/70 hover:bg-white/[0.15] hover:text-white active:bg-white/[0.22]'
              }`}
            >
              {isActive ? (
                <span className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-white" />
              ) : null}
              {item.icon}
              {isCollapsed ? null : <span className="truncate">{item.label}</span>}
              {isCollapsed ? (
                <span className="pointer-events-none absolute left-full ml-2 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 dark:bg-zinc-800">
                  {item.label}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>
      <div className="mx-4 mb-3 h-px bg-white/15" />
      <div className={`pb-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <button
          type="button"
          onClick={toggle}
          className="hidden w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-white/70 transition-all duration-200 hover:bg-white/[0.22] hover:text-white active:bg-white/[0.28] lg:flex"
        >
          {isCollapsed ? (
            <ChevronsRight className="size-4" />
          ) : (
            <>
              <ChevronsLeft className="size-4" />
              <span className="text-xs font-medium">Réduire</span>
            </>
          )}
        </button>
      </div>
      {isCollapsed ? null : (
        <div className="px-4 pb-6">
          <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs font-medium text-white/70">Plateforme LBS</p>
            <p className="mt-0.5 text-[11px] text-white/40">Call Center v1.0</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-3/4 rounded-full bg-white/40" />
            </div>
            <p className="mt-1 text-[10px] text-white/30">Utilisation système</p>
          </div>
        </div>
      )}
    </aside>
  )
}

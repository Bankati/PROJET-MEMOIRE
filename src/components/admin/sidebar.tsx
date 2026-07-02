'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ArrowRightLeft,
  BarChart3,
  Bell,
  Bot,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Contact,
  FolderOpen,
  LayoutDashboard,
  Megaphone,
  MessageSquare,
  Shield,
  UserCircle2,
  Users,
  X,
  Zap,
} from 'lucide-react'

import { useAdminSidebar, useNotifications } from '@/components/admin/layout-shell'

type NavItem = Readonly<{
  id: string
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
}>

const topNavItems: readonly NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard/admin',
    icon: <LayoutDashboard className="size-[18px] shrink-0" />,
  },
]

const gestionItems: readonly NavItem[] = [
  {
    id: 'campaigns',
    label: 'Campagnes',
    href: '/dashboard/admin/campaigns',
    icon: <Megaphone className="size-[18px] shrink-0" />,
  },
  {
    id: 'contacts',
    label: 'Contacts',
    href: '/dashboard/admin/contacts',
    icon: <Contact className="size-[18px] shrink-0" />,
  },
  {
    id: 'prospects',
    label: 'Prospects',
    href: '/dashboard/admin/prospects',
    icon: <ArrowRightLeft className="size-[18px] shrink-0" />,
  },
  {
    id: 'agents',
    label: 'Agents',
    href: '/dashboard/admin/agents',
    icon: <Users className="size-[18px] shrink-0" />,
  },
]

const isActiveRoute = ({
  pathname,
  href,
}: Readonly<{ pathname: string; href: string }>): boolean => {
  if (href === '/dashboard/admin') return pathname === '/dashboard/admin'
  return pathname.startsWith(href)
}

const isGestionActive = (pathname: string): boolean =>
  gestionItems.some((item) => pathname.startsWith(item.href))

const contactsRappelsItems: readonly NavItem[] = [
  {
    id: 'calls',
    label: 'Mes contacts',
    href: '/dashboard/admin/calls',
    icon: <Contact className="size-[18px] shrink-0" />,
  },
  {
    id: 'rappels',
    label: 'Rappels',
    href: '/dashboard/admin/rappels',
    icon: <Bell className="size-[18px] shrink-0" />,
  },
]

const isContactsRappelsActive = (pathname: string): boolean =>
  contactsRappelsItems.some((item) => pathname.startsWith(item.href))

export const AdminSidebar = (): React.JSX.Element => {
  const pathname: string = usePathname()
  const { isCollapsed, toggle, isMobileOpen, closeMobile } = useAdminSidebar()
  const { unreadCount: recentMessagesCount } = useNotifications()
  const [gestionOpen, setGestionOpen] = useState<boolean>(() => isGestionActive(pathname))
  const [contactsOpen, setContactsOpen] = useState<boolean>(() => isContactsRappelsActive(pathname))

  useEffect(() => {
    closeMobile()
  }, [pathname, closeMobile])

  const commsNavItems: readonly NavItem[] = [
    {
      id: 'messaging',
      label: 'Messagerie',
      href: '/dashboard/admin/messaging',
      icon: <Megaphone className="size-[18px] shrink-0" />,
    },
    {
      id: 'messages',
      label: 'Messages',
      href: '/dashboard/admin/messages',
      icon: <MessageSquare className="size-[18px] shrink-0" />,
      badge: recentMessagesCount,
    },
  ]

  const analyticNavItems: readonly NavItem[] = [
    {
      id: 'assistant',
      label: 'Assistant IA',
      href: '/dashboard/admin/assistant',
      icon: <Bot className="size-[18px] shrink-0" />,
    },
    {
      id: 'performance',
      label: 'Performances',
      href: '/dashboard/admin/performance',
      icon: <BarChart3 className="size-[18px] shrink-0" />,
    },
    {
      id: 'profile',
      label: 'Mon profil',
      href: '/dashboard/admin/profile',
      icon: <UserCircle2 className="size-[18px] shrink-0" />,
    },
  ]

  const renderNavItem = (item: NavItem): React.JSX.Element => {
    const isActive = isActiveRoute({ pathname, href: item.href })
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
  }

  const renderCollapsibleGroup = ({
    title,
    icon,
    items,
    isOpen,
    onToggle,
    groupActiveHref,
    isGroupActive,
  }: Readonly<{
    title: string
    icon: React.ReactNode
    items: readonly NavItem[]
    isOpen: boolean
    onToggle: () => void
    groupActiveHref: string
    isGroupActive: boolean
  }>): React.JSX.Element => {
    if (isCollapsed) {
      return (
        <Link
          href={groupActiveHref}
          title={title}
          className={[
            'group relative mx-auto flex items-center justify-center rounded-xl p-2.5 text-sm transition-all duration-200',
            isGroupActive
              ? 'bg-[#EBF3FC] text-[#244976] dark:bg-[#244976]/15 dark:text-blue-300'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
          ].join(' ')}
        >
          {icon}
          <span className="pointer-events-none absolute left-full ml-2 rounded-lg bg-gray-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 dark:bg-zinc-800">
            {title}
          </span>
        </Link>
      )
    }
    return (
      <>
        <button
          type="button"
          onClick={onToggle}
          className={[
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200',
            isGroupActive
              ? 'bg-[#EBF3FC] font-semibold text-[#244976] dark:bg-[#244976]/15 dark:text-blue-300'
              : 'font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white',
          ].join(' ')}
        >
          {icon}
          <span className="flex-1 truncate text-left">{title}</span>
          {isOpen ? (
            <ChevronDown className="size-4 shrink-0 opacity-50" />
          ) : (
            <ChevronRight className="size-4 shrink-0 opacity-50" />
          )}
        </button>
        {isOpen ? (
          <div className="ml-3 space-y-0.5 border-l border-gray-100 pl-3 dark:border-white/[0.08]">
            {items.map(renderNavItem)}
          </div>
        ) : null}
      </>
    )
  }

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
              Espace administrateur
            </span>
          </div>
        )}
      </div>

      <div className="mx-4 mb-2 h-px bg-gray-100 dark:bg-white/[0.08]" />

      {/* Navigation */}
      <nav className={`flex-1 space-y-0.5 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {/* Overview */}
        {isCollapsed ? null : (
          <p className="mt-2 mb-1 px-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase dark:text-gray-600">
            Vue d&apos;ensemble
          </p>
        )}
        {topNavItems.map(renderNavItem)}

        {/* Gestion */}
        {isCollapsed ? null : (
          <p className="mt-4 mb-1 px-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase dark:text-gray-600">
            Gestion
          </p>
        )}
        {renderCollapsibleGroup({
          title: 'Gestion Campagne',
          icon: <FolderOpen className="size-[18px] shrink-0" />,
          items: gestionItems,
          isOpen: gestionOpen,
          onToggle: () => setGestionOpen((v) => !v),
          groupActiveHref: '/dashboard/admin/campaigns',
          isGroupActive: isGestionActive(pathname),
        })}

        {/* Terrain */}
        {isCollapsed ? null : (
          <p className="mt-4 mb-1 px-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase dark:text-gray-600">
            Terrain
          </p>
        )}
        {renderCollapsibleGroup({
          title: 'Contacts & Rappels',
          icon: <Bell className="size-[18px] shrink-0" />,
          items: contactsRappelsItems,
          isOpen: contactsOpen,
          onToggle: () => setContactsOpen((v) => !v),
          groupActiveHref: '/dashboard/admin/calls',
          isGroupActive: isContactsRappelsActive(pathname),
        })}

        {/* Communication */}
        {isCollapsed ? null : (
          <p className="mt-4 mb-1 px-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase dark:text-gray-600">
            Communication
          </p>
        )}
        {commsNavItems.map(renderNavItem)}

        {/* Analytique */}
        {isCollapsed ? null : (
          <p className="mt-4 mb-1 px-2 text-[10px] font-semibold tracking-widest text-gray-400 uppercase dark:text-gray-600">
            Analytique &amp; Compte
          </p>
        )}
        {analyticNavItems.map(renderNavItem)}
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
                <Shield className="size-3.5 text-blue-200" />
              </div>
              <p className="text-xs font-semibold text-white">Administrateur</p>
            </div>
            <p className="text-[11px] leading-relaxed text-white/55">
              Gérez vos campagnes, contacts et agents en toute simplicité
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

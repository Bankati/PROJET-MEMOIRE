'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

/* ── Sidebar context ── */
type SidebarContextValue = Readonly<{
  isCollapsed: boolean
  toggle: () => void
  isMobileOpen: boolean
  openMobile: () => void
  closeMobile: () => void
}>

const SidebarContext = createContext<SidebarContextValue>({
  isCollapsed: false,
  toggle: () => {},
  isMobileOpen: false,
  openMobile: () => {},
  closeMobile: () => {},
})

export const useAdminSidebar = (): SidebarContextValue => useContext(SidebarContext)

/* ── Notifications context ── */
const LS_KEY = 'lbs_read_notification_ids'

type NotificationsContextValue = Readonly<{
  unreadCount: number
  isRead: (id: string) => boolean
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}>

const NotificationsContext = createContext<NotificationsContextValue>({
  unreadCount: 0,
  isRead: () => false,
  markAsRead: () => {},
  markAllAsRead: () => {},
})

export const useNotifications = (): NotificationsContextValue => useContext(NotificationsContext)

/* ── Shell ── */
export const AdminLayoutShell = ({
  children,
  notificationIds = [],
}: Readonly<{
  children: React.ReactNode
  notificationIds?: readonly string[]
}>): React.JSX.Element => {
  /* sidebar desktop */
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
  const toggle = useCallback((): void => setIsCollapsed((p) => !p), [])

  /* sidebar mobile */
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false)
  const openMobile = useCallback((): void => setIsMobileOpen(true), [])
  const closeMobile = useCallback((): void => setIsMobileOpen(false), [])

  /* notifications — initialise depuis localStorage */
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY)
      if (stored) setReadIds(new Set(JSON.parse(stored) as string[]))
    } catch {
      /* ignore */
    }
  }, [])

  const persist = (next: Set<string>): void => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify([...next]))
    } catch {
      /* ignore */
    }
  }

  const markAsRead = useCallback((id: string): void => {
    setReadIds((prev) => {
      const next = new Set(prev)
      next.add(id)
      persist(next)
      return next
    })
  }, [])

  const markAllAsRead = useCallback((): void => {
    setReadIds((prev) => {
      const next = new Set(prev)
      notificationIds.forEach((id) => next.add(id))
      persist(next)
      return next
    })
  }, [notificationIds])

  const unreadCount = notificationIds.filter((id) => !readIds.has(id)).length
  const isRead = useCallback((id: string): boolean => readIds.has(id), [readIds])

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle, isMobileOpen, openMobile, closeMobile }}>
      <NotificationsContext.Provider value={{ unreadCount, isRead, markAsRead, markAllAsRead }}>
        <div className="flex h-screen overflow-hidden bg-[#f4f7fe] dark:bg-[#0b1120]">
          {/* Overlay mobile — clique pour fermer */}
          {isMobileOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={closeMobile}
              aria-hidden="true"
            />
          )}
          {children}
        </div>
      </NotificationsContext.Provider>
    </SidebarContext.Provider>
  )
}

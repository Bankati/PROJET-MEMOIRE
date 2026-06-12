'use client'
import { createContext, useCallback, useContext, useState } from 'react'

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

export const useSidebar = (): SidebarContextValue => useContext(SidebarContext)

export const LayoutShell = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>): React.JSX.Element => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false)
  const toggle = useCallback((): void => setIsCollapsed((prev) => !prev), [])

  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false)
  const openMobile = useCallback((): void => setIsMobileOpen(true), [])
  const closeMobile = useCallback((): void => setIsMobileOpen(false), [])

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle, isMobileOpen, openMobile, closeMobile }}>
      <div className="flex h-screen overflow-hidden bg-[#f4f7fe] dark:bg-[#0b1120]">
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={closeMobile}
            aria-hidden="true"
          />
        )}
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

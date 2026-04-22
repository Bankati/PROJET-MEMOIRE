"use client";
/**
 * Shell client du layout agent.
 * Gère l'état ouvert/fermé de la sidebar avec animation fluide.
 * Réplique le pattern de l'admin avec l'identité visuelle LBS Blue.
 */
import { createContext, useCallback, useContext, useState } from "react";

type SidebarContextValue = Readonly<{
  isCollapsed: boolean;
  toggle: () => void;
}>;

const SidebarContext = createContext<SidebarContextValue>({
  isCollapsed: false,
  toggle: () => {},
});

export const useAgentSidebar = (): SidebarContextValue => {
  return useContext(SidebarContext);
};

export const AgentLayoutShell = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const toggle = useCallback((): void => {
    setIsCollapsed((prev) => !prev);
  }, []);
  return (
    <SidebarContext.Provider value={{ isCollapsed, toggle }}>
      <div className="flex h-screen overflow-hidden bg-[#f4f7fe] dark:bg-[#0b1120]">
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

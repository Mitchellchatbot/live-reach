import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface SidebarStateContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

const SidebarStateContext = createContext<SidebarStateContextType | undefined>(undefined);

export const SidebarStateProvider = ({ children }: { children: ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = useCallback(() => setCollapsed(prev => !prev), []);

  return (
    <SidebarStateContext.Provider value={{ collapsed, setCollapsed, toggleCollapsed }}>
      {children}
    </SidebarStateContext.Provider>
  );
};

// Hook that works both with and without a provider
// When used without provider, it manages local state instead
export const useSidebarState = () => {
  const context = useContext(SidebarStateContext);
  const [localCollapsed, setLocalCollapsed] = useState(false);
  const toggleLocal = useCallback(() => setLocalCollapsed(prev => !prev), []);
  
  // If we have a context, use it; otherwise use local state
  if (context !== undefined) {
    return context;
  }
  
  return {
    collapsed: localCollapsed,
    setCollapsed: setLocalCollapsed,
    toggleCollapsed: toggleLocal,
  };
};

'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface MobileMenuContextType {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  showMobileSearch: boolean;
  setShowMobileSearch: (show: boolean) => void;
}

const MobileMenuContext = createContext<MobileMenuContextType | undefined>(undefined);

export const MobileMenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <MobileMenuContext.Provider
      value={{
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        showMobileSearch,
        setShowMobileSearch,
      }}
    >
      {children}
    </MobileMenuContext.Provider>
  );
};

export const useMobileMenu = () => {
  const context = useContext(MobileMenuContext);
  if (context === undefined) {
    throw new Error('useMobileMenu must be used within a MobileMenuProvider');
  }
  return context;
};

export const useOptionalMobileMenu = () => {
  return useContext(MobileMenuContext);
};

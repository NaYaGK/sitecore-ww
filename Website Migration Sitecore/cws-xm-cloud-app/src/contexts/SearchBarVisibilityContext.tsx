'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface SearchBarVisibilityContextType {
  isSearchBarOpen: boolean;
  setIsSearchBarOpen: (isOpen: boolean) => void;
}

const SearchBarVisibilityContext = createContext<SearchBarVisibilityContextType | undefined>(
  undefined,
);

export const SearchBarVisibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);

  return (
    <SearchBarVisibilityContext.Provider value={{ isSearchBarOpen, setIsSearchBarOpen }}>
      {children}
    </SearchBarVisibilityContext.Provider>
  );
};

export const useSearchBarVisibility = () => {
  const context = useContext(SearchBarVisibilityContext);
  if (context === undefined) {
    throw new Error('useSearchBarVisibility must be used within a SearchBarVisibilityProvider');
  }
  return context;
};

export const useOptionalSearchBarVisibility = () => {
  return useContext(SearchBarVisibilityContext);
};

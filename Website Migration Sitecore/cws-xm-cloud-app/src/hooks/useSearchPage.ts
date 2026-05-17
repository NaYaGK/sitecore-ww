'use client';

import { useRouter } from 'next/router';
import { useEffect, useState, useMemo } from 'react';

/**
 * Checks if the current path is a search page
 * @param asPath - The current URL path from Next.js router
 * @returns boolean - True if the path contains a search segment
 */
const checkIfSearchPage = (asPath?: string): boolean => {
  if (!asPath) return false;
  
  // Remove query parameters and hash
  const cleanPath = asPath.split('?')[0]?.split('#')[0] || '';
  
  // Split by slash and filter out empty strings
  const pathSegments = cleanPath.split('/').filter(segment => segment.length > 0);
  
  // Check if any segment is exactly 'search'
  return pathSegments.some(segment => segment.toLowerCase() === 'search');
};

/**
 * Custom hook to detect if current page is a search page
 * Optimized for performance with React integration
 * @returns boolean - True if the current page is a search page
 */
export const useSearchPage = (): boolean => {
  const router = useRouter();
  
  // Use useMemo for initial calculation and useEffect for updates
  const isSearchPageValue = useMemo(() => {
    return checkIfSearchPage(router?.asPath);
  }, [router?.asPath]);
  
  const [isSearchPage, setIsSearchPage] = useState(isSearchPageValue);
  
  useEffect(() => {
    setIsSearchPage(isSearchPageValue);
  }, [isSearchPageValue]);
  
  return isSearchPage;
};

/**
 * Utility function for non-React usage (backward compatibility)
 * @param asPath - The current URL path from Next.js router
 * @returns boolean - True if the path contains a search segment
 */
export const isSearchPage = checkIfSearchPage;

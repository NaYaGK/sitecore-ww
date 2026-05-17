'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface UrlContextType {
  currentUrl: string;
  isUrlActive: (href: string) => boolean;
}

const UrlContext = createContext<UrlContextType>({
  currentUrl: '',
  isUrlActive: (href: string) => false,
});

export const UrlProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => { 
    setIsClient(true);
  }, []);

  useEffect(() => { 
    if (!isClient) return;
    
    // Handle dynamic catch-all routes - only extract path
    let actualPath = router.pathname;
    
    // If this is a catch-all route, get the actual path from query
    if (router.pathname === '/[[...path]]' && router.query?.path) {
      const pathArray = Array.isArray(router.query.path) ? router.query.path : [router.query.path];
      actualPath = '/' + pathArray.join('/');
    }
    
    setCurrentPath(actualPath);
  }, [router.pathname, router.query, isClient]);

  const isUrlActive = (href: string) => {
    if (!isClient || !currentPath || !href) return false;
    
    // Extract path: remove query params and hash
    const hrefPath = href.split('?')[0]?.split('#')[0] || href;
    
    // Get the last subpath from current URL (e.g., 'core-solutions' from '/en/workwear/core-solutions')
    const currentSubpath = currentPath.split('/').filter(Boolean).pop() || '';
    const hrefSubpath = hrefPath.split('/').filter(Boolean).pop() || '';
    
    // Match if the last subpath segments are the same
    return currentSubpath === hrefSubpath && currentSubpath !== '';
  };

  return (
    <UrlContext.Provider value={{ currentUrl: currentPath, isUrlActive }}>
      {children}
    </UrlContext.Provider>
  );
};

export const useUrlContext = () => useContext(UrlContext);

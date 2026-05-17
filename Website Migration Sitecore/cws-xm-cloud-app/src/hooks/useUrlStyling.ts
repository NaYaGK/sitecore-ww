'use client';

import { useUrlContext } from '@/contexts/UrlContext';

export const useUrlStyling = () => {
  const { currentUrl, isUrlActive } = useUrlContext();

  return {
    currentUrl,
    isUrlActive,
    // Helper for checking multiple links
    getActiveLinks: (links: string[]) => 
      links.filter(link => isUrlActive(link)),
    // Helper for navigation state
    getNavigationState: (links: Array<{ href: string; label: string }>) =>
      links.map(link => ({
        ...link,
        isActive: isUrlActive(link.href),
        className: isUrlActive(link.href) 
          ? 'text-[var(--color-accent-primary)] font-semibold' 
          : 'text-[var(--color-text)] hover:text-[var(--color-accent-primary)]'
      })),
    // Helper for getting link classes
    getLinkClasses: (href: string, activeClass?: string, inactiveClass?: string) => {
      const isActive = isUrlActive(href);
      const defaultActiveClass = 'text-[var(--color-accent-primary)] font-semibold';
      const defaultInactiveClass = 'text-[var(--color-text)] hover:text-[var(--color-accent-primary)]';
      
      return `transition-all duration-200 ${isActive ? (activeClass || defaultActiveClass) : (inactiveClass || defaultInactiveClass)}`;
    }
  };
};

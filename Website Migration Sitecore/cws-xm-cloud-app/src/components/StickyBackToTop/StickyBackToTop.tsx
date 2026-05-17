'use client';
import { useEffect, useState } from 'react';
import { useSitecore, type Field } from '@sitecore-content-sdk/nextjs';
import { ChevronUp } from 'lucide-react';

import { StickyBackToTopProps } from './StickyBackToTop.props';

import { cn } from '@/lib/utils';

type SafeField<T> = Field<T> | undefined;

const normalizeThemeKey = (theme?: SafeField<string>): string => {
  const value = theme?.value ?? '';
  return value.trim().toLowerCase();
};

const getThemeClasses = (theme?: SafeField<string>) => {
  // Regardless of theme selection, back-to-top button uses a solid black circle with white icon
  normalizeThemeKey(theme); // Reserved for future use if theming reinstated
  return 'bg-[var(--color-bg-dark)] text-[var(--color-text-inverse)]';
};

export const Default: React.FC<StickyBackToTopProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const datasource = fields?.data?.datasource;
  const themeField = datasource?.theme?.jsonValue;

  // State for visibility based on scroll position
  const [isVisible, setIsVisible] = useState(false);

  // Show button after user has scrolled more than 2x viewport height
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

      setIsVisible(scrollTop > 2 * viewportHeight);
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      scrollToTop();
    }
  };

  const themeClass = getThemeClasses(themeField);

  return (
    <div
      className={cn(
        'fixed top-[calc(100vh-100px)] right-0 z-[999]',
        'component sticky-back-to-top flex h-[40px] w-[40px] items-center justify-center rounded-full md:h-[70px] md:w-[70px]',
        'transition-all duration-500 ease-out',
        isVisible || isPageEditing
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-[12vh] opacity-0 md:translate-y-[16.5vh]',
      )}
      data-component="StickyBackToTop"
      role="complementary"
      aria-label="Scroll to top"
    >
      <button
        type="button"
        onClick={scrollToTop}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex cursor-pointer items-center justify-center border-none',
          'min-h-[30px] min-w-[30px] rounded-full md:min-h-[60px] md:min-w-[60px]',
          'shadow-lg active:shadow-md',
          'transition-transform duration-300 ease-in-out',
          'focus-visible:outline-[3px] focus-visible:outline-offset-2',
          'active:scale-95',
          themeClass,
        )}
        aria-label="Scroll to top of page"
      >
        <ChevronUp
          className="h-5 w-5 text-white md:h-11 md:w-11"
          size={50}
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </button>
    </div>
  );
};

export default Default;

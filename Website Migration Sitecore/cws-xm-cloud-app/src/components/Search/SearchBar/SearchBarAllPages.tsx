'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSitecore, Text } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { getStringValue, getBoolValue, hasFieldValue } from '@/utils/sitecoreFields';
import { resolveSearchSettings } from '@/utils/searchSettings';
import { fetchRecommendations } from '@/services/search/search.service';
import { SearchBarProps } from './SearchBar.props';
import { useSiteName } from '@/hooks/useSiteName';
import { useGlobalSearchSettings } from '@/hooks/useGlobalSearchSettings';
import { useOptionalSearchContext } from '../../../contexts/SearchContext';
import { SearchRecommendations } from '../Recommendations/SearchRecommendations';
import { useOptionalSearchBarVisibility } from '../../../contexts/SearchBarVisibilityContext';
import { useOptionalMobileMenu } from '../../../contexts/MobileMenuContext';
import { SEARCH_QUERY_PARAM } from '@/utils/searchUrlUtils';

const SearchBarAllPages: React.FC<SearchBarProps> = ({ fields, className }) => {
  const { page } = useSitecore();
  const siteName = useSiteName();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContext = useOptionalSearchContext();
  const searchBarVisibility = useOptionalSearchBarVisibility();
  const mobileMenuContext = useOptionalMobileMenu();

  const setKeyword = searchContext?.setKeyword;
  const isPageEditing = page?.mode?.isEditing;

  const globalSearchSettings = useGlobalSearchSettings(siteName);

  const { widgetId, entityName: entityType, sourceId } = resolveSearchSettings({
    globalSettings: globalSearchSettings,
    defaults: { widgetId: 'rfkid_7', entityName: 'content' },
    isJobSearch: getStringValue(fields?.EntityName)?.toLowerCase() === 'workdayjobs',
  });
  const initialStateCollapsed = true;//always collapsed initial state
  const showCloseIcon = getBoolValue(fields?.ShowCloseIcon);
  const placeholder = getStringValue(fields?.PlaceholderText) ?? 'Search keyword...';

  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [lastScreenWidth, setLastScreenWidth] = useState<number | null>(null);

  const shouldRenderCloseButton =
    showCloseIcon || Boolean(searchTerm) || initialStateCollapsed || !hasFieldValue(fields?.ShowCloseIcon);

  // Debounced resize handler to close search bar on screen size change
  // This prevents UI breaking when resizing between desktop/mobile layouts
  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;

    const handleResize = () => {
      const currentWidth = window.innerWidth;

      // Clear existing timer
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }

      // Debounce the resize handling to avoid excessive calls during resize
      resizeTimer = setTimeout(() => {
        // Only close search bar if it's open and screen size has actually changed
        if (isOpen && lastScreenWidth !== null && currentWidth !== lastScreenWidth) {
          // Close search bar on screen size change (both desktop and mobile)
          setIsOpen(false);
          setIsClosing(false);
          searchBarVisibility?.setIsSearchBarOpen(false);
          // State clearing is handled by useEffect
        }

        // Update last screen width for next comparison
        setLastScreenWidth(currentWidth);
      }, 300); // 300ms debounce delay for smooth UX
    };

    // Set initial screen width on component mount
    setLastScreenWidth(window.innerWidth);

    // Add resize listener
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
    };
  }, [isOpen, lastScreenWidth, searchBarVisibility]);

  useEffect(() => {
    if (searchContext?.keyword !== undefined) {
      setSearchTerm(searchContext.keyword);
    }
  }, [searchContext?.keyword]);

  useEffect(() => {
    if (mobileMenuContext?.showMobileSearch) {
      setIsOpen(true);
      setIsClosing(false);
    }
  }, [mobileMenuContext?.showMobileSearch]);

  useEffect(() => {
    searchBarVisibility?.setIsSearchBarOpen(isOpen);
  }, [isOpen, searchBarVisibility]);

  // Clear search state when search bar is closed (for any reason)
  useEffect(() => {
    if (!isOpen && !isClosing) {
      // Only clear if we're not in the middle of closing animation
      // and the search bar was previously open
      setSearchTerm('');
      setRecommendations([]);
      setIsFocused(false);
      setKeyword?.('');
    }
  }, [isOpen, isClosing, setKeyword]);

  const toggleOpen = () => {
    setIsOpen((prev) => {
      const newState = !prev;
      if (!newState) {
        // Closing - start animation, then close after delay
        setIsClosing(true);
        searchBarVisibility?.setIsSearchBarOpen(false);
        setTimeout(() => {
          setIsOpen(false);
          setIsClosing(false);
          // State clearing is handled by useEffect
        }, 200); // Match animation duration (200ms)
      } else {
        // Opening
        setIsClosing(false);
        searchBarVisibility?.setIsSearchBarOpen(true);
        return newState;
      }
      return prev; // Keep open during closing animation
    });
  };

  // Click outside closing disabled - search bar stays open until manually closed

  // Fetch Recommendations
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (isFocused && searchTerm.length >= 3 && searchTerm !== searchContext?.keyword) {
        const rawLanguage = page?.layout?.sitecore?.route?.itemLanguage || 'en';
        const [languagePart = 'en', countryPart = 'us'] = rawLanguage.split('-');
        const locale = { language: languagePart.toUpperCase(), country: countryPart };
        const results = await fetchRecommendations(searchTerm, widgetId, entityType, locale, sourceId);
        setRecommendations(results);
      } else {
        setRecommendations([]);
      }
    }, 75);

    return () => clearTimeout(timer);
  }, [searchTerm, widgetId, entityType, sourceId, page, isFocused, searchContext?.keyword]);

  const resolveSearchTargetUrl = (): string => {
    const configuredHref = fields?.SearchActionUrl?.value?.href || '/search';
    const localeFromRoute = router.locale;
    const isLocaleSegment = (segment: string) => /^[a-z]{2}(?:-[a-z]{2})?$/i.test(segment);

    const currentSegments = (router.asPath || '')
      ?.split('?')[0]
      ?.split('/')
      .filter(Boolean);
    const currentSiteSegment = currentSegments?.find((segment) => !isLocaleSegment(segment));

    const hrefPath = configuredHref.split('?')[0] || '/search';
    const hrefSegments = hrefPath.split('/').filter(Boolean);
    const hasSearchTail = hrefSegments[hrefSegments.length - 1] === 'search';

    if (!hasSearchTail || !currentSiteSegment) {
      return configuredHref;
    }

    // Prevent /search/search when already on the search page.
    if (currentSiteSegment === 'search') {
      return configuredHref;
    }

    const searchIndex = hrefSegments.lastIndexOf('search');
    const beforeSearch = hrefSegments.slice(0, searchIndex);
    const hasSiteSegment = beforeSearch.some((segment) => segment === currentSiteSegment);

    if (hasSiteSegment) {
      return configuredHref;
    }

    const localeSegment = beforeSearch.find((segment) => isLocaleSegment(segment)) || localeFromRoute;
    const normalizedPath = localeSegment
      ? `/${localeSegment}/${currentSiteSegment}/search`
      : `/${currentSiteSegment}/search`;

    return normalizedPath;
  };


  const handleSubmit = (term: string = searchTerm) => {
    const trimmedTerm = term;
    const targetUrl = resolveSearchTargetUrl();
    const params = new URLSearchParams();

    params.set(SEARCH_QUERY_PARAM, trimmedTerm);
    setKeyword?.(trimmedTerm);
    router.push(`${targetUrl}?${params.toString()}` as any);

    if (initialStateCollapsed) {
      setIsOpen(false);
    }

    setRecommendations([]);
  };

  const clearInput = () => {
    setSearchTerm('');
    setKeyword?.('');
    setRecommendations([]);
  };

  if (!fields && !isPageEditing) {
    return <NoDataFallback componentName="SearchBarAllPages" />;
  }

  // --- Render Trigger (Icon) ---
  if (!isOpen && !isClosing) {
    return (
      <div
        className={cn(
          'relative inline-block origin-right transition-transform duration-200 ease-in-out',
          className,
        )}
        data-component="SearchBarAllPages"
      >
        <button
          type="button"
          onClick={() => {
            // On mobile (below lg), open mobile menu with search
            if (window.innerWidth < 1024 && mobileMenuContext) {
              mobileMenuContext.setIsMobileMenuOpen(true);
              mobileMenuContext.setShowMobileSearch(true);
              setIsOpen(true);
            } else {
              // On desktop, use normal toggle
              toggleOpen();
            }
          }}
          aria-label="Open Search"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-transparent transition-transform hover:scale-110 active:scale-95"
        >
          <img src="/assets/icons/header-search.svg" alt="Search" className="h-6 w-6" />
        </button>
      </div>
    );
  }

  // --- Render Search Bar (All Pages Version) ---
  return (
    <>
      {/* Overlay background when search bar is open - excludes header - only on desktop */}
      {(isOpen || isClosing) && !mobileMenuContext?.showMobileSearch && (
        <div
          className="fixed inset-x-0 top-[106px] bottom-0 z-50 hidden bg-black/55 lg:block pointer-events-none transition-opacity duration-200 ease-in-out"
          style={{
            opacity: isClosing ? 0 : 1,
          }}
          aria-hidden="true"
        />
      )}
      <div
        ref={containerRef}
        className={cn(
          'z-60 mt-4 bg-white lg:mt-0',
          initialStateCollapsed
            ? 'w-auto origin-right border-b border-black lg:w-[1200px]'
            : 'relative w-full origin-right',
          className,
        )}
        style={{
          animation:
            initialStateCollapsed && isOpen && !isClosing
              ? 'expandFromRight 0.2s ease-in-out forwards'
              : initialStateCollapsed && isClosing
                ? 'collapseToRight 0.2s ease-in-out forwards'
                : undefined,
        }}
        data-component="SearchBarAllPages"
      >
        <div
          className={cn(
            'flex flex-col justify-center text-[18px]',
            initialStateCollapsed ? 'h-full w-full' : 'w-full',
          )}
        >
          <div className="relative flex w-full items-center bg-white">
            {/* Left Search Icon (Submit) - ALWAYS SHOWN on all pages */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="group shrink-0 appearance-none border-none bg-transparent p-0 transition-transform active:scale-90"
            >
              <img
                src="/assets/icons/header-search.svg"
                alt="Submit Search"
                className="h-5 w-5 opacity-100 transition-opacity group-hover:opacity-100"
              />
            </button>

            {/* Input */}
            <div className="relative ml-2 flex-1">
              <input
                type="text"
                ref={inputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  window.setTimeout(() => {
                    const activeEl = document.activeElement;
                    if (containerRef.current && activeEl && containerRef.current.contains(activeEl)) {
                      return;
                    }

                    setIsFocused(false);
                  }, 100);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder={placeholder || 'Search keyword...'}
                className="m-0 h-[24px] w-full border-none bg-transparent px-[20px] py-[3px] pl-[32px] font-[suisse_intlregular,sans-serif] text-[14px] leading-none transition-all outline-none placeholder:text-gray-400 focus:placeholder:text-gray-300"
                autoFocus={initialStateCollapsed}
              />
            </div>

            {/* Right X Icon (Clear/Close) - ALWAYS SHOWN when applicable */}
            {shouldRenderCloseButton && (
              <button
                onClick={() => {
                  // Always clear AND close (consistent behavior across pages/locales)
                  clearInput();
                  setIsFocused(false);

                  // If we are in the "mobile search" mode, exit it and close immediately.
                  if (mobileMenuContext?.showMobileSearch) {
                    mobileMenuContext.setShowMobileSearch(false);
                    setIsOpen(false);
                    setIsClosing(false);
                    searchBarVisibility?.setIsSearchBarOpen(false);
                    return;
                  }

                  // Close the search bar (keeps existing close animation behavior)
                  toggleOpen();
                }}
                className="shrink-0 cursor-pointer rounded-full p-0 transition-colors hover:bg-transparent"
                aria-label="Clear or Close"
              >
                <svg
                  className="h-[18px] w-[18px] text-gray-500 hover:text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeWidth={2}
                    d="M6 18L18 6"
                  />
                  <path
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeWidth={2}
                    d="M6 6L18 18"
                  />
                </svg>
              </button>
            )}

            {/* Optional Search Button (CMS Text) */}
            {fields?.SearchButtonText?.value && (
              <button
                onClick={() => handleSubmit()}
                className="flex shrink-0 items-center justify-center rounded-full bg-[#eb0045] px-8 py-3 font-bold text-white shadow-md transition-all hover:bg-black hover:shadow-lg active:scale-95"
              >
                <Text field={fields.SearchButtonText} />
              </button>
            )}
          </div>

          {/* Recommendations Dropdown */}
          {isFocused && recommendations.length > 0 && (
            <SearchRecommendations
              recommendations={recommendations}
              initialStateCollapsed={initialStateCollapsed}
              searchTerm={searchTerm}
              onClose={() => {
                window.setTimeout(() => {
                  setIsFocused(false);
                }, 0);
              }}
              onSelect={(item) => {
                handleSubmit(item.name);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default SearchBarAllPages;

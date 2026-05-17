'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSitecore, Text } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { getStringValue, getBoolValue } from '@/utils/sitecoreFields';
import { resolveSearchSettings } from '@/utils/searchSettings';
import { fetchRecommendations } from '@/services/search/search.service';
import { SearchBarProps } from './SearchBar.props';
import { useSiteName } from '@/hooks/useSiteName';
import { useGlobalSearchSettings } from '@/hooks/useGlobalSearchSettings';
import { useOptionalSearchContext } from '../../../contexts/SearchContext';
import { SearchRecommendations } from '../Recommendations/SearchRecommendations';
import { getSearchKeywordFromQuery, SEARCH_QUERY_PARAM } from '@/utils/searchUrlUtils';

const SearchBarSearchPage: React.FC<SearchBarProps> = ({ fields, className }) => {
  const { page } = useSitecore();
  const siteName = useSiteName();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContext = useOptionalSearchContext();

  const setKeyword = searchContext?.setKeyword;
  const isPageEditing = page?.mode?.isEditing;

  const globalSearchSettings = useGlobalSearchSettings(siteName);

  const { widgetId, entityName: entityType, sourceId } = resolveSearchSettings({
    globalSettings: globalSearchSettings,
    defaults: { widgetId: 'rfkid_7', entityName: 'content' },
    isJobSearch: getStringValue(fields?.EntityName)?.toLowerCase() === 'workdayjobs',
  });
  const initialStateCollapsed = getBoolValue(fields?.InitialStateCollapsed);
  const placeholder = getStringValue(fields?.PlaceholderText) || 'Search keyword...';
  const [isOpen, setIsOpen] = useState(!initialStateCollapsed);
  const [userInput, setUserInput] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const lastUrlQueryRef = useRef<string>('');

  // Initialize search terms only on initial load or URL change
  useEffect(() => {
    if (!router.isReady) return;

    const currentUrlQuery = getSearchKeywordFromQuery(router.query);

    // Only update when URL actually changes
    if (currentUrlQuery !== lastUrlQueryRef.current) {
      setUserInput(currentUrlQuery);
      lastUrlQueryRef.current = currentUrlQuery;
      return;
    }

    // Initial load from context (only if no URL query)
    if (!currentUrlQuery && searchContext?.keyword !== undefined && userInput === '') {
      setUserInput(searchContext.keyword);
    }
  }, [router.isReady, router.query, searchContext?.keyword]);

  const toggleOpen = () => {
    if (initialStateCollapsed) {
      setIsOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    if (!initialStateCollapsed || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [initialStateCollapsed, isOpen]);

  // Fetch Recommendations
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Only fetch if we have a non-empty search term with at least 3 characters
      const trimmedInput = userInput.trim();
      if (isFocused && trimmedInput && trimmedInput.length >= 3) {
        const rawLanguage = page?.layout?.sitecore?.route?.itemLanguage || 'en';
        const [languagePart = 'en', countryPart = 'us'] = rawLanguage.split('-');
        const locale = { language: languagePart.toUpperCase(), country: countryPart };
        const results = await fetchRecommendations(trimmedInput, widgetId, entityType, locale, sourceId);
        setRecommendations(results);
      } else {
        setRecommendations([]);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [userInput, widgetId, entityType, sourceId, page, isFocused]);


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

  const handleSubmit = (term: string = userInput) => {
    const targetUrl = resolveSearchTargetUrl();
    const params = new URLSearchParams();

    // Treat empty string as a valid search term.
    // Always include the search param so a submit from /search triggers navigation and re-fetch.
    params.set(SEARCH_QUERY_PARAM, term);

    // Update input and context
    setUserInput(term);
    setKeyword?.(term);

    router.push(`${targetUrl}?${params.toString()}` as any);

    if (initialStateCollapsed) {
      setIsOpen(false);
    }

    setRecommendations([]);
  };

  if (!fields && !isPageEditing) {
    return <NoDataFallback componentName="SearchBarSearchPage" />;
  }

  // --- Render Trigger (Icon) ---
  if (!isOpen) {
    return (
      <div className={cn('relative inline-block', className)} data-component="SearchBarSearchPage">
        <button
          type="button"
          onClick={toggleOpen}
          aria-label="Open Search"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95"
        >
          <img src="/assets/icons/header-search.svg" alt="Search" className="h-6 w-6" />
        </button>
      </div>
    );
  }

  // --- Render Search Bar (Search Page Version) ---
  return (
    <div
      ref={containerRef}
      className={cn(
        'z-10 bg-transparent',
        initialStateCollapsed
          ? 'absolute inset-0 h-full w-full border-b shadow-2xl'
          : 'relative w-full',
        className,
      )}
      data-component="SearchBarSearchPage"
    >
      <div
        className={cn(
          'mx-auto flex flex-col justify-center text-[18px]',
          initialStateCollapsed ? 'max-w-[1360px] px-6' : 'w-full',
        )}
      >
        <div className="relative flex w-full items-center gap-6">
          {/* NO Left Search Icon on search page - simplified UI */}

          {/* Input */}
          <div className="relative flex-1">
            <input
              type="text"
              ref={inputRef}
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
              }}
              onFocus={() => {
                setIsFocused(true);
              }}
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
              placeholder={placeholder}
              className="w-full border-b-2 border-black bg-transparent py-2  text-[17px] lg:text-xl transition-all outline-none placeholder:text-black-800 md:text-[18px]"

            />
          </div>

          {/* NO Right X Icon on search page - simplified UI */}

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
        {isFocused && (
          <SearchRecommendations
            recommendations={recommendations}
            initialStateCollapsed={initialStateCollapsed}
            searchTerm={userInput}
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
  );
};

export default SearchBarSearchPage;

'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSitecore, Placeholder } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { useOptionalSearchContext } from '../../../contexts/SearchContext';
import { fetchSearchResults } from '@/services/search/search.service';
import { SearchListingProps, FieldMapping, SearchListingVariant } from './SearchListing.props';
import { getStringValue } from '@/utils/sitecoreFields';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { resolveSearchSettings } from '@/utils/searchSettings';
import { useSiteName } from '@/hooks/useSiteName';
import { useGlobalSearchSettings } from '@/hooks/useGlobalSearchSettings';
import { patchHref } from '@/lib/patch-link';
import { getCanonicalLocale } from '@/config/locales';
import { getSearchKeywordFromQuery } from '@/utils/searchUrlUtils';

// Field mappings for different variants
const FIELD_MAPPINGS: Record<SearchListingVariant, FieldMapping> = {
  Default: {
    title: 'name',
    description: 'description',
    url: 'url',
    metadata: 'page_type',
    image: 'image_url',
  },
  Jobs: {
    title: 'job_title',
    description: 'job_description',
    url: 'job_url',
    metadata: 'job_country',
    image: 'image_url',
  },
};

// Default configurations for each variant
const VARIANT_DEFAULTS: Record<SearchListingVariant, { widgetId: string; entityType: string }> = {
  Default: {
    widgetId: 'rfkid_7',
    entityType: 'content',
  },
  Jobs: {
    widgetId: 'rfkid_9',
    entityType: 'workdayjobs',
  },
};

// Helper to get field value with fallbacks
const getFieldValue = (item: any, mapping: FieldMapping, field: keyof FieldMapping): string => {
  const fieldName = mapping[field];
  if (!fieldName) return '';
  return item[fieldName] || item.highlight?.[fieldName] || '';
};

const SearchListingLayout: React.FC<SearchListingProps> = ({
  fields,
  className,
  variant = 'Default',
  rendering,
  params,
}) => {
  const { page } = useSitecore();
  const siteName = useSiteName();

  const searchContext = useOptionalSearchContext();
  const { setResultCount, setFacets, allFacets, setAllFacets } = searchContext || {};
  const isPageEditing = page?.mode?.isEditing;

  const keyword = searchContext?.keyword ?? '';
  const selectedFacets = searchContext?.selectedFacets ?? {};
  const currentPage = searchContext?.currentPage ?? 1;

  const globalSearchSettings = useGlobalSearchSettings(siteName);

  // Get variant defaults and allow Sitecore fields to override
  const variantDefaults = VARIANT_DEFAULTS[variant];
  const { widgetId, entityName: entityType, sourceId } = resolveSearchSettings({
    globalSettings: globalSearchSettings,
    defaults: { widgetId: variantDefaults.widgetId, entityName: variantDefaults.entityType },
    isJobSearch: variant === 'Jobs',
  });
  const itemsPerPage = parseInt(getStringValue(fields?.ResultCount) || '5', 10);
  const loadMoreText = getStringValue(fields?.LoadMoreText) || 'Load More';
  const noResultText = getStringValue(fields?.NoResultText);

  // Get field mapping for current variant
  const fieldMapping = FIELD_MAPPINGS[variant];

  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageOffset, setPageOffset] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  const router = useRouter();
  const lastKeyword = useRef(keyword);
  const lastFetchParamsRef = useRef<string>('');
  const lastSignatureRef = useRef<string>('');
  const isBaselineFetching = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ((window as any).scCloudSDK) {
      setSdkReady(true);
      return;
    }

    const interval = window.setInterval(() => {
      if ((window as any).scCloudSDK) {
        setSdkReady(true);
        window.clearInterval(interval);
      }
    }, 150);

    return () => window.clearInterval(interval);
  }, []);

  // Reset page offset when keywords or facets change
  useEffect(() => {
    setPageOffset(0);
  }, [keyword, JSON.stringify(selectedFacets)]);

  useEffect(() => {
    if (isPageEditing) return;
    if (!initialized) return;
    if (results.length !== 0) return;

    const root = document.querySelector('.search-no-results-form');
    if (!root) return;

    const clearPrefilledValues = () => {
      const fields = Array.from(
        root.querySelectorAll('input, textarea')
      ) as Array<HTMLInputElement | HTMLTextAreaElement>;

      for (const field of fields) {
        const tag = field.tagName.toLowerCase();
        const type = tag === 'input' ? (field as HTMLInputElement).type : '';
        if (tag === 'input') {
          if (
            type === 'hidden' ||
            type === 'checkbox' ||
            type === 'radio' ||
            type === 'submit' ||
            type === 'button' ||
            type === 'reset'
          ) {
            continue;
          }
        }

        if (!field.value) continue;

        field.value = '';
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
    };

    clearPrefilledValues();

    const observer = new MutationObserver(() => clearPrefilledValues());
    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [initialized, isPageEditing, results.length]);

  const locale = useMemo(() => {
    const rawLanguage = page?.layout?.sitecore?.route?.itemLanguage || 'en';
    const [languagePart = 'en', countryPart = 'us'] = rawLanguage.split('-');
    return { language: languagePart.toUpperCase(), country: countryPart };
  }, [page?.layout?.sitecore?.route?.itemLanguage]);
  const currentLanguage = getCanonicalLocale(page?.layout?.sitecore?.route?.itemLanguage || 'en');
  const currentSiteSegment = useMemo(() => {
    const cleanPath = (router.asPath || '').split('?')[0]?.split('#')[0] || '';
    const segments = cleanPath.split('/').filter(Boolean);
    if (segments.length === 0) return '';

    const first = segments[0] || '';
    const hasLocalePrefix = /^[a-z]{2}(?:-[a-z]{2})?$/i.test(first);
    const segment = (hasLocalePrefix ? segments[1] : segments[0]) || '';
    return segment.toLowerCase();
  }, [router.asPath]);

  const targetSite = useMemo(() => {
    const workwearSegments = new Set([
      'workwear',
      'arbeitskleidung',
      'vetements-de-travail',
      'ropa-de-trabajo',
      'abbigliamento-da-lavoro',
      'werkkledij',
      'odziez-robocza-i-ochronna',
      'pracovne-odevy',
      'munka-es-vedoruha',
      'imbracaminte-de-lucru',
      'rabotno-obleklo',
      'radna-odjeca',
      'delovna-oblacila',
      'arbetsklader',
    ]);
    if (workwearSegments.has(currentSiteSegment)) return 'workwear';
    if (currentSiteSegment === 'healthcare' || currentSiteSegment === 'gesundheitswesen')
      return 'healthcare';
    if (currentSiteSegment === 'hygiene') return 'hygiene';
    return undefined;
  }, [currentSiteSegment]);

  const normalizeResultUrl = (rawUrl: string): string => {
    let url = rawUrl || '#';
    if (!url || url === '#') return '#';

    const normalizePathWithSite = (rawPath: string) => {
      const normalizedPath = rawPath.replace(/\/+$/, '');
      const hasLocalePrefix = new RegExp(`^/${currentLanguage}(?:/|$)`, 'i').test(normalizedPath);
      const localePrefixed = hasLocalePrefix
        ? normalizedPath
        : `/${currentLanguage}${normalizedPath}`;
      return patchHref(localePrefixed, siteName, targetSite, currentLanguage) || localePrefixed;
    };

    if (url.startsWith('/')) {
      return normalizePathWithSite(url);
    }

    if (/^https?:\/\//i.test(url)) {
      return patchHref(url, siteName, targetSite, currentLanguage) || url;
    }

    return url;
  };

  // Combined Search & Facet Logic
  useEffect(() => {
    // 1. Skip if router isn't settled
    if (!router.isReady) return;
    if (!sdkReady) return;

    // 2. Initial synchronization guard:
    // If the URL has a search query but the keyword doesn't
    // match it yet, wait for the Context's sync effect to finish.
    const urlQuery = getSearchKeywordFromQuery(router.query);
    if (urlQuery !== keyword) return;

    const controller = new AbortController();

    // Reset results when keyword/facets change (fresh search)
    const signature = JSON.stringify({ keyword, selectedFacets });
    if (pageOffset === 0 && lastSignatureRef.current !== signature) {
      setResults([]);
      setTotal(0);
      lastSignatureRef.current = signature;
    }

    // 3. Serialize fetch parameters to detect redundant calls
    const fetchParams = JSON.stringify({
      keyword,
      pageOffset,
      selectedFacets,
      locale,
      widgetId,
      entityType,
      sourceId,
    });

    if (lastFetchParamsRef.current === fetchParams) {
      setInitialized(true);
      setLoading(false);
      return;
    }
    lastFetchParamsRef.current = fetchParams;
    lastKeyword.current = keyword;

    const fetchResults = async () => {
      setLoading(true);
      if (pageOffset === 0) {
        setInitialized(false); // Only mark as uninitialized for fresh searches
      }
      try {
        const response = await fetchSearchResults(
          keyword,
          widgetId,
          entityType,
          locale,
          itemsPerPage,
          pageOffset,
          selectedFacets,
          undefined,
          sourceId,
        );

        if (controller.signal.aborted) return;

        const { results: newResults, total: totalResults, facets: newFacets } = response;

        if (pageOffset === 0) {
          setResults(newResults);
        } else {
          setResults((prev) => [...prev, ...newResults]);
        }

        setTotal(totalResults);
        setResultCount?.(totalResults);
        setFacets?.(newFacets);

        if (!allFacets || allFacets.length === 0) {
          setAllFacets?.(newFacets);
        }
      } catch (error: any) {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch search results:', error);
          // Allow retry with the same params after transient errors.
          lastFetchParamsRef.current = '';
          isBaselineFetching.current = false;
        }
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    fetchResults();
    return () => controller.abort();
  }, [
    keyword,
    pageOffset,
    widgetId,
    entityType,
    itemsPerPage,
    setResultCount,
    setFacets,
    selectedFacets,
    locale,
    router.isReady,
    router.query,
    sdkReady,
    setAllFacets,
    sourceId,
  ]);

  if (!fields && !isPageEditing) return <NoDataFallback componentName="SearchListing" />;
  return (
    <div
      className={cn('mx-auto max-w-[1360px] px-2 lg:px-4', className)}
      data-component="SearchListing"
      data-variant={variant}
    >
      {isPageEditing && (
        <div className="mt-10 mb-10 p-5 border-2 border-dashed border-gray-300">
          <p className="text-center text-sm text-gray-500 mb-4 bg-gray-100 p-2 font-semibold">
            No Results Placeholder Area
          </p>
          <Placeholder
            name={`search-no-result-${params?.DynamicPlaceholderId || rendering?.params?.DynamicPlaceholderId || ''}`}
            rendering={rendering as any}
          />
        </div>
      )}

      {(!initialized || (loading && pageOffset === 0)) && !isPageEditing ? (
        <div className="flex h-64 items-center justify-center">

        </div>
      ) : (
        <>
          {results.length === 0 && (
            <div className="py-20 text-left mb-20">
              <div
                className="text-xl font-regular text-black pb-10"
                dangerouslySetInnerHTML={{ __html: noResultText || '' }}
              />
              {!isPageEditing && (
                <div className="mt-18 search-no-results-form">
                  <Placeholder
                    name={`search-no-result-${params?.DynamicPlaceholderId || rendering?.params?.DynamicPlaceholderId || ''}`}
                    rendering={rendering as any}
                  />
                </div>
              )}
            </div>
          )}

          {results.length > 0 && (
            <div>
              <h2 className="font-heading-h2 my-4! mb-4! lg:my-9!">Results</h2>
              <div className="mb-5 flex flex-col lg:mb-14">
                {results.map((item, index) => {
                  const itemUrl = normalizeResultUrl(getFieldValue(item, fieldMapping, 'url'));
                  const itemTitle =
                    getFieldValue(item, fieldMapping, 'title') || item.title || item.name;
                  const isJobType = item.type === 'Jobs DE';
                  const itemDescription = isJobType
                    ? `Department: ${item.job_family || ''} / City: ${item.job_location || item.city || ''}`
                    : getFieldValue(item, fieldMapping, 'description');
                  const itemMetadata = getFieldValue(item, fieldMapping, 'metadata');
                  const itemImage = fieldMapping.image ? item[fieldMapping.image] : null;

                  // Jobs variant - simplified layout
                  if (variant === 'Jobs') {
                    // Format date from job_start_date (e.g., "2025-06-15-07:00" -> "June 15, 2025")
                    const formatJobDate = (dateString: string | undefined) => {
                      if (!dateString) return '';
                      try {
                        // Robust parsing: extract YYYY-MM-DD from strings like "2026-01-08-08:00"
                        const datePart = dateString.substring(0, 10);
                        if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return '';

                        const date = new Date(datePart);
                        return date.toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        });
                      } catch {
                        return '';
                      }
                    };

                    const jobFamily = item.job_family || item.type || '';
                    const jobLocation = item.job_primary_location || item.city || '';
                    const jobDate = formatJobDate(item.job_start_date || item.updated_at);

                    // Ensure title fallback
                    const displayTitle = itemTitle || item.name || item.title || 'Untitled Result';

                    return (
                      <a
                        key={`${item.id}-${index}`}
                        href={itemUrl}
                        className="group flex items-center gap-3 border-b border-black py-6 transition-colors hover:bg-(--color-accent-primary)"
                      >
                        {/* Arrow Icon */}
                        <div className="shrink-0">
                          <svg
                            className="h-5 w-5 text-black"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>

                        {/* Content */}
                        <div className="flex flex-1 flex-col gap-1">
                          {/* Metadata Line: Job Family | Location | Date */}
                          <div className="text-sm text-black">
                            {[jobFamily, jobLocation, jobDate].filter(Boolean).join(' | ')}
                          </div>

                          {/* Job Title */}
                          <h3 className="text-lg font-bold leading-tight text-black">{displayTitle}</h3>
                        </div>
                      </a>
                    );
                  }

                  // Default variant - original layout with image
                  return (
                    <div
                      key={`${item.id}-${index}`}
                      className={`flex flex-col gap-6 border-t-[0.5px] border-b border-black py-8 transition-colors md:flex-row md:items-start lg:border-t-1 ${index === 0 ? 'border-t-2 lg:border-t-2' : 'border-t-1 lg:border-t-1'} ${index === results.length - 1 ? 'border-b-2' : 'border-b-1'}`}
                    >
                      {/* Thumbnail / Icon */}
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center bg-gray-100 md:order-1">
                        {itemImage ? (
                          <img src={itemImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#F2F2F2]">
                            <svg className="h-8 w-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex flex-col gap-1 md:order-2">
                        {itemMetadata && (
                          <div className="inline-block text-[14px] leading-[1.2] font-semibold tracking-[1px] text-gray-900 capitalize">
                            {itemMetadata}
                          </div>
                        )}

                        <h3 className="text-2xl leading-tight font-bold text-black capitalize">
                          <a href={itemUrl} className="">
                            {itemTitle}
                          </a>
                        </h3>

                        {itemDescription && (
                          <div className="mt-2 line-clamp-2 text-base leading-relaxed lg:mt-3">
                            <div dangerouslySetInnerHTML={{ __html: itemDescription }} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Pagination / Load More */}
      {results.length < total && (
        <div className="mt-10 flex justify-center">
          {!loading && (
            <button
              onClick={() => setPageOffset((prev) => prev + itemsPerPage)}
              disabled={loading}
              className="mb-8 cursor-pointer rounded-full border-2 border-black bg-white px-8 py-3 font-bold hover:bg-black hover:text-white lg:mb-10 lg:px-12 lg:py-3"
            >
              {loadMoreText}
            </button>
          )}
        </div>
      )}

      {/* Loading overlay - fixed position in viewport center */}
      {loading && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <div className="rounded-sm bg-black/90 shadow-lg backdrop-blur-sm">
            <img
              src="/assets/icons/search-loader.svg"
              alt="Loading"
              className="h-8 w-8 animate-[spin_4.5s_linear_infinite]"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const Default: React.FC<SearchListingProps> = (props) => (
  <SearchListingLayout {...props} variant="Default" />
);

export const Jobs: React.FC<SearchListingProps> = (props) => (
  <SearchListingLayout {...props} variant="Jobs" />
);

export default Default;

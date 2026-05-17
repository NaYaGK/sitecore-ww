'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSitecore, Text, RichText } from '@sitecore-content-sdk/nextjs';
import { useRouter } from 'next/router';
import { cn } from '@/lib/utils';
import { fetchNewsAndPressResults } from '@/services/search/search.service';
import { NewsAndPressListingProps } from './NewsAndPressListing.props';
import { getStringValue, getBoolValue } from '@/utils/sitecoreFields';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { resolveSearchSettings } from '@/utils/searchSettings';
import { useSiteName } from '@/hooks/useSiteName';
import { useGlobalSearchSettings } from '@/hooks/useGlobalSearchSettings';
import { patchHref } from '@/lib/patch-link';
import { getCanonicalLocale } from '@/config/locales';

const NewsAndPressListing: React.FC<NewsAndPressListingProps> = ({ fields, className, rendering }) => {
    const { page } = useSitecore();
    const router = useRouter();
    const siteName = useSiteName();
    const pageSiteName =
        (page as { siteName?: string; context?: { site?: { name?: string } } } | undefined)?.siteName ||
        (page as { context?: { site?: { name?: string } } } | undefined)?.context?.site?.name;
    const hasResolvedSite = Boolean(pageSiteName);
    const isPageEditing = page?.mode?.isEditing;

    const titleField = fields?.Title || { value: '' };
    const globalSearchSettings = useGlobalSearchSettings(siteName);
    const { sourceId } = resolveSearchSettings({
        globalSettings: globalSearchSettings,
        defaults: { widgetId: 'rfkid_10', entityName: 'content' },
    });
    const widgetId = 'rfkid_10';
    const filterValue = (getStringValue(fields?.NewsType) || getStringValue(fields?.FilterValue) || 'News');
    const itemsPerPage = parseInt(getStringValue(fields?.ResultCount) || '6', 10);
    const loadMoreText = getStringValue(fields?.LoadMoreText) || 'Load more';
    const noResultText = getStringValue(fields?.NoResultText) || `No ${filterValue} found.`;
    const cardCTAText = getStringValue(fields?.CardCTAText) || 'Learn more';
    const showLoadMore = getBoolValue(fields?.ShowLoadMore);
    const [results, setResults] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [sdkReady, setSdkReady] = useState(false);
    const latestRequestIdRef = useRef(0);
    const [titleTooltip, setTitleTooltip] = useState<{ visible: boolean; text: string; x: number; y: number }>(
        { visible: false, text: '', x: 0, y: 0 },
    );
    const titleTooltipTimerRef = useRef<number | null>(null);

    const locale = useMemo(() => {
        const rawLanguage = page?.layout?.sitecore?.route?.itemLanguage || 'en';
        const [languagePart = 'en', countryPart = 'us'] = rawLanguage.split('-');
        return { language: languagePart.toUpperCase(), country: countryPart };
    }, [page?.layout?.sitecore?.route?.itemLanguage]);

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

    useEffect(() => {
        if (isPageEditing) {
            setLoading(false);
            return;
        }

        const shouldFetch = Boolean(sdkReady && hasResolvedSite && sourceId);
        if (!shouldFetch) {
            setResults([]);
            setTotal(0);
            setLoading(false);
            return;
        }

        const requestId = ++latestRequestIdRef.current;
        let cancelled = false;

        const loadResults = async () => {
            setLoading(true);
            try {
                const response = await fetchNewsAndPressResults(
                    widgetId,
                    locale,
                    filterValue,
                    itemsPerPage,
                    offset,
                    sourceId,
                );

                if (cancelled || requestId !== latestRequestIdRef.current) return;

                if (offset === 0) {
                    setResults(response.results || []);
                } else {
                    setResults((prev) => [...prev, ...(response.results || [])]);
                }
                setTotal(response.total || 0);
            } catch (error) {
                if (cancelled || requestId !== latestRequestIdRef.current) return;
                console.error(`Failed to fetch ${filterValue}:`, error);
            } finally {
                if (cancelled || requestId !== latestRequestIdRef.current) return;
                setLoading(false);
            }
        };

        loadResults();

        return () => {
            cancelled = true;
        };
    }, [widgetId, locale, filterValue, itemsPerPage, offset, sourceId, sdkReady, isPageEditing, hasResolvedSite]);

    useEffect(() => {
        setOffset(0);
        setResults([]);
        setTotal(0);
    }, [siteName, sourceId, filterValue, widgetId]);

    const handleLoadMore = () => {
        if (results.length < total) {
            setOffset((prev) => prev + itemsPerPage);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    if (!fields && !isPageEditing) return <NoDataFallback componentName="NewsAndPressListing" />;

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
            'werkkleding',
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
        if (currentSiteSegment === 'healthcare' || currentSiteSegment === 'gesundheitswesen') return 'healthcare';
        if (currentSiteSegment === 'hygiene') return 'hygiene';
        return undefined;
    }, [currentSiteSegment]);

    const hideTitleTooltip = () => {
        if (titleTooltipTimerRef.current) {
            window.clearTimeout(titleTooltipTimerRef.current);
            titleTooltipTimerRef.current = null;
        }
        setTitleTooltip((prev) => ({ ...prev, visible: false }));
    };

    const scheduleTitleTooltip = (text: string) => {
        if (titleTooltipTimerRef.current) window.clearTimeout(titleTooltipTimerRef.current);
        titleTooltipTimerRef.current = window.setTimeout(() => {
            setTitleTooltip((prev) => ({ ...prev, text, visible: true }));
        }, 2500);
    };

    const updateTitleTooltipPosition = (e: React.MouseEvent) => {
        const padding = 12;
        setTitleTooltip((prev) => ({
            ...prev,
            x: e.clientX + padding,
            y: e.clientY + padding,
        }));
    };

    useEffect(() => {
        return () => {
            if (titleTooltipTimerRef.current) {
                window.clearTimeout(titleTooltipTimerRef.current);
                titleTooltipTimerRef.current = null;
            }
        };
    }, []);

    return (
        <section
            className={cn('relative mx-auto max-w-[1360px] px-2 mb-12 lg:mb-18', className)}
            data-component="NewsAndPressListing"
            id={rendering?.uid}
        >
            <div className="flex flex-col">
                {(titleField?.value || titleField?.jsonValue?.value || isPageEditing) && (
                    <div className="rte-content [&_p]:mb-0!">
                        <RichText field={titleField.jsonValue || titleField} />
                    </div>
                )}

                <div className="relative">
                    {loading && offset === 0 && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40">
                            <div className="rounded-xl bg-black/90 p-1 shadow-lg ">
                                <img
                                    src="/assets/icons/search-loader.svg"
                                    alt="Loading"
                                    className="h-8 w-8 animate-[spin_4.5s_linear_infinite]"
                                />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {results.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-gray-500">
                                {noResultText}
                            </div>
                        ) : (
                            results.map((item, index) => {
                                const itemTitle = item.name || 'Untitled';
                                const itemDescription = item.description || '';
                                const itemImage = item.image_url;
                                const itemDate = formatDate(item.news_posting_date || '');
                                // Localize URL
                                let itemUrl = item.url || '#';
                                const normalizePathWithSite = (rawPath: string) => {
                                    const normalizedUrl = rawPath.replace(/\/+$/, '');
                                    const hasLocalePrefix =
                                        new RegExp(`^/${currentLanguage}(?:/|$)`, 'i').test(normalizedUrl);
                                    const localePrefixedUrl = hasLocalePrefix
                                        ? normalizedUrl
                                        : `/${currentLanguage}${normalizedUrl}`;
                                    return (
                                        patchHref(localePrefixedUrl, siteName, targetSite, currentLanguage) ||
                                        localePrefixedUrl
                                    );
                                };

                                if (itemUrl.startsWith('/')) {
                                    itemUrl = normalizePathWithSite(itemUrl);
                                } else if (/^https?:\/\//i.test(itemUrl)) {
                                    itemUrl =
                                        patchHref(itemUrl, siteName, targetSite, currentLanguage) || itemUrl;
                                }

                                const itemTags = item.news_tags || [];

                                return (
                                    <div
                                        key={`${item.id}-${index}`}
                                        className="group flex flex-col bg-[rgb(from_var(--color-accent-primary)_r_g_b/0.7)] shadow-sm"
                                    >
                                        {/* Image */}
                                        {itemImage && (
                                            <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                                                <img
                                                    src={itemImage}
                                                    alt={itemTitle}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="flex flex-1 flex-col px-[20px] pt-[27px] pb-[22px]">
                                            {/* Tags */}
                                            {itemTags.length > 0 && (
                                                <div className="mb-4 flex flex-wrap gap-2">
                                                    {itemTags.map((tag: string, i: number) => (
                                                        <span
                                                            key={i}
                                                            className="flex h-[25px] min-w-[100px] max-w-full cursor-pointer items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded-full border border-[rgba(0,0,0,0.4)] bg-transparent px-[20px] pt-[3px] text-center text-[14px] leading-[1.3] text-[rgba(0,0,0,0.4)] transition-all duration-100 ease-in font-['suisse_intlregular',sans-serif]"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="mb-2 text-sm font-medium ">{itemDate}</div>
                                            <a
                                                href={itemUrl}
                                                className="mb-4 md:mb-6 block text-xl font-bold leading-tight text-black"
                                                onMouseEnter={(e) => {
                                                    updateTitleTooltipPosition(e);
                                                    scheduleTitleTooltip(itemTitle);
                                                }}
                                                onMouseMove={updateTitleTooltipPosition}
                                                onMouseLeave={hideTitleTooltip}
                                                onFocus={(e) => {
                                                    const rect = (e.currentTarget as HTMLAnchorElement).getBoundingClientRect();
                                                    setTitleTooltip((prev) => ({
                                                        ...prev,
                                                        x: rect.left + 12,
                                                        y: rect.bottom + 12,
                                                    }));
                                                    scheduleTitleTooltip(itemTitle);
                                                }}
                                                onBlur={hideTitleTooltip}
                                            >
                                                <span className="line-clamp-2">{itemTitle}</span>
                                            </a>
                                            <div
                                                className="mb-6 text-[14px] leading-[1.3]  [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden"
                                                dangerouslySetInnerHTML={{ __html: itemDescription }}
                                            />

                                            <div
                                                className="mt-auto pt-[60px] flex items-center gap-1 text-sm font-bold text-black no-underline"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                                </svg>
                                                <a
                                                    href={itemUrl}
                                                    className="relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-[width] after:duration-200 group-hover:after:w-full"
                                                >
                                                    {cardCTAText}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {showLoadMore && results.length < total && (
                    <div className="mt-8 flex justify-center cursor-pointer">
                        <button
                            onClick={handleLoadMore}
                            className="group relative flex items-center gap-2 rounded-2xl border border-black bg-white px-6 py-4 text-sm font-bold text-black cursor-pointer transition-all hover:bg-black hover:text-white disabled:opacity-50"
                        >
                            {loadMoreText}
                        </button>
                    </div>
                )}
            </div>

            {titleTooltip.visible && (
                <div
                    className="pointer-events-none fixed z-[9999] w-max max-w-[280px] whitespace-normal rounded bg-[#3a3a3a] px-3 py-2 text-[12px] leading-[1.2] text-white shadow-lg"
                    style={{ left: titleTooltip.x, top: titleTooltip.y }}
                >
                    {titleTooltip.text}
                </div>
            )}
        </section>
    );
};

export default NewsAndPressListing;

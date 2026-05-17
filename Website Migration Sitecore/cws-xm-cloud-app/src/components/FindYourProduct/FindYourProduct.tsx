'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { FindYourProductProps } from './FindYourProduct.props';
import { fetchProductSearchResults } from '@/services/search/product-search.service';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { resolveSearchSettings } from '@/utils/searchSettings';
import { useSiteName } from '@/hooks/useSiteName';
import { useGlobalSearchSettings } from '@/hooks/useGlobalSearchSettings';
import { SlidersHorizontal } from 'lucide-react';
import { patchHref } from '@/lib/patch-link';
import { getCanonicalLocale } from '@/config/locales';

const FindYourProduct: React.FC<FindYourProductProps> = (props) => {
    const { fields, className, rendering, params } = props;
    const { page } = useSitecore();
    const siteName = useSiteName();
    const isPageEditing = page?.mode?.isEditing;

    // Labels from Sitecore
    const groupingLabel = fields.ProductGroupingText?.value || 'Product Grouping (Collections)';
    const categoryLabel = fields.ProductCategoryText?.value || 'Product Category';
    const colorLabel = fields.AvailableColorText?.value || 'Available color';
    const sexLabel = fields.SexLabel?.value || 'Sex';
    const showMoreLabel = fields.ShowMoreText?.value || 'Show more products';
    const title = fields.Title?.value;

    const globalSearchSettings = useGlobalSearchSettings(siteName);

    // Config from Sitecore
    const { entityName, sourceId } = resolveSearchSettings({
        globalSettings: globalSearchSettings,
        defaults: { widgetId: 'rfkid_11', entityName: 'content' },
    });
    const widgetId = 'rfkid_11';
    const itemsPerPage = parseInt(fields.ResultCount?.value || '4', 10);

    // State
    const [results, setResults] = useState<any[]>([]);
    const [facets, setFacets] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [selectedFacets, setSelectedFacets] = useState<Record<string, string[]>>({});
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [draftSelectedFacets, setDraftSelectedFacets] = useState<Record<string, string[]>>({});

    // Locale
    const locale = useMemo(() => {
        const rawLanguage = page?.layout?.sitecore?.route?.itemLanguage || 'en-US';
        const [languagePart = 'en', countryPart = 'us'] = rawLanguage.split('-');
        return { language: languagePart.toUpperCase(), country: countryPart.toLowerCase() };
    }, [page?.layout?.sitecore?.route?.itemLanguage]);
    const currentLanguage = getCanonicalLocale(page?.layout?.sitecore?.route?.itemLanguage || 'en');
    const targetSite = 'workwear';

    // Fetch Logic
    const fetchProducts = async (newOffset: number, append: boolean = false) => {
        setLoading(true);
        try {
            const response = await fetchProductSearchResults(
                widgetId,
                entityName,
                locale,
                itemsPerPage,
                newOffset,
                selectedFacets,
                sourceId,
            );

            if (append) {
                setResults((prev) => [...prev, ...response.results]);
            } else {
                setResults(response.results);
            }

            setTotal(response.total);

            // Only set facets if they are not already set (initial load) or if they change based on selection
            // For this component, we'll keep all facets to allow selection
            if (facets.length === 0 || !append) {
                setFacets(response.facets);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load and filter change (wait for scCloudSDK like JobListing)
    useEffect(() => {
        const loadProducts = async () => {
            setOffset(0);
            await fetchProducts(0, false);
        };

        if (locale) {
            const checkSdk = () => {
                if (typeof window !== 'undefined' && (window as any).scCloudSDK) {
                    loadProducts();
                }
            };

            if (typeof document !== 'undefined' && document.readyState === 'complete') {
                checkSdk();
            } else if (typeof window !== 'undefined') {
                window.addEventListener('load', checkSdk);
                return () => window.removeEventListener('load', checkSdk);
            }
        }
    }, [selectedFacets, locale, widgetId, entityName, itemsPerPage, sourceId]);

    const handleFilterChange = (facetName: string, value: string) => {
        setSelectedFacets((prev) => {
            const newFacets = { ...prev };
            if (value === 'all') {
                delete newFacets[facetName];
            } else {
                newFacets[facetName] = [value]; // Single selection as per design screenshot
            }
            return newFacets;
        });
    };

    const handleDraftFilterChange = (facetName: string, value: string) => {
        setDraftSelectedFacets((prev) => {
            const newFacets = { ...prev };
            if (value === 'all') {
                delete newFacets[facetName];
            } else {
                newFacets[facetName] = [value];
            }
            return newFacets;
        });
    };

    const openMobileFilters = () => {
        setDraftSelectedFacets(selectedFacets);
        setIsMobileFilterOpen(true);
    };

    const cancelMobileFilters = () => {
        setDraftSelectedFacets(selectedFacets);
        setIsMobileFilterOpen(false);
    };

    const applyMobileFilters = () => {
        setSelectedFacets(draftSelectedFacets);
        setIsMobileFilterOpen(false);
    };

    const loadMore = () => {
        const newOffset = offset + itemsPerPage;
        setOffset(newOffset);
        fetchProducts(newOffset, true);
    };

    const hasAppliedFilters = Object.keys(selectedFacets).length > 0;

    const resetFilters = () => {
        setSelectedFacets({});
        setDraftSelectedFacets({});
        setIsMobileFilterOpen(false);
    };

    const renderDropdown = (
        facetName: string,
        label: string,
        currentSelectedFacets: Record<string, string[]>,
        onChange: (facet: string, value: string) => void,
    ) => {
        const facet = facets.find((f) => f.name === facetName);
        const options = [...(facet?.value || [])].sort((a: any, b: any) =>
            String(a?.text || '').localeCompare(String(b?.text || ''), undefined, {
                sensitivity: 'base',
            }),
        );
        const selectedValue = currentSelectedFacets[facetName]?.[0] || 'all';
        const desktopLabel = label.replace(/\s*\([^)]*\)\s*$/g, '').trim();

        return (
            <div className="flex w-full flex-col gap-2 ">
                <label className="text-sm sm:text-[17px] text-black lg:text-[18px] lg:leading-[28px] font-['suisse_intlregular',sans-serif]">
                    <span className="lg:hidden">{label}</span>
                    <span className="hidden lg:inline">{desktopLabel}</span>
                </label>
                <div className="relative">
                    <select
                        value={selectedValue}
                        onChange={(e) => onChange(facetName, e.target.value)}
                        className="w-full appearance-none border-2 border-black bg-white px-4 py-3 text-base font-bold text-black outline-none cursor-pointer "
                    >
                        <option value="all">All</option>
                        {options.map((opt: any) => (
                            <option key={opt.id} value={opt.text}>
                                {opt.text}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pl-4 pr-1 pt-1 cursor-pointer">
                        <svg className="h-10 w-10 fill-current" viewBox="0 0 24 24">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                    </div>
                </div>
            </div>
        );
    };

    if (!fields && !isPageEditing) return <NoDataFallback componentName="FindYourProduct" />;


    return (
        <section className={cn('component bg-white my-10 lg:my-12 relative', className)} data-component="FindYourProduct">
            <div className="mx-auto max-w-[1360px] pl-2 pr-4 lg:px-4 pt-16 lg:pt-12">
                <h2 className="font-heading-h2 text-[35px] sm:text-[40px] mb-10 font-bold lg:pb-3">{title}</h2>

                <div className="mb-1">
                    <div className="flex w-full items-center">
                        <div className="sm:hidden">
                            <button
                                type="button"
                                onClick={openMobileFilters}
                                className="inline-flex items-center gap-2 bg-white  py-2 text-base font-bold text-black"
                            >
                                <SlidersHorizontal
                                    aria-hidden
                                    className="mr-1 inline-block rotate-180 align-middle"
                                    strokeWidth={2.5}
                                    size={14}
                                />
                                Filter
                            </button>
                        </div>

                        {hasAppliedFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="ml-auto text-sm font-medium text-black underline"
                            >
                                Reset filter
                            </button>
                        )}
                    </div>

                    <div className="hidden grid-cols-1 gap-6 sm:gap-[30px] sm:grid lg:grid-cols-4 md:mb-10 lg:mb-10 max-w-xs lg:max-w-none lg:gap-[18px]">
                        {renderDropdown('product_grouping', groupingLabel, selectedFacets, handleFilterChange)}
                        {renderDropdown('product_category', categoryLabel, selectedFacets, handleFilterChange)}
                        {renderDropdown(
                            'product_primary_color',
                            colorLabel,
                            selectedFacets,
                            handleFilterChange,
                        )}
                        {renderDropdown('product_sex', sexLabel, selectedFacets, handleFilterChange)}
                    </div>
                </div>

                {/* Results Grid */}
                <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
                    {results.map((product, index) => {
                        const productUrl =
                            patchHref(product?.url, siteName, targetSite, currentLanguage) || product?.url || '#';

                        return (
                            <a
                                key={`${product.id}-${index}`}
                                href={productUrl}
                                className="group flex items-center gap-4 no-underline sm:flex-col sm:items-stretch sm:gap-0"
                            >
                                <div className={cn(
                                    "flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden bg-[#EBEBEB] px-4 py-2 sm:aspect-square sm:h-auto sm:w-full sm:px-[40px] lg:px-[45px] xl:px-[55px]",
                                    index < 3 ? "sm:py-[18px]" : "sm:py-[15px]"
                                )}>                                    {index < 3 ? (
                                    <div className="flex h-full w-full items-center justify-center bg-white p-2 sm:p-4 sm:transition-transform sm:duration-300 group-hover:sm:scale-110">
                                        <img
                                            src={product.image_url || '/assets/images/placeholder-product.png'}
                                            alt={product.name}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <img
                                        src={product.image_url || '/assets/images/placeholder-product.png'}
                                        alt={product.name}
                                        className="h-full w-full object-contain mix-blend-multiply sm:transition-transform sm:duration-300 group-hover:sm:scale-105"
                                    />
                                )}
                                </div>
                                <h3 className="text-[13px] sm:text-[15px] leading-tight font-bold text-black sm:mt-4">
                                    {product?.name?.split('|')[0]}
                                </h3>
                            </a>
                        );
                    })}
                </div>

                {/* Empty State */}
                {!loading && results.length === 0 && (
                    <div className="py-20 text-center mb-10">
                        <p className="text-xl font-regular mb-16">
                            No products found for the selected filters.
                        </p>
                    </div>
                )}

                {/* Load More */}
                {results.length < total && (
                    <div className="mt-16 flex justify-center">
                        <button
                            onClick={loading ? undefined : loadMore}
                            disabled={loading}
                            className={cn(
                                'rounded-2xl border-2 cursor-pointer border-black px-14 py-3 text-base sm:text-xl font-bold transition-all ',
                                loading
                                    ? 'pointer-events-none bg-black text-white'
                                    : 'bg-white text-black hover:bg-black hover:text-white',
                                !loading && 'disabled:opacity-50',
                            )}
                        >
                            {showMoreLabel}
                        </button>
                    </div>
                )}
            </div>

            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 bg-white sm:hidden">
                    <div className="flex h-full flex-col">
                        <div className="flex-1 overflow-auto px-4 pb-8 pt-6">
                            <div className="mb-6 flex w-full items-start gap-4">
                                <h2 className="text-3xl font-bold text-black">Filter products</h2>
                                {hasAppliedFilters && (
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="ml-auto pt-2 text-sm font-medium text-black underline"
                                    >
                                        Reset filter
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col gap-6">
                                {renderDropdown(
                                    'product_grouping',
                                    groupingLabel,
                                    draftSelectedFacets,
                                    handleDraftFilterChange,
                                )}
                                {renderDropdown(
                                    'product_category',
                                    categoryLabel,
                                    draftSelectedFacets,
                                    handleDraftFilterChange,
                                )}
                                {renderDropdown(
                                    'product_primary_color',
                                    colorLabel,
                                    draftSelectedFacets,
                                    handleDraftFilterChange,
                                )}
                                {renderDropdown(
                                    'product_sex',
                                    sexLabel,
                                    draftSelectedFacets,
                                    handleDraftFilterChange,
                                )}
                            </div>

                            <div className="mt-10 flex flex-col gap-4">
                                <button
                                    type="button"
                                    onClick={applyMobileFilters}
                                    className="rounded-full bg-[#eb0045] px-6 py-4 text-center text-base font-bold text-white"
                                >
                                    Apply
                                </button>
                                <button
                                    type="button"
                                    onClick={cancelMobileFilters}
                                    className="rounded-full border-2 border-black bg-white px-6 py-4 text-center text-base font-bold text-black"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading overlay - absolute position in component center */}
            {loading && (
                <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
                    <div className="rounded-sm bg-black/90 shadow-lg backdrop-blur-sm">
                        <img
                            src="/assets/icons/search-loader.svg"
                            alt="Loading"
                            className="h-8 w-8 animate-[spin_4.5s_linear_infinite]"
                        />
                    </div>
                </div>
            )}
        </section>
    );
};

export default FindYourProduct;

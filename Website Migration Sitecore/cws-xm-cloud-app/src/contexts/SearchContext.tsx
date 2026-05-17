import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
    parseFacetsFromUrl,
    buildSearchUrl,
    parsePageFromUrl,
    getSearchKeywordFromQuery,
} from '@/utils/searchUrlUtils';

export interface FacetValue {
    id: string;
    text: string;
    count: number;
    applied?: boolean;
}

export interface Facet {
    name: string;
    label: string;
    value: FacetValue[];
}

type SearchContextType = {
    keyword: string;
    setKeyword: (value: string) => void;

    resultCount: number;
    setResultCount: (value: number) => void;

    facets: Facet[];
    setFacets: (facets: Facet[]) => void;

    allFacets: Facet[];
    setAllFacets: (facets: Facet[]) => void;

    selectedFacets: Record<string, string[]>;
    toggleFacet: (facetName: string, value: string) => void;
    clearFacets: () => void;

    isFilterPanelOpen: boolean;
    setFilterPanelOpen: (value: boolean) => void;

    currentPage: number;
    setCurrentPage: (value: number) => void;
};

const SearchContext = createContext<SearchContextType | null>(null);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const [keyword, setKeyword] = useState('');
    const [resultCount, setResultCount] = useState(0);
    const [facets, setFacets] = useState<Facet[]>([]);
    const [allFacets, setAllFacets] = useState<Facet[]>([]);
    const [selectedFacets, setSelectedFacets] = useState<Record<string, string[]>>({});
    const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const getCurrentSearchPath = useCallback(() => {
        const normalizePath = (path: string): string => {
            const [pathWithoutQuery = ''] = (path || '').split('?');
            return pathWithoutQuery.endsWith('/') && pathWithoutQuery !== '/'
                ? pathWithoutQuery.slice(0, -1)
                : pathWithoutQuery;
        };

        // Prefer browser URL path first; on Sitecore environments router.asPath can be rewritten.
        if (typeof window !== 'undefined') {
            const browserPath = normalizePath(window.location.pathname || '');
            if (browserPath.toLowerCase().endsWith('/search')) {
                return browserPath;
            }
        }

        const asPath = normalizePath(router.asPath || '');
        if (asPath.toLowerCase().endsWith('/search')) {
            return asPath;
        }

        return '/search';
    }, [router.asPath]);

    // Sync from URL (keyword, facets, and page)
    useEffect(() => {
        if (!router.isReady) return;

        const nextKeyword = getSearchKeywordFromQuery(router.query);
        if (nextKeyword !== keyword) {
            setKeyword(nextKeyword);
        }

        const facetsFromUrl = parseFacetsFromUrl(router.query);
        const facetsChanged = JSON.stringify(facetsFromUrl) !== JSON.stringify(selectedFacets);
        if (facetsChanged) {
            setSelectedFacets(facetsFromUrl);
        }

        const pageFromUrl = parsePageFromUrl(router.query);
        if (pageFromUrl !== currentPage) {
            setCurrentPage(pageFromUrl);
        }
    }, [router.isReady, router.query, keyword, selectedFacets, currentPage]);

    const toggleFacet = useCallback((facetName: string, value: string) => {
        setSelectedFacets((prev) => {
            const currentValues = prev[facetName] || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter((v) => v !== value)
                : [...currentValues, value];

            const newState = { ...prev };
            if (newValues.length > 0) {
                newState[facetName] = newValues;
            } else {
                delete newState[facetName];
            }

            // When filters change, always reset to page 1
            setCurrentPage(1);

            // Update URL with new facets while preserving current site/locale segment
            const newUrl = buildSearchUrl(keyword, newState, undefined);
            const target = `${getCurrentSearchPath()}${newUrl}`;
            router.replace(target, undefined, { shallow: true });

            return newState;
        });
    }, [router, keyword, getCurrentSearchPath]);

    const clearFacets = useCallback(() => {
        setSelectedFacets({});

        // Reset to page 1 when clearing filters
        setCurrentPage(1);

        // Update URL to remove all facets while preserving current site/locale segment
        const newUrl = buildSearchUrl(keyword, {}, undefined);
        const target = `${getCurrentSearchPath()}${newUrl}`;
        router.replace(target, undefined, { shallow: true });
    }, [router, keyword, getCurrentSearchPath]);

    const contextValue = useMemo(
        () => ({
            keyword,
            setKeyword,
            resultCount,
            setResultCount,
            facets,
            setFacets,
            allFacets,
            setAllFacets,
            selectedFacets,
            toggleFacet,
            clearFacets,
            isFilterPanelOpen,
            setFilterPanelOpen,
            currentPage,
            setCurrentPage,
        }),
        [
            keyword,
            resultCount,
            facets,
            allFacets,
            selectedFacets,
            toggleFacet,
            clearFacets,
            isFilterPanelOpen,
            currentPage,
        ],
    );

    return <SearchContext.Provider value={contextValue}>{children}</SearchContext.Provider>;
};

export const useSearchContext = () => {
    const ctx = useContext(SearchContext);
    if (!ctx) {
        throw new Error(
            'useSearchContext must be used inside SearchProvider inside Search Container Rendering',
        );
    }
    return ctx;
};

export const useOptionalSearchContext = () => {
    return useContext(SearchContext);
};

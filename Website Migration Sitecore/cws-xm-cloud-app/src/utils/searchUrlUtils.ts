import type { ParsedUrlQuery } from 'querystring';

export const SEARCH_QUERY_PARAM = 'search_api_fulltext';
export const LEGACY_SEARCH_QUERY_PARAM = 'q';

/**
 * Represents selected facets as a map of facet type to array of selected values.
 * Example: { content_type: ['news', 'article'], tags: ['Events'] }
 */
export type SelectedFacets = Record<string, string[]>;

/**
 * Sitecore Search SDK facet format for widget requests.
 */
export interface SitecoreFacet {
  name: string;
  values: string[];
}

/**
 * Parses facet parameters from URL query.
 * URL format: f[0]=content_type:news&f[1]=tags:Events&f[2]=tags:Tips
 *
 * @param query - Next.js router.query object
 * @returns SelectedFacets object with facet types as keys and arrays of values
 */
export const parseFacetsFromUrl = (query: ParsedUrlQuery): SelectedFacets => {
  const facets: SelectedFacets = {};

  // Iterate through all query params looking for f[n] pattern
  Object.keys(query).forEach((key) => {
    // Match f[0], f[1], f[2], etc.
    if (/^f\[\d+\]$/.test(key)) {
      const value = query[key];
      const facetString = Array.isArray(value) ? value[0] : value;

      if (facetString && typeof facetString === 'string') {
        // Split on first colon only (value may contain colons)
        const colonIndex = facetString.indexOf(':');
        if (colonIndex > 0) {
          const facetType = facetString.substring(0, colonIndex);
          const facetValue = facetString.substring(colonIndex + 1);

          if (facetType && facetValue) {
            if (!facets[facetType]) {
              facets[facetType] = [];
            }
            // Avoid duplicates
            if (!facets[facetType].includes(facetValue)) {
              facets[facetType].push(facetValue);
            }
          }
        }
      }
    }
  });

  return facets;
};

export const getSearchKeywordFromQuery = (query: ParsedUrlQuery): string => {
  const preferred = query[SEARCH_QUERY_PARAM];
  const legacy = query[LEGACY_SEARCH_QUERY_PARAM];
  const rawValue = Array.isArray(preferred)
    ? preferred[0]
    : preferred ?? (Array.isArray(legacy) ? legacy[0] : legacy);

  return typeof rawValue === 'string' ? rawValue : '';
};

/**
 * Serializes facets to URL query parameters array.
 * Output format: ['f%5B0%5D=content_type_workwear%3Anews', 'f%5B1%5D=tags_workwear%3AEvents', 'f%5B2%5D=tags_workwear%3ATips']
 *
 * @param facets - SelectedFacets object
 * @returns Array of query parameter strings
 */
export const serializeFacetsToUrl = (facets: SelectedFacets): string[] => {
  const params: string[] = [];
  let index = 0;

  Object.entries(facets).forEach(([facetType, values]) => {
    values.forEach((value) => {
      const paramKey = `f[${index}]`;
      const paramValue = `${facetType}:${value}`;
      params.push(`${encodeURIComponent(paramKey)}=${encodeURIComponent(paramValue)}`);
      index++;
    });
  });

  return params;
};

/**
 * Builds a complete URL search string including keyword, facets, and optional page.
 *
 * @param keyword - Search keyword
 * @param facets - Selected facets
 * @param page - Optional page number (defaults to 1, omitted if 1)
 * @returns URL search string (e.g., "?search_api_fulltext=news&f%5B0%5D=content_type_workwear%3Anews&page=2")
 */
export const buildSearchUrl = (keyword: string, facets: SelectedFacets, page?: number): string => {
  const params: string[] = [];

  // Add keyword
  if (keyword) {
    params.push(`${encodeURIComponent(SEARCH_QUERY_PARAM)}=${encodeURIComponent(keyword)}`);
  }

  // Add facets
  const facetParams = serializeFacetsToUrl(facets);
  params.push(...facetParams);

  // Add page (only if > 1)
  if (page && page > 1) {
    params.push(`page=${page}`);
  }

  return params.length > 0 ? `?${params.join('&')}` : '';
};

/**
 * Converts SelectedFacets to Sitecore Search SDK format.
 * Used when passing facets to SearchWidgetItem.
 *
 * @param facets - SelectedFacets object
 * @returns Array of SitecoreFacet objects for the SDK
 */
export const facetsToSitecoreFormat = (facets: SelectedFacets): SitecoreFacet[] => {
  return Object.entries(facets)
    .filter(([, values]) => values.length > 0)
    .map(([name, values]) => ({
      name,
      values,
    }));
};

/**
 * Checks if two SelectedFacets objects are equal.
 * Used to prevent unnecessary re-renders and URL updates.
 *
 * @param a - First SelectedFacets object
 * @param b - Second SelectedFacets object
 * @returns true if equal, false otherwise
 */
export const areFacetsEqual = (a: SelectedFacets, b: SelectedFacets): boolean => {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => {
    const valuesA = a[key] || [];
    const valuesB = b[key] || [];
    if (valuesA.length !== valuesB.length) return false;
    return valuesA.every((v) => valuesB.includes(v));
  });
};

/**
 * Parses page number from URL query.
 *
 * @param query - Next.js router.query object
 * @returns Page number (defaults to 1)
 */
export const parsePageFromUrl = (query: ParsedUrlQuery): number => {
  const pageParam = query.page;
  const pageString = Array.isArray(pageParam) ? pageParam[0] : pageParam;
  const page = parseInt(pageString || '1', 10);
  return Number.isNaN(page) || page < 1 ? 1 : page;
};

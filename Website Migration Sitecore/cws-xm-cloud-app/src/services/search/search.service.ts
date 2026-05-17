import {
  ComparisonFacetFilter,
  ComparisonFilter,
  Context,
  getWidgetData,
  SearchWidgetItem,
  WidgetRequestData,
} from '@sitecore-cloudsdk/search/browser';
import { type SelectedFacets, facetsToSitecoreFormat } from '@/utils/searchUrlUtils';
import { matchesAnyJobCountryCode, normalizeJobCountryCode } from './job-country-code';

const SEARCH_WIDGET_LIMIT_MAX = 100;

export interface SearchLocale {
  language: string;
  country: string;
}

function stripInternalOrigin(value: unknown): unknown {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value)) {
    return value;
  }

  try {
    const parsed = new URL(value);
    const isInternalHost =
      parsed.hostname === 'cws.com' ||
      parsed.hostname.endsWith('.cws.com') ||
      parsed.hostname === 'localhost' ||
      parsed.hostname.endsWith('.localhost');

    if (!isInternalHost) {
      return value;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return value;
  }
}

function normalizeSearchItem<T>(item: T): T {
  if (!item || typeof item !== 'object') {
    return item;
  }

  const normalized = { ...(item as Record<string, unknown>) };

  if ('url' in normalized) {
    normalized.url = stripInternalOrigin(normalized.url);
  }

  if ('job_url' in normalized) {
    normalized.job_url = stripInternalOrigin(normalized.job_url);
  }

  return normalized as T;
}

/**
 * Fetches search recommendations/suggestions based on a search term.
 *
 * @param searchTerm The term to get recommendations for (minimum 3 characters).
 * @param widgetId The Sitecore Search widget ID (default: 'rfkid_7').
 * @param entityType The entity type to search for (default: 'content').
 * @param locale The locale information for the search.
 * @returns A promise that resolves to an array of recommendations.
 */
export const fetchRecommendations = async (
  searchTerm: string,
  widgetId: string,
  entityType: string,
  locale: SearchLocale,
  sourceId?: string,
) => {
  if (!searchTerm || searchTerm.length < 2) return [];

  try {
    const widgetRequest = new SearchWidgetItem(entityType, widgetId);
    widgetRequest.content = {}; // Request all attributes for the entity
    const sitecoreSearchSourceId = sourceId?.trim();
    if (sitecoreSearchSourceId) {
      (widgetRequest as any).sources = [sitecoreSearchSourceId];
    }
    // widgetRequest.limit = 5;
    const trimmedTerm = searchTerm?.trim();
    if (trimmedTerm && trimmedTerm.length >= 1) {
      widgetRequest.query = { keyphrase: trimmedTerm };
    }

    const context = new Context({ locale });

    const response = await getWidgetData(new WidgetRequestData([widgetRequest]), context);
    const widgetResponse = response?.widgets?.[0];

    return (widgetResponse?.content ?? []).map(normalizeSearchItem);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

/**
 * Fetches full search results with pagination and optional facet filtering.
 *
 * @param searchTerm The term to search for.
 * @param widgetId The Sitecore Search widget ID.
 * @param entityType The entity type to search for.
 * @param locale The locale information.
 * @param limit The number of items to return.
 * @param offset The number of items to skip.
 * @param selectedFacets Optional filters to apply.
 * @returns A promise that resolves to the search results, total count, and facets.
 */
export const fetchSearchResults = async (
  searchTerm: string,
  widgetId: string,
  entityType: string,
  locale: SearchLocale,
  limit: number = 5,
  offset: number = 0,
  selectedFacets?: Record<string, string[]>,
  facetsToRequest: string[] = ['type', 'news_tags'],
  sourceId?: string,
) => {
  try {
    const widgetRequest = new SearchWidgetItem(entityType, widgetId);
    widgetRequest.content = {}; // Request all attributes
    const sitecoreSearchSourceId = sourceId?.trim();
    if (sitecoreSearchSourceId) {
      (widgetRequest as any).sources = [sitecoreSearchSourceId];
    }
    widgetRequest.limit = limit;
    widgetRequest.offset = offset;

    // Request all facets
    widgetRequest.facet = { all: true, max: 100 };

    // Construct facet types request
    const types: any[] = facetsToRequest.map((name) => {
      const selectedValues = selectedFacets?.[name];
      if (selectedValues && selectedValues.length > 0) {
        return {
          name,
          filter: {
            type: 'or',
            values: selectedValues.map((val) => new ComparisonFacetFilter('eq', val)),
          },
        };
      }
      return { name };
    });

    // Add any selected facets that weren't in the explicit request list
    if (selectedFacets) {
      Object.entries(selectedFacets).forEach(([name, values]) => {
        if (!facetsToRequest.includes(name) && values && values.length > 0) {
          types.push({
            name,
            filter: {
              type: 'or',
              values: values.map((val) => new ComparisonFacetFilter('eq', val)),
            },
          });
        }
      });
    }

    if (types.length > 0) {
      widgetRequest.facet.types = types as any;
    }

    const normalizedTerm = (searchTerm ?? '').trim();
    if (normalizedTerm.length > 0) {
      widgetRequest.query = { keyphrase: normalizedTerm.slice(0, 100) };
    }

    const context = new Context({ locale });
    const response = await getWidgetData(new WidgetRequestData([widgetRequest]), context);

    const widgetResponse = response?.widgets?.[0];

    return {
      results: (widgetResponse?.content ?? []).map(normalizeSearchItem),
      total: widgetResponse?.total_item ?? 0,
      facets: widgetResponse?.facet ?? [],
    };
  } catch (error) {
    console.error('Error fetching search results:', error);
    return { results: [], total: 0, facets: [] };
  }
};

/**
 * Fetches job results with strict country filtering.
 *
 * @param widgetId The Sitecore Search widget ID (e.g., 'rfkid_9').
 * @param locale The locale information.
 * @param countryCode The country code to filter by (e.g., 'DE').
 * @param itemsPerPage Number of items to retrieve (default: 100).
 * @returns A promise that resolves to the job results.
 */
export const fetchJobResults = async (
  widgetId: string,
  countryCodes: string[] = [],
  itemsPerPage: number = 100,
  entityName: string = 'workdayjobs',
  sourceId?: string,
) => {
  try {
    const widgetRequest = new SearchWidgetItem(entityName, widgetId);
    widgetRequest.content = {}; // Request all attributes
    const sitecoreSearchSourceId = sourceId?.trim();
    if (sitecoreSearchSourceId) {
      (widgetRequest as any).sources = [sitecoreSearchSourceId];
    }
    const normalizedCountryCodes = countryCodes.map((code) => normalizeJobCountryCode(code)).filter(Boolean);
    widgetRequest.limit = Math.min(Math.max(itemsPerPage, 1), SEARCH_WIDGET_LIMIT_MAX);
    widgetRequest.offset = 0;

    const context = new Context({
      locale: { language: 'en', country: 'us' },
    });

    const response = await getWidgetData(new WidgetRequestData([widgetRequest]), context);
    const widgetResponse = response?.widgets?.[0];
    const rawResults = (widgetResponse?.content ?? []) as Record<string, unknown>[];
    const filteredResults = normalizedCountryCodes.length > 0
      ? rawResults.filter((item) =>
          matchesAnyJobCountryCode(item?.job_country_code as string | undefined, normalizedCountryCodes),
        )
      : rawResults;

    console.debug('[fetchJobResults] Country filtering', {
      requestedCountryCodes: normalizedCountryCodes,
      rawCount: rawResults.length,
      filteredCount: filteredResults.length,
      sampleCountryCodes: rawResults
        .slice(0, 10)
        .map((item) => item?.job_country_code)
        .filter(Boolean),
    });

    return {
      results: filteredResults.slice(0, itemsPerPage).map(normalizeSearchItem),
      total: filteredResults.length,
    };
  } catch (error) {
    console.error('Error fetching job results:', error);
    return { results: [], total: 0 };
  }
};

/**
 * Fetches a single job by its ID using the Search SDK.
 *
 * @param jobId The ID of the job to fetch.
 * @param widgetId The Sitecore Search widget ID (default: 'rfkid_9').
 * @returns A promise that resolves to the job object or null.
 */
export const fetchJobById = async (
  jobId: string,
  widgetId: string = 'rfkid_9',
  sourceId?: string,
) => {
  try {
    const widgetRequest = new SearchWidgetItem('workdayjobs', widgetId);
    widgetRequest.content = {}; // Request all attributes
    const sitecoreSearchSourceId = sourceId?.trim();
    if (sitecoreSearchSourceId) {
      (widgetRequest as any).sources = [sitecoreSearchSourceId];
    }
    widgetRequest.limit = 1;

    // Apply filter by ID
    widgetRequest.filter = new ComparisonFilter('id', 'eq', jobId);

    const context = new Context({
      locale: { language: 'en', country: 'us' },
    });

    const response = await getWidgetData(new WidgetRequestData([widgetRequest]), context);
    const results = (response?.widgets?.[0]?.content ?? []).map(normalizeSearchItem);

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error(`Error fetching job by ID ${jobId}:`, error);
    return null;
  }
};

/**
 * Specialized standalone function to fetch news or press results with filtering and sorting.
 *
 * @param widgetId The Sitecore Search widget ID.
 * @param locale The locale information.
 * @param typeValue The type of content to filter by (e.g., 'news' or 'press').
 * @param limit The number of items to return.
 * @param offset The number of items to skip.
 * @returns A promise that resolves to the search results.
 */
export const fetchNewsAndPressResults = async (
  widgetId: string,
  locale: SearchLocale,
  typeValue: string = 'news',
  limit: number = 6,
  offset: number = 0,
  sourceId?: string,
) => {
  try {
    const widgetRequest = new SearchWidgetItem('content', widgetId);
    widgetRequest.content = {}; // Request all attributes
    const sitecoreSearchSourceId = sourceId?.trim();
    if (sitecoreSearchSourceId) {
      (widgetRequest as any).sources = [sitecoreSearchSourceId];
    }
    widgetRequest.limit = limit;
    widgetRequest.offset = offset;

    // Filter by type (e.g., "news" or "press")
    widgetRequest.filter = new ComparisonFilter('news_type', 'eq', typeValue);
    

    // Sort by news_publish_date descending
    (widgetRequest as any).request = {
      sort: [
        {
          name: 'news_publish_date'
        }
      ]
    };

    const context = new Context({ locale });
    const response = await getWidgetData(new WidgetRequestData([widgetRequest]), context);

    const widgetResponse = response?.widgets?.[0];

    return {
      results: (widgetResponse?.content ?? []).map(normalizeSearchItem),
      total: widgetResponse?.total_item ?? 0,
    };
  } catch (error) {
    console.error(`Error fetching ${typeValue} results:`, error);
    return { results: [], total: 0 };
  }
};

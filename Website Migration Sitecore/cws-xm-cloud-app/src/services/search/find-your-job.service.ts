import {
  ComparisonFacetFilter,
  Context,
  getWidgetData,
  SearchWidgetItem,
  WidgetRequestData,
} from '@sitecore-cloudsdk/search/browser';
import { matchesAnyJobCountryCode, normalizeJobCountryCode } from './job-country-code';

export interface FindYourJobLocale {
  language: string;
  country: string;
}

export interface FindYourJobSearchResponse {
  results: any[];
  total: number;
  facets: any[];
}

const COUNTRY_FILTER_FACETS = [
  'job_division',
  'job_employee_type',
  'job_primary_location',
] as const;
const SEARCH_WIDGET_LIMIT_MAX = 100;

const buildFacetBuckets = (
  items: Record<string, any>[],
  facetNames: readonly string[],
): Array<{ name: string; value: Array<{ text: string; value: string; count: number }> }> => {
  return facetNames.map((facetName) => {
    const counts = new Map<string, number>();

    items.forEach((item) => {
      const rawValue = item?.[facetName];
      const values = Array.isArray(rawValue) ? rawValue : rawValue ? [rawValue] : [];

      values
        .map((value) => String(value).trim())
        .filter(Boolean)
        .forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
    });

    return {
      name: facetName,
      value: Array.from(counts.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([value, count]) => ({ text: value, value, count })),
    };
  });
};

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

function normalizeFindYourJobItem<T>(item: T): T {
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

export const fetchFindYourJobResults = async (
  keyword: string,
  widgetId: string,
  entityName: string,
  _locale: FindYourJobLocale,
  limit: number = 12,
  offset: number = 0,
  selectedFacets: Record<string, string[]> = {},
  countryCodes: string[] = [],
  sourceId?: string,
): Promise<FindYourJobSearchResponse> => {
  try {
    const widgetRequest = new SearchWidgetItem(entityName, widgetId);
    widgetRequest.content = {};
    const normalizedLanguage = _locale?.language?.toUpperCase() || 'EN';
    const normalizedCountryCodes = countryCodes
      .map((code) => normalizeJobCountryCode(code))
      .filter(Boolean);
    const shouldApplyCountryFilter = Boolean(
      normalizedCountryCodes.length > 0 && normalizedLanguage !== 'EN',
    );

    widgetRequest.limit = Math.min(Math.max(limit, 1), SEARCH_WIDGET_LIMIT_MAX);
    widgetRequest.offset = offset;
    widgetRequest.facet = { all: true, max: 100 };
    widgetRequest.sort = {
      value: [
        {
          name: 'job_start_date',
        },
      ],
    };

    const sitecoreSearchSourceId = sourceId?.trim();
    if (sitecoreSearchSourceId) {
      (widgetRequest as any).sources = [sitecoreSearchSourceId];
    }

    const facetNames = [...COUNTRY_FILTER_FACETS];
    const types: any[] = facetNames.map((name) => {
      const selectedValues = selectedFacets[name];
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

    widgetRequest.facet.types = types as any;

    const normalizedKeyword = (keyword || '').trim();
    if (normalizedKeyword.length > 0) {
      widgetRequest.query = { keyphrase: normalizedKeyword.slice(0, 100) };
    }

    console.debug('[FindYourJobService] Request prepared', {
      widgetId,
      entityName,
      keyword: normalizedKeyword,
      limit,
      offset,
      selectedFacets,
      countryCodes: normalizedCountryCodes,
      sourceId: sitecoreSearchSourceId,
      locale: _locale,
      appliedFilter: (widgetRequest as any).filter ?? null,
      facetTypes: widgetRequest.facet?.types ?? [],
      query: (widgetRequest as any).query ?? null,
      sort: widgetRequest.sort ?? null,
      sources: (widgetRequest as any).sources ?? [],
    });

    // Job Search source is indexed against the default EN/US run.
    // Keep Search context fixed and use country filtering for localized pages.
    const context = new Context({
      locale: { language: 'en', country: 'us' },
    });

    const response = await getWidgetData(new WidgetRequestData([widgetRequest]), context);
    const widgetResponse = response?.widgets?.[0];
    const rawResults = (widgetResponse?.content ?? []) as Record<string, any>[];
    const countryFilteredResults = shouldApplyCountryFilter
      ? rawResults.filter((item) =>
          matchesAnyJobCountryCode(item?.job_country_code, normalizedCountryCodes),
        )
      : rawResults;
    const facets = shouldApplyCountryFilter
      ? buildFacetBuckets(countryFilteredResults, COUNTRY_FILTER_FACETS)
      : (widgetResponse?.facet ?? []);

    console.debug('[FindYourJobService] Raw widget response', {
      total: widgetResponse?.total_item ?? 0,
      contentCount: rawResults.length,
      countryFilteredCount: countryFilteredResults.length,
      pagedCount: countryFilteredResults.length,
      facetCount: Array.isArray(facets) ? facets.length : 0,
      firstResultId: (countryFilteredResults[0] as { id?: string } | undefined)?.id,
      response,
    });

    return {
      results: countryFilteredResults.map(normalizeFindYourJobItem),
      total: widgetResponse?.total_item ?? 0,
      facets,
    };
  } catch (error) {
    console.error('Error fetching FindYourJob results:', {
      error,
      widgetId,
      entityName,
      keyword,
      limit,
      offset,
      selectedFacets,
      countryCodes,
      sourceId,
      locale: _locale,
    });
    return { results: [], total: 0, facets: [] };
  }
};

import {
  ComparisonFacetFilter,
  ComparisonFilter,
  Context,
  getWidgetData,
  SearchWidgetItem,
  WidgetRequestData,
} from '@sitecore-cloudsdk/search/browser';

export interface SearchLocale {
  language: string;
  country: string;
}

export interface ProductSearchResponse {
  results: any[];
  total: number;
  facets: any[];
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

function normalizeProductSearchItem<T>(item: T): T {
  if (!item || typeof item !== 'object') {
    return item;
  }

  const normalized = { ...(item as Record<string, unknown>) };

  if ('url' in normalized) {
    normalized.url = stripInternalOrigin(normalized.url);
  }

  return normalized as T;
}

/**
 * Fetches product search results from Sitecore Search with specific facets for product grouping, category, color, and sex.
 */
export const fetchProductSearchResults = async (
  widgetId: string = 'rfkid_7',
  entityType: string = 'content',
  locale: SearchLocale,
  limit: number = 4,
  offset: number = 0,
  selectedFacets?: Record<string, string[]>,
  sourceId?: string,
): Promise<ProductSearchResponse> => {
  try {
    const facetMaxValues = 100;
    const widgetRequest = new SearchWidgetItem(entityType, widgetId);
    widgetRequest.content = {}; // Request all attributes
    const sitecoreSearchSourceId = sourceId?.trim();
    if (sitecoreSearchSourceId) {
      (widgetRequest as any).sources = [sitecoreSearchSourceId];
    }
    widgetRequest.limit = limit;
    widgetRequest.offset = offset;

    // Filter to only include products
    widgetRequest.filter = new ComparisonFilter('is_product', 'eq', 'true');

    // Request facets
    const facetsToRequest = ['product_grouping', 'product_category', 'product_primary_color', 'product_sex'];
    widgetRequest.facet = {
      all: false,
      max: facetMaxValues,
      types: facetsToRequest.map((name) => ({ name })) as any,
    };

    // Apply selected facets
    if (selectedFacets && widgetRequest.facet) {
      const types = facetsToRequest.map((name) => {
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
    }

    const context = new Context({ locale });
    const response = await getWidgetData(new WidgetRequestData([widgetRequest]), context);

    const widgetResponse = response?.widgets?.[0];

    return {
      results: (widgetResponse?.content ?? []).map(normalizeProductSearchItem),
      total: widgetResponse?.total_item ?? 0,
      facets: widgetResponse?.facet ?? [],
    };
  } catch (error) {
    console.error('Error fetching product search results:', error);
    return { results: [], total: 0, facets: [] };
  }
};

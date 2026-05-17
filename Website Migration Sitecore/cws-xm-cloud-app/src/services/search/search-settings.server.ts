import { fetchFromEdge } from '@/lib/sitecore/client';
import type { GlobalSearchSettings } from '@/services/search/search-settings.service';

type EdgeFieldValue = {
  value?: string | null;
  jsonValue?: {
    value?: string | null;
  } | null;
} | null;

type EdgeResponse = {
  data?: {
    item?: {
      sourceId?: EdgeFieldValue;
      widgetId?: EdgeFieldValue;
      entityName?: EdgeFieldValue;
      jobSourceId?: EdgeFieldValue;
      jobWidgetId?: EdgeFieldValue;
      jobEntityName?: EdgeFieldValue;
    } | null;
  };
  errors?: Array<{ message?: string }>;
};

const EMPTY_SETTINGS: GlobalSearchSettings = {
  site: {},
  job: {},
};

const capitalize = (value: string): string =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

export const getSearchSettingsPathBySite = (siteName: string): string => {
  const normalized = (siteName || 'workwear').toLowerCase().trim();
  const parent = capitalize(normalized);
  return `/sitecore/content/${parent}/${normalized}/Settings/Search Settings`;
};

const readFieldValue = (field?: EdgeFieldValue): string | undefined => {
  const raw = field?.jsonValue?.value ?? field?.value ?? undefined;
  if (raw === undefined || raw === null) return undefined;
  const normalized = String(raw).trim();
  return normalized || undefined;
};

export const fetchGlobalSearchSettingsBySite = async (
  siteName: string,
  explicitPath?: string,
): Promise<GlobalSearchSettings> => {
  const path = explicitPath || getSearchSettingsPathBySite(siteName);
  const query = `
    query SearchSettings($path: String!) {
      item(path: $path, language: "en") {
        sourceId: field(name: "SourceID") { value jsonValue }
        widgetId: field(name: "WidgetID") { value jsonValue }
        entityName: field(name: "EntityName") { value jsonValue }
        jobSourceId: field(name: "JobSourceID") { value jsonValue }
        jobWidgetId: field(name: "JobWidgetID") { value jsonValue }
        jobEntityName: field(name: "JobEntityName") { value jsonValue }
      }
    }
  `;

  try {
    const edgeResponse = await fetchFromEdge<EdgeResponse>(query, { path });

    if (edgeResponse?.errors?.length) {
      return EMPTY_SETTINGS;
    }

    const item = edgeResponse?.data?.item;
    if (!item) {
      return EMPTY_SETTINGS;
    }

    return {
      site: {
        sourceId: readFieldValue(item.sourceId),
        widgetId: readFieldValue(item.widgetId),
        entityName: readFieldValue(item.entityName),
      },
      job: {
        sourceId: readFieldValue(item.jobSourceId),
        widgetId: readFieldValue(item.jobWidgetId),
        entityName: readFieldValue(item.jobEntityName),
      },
      path,
    };
  } catch {
    return EMPTY_SETTINGS;
  }
};

import type { GlobalSearchSettings } from '@/services/search/search-settings.service';

export type SearchDefaults = {
  widgetId: string;
  entityName: string;
};

export type ResolvedSearchSettings = {
  widgetId: string;
  entityName: string;
  sourceId?: string;
};

type ResolveSearchSettingsInput = {
  globalSettings?: GlobalSearchSettings;
  defaults: SearchDefaults;
  isJobSearch?: boolean;
};

export const resolveSearchSettings = ({
  globalSettings,
  defaults,
  isJobSearch = false,
}: ResolveSearchSettingsInput): ResolvedSearchSettings => {
  const selectedSettings = isJobSearch ? globalSettings?.job : globalSettings?.site;

  return {
    sourceId: selectedSettings?.sourceId,
    widgetId: selectedSettings?.widgetId || defaults.widgetId,
    entityName: selectedSettings?.entityName || defaults.entityName,
  };
};

export type GlobalSearchSettings = {
  site: {
    sourceId?: string;
    widgetId?: string;
    entityName?: string;
  };
  job: {
    sourceId?: string;
    widgetId?: string;
    entityName?: string;
  };
  path?: string;
};

type SearchSettingsApiResponse = {
  success: boolean;
  data?: GlobalSearchSettings;
};

const settingsCache = new Map<string, Promise<GlobalSearchSettings>>();

export const fetchGlobalSearchSettings = async (
  siteName: string,
): Promise<GlobalSearchSettings> => {
  const key = siteName.toLowerCase();

  const cached = settingsCache.get(key);
  if (cached) {
    return cached;
  }

  const request = fetch(`/api/search/settings?siteName=${encodeURIComponent(siteName)}`)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch search settings (${response.status})`);
      }

      const payload = (await response.json()) as SearchSettingsApiResponse;
      if (!payload.success || !payload.data) {
        return { site: {}, job: {} };
      }

      return payload.data;
    })
    .catch(() => ({ site: {}, job: {} }));

  settingsCache.set(key, request);
  return request;
};

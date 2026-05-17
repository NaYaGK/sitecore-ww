import type { NextApiRequest, NextApiResponse } from 'next';
import {
  fetchGlobalSearchSettingsBySite,
  getSearchSettingsPathBySite,
} from '@/services/search/search-settings.server';

type SearchSettingsResponse = {
  success: boolean;
  data?: {
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
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchSettingsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const siteName = String(
    req.query.siteName ||
      process.env.NEXT_PUBLIC_SITE_NAME ||
      process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME ||
      'workwear'
  );
  const explicitPath = req.query.path ? String(req.query.path) : undefined;
  const path = explicitPath || getSearchSettingsPathBySite(siteName);

  try {
    const settingsPayload = await fetchGlobalSearchSettingsBySite(siteName, path);

    return res.status(200).json({
      success: true,
      data: settingsPayload,
    });
  } catch (error) {
    console.error('[search-settings-api] Request failed', {
      siteName,
      path,
      error: error instanceof Error ? error.message : error,
    });
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

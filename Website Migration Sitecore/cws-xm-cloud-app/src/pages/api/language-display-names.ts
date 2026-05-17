import type { NextApiRequest, NextApiResponse } from 'next';

interface LanguageDisplayName {
  language: string;
  displayName: string;
}

interface LanguageDisplayNameWithPath extends LanguageDisplayName {
  /** Full URL path for this item in the target language (e.g. /workwear/core-solutions/service-center) */
  path?: string;
}

interface ApiResponse {
  success: boolean;
  data?: LanguageDisplayNameWithPath[];
  error?: string;
}

function buildEdgeHeaders(auth: 'apikey' | 'token'): Record<string, string> {
  const contextId = process.env.SITECORE_EDGE_CONTEXT_ID;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth === 'apikey' && process.env.SITECORE_API_KEY) {
    headers['sc_apikey'] = process.env.SITECORE_API_KEY;
    if (contextId) headers['sc_context'] = contextId;
  } else if (auth === 'token' && process.env.SITECORE_EDGE_GQL_TOKEN) {
    headers['X-GQL-Token'] = process.env.SITECORE_EDGE_GQL_TOKEN;
    if (contextId) headers['sc_context'] = contextId;
  }
  return headers;
}

/**
 * Fetch item's url.path for a specific language from Experience Edge.
 * The path is the full route path in that language (e.g. /workwear/core-solutions/service-center).
 */
async function fetchItemPathByLanguage(
  edgeUrl: string,
  headers: Record<string, string>,
  itemPath: string,
  language: string
): Promise<string | undefined> {
  const query = `
    query GetItemPath($path: String!, $language: String!) {
      item(path: $path, language: $language) {
        url { path }
      }
    }
  `;

  const response = await fetch(edgeUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables: { path: itemPath, language },
    }),
  });

  if (!response.ok) return undefined;

  const data = await response.json();
  if (data.errors) return undefined;

  const path = data?.data?.item?.url?.path;
  return typeof path === 'string' && path.trim() ? path.trim() : undefined;
}

/**
 * API route to fetch language-specific display names from Sitecore GraphQL.
 * Also fetches the item's full URL path per language for correct language-switcher URLs.
 * This runs server-side and has access to server-side environment variables
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { itemId } = req.body;

  if (!itemId) {
    return res.status(400).json({ success: false, error: 'itemId is required' });
  }

  try {
    const edgeUrl = process.env.SITECORE_EDGE_URL || process.env.SITECORE_GRAPHQL_ENDPOINT || 'https://edge.sitecorecloud.io/api/graphql/v1';
    const edgeToken = process.env.SITECORE_EDGE_GQL_TOKEN;
    const apiKey = process.env.SITECORE_API_KEY;

    if (!edgeToken && !apiKey) {
      console.error('[language-display-names] Edge API token missing');
      return res.status(500).json({ success: false, error: 'API token not configured' });
    }

    // Remove curly braces from itemId if present
    const cleanItemId = itemId.replace(/[{}]/g, '');
    const path = `{${cleanItemId}}`;

    const query = `
      query GetPageURL($path: String!) {
        item(language: "en", path: $path) {
          languages {
            language {
              name
            }
            displayName
          }
        }
      }
    `;

    const authOrder: Array<'apikey' | 'token'> = apiKey ? ['apikey', 'token'] : ['token'];
    let lastResponse: Response | null = null;
    let headers: Record<string, string> = {};

    for (const auth of authOrder) {
      headers = buildEdgeHeaders(auth);
      if (!headers['sc_apikey'] && !headers['X-GQL-Token']) continue;

      lastResponse = await fetch(edgeUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables: { path } }),
      });

      if (lastResponse.ok) break;
      if (lastResponse.status === 401) {
        console.warn(`[language-display-names] 401 with ${auth}, trying next auth method`);
      } else {
        break;
      }
    }

    const response = lastResponse;
    if (!response) {
      console.error('[language-display-names] No valid auth headers');
      return res.status(200).json({ success: true, data: [] });
    }
    if (!response.ok) {
      if (response.status === 401) {
        console.error('[language-display-names] 401 with all auth methods. Check SITECORE_API_KEY, SITECORE_EDGE_GQL_TOKEN, and SITECORE_EDGE_CONTEXT_ID.');
        return res.status(200).json({ success: true, data: [] });
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      console.error('[language-display-names] GraphQL errors:', data.errors);
      return res.status(500).json({ success: false, error: 'GraphQL query failed' });
    }

    const languages = data?.data?.item?.languages || [];
    const baseResult: LanguageDisplayNameWithPath[] = languages.map((lang: any) => ({
      language: lang.language?.name || '',
      displayName: lang.displayName || '',
    }));

    // Fetch full path per language for correct language-switcher URLs.
    // This ensures e.g. /cs-CZ/pracovni-odevy/jak-pronajem-funguje/zakaznicky-portal
    // instead of /cs-CZ/pracovni-odevy/core-solutions/zakaznicky-portal when switching from EN.
    const resultsWithPaths = await Promise.all(
      baseResult.map(async (item) => {
        const lang = item.language?.toLowerCase().replace(/_/g, '-') || '';
        if (!lang) return item;

        const itemPath = await fetchItemPathByLanguage(edgeUrl, headers, path, lang);
        return { ...item, path: itemPath };
      })
    );

    return res.status(200).json({ success: true, data: resultsWithPaths });
  } catch (error) {
    console.error('[language-display-names] Failed to fetch:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

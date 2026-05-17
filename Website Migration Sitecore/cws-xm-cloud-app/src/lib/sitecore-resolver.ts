/**
 * Sitecore Path Resolver — Build-Time
 *
 * Queries Sitecore Experience Edge to fetch all pages with layout data
 * across all configured sites and languages. Used by vercel.ts to
 * dynamically generate microfrontend routing paths.
 */

import { SUPPORTED_LOCALES } from '../config/locales';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SitecoreSearchResult {
    url: { path: string };
    language: { name: string };
}

interface SitecoreSearchResponse {
    data: {
        search: {
            total: number;
            pageInfo: {
                endCursor: string;
                hasNext: boolean;
            };
            results: SitecoreSearchResult[];
        };
    };
}

export interface ResolvedPath {
    siteName: string;
    language: string;
    urlPath: string;
}

// ---------------------------------------------------------------------------
// Config — map Sitecore site names to their Vercel project names
// ---------------------------------------------------------------------------

const SITE_CONFIGS: Record<string, { vercelProject: string; edgeToken?: string }> = {
    workwear: {
        vercelProject: 'cws-xm-cloud-app',
    },
    healthcare: {
        vercelProject: 'cws-healthcare',
    },
    hygiene: {
        vercelProject: 'cws-hy',
    },
};

// ---------------------------------------------------------------------------
// GraphQL query — paginated search for all pages with layout
// ---------------------------------------------------------------------------

const SEARCH_QUERY = `
query ResolveAllPaths($siteName: String!, $language: String!, $after: String) {
  search(
    where: {
      AND: [
        { name: "_hasLayout", value: "true", operator: EQ }
      ]
    }
    site: $siteName
    language: $language
    first: 50
    after: $after
  ) {
    total
    pageInfo {
      endCursor
      hasNext
    }
    results {
      url { path }
      language { name }
    }
  }
}
`;

// ---------------------------------------------------------------------------
// Edge fetch helper
// ---------------------------------------------------------------------------

async function fetchEdge(
    query: string,
    variables: Record<string, unknown>,
    token?: string,
): Promise<SitecoreSearchResponse> {
    const endpoint =
        process.env.SITECORE_EDGE_URL || 'https://edge.sitecorecloud.io/api/graphql/v1';
    const gqlToken = token || process.env.SITECORE_EDGE_GQL_TOKEN;
    const contextId = process.env.SITECORE_EDGE_CONTEXT_ID;

    if (!gqlToken) {
        throw new Error('SITECORE_EDGE_GQL_TOKEN must be set for build-time path resolution');
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-GQL-Token': gqlToken,
    };
    if (contextId) {
        headers.sc_context = contextId;
    }

    const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
        throw new Error(`Edge error ${res.status}: ${await res.text()}`);
    }

    return res.json() as Promise<SitecoreSearchResponse>;
}

// ---------------------------------------------------------------------------
// Fetch all pages for a single site + language (handles pagination)
// ---------------------------------------------------------------------------

async function fetchPagesForSiteLanguage(
    siteName: string,
    language: string,
    edgeToken?: string,
): Promise<ResolvedPath[]> {
    const paths: ResolvedPath[] = [];
    let after: string | null = null;
    let hasNext = true;

    while (hasNext) {
        const variables: Record<string, unknown> = { siteName, language };
        if (after) variables.after = after;

        try {
            const response = await fetchEdge(SEARCH_QUERY, variables, edgeToken);
            const search = response.data?.search;

            if (!search) {
                console.warn(`[sitecore-resolver] No search results for ${siteName}/${language}`);
                break;
            }

            for (const result of search.results) {
                if (result.url?.path) {
                    paths.push({
                        siteName,
                        language: result.language?.name || language,
                        urlPath: result.url.path,
                    });
                }
            }

            hasNext = search.pageInfo.hasNext;
            after = search.pageInfo.endCursor;
        } catch (error) {
            console.error(`[sitecore-resolver] Error fetching ${siteName}/${language}:`, error);
            break;
        }
    }

    return paths;
}

// ---------------------------------------------------------------------------
// Public API — resolve all paths across all sites and languages
// ---------------------------------------------------------------------------

/**
 * Fetches all Sitecore pages with layout data across configured sites and
 * all supported locales. Returns an array of { siteName, language, urlPath }.
 *
 * Used at build time by vercel.ts to generate dynamic microfrontend routes.
 */
export async function resolveAllSitecorePaths(): Promise<ResolvedPath[]> {
    const allPaths: ResolvedPath[] = [];
    const siteNames = Object.keys(SITE_CONFIGS);

    console.log(
        `[sitecore-resolver] Resolving paths for ${siteNames.length} sites × ${SUPPORTED_LOCALES.length} languages...`,
    );

    for (const siteName of siteNames) {
        const config = SITE_CONFIGS[siteName]!;

        for (const locale of SUPPORTED_LOCALES) {
            const paths = await fetchPagesForSiteLanguage(siteName, locale, config.edgeToken);
            allPaths.push(...paths);
        }
    }

    console.log(`[sitecore-resolver] Resolved ${allPaths.length} total paths.`);
    return allPaths;
}

/**
 * Groups resolved paths by Vercel project name and formats them as
 * microfrontend routing paths (e.g., "/en/workwear/:path*").
 *
 * Returns a map: { [vercelProjectName]: string[] }
 */
export function groupPathsByProject(
    paths: ResolvedPath[],
): Record<string, string[]> {
    const grouped: Record<string, Set<string>> = {};

    for (const { siteName, language, urlPath } of paths) {
        const config = SITE_CONFIGS[siteName];
        if (!config) continue;

        const { vercelProject } = config;
        if (!grouped[vercelProject]) {
            grouped[vercelProject] = new Set();
        }

        // Build the full path: /<language>/<urlPath>
        // urlPath from Sitecore typically starts with /
        const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
        const fullPath = `/${language}${cleanPath}`;

        // Add both the exact path and a wildcard for nested content
        grouped[vercelProject]!.add(fullPath);
        grouped[vercelProject]!.add(`${fullPath}/:path*`);
    }

    // Convert Sets to sorted arrays
    const result: Record<string, string[]> = {};
    for (const [project, pathSet] of Object.entries(grouped)) {
        result[project] = [...pathSet].sort();
    }

    return result;
}

/**
 * Convenience: returns the SITE_CONFIGS mapping for external use.
 */
export function getSiteConfigs() {
    return SITE_CONFIGS;
}

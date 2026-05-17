import type { NextApiRequest, NextApiResponse } from 'next';
import sites from '.sitecore/sites.json';
import { fetchAllProductSlugs } from '@/lib/content-hub-client';
import { fetchFromEdge } from '@/lib/sitecore/client';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/config/locales';
import { buildJobSitemapUrls, fetchAllJobsForSitemap } from '@/services/search/job-sitemap.service';
import { SITE_SITEMAP_CONFIG } from '@/config/site-sitemap-config';
import { fetchGlobalSearchSettingsBySite } from '@/services/search/search-settings.server';
import { patchHref } from '@/lib/patch-link';

type SiteDefinition = {
  name: string;
  hostName?: string;
  language?: string;
  virtualFolder?: string;
  includeProductUrlInSitemap?: boolean;
};

type SitemapRouteResult = {
  path: string;
  route: {
    updated: {
      value: string;
    };
    changefrequency?: {
      jsonValue?: {
        displayName?: string;
      };
    };
    priority?: {
      jsonValue?: {
        displayName?: string;
      };
    };
  };
};

type SitemapUrl = {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
};

type RoutesResponse<T> = {
  data?: {
    site?: {
      siteInfo?: {
        routes?: {
          results: T[];
          pageInfo: {
            hasNext: boolean;
            endCursor: string;
          };
          total?: number;
        };
      };
    };
  };
  errors?: Array<{ message?: string }>;
};

type SiteLanguagesResponse = {
  data?: {
    site?: {
      siteInfo?: {
        language?: string;
      };
    };
  };
  errors?: Array<{ message?: string }>;
};

const SITE_DEFINITIONS = sites as SiteDefinition[];

const SITECORE_DATE_REGEX = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/;

const formatDate = (value?: string): string => {
  if (!value) return '';
  const match = SITECORE_DATE_REGEX.exec(value);
  if (!match) return '';

  const [, year, month, day, hour, minute, second] = match;
  return new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    )
  )
    .toISOString()
    .slice(0, 10);
};

const buildSitemapXml = (urls: SitemapUrl[]): string => {
  const body = urls
    .map(
      ({ loc, lastmod, changefreq, priority }) => `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>`;
};

const resolveHostName = (req: NextApiRequest): string => {
  const forwardedHost = req.headers['x-forwarded-host'];
  const hostHeader = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost || req.headers.host || '';
  const firstHost = (hostHeader || '').split(',')[0];
  return firstHost ? firstHost.trim() : '';
};

const resolveBaseUrl = (req: NextApiRequest, hostname: string): string => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || 'http';
  return hostname ? `${proto}://${hostname}` : '';
};

/**
 * Resolve the original request path before rewrites.
 * @param {NextApiRequest} req - Next.js API request.
 * @returns {string} Original request path (best-effort).
 */
const resolveOriginalPath = (req: NextApiRequest): string => {
  const candidates = [
    req.headers['x-forwarded-uri'],
    req.headers['x-original-url'],
    req.headers['x-rewrite-url'],
    req.headers['x-matched-path'],
    req.headers['x-invoke-path'],
    req.url,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const value = Array.isArray(candidate) ? candidate[0] : candidate;
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return '';
};

/**
 * Normalize a locale to the configured casing, if supported.
 * Also maps regional variants like en-US -> en when only the base
 * language is configured in SUPPORTED_LOCALES.
 * @param {string} locale - Locale code to normalize.
 * @returns {string} Normalized locale code.
 */
const normalizeLocale = (locale: string): string => {
  if (!locale) return locale;

  const target = locale.toLowerCase();

  // 1. Exact match (case-insensitive) against supported locales
  const exactMatch = SUPPORTED_LOCALES.find((value) => value.toLowerCase() === target);
  if (exactMatch) {
    return exactMatch;
  }

  // 2. Base-language match: map e.g. "en-US" -> "en" if "en" is supported
  const baseLanguage = target.split('-')[0];
  const baseMatch = SUPPORTED_LOCALES.find((value) => value.toLowerCase() === baseLanguage);
  if (baseMatch) {
    return baseMatch;
  }

  // 3. Fallback to original locale string if we can't normalize it
  return locale;
};

/**
 * Extract locale from a request path, if present.
 * @param {string} path - Request path or URL.
 * @returns {string | undefined} Matched locale code.
 */
const extractLocaleFromPath = (path: string): string | undefined => {
  if (!path) return undefined;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const firstSegment = normalizedPath.split('?')[0]?.split('#')[0]?.split('/')[1];
  if (!firstSegment) return undefined;

  const target = firstSegment.toLowerCase();
  const matched = SUPPORTED_LOCALES.find((locale) => locale.toLowerCase() === target);
  return matched;
};

const getCurrentSiteByHost = (hostname: string): SiteDefinition | undefined => {
  const host = hostname.toLowerCase();
  const hostNoPort = host.split(':')[0];
  const candidates = host === hostNoPort ? [host] : [host, hostNoPort];

  const baseSite = SITE_DEFINITIONS.find((site) => {
    const siteHosts = (site.hostName || '')
      .split('|')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    return siteHosts.some((siteHost) => candidates.includes(siteHost));
  });
  if (!baseSite) return undefined;

  const config = SITE_SITEMAP_CONFIG[baseSite.name.toLowerCase()] || {};
  return { ...baseSite, ...config };
};

const getSiteByName = (siteName?: string): SiteDefinition | undefined => {
  if (!siteName) return undefined;
  const target = siteName.toLowerCase();
  const baseSite = SITE_DEFINITIONS.find((site) => site.name?.toLowerCase() === target);
  if (!baseSite) return undefined;

  const config = SITE_SITEMAP_CONFIG[target] || {};
  return { ...baseSite, ...config };
};

const shouldIncludeProductUrls = (site?: SiteDefinition): boolean => {
  return site?.includeProductUrlInSitemap === true;
};

const parseSourceIds = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  const rawValues = Array.isArray(value) ? value : [value];
  return Array.from(
    new Set(
      rawValues
        .flatMap((entry) => entry.split(','))
        .map((entry) => entry.trim())
        .filter(Boolean),
    ),
  );
};

const resolveJobSourceIds = async (
  site: SiteDefinition,
  requestedSourceIds: string[],
): Promise<string[]> => {
  if (requestedSourceIds.length > 0) {
    return requestedSourceIds;
  }

  const settings = await fetchGlobalSearchSettingsBySite(site.name);
  const sourceId = settings.job?.sourceId?.trim();
  return sourceId ? [sourceId] : [];
};

const getAllRoutes = async <T,>(
  graphqlQuery: string,
  variables: { siteName: string; language: string }
): Promise<T[]> => {
  let returnItems: T[] = [];
  let shouldQueryMoreItems = true;
  let afterValue = '';

  while (shouldQueryMoreItems) {
    const fetchResponse = await fetchFromEdge<RoutesResponse<T>>(graphqlQuery, {
      ...variables,
      after: afterValue,
    });

    if (fetchResponse?.errors?.length) {
      const message = fetchResponse.errors.map((error) => error.message).join('; ');
      throw new Error(message || 'Edge GraphQL returned errors');
    }

    const routes = fetchResponse?.data?.site?.siteInfo?.routes;
    returnItems = returnItems.concat(routes?.results || []);
    shouldQueryMoreItems = Boolean(routes?.pageInfo?.hasNext);
    afterValue = routes?.pageInfo?.endCursor || '';

    if (!routes?.pageInfo) {
      shouldQueryMoreItems = false;
    }
  }

  return returnItems;
};

/**
 * Build a locale-aware route path for Next.js i18n.
 * @param {string} path - Route path from Sitecore (no locale prefix).
 * @param {string} language - Language code to prefix when non-default.
 * @param {string} defaultLanguage - Default locale for the site.
 * @returns {string} Locale-aware path with correct prefixing.
 */
const buildLocalizedRoutePath = (
  path: string,
  language: string,
  defaultLanguage: string,
  siteName: string,
): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const locale = (language || defaultLanguage).replace(/_/g, '-');

  const localizedPath = normalizedPath === '/'
    ? `/${locale}`
    : `/${locale}${normalizedPath}`;

  const patched = patchHref(localizedPath, siteName.toLowerCase(), undefined, locale);
  return patched || localizedPath;
};

/**
 * Fetch available languages for a Sitecore site from Experience Edge.
 * @param {string} siteName - Sitecore site name.
 * @param {string} fallbackLanguage - Fallback language if query fails.
 * @returns {Promise<string[]>} List of unique language codes.
 */
const getSiteLanguages = async (
  siteName: string,
  fallbackLanguage: string,
  requestedLanguage?: string
): Promise<string[]> => {
  const query = `
    query SitemapLanguages($siteName: String!) {
      site {
        siteInfo(site: $siteName) {
          language
        }
      }
    }
  `;

  try {
    const response = await fetchFromEdge<SiteLanguagesResponse>(query, { siteName });
    if (response?.errors?.length) {
      const message = response.errors.map((error) => error.message).join('; ');
      throw new Error(message || 'Edge GraphQL returned errors');
    }

    const siteInfo = response?.data?.site?.siteInfo;
    const languageValues = [
      ...SUPPORTED_LOCALES,
      siteInfo?.language,
      requestedLanguage,
      fallbackLanguage,
    ]
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value))
      .map((value) => normalizeLocale(value));

    const uniqueLanguages = Array.from(new Set(languageValues));
    return uniqueLanguages.length ? uniqueLanguages : [normalizeLocale(fallbackLanguage)];
  } catch (error) {
    console.warn('[sitemap-xml] Failed to load site languages', error);
    const normalizedFallback = normalizeLocale(fallbackLanguage);
    const normalizedRequested = requestedLanguage ? normalizeLocale(requestedLanguage) : undefined;
    const fallbackList = [
      ...SUPPORTED_LOCALES.map((value) => normalizeLocale(value)),
      normalizedFallback,
      normalizedRequested,
    ].filter((value): value is string => Boolean(value));
    return Array.from(new Set(fallbackList));
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    const hostname = resolveHostName(req);
    if (!hostname) {
      res.status(400).send('Missing hostname');
      return;
    }

    const fallbackSiteName =
      process.env.SITECORE_SITE_NAME || process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME;
    const singleSiteFallback =
      SITE_DEFINITIONS.length === 1 ? getSiteByName(SITE_DEFINITIONS[0]?.name) : undefined;
    const site =
      getCurrentSiteByHost(hostname) ||
      getSiteByName(fallbackSiteName) ||
      singleSiteFallback;
    if (!site?.name) {
      res.status(404).send('Site not found for hostname');
      return;
    }

    const baseUrl = resolveBaseUrl(req, hostname) || `https://${hostname}`;
    const defaultLanguage = normalizeLocale(site.language || DEFAULT_LOCALE);
    const requestPath = resolveOriginalPath(req);
    const requestedLanguage = extractLocaleFromPath(requestPath);

    const query = `
      query SitemapQuery($siteName: String!, $language: String!, $after: String = "") {
        site {
          siteInfo(site: $siteName) {
            routes(
              language: $language
              first: 500
              after: $after
            ) {
              total
              pageInfo {
                endCursor
                hasNext
              }
              results {
                path: routePath
                route {
                  updated: field(name: "__updated") {
                    value
                  }
                  changefrequency: field(name: "changefrequency") {
                    jsonValue
                  }
                  priority: field(name: "priority") {
                    jsonValue
                  }
                }
              }
            }
          }
        }
      }
    `;

    const siteLanguages = await getSiteLanguages(site.name, defaultLanguage, requestedLanguage);

    const routesByLanguage = await Promise.all(
      siteLanguages.map(async (language) => ({
        language,
        routes: await getAllRoutes<SitemapRouteResult>(query, { siteName: site.name, language }),
      }))
    );

    const urls: SitemapUrl[] = routesByLanguage.flatMap(({ language, routes }) =>
      routes.map(({ path, route }) => ({
        loc: `${baseUrl}${buildLocalizedRoutePath(path, language, defaultLanguage, site.name)}`,
        lastmod: formatDate(route.updated?.value),
        changefreq: route.changefrequency?.jsonValue?.displayName || 'daily',
        priority: route.priority?.jsonValue?.displayName || '0.5',
      })),
    );

    const includeProductUrls = shouldIncludeProductUrls(site);
    console.log('[sitemap-xml] resolution', {
      hostname,
      siteName: site.name,
      includeProductUrls,
    });
    const today = new Date().toISOString().slice(0, 10);
    const productUrls: SitemapUrl[] = includeProductUrls
      ? (
          await Promise.all(
            siteLanguages.map(async (language) => ({
              language,
              slugs: await fetchAllProductSlugs(language),
            })),
          )
        ).flatMap(({ language, slugs }) =>
          (slugs || []).map((slug) => ({
            loc: `${baseUrl}${buildLocalizedRoutePath(
              `/products/${encodeURIComponent(slug)}`,
              language,
              defaultLanguage,
              site.name,
            )}`,
            lastmod: today,
            changefreq: 'daily',
            priority: '0.5',
          })),
        )
      : [];

    let jobUrls: SitemapUrl[] = [];

    try {
      const requestedSourceIds = parseSourceIds(
        (req.query.sources as string | string[] | undefined) ??
          (req.query.source as string | string[] | undefined),
      );
      const sourceIds = await resolveJobSourceIds(site, requestedSourceIds);
      const jobs = await fetchAllJobsForSitemap(sourceIds);
      jobUrls = buildJobSitemapUrls(jobs, baseUrl).map((url) => {
        try {
          const parsed = new URL(url.loc);
          const locale = parsed.pathname.split('/').filter(Boolean)[0] || defaultLanguage;
          const patchedPath = patchHref(parsed.pathname, site.name.toLowerCase(), undefined, locale);
          return {
            ...url,
            loc: `${parsed.origin}${patchedPath || parsed.pathname}`,
          };
        } catch {
          return url;
        }
      });
    } catch (error) {
      console.error('[sitemap-jobs] failed', error);
    }

    const xml = buildSitemapXml([...urls, ...productUrls, ...jobUrls]);

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(xml);
  } catch (error) {
    console.error('[sitemap-xml]', error);
    res.status(500).send('Internal Server Error');
  }
}

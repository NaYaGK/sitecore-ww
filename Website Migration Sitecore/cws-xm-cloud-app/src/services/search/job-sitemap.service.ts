import { SUPPORTED_LOCALES } from '@/config/locales';

/**
 * Job shape coming from Sitecore Search (Workday index)
 */
export interface SitemapJob {
  id: string;
  job_title: string;
  job_country_code?: string; // DE, AT, PL, NL, etc.
  updated_at?: string;
}

/**
 * Slugify job title:
 * - lowercase
 * - spaces -> -
 * - remove special characters
 */
const slugifyJobTitle = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

/**
 * Resolve locale from country code using SUPPORTED_LOCALES
 *
 * Examples:
 *  DE -> de-DE
 *  AT -> de-AT
 *  PL -> pl-PL
 *  NL -> nl-NL
 *  CH -> de-CH (first match wins)
 */
const resolveLocaleFromCountryCode = (
  countryCode: string
): string | null => {
  const upper = countryCode.toUpperCase();

  // Find first supported locale ending with -{COUNTRY}
  const match = SUPPORTED_LOCALES.find((locale) => {
    const parts = locale.split('-');
    return parts.length === 2 && parts[1]?.toUpperCase() === upper;
  });

  return match || null;
};

/**
 * Fetch ALL jobs from Sitecore Search using REST API
 * (Server-safe, build-time safe)
 */
export async function fetchAllJobsForSitemap(sourceIds: string[] = []): Promise<SitemapJob[]> {
  const searchApiUrl = process.env.SITECORE_SEARCH_API_URL;
  const searchApiKey = process.env.SITECORE_SEARCH_API_KEY;
  const normalizedSourceIds = sourceIds.map((value) => value.trim()).filter(Boolean);

  if (!searchApiUrl || !searchApiKey) {
    throw new Error('[job-sitemap] Missing Sitecore Search API configuration');
  }

  const response = await fetch(searchApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: searchApiKey,
    },
    body: JSON.stringify({
      widget: {
        items: [
          {
            rfk_id: 'rfkid_9',
            entity: 'workdayjobs',
            ...(normalizedSourceIds.length > 0 ? { sources: normalizedSourceIds } : {}),
            search: {
              content: {},
              limit: 100,
            },
          },
        ],
      },
      context: {
        locale: {
          country: 'us',
          language: 'en',
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `[job-sitemap] Search API failed with status ${response.status}`
    );
  }

  const data = await response.json();
  return data?.widgets?.[0]?.content ?? [];
}

/**
 * Build sitemap URLs for jobs
 *
 * Final URL format:
 * /{locale}/jobs/{slugified-job-title}-{JOB_ID}
 *
 * Example:
 * /de-DE/jobs/teamleitung-werkstatt-m-w-d-JR1011747
 */
export function buildJobSitemapUrls(
  jobs: SitemapJob[],
  baseUrl: string
) {
  return jobs.flatMap((job) => {
    if (!job.id || !job.job_title || !job.job_country_code) {
      return [];
    }

    const locale = resolveLocaleFromCountryCode(job.job_country_code);
    if (!locale) {
      // Skip jobs with unsupported country codes
      return [];
    }

    const slug = slugifyJobTitle(job.job_title);
    const lastmod =
      job.updated_at?.substring(0, 10) ||
      new Date().toISOString().slice(0, 10);

    return [
      {
        loc: `${baseUrl}/${locale}/jobs/${slug}-${job.id}`,
        lastmod,
        changefreq: 'daily',
        priority: '0.7',
      },
    ];
  });
}

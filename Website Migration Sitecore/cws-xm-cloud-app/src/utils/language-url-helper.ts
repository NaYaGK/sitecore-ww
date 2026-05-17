import { SUPPORTED_LOCALES } from '@/config/locales';
import { patchHref, getSitePathSegmentForLocale } from '@/lib/patch-link';

/**
 * Helper utilities for fetching language-specific display names
 * Uses a server-side API route to access Sitecore GraphQL API
 */

export interface LanguageDisplayName {
  language: string;
  displayName: string;
  /** Full URL path for this item in the target language (from Sitecore item url.path) */
  path?: string;
}

/**
 * Fetch language-specific display names for a given Sitecore item
 * Calls the server-side API route which has access to server-side environment variables
 * 
 * @param itemId - The Sitecore item ID (GUID format)
 * @returns Array of language codes and their corresponding display names
 */
export async function fetchLanguageDisplayNames(
  itemId: string
): Promise<LanguageDisplayName[]> {
  try {
    const response = await fetch('/api/language-display-names', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[language-url-helper] API error:', response.status, errorText);
      return [];
    }

    const result = await response.json();

    if (!result.success) {
      console.error('[language-url-helper] API returned error:', result.error);
      return [];
    }

    return result.data || [];
  } catch (error) {
    console.error('[language-url-helper] Failed to fetch language display names:', error);
    return [];
  }
}

/**
 * Create a map of language codes to display names for quick lookup
 *
 * @param displayNames - Array of language display names
 * @returns Map with lowercase language codes as keys and display names as values
 */
export function createLanguageDisplayNameMap(
  displayNames: LanguageDisplayName[]
): Map<string, string> {
  return new Map(
    displayNames.map((item) => [
      item.language.toLowerCase().replace(/_/g, '-').trim(),
      item.displayName,
    ])
  );
}

/**
 * Create a map of language codes to full URL paths (from Sitecore item url.path)
 * Used for correct language-switcher URLs when each segment is localized.
 *
 * @param displayNames - Array of language display names (with optional path)
 * @returns Map with lowercase language codes as keys and path strings as values
 */
export function createLanguagePathMap(
  displayNames: LanguageDisplayName[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const item of displayNames) {
    const key = item.language.toLowerCase().replace(/_/g, '-').trim();
    if (key && item.path) {
      map.set(key, item.path);
    }
  }
  return map;
}

export const normalizeLocale = (v?: string) => v?.toLowerCase().replace(/_/g, '-').trim() ?? '';

export const inferLocaleFromUrl = (url?: string) => {
  if (!url) return null;
  const match = url.match(/^\/?([a-zA-Z]{2}-[a-zA-Z]{2})/);
  return match ? normalizeLocale(match[1]) : null;
};

export const findByLangPrefix = (map: Map<string, string>, lang: string): string | undefined => {
  const key = Array.from(map.keys()).find((k) => k.startsWith(`${lang}-`));
  return key ? map.get(key) : undefined;
};

export const resolveDisplayName = (
  languageCode: string,
  url: string,
  map: Map<string, string>,
): string | undefined => {
  // 1. Exact locale from URL (fr-BE, fr-CH)
  const inferred = inferLocaleFromUrl(url);
  if (inferred && map.has(inferred)) return map.get(inferred);

  // 2. Language fallback (fr → fr-*)
  const lang = normalizeLocale(languageCode);
  if (lang.length === 2) {
    const byLang = findByLangPrefix(map, lang);
    if (byLang) return byLang;
  }

  // 3. English fallback
  if (map.has('en')) return map.get('en');
  return findByLangPrefix(map, 'en');
};

/** All site path segments across locales (workwear, arbeitskleidung, odziez-robocza-i-ochronna, etc.). Strip the current locale's site segment when switching to another language. */
const ALL_SITE_PATH_SEGMENTS = new Set(
  [
    'workwear', 'arbeitskleidung', 'vetements-de-travail', 'ropa-de-trabajo',
    'abbigliamento-da-lavoro', 'werkkledij', 'odziez-robocza-i-ochronna',
    'pracovni-odevy', 'pracovne-odevy', 'munka-es-vedoruha', 'imbracaminte-de-lucru',
    'rabotno-obleklo', 'radna-odjeca', 'delovna-oblacila', 'arbetsklader',
    'healthcare', 'gesundheitswesen',
  ].map((s) => s.toLowerCase()),
);

const JOBS_PATH_SEGMENT = 'jobs';

/** Strip /home from URL – remove as path segment anywhere (homepage = locale root, /home breaks links) */
function stripHomeSegment(url: string): string {
  const withoutHome = url.replace(/\/home(?=\/|$)/gi, '').replace(/\/+/g, '/');
  return withoutHome.replace(/\/$/, '') || '/';
}

/**
 * Ensures the language-switcher URL has the correct locale-specific site path segment.
 * Uses patchHref to replace e.g. /de-DE/workwear/ with /de-DE/arbeitskleidung/ when switching to German.
 */
export function ensureLanguageSwitcherHostSegment(
  url: string,
  locale: string,
  siteName: string
): string {
  if (!url || typeof url !== 'string') return url;
  const patched = patchHref(url, siteName, undefined, locale);
  return patched ?? url;
}

/**
 * Build the full language-switcher URL from a Sitecore item path.
 * The path from Sitecore (item url.path) may be in formats like:
 * - /workwear/cs-CZ/jak-pronajem-funguje/zakaznicky-portal
 * - /pracovni-odevy/jak-pronajem-funguje/zakaznicky-portal
 * - /sitecore/content/... (strip to get site-relative path)
 * We normalize to app format: /cs-CZ/pracovni-odevy/jak-pronajem-funguje/zakaznicky-portal
 *
 * NOTE: We intentionally avoid running the full content path through patchHref because it
 * replaces ALL occurrences of the canonical site name (e.g. "workwear") with the
 * locale-specific segment — which corrupts content nodes that share the same name.
 * Instead, we strip the site segment from the Sitecore path and explicitly prepend
 * the correct locale-specific one.
 */
export function buildUrlFromItemPath(
  itemPath: string,
  locale: string,
  siteName: string
): string {
  if (!itemPath || typeof itemPath !== 'string') return '';
  let path = itemPath.replace(/^\/*/, '/').replace(/\/+/g, '/');
  // Strip Sitecore content tree prefix if present
  if (path.toLowerCase().startsWith('/sitecore/content/')) {
    path = path.replace(/^\/sitecore\/content\/?/i, '/');
  }
  const segments = path.split('/').filter(Boolean);

  // Strip any locale-looking segment — Sitecore may embed it in various positions
  const localeIdx = segments.findIndex((s) => /^[a-z]{2}(?:-[a-z]{2})?$/i.test(s ?? ''));
  if (localeIdx >= 0) {
    segments.splice(localeIdx, 1);
  }

  // Strip leading site segment — url.path may start with it (e.g. /workwear/... or /arbeitskleidung/...)
  if (segments.length > 0 && ALL_SITE_PATH_SEGMENTS.has(segments[0]!.toLowerCase())) {
    segments.shift();
  }

  const canonicalLocale =
    SUPPORTED_LOCALES.find((l) => l.toLowerCase() === locale.toLowerCase().replace(/_/g, '-')) ??
    locale;

  // For site-based apps (workwear, healthcare), prepend the locale-specific site segment.
  // For CWS, just use /{locale}/{content-path}.
  const isSiteBased = siteName === 'workwear' || siteName === 'healthcare' || siteName === 'hygiene';
  const siteSegment = isSiteBased ? getSitePathSegmentForLocale(siteName, locale) : null;

  const contentPath = segments.length ? `/${segments.join('/')}` : '';
  const fullPath = siteSegment
    ? `/${canonicalLocale}/${siteSegment}${contentPath}`
    : `/${canonicalLocale}${contentPath}`;

  return stripHomeSegment(fullPath);
}

/** Swap /site-segment/locale to /locale/site-segment. Sitecore stores URLs as /arbeitskleidung/de-DE; we want /de-DE/arbeitskleidung. */
export function ensureLocaleFirst(url: string): string {
  if (!url || typeof url !== 'string') return url;
  const pathOnly = url.startsWith('http')
    ? (() => { try { return new URL(url).pathname; } catch { return url.replace(/^\/*/, '/'); } })()
    : url.replace(/^\/*/, '/');
  const origin = url.startsWith('http') ? String(url.match(/^https?:\/\/[^/]+/)?.at(0) ?? '') : '';
  const segments = pathOnly.replace(/^\//, '').split('/').filter(Boolean);
  if (segments.length !== 2) return url;
  const [a, b] = segments;
  const aLower = (a ?? '').toLowerCase();
  const bLower = (b ?? '').toLowerCase();
  const aIsSite = ALL_SITE_PATH_SEGMENTS.has(aLower);
  const bIsLocale = SUPPORTED_LOCALES.some((l) => l.toLowerCase() === bLower);
  if (aIsSite && bIsLocale) {
    const locale = SUPPORTED_LOCALES.find((l) => l.toLowerCase() === bLower) ?? b;
    const fixed = `/${locale}/${a}`;
    return origin ? origin + fixed : fixed;
  }
  return url;
}

/** When home node only: ensure output is /locale/homenode. Sitecore/patchHref may give /arbeitskleidung/de-DE or /workwear/arbeitskleidung/de-DE. Use the site segment that is the target locale's segment (immediately before the locale in path). */
function ensureLocaleFirstForHome(base: string): string {
  const parts = base.replace(/^\//, '').split('/').filter(Boolean);
  if (parts.length < 2) return base;
  const localeIdx = parts.findIndex((p) => SUPPORTED_LOCALES.some((l) => l.toLowerCase() === (p ?? '').toLowerCase()));
  if (localeIdx < 0) return base;
  const locale = parts[localeIdx];
  // Prefer the segment immediately before the locale (target language's site segment, e.g. arbeitskleidung for de-DE)
  const siteSegmentBeforeLocale = localeIdx > 0 && ALL_SITE_PATH_SEGMENTS.has((parts[localeIdx - 1] ?? '').toLowerCase())
    ? parts[localeIdx - 1]
    : parts.find((p) => ALL_SITE_PATH_SEGMENTS.has((p ?? '').toLowerCase()));
  if (localeIdx > 0 && siteSegmentBeforeLocale) {
    return `/${locale}/${siteSegmentBeforeLocale}`;
  }
  return base;
}

/**
 * Build fully localized URL by translating EACH segment if possible.
 * Parent + child segments are preserved.
 * Strips /home from baseUrl and result (Sitecore may store /locale/home, we want /locale).
 *
 * Path structure comes from Sitecore wildcard; no slug replacement.
 */
export const buildLocalizedUrlForCurrentItem = ({
  baseUrl,
  originalPath,
  localizedSlug,
}: {
  baseUrl: string; // /cs-CZ/ or /en-GB/home
  originalPath: string; // /ManojTestPage/jobsearch or /home
  localizedSlug?: string; // czehjob
}) => {
  const normalizedBase = stripHomeSegment(baseUrl.replace(/\/$/, '') || '/');
  const pathWithoutLeadingSlash = originalPath.replace(/^\//, '');
  const segments = pathWithoutLeadingSlash ? pathWithoutLeadingSlash.split('/').filter(Boolean) : [];

  // Homepage or root: return locale/homenode only (e.g. /de-DE/arbeitskleidung)
  const firstSegment = segments[0];
  if (!segments.length || (segments.length === 1 && (firstSegment?.toLowerCase() === 'home' || ALL_SITE_PATH_SEGMENTS.has(firstSegment?.toLowerCase() ?? '')))) {
    return ensureLocaleFirstForHome(normalizedBase);
  }

  // Strip the site segment so we don't duplicate it. When on /de-DE/arbeitskleidung/produkte and
  // switching to Polish (base /pl-PL/odziez-robocza-i-ochronna), we must strip "arbeitskleidung"
  // to get /pl-PL/odziez-robocza-i-ochronna/produkty, not /pl-PL/odziez-robocza-i-ochronna/arbeitskleidung/produkty
  const baseSegments = normalizedBase.split('/').filter(Boolean);
  const lastBaseSegment = baseSegments[baseSegments.length - 1];
  let segmentsToUse = segments;

  // Strip leading segment when it matches target base (same language, e.g. /arbeitskleidung/produkte for German)
  while (
    segmentsToUse.length > 0 &&
    lastBaseSegment &&
    segmentsToUse[0]?.toLowerCase() === lastBaseSegment.toLowerCase()
  ) {
    segmentsToUse = segmentsToUse.slice(1);
  }

  // Strip leading site segment in another language (e.g. arbeitskleidung when switching to Polish)
  while (
    segmentsToUse.length > 0 &&
    ALL_SITE_PATH_SEGMENTS.has(segmentsToUse[0]?.toLowerCase() ?? '')
  ) {
    segmentsToUse = segmentsToUse.slice(1);
  }

  // Job detail pages live under /jobs/* and should switch to the locale-specific site home.
  if ((segmentsToUse[0] ?? '').toLowerCase() === JOBS_PATH_SEGMENT) {
    return ensureLocaleFirstForHome(normalizedBase);
  }

  if (!segmentsToUse.length) return ensureLocaleFirstForHome(normalizedBase);

  const parentSegments = segmentsToUse.slice(0, -1);
  const originalLastSegment = segmentsToUse[segmentsToUse.length - 1];
  // Don't use "home" as slug on subpages - Sitecore returns "Home" when no translation exists
  const effectiveSlug =
    localizedSlug && localizedSlug.toLowerCase() !== 'home'
      ? localizedSlug
      : originalLastSegment;
  const finalSegments = [...parentSegments, effectiveSlug];
  const built = `${normalizedBase}/${finalSegments.join('/')}`;
  return stripHomeSegment(built);
};

/**
 * Lowercase the locale segment at the start of a URL path.
 * e.g. /de-DE/arbeitskleidung -> /de-de/arbeitskleidung
 * Handles both relative paths and full URLs.
 */
export const lowercaseLocaleInUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return url;
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const u = new URL(url);
      const path = u.pathname.replace(/^(\/)([a-z]{2}(?:-[a-z]{2})?)(?=\/|$)/i, (_, slash, loc) => slash + loc.toLowerCase());
      return u.origin + path + (u.search || '') + (u.hash || '');
    }
  } catch {
    // Fall through to path-only handling
  }
  return url.replace(/^(\/)([a-z]{2}(?:-[a-z]{2})?)(?=\/|$)/i, (_, slash, loc) => slash + loc.toLowerCase());
};

/**
 * Helper to strip all occurrences of supported locales from the start of the path
 */
export const stripLocales = (path: string): string => {
  let cleanPath = path;
  const localePattern = new RegExp(`^/(${SUPPORTED_LOCALES.join('|')})(?=/|$)`, 'i');

  // Iteratively strip locales to handle accidental nesting like /de-DE/cs-cz/
  while (localePattern.test(cleanPath)) {
    cleanPath = cleanPath.replace(localePattern, '');
  }
  return cleanPath || '/';
};

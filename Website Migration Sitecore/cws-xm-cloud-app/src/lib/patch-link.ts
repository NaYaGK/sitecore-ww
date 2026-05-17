/**
 * Patches internal links to include the site name (workwear, healthcare, hygiene) in the path.
 * Uses locale-specific display path segments (e.g. arbeitskleidung for de-DE, workwear for en).
 *
 * Examples:
 *   /en/core-solutions -> /en/workwear/core-solutions
 *   /de-DE/produkte -> /de-DE/arbeitskleidung/produkte
 *   /de-DE/workwear/produkte -> /de-DE/arbeitskleidung/produkte (replaces with display segment)
 */

import { SUPPORTED_LOCALES, getCanonicalLocale } from '@/config/locales';

const SITE_NAMES = ['workwear', 'healthcare', 'hygiene'] as const;

export type SiteName = (typeof SITE_NAMES)[number];

function isSiteName(name: string): name is SiteName {
  return SITE_NAMES.includes(name as SiteName);
}

const localeSet = new Set(SUPPORTED_LOCALES.map((l) => l.toLowerCase()));

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Locale-specific path segments per site (from microfrontends.json).
 * Maps (siteName, locale) -> URL segment. Fallback: site name (workwear, healthcare).
 */
export function getSitePathSegmentForLocale(siteName: string, locale: string): string {
  const loc = locale.toLowerCase().replace(/_/g, '-');
  if (siteName === 'workwear') {
    const workwearMap: Record<string, string> = {
      en: 'workwear',
      'en-gb': 'workwear',
      'en-ie': 'workwear',
      'de-de': 'arbeitskleidung',
      'de-at': 'arbeitskleidung',
      'de-ch': 'arbeitskleidung',
      'fr-fr': 'vetements-de-travail',
      'fr-be': 'vetements-de-travail',
      'fr-lu': 'vetements-de-travail',
      'fr-ch': 'vetements-de-travail',
      'es-es': 'ropa-de-trabajo',
      'it-it': 'abbigliamento-da-lavoro',
      'nl-nl': 'werkkledij',
      'nl-be': 'werkkledij',
      'pl-pl': 'odziez-robocza-i-ochronna',
      'cs-cz': 'pracovni-odevy',
      'sk-sk': 'pracovne-odevy',
      'hu-hu': 'munka-es-vedoruha',
      'ro-ro': 'imbracaminte-de-lucru',
      'hr-hr': 'radna-odjeca',
      'sl-si': 'delovna-oblacila',
      'sv-se': 'arbetsklader',
    };
    return workwearMap[loc] ?? 'workwear';
  }
  if (siteName === 'healthcare') {
    const healthcareMap: Record<string, string> = {
      en: 'healthcare',
      'de-DE': 'healthcare',
    };
    return healthcareMap[loc] ?? 'healthcare';
  }
  return siteName;
}

/** Collapse duplicate consecutive path segments, e.g. /healthcare/healthcare/foo -> /healthcare/foo */
function collapseDuplicateSegments(path: string): string {
  const parts = path.split('/').filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    if (out[out.length - 1]?.toLowerCase() !== p.toLowerCase()) out.push(p);
  }
  return out.length ? '/' + out.join('/') : path.startsWith('/') ? '/' : path;
}

/** Ensure the leading locale segment in a path uses canonical BCP 47 casing. */
function canonicalizeLocaleInPath(fullPath: string): string {
  const pathToCheck = fullPath.startsWith('http') ? (() => {
    try { return new URL(fullPath).pathname; } catch { return fullPath; }
  })() : fullPath;
  const match = pathToCheck.match(/^(\/)([a-z]{2}(?:-[a-z]{2})?)(?=\/|$)/i);
  if (!match) return fullPath;
  const canonical = getCanonicalLocale(match[2]);
  if (canonical === match[2]) return fullPath;
  const normalizedPath = pathToCheck.replace(match[0], `${match[1]}${canonical}`);
  return fullPath.startsWith('http')
    ? fullPath.replace(pathToCheck, normalizedPath)
    : normalizedPath;
}

/**
 * Ensures the href uses the current page locale. Used for CWS-only links that don't target
 * workwear/healthcare/hygiene. Replaces /en/foo -> /de-DE/foo when viewing in German.
 */
function ensureLocaleInHref(href: string, locale?: string | null): string {
  const rawLocale = locale ?? inferLocaleFromHref(href);
  const targetLocale = getCanonicalLocale(rawLocale ?? undefined) || 'en';

  let pathToPatch = href;
  let originPrefix = '';
  if (href.startsWith('http://') || href.startsWith('https://')) {
    try {
      const u = new URL(href);
      const isSameOrigin =
        u.hostname === 'localhost' ||
        u.hostname.endsWith('.localhost') ||
        (typeof window !== 'undefined' && u.origin === window.location.origin);
      if (!isSameOrigin) return href;
      pathToPatch = u.pathname + (u.search || '') + (u.hash || '');
      originPrefix = u.origin;
    } catch {
      return href;
    }
  }

  const localeMatch = pathToPatch.match(/^\/([a-z]{2}(?:-[a-z]{2})?)(?=\/|$)/i);
  let newPath: string;
  if (localeMatch) {
    newPath = pathToPatch.replace(localeMatch[0], `/${targetLocale}`).replace(/\/+/g, '/');
  } else if (pathToPatch === '/' || pathToPatch === '') {
    newPath = `/${targetLocale}/`;
  } else if (pathToPatch.startsWith('/')) {
    newPath = `/${targetLocale}${pathToPatch}`.replace(/\/+/g, '/');
  } else {
    newPath = `/${targetLocale}/${pathToPatch}`.replace(/\/+/g, '/');
  }
  const result = originPrefix ? originPrefix + newPath : newPath;
  return canonicalizeLocaleInPath(result);
}

/** Extract locale from href prefix, preserving canonical casing, e.g. /de-DE/foo -> de-DE */
function inferLocaleFromHref(href: string): string | null {
  const match = href.match(/^\/([a-z]{2}(?:-[a-z]{2})?)(?=\/|$)/i);
  if (!match) return null;
  const candidate = match[1]?.toLowerCase().replace(/_/g, '-');
  const found = SUPPORTED_LOCALES.find((l) => l.toLowerCase().replace(/_/g, '-') === candidate);
  return found ?? null;
}

/**
 * Patches an internal href to include the locale-specific site path segment.
 * Replaces /locale/workwear/ with /locale/arbeitskleidung/ for de-DE, etc.
 *
 * @param href - The href to patch
 * @param siteName - Current page site (workwear, healthcare, hygiene, cws)
 * @param targetSite - Optional. When on cws site, use this as the segment to inject.
 * @param locale - Optional. Current page locale. Inferred from href if not provided.
 */
export function patchHref(
  href: string | undefined,
  siteName: string,
  targetSite?: string,
  locale?: string | null
): string | undefined {
  let effectiveSite = targetSite && isSiteName(targetSite) ? targetSite : siteName;
  if (!href) return href;
  if (!isSiteName(effectiveSite)) {
    if (effectiveSite === 'cws') {
      if (href.toLowerCase().includes('/workwear')) effectiveSite = 'workwear';
      else if (href.toLowerCase().includes('/healthcare')) effectiveSite = 'healthcare';
      else if (href.toLowerCase().includes('/hygiene')) effectiveSite = 'hygiene';
      else {
        // CWS-only links: still apply locale so /en/contact -> /de-DE/contact when viewing in German
        return ensureLocaleInHref(href, locale);
      }
    } else return href;
  }

  // Don't patch external links or special protocols (except internal full URLs)
  if (
    href.startsWith('tel:') ||
    href.startsWith('mailto:') ||
    href.startsWith('#') ||
    href.startsWith('javascript:')
  ) {
    return href;
  }

  let pathToPatch = href;
  let originPrefix = '';
  if (href.startsWith('http://') || href.startsWith('https://')) {
    try {
      const u = new URL(href);
      const isSameOrigin =
        u.hostname === 'localhost' ||
        u.hostname.endsWith('.localhost') ||
        (typeof window !== 'undefined' && u.origin === window.location.origin);
      if (!isSameOrigin) return href;
      pathToPatch = u.pathname + (u.search || '') + (u.hash || '');
      originPrefix = u.origin;
    } catch {
      return href;
    }
  }

  const rawLocale = locale ?? inferLocaleFromHref(pathToPatch);
  const inferredLocale = getCanonicalLocale(rawLocale ?? undefined) || 'en';
  const displaySegment = getSitePathSegmentForLocale(effectiveSite, rawLocale ?? 'en');
  const localePrefixMatch = pathToPatch.match(/^\/([a-z]{2}(?:-[a-z]{2})?)(?=\/|$)/i);
  const localePrefix = localePrefixMatch?.[0] ?? '';
  const pathAfterLocale = localePrefix ? pathToPatch.slice(localePrefix.length) || '/' : pathToPatch;

  if (displaySegment !== effectiveSite) {
    // Only rewrite the leading site host segment. Content nodes can legitimately be named "workwear".
    const redundantLeadingPattern = new RegExp(
      `^/${escapeRegExp(effectiveSite)}/${escapeRegExp(displaySegment)}(?=/|$)`,
      'i',
    );
    if (redundantLeadingPattern.test(pathAfterLocale)) {
      const collapsedPath = pathAfterLocale.replace(redundantLeadingPattern, `/${displaySegment}`);
      const resultPath = `${localePrefix}${collapsedPath}`.replace(/\/+/g, '/');
      const fullResult = originPrefix ? originPrefix + resultPath : resultPath;
      return canonicalizeLocaleInPath(fullResult);
    }

    const canonicalLeadingPattern = new RegExp(`^/${escapeRegExp(effectiveSite)}(?=/|$)`, 'i');
    if (canonicalLeadingPattern.test(pathAfterLocale)) {
      const replacedPath = pathAfterLocale.replace(canonicalLeadingPattern, `/${displaySegment}`);
      const resultPath = `${localePrefix}${replacedPath}`.replace(/\/+/g, '/');
      const fullResult = originPrefix ? originPrefix + resultPath : resultPath;
      return canonicalizeLocaleInPath(fullResult);
    }
  }

  const displaySegmentPattern = new RegExp(`^/${escapeRegExp(displaySegment)}(?=/|$)`, 'i');
  if (displaySegmentPattern.test(pathAfterLocale)) {
    return canonicalizeLocaleInPath(href);
  }

  let newHref = pathToPatch;
  if (localePrefixMatch) {
    const pathAfterLocaleWithoutSlash = pathAfterLocale.replace(/^\//, '');
    const alreadyHasSegment =
      pathAfterLocaleWithoutSlash === '' ||
      pathAfterLocaleWithoutSlash.toLowerCase().startsWith(`${displaySegment}/`) ||
      pathAfterLocaleWithoutSlash.toLowerCase() === displaySegment;
    if (!alreadyHasSegment) {
      const canonicalLoc = getCanonicalLocale(localePrefixMatch[1]);
      newHref = `/${canonicalLoc}/${displaySegment}${pathAfterLocale === '/' ? '/' : pathAfterLocale}`;
    }
  } else if (pathToPatch === '/' || pathToPatch === '') {
    newHref = `/${inferredLocale}/${displaySegment}/`;
  } else if (pathToPatch.startsWith('/')) {
    newHref = `/${displaySegment}${pathToPatch}`;
  }

  const result = newHref !== pathToPatch ? newHref : pathToPatch;
  const normalized = result ? result.replace(/\/+/g, '/') : result;
  const fullResult = originPrefix && normalized ? originPrefix + normalized : normalized;
  return fullResult ? canonicalizeLocaleInPath(fullResult) : fullResult;
}

export interface LinkFieldValue {
  href?: string;
  text?: string;
  [key: string]: unknown;
}

/**
 * Patches a link field's href to use the locale-specific site path segment.
 *
 * @param targetSite - Optional. When on cws site, use this to patch links that target a specific area.
 * @param locale - Optional. Current page locale (e.g. de-DE). Inferred from href when not provided.
 */
export function patchLinkField<T extends { value?: { href?: string;[key: string]: unknown } }>(
  link: T | undefined,
  siteName: string,
  targetSite?: string,
  locale?: string | null
): T | undefined {
  if (!link?.value?.href) return link;
  const effectiveSite = targetSite && isSiteName(targetSite) ? targetSite : siteName;
  if (!isSiteName(effectiveSite) && effectiveSite !== 'cws') return link;

  const patchedHref = patchHref(link.value.href, siteName, targetSite, locale);
  if (patchedHref === link.value.href) return link;

  return {
    ...link,
    value: {
      ...link.value,
      href: patchedHref,
    },
  } as T;
}

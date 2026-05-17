'use client';

import { useRouter } from 'next/router';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { SUPPORTED_LOCALES, getCanonicalLocale } from '@/config/locales';

const localeSet = new Set(SUPPORTED_LOCALES.map((l) => l.toLowerCase()));

/**
 * Returns the current page locale with canonical BCP 47 casing (e.g. de-DE, pl-PL).
 * Used for building locale-specific URLs in links.
 */
export function useLocale(): string {
  const { page } = useSitecore();
  const router = useRouter();

  // Sitecore page context (SSR and client)
  const pageLocale = (page as { locale?: string })?.locale;
  if (pageLocale) {
    return getCanonicalLocale(pageLocale);
  }

  // Next.js i18n
  if (router.locale) {
    return getCanonicalLocale(router.locale);
  }

  // Infer from path: /de-DE/arbeitskleidung/... -> de-DE
  const path = router.asPath ?? router.pathname ?? '';
  const pathStr = typeof path === 'string' ? path : Array.isArray(path) ? (path as string[]).join('/') : '';
  const firstSegment = pathStr.split('/').filter(Boolean)[0]?.toLowerCase().replace(/_/g, '-');
  if (firstSegment && localeSet.has(firstSegment)) {
    return getCanonicalLocale(firstSegment);
  }

  return 'en';
}

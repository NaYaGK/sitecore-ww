'use client';

import { useSitecore } from '@sitecore-content-sdk/nextjs';

const DEFAULT_SITE = 'cws';

/**
 * Returns the current site name (workwear, healthcare, hygiene, cws) from the Sitecore page context.
 * Used for patching internal links with the site segment in the URL path.
 */
export function useSiteName(): string {
  const { page } = useSitecore();
  const pageWithSite = page as {
    siteName?: string;
    context?: { site?: { name?: string } };
  };
  const siteName =
    pageWithSite.siteName ??
    pageWithSite.context?.site?.name ??
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_DEFAULT_SITE_NAME) ??
    DEFAULT_SITE;
  return String(siteName).toLowerCase();
}

/**
 * Geo-based locale resolution.
 * Maps IP-derived country codes (ISO 3166-1 alpha-2) to supported locales.
 * Used when the user visits without an explicit locale in the URL.
 *
 * Vercel provides req.geo.country and x-vercel-ip-country header.
 * Falls back to 'en' when country is not in the supported list.
 */

import { COUNTRY_TO_LOCALE, DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/config/locales';

const supportedLocaleSet = new Set(SUPPORTED_LOCALES.map((l) => l.toLowerCase()));

/** Geo shape from Vercel NextRequest (req.geo) */
export interface RequestGeo {
  country?: string;
  region?: string;
  city?: string;
}

/** Headers-like object (Headers or { get(name): string | null }) */
type HeadersLike = Headers | { get?: (name: string) => string | null };

function getCountryFromHeaders(headers: HeadersLike): string | undefined {
  const get = headers instanceof Headers ? (n: string) => headers.get(n) : headers.get;
  if (typeof get !== 'function') return undefined;
  const v = get('x-vercel-ip-country');
  return v && typeof v === 'string' && v.length === 2 ? v : undefined;
}

/**
 * Returns the locale for the given country code if it exists in SUPPORTED_LOCALES.
 * Otherwise returns DEFAULT_LOCALE ('en').
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g. DE, AT, FR)
 * @returns Supported locale string (e.g. de-DE, de-AT) or 'en'
 */
export function getLocaleFromCountry(countryCode: string | undefined | null): string {
  if (!countryCode || typeof countryCode !== 'string') {
    return DEFAULT_LOCALE;
  }
  const upper = countryCode.trim().toUpperCase();
  const locale = COUNTRY_TO_LOCALE[upper];
  if (!locale) {
    return DEFAULT_LOCALE;
  }
  // Ensure the mapped locale is in our supported list
  if (supportedLocaleSet.has(locale.toLowerCase())) {
    return locale;
  }
  return DEFAULT_LOCALE;
}

/**
 * Extracts country from request geo and/or headers, then returns the appropriate locale.
 * Checks req.geo.country first, then x-vercel-ip-country header (Vercel).
 *
 * @param headers - Request headers
 * @param geo - Optional req.geo from NextRequest (Vercel provides this)
 * @returns Locale string
 */
export function getLocaleFromGeo(
  headers: HeadersLike,
  geo?: RequestGeo | null
): string {
  const country =
    geo?.country ||
    getCountryFromHeaders(headers);
  return getLocaleFromCountry(country ?? undefined);
}

/**
 * @deprecated Use getLocaleFromGeo(headers, geo).
 * Kept for backward compatibility.
 */
export function getLocaleFromGeoHeaders(headers: HeadersLike): string {
  return getLocaleFromGeo(headers);
}

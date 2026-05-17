/**
 * Single source of truth for locale configuration.
 * Uses full BCP 47 codes (e.g. de-DE, es-ES).
 *
 * LOCALE_CONFIG holds both:
 * - supported: locales available in the app (Next.js i18n, middleware, routing)
 * - countryToLocale: geo mapping for visitors without locale in URL (IP country → locale)
 *
 * Values in countryToLocale must exist in supported. Update this file to add/remove locales.
 */
export const DEFAULT_LOCALE = 'en';

export const LOCALE_CONFIG = {
  supported: [
    'en',
    'en-GB',
    'de-DE',
    'de-AT',
    'de-CH',
    'fr-FR',
    'fr-BE',
    'fr-LU',
    'fr-CH',
    'es-ES',
    'it-IT',
    'nl-NL',
    'nl-BE',
    'pl-PL',
    'cs-CZ',
    'sk-SK',
    'hu-HU',
    'ro-RO',
    'hr-HR',
    'sl-SI',
    'ar-SA',
    'en-IE',
    'sv-SE',
  ] as const,
  countryToLocale: {
    DE: 'de-DE',
    AT: 'de-AT',
    CH: 'de-CH',
    FR: 'fr-FR',
    BE: 'nl-BE',
    LU: 'fr-LU',
    ES: 'es-ES',
    IT: 'it-IT',
    NL: 'nl-NL',
    PL: 'pl-PL',
    CZ: 'cs-CZ',
    SK: 'sk-SK',
    HU: 'hu-HU',
    RO: 'ro-RO',
    HR: 'hr-HR',
    SI: 'sl-SI',
    SA: 'ar-SA',
    IE: 'en-IE',
    SE: 'sv-SE',
    GB: 'en-GB',
  } as Record<string, string>,
} as const;

export const SUPPORTED_LOCALES = LOCALE_CONFIG.supported;
export const COUNTRY_TO_LOCALE = LOCALE_CONFIG.countryToLocale;

/**
 * Returns the canonical (BCP 47) casing for a locale (e.g. de-de -> de-DE, pl-pl -> pl-PL).
 * Use when building URLs to ensure proper casing.
 */
export function getCanonicalLocale(locale: string | undefined | null): string {
  if (!locale) return 'en';
  const normalized = locale.toLowerCase().replace(/_/g, '-').trim();
  const found = SUPPORTED_LOCALES.find((l) => l.toLowerCase().replace(/_/g, '-') === normalized);
  return found ?? normalized;
}

/**
 * Type guard to check if a string is a valid supported locale.
 * @param locale - The locale string to validate
 * @returns True if the locale is in the supported locales array
 */
export function isValidLocale(locale: string): locale is (typeof SUPPORTED_LOCALES)[number] {
  return SUPPORTED_LOCALES.includes(locale as (typeof SUPPORTED_LOCALES)[number]);
}

// Validation helper
export function validateLocaleConfig(defaultLocale: string) {
  if (!isValidLocale(defaultLocale)) {
    throw new Error(`Default locale '${defaultLocale}' not found in supported locales`);
  }
}

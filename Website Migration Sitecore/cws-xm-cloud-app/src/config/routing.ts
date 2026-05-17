/**
 * Routing configuration for the application.
 * Centralized configuration for paths and routing behavior.
 */

/**
 * Paths that should be excluded from locale prefix enforcement.
 * These paths will not be redirected to include a locale prefix.
 */
export const EXCLUDED_PATHS = [
  '/api',
  '/_next',
  '/sitecore',
  '/-',
  '/healthz',
  '/favicon.ico',
  '/sc_logo.svg',
] as const;


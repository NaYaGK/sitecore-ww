import { type NextRequest, type NextFetchEvent, NextResponse } from 'next/server';
import {
  defineMiddleware,
  MultisiteMiddleware,
  PersonalizeMiddleware,
  RedirectsMiddleware,
} from '@sitecore-content-sdk/nextjs/middleware';
import sites from '.sitecore/sites.json';
import scConfig from 'sitecore.config';
import { SUPPORTED_LOCALES } from '@/config/locales';
import { resolveSiteFromEdge } from '@/lib/sitecore/site-resolver';
import { getLocaleFromGeo } from '@/lib/geo-locale';

const localeSet = new Set(SUPPORTED_LOCALES.map((locale) => locale.toLowerCase()));
/** Map lowercase locale -> canonical (e.g. de-de -> de-DE). Sitecore expects canonical BCP 47. */
const localeToCanonical = new Map(
  SUPPORTED_LOCALES.map((l) => [l.toLowerCase().replace(/_/g, '-'), l])
);
const siteNameSet = new Set(
  sites
    .map((site) => site?.name)
    .filter(Boolean)
    .map((name) => name.toLowerCase()),
);
const DEFAULT_SITE_NAME = (
  process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME ||
  process.env.SITECORE_SITE_NAME ||
  'cws'
).toLowerCase();
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const DEV_SCRIPT_SRC = IS_DEVELOPMENT ? ['http://pi.pardot.com'] : [];
const DEV_CONNECT_SRC = IS_DEVELOPMENT ? ['http://pi.pardot.com'] : [];
const SCRIPT_SRC = [
  "'self'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  'https://*.consentmanager.net',
  'https://www.googletagmanager.com',
  'https://connect.facebook.net',
  'https://bat.bing.com',
  'https://secure.quantserve.com',
  'https://rules.quantcount.com',
  'https://pi.pardot.com',
  'https://d35vb5cccm4xzp.cloudfront.net',
  'https://www.google.com',
  'https://www.gstatic.com',
  'https://cdnjs.cloudflare.com',
  'https://cdn.jsdelivr.net',
  'https://googleads.g.doubleclick.net',
  'https://script.infinity-tracking.com',
  ...DEV_SCRIPT_SRC,
].join(' ');
const CONNECT_SRC = [
  "'self'",
  'https://*.contenthub.cws.com',
  'https://*.sitecorecloud.io',
  'https://*.consentmanager.net',
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://*.google-analytics.com',
  'https://www.google.com',
  'https://www.gstatic.com',
  'https://www.googleadservices.com',
  'https://pagead2.googlesyndication.com',
  'https://googleads.g.doubleclick.net',
  'https://*.doubleclick.net',
  'https://connect.facebook.net',
  'https://bat.bing.com',
  'https://bat.bing.net',
  'https://secure.quantserve.com',
  'https://pixel.quantserve.com',
  'https://pi.pardot.com',
  'https://demo-1.conversionsapigateway.com',
  'https://mpc-prod-17-s6uit34pua-wl.a.run.app',
  'https://action.cws.com',
  'https://cdn.jsdelivr.net',
  'https://cdnjs.cloudflare.com',
  'https://*.infinity-tracking.com',
  'https://*.infinity-tracking.net',
  ...DEV_CONNECT_SRC,
].join(' ');
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src ${SCRIPT_SRC}`,
  `script-src-elem ${SCRIPT_SRC}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://edge-platform.sitecorecloud.io https://cdn.jsdelivr.net",
  "img-src 'self' data: https: https://*.contenthub.cws.com https://*.sitecorecloud.io https://*.consentmanager.net https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com https://www.google.com https://www.googleadservices.com https://action.cws.com",
  "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",
  `connect-src ${CONNECT_SRC}`,
  "frame-src 'self' https://app.powerbi.com https://*.consentmanager.net https://www.googletagmanager.com https://www.google.com https://www.gstatic.com https://action.cws.com",
  "frame-ancestors 'self'",
].join('; ');

/**
 * Locale-specific path segments that map to workwear/healthcare sites.
 * Must match microfrontends.json routing paths (segment after locale).
 */
const WORKWEAR_PATH_SEGMENTS = new Set(
  [
    'workwear',
    'arbeitskleidung',
    'vetements-de-travail',
    'ropa-de-trabajo',
    'abbigliamento-da-lavoro',
    'werkkledij',
    'odziez-robocza-i-ochronna',
    'pracovni-odevy',
    'pracovne-odevy',
    'munka-es-vedoruha',
    'imbracaminte-de-lucru',
    'rabotno-obleklo',
    'radna-odjeca',
    'delovna-oblacila',
    'arbetsklader',
  ].map((s) => s.toLowerCase()),
);
const HEALTHCARE_PATH_SEGMENTS = new Set(
  [
    'healthcare',
  ].map((s) => s.toLowerCase()),
);

function resolveSiteNameFromPathname(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return DEFAULT_SITE_NAME;

  const firstSegment = segments[0]?.toLowerCase();
  const hasLocale = firstSegment ? localeSet.has(firstSegment) : false;
  const siteSegment = hasLocale ? segments[1] : segments[0];
  const normalizedSiteSegment = siteSegment?.toLowerCase();

  // Check explicit site name first (workwear, healthcare, etc.)
  if (normalizedSiteSegment && siteNameSet.has(normalizedSiteSegment)) {
    return normalizedSiteSegment;
  }

  // Check locale-specific path segments (arbeitskleidung, vetements-de-travail, etc.)
  if (normalizedSiteSegment) {
    if (WORKWEAR_PATH_SEGMENTS.has(normalizedSiteSegment)) return 'workwear';
    if (HEALTHCARE_PATH_SEGMENTS.has(normalizedSiteSegment)) return 'healthcare';
  }

  return DEFAULT_SITE_NAME;
}

/**
 * Returns true if the given path segment identifies the given site (workwear or healthcare).
 */
function isSitePathSegment(segment: string | undefined, siteName: string): boolean {
  const normalized = segment?.toLowerCase();
  if (!normalized) return false;
  if (siteName === 'workwear') return WORKWEAR_PATH_SEGMENTS.has(normalized);
  if (siteName === 'healthcare') return HEALTHCARE_PATH_SEGMENTS.has(normalized);
  return false;
}

function applySecurityHeaders(response: NextResponse, siteName: string): NextResponse {
  response.headers.set('x-sitecore-site', siteName);
  response.headers.set('x-site', siteName);
  response.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const pathname = req.nextUrl.pathname;
  const isSitemapRequest =
    pathname === '/sitemap.xml' ||
    /\/sitemap-[^/]+\.xml$/i.test(pathname);
  const isRobotsRequest = pathname === '/robots.txt';

  const isFaviconRequest =
    pathname === '/favicon.ico' ||
    pathname === '/favicon.svg' ||
    pathname === '/favicon.png' ||
    pathname === '/apple-touch-icon.png' ||
    pathname === '/healthcare-favicon.ico' ||
    pathname === '/healthcare-favicon.svg' ||
    pathname === '/healthcare-favicon.png' ||
    pathname === '/healthcare-apple-touch-icon.png';

  if (isSitemapRequest || isRobotsRequest || isFaviconRequest) {
    return NextResponse.next();
  }

  // Proxy Drupal asset paths directly — middleware rewrite is more reliable than
  // beforeFiles rewrites, which can be bypassed by the ISR cache / catch-all route.
  if (
    pathname.startsWith('/sites/') ||
    pathname.startsWith('/themes/') ||
    pathname.startsWith('/modules/') ||
    pathname.startsWith('/core/') ||
    pathname.startsWith('/libraries/') ||
    pathname.startsWith('/firesafety/')
  ) {
    return NextResponse.rewrite(
      new URL(`https://www.cws.com${req.nextUrl.pathname}${req.nextUrl.search || ''}`)
    );
  }

  // Proxy Drupal page paths directly — middleware rewrite avoids trailing-slash issues
  // that cause Drupal's route normalizer to 301-redirect to www.cws.com.
  const DRUPAL_PAGE_SEGMENTS = new Set([
    'fire-safety', 'brandschutz', 'brandbeveiliging',                       // Fire Safety
    'cleanroom', 'reinraum', 'salle-blanche',                               // Cleanroom
    'hygiene', 'higijena', 'hygiena', 'higienia', 'higiena', 'hygien', 'igiene', // Hygiene
  ]);
  const pathSegments = pathname.split('/').filter(Boolean);
  // Check second segment (after locale) or first segment (no locale)
  const segmentToCheck = pathSegments[0] && localeSet.has(pathSegments[0].toLowerCase())
    ? pathSegments[1]
    : pathSegments[0];
  if (segmentToCheck && DRUPAL_PAGE_SEGMENTS.has(segmentToCheck.toLowerCase())) {
    // req.nextUrl.pathname strips the locale prefix (i18n), so reconstruct the full path
    const locale = req.nextUrl.locale;
    const drupalPath = locale && locale !== 'default'
      ? `/${locale}${req.nextUrl.pathname}`
      : req.nextUrl.pathname;
    return NextResponse.rewrite(
      new URL(`https://www.cws.com${drupalPath}${req.nextUrl.search || ''}`)
    );
  }

  // Redirect unprefixed URLs to locale-specific path. Use geo (IP country) to determine
  // locale when available (Vercel: req.geo; Cloudflare: cf-ipcountry; etc.); fall back to 'en'.
  if (req.nextUrl.locale === 'default') {
    const url = req.nextUrl.clone();
    const locale = getLocaleFromGeo(req.headers, (req as { geo?: { country?: string } }).geo);
    url.locale = locale;
    return NextResponse.redirect(url);
  }

  let siteName = resolveSiteNameFromPathname(req.nextUrl.pathname);

  const parts = pathname.split('/').filter(Boolean);

  // Redirect /locale/workwear/<segment> -> /locale/<segment> when segment in WORKWEAR_PATH_SEGMENTS
  if (parts[0] && localeSet.has(parts[0].toLowerCase()) && parts[1]?.toLowerCase() === 'workwear' && parts[2]) {
    const segment = parts[2].toLowerCase();
    if (WORKWEAR_PATH_SEGMENTS.has(segment)) {
      const url = req.nextUrl.clone();
      url.pathname = `/${parts[0]}/${parts.slice(2).join('/')}`;
      return NextResponse.redirect(url);
    }
  }

  // Dynamic Site Resolution Fallback
  // If the synchronous check returned default (cws), try the async check for workwear/healthcare
  if (siteName === DEFAULT_SITE_NAME) {
    // Extract locale from path to pass to resolver, or use geo-based locale
    const parts = req.nextUrl.pathname.split('/').filter(Boolean);
    const firstPart = parts[0]?.toLowerCase(); // e.g. 'en' or 'core-solutions'

    let locale = getLocaleFromGeo(req.headers, (req as { geo?: { country?: string } }).geo);
    let urlHasLocale = false;

    if (firstPart && localeSet.has(firstPart)) {
      locale = firstPart;
      urlHasLocale = true;
    }

    const dynamicSite = await resolveSiteFromEdge(req.nextUrl.pathname, locale);
    if (dynamicSite) {
      console.log(`[Middleware] Resolved dynamic site: ${dynamicSite} for path: ${req.nextUrl.pathname}. Redirecting...`);

      // Construct redirect URL: /<locale>/<siteName>/<restOfPath>
      // We need to inject the siteName after the locale (if present) or at the start
      // Current path: /en/core-solutions -> /en/workwear/core-solutions
      // Current path: /core-solutions -> /en/workwear/core-solutions (forcing default locale)

      const url = req.nextUrl.clone();

      // Strip existing locale from path to get clean relative path
      let pathRest = pathname;
      if (urlHasLocale) {
        // remove /en
        pathRest = '/' + parts.slice(1).join('/');
      }

      // Ensure pathRest starts with /
      if (!pathRest.startsWith('/')) pathRest = '/' + pathRest;

      url.pathname = `/${locale}/${dynamicSite}${pathRest}`;

      return NextResponse.redirect(url);
    }
  }

  // If no Edge server contextId, skip Edge middlewares entirely.
  // (SSR/API can still use Local creds; no crash in Edge runtime.)
  if (!scConfig.api?.edge?.contextId) {
    return applySecurityHeaders(NextResponse.next(), siteName);
  }

  // Instantiate AFTER the guard so constructors don’t run in local-only mode
  const multisite = new MultisiteMiddleware({
    /**
     * List of sites for site resolver to work with
     */
    sites,
    ...scConfig.api.edge,
    ...scConfig.multisite,
    // Skip default multisite middleware for our path-based sites to handle rewrite manually
    skip: () => siteName === 'workwear' || siteName === 'healthcare',
  });

  const redirects = new RedirectsMiddleware({
    /**
     * List of sites for site resolver to work with
     */
    sites,
    ...scConfig.api.edge,
    ...scConfig.redirects,
    // This function determines if the middleware should be turned off on per-request basis.
    // Certain paths are ignored by default (e.g. Next.js API routes), but you may wish to disable more.
    // By default it is disabled while in development mode.
    // This is an important performance consideration since Next.js Edge middleware runs on every request.
    skip: () => false,
  });

  const personalize = new PersonalizeMiddleware({
    /**
     * List of sites for site resolver to work with
     */
    sites,
    ...scConfig.api.edge,
    ...scConfig.personalize,
    // This function determines if the middleware should be turned off on per-request basis.
    // Certain paths are ignored by default (e.g. Next.js API routes), but you may wish to disable more.
    // By default it is disabled while in development mode.
    // This is an important performance consideration since Next.js Edge middleware runs on every request.
    skip: () => false,
  });

  let response = await defineMiddleware(multisite, redirects, personalize).exec(req, ev);

  // Set locale header for workwear/healthcare sites.
  // NOTE: The external rewrite to stage-sc-workwear.cws.com was removed because this app IS
  // the workwear child microfrontend. The rewrite created a self-referencing loop on Vercel
  // (the child app was rewriting to its own domain). Vercel's microfrontends infrastructure
  // handles host→child routing; the child app just serves pages directly.
  if ((siteName === 'workwear' || siteName === 'healthcare') && response.status === 200) {
    const parts = pathname.split('/').filter(Boolean);
    const firstPart = parts[0]?.toLowerCase();
    const hasLocale = firstPart && localeSet.has(firstPart);
    const locale = hasLocale ? (parts[0] as string) : (scConfig.defaultLanguage || 'en');

    response.headers.set('x-cws-locale', locale);
  }


  // SECURITY: Add Content Security Policy headers to prevent XSS attacks
  // CSP is applied at the middleware level to cover all routes
  if (response instanceof NextResponse) {
    applySecurityHeaders(response, siteName);
  }

  return response;
}

export const config = {
  /*
   * Match all paths except for:
   * 1. /api routes
   * 2. /_next (Next.js internals)
   * 3. /sitecore/api (Sitecore API routes)
   * 4. /- (Sitecore media)
   * 5. /healthz (Health check)
   * 7. all root files inside /public
   */
  matcher: [
    '/',
    '/((?!api/|_next/|jobs/|products/|healthz|sitecore/api/|-/|favicon.ico|favicon.svg|favicon.png|apple-touch-icon\\.png|healthcare-favicon.ico|healthcare-favicon.svg|healthcare-favicon.png|healthcare-apple-touch-icon\\.png|sc_logo.svg|assets/|sitemap.xml|sitemap-[^/]+\\.xml|robots.txt).*)',
  ],
};

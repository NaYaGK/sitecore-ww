import type { NextConfig } from 'next';
import { withMicrofrontends } from '@vercel/microfrontends/next/config';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from './src/config/locales';
import { imagesConfig } from './src/config/images';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  eslint: { ignoreDuringBuilds: true },
  // Increase timeout for static page generation - Sitecore/Content Hub fetches can exceed 60s default
  staticPageGenerationTimeout: 180,
  serverActions: {
    bodySizeLimit: '10mb',
  },
  i18n: {
    // 'default' is a synthetic locale that prevents Next.js from stripping /en/ from URLs.
    // Middleware redirects 'default' → 'en'; [[...path]].tsx already handles it in
    // getStaticPaths (filtered out) and getStaticProps (mapped to 'en').
    locales: ['default', ...SUPPORTED_LOCALES] as string[],
    defaultLocale: 'default',
    localeDetection: false, // Disable automatic locale detection to rely on Sitecore routing
  },
  images: imagesConfig,
  // CORS: API routes allow all origins (incl. Infinity webhooks/callbacks)
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // Drupal Assets (Fire Safety) - Moved to beforeFiles to ensure precedence over dynamic routes
        {
          source: '/sites/:path*',
          destination: 'https://www.cws.com/sites/:path*',
          locale: false,
        },
        {
          source: '/themes/:path*',
          destination: 'https://www.cws.com/themes/:path*',
          locale: false,
        },
        {
          source: '/modules/:path*',
          destination: 'https://www.cws.com/modules/:path*',
          locale: false,
        },
        {
          source: '/core/:path*',
          destination: 'https://www.cws.com/core/:path*',
          locale: false,
        },
        {
          source: '/libraries/:path*',
          destination: 'https://www.cws.com/libraries/:path*',
          locale: false,
        },
      ],
      afterFiles: [
        { source: '/sitemap.xml', destination: '/api/sitemap' },
        { source: '/sitemap-:id.xml', destination: '/api/sitemap' },
        { source: '/robots.txt', destination: '/api/robots' },
        // Hygiene rewrite — localized segments: hygiene (en/de/nl/fr/ro), higijena (hr),
        // hygiena (cs/sk), higienia (hu), higiena (pl/sl), hygien (sv), igiene (it)
        {
          source: '/:locale/:seg(hygiene|higijena|hygiena|higienia|higiena|hygien|igiene)/:path*',
          destination: 'https://www.cws.com/:locale/:seg/:path*',
          locale: false,
        },
        {
          source: '/:locale/:seg(hygiene|higijena|hygiena|higienia|higiena|hygien|igiene)',
          destination: 'https://www.cws.com/:locale/:seg',
          locale: false,
        },
        {
          source: '/hygiene/:path*',
          destination: 'https://www.cws.com/en/hygiene/:path*',
          locale: false,
        },
        {
          source: '/hygiene',
          destination: 'https://www.cws.com/en/hygiene',
          locale: false,
        },
        // Fire Safety rewrite (Drupal) — localized segments: fire-safety (en), brandschutz (de), brandbeveiliging (nl)
        {
          source: '/:locale/:seg(fire-safety|brandschutz|brandbeveiliging)/:path*',
          destination: 'https://www.cws.com/:locale/:seg/:path*',
          locale: false,
        },
        {
          source: '/:locale/:seg(fire-safety|brandschutz|brandbeveiliging)',
          destination: 'https://www.cws.com/:locale/:seg',
          locale: false,
        },
        {
          source: '/fire-safety/:path*',
          destination: 'https://www.cws.com/en/fire-safety/:path*',
          locale: false,
        },
        {
          source: '/fire-safety',
          destination: 'https://www.cws.com/en/fire-safety',
          locale: false,
        },
        // Cleanroom rewrite (Drupal) — localized segments: cleanroom (en/nl), reinraum (de), salle-blanche (fr)
        {
          source: '/:locale/:seg(cleanroom|reinraum|salle-blanche)/:path*',
          destination: 'https://www.cws.com/:locale/:seg/:path*',
          locale: false,
        },
        {
          source: '/:locale/:seg(cleanroom|reinraum|salle-blanche)',
          destination: 'https://www.cws.com/:locale/:seg',
          locale: false,
        },
        {
          source: '/cleanroom/:path*',
          destination: 'https://www.cws.com/en/cleanroom/:path*',
          locale: false,
        },
        {
          source: '/cleanroom',
          destination: 'https://www.cws.com/en/cleanroom',
          locale: false,
        },

        // Hygiene Next.js Assets Fallback
        {
          source: '/_next/:path*',
          destination: 'https://cws-hy.vercel.app/_next/:path*',
          locale: false,
        },
      ],
    };
  },
};

// withMicrofrontends adds assetPrefix and multi-zone routing only needed on Vercel.
// Locally it breaks page routing; on DEV we run without microfrontends (Stage only).
// Set ENABLE_MICROFRONTENDS=true in Vercel project env vars for Stage/Production.
const useMicrofrontends = process.env.ENABLE_MICROFRONTENDS === 'true';
export default useMicrofrontends ? withMicrofrontends(nextConfig) : nextConfig;

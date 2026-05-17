import type { NextConfig } from 'next';

export const imagesConfig: NextConfig['images'] = {
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: 'images.pexels.com' },
    { protocol: 'https', hostname: 'i.ytimg.com' },
    { protocol: 'https', hostname: 'xmc-cwsinternat0b48-cwsdeve2de-cwsdev909e.sitecorecloud.io' },
    { protocol: 'https', hostname: 'xmc-cwsinternatcacc-cws0400-stagingc957.sitecorecloud.io' },
    // Content Hub image domains
    { protocol: 'https', hostname: 'delivery-qa.contenthub.cws.com' },
    { protocol: 'https', hostname: 'delivery.contenthub.cws.com' },
    { protocol: 'https', hostname: 'qa.contenthub.cws.com' },
    { protocol: 'https', hostname: 'contenthub.cws.com' },
  ],
};

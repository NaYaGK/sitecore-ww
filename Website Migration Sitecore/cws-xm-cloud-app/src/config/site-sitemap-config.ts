export type SiteSitemapConfig = {
  includeProductUrlInSitemap: boolean;
};

export const SITE_SITEMAP_CONFIG: Record<string, SiteSitemapConfig> = {
  cws: {
    includeProductUrlInSitemap: false,
  },
  workwear: {
    includeProductUrlInSitemap: true,
  },
  healthcare: {
    includeProductUrlInSitemap: false,
  },
  hygiene: {
    includeProductUrlInSitemap: false,
  },
};

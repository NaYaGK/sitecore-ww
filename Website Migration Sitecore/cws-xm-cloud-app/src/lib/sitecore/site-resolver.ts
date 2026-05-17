import { fetchFromEdge } from './client';

/**
 * Queries Sitecore Edge to see if a path exists within the workwear or healthcare sites.
 * Returns the site name if found, otherwise null.
 */
export async function resolveSiteFromEdge(pathname: string, locale: string): Promise<string | null> {
    // Clean the path: remove locale prefix if present to get the relative path for the site
    // e.g. /en/foo -> /foo
    // But wait, the 'routePath' in Sitecore layout query often expects the full path including logic or just the item path?
    // Usually in XM Cloud / Sitecore, the routePath is relative to the site root.
    // The 'layout' query takes 'routePath'.
    // If we are looking for 'workwear' site, and the URL is /en/foo, the item path in workwear site is likely /foo.

    // Let's rely on the middleware's logic to strip locale before verifying,
    // OR we can just try to query with the path we have.
    // Actually, standard Layout Service / GraphQL 'layout' query expects the path *relative to the site*.

    // We need to strip the locale from the pathname to get the site-relative path.
    const pathSegments = pathname.split('/').filter(Boolean);

    // Assuming the first segment is locale if it matches a known locale code, but we passed 'locale' arg.
    // If pathname is /en/foo and locale is en, we want /foo.

    let relativePath = pathname;
    if (pathSegments[0] && pathSegments[0].toLowerCase() === locale.toLowerCase()) {
        relativePath = '/' + pathSegments.slice(1).join('/');
    }

    // If root, ignore (handled by default)
    if (relativePath === '/' || relativePath === '') {
        return null;
    }

    // GraphQL query to check both sites
    const query = `
    query ResolveSite($path: String!, $language: String!) {
      workwear: layout(site: "workwear", routePath: $path, language: $language) {
        item {
          id
        }
      }
      healthcare: layout(site: "healthcare", routePath: $path, language: $language) {
        item {
          id
        }
      }
    }
  `;

    try {
        const data = await fetchFromEdge<{
            workwear: { item: { id: string } | null };
            healthcare: { item: { id: string } | null };
        }>(query, {
            path: relativePath,
            language: locale,
        });

        if (data.workwear?.item) return 'workwear';
        if (data.healthcare?.item) return 'healthcare';

        return null;
    } catch (error) {
        console.error('Error resolving site from Edge:', error);
        return null;
    }
}

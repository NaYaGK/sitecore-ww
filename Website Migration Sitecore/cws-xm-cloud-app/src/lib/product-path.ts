/**
 * Path-based product ID extraction (no slug dependency).
 * Product paths come from Sitecore wildcard; the last segment is the product identifier.
 *
 * Pattern: /workwear/produkte/cws-devon-line-trousers or /workwear/cws-devon-line-trousers-0
 * Product ID = last segment without variant suffix (-0, -1, etc.)
 */

/**
 * Extract product ID from URL path.
 * Uses last path segment (minus optional variant suffix like -0, -1).
 *
 * @param pathname - URL pathname (e.g. /en/workwear/produkte/cws-devon-line-trousers-0)
 * @returns Product ID (e.g. cws-devon-line-trousers) or null
 */
export function extractProductIdFromPath(pathname: string): string | null {
  if (!pathname || typeof pathname !== 'string') return null;
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  if (!lastSegment) return null;
  const productId = lastSegment.replace(/-\d+$/, '').trim();
  return productId.length >= 1 ? productId : null;
}

/**
 * Check if a path looks like a product detail path (has a product-like last segment).
 * Used when we need a heuristic before getPage; prefer checking page route after getPage.
 */
export function pathHasProductLikeLastSegment(pathname: string): boolean {
  const id = extractProductIdFromPath(pathname);
  if (!id) return false;
  // Product IDs are typically alphanumeric with hyphens (e.g. cws-devon-line-trousers)
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(id) && id.length >= 3;
}

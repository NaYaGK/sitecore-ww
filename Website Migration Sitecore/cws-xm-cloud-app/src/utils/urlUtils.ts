/**
 * Utility functions for URL and path detection
 */

/**
 * Checks if the current path is a search page
 * @param asPath - The current URL path from Next.js router
 * @returns boolean - True if the path contains a search segment
 */
export const isSearchPage = (asPath?: string): boolean => {
  if (!asPath) return false;
  
  // Remove query parameters and hash
  const cleanPath = asPath.split('?')[0]?.split('#')[0] || '';
  
  // Split by slash and filter out empty strings
  const pathSegments = cleanPath.split('/').filter(segment => segment.length > 0);
  
  // Check if any segment is exactly 'search'
  return pathSegments.some(segment => segment.toLowerCase() === 'search');
};



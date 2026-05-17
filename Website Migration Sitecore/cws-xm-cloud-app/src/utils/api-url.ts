/**
 * Utility to get the base URL for API requests.
 * In editing mode, components are rendered in the Sitecore editor domain,
 * so we need to use absolute URLs pointing to the rendering host.
 */

/**
 * Get the rendering host base URL for API requests.
 * Uses NEXT_PUBLIC_RENDERING_HOST_URL if set, otherwise falls back to window.location.origin
 * when running in the browser, or an empty string for server-side rendering.
 */
export function getApiBaseUrl(): string {
  // Check for explicit rendering host URL (should be set in environment)
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_RENDERING_HOST_URL) {
    return process.env.NEXT_PUBLIC_RENDERING_HOST_URL;
  }

  // In browser, use current origin (will be Sitecore domain in editor, but we'll handle that)
  if (typeof window !== 'undefined') {
    // Check if we're in editing mode by looking for Sitecore editor indicators
    const isEditingMode = 
      window.location.hostname.includes('sitecorecloud.io') ||
      document.querySelector('[data-sc-editor]') !== null ||
      document.querySelector('[data-e2e-component]') !== null;

    if (isEditingMode) {
      // In editing mode, we need the rendering host URL
      // Try to get it from a meta tag or fall back to environment variable
      const renderingHostMeta = document.querySelector('meta[name="rendering-host-url"]');
      if (renderingHostMeta) {
        return renderingHostMeta.getAttribute('content') || '';
      }
      
      // Fall back to environment variable (should be set at build time)
      // This won't work in browser, so we need to inject it
      return '';
    }

    // Normal mode - use current origin
    return window.location.origin;
  }

  // Server-side: return empty string for relative URLs
  // The server will resolve these correctly
  return '';
}

/**
 * Get the full API URL for a given endpoint.
 * @param endpoint - The API endpoint path (e.g., '/api/sitecore-datasource')
 * @returns The full URL for the API endpoint
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    // If no base URL, return relative URL (will work on server-side)
    return endpoint;
  }
  
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Remove trailing slash from baseUrl if present
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${normalizedBase}${normalizedEndpoint}`;
}


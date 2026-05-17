/**
 * HTML Sanitization utilities using DOMPurify
 * Prevents XSS attacks when rendering user-provided HTML content
 */
import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML string to prevent XSS attacks
 * @param html - Raw HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export const sanitizeHtml = (html: string): string => {
  if (typeof window === 'undefined') {
    // Server-side: return empty or use a server-compatible sanitizer
    // DOMPurify requires DOM, so we strip tags on server
    return stripHtmlTags(html);
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'b',
      'i',
      'em',
      'strong',
      'a',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'span',
      'div',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'img',
      'figure',
      'figcaption',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'id', 'title'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Strips all HTML tags from a string safely using DOM parsing
 * @param html - HTML string to strip tags from
 * @returns Plain text without HTML tags
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return '';

  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    // Client-side: use DOMParser for safe parsing
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }

  // Server-side fallback: use a more robust regex pattern
  // This handles nested tags and common HTML entities
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Convert non-breaking spaces
    .replace(/&amp;/g, '&') // Convert ampersands
    .replace(/&lt;/g, '<') // Convert less than
    .replace(/&gt;/g, '>') // Convert greater than
    .replace(/&quot;/g, '"') // Convert quotes
    .replace(/&#39;/g, "'") // Convert apostrophes
    .trim();
};

/**
 * Creates a safe object for dangerouslySetInnerHTML
 * @param html - HTML string to sanitize and wrap
 * @returns Object safe for use with dangerouslySetInnerHTML
 */
export const createSafeHtml = (html: string): { __html: string } => {
  return { __html: sanitizeHtml(html) };
};

const sanitizeUtils = {
  sanitizeHtml,
  stripHtmlTags,
  createSafeHtml,
};

export default sanitizeUtils;

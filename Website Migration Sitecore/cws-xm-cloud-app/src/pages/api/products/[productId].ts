import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchProductById, ProductData } from '@/lib/content-hub-client';

/**
 * API route for fetching product data from Content Hub
 * This keeps Content Hub credentials server-side only
 * 
 * Usage: GET /api/products/[productId]
 * Example: GET /api/products/735916
 * 
 * Security: Input validation, error handling, and rate limiting considerations
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProductData | { message: string; error?: string }>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const productId = req.query.productId as string;
  const locale = typeof req.query.locale === 'string' ? req.query.locale : undefined;
  
  // Input validation and sanitization
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  // Validate productId format (alphanumeric, hyphens, underscores, max 200 chars)
  const productIdPattern = /^[a-zA-Z0-9_-]{1,200}$/;
  if (!productIdPattern.test(productId)) {
    return res.status(400).json({ 
      message: 'Invalid product ID format',
      error: 'Product ID must be alphanumeric with hyphens or underscores, max 200 characters'
    });
  }

  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Content Security Policy to prevent XSS attacks
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';"
  );

  try {
    // Fetch product with timeout consideration (handled by fetch timeout if configured)
    const product = await fetchProductById(productId, locale);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate product data structure before sending
    if (!product.id || !product.title) {
      console.error(`[API /products/${productId}] Invalid product data structure`);
      return res.status(500).json({ 
        message: 'Invalid product data received from Content Hub' 
      });
    }

    return res.status(200).json(product);
  } catch (error: any) {
    // Log error without exposing sensitive information
    console.error(`[API /products/${productId}] Error:`, {
      message: error?.message,
      name: error?.name,
      // Don't log full stack trace or sensitive data
    });

    // Return generic error message to client (don't expose internal details)
    return res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined
    });
  }
}


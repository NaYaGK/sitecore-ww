'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { ComponentRendering, ComponentParams } from '@sitecore-content-sdk/nextjs';
import { Plus, Minus } from 'lucide-react';
import styles from './ProductDetail.module.scss';
import { ProductData } from '../../lib/content-hub-client';
import { createSafeHtml, stripHtmlTags } from '@/lib/sanitize';
import { openContactFormModal } from '@/ui/Modal/contact_form_modal';
import { extractProductIdFromPath } from '@/lib/product-path';

/**
 * SECURITY NOTE: This component renders HTML content from Content Hub using dangerouslySetInnerHTML.
 *
 * CRITICAL: ALL HTML content MUST be sanitized using createSafeHtml() before rendering.
 * All 4 instances of dangerouslySetInnerHTML in this component use createSafeHtml():
 * - product.highlights (line ~404)
 * - displayDescription (line ~416)
 * - product.sustainability (line ~449)
 * - h2Text (line ~472)
 *
 * Sanitization is performed using DOMPurify via createSafeHtml() to prevent XSS attacks.
 * Additionally, Content Security Policy (CSP) headers are set at the middleware level to provide
 * defense-in-depth protection against malicious content injection.
 *
 * The component is registered as client-side (componentType: 'client') in component-map.ts,
 * which is appropriate for interactive features but means validation should occur server-side
 * before data reaches this component. The API route (/api/products/[productId]) performs
 * server-side validation and sanitization.
 */

interface ProductDetailProps {
  rendering?: ComponentRendering;
  params?: ComponentParams;
  productId?: string;
  className?: string;
  initialProductData?: ProductData | null;
  contactFormId?: string;
}

/**
 * Validates product ID format to prevent injection attacks
 * @param productId - Product ID to validate
 * @returns true if valid, false otherwise
 */
function isValidProductId(productId: string | null | undefined): boolean {
  if (!productId || typeof productId !== 'string') {
    return false;
  }

  // Product ID must be:
  // - Alphanumeric with hyphens and underscores only
  // - Between 1 and 200 characters
  // - Not contain any special characters that could be used for injection
  // Note: Pattern matches API route validation in /api/products/[productId].ts
  const productIdPattern = /^[a-zA-Z0-9_-]{1,200}$/;

  // Additional security: reject IDs that look like path traversal or injection attempts
  const dangerousPatterns = [
    /\.\./, // Path traversal
    /[<>"']/, // HTML/script injection
    /[;&|`$]/, // Command injection
    /%[0-9a-fA-F]{2}/, // URL encoding (should be decoded first if needed)
    /^\s|\s$/, // Leading/trailing whitespace
  ];

  if (!productIdPattern.test(productId)) {
    return false;
  }

  // Check for dangerous patterns
  for (const pattern of dangerousPatterns) {
    if (pattern.test(productId)) {
      return false;
    }
  }

  return true;
}

/**
 * Sanitizes product ID by removing dangerous characters
 * @param productId - Raw product ID to sanitize
 * @returns Sanitized product ID or null if invalid
 */
function sanitizeProductId(productId: string): string | null {
  if (!productId || typeof productId !== 'string') {
    return null;
  }

  // Trim whitespace
  const trimmed = productId.trim();

  // Remove any characters that aren't alphanumeric, hyphens, or underscores
  // Note: Pattern matches API route validation in /api/products/[productId].ts
  const sanitized = trimmed.replace(/[^a-zA-Z0-9_-]/g, '');

  // Validate the sanitized result
  if (!isValidProductId(sanitized)) {
    return null;
  }

  return sanitized;
}

/**
 * Extract and validate product ID from URL path
 * Uses path-based extraction (last segment minus variant suffix)
 */
function extractAndValidateProductId(pathname: string): string | null {
  const rawId = extractProductIdFromPath(pathname);
  return rawId ? sanitizeProductId(rawId) : null;
}

export const Default = ({
  rendering,
  params,
  productId: propProductId,
  className,
  initialProductData,
  contactFormId: propContactFormId,
}: ProductDetailProps) => {
  const router = useRouter();
  const [product, setProduct] = useState<ProductData | null>(initialProductData || null);
  const [loading, setLoading] = useState(!initialProductData);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);
  const [resolvedProductId, setResolvedProductId] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isSustainabilityOpen, setIsSustainabilityOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Client-side logging
  useEffect(() => {
    console.log('[ProductDetail Client] Component mounted with props:', {
      propProductId,
      paramsProductId: params?.productId,
      hasInitialData: !!initialProductData,
      routerPath: router.pathname,
      routerAsPath: router.asPath,
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'N/A',
    });
  }, []);

  // Resolve productId: priority order:
  // 1. Direct prop
  // 2. Sitecore params (from synthetic page)
  // 3. Extract from URL
  useEffect(() => {
    let resolvedId: string | null = null;

    // Priority 1: Direct prop (validate and sanitize)
    if (propProductId) {
      resolvedId = sanitizeProductId(propProductId);
      if (resolvedId) {
        setResolvedProductId(resolvedId);
        return;
      }
      // If invalid, log warning and continue to next priority
      console.warn('[ProductDetail] Invalid productId from prop, trying other sources');
    }

    // Priority 2: Sitecore params (validate and sanitize)
    const paramsProductId = params?.productId as string | undefined;
    if (paramsProductId) {
      resolvedId = sanitizeProductId(paramsProductId);
      if (resolvedId) {
        setResolvedProductId(resolvedId);
        return;
      }
      // If invalid, log warning and continue to next priority
      console.warn('[ProductDetail] Invalid productId from params, trying URL extraction');
    }

    // Priority 3: Extract from URL (path-based, last segment minus variant suffix)
    if (router.isReady && router.pathname) {
      resolvedId = extractAndValidateProductId(router.asPath || router.pathname);
      if (resolvedId) {
        setResolvedProductId(resolvedId);
        return;
      }
    } else if (typeof window !== 'undefined') {
      // Fallback to window.location if router is not ready
      resolvedId = extractProductIdFromPath(window.location.pathname);
      if (resolvedId) {
        setResolvedProductId(resolvedId);
        return;
      }
    }

    // If no valid product ID found from any source, set to null
    if (!resolvedId) {
      setResolvedProductId(null);
    }
  }, [propProductId, params?.productId, router.isReady, router.pathname, router.asPath]);

  // Load product data with proper cleanup to prevent race conditions
  useEffect(() => {
    // Skip if we already have data from SSG
    if (initialProductData) {
      return;
    }

    if (!resolvedProductId) {
      setLoading(false);
      return;
    }

    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    async function loadProduct() {
      setLoading(true);
      setError(null);

      try {
        const productId = resolvedProductId;

        // Final validation before API call
        if (!productId || !isValidProductId(productId)) {
          setError('Invalid product ID format');
          setLoading(false);
          return;
        }

        // Sanitize one more time before encoding for URL
        const sanitizedId = sanitizeProductId(productId);
        if (!sanitizedId) {
          setError('Invalid product ID format');
          setLoading(false);
          return;
        }

        // Fetch from API route (keeps Content Hub credentials server-side only)
        // Use encodeURIComponent for safe URL encoding
        const localeParam = router.locale ? `?locale=${encodeURIComponent(router.locale)}` : '';
        const response = await fetch(
          `/api/products/${encodeURIComponent(sanitizedId)}${localeParam}`,
          {
            signal: abortController.signal,
          },
        );

        // Check if request was aborted
        if (abortController.signal.aborted) {
          return;
        }

        if (response.status === 404) {
          setProduct(null);
          setError('Product not found');
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
        }

        const data: ProductData = await response.json();

        // Check again if request was aborted before setting state
        if (abortController.signal.aborted) {
          return;
        }

        setProduct(data);
      } catch (error: any) {
        // Ignore abort errors
        if (error?.name === 'AbortError') {
          return;
        }
        console.error('[ProductDetail Client] Error loading product:', error);
        setError(error?.message || 'Failed to load product');
      } finally {
        // Only update loading state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    // Cleanup function to abort request on unmount or dependency change
    return () => {
      abortController.abort();
    };
  }, [resolvedProductId, initialProductData]);

  useEffect(() => {
    setActiveVariantId(null);
    setActiveImageIndex(0);
  }, [product?.id]);

  const activeVariant =
    product?.colorVariants?.find((variant) => (variant.id || variant.name) === activeVariantId) ||
    null;
  const firstVariantImages = product?.colorVariants?.[0]?.images;
  const galleryImages =
    activeVariant?.images && activeVariant.images.length
      ? activeVariant.images
      : firstVariantImages && firstVariantImages.length
        ? firstVariantImages
        : product?.images;
  const safeGalleryImages = galleryImages && galleryImages.length ? galleryImages : [];

  // DEBUG: trace image data
  useEffect(() => {
    if (product) {
      console.log('[ProductDetail DEBUG] product.images:', product.images);
      console.log('[ProductDetail DEBUG] colorVariants count:', product.colorVariants?.length);
      product.colorVariants?.forEach((v, i) => {
        console.log(`[ProductDetail DEBUG] variant[${i}] id=${v.id} images:`, v.images);
      });
      console.log('[ProductDetail DEBUG] firstVariantImages:', firstVariantImages);
      console.log('[ProductDetail DEBUG] galleryImages:', galleryImages);
      console.log('[ProductDetail DEBUG] safeGalleryImages:', safeGalleryImages);
    }
  }, [product]);

  if (loading) {
    return <div className={styles.productDetail}>Loading product...</div>;
  }

  if (error) {
    return (
      <div className={styles.productDetail}>
        <div className="rounded border-2 border-red-300 bg-red-50 p-4">
          <p className="text-red-600">Error loading product: {error}</p>
        </div>
      </div>
    );
  }

  if (!resolvedProductId) {
    return <div className={styles.productDetail}>Product not found.</div>;
  }

  if (!product) {
    return <div className={styles.productDetail}>Product not found.</div>;
  }

  const resolvedImageIndex =
    safeGalleryImages.length > 0 ? Math.min(activeImageIndex, safeGalleryImages.length - 1) : 0;
  const activeImage = safeGalleryImages[resolvedImageIndex] || safeGalleryImages[0];

  const normalizeProductText = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';
    return String(value);
  };
  console.log('naskoproduct', product);
  // Get product name for breadcrumbs (extract from title or use H1)
  const productName = normalizeProductText(product.h1 || product.title);
  const breadcrumbParts = productName ? productName.split(':') : [];
  const collectionName =
    breadcrumbParts.length > 1 && breadcrumbParts[0] ? breadcrumbParts[0].trim() : 'Alpha HighVis';

  // SECURITY: HTML content from Content Hub - MUST be sanitized with createSafeHtml() before rendering
  // H2 short description (contains HTML from Content Hub)
  const h2Text = product.h2 || '';

  // SECURITY: HTML content from Content Hub - MUST be sanitized with createSafeHtml() before rendering
  // Description with "show more" functionality
  // Note: Simple truncation - for production, consider using a library that handles HTML truncation properly
  // WARNING: Truncation may break HTML tags, but createSafeHtml() will sanitize the result
  const descriptionText = product.fullDescription || '';
  const shouldTruncate = descriptionText.length > 500 && !showFullDescription;
  const displayDescription = shouldTruncate
    ? descriptionText.substring(0, 500) + '...'
    : descriptionText;

  return (
    <article className={`${styles.productDetail} ${className || ''}`}>
      {/* Left Column: Images and Content */}
      <section className={styles.imageSection}>
        <div className={styles.imageGallery}>
          <div className={styles.thumbnails}>
            {safeGalleryImages.map((img: string, index: number) => (
              <button
                key={index}
                className={index === resolvedImageIndex ? styles.active : ''}
                onClick={() => setActiveImageIndex(index)}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={img}
                  alt={`${product.title} view ${index + 1}`}
                  width={100}
                  height={100}
                  className={styles.thumbnailImage}
                  loading="lazy"
                  unoptimized={img.includes('contenthub.cws.com') || img.includes('?')}
                />
              </button>
            ))}
          </div>
          <div className={styles.mainImage}>
            {activeImage && (
              <Image
                src={activeImage}
                alt={product.title}
                width={800}
                height={600}
                className={styles.mainImageContent}
                priority={activeImageIndex === 0}
                unoptimized={
                  activeImage.includes('contenthub.cws.com') || activeImage.includes('?')
                }
              />
            )}
          </div>
        </div>

        {/* Highlights */}
        {/* SECURITY: product.highlights contains HTML from Content Hub - sanitized with createSafeHtml() */}
        {product.highlights && (
          <div className={styles.highlights}>
            <h3 className={styles.sectionTitle}>Highlights</h3>
            <div
              className={styles.highlightsContent}
              dangerouslySetInnerHTML={createSafeHtml(product.highlights)}
            />
          </div>
        )}

        {/* Description with Show More */}
        {/* SECURITY: displayDescription contains HTML from Content Hub - sanitized with createSafeHtml() */}
        {descriptionText && (
          <div className={styles.fullDescription}>
            <h3 className={styles.sectionTitle}>Description</h3>
            <div
              className={styles.content}
              dangerouslySetInnerHTML={createSafeHtml(displayDescription)}
            />
            {descriptionText.length > 500 && (
              <button
                className={styles.showMoreButton}
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? '...show less' : '...show more'}
              </button>
            )}
          </div>
        )}

        {/* Sustainability */}
        {/* SECURITY: product.sustainability contains HTML from Content Hub - sanitized with createSafeHtml() */}
        {product.sustainability && (
          <div className={styles.sustainability}>
            <button
              className={styles.sustainabilityHeader}
              onClick={() => setIsSustainabilityOpen(!isSustainabilityOpen)}
              aria-expanded={isSustainabilityOpen}
              aria-label="Toggle sustainability information"
            >
              <h3 className={styles.sustainabilityTitle}>Sustainability</h3>
              {isSustainabilityOpen ? (
                <Minus className={styles.sustainabilityIcon} size={20} />
              ) : (
                <Plus className={styles.sustainabilityIcon} size={20} />
              )}
            </button>
            {isSustainabilityOpen && (
              <div
                className={styles.sustainabilityContent}
                dangerouslySetInnerHTML={createSafeHtml(product.sustainability)}
              />
            )}
            <div className={styles.sustainabilityDivider}></div>
          </div>
        )}
      </section>

      {/* Right Column: Info */}
      <section className={styles.infoSection}>
        {/* Breadcrumbs */}
        <div className={styles.breadcrumbs}>
          CWS Workwear <span>&gt;</span> {collectionName}
        </div>

        {/* H1 Title: product H1 (cWS_H1) or product name marketing from Content Hub */}
        {(product.h1 || product.title) && (
          <h1 className={styles.title}>
            {stripHtmlTags(product.h1 || product.title)}
          </h1>
        )}

        {/* H2 Short Description */}
        {/* SECURITY: h2Text contains HTML from Content Hub - sanitized with createSafeHtml() */}
        {h2Text && (
          <div
            className={styles.shortDescription}
            dangerouslySetInnerHTML={createSafeHtml(h2Text)}
          />
        )}


        {/* Color Options */}
        {product.colorVariants && product.colorVariants.length > 0 && (
          <div className={styles.colors}>
            <div className={styles.colorList}>
              {product.colorVariants.map((variant, i: number) => (
                <button
                  key={variant.id || variant.name || i}
                  className={`${styles.colorSwatch} ${(variant.id || variant.name) === activeVariantId ? styles.active : ''
                    }`}
                  onClick={() => {
                    setActiveVariantId(variant.id || variant.name || null);
                    setActiveImageIndex(0);
                  }}
                  type="button"
                >
                  <div className={styles.colorSwatchImage}>
                    {variant.image ? (
                      <Image
                        src={variant.image}
                        alt={variant.name}
                        width={60}
                        height={60}
                        loading="lazy"
                        unoptimized={
                          variant.image.includes('contenthub.cws.com') ||
                          variant.image.includes('?')
                        }
                      />
                    ) : (
                      <div className={styles.colorSwatchPlaceholder}></div>
                    )}
                  </div>
                  <span className={styles.colorSwatchName}>{variant.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div className={styles.ctaSection}>
          <button
            type="button"
            onClick={() =>
              openContactFormModal(
                propContactFormId ?? (params?.contactFormId as string | undefined),
              )
            }
            data-tracking="product-detail-contact"
            className="mb-1 inline-flex items-center justify-center rounded-full bg-[#eb0045] px-4 py-0 text-[14px] leading-[32px] font-bold tracking-wide text-white no-underline shadow-sm transition-all duration-200 hover:text-black md:px-8"
          >
            <span className="text-[14px]">Get an offer</span>
          </button>
        </div>
      </section>
    </article>
  );
};

export const ProductDetail = Default;
export default Default;

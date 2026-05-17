import { GraphQLClient } from 'graphql-request';

// Sitecore Edge Delivery API configuration
const EDGE_DELIVERY_URL = process.env.PRODUCT_SITECORE_EDGE_URL;
const EDGE_CONTEXT_ID = process.env.SITECORE_EDGE_CONTEXT_ID;
const EDGE_GQL_TOKEN = process.env.PRODUCT_SITECORE_EDGE_GQL_TOKEN;
const EDGE_PRODUCTS_ROOT_PATH = process.env.PRODUCT_SITECORE_EDGE_PRODUCTS_ROOT_PATH;
const EDGE_PRODUCT_PATH_TEMPLATE = process.env.PRODUCT_SITECORE_EDGE_PRODUCT_PATH_TEMPLATE;

export interface ProductData {
    id: string;
    title: string;
    h1?: string; // CWS.H1
    h2?: string; // CWS.H2 (short description/slogan)
    shortDescription?: string;
    fullDescription?: string;
    highlights?: string; // CWSHighlights (HTML)
    sustainability?: string; // CWSSustainability (HTML)
    images: string[];
    colorVariants?: Array<{
        id?: string;
        name: string;
        image?: string;
        images?: string[];
        publishStatus?: string;
        primaryColor?: string;
        secondaryColor?: string;
    }>;
    facets?: {
        gender?: string;
        productGrouping?: string[];
        primaryColor?: string[];
        productCategory?: string;
    };
    attributes: {
        material?: string;
        weight?: string;
        protectionClass?: string;
        colors?: string[];
    };
}

export interface ProductFetchResult {
    product: ProductData;
    localizedSlugs: Record<string, string>;
}

export const productFacets = `
  cWSSex
  cWS_ProductGroupingToProduct {
    results {
      taxonomyLabel
    }
  }

  cWS_PrimaryColorToProduct {
    results {
      taxonomyLabel
    }
  }
  cWS_ProductCategoryToProduct {
    taxonomyLabel
  }
`;

/**
 * Sanitizes error messages to prevent data exposure
 * Removes sensitive information like URLs, API keys, internal paths
 * @param error - Error object or message
 * @returns Sanitized error message safe for client exposure
 */
function sanitizeErrorMessage(error: any): string {
    if (!error) {
        return 'An unexpected error occurred';
    }

    let message = typeof error === 'string' ? error : error.message || String(error);

    // Remove sensitive patterns
    const sensitivePatterns = [
        /https?:\/\/[^\s]+/gi, // URLs
        /api[_-]?key[=:]\s*[\w-]+/gi, // API keys
        /auth[_-]?token[=:]\s*[\w-]+/gi, // Auth tokens
        /password[=:]\s*[\w-]+/gi, // Passwords
        /\/[^\s]*\.(env|config|key)/gi, // Config file paths
        /SITECORE_EDGE_[A-Z_]+/g, // Environment variable names
        /[A-Za-z0-9]{32,}/g, // Long alphanumeric strings (potential keys)
    ];

    sensitivePatterns.forEach((pattern) => {
        message = message.replace(pattern, '[REDACTED]');
    });

    // Limit message length to prevent information leakage
    if (message.length > 200) {
        message = message.substring(0, 200) + '...';
    }

    return message;
}

function hasUnknownVariantFieldError(error: any): boolean {
    const errors = error?.response?.errors;
    if (!Array.isArray(errors)) return false;
    return errors.some((err: any) => {
        const message = typeof err?.message === 'string' ? err.message : '';
        return (
            message.includes('productToProductVariant_Children') ||
            message.includes('productToProductVariant_Parents') ||
            message.includes('cWS_ProductVariantsToProducts_Children') ||
            message.includes('cWS_ProductVariantsToProducts_Parents') ||
            message.includes('Cannot query field') ||
            (message.includes('Field') &&
                (message.includes('productToProductVariant_Children') ||
                    message.includes('productToProductVariant_Parents') ||
                    message.includes('cWS_ProductVariantsToProducts_Children') ||
                    message.includes('cWS_ProductVariantsToProducts_Parents')))
        );
    });
}

async function getEdgeAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    console.log('[Edge Auth] Config:', {
        hasContextId: EDGE_CONTEXT_ID,
        hasGqlToken: EDGE_GQL_TOKEN,
        endpoint: EDGE_DELIVERY_URL,
    });

    if (EDGE_CONTEXT_ID) {
        headers['sc_context'] = EDGE_CONTEXT_ID;
    }

    if (EDGE_GQL_TOKEN) {
        headers['X-GQL-Token'] = EDGE_GQL_TOKEN;
    } else {
        console.warn('[Edge Auth] WARNING: SITECORE_EDGE_GQL_TOKEN is missing; Edge may return 401.');
    }

    return headers;
}

function hasEdgeAuthConfig(): boolean {
    return !!EDGE_GQL_TOKEN;
}

function normalizePath(path: string): string {
    if (!path) return '';
    return path.replace(/\/{2,}/g, '/').replace(/\/$/, '');
}

function buildProductPaths(slug: string): string[] {
    const paths = new Set<string>();
    const sanitizedSlug = slug.replace(/^\//, '');

    if (EDGE_PRODUCT_PATH_TEMPLATE && EDGE_PRODUCT_PATH_TEMPLATE.includes('{slug}')) {
        const templatedPath = EDGE_PRODUCT_PATH_TEMPLATE.replace('{slug}', sanitizedSlug);
        if (templatedPath) {
            paths.add(normalizePath(templatedPath));
        }
    }

    if (EDGE_PRODUCTS_ROOT_PATH) {
        const root = normalizePath(EDGE_PRODUCTS_ROOT_PATH);
        if (root) {
            paths.add(normalizePath(`${root}/${sanitizedSlug}`));
        }
    }

    return Array.from(paths);
}

function extractSlugFromUrl(urlPath?: string): string | null {
    if (!urlPath) return null;
    const sanitized = urlPath.split('?')[0]?.split('#')[0] || '';
    const segments = sanitized.split('/').filter(Boolean);
    return segments[segments.length - 1] || null;
}

function buildProductFields(includeVariants: boolean): string {
    return `
              id
              productNumber
              productName
              productLabel
              productShortDescription
              productLongDescription
              productNameMarketing
              cWSProductDescription
              cWS_H1
              cWS_H2
              cWSHighlights
              cWSSustainability
              cWSSolutionAreaText
              cWSProductVariant
              cWSPublishStatus
              cWSERPMaterial
              cWSPIMMaterial
              cWSFabricWeight
                    pCMProductToMasterAsset {
        results {
          urls
        }
      }
              ${productFacets}
              pCMProductToAsset {
                results {
                  fileName
                  urls
                }
              }
              ${includeVariants
            ? `
              cWS_ProductVariantsToProducts_Children {
                results {
                  id
                  productNumber
                  productName
                  productLabel
                  productNameMarketing
                  cWS_H1
                  cWSPublishStatus
    pCMProductToMasterAsset {
        results {
          urls
        }
      }
                  ${productFacets}
                  pCMProductToAsset {
                    results {
                      fileName
                      urls
                    }
                  }
                }
              }
              cWS_ProductVariantsToProducts_Parents {
                results {
                  id
                  productNumber
                  productName
                  productLabel
                  productNameMarketing
                  cWS_H1
                  cWSPublishStatus
                        pCMProductToMasterAsset {
        results {
          urls
        }
      }
                  ${productFacets}
                  pCMProductToAsset {
                    results {
                      fileName
                      urls
                    }
                  }
                }
              }
              productToProductVariant_Children {
                results {
                  id
                  productNumber
                  productName
                  productLabel
                  productNameMarketing
                  cWS_H1
                  cWSPublishStatus
                        pCMProductToMasterAsset {
        results {
          urls
        }
      }
                  ${productFacets}
                  pCMProductToAsset {
                    results {
                      fileName
                      urls
                    }
                  }
                }
              }
              productToProductVariant_Parents {
                results {
                  id
                  productNumber
                  productName
                  productLabel
                  productNameMarketing
                  cWS_H1
                  cWSPublishStatus
                        pCMProductToMasterAsset {
        results {
          urls
        }
      }
                  ${productFacets}
                  pCMProductToAsset {
                    results {
                      fileName
                      urls
                    }
                  }
                }
              }`
            : ''
        }
    `;
}

/**
 * Fetch product using Sitecore Edge Delivery GraphQL
 */
async function fetchProductByIdGraphQL(
    id: string,
    locale?: string,
): Promise<ProductFetchResult | null> {
    try {
        if (!EDGE_DELIVERY_URL) {
            console.error('[fetchProductByIdGraphQL] SITECORE_EDGE_URL is missing.');
            return null;
        }

        const headers = await getEdgeAuthHeaders();
        const productNumber = id.replace(/[^a-zA-Z0-9_\s-]/g, '').trim();
        if (!productNumber || productNumber.length > 200) {
            console.warn('[fetchProductByIdGraphQL] Invalid product number format, rejecting search');
            return null;
        }

        let includeVariants = true;
        const buildQuery = () => `
        query GetWorkwearProducts($first: Int = 50, $after: String, $productNumber: String) {
          products: allM_PCM_Product(
            first: $first
            after: $after
            where: { 
              cWSSolutionAreaText_eq: "Workwear",
              cWSPublishStatus_eq: "Published",
              productNumber_eq: $productNumber
            }
          ) {
            total
            pageInfo {
              endCursor
              hasNext
            }
            results {${buildProductFields(includeVariants)}}
          }
        }
        `;

        const graphQLClient = new GraphQLClient(EDGE_DELIVERY_URL, {
            headers,
        });

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Edge GraphQL request timeout after 30s')), 30000);
        });

        let data: any;
        try {
            data = (await Promise.race([
                graphQLClient.request(buildQuery(), {
                    first: 1,
                    after: null,
                    productNumber,
                }),
                timeoutPromise,
            ])) as any;
        } catch (error: any) {
            if (includeVariants && hasUnknownVariantFieldError(error)) {
                includeVariants = false;
                data = (await Promise.race([
                    graphQLClient.request(buildQuery(), {
                        first: 1,
                        after: null,
                        productNumber,
                    }),
                    timeoutPromise,
                ])) as any;
            } else {
                throw error;
            }
        }

        const rawProduct = data?.products?.results?.[0];
        if (!rawProduct) {
            console.warn(`[fetchProductByIdGraphQL] Edge product "${productNumber}" not found`);
            return null;
        }

        return {
            product: mapResponseToProductData(rawProduct, locale),
            localizedSlugs: buildLocalizedSlugMap(rawProduct),
        };
    } catch (error: any) {
        // SECURITY: Enhanced error logging - log full details server-side only
        if (error.response) {
            const status = error.response.status;
            const statusText = error.response.statusText;
            const errors = error.response.errors;

            if (status === 401) {
                console.error(`[fetchProductByIdGraphQL] Edge authentication failed (401). Please check:`);
                console.error(`- SITECORE_EDGE_AUTHORITY_URL is set correctly`);
                console.error(`- SITECORE_EDGE_OAUTH_AUDIENCE is set correctly`);
                console.error(`- SITECORE_EDGE_CLIENT_ID / SITECORE_EDGE_CLIENT_SECRET are valid`);
            } else if (errors) {
                // Log GraphQL errors server-side only (may contain schema details)
                console.error(`[fetchProductByIdGraphQL] Edge GraphQL errors:`, errors);
                console.error(`[fetchProductByIdGraphQL] Tip: Verify Edge schema and access`);
            } else {
                console.error(`[fetchProductByIdGraphQL] Edge API error: ${status} ${statusText}`);
            }
        } else {
            // SECURITY: Sanitize error message before logging
            const sanitizedError = sanitizeErrorMessage(error);
            console.error('[fetchProductByIdGraphQL] Edge fetch failed:', sanitizedError);
        }

        return null;
    }
}

/**
 * Search for product by number using Edge Delivery GraphQL
 * Returns the Edge product record if found
 */
async function fetchProductByNumberEdge(
    productNumber: string,
    locale?: string,
): Promise<ProductFetchResult | null> {
    try {
        if (!EDGE_DELIVERY_URL) {
            console.error('[fetchProductByNumberEdge] SITECORE_EDGE_URL is missing.');
            return null;
        }

        const headers = await getEdgeAuthHeaders();
        const sanitizedNumber = productNumber.replace(/[^a-zA-Z0-9_\s-]/g, '').trim();
        if (!sanitizedNumber || sanitizedNumber.length > 200) {
            console.warn('[fetchProductByNumberEdge] Invalid product number format, rejecting search');
            return null;
        }

        let includeVariants = true;
        const buildQuery = () => `
        query GetProductByNumber($number: String!) {
          products: allM_PCM_Product(where: { productNumber_eq: $number }) {
            results {${buildProductFields(includeVariants)}}
          }
        }
        `;

        const graphQLClient = new GraphQLClient(EDGE_DELIVERY_URL, { headers });
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('GraphQL request timeout after 30s')), 30000);
        });

        let data: any;
        try {
            data = (await Promise.race([
                graphQLClient.request(buildQuery(), { number: sanitizedNumber }),
                timeoutPromise,
            ])) as any;
        } catch (error: any) {
            if (includeVariants && hasUnknownVariantFieldError(error)) {
                includeVariants = false;
                data = (await Promise.race([
                    graphQLClient.request(buildQuery(), { number: sanitizedNumber }),
                    timeoutPromise,
                ])) as any;
            } else {
                throw error;
            }
        }

        const rawProduct = data?.products?.results?.[0];
        if (!rawProduct) {
            console.warn(`[fetchProductByNumberEdge] No product found for number "${sanitizedNumber}"`);
            return null;
        }

        return {
            product: mapResponseToProductData(rawProduct, locale),
            localizedSlugs: buildLocalizedSlugMap(rawProduct),
        };
    } catch (error: any) {
        const fullError = error.message || String(error);
        console.error('[fetchProductByNumberEdge] Error fetching product:', fullError);
        return null;
    }
}

/**
 * Search for product by H1 slug using Edge Delivery GraphQL
 * Slug is derived from localized cWS_H1 field
 */
async function fetchProductBySlugEdge(
    slug: string,
    locale?: string,
): Promise<ProductFetchResult | null> {
    try {
        if (!EDGE_DELIVERY_URL) {
            console.error('[fetchProductBySlugEdge] SITECORE_EDGE_URL is missing.');
            return null;
        }

        const headers = await getEdgeAuthHeaders();
        const sanitizedSlug = slug.replace(/[^a-zA-Z0-9_-]/g, '').trim();
        if (!sanitizedSlug || sanitizedSlug.length > 200) {
            console.warn('[fetchProductBySlugEdge] Invalid slug format, rejecting search');
            return null;
        }

        let includeVariants = true;
        const buildQuery = () => `
        query GetProductsForSlug($first: Int = 100, $after: String) {
          products: allM_PCM_Product(
            first: $first
            after: $after
            where: {
              cWSSolutionAreaText_eq: "Workwear"
              cWSPublishStatus_eq: "Published"
            }
          ) {
            pageInfo {
              endCursor
              hasNext
            }
            results {${buildProductFields(includeVariants)}}
          }
        }
        `;

        const graphQLClient = new GraphQLClient(EDGE_DELIVERY_URL, { headers });
        let after: string | null = null;
        let hasNext = true;

        while (hasNext) {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('GraphQL request timeout after 30s')), 30000);
            });

            let data: any;
            try {
                data = (await Promise.race([
                    graphQLClient.request(buildQuery(), { after }),
                    timeoutPromise,
                ])) as any;
            } catch (error: any) {
                if (includeVariants && hasUnknownVariantFieldError(error)) {
                    includeVariants = false;
                    data = (await Promise.race([
                        graphQLClient.request(buildQuery(), { after }),
                        timeoutPromise,
                    ])) as any;
                } else {
                    throw error;
                }
            }

            const results = data?.products?.results || [];
            const matches = results.filter((product: any) => {
                const h1Text = resolveLocalizedValue(product?.cWS_H1, locale);
                const marketingText = resolveLocalizedValue(product?.productNameMarketing, locale);
                const productSlug = slugifyProductText(h1Text || marketingText);
                return productSlug && productSlug === sanitizedSlug.toLowerCase();
            });

            if (matches.length) {
                const rawMatch = matches.find((product: any) => !product?.cWSProductVariant) || matches[0];
                return {
                    product: mapResponseToProductData(rawMatch, locale),
                    localizedSlugs: buildLocalizedSlugMap(rawMatch),
                };
            }

            hasNext = !!data?.products?.pageInfo?.hasNext;
            after = data?.products?.pageInfo?.endCursor || null;
        }

        console.warn(`[fetchProductBySlugEdge] No product found for slug "${sanitizedSlug}"`);
        return null;
    } catch (error: any) {
        const fullError = error.message || String(error);
        console.error('[fetchProductBySlugEdge] Error fetching product:', fullError);
        return null;
    }
}

/**
 * Fetch product with localized slug map for language-switcher URL resolution.
 * Returns both the mapped ProductData and a Record<locale, slug> for all available locales.
 */
export async function fetchProductByIdWithSlugs(
    id: string,
    locale?: string,
): Promise<ProductFetchResult | null> {
    if (!id) {
        console.error('Product ID is required');
        return null;
    }

    if (!hasEdgeAuthConfig()) {
        console.error(
            'Sitecore Edge OAuth configuration is missing. Please add Edge credentials to your environment variables.',
        );
        return null;
    }

    console.log(`[fetchProductById] Attempting to fetch product with identifier: "${id}"`);

    const isGuid = /^[0-9a-fA-F-]{36}$/.test(id);
    console.log(
        `[fetchProductById] ID type: ${isGuid ? 'GUID (direct lookup)' : 'Slug/product number (Edge query)'}`,
    );

    if (!isGuid) {
        const resultBySlug = await fetchProductBySlugEdge(id, locale);
        if (resultBySlug) {
            return resultBySlug;
        }

        const resultByNumber = await fetchProductByNumberEdge(id, locale);
        if (resultByNumber) {
            return resultByNumber;
        }
    }

    return fetchProductByIdGraphQL(id, locale);
}

/**
 * Fetch product by ID (backward-compatible wrapper).
 * Use fetchProductByIdWithSlugs when you also need localized slugs.
 */
export async function fetchProductById(id: string, locale?: string): Promise<ProductData | null> {
    const result = await fetchProductByIdWithSlugs(id, locale);
    return result?.product ?? null;
}

/**
 * Fetch all product slugs (based on localized H1) from Edge GraphQL for static generation
 */
export async function fetchAllProductSlugs(locale?: string): Promise<string[]> {
    console.log('[fetchAllProductSlugs] Starting...', {
        hasEdgeAuthConfig: hasEdgeAuthConfig(),
        endpoint: EDGE_DELIVERY_URL,
    });

    if (!hasEdgeAuthConfig()) {
        console.warn(
            '[fetchAllProductSlugs] Edge OAuth config is missing. Cannot fetch product list for static generation.',
        );
        return [];
    }

    try {
        if (!EDGE_DELIVERY_URL) {
            console.error('[fetchAllProductSlugs] SITECORE_EDGE_URL is missing.');
            return [];
        }

        const headers = await getEdgeAuthHeaders();
        const graphQLClient = new GraphQLClient(EDGE_DELIVERY_URL, { headers });

        const query = `
        query GetWorkwearProducts($first: Int = 200, $after: String) {
          products: allM_PCM_Product(
            first: $first
            after: $after
            where: {
              cWSSolutionAreaText_eq: "Workwear"
              cWSPublishStatus_eq: "Published"
            }
          ) {
            pageInfo {
              endCursor
              hasNext
            }
            results {
              productNumber
              cWS_H1
              productNameMarketing
            }
          }
        }
        `;

        const productSlugs = new Set<string>();
        let after: string | null = null;
        let hasNext = true;

        while (hasNext) {
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('GraphQL request timeout after 30s')), 30000);
            });

            const data = (await Promise.race([
                graphQLClient.request(query, { after }),
                timeoutPromise,
            ])) as any;

            const results = data?.products?.results || [];
            for (const product of results) {
                const rawH1 = product?.cWS_H1;
                const rawMarketing = product?.productNameMarketing;
                const h1Text = resolveLocalizedValue(rawH1, locale);
                const marketingText = resolveLocalizedValue(rawMarketing, locale);

                // Only include this product for the current locale if it actually
                // has a localized value for that locale (or its base language).
                // This prevents generating sitemap URLs for languages where the
                // product is not available.
                if (locale && rawH1 && typeof rawH1 === 'object' && !Array.isArray(rawH1)) {
                    const keys = Object.keys(rawH1);
                    const hasLocaleKeys = keys.some((key) => /^[a-z]{2}(-[A-Za-z]{2})?$/.test(key));

                    if (hasLocaleKeys) {
                        const normalizedLocale = locale.toLowerCase();
                        const languageCode = normalizedLocale.split('-')[0];

                        const hasMatchForLocale = keys.some((key) => {
                            const k = key.toLowerCase();
                            return (
                                k === normalizedLocale || k === languageCode || k.startsWith(`${languageCode}-`)
                            );
                        });

                        if (!hasMatchForLocale) {
                            // When H1 has no locale match, allow productNameMarketing (e.g. PL uses it instead of H1)
                            const hasMarketingMatch =
                                rawMarketing &&
                                typeof rawMarketing === 'object' &&
                                !Array.isArray(rawMarketing) &&
                                Object.keys(rawMarketing).some((key) => {
                                    const k = key.toLowerCase();
                                    return (
                                        k === normalizedLocale || k === languageCode || k.startsWith(`${languageCode}-`)
                                    );
                                });
                            if (!hasMarketingMatch) continue;
                        }
                    }
                }

                const slug = slugifyProductText(h1Text || marketingText);
                if (slug) {
                    productSlugs.add(slug);
                }
            }

            hasNext = !!data?.products?.pageInfo?.hasNext;
            after = data?.products?.pageInfo?.endCursor || null;
        }

        console.log(`[Edge] Successfully fetched ${productSlugs.size} product slugs`);
        return Array.from(productSlugs);
    } catch (error: any) {
        const sanitizedError = sanitizeErrorMessage(error);
        console.warn('[fetchAllProductSlugs] Failed to fetch product list from Edge:', sanitizedError);
        return [];
    }
}

function resolveScalarValue(raw: any): string {
    if (raw === null || raw === undefined) return '';
    if (typeof raw === 'string') return raw;
    if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw);
    if (Array.isArray(raw)) {
        return raw
            .map((item) => resolveScalarValue(item))
            .filter(Boolean)
            .join(', ');
    }
    if (typeof raw === 'object') {
        if ('value' in raw) return resolveScalarValue(raw.value);
        if ('src' in raw) return String(raw.src || '');
        if ('href' in raw) return String(raw.href || '');
        if ('url' in raw) return String(raw.url || '');
    }
    return '';
}

function resolveLocalizedValue(raw: any, locale?: string, fallbackLocale = 'en-US'): string {
    if (raw === null || raw === undefined) return '';
    if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
        return resolveScalarValue(raw);
    }
    if (Array.isArray(raw)) {
        return raw
            .map((item) => resolveScalarValue(item))
            .filter(Boolean)
            .join(', ');
    }
    if (typeof raw === 'object') {
        if ('value' in raw || 'src' in raw || 'href' in raw || 'url' in raw) {
            return resolveScalarValue(raw);
        }

        const keys = Object.keys(raw);
        const hasLocaleKeys = keys.some((key) => /^[a-z]{2}(-[A-Za-z]{2})?$/.test(key));
        if (hasLocaleKeys) {
            const normalizedLocale = locale?.toLowerCase();
            const normalizedFallback = fallbackLocale?.toLowerCase();

            if (normalizedLocale) {
                const exactKey = keys.find((key) => key.toLowerCase() === normalizedLocale);
                if (exactKey) return resolveScalarValue(raw[exactKey]);

                const languageCode = normalizedLocale.split('-')[0];
                const languageKey = keys.find((key) => key.toLowerCase() === languageCode);
                if (languageKey) return resolveScalarValue(raw[languageKey]);

                const languageMatchKey = keys.find((key) =>
                    key.toLowerCase().startsWith(`${languageCode}-`),
                );
                if (languageMatchKey) return resolveScalarValue(raw[languageMatchKey]);
            }

            if (normalizedFallback) {
                const fallbackKey = keys.find((key) => key.toLowerCase() === normalizedFallback);
                if (fallbackKey) return resolveScalarValue(raw[fallbackKey]);

                const fallbackLanguage = normalizedFallback.split('-')[0];
                const fallbackLanguageKey = keys.find((key) =>
                    key.toLowerCase().startsWith(`${fallbackLanguage}-`),
                );
                if (fallbackLanguageKey) return resolveScalarValue(raw[fallbackLanguageKey]);
            }

            for (const key of keys) {
                const value = resolveScalarValue(raw[key]);
                if (value) return value;
            }
        }
    }

    return resolveScalarValue(raw);
}

function slugifyProductText(value: string): string {
    if (!value) return '';
    return value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[/]/g, '-')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function resolveAssetUrl(assets: any[]): string[] {
    if (!Array.isArray(assets)) return [];
    const urls: string[] = [];
    const preferredResources = ['productImage', 'productThumbnail', 'preview', 'downloadOriginal'];

    const getFileSortKey = (fileName?: string): { base: string; index: number | null } => {
        if (!fileName || typeof fileName !== 'string') {
            return { base: '', index: null };
        }
        const base = fileName.toLowerCase();
        const match = base.match(/(?:[_-])(\d{1,3})\.(?:jpg|jpeg|png|webp)$/i);
        if (match && match[1]) {
            return { base, index: Number(match[1]) };
        }
        return { base, index: null };
    };

    const sortedAssets = [...assets].sort((a, b) => {
        const aKey = getFileSortKey(a?.fileName);
        const bKey = getFileSortKey(b?.fileName);
        if (aKey.index !== null && bKey.index !== null && aKey.index !== bKey.index) {
            return aKey.index - bKey.index;
        }
        if (aKey.index !== null && bKey.index === null) return -1;
        if (aKey.index === null && bKey.index !== null) return 1;
        return aKey.base.localeCompare(bKey.base);
    });

    for (const asset of sortedAssets) {
        const assetUrls = asset?.urls;
        if (assetUrls && typeof assetUrls === 'object') {
            const entries = Object.values(assetUrls)
                .map((entry: any) => ({
                    url: entry?.url,
                    resource: entry?.resource,
                }))
                .filter((entry) => !!entry.url);

            if (entries.length) {
                entries.sort((a, b) => {
                    const aIndex = preferredResources.indexOf(a.resource);
                    const bIndex = preferredResources.indexOf(b.resource);
                    const aScore = aIndex === -1 ? preferredResources.length : aIndex;
                    const bScore = bIndex === -1 ? preferredResources.length : bIndex;
                    return aScore - bScore;
                });
                if (entries[0]?.url) {
                    urls.push(entries[0].url);
                }
                continue;
            }
        }

        const fallbackUrl =
            resolveScalarValue(asset?.url) ||
            resolveScalarValue(asset?.file?.url) ||
            resolveScalarValue(asset?.publicUrl) ||
            resolveScalarValue(asset?.src);
        if (fallbackUrl) {
            urls.push(fallbackUrl);
        }
    }

    return urls.filter(Boolean);
}

function isJpgFile(fileName?: string): boolean {
    if (!fileName || typeof fileName !== 'string') return false;
    const lower = fileName.toLowerCase();
    return lower.endsWith('.jpg') || lower.endsWith('.jpeg');
}

function isImageFile(fileName?: string): boolean {
    if (!fileName || typeof fileName !== 'string') return false;
    const lower = fileName.toLowerCase();
    return (
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.webp')
    );
}

function buildProductImages(assets: any[], masterAssets: any[] = []): string[] {
    const imageAssets = Array.isArray(assets)
        ? assets.filter((asset) => isImageFile(asset?.fileName))
        : [];
    const primaryAssetImages = resolveAssetUrl(imageAssets);
    const primaryImage = primaryAssetImages[0];
    const productShotAssets = imageAssets.filter((asset: any) => isImageFile(asset?.fileName));
    const productShotImages = resolveAssetUrl(productShotAssets).filter(
        (url) => url && url !== primaryImage,
    );

    if (primaryImage) {
        return [primaryImage, ...productShotImages];
    }

    return resolveAssetUrl(Array.isArray(masterAssets) ? masterAssets : []);
}

function mapResponseToProductData(data: any, locale?: string): ProductData {
    const title =
        resolveLocalizedValue(data?.productNameMarketing, locale) ||
        resolveLocalizedValue(data?.productName, locale) ||
        resolveLocalizedValue(data?.productLabel, locale) ||
        '';

    const h1 = resolveLocalizedValue(data?.cWS_H1, locale);
    const shortDescription = resolveLocalizedValue(data?.productShortDescription, locale);
    const h2 = shortDescription || resolveLocalizedValue(data?.cWS_H2, locale);
    const fullDescription = resolveLocalizedValue(
        data?.cWSProductDescription || data?.productLongDescription,
        locale,
    );
    const highlights = resolveLocalizedValue(data?.cWSHighlights, locale);
    const sustainability = resolveLocalizedValue(data?.cWSSustainability, locale);

    const material = resolveLocalizedValue(data?.cWSERPMaterial || data?.cWSPIMMaterial, locale);
    const weight = resolveLocalizedValue(data?.cWSFabricWeight, locale);

    const productAssets = Array.isArray(data?.pCMProductToAsset?.results)
        ? data.pCMProductToAsset.results
        : [];
    const productMasterAssets = Array.isArray(data?.pCMProductToMasterAsset?.results)
        ? data.pCMProductToMasterAsset.results
        : [];
    const images = buildProductImages(productAssets, productMasterAssets);

    const productData: ProductData = {
        id: data?.id?.toString() || data?.productNumber || '',
        title,
        images,
        attributes: {
            ...(material && { material }),
            ...(weight && { weight }),
        },
        facets: {
            gender: resolveScalarValue(data?.cWSSex).split('.').pop() || '',
            productGrouping:
                data?.cWS_ProductGroupingToProduct?.results
                    ?.map((r: any) => resolveLocalizedValue(r.taxonomyLabel, locale))
                    .filter(Boolean) || [],
            primaryColor:
                data?.cWS_PrimaryColorToProduct?.results
                    ?.map((r: any) => resolveLocalizedValue(r.taxonomyLabel, locale))
                    .filter(Boolean) || [],
            productCategory:
                resolveLocalizedValue(data?.cWS_ProductCategoryToProduct?.taxonomyLabel, locale) || '',
        },
    };

    // Use Product Name (Marketing) as fallback when H1 is missing (e.g. Polish)
    productData.h1 = h1 || resolveLocalizedValue(data?.productNameMarketing, locale) || title;
    if (h2) productData.h2 = h2;
    if (shortDescription) productData.shortDescription = shortDescription;
    if (fullDescription) productData.fullDescription = fullDescription;
    if (highlights) productData.highlights = highlights;
    if (sustainability) productData.sustainability = sustainability;

    const variantChildren =
        data?.cWS_ProductVariantsToProducts_Children?.results ||
        data?.productToProductVariant_Children?.results ||
        [];
    const variantParents =
        data?.cWS_ProductVariantsToProducts_Parents?.results ||
        data?.productToProductVariant_Parents?.results ||
        [];
    const variants = [...variantChildren, ...variantParents];
    if (Array.isArray(variants) && variants.length) {
        const seen = new Set<string>();
        productData.colorVariants = variants
            .map((variant: any) => {
                const name =
                    resolveLocalizedValue(variant?.productNameMarketing, locale) ||
                    resolveLocalizedValue(variant?.productLabel, locale) ||
                    resolveLocalizedValue(variant?.productName, locale) ||
                    resolveLocalizedValue(variant?.cWS_H1, locale) ||
                    '';
                if (!name) return null;
                const publishStatus = resolveLocalizedValue(variant?.cWSPublishStatus, locale);
                const normalizedStatus = publishStatus.toLowerCase();
                if (normalizedStatus === 'unpublished') {
                    return null;
                }
                const id = variant?.id?.toString() || variant?.productNumber || '';
                if (!id || seen.has(id)) return null;
                seen.add(id);
                const images = buildProductImages(
                    variant?.pCMProductToAsset?.results || [],
                    variant?.pCMProductToMasterAsset?.results || [],
                );
                return {
                    id,
                    name,
                    image: images[0] || null,
                    images,
                    publishStatus,
                };
            })
            .filter(Boolean) as ProductData['colorVariants'];
    }

    return productData;
}

/**
 * Build a map of normalized locale → slugified product name from raw GraphQL data.
 * Uses cWS_H1 (primary) and productNameMarketing (fallback).
 * Keys are lowercased BCP-47 (e.g. "de-de", "en-us", "fr-fr").
 */
function buildLocalizedSlugMap(rawProduct: any): Record<string, string> {
    const slugMap: Record<string, string> = {};
    const h1Raw = rawProduct?.cWS_H1;
    const marketingRaw = rawProduct?.productNameMarketing;

    const isLocaleObject = (v: any): v is Record<string, any> =>
        v &&
        typeof v === 'object' &&
        !Array.isArray(v) &&
        Object.keys(v).some((key) => /^[a-z]{2}(-[A-Za-z]{2})?$/i.test(key));

    const h1Obj = isLocaleObject(h1Raw) ? h1Raw : null;
    const marketingObj = isLocaleObject(marketingRaw) ? marketingRaw : null;

    // Collect all locale keys from both fields
    const allKeys = new Set<string>();
    if (h1Obj) Object.keys(h1Obj).forEach((k) => allKeys.add(k));
    if (marketingObj) Object.keys(marketingObj).forEach((k) => allKeys.add(k));

    for (const key of allKeys) {
        // Prefer H1, fall back to marketing name
        const text =
            (h1Obj ? resolveScalarValue(h1Obj[key]) : '') ||
            (marketingObj ? resolveScalarValue(marketingObj[key]) : '');
        const slug = slugifyProductText(text);
        if (slug) {
            slugMap[key.toLowerCase().replace(/_/g, '-')] = slug;
        }
    }

    return slugMap;
}

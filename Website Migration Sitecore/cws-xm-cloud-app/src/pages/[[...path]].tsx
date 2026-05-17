import { useEffect, JSX } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import sites from '.sitecore/sites.json';
import NotFound from 'src/NotFound';
import Layout from 'src/Layout';
import {
  SitecoreProvider,
  ComponentPropsContext,
  SitecorePageProps,
  StaticPath,
  SiteInfo,
  Page,
  LayoutServicePageState,
  ComponentRendering,
} from '@sitecore-content-sdk/nextjs';
import { extractPath, handleEditorFastRefresh } from '@sitecore-content-sdk/nextjs/utils';
import { isDesignLibraryPreviewData } from '@sitecore-content-sdk/nextjs/editing';
import client from '@/lib/sitecore-client';
import { componentMap as components } from '.sitecore/component-map';
import scConfig from 'sitecore.config';
import { fetchProductByIdWithSlugs, ProductData } from '@/lib/content-hub-client';
import { extractProductIdFromPath } from '@/lib/product-path';

const siteNames = Array.from(new Set(sites.map((site: SiteInfo) => site.name).filter(Boolean))).map(
  (name) => name.toLowerCase(),
);
const siteNameSet = new Set(siteNames);
const DEFAULT_SITE_NAME = (
  process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME ||
  process.env.SITECORE_SITE_NAME ||
  'cws'
).toLowerCase();

/**
 * Locale-specific path segments that map to workwear/healthcare sites.
 * Must stay in sync with middleware.ts WORKWEAR_PATH_SEGMENTS / HEALTHCARE_PATH_SEGMENTS.
 */
const WORKWEAR_PATH_SEGMENTS = new Set(
  [
    'workwear',
    'arbeitskleidung',
    'vetements-de-travail',
    'ropa-de-trabajo',
    'abbigliamento-da-lavoro',
    'werkkledij',
    'odziez-robocza-i-ochronna',
    'pracovni-odevy',
    'pracovne-odevy',
    'munka-es-vedoruha',
    'imbracaminte-de-lucru',
    'rabotno-obleklo',
    'radna-odjeca',
    'delovna-oblacila',
    'arbetsklader',
  ].map((s) => s.toLowerCase()),
);
const HEALTHCARE_PATH_SEGMENTS = new Set(['healthcare'].map((s) => s.toLowerCase()));

function resolveSiteFromSegment(segment: string | undefined): string | null {
  const normalized = segment?.toLowerCase();
  if (!normalized) return null;
  if (WORKWEAR_PATH_SEGMENTS.has(normalized)) return 'workwear';
  if (HEALTHCARE_PATH_SEGMENTS.has(normalized)) return 'healthcare';
  return null;
}

function getSiteNameFromParams(
  params: { path?: string | string[] },
  locale?: string,
): string | null {
  const pathArray = Array.isArray(params?.path) ? params.path : params?.path ? [params.path] : [];
  if (pathArray.length === 0) return null;

  const normalizedLocale = locale?.toLowerCase();
  const normalizedFirst = pathArray[0]?.toLowerCase();
  const siteIndex = normalizedLocale && normalizedFirst === normalizedLocale ? 1 : 0;
  const siteCandidate = pathArray[siteIndex];
  const normalizedSiteCandidate = siteCandidate?.toLowerCase();

  // Check for _site_ prefix (rewritten paths)
  if (normalizedSiteCandidate && normalizedSiteCandidate.startsWith('_site_')) {
    const siteName = normalizedSiteCandidate.replace('_site_', '');
    if (siteNameSet.has(siteName)) {
      return siteName;
    }
  }

  // Check direct site name match
  if (normalizedSiteCandidate && siteNameSet.has(normalizedSiteCandidate)) {
    return normalizedSiteCandidate;
  }

  // Check locale-specific path segments (e.g. arbeitskleidung → workwear)
  return resolveSiteFromSegment(normalizedSiteCandidate);
}

function isProductPath(path: string): boolean {
  return path.toLowerCase().includes('products');
}

async function fetchBasePageForLayout(
  locale: string,
  siteName: string,
  currentPath?: string,
): Promise<{ header?: ComponentRendering[]; footer?: ComponentRendering[]; fields?: any } | null> {
  const candidatePaths: string[] = [
    '/products/-w-',
    '/workwear/products/-w-',
    '/Home/products/-w-',
    '/workwear/products',
    '/products',
    '/Home/products',
  ];
  if (currentPath) {
    const segments = currentPath.replace(/^\//, '').split('/').filter(Boolean);
    if (segments.length > 1) {
      candidatePaths.unshift(`/${segments.slice(0, -1).join('/')}`);
    }
  }
  const localeCandidates = locale === 'en' ? ['en', 'en-GB', 'en-IE'] : [locale];
  for (const candidateLocale of localeCandidates) {
    for (const basePagePath of candidatePaths) {
      try {
        const basePage = await client.getPage(basePagePath, {
          locale: candidateLocale,
          site: siteName,
        });
        const route = basePage?.layout?.sitecore?.route;
        if (!route) continue;
        const placeholders = route.placeholders || {};
        return {
          header: placeholders['headless-header'],
          footer: placeholders['headless-footer'],
          fields: route.fields,
        };
      } catch {
        // continue
      }
    }
  }
  return null;
}

function createProductPage(
  path: string,
  locale: string,
  siteName: string,
  productId: string,
  baseLayout: { header?: ComponentRendering[]; footer?: ComponentRendering[]; fields?: any } | null,
  product?: ProductData | null,
  localizedSlugs?: Record<string, string> | null,
): Page {
  const stripHtml = (html?: string): string =>
    html
      ? html
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim()
      : '';
  const productRendering: ComponentRendering = {
    componentName: 'ProductDetail',
    uid: 'product-detail-component',
    dataSource: '',
    placeholders: {},
    fields: {},
    params: { productId },
  };
  const placeholders: Record<string, ComponentRendering[]> = {
    'headless-main': [productRendering],
    ...(baseLayout?.header && { 'headless-header': baseLayout.header }),
    ...(baseLayout?.footer && { 'headless-footer': baseLayout.footer }),
  };
  const productName = stripHtml(product?.h1 || product?.title || '') || productId;
  const ogTitle = `${productName} | CWS Workwear`;
  const ogDescription = stripHtml(product?.fullDescription || '');
  const ogImage =
    product?.images?.[0] ||
    product?.colorVariants?.find((v) => v?.images?.length)?.images?.[0] ||
    product?.colorVariants?.find((v) => v?.image)?.image ||
    '';
  const siteUrl = process.env.NEXT_PUBLIC_RENDERING_HOST_URL?.replace(/\/$/, '') || '';
  const cleanPath = path
    .split('/')
    .filter((s) => s && !s.startsWith('_site_'))
    .join('/');
  const currentUrl = `${siteUrl}/${locale}/${siteName}/${cleanPath}`.replace(/\/+/g, '/');

  return {
    layout: {
      sitecore: {
        context: {
          language: locale,
          site: { name: siteName },
          itemPath: `/${cleanPath}`,
          pageState: LayoutServicePageState.Normal,
          pageEditing: false,
        },
        route: {
          name: productId,
          displayName: productName,
          fields: {
            ...(baseLayout?.fields || {}),
            Title: { value: ogTitle },
            MetaTitle: { value: ogTitle },
            MetaDescription: { value: ogDescription },
            OGTitle: { value: ogTitle },
            OGDescription: { value: ogDescription },
            PageIdentifier: { value: 'product-page' },
            OGURL: { value: currentUrl },
            OGImage: ogImage ? { value: { src: ogImage, alt: productName } } : undefined,
            ...(localizedSlugs && {
              ProductLocalizedSlugs: { value: JSON.stringify(localizedSlugs) },
            }),
          },
          placeholders,
        },
      },
    },
    siteName: siteName,
    locale,
    mode: {
      name: LayoutServicePageState.Normal,
      designLibrary: { isVariantGeneration: false },
      isNormal: true,
      isPreview: false,
      isEditing: false,
      isDesignLibrary: false,
    },
  };
}

interface MainPageProps extends SitecorePageProps {
  productDetail?: ProductData | null;
}

const SitecorePage = ({
  page,
  notFound,
  componentProps,
  productDetail,
}: MainPageProps): JSX.Element => {
  useEffect(() => {
    // Since Sitecore Editor does not support Fast Refresh, need to refresh editor chromes after Fast Refresh finished
    handleEditorFastRefresh();
  }, []);

  if (notFound || !page) {
    return <NotFound />;
  }

  const productFacets = productDetail?.facets;
  const hasProductFacets =
    productFacets?.gender ||
    productFacets?.productGrouping?.length ||
    productFacets?.primaryColor?.length ||
    productFacets?.productCategory;

  return (
    <ComponentPropsContext value={componentProps || {}}>
      <SitecoreProvider componentMap={components} api={scConfig.api} page={page}>
        <Layout page={page} />
      </SitecoreProvider>
      {hasProductFacets && (
        <div className="product-facet" style={{ display: 'none' }}>
          {productFacets?.gender && <div className="product-gender">{productFacets.gender}</div>}
          {productFacets?.productGrouping?.length && (
            <div className="product-grouping">{productFacets.productGrouping.join(', ')}</div>
          )}
          {productFacets?.primaryColor?.length && (
            <div className="product-primary-color">{productFacets.primaryColor.join(', ')}</div>
          )}
          {productFacets?.productCategory && (
            <div className="product-category">{productFacets.productCategory}</div>
          )}
        </div>
      )}
    </ComponentPropsContext>
  );
};

// This function gets called at build and export time to determine
// pages for SSG ("paths", as tokenized array).
export const getStaticPaths: GetStaticPaths = async (context) => {
  // Fallback, along with revalidate in getStaticProps (below),
  // enables Incremental Static Regeneration. This allows us to
  // leave certain (or all) paths empty if desired and static pages
  // will be generated on request (development mode in this example).
  // Alternatively, the entire sitemap could be pre-rendered
  // ahead of time (non-development mode in this example).
  // See https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration

  let paths: StaticPath[] = [];
  let fallback: boolean | 'blocking' = 'blocking';
  // Filter out the synthetic 'default' locale — it's only used for Next.js routing,
  // not for actual content delivery.
  const locales = (context?.locales || [scConfig.defaultLanguage || 'en']).filter(
    (l) => l !== 'default',
  );
  const sitesForPaths = Array.from(new Set([...siteNames, DEFAULT_SITE_NAME])).filter(Boolean);

  // Fetch Sitecore page paths (includes product wildcard paths from Sitecore)
  if (process.env.NODE_ENV !== 'development' && scConfig.generateStaticPaths) {
    try {
      const sitecorePaths = await client.getPagePaths(sitesForPaths, locales);

      // Normalize all paths to lowercase to match Next.js file generation
      const normalizedSitecorePaths = sitecorePaths.map((path) => ({
        ...path,
        params: {
          ...path.params,
          path: Array.isArray(path.params.path)
            ? path.params.path.map((segment) => segment.toLowerCase())
            : path.params.path,
        },
      }));
      // Include all paths — products handled in getStaticProps (page first, then product fallback)

      paths = [...paths, ...normalizedSitecorePaths];
    } catch {
      // Static paths fetch failed
    }

    fallback = process.env.EXPORT_MODE ? false : fallback;
  } else {
    // In development, use blocking fallback to generate pages on-demand
    fallback = 'blocking';
  }

  return {
    paths,
    fallback,
  };
};

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation (or fallback) is enabled and a new request comes in.
export const getStaticProps: GetStaticProps = async (context) => {
  try {
    let props = {};
    let path = extractPath(context);
    const params = context.params || {};

    let page: Page | null = null;

    const locale =
      (context.locale === 'default' ? 'en' : context.locale) || scConfig.defaultLanguage;
    const siteName = getSiteNameFromParams(params, locale) || DEFAULT_SITE_NAME;

    // Strip the localized site segment from the path before querying Sitecore.
    // The first path segment may be a site name (workwear, healthcare) or a localized
    // equivalent (arbeitskleidung, vetements-de-travail). Sitecore expects the content
    // path within the site, not the URL prefix.
    // e.g. "arbeitskleidung/core-solutions" → "core-solutions" (for site "workwear")
    //      "workwear/core-solutions"        → "core-solutions"
    //      "arbeitskleidung"                → "/" (site homepage)
    {
      const segments = path.split('/').filter(Boolean);
      const firstSegment = segments[0]?.toLowerCase();
      if (firstSegment && (siteNameSet.has(firstSegment) || resolveSiteFromSegment(firstSegment))) {
        path = segments.slice(1).join('/') || '/';
      }
    }
    const isPageBuilderMode = !!context.preview || isDesignLibraryPreviewData(context.previewData);
    const rawPathArray = Array.isArray(params.path)
      ? params.path
      : params.path
        ? [params.path]
        : [];
    const normalizedPagePath = (path || rawPathArray.join('/')).replace(/^\/*/, '/') || '/';

    // 1. Try getPage first (page-first logic — real Sitecore pages under products folder)
    if (isPageBuilderMode) {
      try {
        if (context.preview && isDesignLibraryPreviewData(context.previewData)) {
          page = await client.getDesignLibraryData(context.previewData);
        } else {
          page = context.preview
            ? await client.getPreview(context.previewData)
            : await client.getPage(path, { locale, site: siteName });
        }
      } catch {
        // Page not found
      }
    } else {
      try {
        page = await client.getPage(normalizedPagePath, { locale, site: siteName });
      } catch {
        // Path not found in Sitecore
      }
    }

    let product: ProductData | null = null;
    let localizedProductSlugs: Record<string, string> | null = null;

    if (page) {
      // Inject virtualFolder for client-side Link handling
      if (page.layout?.sitecore?.context?.site) {
        if (siteName === 'workwear') {
          (page.layout.sitecore.context.site as any).virtualFolder = '/workwear';
        } else if (siteName === 'healthcare') {
          (page.layout.sitecore.context.site as any).virtualFolder = '/healthcare';
        }
      }

      // Enrich with product meta when it's a product page (from wildcard) and product exists in Content Hub
      const productId = extractProductIdFromPath(normalizedPagePath);
      if (productId && isProductPath(normalizedPagePath)) {
        try {
          const productResult = await fetchProductByIdWithSlugs(productId, locale);
          product = productResult?.product ?? null;
          localizedProductSlugs = productResult?.localizedSlugs ?? null;
          if (product && page.layout?.sitecore?.route?.fields) {
            const stripHtml = (html?: string): string =>
              html
                ? html
                    .replace(/<[^>]*>/g, '')
                    .replace(/\s+/g, ' ')
                    .trim()
                : '';
            const productName = stripHtml(product.h1 || product.title || '') || productId;
            const ogTitle = `${productName} | CWS Workwear`;
            const ogDescription = stripHtml(product.fullDescription || '');
            const ogImage =
              product?.images?.[0] ||
              product?.colorVariants?.find((v) => v?.images?.length)?.images?.[0] ||
              product?.colorVariants?.find((v) => v?.image)?.image ||
              '';
            const routeFields = page.layout.sitecore.route.fields as Record<string, unknown>;
            routeFields.Title = { value: ogTitle };
            routeFields.MetaTitle = { value: ogTitle };
            routeFields.MetaDescription = { value: ogDescription };
            routeFields.OGTitle = { value: ogTitle };
            routeFields.OGDescription = { value: ogDescription };
            routeFields.PageIdentifier = { value: 'product-page' };
            if (ogImage) routeFields.OGImage = { value: { src: ogImage, alt: productName } };
            if (localizedProductSlugs) {
              routeFields.ProductLocalizedSlugs = { value: JSON.stringify(localizedProductSlugs) };
            }
          }
        } catch {
          // ignore
        }
      }

      const componentProps = await client.getComponentData(page.layout, context, components);
      if (product) {
        if (!componentProps['product-detail-component']) {
          componentProps['product-detail-component'] = {};
        }
        (componentProps['product-detail-component'] as Record<string, unknown>).initialProductData =
          product;
      }

      props = {
        page,
        dictionary: await client.getDictionary({
          site: page.siteName,
          locale: page.locale,
        }),
        componentProps,
        productDetail: product,
      };
    }

    // 2. If no page and path contains products, try Content Hub (product fallback)
    if (!page && isProductPath(normalizedPagePath)) {
      const productId = extractProductIdFromPath(normalizedPagePath);
      if (productId) {
        try {
          const productResult = await fetchProductByIdWithSlugs(productId, locale);
          product = productResult?.product ?? null;
          localizedProductSlugs = productResult?.localizedSlugs ?? null;
        } catch {
          // ignore
        }
        if (product) {
          const baseLayout = await fetchBasePageForLayout(locale, siteName, normalizedPagePath);
          page = createProductPage(
            normalizedPagePath,
            locale,
            siteName,
            productId,
            baseLayout,
            product,
            localizedProductSlugs,
          );
          const componentProps = await client.getComponentData(page.layout, context, components);
          if (!componentProps['product-detail-component']) {
            componentProps['product-detail-component'] = {};
          }
          (
            componentProps['product-detail-component'] as Record<string, unknown>
          ).initialProductData = product;
          props = {
            page,
            dictionary: await client.getDictionary({ site: siteName, locale }),
            componentProps,
            productDetail: product,
          };
        }
      }
    }

    // 3. If still no page, try Sitecore 404
    if (!page) {
      try {
        page = await client.getPage('/404', { locale, site: siteName });
      } catch {
        // 404 page fetch failed
      }
      if (!page) {
        return { props: {}, notFound: true as const, revalidate: 5 };
      }

      // Populate props for the 404 page so it renders with header/footer/dictionary
      const componentProps = await client.getComponentData(page.layout, context, components);
      props = {
        page,
        dictionary: await client.getDictionary({
          site: page.siteName,
          locale: page.locale,
        }),
        componentProps,
      };
    }

    const result = {
      props,
      // Next.js will attempt to re-generate the page:
      // - When a request comes in
      // - At most once every 5 seconds
      revalidate: 5, // In seconds
    };

    return result;
  } catch {
    // Return 404 on error
    return {
      props: {},
      notFound: true,
      revalidate: 5,
    };
  }
};

export default SitecorePage;

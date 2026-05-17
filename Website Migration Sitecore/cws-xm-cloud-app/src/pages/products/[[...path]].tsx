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

interface ProductPageProps extends SitecorePageProps {
  productDetail?: ProductData | null;
}

const siteNames = Array.from(new Set(sites.map((site: SiteInfo) => site.name).filter(Boolean))).map(
  (name) => name.toLowerCase(),
);
const DEFAULT_SITE_NAME = (
  process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME ||
  process.env.SITECORE_SITE_NAME ||
  siteNames[0] ||
  'workwear'
)
  .trim()
  .toLowerCase();

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
  ].map((segment) => segment.toLowerCase()),
);

const normalizeSiteName = (siteName?: string): string | undefined => {
  if (!siteName) return undefined;
  const key = siteName.toLowerCase();
  if (WORKWEAR_PATH_SEGMENTS.has(key)) return 'workwear';
  return key;
};

const getProductPathSegments = (context: Parameters<GetStaticProps>[0]): string[] => {
  const params = context.params as { path?: string[] | string } | undefined;
  if (!params?.path) return [];
  return Array.isArray(params.path) ? params.path : [params.path];
};

const getSiteCandidates = (
  requestedSiteName?: string,
  normalizedSiteName?: string,
): string[] => {
  const unique = new Set<string>();
  const candidates: string[] = [];

  if (normalizedSiteName) {
    unique.add(normalizedSiteName);
    candidates.push(normalizedSiteName);
  }
  if (requestedSiteName) {
    const lowerRequested = requestedSiteName.toLowerCase();
    if (!unique.has(lowerRequested)) {
      unique.add(lowerRequested);
      candidates.push(lowerRequested);
    }
  }
  if (!unique.has(DEFAULT_SITE_NAME)) {
    candidates.push(DEFAULT_SITE_NAME);
  }
  return candidates;
};

function getFieldStringValue(field: unknown): string | undefined {
  if (!field || typeof field !== 'object' || !('value' in field)) return undefined;
  const value = (field as { value?: unknown }).value;
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function ensureProductPageIdentifier(page: Page | null): void {
  const route = page?.layout?.sitecore?.route;
  if (!route) return;
  const routeFields = ((route.fields as Record<string, unknown> | undefined) ??=
    {} as Record<string, unknown>);
  routeFields.PageIdentifier = { value: 'product-page' };
}

async function fetchBasePageForLayout(
  locale: string,
  siteName: string,
  currentPath?: string,
): Promise<{ header?: ComponentRendering[]; footer?: ComponentRendering[]; fields?: any } | null> {
  const defaultBase =
    process.env.PRODUCT_BASE_PAGE_PATH || process.env.NEXT_PUBLIC_PRODUCT_BASE_PAGE_PATH || '/products';
  const candidatePaths: string[] = [
    defaultBase,
    '/products/-w-',
    '/workwear/products/-w-',
    '/Home/products/-w-',
    '/workwear/products',
    '/products',
    '/Home/products',
  ].filter((p, i, arr) => arr.indexOf(p) === i);
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
    html ? html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '';
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
  const cleanPath = path.split('/').filter((s) => s && !s.startsWith('_site_')).join('/');
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
            MetaType: { value: 'product' },
            MetaTitle: { value: ogTitle },
            MetaDescription: { value: ogDescription },
            OGTitle: { value: ogTitle },
            OGDescription: { value: ogDescription },
            PageIdentifier: { value: 'product-page' },
            OGURL: { value: currentUrl },
            OGImage: ogImage ? { value: { src: ogImage, alt: productName } } : undefined,
            ...(localizedSlugs && { ProductLocalizedSlugs: { value: JSON.stringify(localizedSlugs) } }),
          },
          placeholders,
        },
      },
    },
    siteName,
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

const SitecorePage = ({ page, notFound, componentProps, productDetail }: ProductPageProps): JSX.Element => {
  useEffect(() => {
    handleEditorFastRefresh();
  });

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

export const getStaticPaths: GetStaticPaths = async (context) => {
  let paths: StaticPath[] = [];
  let fallback: boolean | 'blocking' = 'blocking';

  if (process.env.NODE_ENV !== 'development' && scConfig.generateStaticPaths) {
    try {
      const allPaths = await client.getPagePaths(
        sites.map((site: SiteInfo) => site.name),
        context?.locales || [],
      );
      // Filter for product paths: path contains 'products' (matches Sitecore Home/products/*)
      paths = allPaths
        .filter((p) => {
          const arr = Array.isArray(p.params.path) ? p.params.path : [p.params.path];
          const hasProducts = arr.some((s) => String(s).toLowerCase() === 'products');
          return hasProducts && !arr.some((s) => String(s).includes('_site_'));
        })
        .map((p) => {
          const arr = Array.isArray(p.params.path) ? p.params.path : [p.params.path];
          const productsIndex = arr.findIndex((s) => String(s).toLowerCase() === 'products');
          const pathAfterProducts = productsIndex >= 0 ? arr.slice(productsIndex + 1) : arr;
          return {
            ...p,
            params: {
              ...p.params,
              path: pathAfterProducts.map((s) => String(s).toLowerCase()),
            },
          };
        });
    } catch (error) {
      console.error('[products] Error fetching static paths:', error);
    }
    fallback = process.env.EXPORT_MODE ? false : fallback;
  }

  return { paths, fallback };
};

export const getStaticProps: GetStaticProps = async (context) => {
  let page: Page | null = null;
  let product: ProductData | null = null;
  let localizedProductSlugs: Record<string, string> | null = null;

  const pathSegments = getProductPathSegments(context);
  const path = extractPath(context);
  const siteName = DEFAULT_SITE_NAME;
  const siteCandidates = getSiteCandidates(undefined, siteName);

  const productSlug = pathSegments.join('/');
  const productId = extractProductIdFromPath(`/products/${productSlug}`) || pathSegments[pathSegments.length - 1]?.replace(/-\d+$/, '');

  // Sitecore path candidates: wildcard is under Home/products/* (no slug logic)
  const pagePathCandidates = productSlug
    ? [
        `/products/${productSlug}`,
        `/workwear/products/${productSlug}`,
        `/Home/products/${productSlug}`,
      ]
    : ['/products', '/workwear/products', '/Home/products'];

  const wildcardPathCandidates = [
    '/products/-w-',
    '/workwear/products/-w-',
    '/Home/products/-w-',
  ];

  if (context.preview && isDesignLibraryPreviewData(context.previewData)) {
    page = await client.getDesignLibraryData(context.previewData);
  } else {
    if (context.preview) {
      page = await client.getPreview(context.previewData);
    } else {
      for (const siteCandidate of siteCandidates) {
        for (const pagePath of pagePathCandidates) {
          try {
            page = await client.getPage(pagePath, {
              locale: context.locale,
              site: siteCandidate,
            });
            if (page) break;
          } catch {
            // continue
          }
        }
        if (page) break;
      }
    }

    if (!page && !context.preview) {
      for (const siteCandidate of siteCandidates) {
        for (const wildcardPath of wildcardPathCandidates) {
          try {
            page = await client.getPage(wildcardPath, {
              locale: context.locale,
              site: siteCandidate,
            });
            if (page) break;
          } catch {
            // continue
          }
        }
        if (page) break;
      }
    }
  }

  if (page && productId) {
    try {
      const productResult = await fetchProductByIdWithSlugs(productId, context.locale);
      product = productResult?.product ?? null;
      localizedProductSlugs = productResult?.localizedSlugs ?? null;

      if (product && page.layout?.sitecore?.route?.fields) {
        ensureProductPageIdentifier(page);
        const stripHtml = (html?: string): string =>
          html ? html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() : '';
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
        routeFields.MetaType = { value: 'product' };
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
    } catch (error: any) {
      console.error('[products] Error fetching product:', error?.message);
    }
  }

  const sitecoreProductPath = productSlug ? `/products/${productSlug}` : '/products';

  if (!page && productId) {
    try {
      const productResult = await fetchProductByIdWithSlugs(productId, context.locale);
      product = productResult?.product ?? null;
      localizedProductSlugs = productResult?.localizedSlugs ?? null;
    } catch {
      // ignore
    }

    if (product) {
      const baseLayout = await fetchBasePageForLayout(
        context.locale || 'en',
        siteName,
        sitecoreProductPath,
      );
      page = createProductPage(
        sitecoreProductPath,
        context.locale || 'en',
        siteName,
        productId,
        baseLayout,
        product,
        localizedProductSlugs,
      );
    } else {
      try {
        page = await client.getPage('/404', { locale: context.locale, site: siteName });
      } catch {
        // ignore
      }
    }
  }

  if (!page) {
    return { props: {}, notFound: true as const, revalidate: 5 };
  }

  const componentProps = await client.getComponentData(page.layout, context, components);
  if (product) {
    if (!componentProps['product-detail-component']) {
      componentProps['product-detail-component'] = {};
    }
    (componentProps['product-detail-component'] as Record<string, unknown>).initialProductData = product;
  }

  return {
    props: {
      page,
      dictionary: await client.getDictionary({ site: page.siteName, locale: page.locale }),
      componentProps,
      productDetail: product,
    },
    revalidate: 5,
  };
};

export default SitecorePage;

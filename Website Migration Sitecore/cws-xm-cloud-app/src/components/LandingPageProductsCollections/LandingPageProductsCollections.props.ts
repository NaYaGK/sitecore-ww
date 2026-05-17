import type { ComponentProps } from '@/lib/component-props';

/** Sitecore product variant: color text + color image for the dropdown */
export interface SitecoreProductVariant {
  /** Color name for the dropdown */
  variant?: { value?: string };
  colors?: { value?: string };
  /** Image for this color variant */
  image?: { jsonValue?: { value?: { src?: string } } };
  colorImages?: { jsonValue?: { value?: { src?: string } } } | { href?: string; url?: string };
  imageLink?: { href?: string; url?: string } | string | null;
}

/** Sitecore product: title, description, optional image, productVariants (colorImages + colors) */
export interface SitecoreProduct {
  title?: { value?: string };
  description?: { value?: string };
  image?: { jsonValue?: { value?: { src?: string } } };
  productVariants?: { targetItems?: SitecoreProductVariant[] };
}

/** Sitecore tab item in tabs.targetItems */
export interface SitecoreTabItem {
  title?: { value?: string };
  description?: { value?: string };
  image?: { jsonValue?: { value?: { src?: string; alt?: string } } };
  products?: { targetItems?: SitecoreProduct[] };
}

/** Internal product item shape for rendering */
export interface ProductVariantOption {
  key: string;
  label: string;
  imageSrc?: string;
}

/** Internal product item shape for rendering */
export interface ProductItem {
  name: string;
  imgSrc: string;
  highlights: string[];
  defaultColor: string;
  defaultVariantKey?: string;
  colors: string[];
  colorImages?: Record<string, string>;
  variantOptions?: ProductVariantOption[];
}

/** Internal collection tab shape for rendering */
export interface CollectionTab {
  label: string;
  description: string;
  mainImage: { src: string; alt: string };
  products: ProductItem[];
}

/** Sitecore datasource shape */
export interface LandingPageProductsCollectionsDatasource {
  title?: { value?: string };
  tabs?: { targetItems?: SitecoreTabItem[] };
}

export interface LandingPageProductsCollectionsProps extends ComponentProps {
  fields?: {
    data?: {
      datasource?: LandingPageProductsCollectionsDatasource;
    };
  };
}

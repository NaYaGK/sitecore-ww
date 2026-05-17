import type { ComponentProps } from '@/lib/component-props';

export interface TopPickVariant {
  key: string;
  color: string;
  imageSrc: string;
}

export interface TopPickProduct {
  name: string;
  imgSrc: string;
  highlights: string[];
  defaultColor: string;
  defaultVariantKey: string;
  variants: TopPickVariant[];
}

export interface TopPickHotspot {
  top: string;
  left: string;
  width: string;
  height: string;
  productIndex: number;
}

export interface LandingPageProductsTopPicksDatasource {
  title?: { value?: string };
  lifestyleImage?: { jsonValue?: { value?: { src?: string; alt?: string } } };
  products?: { targetItems?: Array<Record<string, unknown>> };
  hotspots?: { targetItems?: Array<Record<string, unknown>> };
}

export interface LandingPageProductsTopPicksProps extends ComponentProps {
  fields?: {
    data?: {
      datasource?: LandingPageProductsTopPicksDatasource | Record<string, unknown>;
    };
    datasource?: LandingPageProductsTopPicksDatasource | Record<string, unknown>;
  };
}

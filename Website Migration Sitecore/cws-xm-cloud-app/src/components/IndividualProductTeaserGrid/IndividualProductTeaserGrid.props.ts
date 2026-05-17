import { Field, ImageField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

interface AttributeItem {
  id?: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Attribute?: {
      value?: string;
      jsonValue?: Field<string>;
    };
  };
}

interface ProductItem {
  id?: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Title?: {
      value?: string;
      jsonValue?: Field<string>;
    };
    Image?: {
      value?: ImageField['value'];
      jsonValue?: ImageField;
    };
    Attributes?: AttributeItem[];
  };
}

interface ProductTeaserGridDatasource {
  sectionTitle?: {
    value?: string;
    jsonValue?: Field<string>;
  };
  SectionTitle?: {
    value?: string;
    jsonValue?: Field<string>;
  };
  Products?:
    | ProductItem[]
    | {
        targetItems?: ProductItem[];
      };
}

export interface ProductTeaserGridFields {
  data?: {
    datasource?: ProductTeaserGridDatasource;
  };
  // Also support fields being an array directly
  [key: number]: ProductItem;
}

export interface ProductTeaserGridProps extends ComponentProps {
  fields: ProductTeaserGridFields | ProductItem[];
}


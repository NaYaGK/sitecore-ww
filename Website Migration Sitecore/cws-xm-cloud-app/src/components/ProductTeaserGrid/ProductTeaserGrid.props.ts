import { Field, ImageField, LinkField, RichTextField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

interface ProductTeaserGridItem {
  id?: string;
  name?: string;
  displayName?: string;
  url?: string;
  fields?: {
    Title?: {
      value?: string;
      jsonValue?: Field<string>;
    };
    Description?: {
      value?: string;
      jsonValue?: RichTextField;
    };
    Image?: {
      value?: ImageField['value'];
      jsonValue?: ImageField;
    };
    Link?: {
      value?: LinkField['value'];
      jsonValue?: LinkField;
    };
  };
}

interface ProductTeaserGridViewDatasource {
  Title?: {
    value?: string;
    jsonValue?: Field<string>;
  };
   Description?: {
    value?: string;
    jsonValue?: RichTextField;
  };
  SubTitle?: {
    value?: string;
    jsonValue?: RichTextField;
  };
  Items?: ProductTeaserGridItem[] | {
    targetItems?: ProductTeaserGridItem[];
  };
  Link?: {
    value?: LinkField['value'];
    jsonValue?: LinkField;
  };
}

export interface ProductTeaserGridViewFields {
  data?: {
    datasource?: ProductTeaserGridViewDatasource;
  };
}

export interface ProductTeaserGridProps extends ComponentProps {
  fields: ProductTeaserGridViewFields;
}


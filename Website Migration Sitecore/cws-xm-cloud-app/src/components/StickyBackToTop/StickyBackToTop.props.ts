import { Field, ImageField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

interface StickyBackToTopDatasource {
  directionIcon?: {
    jsonValue?: ImageField;
  };
  theme?: {
    jsonValue?: Field<string>;
  };
}

export interface StickyBackToTopFields {
  data?: {
    datasource?: StickyBackToTopDatasource;
  };
}

export interface StickyBackToTopProps extends ComponentProps {
  fields: StickyBackToTopFields;
}


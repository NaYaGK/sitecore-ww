// @ts-nocheck
import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

interface IndustrySectorTeaserDatasource {
  title?: {
    jsonValue?: Field<string>;
  };
  caption?: {
    jsonValue?: Field<string>;
  };
  image?: {
    jsonValue?: ImageField;
  };
  link?: {
    jsonValue?: LinkField;
  };
}

export interface IndustrySectorTeaserFields {
  data?: {
    datasource?: IndustrySectorTeaserDatasource;
  };
}

export interface IndustrySectorTeaserProps extends ComponentProps {
  fields: IndustrySectorTeaserFields;
  itemCount?: number;
}

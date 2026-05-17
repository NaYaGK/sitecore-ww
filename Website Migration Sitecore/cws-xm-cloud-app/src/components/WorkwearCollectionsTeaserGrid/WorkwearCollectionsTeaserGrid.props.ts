// @ts-nocheck
import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

export interface WorkwearCollectionItem {
  id?: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields: {
    Title: Field<string>;
    image: ImageField;
    CTAText: Field<string>;
    CTALink: LinkField;
  };
}

export interface WorkwearCollectionsTeaserGridDatasource {
  Title?: Field<string>;
  ProductListing?: WorkwearCollectionItem[];
}

export interface WorkwearCollectionsTeaserGridFields {
  data?: {
    datasource?: WorkwearCollectionsTeaserGridDatasource;
  };
}

export interface WorkwearCollectionsTeaserGridProps extends ComponentProps {
  fields: WorkwearCollectionsTeaserGridFields;
  className?: string;
}

import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

export interface CategoryItem {
  id: string;
  fields: {
    Title: { jsonValue: Field<string> };
    CTALink: { jsonValue: LinkField };
    AltText: { jsonValue: Field<string> };
    Caption: { jsonValue: Field<string> };
    Image: { jsonValue: ImageField };
  };
}

export interface CategoryListingFields {
  data: {
    datasource: {
      Title: { jsonValue: Field<string> };
      Description: { jsonValue: Field<string> };
      CategoryItem: { targetItems: CategoryItem[] };
    };
  };
}

export interface CategoryListingProps extends ComponentProps {
  fields: CategoryListingFields;
  className?: string;
}
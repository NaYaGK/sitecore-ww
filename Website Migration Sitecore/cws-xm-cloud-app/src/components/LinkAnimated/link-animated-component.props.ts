import { ComponentProps } from '@/lib/component-props';
import { Field, ImageField, RichTextField } from '@sitecore-content-sdk/nextjs';

export interface LinkAnimatedItem {
  id: string;
  fields: {
    Title: { jsonValue: Field<string> };
    Description: { jsonValue: RichTextField };
  };
}

export interface LinkAnimatedComponentFields {
  data: {
    datasource: {
      HeaderTitle: { jsonValue: Field<string> };
      MainImage: { jsonValue: ImageField };
      ItemList: { targetItems: LinkAnimatedItem[] };
    };
  };
}

export interface LinkAnimatedComponentProps extends ComponentProps {
  fields: LinkAnimatedComponentFields;
  className?: string;
}

import { Field, ImageField, RichTextField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

export interface CardComponentProps extends ComponentProps {
  fields: {
    Image: ImageField;
    Title: Field<string>;
    Description: RichTextField;
  };
}


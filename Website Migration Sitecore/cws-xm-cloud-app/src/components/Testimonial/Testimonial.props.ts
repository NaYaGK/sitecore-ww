import type { Field, ImageField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

export interface TestimonialProps extends ComponentProps {
  fields: {
    Title: Field<string>;
    Name: Field<string>;
    Author?: Field<string>;
    Image: ImageField;
  };
}


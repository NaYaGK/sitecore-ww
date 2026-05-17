import type { ImageField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

export interface ImageComponentFields {
  Image: ImageField;
}

export interface ImageComponentProps extends ComponentProps {
  className?: string;
  fields: ImageComponentFields;
}


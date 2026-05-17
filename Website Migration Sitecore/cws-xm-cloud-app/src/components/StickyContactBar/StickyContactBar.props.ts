// @ts-nocheck
import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

export interface StickyContactBarFields {
  PhoneNumber?: Field<string>;
  Title?: Field<string>;
}

export interface StickyContactBarProps extends ComponentProps {
  fields: StickyContactBarFields;
}

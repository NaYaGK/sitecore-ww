import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

export interface LogoItem {
  id: string;
  url: string;
  name: string;
  displayName: string;
  fields: {
    Image?: ImageField;
    AltText?: Field<string>;
    Link?: LinkField;
  };
}

export interface LogosFields {
  Title?: {
    value: string;
  };
  Logos?: LogoItem[];
}

export interface LogosProps extends ComponentProps {
  fields: LogosFields;
}


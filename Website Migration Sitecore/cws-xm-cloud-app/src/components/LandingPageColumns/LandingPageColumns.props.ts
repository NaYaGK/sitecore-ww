// src/components/LandingPageColumns/LandingPageColumns.props.ts
import type { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import type { ComponentProps } from '@/lib/component-props';

export interface LandingPageColumnItem {
  id?: string;
  name?: string;
  displayName?: string;
  fields: {
    Title?: Field<string>;
    Description?: Field<string>;
    Coloumimage?: ImageField; // Note: This field has a typo to match the data
  };
}

export interface LandingPageColumnsFields {
  Title?: Field<string>;
  LandingColumnsItems?:
    | {
        targetItems?: LandingPageColumnItem[];
        results?: LandingPageColumnItem[];
        children?: LandingPageColumnItem[];
      }
    | LandingPageColumnItem[];
}

export interface LandingPageColumnsProps extends ComponentProps {
  fields: {
    data?: {
      datasource?: LandingPageColumnsFields;
    };
  } & LandingPageColumnsFields;
}

import { Field, ImageField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

export interface CycleStepItem {
  id?: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Icon?: {
      value?: ImageField['value'];
    };
    Description?: {
      value?: string;
    };
    Title?: {
      value?: string;
    };
  };
}

export interface CircularAnimationComponentFields {
  Title?: Field<string>;
  Steps?: CycleStepItem[];
}

export interface CircularAnimationComponentProps extends ComponentProps {
  fields: CircularAnimationComponentFields;
}

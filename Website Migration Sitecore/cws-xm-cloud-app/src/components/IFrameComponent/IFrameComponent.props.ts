import type { Field } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

export interface IFrameComponentFields {
  IFrame?: {
    value?: string;
    jsonValue?: Field<string>;
  };
}

export interface IFrameComponentProps extends ComponentProps {
  className?: string;
  fields: IFrameComponentFields;
}

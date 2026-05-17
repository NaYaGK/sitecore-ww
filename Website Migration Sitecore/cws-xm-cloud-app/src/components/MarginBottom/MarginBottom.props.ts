import type { ComponentRendering, ComponentParams, Field } from '@sitecore-content-sdk/nextjs';

export interface MarginBottomFields {
  MarginBottom?: { jsonValue?: Field<string>; value?: string };
}

export type MarginBottomProps = {
  rendering?: ComponentRendering & { params?: ComponentParams };
  params?: ComponentParams;
  fields?: MarginBottomFields & {
    data?: {
      datasource?: MarginBottomFields;
    };
  };
};

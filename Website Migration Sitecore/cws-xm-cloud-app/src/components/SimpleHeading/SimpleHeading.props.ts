// @ts-nocheck
import type { Field } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

export interface SimpleHeadingDatasource {
  headingText?: {
    jsonValue?: Field<string>;
  };
  headingLevel?: {
    jsonValue?: Field<string>;
  };
}

export interface SimpleHeadingFields {
  data?: {
    datasource?: SimpleHeadingDatasource;
  };
}

export interface SimpleHeadingProps extends ComponentProps {
  className?: string;
  fields: SimpleHeadingFields;
}

import { Field, ImageField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

interface AttributeItem {
  id?: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Attribute?: {
      value?: string;
      jsonValue?: Field<string>;
    };
  };
}

interface IndividualProductsDisplayDatasource {
  Title?: {
    value?: string;
    jsonValue?: Field<string>;
  };
  Image?: {
    value?: ImageField['value'];
    jsonValue?: ImageField;
  };
  Attributes?: AttributeItem[];
}

export interface IndividualProductsDisplayFields {
  data?: {
    datasource?: IndividualProductsDisplayDatasource;
  };
}

export interface IndividualProductsDisplayProps extends ComponentProps {
  fields: IndividualProductsDisplayFields;
}


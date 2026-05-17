import { Field, LinkField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

interface GlobalFooterLinkItem {
  id?: string;
  name?: string;
  displayName?: string;
  url?: string;
  fields?: {
    Link?: {
      value?: LinkField['value'];
      jsonValue?: LinkField;
    };
    'Link Text'?: {
      value?: string;
      jsonValue?: Field<string>;
    };
  };
}

interface GlobalFooterDatasource {
  Copyright?: {
    value?: string;
    jsonValue?: Field<string>;
  };
  Items?: GlobalFooterLinkItem[] | {
    targetItems?: GlobalFooterLinkItem[];
  };
}

export interface GlobalFooterFields {
  data?: {
    datasource?: GlobalFooterDatasource;
  };
}

export interface GlobalFooterProps extends ComponentProps {
  className?: string;
  fields: GlobalFooterFields;
}

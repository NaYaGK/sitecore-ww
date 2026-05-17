// @ts-nocheck
import { Field, LinkField, LinkFieldValue } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

interface LinkItem {
  id?: string;
  uid?: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Icon?: {
      value?: string;
    };
    Link?: (LinkField | LinkFieldValue) & {
      editable?: any;
      jsonValue?: LinkField;
      value?: {
        href?: string;
        text?: string;
        linktype?: string;
        url?: string;
        anchor?: string;
        target?: string;
        description?: string;
      };
    };
    LinkText?: {
      jsonValue?: Field<string>;
      value?: string;
    };
    Text?: {
      jsonValue?: Field<string>;
      value?: string;
    };
  };
}

interface LinkListDatasource {
  Title?: {
    jsonValue?: Field<string>;
    value?: string;
  };
  Items?: LinkItem[];
}

export interface LinkListFields {
  data?: {
    datasource?: LinkListDatasource;
  };
  Title?: {
    jsonValue?: Field<string>;
    value?: string;
  };
  Items?: LinkItem[];
}

export interface LinkListProps extends ComponentProps {
  fields: LinkListFields;
}

import { Field, ImageField, LinkField, RichTextField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

interface HorizontalCardItem {
  id?: string;
  name?: string;
  displayName?: string;
  url?: string;
  fields?: {
    Title?: {
      value?: string;
      jsonValue?: Field<string>;
    };
    Description?: {
      value?: string;
      jsonValue?: RichTextField;
    };
    Image?: {
      value?: ImageField['value'];
      jsonValue?: ImageField;
    };
    Link?: {
      value?: LinkField['value'];
      jsonValue?: LinkField;
    };
    ImageLeftPosition?: {
      value?: string;
      jsonValue?: Field<string>;
    };
  };
}

interface HorizontalCardsViewDatasource {
  Title?: {
    value?: string;
    jsonValue?: Field<string>;
  };
  Description?: {
    value?: string;
    jsonValue?: RichTextField;
  };
  Items?: HorizontalCardItem[] | {
    targetItems?: HorizontalCardItem[];
  };
  Link?: {
    value?: LinkField['value'];
    jsonValue?: LinkField;
  };
}

export interface HorizontalCardsViewFields {
  data?: {
    datasource?: HorizontalCardsViewDatasource;
  };
}

export interface HorizontalCardsProps extends ComponentProps {
  fields: HorizontalCardsViewFields;
}


import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

interface SocialAccountItem {
  id?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Icon?: {
      value?: ImageField['value'];
      jsonValue?: ImageField;
    };
    Link?: {
      value?: LinkField['value'];
      jsonValue?: LinkField;
    };
  };
}

interface FooterSocialAccountsDatasource {
  Items?: {
    targetItems?: SocialAccountItem[];
  };
}

export interface FooterSocialAccountsFields {
  data?: {
    datasource?: FooterSocialAccountsDatasource;
  };
}

export interface FooterSocialAccountsProps extends ComponentProps {
  className?: string;
  fields: FooterSocialAccountsFields;
}


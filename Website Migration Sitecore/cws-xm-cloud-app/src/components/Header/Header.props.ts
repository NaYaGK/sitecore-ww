import type { ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

export interface HeaderLinkField {
  link?: LinkField;
}

export interface HeaderNavigationNode {
  title?: {
    value?: string | null;
  };
  link?: HeaderLinkField;
  children?: {
    results?: HeaderNavigationNode[];
  };
}

interface HeaderLanguage {
  name?: {
    value?: string;
  };
  code?: {
    value?: string;
  };
  selected?: {
    value?: boolean;
  };
  flagSvg?: {
    value?: string;
  };
  flagColor?: {
    value?: string;
  };
}

interface HeaderMobileLink {
  title?: {
    value?: string;
  };
  link?: {
    link?: LinkField;
  };
}

interface HeaderDatasource {
  ContactLabel?: {
    value?: string;
  };
  logo?: {
    jsonValue?: ImageField;
  };
  children?: {
    results?: HeaderNavigationNode[];
  };
  languages?: {
    results?: HeaderLanguage[];
  };
  mobileFooterLinks?: {
    results?: HeaderMobileLink[];
  };
  customerPortalLink?: {
    link?: LinkField;
  };
  contactButtonText?: {
    value?: string;
  };
  backButtonText?: {
    value?: string;
  };
  openSearchAriaLabel?: {
    value?: string;
  };
  closeMenuAriaLabel?: {
    value?: string;
  };
  openMenuAriaLabel?: {
    value?: string;
  };
  backToNavigationAriaLabel?: {
    value?: string;
  };
}

export interface HeaderFields {
  data?: {
    ContactLabel?: {
      value?: string;
    };
    datasource?: HeaderDatasource;
  };
}

export interface HeaderProps extends ComponentProps {
  fields: HeaderFields;
  contactFormId?: string;
}

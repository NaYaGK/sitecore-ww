import { Field, LinkField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

export interface FooterProps extends ComponentProps {
  className?: string;
  fields?: {
    data?: {
      datasource?: FooterDatasource;
    };
    datasource?: FooterDatasource;
  } & Partial<FooterDatasource>;
}

interface FooterLink {
  link?: {
    link?: {
      value?: {
        text?: string;
        href?: string;
        anchor?: string;
        linktype?: string;
        class?: string;
        title?: string;
        target?: string;
        querystring?: string;
        id?: string;
      };
    };
  };
}

interface FooterLinkGroup {
  title?: {
    value?: string;
  };
  children?: {
    results?: FooterLink[];
  };
}

export interface FooterDatasource {
  phoneNumber?: {
    value?: string;
  };
  workingHours?: {
    value?: string;
  };
  messageLabel?: {
    value?: string;
  };
  Title?: {
    value?: string;
  };
  pressContact?: {
    value?: string;
  };
  prAgency?: {
    value?: string;
  };
  copyright?: {
    value?: string | null;
  } | null;
  children?: {
    results?: FooterLinkGroup[];
  };
}

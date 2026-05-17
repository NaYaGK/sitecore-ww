// @ts-nocheck
import { Field, LinkField, RichTextField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

export interface DialogContentItem {
  id?: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    content?: {
      jsonValue?: RichTextField;
    };
  };
}

interface DialogPopupLinkDatasource {
  linkText?: {
    jsonValue?: Field<string>;
  };
  destinationLink?: {
    jsonValue?: LinkField;
  };
  dialogContentItem?: {
    jsonValue?: DialogContentItem;
  };
  trackingEventName?: {
    jsonValue?: Field<string>;
  };
}

export interface DialogPopupLinkFields {
  data?: {
    datasource?: DialogPopupLinkDatasource;
  };
}

export interface DialogPopupLinkProps extends ComponentProps {
  fields: DialogPopupLinkFields;
}


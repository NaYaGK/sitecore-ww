// @ts-nocheck
import { Field, ImageField, LinkField, RichTextField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

export interface EntityReferenceItemFields {
  Title?: {
    value?: string;
  };
  Description?: {
    value?: string;
  };
  Image?: {
    value?: {
      src?: string;
      alt?: string;
      width?: string;
      height?: string;
    };
  };
  Link?: {
    value?: {
      href?: string;
      text?: string;
    };
  };
  LeftAligned?: {
    value?: boolean;
  };
  Caption?: {
    value?: string;
    jsonValue?: {
      value?: string;
    };
  };
}

export interface EntityReferenceItem {
  id?: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: EntityReferenceItemFields;
}

export interface EntityReferenceFields {
  Title?: {
    value?: string;
  };
  SubTitle?: {
    value?: string;
  };
  Description?: {
    value?: string;
  };
  Items?: EntityReferenceItem[];
}

export interface EntityReferenceProps extends ComponentProps {
  fields: EntityReferenceFields;
}

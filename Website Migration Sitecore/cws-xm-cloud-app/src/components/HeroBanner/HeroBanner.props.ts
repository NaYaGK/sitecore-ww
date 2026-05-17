import {
  ImageField,
  RichTextField,
  TextField,
  LinkField,
  ComponentParams,
} from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

export interface HeroBannerFields {
  Image: ImageField;
  Title?: TextField;
  Text: RichTextField;
  Link?: LinkField;
  ShowArrow?: { value: boolean };
  IsShowModel?: { value: boolean };
  ButtonColor?: {
    id?: string;
    url?: string;
    name?: string;
    displayName?: string;
    fields?: {
      Value?: { value?: string | number };
      IsVerifiedStyle?: { value?: boolean };
      'Allowed Renderings'?: any[];
      Icon?: { value?: string };
    };
  };
}

export interface HeroBannerProps extends Omit<ComponentProps, 'params'> {
  fields: HeroBannerFields;
  params?: {
    Styles?: string;
    RenderingIdentifier?: string;
  };
}

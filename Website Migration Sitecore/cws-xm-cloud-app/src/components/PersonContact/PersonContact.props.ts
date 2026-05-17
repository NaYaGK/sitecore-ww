import {
  ImageField,
  LinkField,
  RichTextField,
  TextField,
  ComponentParams,
} from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

export interface PersonContactFields {
  Name?: TextField;
  Job?: TextField;
  Company?: TextField;
  Email?: TextField;
  Website?: LinkField;
  Phonenumber?: TextField;
  MobilePhonenumber?: TextField;
  Address?: RichTextField;
  Image?: ImageField;
}

export interface PersonContactProps extends Omit<ComponentProps, 'params'> {
  fields: PersonContactFields;
  params?: {
    Styles?: string;
    RenderingIdentifier?: string;
    variant?: 'default' | 'two-column';
  };
}


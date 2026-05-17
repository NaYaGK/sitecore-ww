import { Field, LinkField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

/**
 * Helper type for Sitecore fields that may have jsonValue property
 * Supports both Layout Service (with jsonValue) and direct value patterns
 */
type SitecoreField<TField, TValue> = TField | { jsonValue?: TField; value?: TValue };

/**
 * Helper type for LinkField with jsonValue support
 */
type SitecoreLinkField = SitecoreField<LinkField, LinkField['value']>;

/**
 * Helper type for TextField with jsonValue support
 */
type SitecoreTextField = SitecoreField<Field<string>, string>;

interface LinkItem {
  id?: string;
  uid?: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Icon?: SitecoreTextField;
    Link?: SitecoreLinkField;
    LinkText?: SitecoreTextField;
    ButtonBackgroundColor?: SitecoreTextField;
    TextColor?: SitecoreTextField;
  };
}

interface ButtonGroupDatasource {
  Title?: SitecoreTextField;
  Items?: LinkItem[];
}

export interface ButtonGroupFields {
  data?: {
    datasource?: ButtonGroupDatasource;
  };
  Title?: SitecoreTextField;
  Items?: LinkItem[];
}

export type ButtonGroupVariant = 'default' | 'news' | 'Popup';

export interface ButtonGroupComponentProps extends ComponentProps {
  fields: ButtonGroupFields;
  variant?: ButtonGroupVariant;
}

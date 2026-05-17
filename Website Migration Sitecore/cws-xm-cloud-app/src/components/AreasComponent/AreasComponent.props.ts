import { Field, ImageField, LinkField, RichTextField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

/**
 * Helper type for Sitecore fields that may have jsonValue property
 * Supports both Layout Service (with jsonValue) and direct value patterns
 * Pattern: Field<T> | { jsonValue?: Field<T>; value?: T }
 */
type SitecoreField<TField, TValue> = TField | { jsonValue?: TField; value?: TValue };

/**
 * Helper type for ImageField with jsonValue support
 */
type SitecoreImageField = SitecoreField<ImageField, ImageField['value']>;

/**
 * Helper type for LinkField with jsonValue support
 */
type SitecoreLinkField = SitecoreField<LinkField, LinkField['value']>;

/**
 * Helper type for TextField with jsonValue support
 */
type SitecoreTextField = SitecoreField<Field<string>, string>;

/**
 * Helper type for RichTextField with jsonValue support
 */
type SitecoreRichTextField = SitecoreField<RichTextField, RichTextField['value']>;

export interface AreaCardItem {
  id?: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Icon?: SitecoreImageField;
    Title?: SitecoreTextField;
    Tag?: SitecoreTextField;
    Description?: SitecoreRichTextField;
    Link?: SitecoreLinkField;
  };
}

// Alias for backwards compatibility with codex version
export type AreasComponentCard = AreaCardItem;

export interface AreasComponentFields {
  Title?: Field<string>;
  DefaultAreaCard?: AreaCardItem;
  AreaCards?: AreaCardItem[];
}

export interface AreasComponentProps extends ComponentProps {
  fields: AreasComponentFields;
}


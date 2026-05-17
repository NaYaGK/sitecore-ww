import { ComponentParams, ComponentRendering, Field, ImageField } from '@sitecore-content-sdk/nextjs';

export type QuoteHighlightFields = {
  Title: Field<string>;
  Description: Field<string>;
  Image: ImageField;
  Signature: Field<string>;
};

export type QuoteHighlightProps = {
  rendering?: ComponentRendering & { params?: ComponentParams };
  params?: ComponentParams;
  fields?: QuoteHighlightFields;
};

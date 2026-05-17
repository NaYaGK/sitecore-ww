import { ComponentParams, ComponentRendering, Field, ImageField } from '@sitecore-content-sdk/nextjs';

export type ArticleHighlightFields = {
  Title: Field<string>;
  DescriptionTop: Field<string>;
  DescriptionBottom: Field<string>;
  BottomBackgroundColor: Field<string>;
  Image: ImageField;
};

export type ArticleHighlightProps = {
  rendering?: ComponentRendering & { params?: ComponentParams };
  params?: ComponentParams;
  fields?: ArticleHighlightFields;
};

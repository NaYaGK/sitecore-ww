import { ComponentProps } from '@/lib/component-props';
import { Field } from '@sitecore-content-sdk/nextjs';

export interface FindYourProductFields {
  Title?: Field<string>;
  ProductGroupingText?: Field<string>;
  ProductCategoryText?: Field<string>;
  AvailableColorText?: Field<string>;
  SexLabel?: Field<string>;
  ShowMoreText?: Field<string>;
  SearchWidgetID?: Field<string>;
  EntityName?: Field<string>;
  SourceID?: Field<string>;
  ResultCount?: Field<string>;
}

export interface FindYourProductProps extends ComponentProps {
  fields: FindYourProductFields;
  className?: string;
}

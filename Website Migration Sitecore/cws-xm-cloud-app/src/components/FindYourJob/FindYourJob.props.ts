import { ComponentProps } from '@/lib/component-props';
import { Field } from '@sitecore-content-sdk/nextjs';

export interface FindYourJobFields {
  Title?: Field<string>;
  PlaceholderText?: Field<string>;
  RegionText?: Field<string>;
  SolutionAreaText?: Field<string>;
  EmploymentTypeText?: Field<string>;
  FilterButtonText?: Field<string>;
  CtaText?: Field<string>;
  SourceID?: Field<string>;
  WidgetID?: Field<string>;
  SearchWidgetID?: Field<string>;
  EntityName?: Field<string>;
  ResultCount?: Field<string>;
}

export interface FindYourJobProps extends ComponentProps {
  fields?: FindYourJobFields;
  className?: string;
}


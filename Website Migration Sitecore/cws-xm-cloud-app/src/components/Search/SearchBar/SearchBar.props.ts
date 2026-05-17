import { LinkField, Field } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

export type SearchBarVariant = 'Default' | 'Jobs';

export interface SearchBarProps extends ComponentProps {
  fields: {
    SearchActionUrl?: LinkField;
    InitialStateCollapsed?: Field<boolean>;
    SearchButtonText?: Field<string>;
    ShowSearchIcon?: Field<boolean>;
    PlaceholderText?: Field<string>;
    ShowCloseIcon?: Field<boolean>;
    SearchWidgetID?: Field<string>;
    EntityName?: Field<string>;
    SourceID?: Field<string>;
    SearchConfig?: Field<string>;
    [key: string]: any;
  };
  className?: string;
}

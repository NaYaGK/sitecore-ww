import { ComponentProps } from '@/lib/component-props';
import { Field, RichTextField } from '@sitecore-content-sdk/nextjs';

export interface NewsAndPressListingProps extends ComponentProps {
  fields?: {
    Title?: {
      jsonValue?: RichTextField;
      value?: string;
    };
    WidgetID?: Field<string>;
    SearchWidgetID?: Field<string>;
    SourceID?: Field<string>;
    ResultCount?: Field<string>;
    EntityName?: Field<string>;
    NoResultText?: Field<string>;
    LoadMoreText?: Field<string>;
    FilterValue?: Field<string>;
    NewsType?: Field<string>;
    CardCTAText?: Field<string>;
    ShowLoadMore?: Field<boolean>;
  };
  className?: string;
}

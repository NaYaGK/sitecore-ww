import { ComponentProps } from '@/lib/component-props';
import { Field, LinkField } from '@sitecore-content-sdk/nextjs';

export interface NewsTagItem {
  id: string;
  url?: string;
  name?: string;
  displayName?: string;
  fields?: {
    Name?: Field<string>;
    Title?: Field<string>;
    Link?: LinkField;
  };
}

export interface NewsDetailFields {
  news_publish_date?: Field<string>;
  solution_area?: Field<string>;
  news_tags?: NewsTagItem[];
  news_type?: Field<string>;
}

export interface NewsDetailProps extends ComponentProps {
  fields?: NewsDetailFields & {
    data?: {
      datasource?: NewsDetailFields;
    };
  };
  className?: string;
}

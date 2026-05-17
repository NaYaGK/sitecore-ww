// Minimal props typing used by LatestNewsFeed. Adjust if Sitecore field schema evolves.
import type { ComponentRendering, ComponentParams, Field, ImageField, LinkField, TextField } from '@sitecore-content-sdk/nextjs';

export interface LatestNewsFeedFields {
  title?: { jsonValue?: Field<string> | TextField };
  ctaText?: { jsonValue?: Field<string> };
  ItemsPerPage?: { jsonValue?: Field<string> };
  LoadMoreButtonText?: { jsonValue?: Field<string> | TextField };
  Items?: Array<{
    title?: { jsonValue?: Field<string> | TextField };
    summary?: { jsonValue?: Field<string> | TextField };
    image?: { jsonValue?: ImageField };
    publishDate?: { jsonValue?: Field<string> };
    articleLink?: { jsonValue?: LinkField };
    ArticleLink?: { jsonValue?: LinkField };
   TagList?: NewsTagItem[];
  }>;
  manualNewsItems?: {
    results?: Array<{
      title?: { jsonValue?: Field<string> | TextField };
      summary?: { jsonValue?: Field<string> | TextField };
      image?: { jsonValue?: ImageField };
      publishDate?: { jsonValue?: Field<string> };
      articleLink?: { jsonValue?: LinkField };
      ArticleLink?: { jsonValue?: LinkField };
      TagList?: NewsTagItem[];
    }>;
  };
}

export type LatestNewsFeedProps = {
  rendering?: ComponentRendering & { params?: ComponentParams };
  params?: ComponentParams;
  className?: string;
  fields?: LatestNewsFeedFields & {
    data?: {
      datasource?: LatestNewsFeedFields;
    };
  };
};

export interface NewsTagItem {
  id: string;
  name?: string;
  fields: {
    Name:{jsonValue?: Field<string> | TextField };
    Link?:{jsonValue?: LinkField };
  };
}

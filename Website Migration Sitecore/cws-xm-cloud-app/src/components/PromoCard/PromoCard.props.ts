import { Field, ImageField, LinkField, RichTextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

export interface PromoItem {
  fields: {
    Title?: Field<string>;
    SubTitle?: Field<string>;
    Image?: ImageField;
    Description?: RichTextField;
    CTA?: LinkField;
  };
}

export interface PromoCardProps extends ComponentProps {
  fields: {
    Cards?: PromoItem[];
  };
}

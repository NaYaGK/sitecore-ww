import { Field, ImageField, RichTextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

export interface ComparisonProps extends ComponentProps {
  fields: {
    LeftTitle?: Field<string>;
    LeftSubTitle?: Field<string>;
    LeftCamparisonText?: RichTextField;
    Image?: ImageField;
    RightTitle?: Field<string>;
    RightSubTitle?: Field<string>;
    RightCamparsionText?: RichTextField;
  };
}

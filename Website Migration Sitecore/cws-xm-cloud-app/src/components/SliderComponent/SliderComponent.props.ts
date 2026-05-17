import { Field, ImageField, LinkField, RichTextField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

export interface SlideItem {
  id: string;
  url: string;
  name: string;
  displayName: string;
  fields: {
    Link: LinkField;
    Title: Field<string>;
    Description: RichTextField;
    Image: ImageField;
  };
}

export interface SliderComponentFields {
  Title?: {
    value: string;
  };
  Slides?: SlideItem[];
  EnableSnapScroll?: {
    value: boolean;
  };
  ProgressIndicatorLabel?: {
    value: string;
  };
}

export interface SliderComponentProps extends ComponentProps {
  fields: SliderComponentFields;
}


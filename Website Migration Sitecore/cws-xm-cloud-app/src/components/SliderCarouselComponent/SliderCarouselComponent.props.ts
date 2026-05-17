import { Field, ImageField, LinkField, RichTextField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

export interface SliderCarouselItem {
  id: string;
  url: string;
  name: string;
  displayName: string;
  fields: {
    Title?: Field<string>;
    Description?: RichTextField;
    Image?: ImageField;
    Link?: LinkField;
  };
}

export interface SliderCarouselComponentFields {
  Title?: Field<string>;
  Subtitle?: Field<string>;
  Description?: RichTextField;
  Items?: SliderCarouselItem[];
  Link?: LinkField;
}

export interface SliderCarouselComponentProps extends ComponentProps {
  fields: SliderCarouselComponentFields;
}

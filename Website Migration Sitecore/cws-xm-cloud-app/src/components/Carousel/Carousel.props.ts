import {
  Field,
  ImageField,
  LinkField,
  RichTextField,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

export interface CarouselSlideItem {
  id: string;
  url?: string;
  name: string;
  displayName?: string;
  fields: {
    Title: Field<string>;
    Description: RichTextField;
    Image: ImageField;
    Link: LinkField;
  };
}

export interface CarouselFields {
  Title?: {
    jsonValue: Field<string>;
  };
  /** Background image for hero / background-image variants */
  BackgroundImage?: {
    jsonValue: ImageField;
  };
  LeftImage?: {
    jsonValue: ImageField;
  };
  Slides?: CarouselSlideItem[];
}

export interface CarouselProps extends ComponentProps {
  params: { [key: string]: string };
  fields: {
    data: {
      datasource: CarouselFields;
    };
  };
  isPageEditing?: boolean;
}

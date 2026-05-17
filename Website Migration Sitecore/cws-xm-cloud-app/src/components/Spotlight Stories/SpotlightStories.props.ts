import { Field, ImageField, RichTextField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

export interface StoryItem {
  id: string;
  url: string;
  name: string;
  displayName: string;
  fields: {
    Title: RichTextField;
    Description: RichTextField;
    Image: ImageField;
    CountNumber: Field<string>;
  };
}

export interface SpotlightStoriesFields {
  Title?: Field<string>;
   Description?: RichTextField;
  StoriesItem?: StoryItem[];
  BackgroundColor?: Field<string>;
}

export interface SpotlightStoriesProps extends ComponentProps {
  fields: SpotlightStoriesFields;
}


// @ts-nocheck
import type { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

import type { ComponentProps } from '@/lib/component-props';

export interface VideoPlayerFields {
  VideoTitle?: Field<string>;
  VideoUrl?: LinkField;
  PosterImage?: ImageField;
  Caption?: Field<string>;
}

export interface VideoPlayerComponentProps extends ComponentProps {
  className?: string;
  fields: VideoPlayerFields;
}

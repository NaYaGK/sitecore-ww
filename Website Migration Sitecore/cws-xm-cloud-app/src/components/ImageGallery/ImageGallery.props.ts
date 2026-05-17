import type { ComponentRendering, ComponentParams, Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

export interface ImageGalleryFields {
  Title?: { jsonValue?: Field<string> };
  GalleryImages?: {
    targetItems?: Array<{
      Image?: { jsonValue?: ImageField };
      Caption?: { jsonValue?: Field<string> };
      Title?: { jsonValue?: Field<string> };
      Link?: { jsonValue?: LinkField };
      IsLeftCaption?: { jsonValue?: Field<boolean> };
      Description?: { jsonValue?: Field<string> };
    }>;
  };
  Items?: Array<{
    Image?: { jsonValue?: ImageField };
    Caption?: { jsonValue?: Field<string> };
    Title?: { jsonValue?: Field<string> };
    Link?: { jsonValue?: LinkField };
    IsLeftCaption?: { jsonValue?: Field<boolean> };
    Description?: { jsonValue?: Field<string> };
  }>;
  EnableThumbnails?: { jsonValue?: Field<boolean> };
  LoopSlides?: { jsonValue?: Field<boolean> };
}

export type ImageGalleryProps = {
  rendering?: ComponentRendering & { params?: ComponentParams };
  params?: ComponentParams;
  fields?: ImageGalleryFields & {
    data?: {
      datasource?: ImageGalleryFields;
    };
  };
  variant?:
    | 'default'
    | 'scrollGallery'
    | 'twoImages'
    | 'downloadLink'
    | 'popupGallery'
    | 'landingPage'
    | 'imageContentDuo' | 'imageFull';
  isFullImage?: boolean;
};

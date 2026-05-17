'use client';
import React, { type FC } from 'react';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import type { ImageComponentProps } from './ImageComponent.props';
import { Default as ImageWrapper } from '../image/ImageWrapper.dev';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

type ImageComponentVariant = 'default' | 'imageWithSideMargins';

const ImageComponentLayout: FC<ImageComponentProps & { variant: ImageComponentVariant }> = (
  props,
) => {
  const { className, fields, rendering, variant } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const imageField = fields?.Image;

  if (!fields || (!imageField && !isPageEditing)) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'ImageComponent'} />;
  }

  const hasImageSource = Boolean(imageField?.value?.src);
  if (!hasImageSource && !isPageEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'ImageComponent'} />;
  }

  const altText =
    (typeof imageField?.value?.alt === 'string' ? imageField.value.alt : '') || 'Decorative image';

  const isImageWithSideMargins = variant === 'imageWithSideMargins';

  const imageElement = imageField ? (
    <div
      className={cn(
        'relative',
        isImageWithSideMargins
          ? 'mx-auto flex min-h-[221px] w-[424px] justify-center md:w-[1340px] 2xl:min-h-[759px]'
          : 'w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden',
      )}
    >
      <ImageWrapper
        image={imageField}
        className={cn(
          'block',
          isImageWithSideMargins
            ? 'h-full w-full object-contain object-center'
            : 'h-auto w-full object-contain',
        )}
        wrapperClass={
          isImageWithSideMargins ? 'relative h-full w-full' : 'relative w-full'
        }
        alt={altText}
        priority={false}
      />
    </div>
  ) : null;

  return (
    <section
      className={cn(
        'w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-12 lg:mb-18',
        'bg-bg-primary',
        'component',
        '',
        isImageWithSideMargins && 'image-component flex justify-center',
        className,
      )}
      data-component={`ImageComponent-${variant}`}
    >
      <figure className="m-0 grid gap-0">{imageElement}</figure>
    </section>
  );
};

export const Default: FC<ImageComponentProps> = (props) => (
  <ImageComponentLayout {...props} variant="default" />
);

export const ImageWithSideMargins: FC<ImageComponentProps> = (props) => (
  <ImageComponentLayout {...props} variant="imageWithSideMargins" />
);

export default Default;

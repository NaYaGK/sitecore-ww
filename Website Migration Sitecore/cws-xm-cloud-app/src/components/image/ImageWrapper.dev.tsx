// @ts-nocheck
'use client';
import { useContext } from 'react';
import { cn } from '@/lib/utils';
import { ImageField, Image as ContentSdkImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ImageOptimizationContext } from './image-optimization.context';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import NextImage, { ImageProps } from 'next/image';
import placeholderImageLoader from '@/utils/placeholderImageLoader';

type ImageWrapperProps = {
  image?: ImageField;
  className?: string;
  priority?: boolean;
  sizes?: string;
  blurDataURL?: string;
  alt?: string;
  wrapperClass?: string;

  [key: string]: any;
};

export const Default: React.FC<ImageWrapperProps> = (props) => {
  const { image, className, wrapperClass, sizes, ...rest } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const isPreview = page?.mode.isPreview;
  const isStorybook =
    typeof window !== 'undefined' &&
    (((window as any).__STORYBOOK__ as boolean) ||
      (window as any).__STORYBOOK_CLIENT_API__ ||
      (typeof window.location?.port === 'string' && window.location.port === '6006'));

  const { unoptimized } = useContext(ImageOptimizationContext);
  const ref = useRef(null);
  const inView = useInView(ref);

  if (!isPageEditing && !image?.value?.src) {
    return <></>;
  }

  const imageSrc = image?.value?.src ? image?.value?.src : '';
  const isSvg = imageSrc.includes('.svg');
  // if  unoptimized || svg || external
  const isUnoptimized =
    unoptimized ||
    isSvg ||
    imageSrc.startsWith('https://');

  const isPicsumImage = imageSrc.includes('picsum.photos');
  const width = (image?.value as ImageProps | undefined)?.width;
  const height = (image?.value as ImageProps | undefined)?.height;

  return (
    <div className={cn('image-container', wrapperClass)}>
      {isStorybook ? (
        <img
          src={image?.value?.src || ''}
          alt={image?.value?.alt || ''}
          className={className}
          {...rest}
        />
      ) : isPageEditing || isPreview || isSvg ? (
        <ContentSdkImage field={image} className={className} />
      ) : (
        <NextImage
          loader={isPicsumImage ? placeholderImageLoader : undefined}
          {...(image?.value as ImageProps)}
          className={className}
          unoptimized={isUnoptimized}
          priority={inView ? true : false}
          sizes={!width ? (sizes ?? '100vw') : sizes}
          blurDataURL={image?.value?.src}
          placeholder="blur"
          // ensure default dimensions exist when Sitecore data omits them (common for remote badges)
          width={width ?? 120}
          height={height ?? 48}
          {...rest}
        />
      )}
    </div>
  );
};

'use client';

import type React from 'react';
import { Text, RichText, Image, Link } from '@sitecore-content-sdk/nextjs';
import { HeroBannerProps } from './HeroBanner.props';
import { useSiteName } from '@/hooks/useSiteName';
import { patchLinkField } from '@/lib/patch-link';
import { cn } from '@/lib/utils';
import { ScrollIndicator } from '../ScrollIndicator/ScrollIndicator';
import { useEffect } from 'react';
import { openContactFormModal } from '@/ui/Modal/contact_form_modal';

type HeroBannerVariant = 'default' | 'fullPage' | 'newsStyle' | 'imageFit' | 'brandBackground' | 'contentPositionTop';

const asTrimmedString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const HeroBannerLayout: React.FC<HeroBannerProps & { variant: HeroBannerVariant }> = (props) => {
  const { fields, params, variant } = props;
  const siteName = useSiteName();
  const isFullPage = variant === 'fullPage';
  const isNewsStyle = variant === 'newsStyle';
  const isImageFit = variant === 'imageFit';
  const isBrandBackground = variant === 'brandBackground';
  const isContentPositionTop = variant === 'contentPositionTop';
  const isDefault = Boolean(!isFullPage && !isNewsStyle && !isImageFit && !isBrandBackground && !isContentPositionTop);
  const showArrow = fields.ShowArrow?.value;
  const showModal = fields.IsShowModel?.value === true;
  const backgroundColor = asTrimmedString(params?.Styles) || undefined;
  const hasTitle = Boolean(asTrimmedString(fields.Title?.value));
  const hasText = Boolean(asTrimmedString(fields.Text?.value));
  const hasLink = Boolean(
    fields.Link?.value?.href ||
    fields.Link?.value?.text ||
    fields.Link?.value?.description ||
    (fields.Link as any)?.jsonValue?.value?.href ||
    (fields.Link as any)?.jsonValue?.value?.text ||
    (fields.Link as any)?.jsonValue?.value?.description,
  );
  const hasContentBlock = hasTitle || hasText || hasLink;
  // Add/remove body classes for ShowArrow and newsStyle variant
  useEffect(() => {


    if (isFullPage) {
      document.body.classList.add('hero-banner-news-style');
    } else {
      document.body.classList.remove('hero-banner-news-style');
    }
    if (isNewsStyle || isImageFit) {
      document.body.classList.add('hero-banner-variant-news');
    } else {
      document.body.classList.remove('hero-banner-variant-news');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('hero-banner-with-arrow');
      document.body.classList.remove('hero-banner-news-style');
      document.body.classList.remove('hero-banner-variant-news');
    };
  }, [showArrow, isFullPage, isNewsStyle,isImageFit]);

  // Extract background color from params.Styles (e.g., "#f9e244")
  // Use brand accent color for brandBackground variant


  // Access the Value field from the droplink's selected item
  // Structure: fields.ButtonColor.fields.Value.value
  const buttonColorValue = fields.ButtonColor?.fields?.Value?.value;
  const hasButtonColor = Boolean(buttonColorValue);

  return (
    <section
      className={cn(
        'relative z-30 mb-4 w-full overflow-hidden md:mb-0',
        'flex flex-col',
        !fields.Image?.value?.src && 'h-[250px] ',
        !hasContentBlock && fields.Image?.value?.src && 'lg:h-auto',
        isNewsStyle || isImageFit
          ? 'h-[calc(100vh-108px)] justify-center'
          : isFullPage
            ? 'lg:h-[74vh] xl:h-[69vh]'
            : 'lg:h-screen',
        isImageFit && 'pt-[35vh] h-[90vh] lg:pt-0 lg:h-[calc(100vh-108px)] lg:justify-center',
        isContentPositionTop && '',
      )}
      data-component={`HeroBanner-${variant}`}
      style={backgroundColor ? { backgroundColor } : { backgroundColor: 'var(--color-accent-primary)' }}
    >
      {fields.Image?.value?.src && (
        <div
          className={cn(
            'relative z-0 w-full',
            isImageFit ? ' lg:w-[calc(100vw-350px)]' : '',
            isContentPositionTop ? ' lg:w-[calc(100vw-350px)]' : '',
            !hasContentBlock && fields.Image?.value?.src
              ? 'h-[80vw] min-h-[260px] sm:h-[65vw] md:h-[62vw] lg:h-[36vw] lg:min-h-[320px] lg:max-h-[520px] xl:h-[32vw]'
              : '',
            isNewsStyle
              ? 'max-h-[640px] scale-110 lg:scale-100  lg:max-h-[120vh] lg:absolute lg:inset-0 lg:h-full '
              : !hasContentBlock && fields.Image?.value?.src
                ? 'h-[80vw] min-h-[260px] sm:h-[65vw] md:h-[62vw] lg:inset-auto'
                : 'h-[80vw] min-h-[260px] sm:h-[65vw] md:h-[62vw] lg:absolute lg:inset-0 lg:h-full',
          )}
        >
          <Image
            field={fields.Image}
            className={cn(
              'h-full w-full object-center',
              isFullPage ? 'object-cover lg:object-fit' : 'object-cover',
            )}
            alt=""
            style={{
              objectPosition: 'center center',
            }}
          />
          <div
            className="absolute inset-0 z-10"
            data-component-name="HeroBanner"
            style={{
              background:
                'linear-gradient(45deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.7) 40%, rgba(255, 255, 255, 0) 70%, rgba(255, 255, 255, 0.95) 95%)',
            }}
          />
        </div>
      )}

      {hasContentBlock && (
        <div
          className={cn(
            'relative z-20',
            'bg-[var(--color-accent-primary)] px-0 pt-6',
            'lg:bg-transparent lg:py-0',
            'flex h-full lg:flex lg:h-full lg:items-center ',
            isImageFit && "h-auto"
          )}
        >
          <div
            className={cn(
              'mx-auto mb-3 w-full max-w-[1360px] px-2 py-4 md:px-[10px] lg:mb-0 lg:py-0 lg:pt-0',
              isImageFit && 'h-full lg:h-[calc(48vh-48px)] xl:h-[calc(53vh-48px)]',
              isContentPositionTop && 'h-full lg:h-[calc(50vh-48px)] xl:h-[calc(69vh-48px)] ',
            )}
          >
            <div
              className={cn(
                'flex w-full flex-col items-start gap-2 sm:gap-4 md:gap-0 lg:max-w-2/3 lg:pt-5',
                !fields.Text?.value ? 'lg:gap-0' : isFullPage ? 'md:gap-4' : 'lg:gap-0',
              )}
            >
              {fields.Title && (
                <Text
                  tag="h1"
                  field={fields.Title}
                  className={cn(
                    'font-heading-h1 m-0 mb-2! w-full max-w-4/5 text-left lg:max-w-[800px]',
                    isFullPage ? 'lg:mb-2!' : 'lg:mb-6!',
                  )}
                />
              )}
              {fields.Text && (
                <div className="rte-content m-0! my-1! pb-8! text-left! text-[18px]! leading-[26px]! font-normal! lg:pb-0! lg:text-[18px]! lg:leading-[28px]! [&_h1]:text-[30px]! [&_h1_strong]:text-[30px]! [&_h3]:mx-0! [&_h3]:my-11! [&_h3]:block! [&_h3]:h-12! [&_h3]:w-[900px]! [&_h3]:text-[26px]! [&_h3]:leading-[32px]! [&_h3]:font-bold! [&_h3]:break-words! [&_h3]:text-black! [&_h3]:antialiased! lg:[&_h3]:text-[28px]! lg:[&_h3]:leading-[34px]! xl:[&_h3]:text-[30px]! xl:[&_h3]:leading-[36px]!">
                  <RichText field={fields.Text} />
                </div>
              )}
              {fields.Link && (
                <>
                  {showModal ? (
                    <button
                      type="button"
                      onClick={() => openContactFormModal()}
                      className={cn(
                        'inline-block rounded-2xl text-center',
                        'no-underline',
                        'font-bold transition-all duration-100 ease-in-out',
                        'w-full lg:w-auto',
                        'lg:mt-16 lg:mr-6 lg:mb-[-8px]',
                        'px-16 py-[9px] text-[16px] leading-[24px]',
                        'lg:px-20 lg:text-[18px] lg:leading-[26px]',
                        'xl:px-24 xl:text-[20px] xl:leading-[28px]',
                        'hover:cursor-pointer',
                        !hasButtonColor &&
                        'border-2 border-black bg-transparent text-black hover:bg-black hover:text-white',
                        hasButtonColor && 'text-white hover:text-black',
                      )}
                      style={{
                        ...(hasButtonColor
                          ? {
                            backgroundColor: String(buttonColorValue),
                          }
                          : {}),
                      }}
                    >
                      {fields.Link?.value?.text || 'Contact Us'}
                    </button>
                  ) : (
                    <Link
                      field={patchLinkField(fields.Link, siteName) ?? fields.Link}
                      className={cn(
                        'inline-block rounded-2xl text-center',
                        'no-underline',
                        'font-bold transition-all duration-100 ease-in-out',
                        'w-full lg:w-auto',
                        'lg:mt-16 lg:mr-6 lg:mb-[-8px]',
                        'px-16 py-[9px] text-[16px] leading-[24px]',
                        'lg:px-20 lg:text-[18px] lg:leading-[26px]',
                        'xl:px-24 xl:text-[20px] xl:leading-[28px]',
                        'hover:cursor-pointer',
                        !hasButtonColor &&
                        'border-2 border-black bg-transparent text-black hover:bg-black hover:text-white',
                        hasButtonColor && 'text-white hover:text-black',
                      )}
                      style={{
                        ...(hasButtonColor
                          ? {
                            backgroundColor: String(buttonColorValue),
                          }
                          : {}),
                      }}
                    >
                      {fields.Link?.value?.description ||
                        fields.Link?.value?.text ||
                        (fields.Link as any)?.jsonValue?.value?.description ||
                        (fields.Link as any)?.jsonValue?.value?.text ||
                        'To the website'}
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scroll indicator - show when ShowArrow field is true */}
      {showArrow && (
        <div className="hidden items-center justify-center lg:flex">
          <ScrollIndicator
            className={cn(
              'absolute left-1/2 -translate-x-1/2 bottom-4'
            )}
            width={100}
            height={100}
          />
        </div>
      )}
    </section>
  );
};

export const Default: React.FC<HeroBannerProps> = (props) => (
  <HeroBannerLayout {...props} variant="default" />
);

export const FullPage: React.FC<HeroBannerProps> = (props) => (
  <HeroBannerLayout {...props} variant="fullPage" />
);

export const NewsStyle: React.FC<HeroBannerProps> = (props) => (
  <HeroBannerLayout {...props} variant="newsStyle" />
);

export const ImageFit: React.FC<HeroBannerProps> = (props) => (
  <HeroBannerLayout {...props} variant="imageFit" />
);

export const BrandBackground: React.FC<HeroBannerProps> = (props) => (
  <HeroBannerLayout {...props} variant="brandBackground" />
);

export const ContentPositionTop: React.FC<HeroBannerProps> = (props) => (
  <HeroBannerLayout {...props} variant="contentPositionTop" />
);

export default Default;

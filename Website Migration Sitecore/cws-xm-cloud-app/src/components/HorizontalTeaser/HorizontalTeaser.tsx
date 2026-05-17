'use client';
import type { FC } from 'react';
import { useSitecore, Text, RichText, Image, Link } from '@sitecore-content-sdk/nextjs';
import type { HorizontalTeaserProps } from './horizontal-teaser.props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { patchLinkField } from '@/lib/patch-link';
import { useLocale } from '@/hooks/useLocale';
import { useSiteName } from '@/hooks/useSiteName';


export const HorizontalTeaserVariants = {
  Default: 'Default',
  BrandButton: 'Brand Button',
  ImageFullView: 'Image Full View',
  TitleMedium: 'Title Medium',
  ContentHeight: 'contentHeight',
} as const;

type HorizontalTeaserVariant =
  (typeof HorizontalTeaserVariants)[keyof typeof HorizontalTeaserVariants];

const HorizontalTeaserLayout: FC<HorizontalTeaserProps & { variant: HorizontalTeaserVariant }> = ({
  className,
  fields,
  rendering,
  variant,
}) => {


  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;
  const siteName = useSiteName();
  const locale = useLocale();

  const isBrandButtonStyle = variant === HorizontalTeaserVariants.BrandButton;
  const isFullImageWidth = variant === HorizontalTeaserVariants.ImageFullView;
  const isTitleH3 = variant === HorizontalTeaserVariants.TitleMedium;

  // Directly access fields from the fields object
  const titleField = fields?.Title as any;
  const headlineField = fields?.Headline as any;
  const descriptionField = fields?.Description as any;
  const imageField = fields?.Image as any;
  const imageSubheadlineField = fields?.ImageSubheadline as any;
  const linkField = (patchLinkField(fields?.Link as { value?: { href?: string } }, siteName, undefined, locale) ?? fields?.Link) as any;
  const imageLeftPositionField = fields?.ImageLeftPosition as any;
  const linkBackgroundColorField = fields?.LinkBackgroundColor as any;

  // Parse ImageLeftPosition checkbox value
  const imageLeft = imageLeftPositionField?.value ?? false;

  // Extract background color from LinkBackgroundColor droplink field
  // The droplink references an item with a Value field containing the color hashtag
  const linkBackgroundColor =
    linkBackgroundColorField?.targetItem?.fields?.Value?.value ||
    linkBackgroundColorField?.value?.fields?.Value?.value ||
    linkBackgroundColorField?.fields?.Value?.value ||
    null;

  // Check if there's any content
  const hasContent =
    titleField?.value ||
    headlineField?.value ||
    descriptionField?.value ||
    (imageField?.value as any)?.src ||
    (linkField?.value as any)?.href;

  if (!hasContent && !isEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'HorizontalTeaser'} />;
  }

  // Field logs removed for production cleanliness

  return (
    <section
      className={cn(
        'component mb-4 w-full md:mb-12',
        className,
      )}
      data-component="HorizontalTeaser"
      data-variant={variant}
    >
      <div className={cn("mx-auto  px-0 py-0 md:mb-0 md:px-1", !isFullImageWidth && "max-w-[1360px]", isFullImageWidth && "md:max-w-none")}>

        {(titleField?.value || isEditing) && (
          <Text
            field={titleField}
            tag={isTitleH3 ? "h3" : "h2"}
            className={isTitleH3 ? "font-heading-h3 mx-auto max-w-[1360px]! pt-2 pb-0 pl-2  mb-8! md:mb-16! md:px-0 md:pb-2" : "font-heading-h2 mx-auto max-w-[1360px]! pt-2 pb-0 pl-2  mb-10! md:mb-8! md:px-0 md:pb-2"}
          />
        )}

        <div className="grid grid-cols-1 items-start gap-1 self-start px-0 sm:grid-cols-2 sm:gap-4 md:gap-5 lg:gap-4">
          {/* Conditionally render based on imageLeft value */}
          {imageLeft ? (
            <>
              {/* Image on left when checked */}
              <div className={cn(
                "-mx-2 mb-2 flex flex-col justify-start items-start sm:h-full md:mx-0 md:mb-4 md:flex md:w-auto",
                !isFullImageWidth && !imageSubheadlineField?.value && "md:max-h-[390px] md:overflow-hidden",
                isFullImageWidth && "md:max-h-none md:overflow-visible"
              )}>
                <div className={cn(
                  "w-full",
                  !isFullImageWidth && "md:max-h-[372px] md:overflow-hidden"
                )}>
                  {((imageField?.value as any)?.src || isEditing) && (
                    <Image field={imageField} alt="" className={cn(
                      "block w-full object-cover object-top",
                      !isFullImageWidth && "h-[235px] md:h-[372px]"
                    )} />
                  )}
                </div>
                {(imageSubheadlineField?.value || isEditing) && (
                  <div className="mt-2 w-full flex justify-center px-2 text-sm text-gray-600 ">
                    <Text field={imageSubheadlineField} />
                  </div>
                )}
              </div>

              {/* Content on right when checked */}
              <div className={cn(
                "mb-5 flex flex-col justify-center  gap-0 md:mb-0 md:pb-10 md:pl-2 ",
                isFullImageWidth && "md:max-w-[660px] md:h-full md:mr-auto"
              )}>
                {(headlineField?.value || isEditing) && (
                  <div className="mb-4">
                    <Text
                      field={headlineField}
                      tag="h4"
                      className="font-heading-h4 md:mb-4 block font-bold text-[18px] md:text-[22px] leading-8 break-words"
                    />
                  </div>
                )}
                {(descriptionField?.value || isEditing) && (
                  <div className="mb-0">
                    <div className="rte-content font-regular bread-words  [&_p]:leading-[20px]  md:[&_p]:leading-[26px] block text-[17px] leading-7 font-normal break-words whitespace-normal text-black antialiased [&_p]:mb-1 [&_p]:block [&_p]:break-words [&_p]:whitespace-normal [&_p]:text-inherit [&_p_*]:whitespace-normal [&_ul]:list-disc [&_ul]:md:ml-6 [&_ul]:md:pl-6">
                      <RichText field={descriptionField} className="" />
                    </div>
                  </div>
                )}

                {((linkField?.value as any)?.href || isEditing) && (
                  <div className="flex flex-wrap gap-3">
                    {linkField && (
                      <Link
                        field={linkField}
                        className={cn(
                          "rounded-2xl border-2 border-black px-8 py-2 text-[18px] 2xl:text-[22px] font-bold transition-all duration-200 hover:bg-[var(--color-text,#000)] hover:text-[var(--color-bg-primary,#f5f5f5)] md:px-11 2xl:px-15",
                          isBrandButtonStyle && "border-none text-white"
                        )}
                        style={
                          isBrandButtonStyle ? { backgroundColor: 'var(--color-accent-primary)' } : undefined
                        }
                      />
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Content on left when unchecked */}
              <div className={cn(
                "mb-5 flex flex-col justify-center gap-0 md:mb-0 md:pb-10 md:pl-2",
                isFullImageWidth && "md:max-w-[660px] md:h-full md:ml-auto"
              )}>
                {(headlineField?.value || isEditing) && (
                  <div className="mb-4">
                    <Text
                      field={headlineField}
                      tag="h4"
                      className="md:mb-4 block font-bold text-[18px] md:text-[22px] leading-8 break-words"
                    />
                  </div>
                )}
                {(descriptionField?.value || isEditing) && (
                  <div className="mb-6">
                    <div className="rte-content font-regular bread-words  [&_p]:leading-[20px]  md:[&_p]:leading-[26px] block text-[17px] leading-7 font-normal break-words whitespace-normal text-black antialiased [&_p]:mb-1 [&_p]:block [&_p]:break-words [&_p]:whitespace-normal [&_p]:text-inherit [&_p_*]:whitespace-normal [&_ul]:list-disc [&_ul]:md:ml-6 [&_ul]:md:pl-6">
                      <RichText field={descriptionField} className="" />
                    </div>
                  </div>
                )}

                {((linkField?.value as any)?.href || isEditing) && (
                  <div className="flex flex-wrap gap-3">
                    {linkField && (
                      <Link
                        field={linkField}
                        className={cn(
                          "rounded-2xl  cursor-pointer border-2 border-black px-8 py-2 text-[18px] font-bold transition-all duration-200 hover:bg-[var(--color-text,#000)] hover:text-[var(--color-bg-primary,#f5f5f5)] md:px-15",
                          isBrandButtonStyle && "border-none text-white"
                        )}
                        style={
                          isBrandButtonStyle ? { backgroundColor: 'var(--color-accent-primary)' } : undefined
                        }
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Image on right when unchecked */}
              <div className={cn(
                "-mx-2 mb-4 flex flex-col justify-start items-start sm:h-full md:mx-0 md:mb-0 md:flex md:w-auto",
                !isFullImageWidth && !imageSubheadlineField?.value && "h-[372px] md:max-h-[372px] md:overflow-hidden",
                isFullImageWidth && "md:max-h-none md:overflow-visible"
              )}>
                <div className={cn(
                  "w-full",
                  !isFullImageWidth && "md:max-h-[372px] md:overflow-hidden"
                )}>
                  {((imageField?.value as any)?.src || isEditing) && (
                    <Image field={imageField} alt="" className={cn(
                      "block w-full object-cover object-top h-[235px] lg:h-auto",
                      !isFullImageWidth && "md:h-[372px] lg:h-[372px]"
                    )} />
                  )}
                </div>
                {(imageSubheadlineField?.value || isEditing) && (
                  <div className="mt-2 w-full px-2 text-sm text-gray-600 flex justify-center">
                    <Text field={imageSubheadlineField} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

const HorizontalTeaserContentHeightLayout: FC<HorizontalTeaserProps & { variant: HorizontalTeaserVariant }> = ({
  className,
  fields,
  rendering,
  variant: _variant,
}) => {
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;
  const siteName = useSiteName();

  const titleField = fields?.Title as any;
  const headlineField = fields?.Headline as any;
  const descriptionField = fields?.Description as any;
  const imageField = fields?.Image as any;
  const imageSubheadlineField = fields?.ImageSubheadline as any;
  const linkField = (patchLinkField(fields?.Link as { value?: { href?: string } }, siteName) ?? fields?.Link) as any;
  const imageLeftPositionField = fields?.ImageLeftPosition as any;

  const imageLeft = imageLeftPositionField?.value ?? false;

  const hasContent =
    titleField?.value ||
    headlineField?.value ||
    descriptionField?.value ||
    (imageField?.value as any)?.src ||
    (linkField?.value as any)?.href;

  if (!hasContent && !isEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'HorizontalTeaser'} />;
  }

  return (
    <section
      className={cn(
        'component mb-4 w-full md:mb-12',
        className,
      )}
      data-component="HorizontalTeaser"
      data-variant={HorizontalTeaserVariants.ContentHeight}
    >
      <div className={cn("mx-auto px-0 py-0 md:mb-0 md:px-1 max-w-[1360px]")}>

        {(titleField?.value || isEditing) && (
          <Text
            field={titleField}
            tag="h2"
            className="font-heading-h2 mx-auto max-w-[1360px]! pt-2 pb-0 pl-2  mb-10! md:mb-8! md:px-0 md:pb-2"
          />
        )}

        <div className="grid grid-cols-1 items-start gap-1 self-start px-0 sm:grid-cols-2 sm:items-stretch sm:gap-4 md:gap-5 lg:gap-8">
          {imageLeft ? (
            <>
              <div className={cn(
                "-mx-2 mb-2 flex flex-col justify-start items-start sm:h-full md:mx-0 md:mb-4 md:flex md:w-auto",
                !imageSubheadlineField?.value && "md:min-h-[372px] md:h-full md:overflow-hidden"
              )}>
                <div className="w-full md:h-full md:min-h-[372px] md:overflow-hidden">
                  {((imageField?.value as any)?.src || isEditing) && (
                    <Image field={imageField} alt="" className={cn(
                      "block w-full object-cover object-top",
                      "h-[330px] md:h-full md:min-h-[372px]"
                    )} />
                  )}
                </div>
                {(imageSubheadlineField?.value || isEditing) && (
                  <div className="mt-2 w-full flex justify-center px-2 text-sm text-gray-600 ">
                    <Text field={imageSubheadlineField} />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-start gap-0 md:mb-0 md:pl-2">
                {(headlineField?.value || isEditing) && (
                  <div className="mb-4">
                    <Text
                      field={headlineField}
                      tag="h4"
                      className="font-heading-h4 md:mb-4 block font-bold text-[18px] md:text-[22px] leading-8 break-words"
                    />
                  </div>
                )}
                {(descriptionField?.value || isEditing) && (
                  <div className="mb-0 pt-4 px-2 lg:px-0">
                    <div className="rte-content font-regular bread-words  [&_p]:leading-[20px]  md:[&_p]:leading-[26px] block text-[17px] leading-7 font-normal break-words whitespace-normal text-black antialiased [&_p]:mb-1 [&_p]:block [&_p]:break-words [&_p]:whitespace-normal [&_p]:text-inherit [&_p_*]:whitespace-normal [&_ul]:list-disc [&_ul]:md:ml-6 [&_ul]:md:pl-6">
                      <RichText field={descriptionField} className="" />
                    </div>
                  </div>
                )}

                {((linkField?.value as any)?.href || isEditing) && (
                  <div className="flex flex-wrap gap-3 px-2 lg:px-0">
                    {linkField && (
                      <Link
                        field={linkField}
                        className={cn(
                          "rounded-2xl border-2 border-black px-8 py-2 text-[18px] 2xl:text-[22px] font-bold transition-all duration-200 hover:bg-[var(--color-text,#000)] hover:text-[var(--color-bg-primary,#f5f5f5)] md:px-11 2xl:px-15"
                        )}
                      />
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col justify-start gap-0 md:mb-0 md:pl-2">
                {(headlineField?.value || isEditing) && (
                  <div className="mb-4">
                    <Text
                      field={headlineField}
                      tag="h4"
                      className="md:mb-4 block font-bold text-[18px] md:text-[22px] leading-8 break-words"
                    />
                  </div>
                )}
                {(descriptionField?.value || isEditing) && (
                  <div className="mb-6">
                    <div className="rte-content font-regular bread-words  [&_p]:leading-[20px]  md:[&_p]:leading-[26px] block text-[17px] leading-7 font-normal break-words whitespace-normal text-black antialiased [&_p]:mb-1 [&_p]:block [&_p]:break-words [&_p]:whitespace-normal [&_p]:text-inherit [&_p_*]:whitespace-normal [&_ul]:list-disc [&_ul]:md:ml-6 [&_ul]:md:pl-6">
                      <RichText field={descriptionField} className="" />
                    </div>
                  </div>
                )}

                {((linkField?.value as any)?.href || isEditing) && (
                  <div className="flex flex-wrap gap-3">
                    {linkField && (
                      <Link
                        field={linkField}
                        className={cn(
                          "rounded-2xl  cursor-pointer border-2 border-black px-8 py-2 text-[18px] font-bold transition-all duration-200 hover:bg-[var(--color-text,#000)] hover:text-[var(--color-bg-primary,#f5f5f5)] md:px-15"
                        )}
                      />
                    )}
                  </div>
                )}
              </div>

              <div className={cn(
                "-mx-2 mb-4 flex flex-col justify-start items-start sm:h-full md:mx-0 md:mb-0 md:flex md:w-auto",
                !imageSubheadlineField?.value && "md:min-h-[372px] md:h-full md:overflow-hidden"
              )}>
                <div className="w-full md:h-full md:min-h-[372px] md:overflow-hidden">
                  {((imageField?.value as any)?.src || isEditing) && (
                    <Image field={imageField} alt="" className={cn(
                      "block w-full object-cover object-top h-[235px] md:h-full",
                      "md:min-h-[372px]"
                    )} />
                  )}
                </div>
                {(imageSubheadlineField?.value || isEditing) && (
                  <div className="mt-2 w-full px-2 text-sm text-gray-600 flex justify-center">
                    <Text field={imageSubheadlineField} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export const Default: FC<HorizontalTeaserProps> = (props) => (
  <HorizontalTeaserLayout {...props} variant={HorizontalTeaserVariants.Default} />
);

export const BrandButton: FC<HorizontalTeaserProps> = (props) => (
  <HorizontalTeaserLayout {...props} variant={HorizontalTeaserVariants.BrandButton} />
);

export const ImageFullView: FC<HorizontalTeaserProps> = (props) => (
  <HorizontalTeaserLayout {...props} variant={HorizontalTeaserVariants.ImageFullView} />
);

export const TitleMedium: FC<HorizontalTeaserProps> = (props) => (
  <HorizontalTeaserLayout {...props} variant={HorizontalTeaserVariants.TitleMedium} />
);

export const ContentHeight: FC<HorizontalTeaserProps> = (props) => (
  <HorizontalTeaserContentHeightLayout {...props} variant={HorizontalTeaserVariants.ContentHeight} />
);

export default Default;

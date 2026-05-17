// @ts-nocheck
'use client';
import {
  useSitecore,
  Text,
  RichText,
  Image,
  Link,
  Placeholder,
} from '@sitecore-content-sdk/nextjs';
import { ChevronRight, Phone } from 'lucide-react';

import { EntityReferenceProps, type EntityReferenceItem } from './EntityReference.props';

import { cn } from '@/lib/utils';
import { createSafeHtml } from '@/lib/sanitize';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { patchLinkField } from '@/lib/patch-link';
import { useSiteName } from '@/hooks/useSiteName';

type NormalizedItem = {
  id: string;
  item: EntityReferenceItem;
};

export const EntityReferenceVariants = {
  Default: 'Default',
  ImageFullView: 'Image Full View',
  ImageResize: 'Image Resize',
  ListSparse: 'List Sparse',
  TitleMedium: 'Title Medium',
  TrimmedWidth: 'Trimmed Width',
  YellowBack: 'Yellow Back',
  FullImageHeight: 'Full Image Height',
  FixedHeight: 'Fixed Height',
  OneThirdWidth: 'One Third Image',
  ContentSpaceHeight: 'Content Space Height',
  ImageWidth: 'Image Width',
  ImageResizeThird: 'imageResizeThird',
} as const;

type EntityReferenceVariant =
  (typeof EntityReferenceVariants)[keyof typeof EntityReferenceVariants];

const EntityReferenceLayout: React.FC<
  EntityReferenceProps & { variant: EntityReferenceVariant }
> = (props) => {
  const { fields, rendering, variant } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const siteName = useSiteName();

  // Resolve datasource
  const datasource = (fields as any)?.data?.datasource || fields;

  // Resolve fields (keep as objects for SDK components)
  // Ultra-safe resolution: ensure .value exists
  const rawTitle = datasource?.Title?.jsonValue || datasource?.Title;
  const titleField = rawTitle && rawTitle.value ? rawTitle : { value: '' };

  const rawSubTitle = datasource?.SubTitle?.jsonValue || datasource?.SubTitle;
  const subTitleField = rawSubTitle && rawSubTitle.value ? rawSubTitle : { value: '' };

  const rawDescription = datasource?.Description?.jsonValue || datasource?.Description;
  const descriptionField =
    rawDescription && rawDescription.value ? rawDescription : { value: '' };

  const items = datasource?.Items?.targetItems || datasource?.Items || [];

  // Normalize and filter items
  const normalizedItems: NormalizedItem[] = items
    .map((item, index) => ({
      id: item.id ?? `entity-ref-${index}`,
      item,
    }))
    .filter((normalizedItem) => {
      const { item } = normalizedItem;
      const itemFields = item.fields || item;

      const titleValue =
        itemFields?.Title?.value?.trim() || itemFields?.Title?.jsonValue?.value?.trim();
      const descriptionValue =
        itemFields?.Description?.value?.trim() ||
        itemFields?.Description?.jsonValue?.value?.trim();
      const hasImage = Boolean(
        itemFields?.Image?.value?.src || itemFields?.Image?.jsonValue?.value?.src,
      );
      const hasLink = Boolean(
        itemFields?.Link?.value?.href || itemFields?.Link?.jsonValue?.value?.href,
      );

      // In editing mode, show items with at least a title
      if (isPageEditing) {
        return true;
      }

      // In normal mode, require at least one piece of content (Title, Description, Image, or Link)
      return Boolean(titleValue || descriptionValue || hasImage || hasLink);
    });

  // Show fallback only if absolutely no data and not editing
  // In editing mode, we want to render the structure so authors can add content
  if (!datasource && !isPageEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'EntityReference'} />;
  }

  const hasSubTitle = Boolean(subTitleField?.value);
  const hasDescription = Boolean(descriptionField?.value);
  const shouldRenderSubTitle = Boolean(hasSubTitle || isPageEditing);
  const shouldRenderDescription = Boolean(hasDescription || isPageEditing);

  const isDefault =  variant === EntityReferenceVariants.Default;
  const hasFullImageHeight = variant ===  EntityReferenceVariants.ImageFullView;
  const isImageResize = variant === EntityReferenceVariants.ImageResize;
  const hasMoreLiSpace = variant === EntityReferenceVariants.ListSparse;
  const isTitleMedium = variant === EntityReferenceVariants.TitleMedium;
  const isTrimmedWidth = variant === EntityReferenceVariants.TrimmedWidth;
  const isFixedHeight = variant === EntityReferenceVariants.FixedHeight;
  const isOneThirdImage =
    variant === EntityReferenceVariants.OneThirdWidth ||
    rendering?.params?.FieldNames === 'OneThirdImage' ||
    rendering?.params?.FieldNames === 'One Third Image';
  const isContentSpaceHeight = variant === EntityReferenceVariants.ContentSpaceHeight;
  const isImageResizeThird =
    variant === EntityReferenceVariants.ImageResizeThird ;
  const isMinWidth =  variant === EntityReferenceVariants.ImageWidth;

  return (
    <section
      className="mb-12 lg:mb-18"
      data-component="EntityReference"
      data-variant={variant}
    >
      <div className="mx-auto max-w-[1360px] px-2 md:px-[10px]">
        <div className="flex flex-col gap-6">
          <Text
            tag={isTitleMedium ? "h3" : "h2"}
            className={isTitleMedium ? "font-heading-h3" : "font-heading-h2"}
            field={titleField}
          />
          {shouldRenderSubTitle && (
            <Text
              tag="h4"
              className="font-heading-h4 m-0 md:my-10 [&_h4]:m-0! [&_h4]:text-[18px]! lg:[&_h4]:text-[22px]!"
              field={subTitleField}
            />
          )}
          {shouldRenderDescription && (
            <div className="rte-content entity-ref-style text-[17px]!  lg:text-[18px]! font-normal! [&_p:last-child]:mb-0! [&_h4]:m-0! [&_h4]:text-[18px]! lg:[&_h4]:text-[22px]!">
              <RichText field={descriptionField} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-16 md:gap-20 xl:gap-24">
          {normalizedItems.map(({ id, item }) => {
            const itemFields = item.fields || item;

            // Ultra-safe field resolution: ensure .value exists and is not null
            // We must pass the original field object (even if value is empty) to enable inline editing
            const itemTitleField = itemFields?.Title ?? { value: '' };
            const itemDescriptionField = itemFields?.Description ?? { value: '' };

            // Stronger check for image: if no src, use fallback.
            // This handles cases where Sitecore returns { value: {} } which is truthy but crashes SDK.
            const rawImage = itemFields?.Image;
            const hasImageSrc = rawImage?.value?.src || rawImage?.jsonValue?.value?.src;
            // Pass rawImage if it exists to enable editing, otherwise fallback
            const imageField = rawImage ?? { value: { src: '' } };

            const rawLinkField = itemFields?.Link ?? { value: { href: '' } };
            const linkField = patchLinkField(rawLinkField, siteName) ?? rawLinkField;
            const rawCaption = itemFields?.Caption;
            const captionField = rawCaption?.jsonValue || rawCaption || { value: '' };

            // Robust parsing for LeftAligned
            // Handles boolean (Checkbox) and string (Single-Line Text) values
            // Handles "1", "0", "true", "false" strings
            const rawLeftValue =
              itemFields?.LeftAligned?.value ?? itemFields?.LeftAligned?.jsonValue?.value;
            const isImageLeft = String(rawLeftValue ?? '').trim() === '1';
            const hasMedia = Boolean(hasImageSrc) || isPageEditing;
            const hasValidLink =
              Boolean(linkField?.value?.href || linkField?.jsonValue?.value?.href) ||
              isPageEditing;
            const ctaText =
              linkField?.value?.text?.trim() || linkField?.jsonValue?.value?.text?.trim();

            const hasCaption = Boolean(captionField?.value);

            return (
              <article
                key={id}
                className={cn(
                  "flex flex-col md:grid md:grid-cols-12 md:gap-6 lg:gap-8",
                  hasFullImageHeight ? "gap-0 lg:gap-4" : "gap-4",
                  isTrimmedWidth && 'lg:w-full lg:ml-0',
                  isContentSpaceHeight && 'md:items-stretch'
                )}
              >
                {isPageEditing && (
                  <div className="col-span-12 mb-2 border border-dashed border-gray-400 p-2">
                    <span className="mr-2 text-sm font-bold">Left Aligned (1=Yes, 0=No):</span>
                    {/* Render boolean field as Text to enable inline editing */}
                    <Text field={itemFields.LeftAligned as any} />
                  </div>
                )}

                {/* Content - position varies based on isImageLeft */}
                <div
                  className={cn(
                    'flex flex-col items-start gap-1 md:col-span-6',
                    isOneThirdImage && 'md:col-span-8',
                    isTrimmedWidth && 'lg:col-span-6',
                    isImageResizeThird && 'md:col-span-8',
                    (isImageResize) && 'md:col-span-6',
                    isImageLeft
                      ? 'order-2 md:order-2 '
                      : 'order-1 md:order-1 md:justify-self-start'
                  )}
                >
                  {(itemTitleField?.value || isPageEditing) && (
                    <Text
                      tag="h3"
                      className="font-heading-h3"
                      field={itemTitleField}
                    />
                  )}


                  {(itemDescriptionField?.value || isPageEditing) && (
                    <div className={cn(
                      "font-body rte-content entity-ref-style min-h-[20px] text-[17px]! lg:text-[18px]!",
                      hasMoreLiSpace && "[&_li]:my-4!",
                      "[&_p]:mb-4 [&_h4]:m-0! [&_h4]:text-[18px]! lg:[&_h4]:text-[22px]! [&_p:last-child]:mb-0! [&_li::marker]:text-[14px]!",
                      "[&_ol]:m-0! ",
                      isContentSpaceHeight && "[&_ul]:m-0!"
                    )}>
                      <RichText field={itemDescriptionField as any} />
                    </div>
                  )}

                  {hasValidLink && (
                    <Link
                      field={linkField as any}
                      className="group inline-flex items-center gap-2 no-underline transition-opacity duration-200 hover:opacity-85"
                    >
                      <span className="font-heading relative text-lg leading-[1.5] font-bold after:absolute after:bottom-[-0.25rem] after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-[width] after:duration-200 group-hover:after:w-full">
                        {ctaText || linkField?.value?.text || 'Read More'}
                      </span>
                      <span
                        className="inline-flex h-6 w-6 items-center justify-center transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      >
                        <ChevronRight strokeWidth={2.5} size={20} />
                      </span>
                    </Link>
                  )}


                </div>

                {/* Image - position varies based on isImageLeft */}
                {hasMedia && (
                  <div
                    className={cn(
                      'relative -mx-2 md:mx-0 mb-2 md:mb-0',
                      isContentSpaceHeight
                        ? 'sm:h-auto md:h-auto md:self-stretch'
                        : 'sm:h-[60vw] md:max-h-[981px]',
                      isImageResize
                        ? 'md:col-span-6 md:h-auto  md:self-center '
                        : isImageResizeThird
                          ? 'md:col-span-4 md:h-auto  md:self-center '
                          : isTrimmedWidth
                          ? 'lg:col-span-4 col-span-6  md:h-[422px] lg:w-full  md:max-w-[422px] '
                          : isOneThirdImage
                            ? 'md:col-span-4 md:min-h-[375px]'
                            : 'md:col-span-6 md:min-h-[375px] ',
                      isImageLeft ? 'order-1 md:order-1 ' : 'order-2 md:order-2 ',
                      hasCaption && "h-[436px]",
                      hasFullImageHeight && ' h-[130vw] sm:h-[120vw] md:h-[75vw] lg:h-[65vw] xl:h-[55vw] 2xl:h-[40vw]',
                      isFixedHeight && 'sm:h-[654px]',
                      isContentSpaceHeight && 'md:h-full',
                      isMinWidth && 'md:h-[375px]'
                    )}
                  >
                    <Image
                      field={imageField}
                      className={cn(
                        'h-full w-full object-cover object-center',
                        isImageResize && 'object-fill',
                        isMinWidth && 'object-cover'
                      )}
                      loading="lazy"
                    alt={itemTitleField?.value || 'Entity reference image'}
                    />
                      {(captionField?.value || isPageEditing) && (
                    <RichText
                      field={captionField as any}
                      className="rte-content pt-1! mb-2! md:mb-0! leading-[20px]! text-[14px]!  text-center!"
                    />
                  )}
                  </div>
                )}

                {isTrimmedWidth && (
                  <div
                    className={cn(
                      'hidden lg:block lg:col-span-2',
                      isImageLeft ? 'lg:order-3' : 'lg:order-3'
                    )}
                    aria-hidden="true"
                  />
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};



/**
 * YellowBack variant - Split layout with image on left and yellow background on right
 * Container size: 1901x950
 */
export const YellowBack: React.FC<EntityReferenceProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  // Resolve datasource
  const datasource = (fields as any)?.data?.datasource || fields;

  const items = datasource?.Items?.targetItems || datasource?.Items || [];

  // Normalize and filter items
  const normalizedItems: NormalizedItem[] = items
    .map((item, index) => ({
      id: item.id ?? `entity-ref-${index}`,
      item,
    }))
    .filter((normalizedItem) => {
      const { item } = normalizedItem;
      const itemFields = item.fields || item;

      const rawCaption = itemFields?.Caption;
      const itemCaptionField =
        rawCaption?.jsonValue || rawCaption || { value: '' };
      let hasCaption =
        Boolean(itemCaptionField?.value?.trim?.()) || isPageEditing;

      const titleValue =
        itemFields?.Title?.value?.trim() || itemFields?.Title?.jsonValue?.value?.trim();
      const descriptionValue =
        itemFields?.Description?.value?.trim() ||
        itemFields?.Description?.jsonValue?.value?.trim();
      const hasImage = Boolean(
        itemFields?.Image?.value?.src || itemFields?.Image?.jsonValue?.value?.src,
      );
      const hasLink = Boolean(
        itemFields?.Link?.value?.href || itemFields?.Link?.jsonValue?.value?.href,
      );

      // In editing mode, show items with at least a title
      if (isPageEditing) {
        return true;
      }

      // In normal mode, require at least one piece of content (Title, Description, Image, or Link)
      return Boolean(titleValue || descriptionValue || hasImage || hasLink);
    });

  // Show fallback only if absolutely no data and not editing
  // In editing mode, we want to render the structure so authors can add content
  if (!datasource && !isPageEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'EntityReference'} />;
  }

  return (
    <section
      className="mb-12 lg:mb-18"
      data-component="EntityReference"
      data-variant={EntityReferenceVariants.YellowBack}
    >
      <div className="flex flex-col gap-0">
        {normalizedItems.map(({ id, item }) => {
          const itemFields = item.fields || item;

          // Parse LeftAligned field for image positioning
          const rawLeftValue =
            itemFields?.LeftAligned?.value ?? itemFields?.LeftAligned?.jsonValue?.value;
          const isImageLeft = String(rawLeftValue ?? '').trim() === '1';

          // Ultra-safe field resolution: ensure .value exists and is not null
          // We must pass the original field object (even if value is empty) to enable inline editing
          const itemTitleField = itemFields?.Title ?? { value: '' };
          const itemSubTitleField = itemFields?.SubTitle ?? { value: '' };
          const itemDescriptionField = itemFields?.Description ?? { value: '' };
          const itemPhoneField = itemFields?.Phone ?? { value: '' };

          // Stronger check for image: if no src, use fallback.
          // This handles cases where Sitecore returns { value: {} } which is truthy but crashes SDK.
          const rawImage = itemFields?.Image;
          const hasImageSrc = rawImage?.value?.src || rawImage?.jsonValue?.value?.src;
          // Pass rawImage if it exists to enable editing, otherwise fallback
          const imageField = rawImage ?? { value: { src: '' } };

          const hasMedia = Boolean(hasImageSrc) || isPageEditing;
          const hasItemTitle = Boolean(itemTitleField?.value);
          const hasItemSubTitle = Boolean(itemSubTitleField?.value);
          const hasItemDescription = Boolean(itemDescriptionField?.value);
          const phoneNumber =
            itemPhoneField?.value?.trim() ||
            itemPhoneField?.jsonValue?.value?.trim() ||
            (itemPhoneField?.value && String(itemPhoneField.value).trim()) ||
            '';
          const hasPhoneNumber = Boolean(phoneNumber) || isPageEditing;
          const shouldRenderItemTitle = Boolean(hasItemTitle || isPageEditing);
          const shouldRenderItemSubTitle = Boolean(hasItemSubTitle || isPageEditing);
          const shouldRenderItemDescription = Boolean(hasItemDescription || isPageEditing);
          const shouldRenderPhone = Boolean(hasPhoneNumber);
          const hasCaption = Boolean(itemFields?.Caption?.value?.trim?.()) || isPageEditing;

          return (
            <div
              key={id}
              className="relative mx-auto w-full overflow-hidden lg:aspect-[1901/950]"
            >
              <div
                className={cn(
                  'flex w-full flex-col lg:h-full lg:flex-row',
                  isImageLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
                )}
              >
                {/* Image - Position varies based on isImageLeft */}
                {hasMedia && (
                  <div
                    className={cn(
                      'relative mx-auto w-full  flex-shrink-0 overflow-hidden lg:mx-0 lg:h-full lg:w-1/2 lg:max-w-none',
                      'md:col-span-6 md:min-h-[375px] ',
                      isImageLeft ? 'order-1 md:order-1 ' : 'order-2 md:order-2 ',
                      hasCaption && "h-[436px]"
                    )}
                  >
                    <Image
                      field={imageField}
                      className={cn(
                        'h-full w-full object-cover object-center',
                      )}
                      loading="lazy"
                      alt={itemTitleField?.value || 'Entity reference image'}
                    />
                    {/* CAPTION BELOW IMAGE */}
                    {hasCaption && (
                      <RichText
                        field={itemCaptionField as any}
                         className="rte-content pt-1! leading-[20px]! text-[14px]!  text-center!"
                      />
                    )}
                  </div>
                )}

                {/* Content - Position varies based on isImageLeft */}
                <div
                  className={cn(
                    'relative flex w-full flex-shrink-0 flex-col items-start bg-[rgba(249,226,68,.7)] px-[1.125rem] py-[1.875rem] lg:h-full lg:w-1/2 lg:py-[6rem] lg:pr-[2.25rem] lg:pb-[3.125rem] lg:pl-[3.75rem]',
                    isImageLeft ? 'lg:order-2' : 'lg:order-1'
                  )}
                >
                  {/* Main headline */}
                  {shouldRenderItemTitle && (
                    <Text
                      tag="h2"
                      className="font-heading-h2 mb-[1.875rem] text-[36px] leading-[36px] font-bold text-black md:text-[60px] md:leading-[2.25rem] lg:mb-[3.125rem] lg:text-[80px] lg:leading-[3.5rem] xl:leading-[5rem]"
                      field={itemTitleField}
                    />
                  )}

                  {/* Subtitle */}
                  {shouldRenderItemSubTitle && (
                    <Text
                      tag="h3"
                      className="font-heading-h3"
                      field={itemSubTitleField}
                    />
                  )}

                  {/* Description */}
                  {shouldRenderItemDescription && (
                    <div className="rte-content leading-relaxed! font-normal! text-black! [&_h6]:text-[17px]! md:[&_h6]:text-[20px]!  md:[&_p]:text-[20px]! [&_h4]:m-0! [&_h4]:text-[18px]! lg:[&_h4]:text-[22px]! [&_p:last-child]:mb-0!">
                      <RichText field={itemDescriptionField as any} />
                    </div>
                  )}

                  {/* Phone */}
                  {shouldRenderPhone && (
                    <div className="mt-6 flex items-center gap-3">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0 text-black/50 md:h-6 md:w-6" />
                      {isPageEditing ? (
                        <Text
                          field={itemPhoneField as any}
                          className="text-[14rem] text-black md:text-[20px]"
                        />
                      ) : phoneNumber ? (
                        <a
                          href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                          className="group relative text-[14rem] text-black no-underline transition-opacity duration-200 hover:opacity-85 md:text-[20px]"
                        >
                          <span className="relative after:absolute after:bottom-[-0.25rem] after:left-0 after:h-[2px] after:w-0 after:bg-black after:transition-[width] after:duration-200 group-hover:after:w-full">
                            {phoneNumber}
                          </span>
                        </a>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

/**
 * ImageResize variant - Same as Default but with reduced image height (approx half of 375px)
 */
export const ImageResize: React.FC<EntityReferenceProps> = (props) => {
  return <EntityReferenceLayout {...props} variant={EntityReferenceVariants.ImageResize} />;
};

/**
 * TrimmedWidth variant - Image takes 1/3 width, content takes 1/2 width
 */
export const TrimmedWidth: React.FC<EntityReferenceProps> = (props) => {
  return <EntityReferenceLayout {...props} variant={EntityReferenceVariants.TrimmedWidth} />;
};

export const Default: React.FC<EntityReferenceProps> = (props) => {
  return <EntityReferenceLayout {...props} variant={EntityReferenceVariants.Default} />;
};

export const ImageFullView: React.FC<EntityReferenceProps> = (props) => {
  return <EntityReferenceLayout {...props} variant={EntityReferenceVariants.ImageFullView} />;
};

export const ListSparse: React.FC<EntityReferenceProps> = (props) => {
  return <EntityReferenceLayout {...props} variant={EntityReferenceVariants.ListSparse} />;
};

export const TitleMedium: React.FC<EntityReferenceProps> = (props) => {
  return <EntityReferenceLayout {...props} variant={EntityReferenceVariants.TitleMedium} />;
};

export const FixedHeight: React.FC<EntityReferenceProps> = (props) => {
  return <EntityReferenceLayout {...props} variant={EntityReferenceVariants.FixedHeight} />;
};

export const OneThirdImage: React.FC<EntityReferenceProps> = (props) => {
  return <EntityReferenceLayout {...props} variant={EntityReferenceVariants.OneThirdImage} />;
};

export const ContentSpaceHeight: React.FC<EntityReferenceProps> = (props) => {
  return <EntityReferenceLayout {...props} variant={EntityReferenceVariants.ContentSpaceHeight} />;
};

export const ImageWidth: React.FC<EntityReferenceProps> = (props) => {
  return <EntityReferenceLayout {...props} variant={EntityReferenceVariants.ImageWidth} />;
};

export const ImageResizeThird: React.FC<EntityReferenceProps> = (props) => {
  return <EntityReferenceLayout {...props} variant={EntityReferenceVariants.ImageResizeThird} />;
};

export const imageResizeThird = ImageResizeThird;

export default Default;

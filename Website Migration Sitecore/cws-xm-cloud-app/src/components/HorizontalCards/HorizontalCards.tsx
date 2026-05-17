'use client';

import { Text, RichText, Image, Link, useSitecore } from '@sitecore-content-sdk/nextjs';

import { HorizontalCardsProps } from './HorizontalCards.props';

import { useSiteName } from '@/hooks/useSiteName';
import { patchLinkField } from '@/lib/patch-link';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

export const HorizontalCardsVariants = {
  Default: 'Default',
  TitleMedium: 'Title Medium',
  ContentImageHeight: 'Content Image Height',
  ImageFullView: 'Image Full View',
} as const;

type HorizontalCardsVariant =
  (typeof HorizontalCardsVariants)[keyof typeof HorizontalCardsVariants];

const HorizontalCardsLayout: React.FC<HorizontalCardsProps & { variant: HorizontalCardsVariant }> = (props) => {
  const { fields, rendering, variant } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const siteName = useSiteName();

  // Handle flexible field resolution
  const datasource: any = fields?.data?.datasource ?? (fields as any)?.datasource ?? fields;

  // Access main datasource fields - pass full field objects for PageEditor compatibility
  const titleField = datasource?.Title ?? datasource?.title;
  const itemsField = datasource?.Items ?? datasource?.items;
  const items = Array.isArray(itemsField?.targetItems)
    ? itemsField.targetItems
    : Array.isArray(itemsField)
      ? itemsField
      : [];

  // Don't render if no data and not editing
  const hasTitle = titleField?.value || (titleField as any)?.jsonValue?.value || isPageEditing;
  if (!hasTitle && items.length === 0 && !isPageEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'HorizontalCards'} />;
  }

  const styles = rendering?.params?.Styles || '';
  const isTitleMedium = variant === HorizontalCardsVariants.TitleMedium;
  const isContentImageHeight = variant === HorizontalCardsVariants.ContentImageHeight;
  const isFullImageWidth = variant === HorizontalCardsVariants.ImageFullView;

  return (
    <section className="mb-12 lg:mb-18" data-component="HorizontalCards">
      <div
        className={cn(
          'mx-auto px-2 md:px-[10px]',
          !isFullImageWidth && 'max-w-[1360px]',
          isFullImageWidth && 'px-0 md:max-w-none',
        )}
      >
        {/* Title */}
        {(titleField || isPageEditing) && (
          <div className={cn(isFullImageWidth && "mx-auto max-w-[1360px] px-2 md:px-[10px]")}>
            <Text
              tag={isTitleMedium ? "h3" : "h2"}
              field={titleField}
              className={isTitleMedium ? "font-heading-h3": "font-heading-h2"}
            />
          </div>
        )}

        {/* Items */}
        {(items.length > 0 || isPageEditing) && (
          <div className="flex flex-col gap-0">
            {items.map((item: any, index: number) => {
              // Access fields directly from child item - pass full field objects for PageEditor compatibility
              const itemTitleField = item?.fields?.Title;
              const itemDescriptionField = item?.fields?.Description;
              const itemImageField = item?.fields?.Image;
              const itemLinkField = item?.fields?.Link;
              const imageLeftPositionField = item?.fields?.['Image Left Position'];

              // Check for image value in both jsonValue and direct value formats
              const hasImageValue =
                itemImageField?.value?.src ||
                (itemImageField as any)?.jsonValue?.value?.src ||
                isPageEditing;

              // Check for title value
              const hasTitleValue =
                itemTitleField?.value || (itemTitleField as any)?.jsonValue?.value || isPageEditing;

              // Check for description value
              const hasDescriptionValue =
                itemDescriptionField?.value ||
                (itemDescriptionField as any)?.jsonValue?.value ||
                isPageEditing;

              // Check for link value
              const hasLinkValue =
                itemLinkField?.value?.href ||
                (itemLinkField as any)?.jsonValue?.value?.href ||
                isPageEditing;

              const patchedItemLink =
                hasLinkValue && itemLinkField
                  ? (patchLinkField(itemLinkField, siteName) ?? itemLinkField)
                  : itemLinkField;

              // Parse Image Left Position as single-line text field
              // Handles "1", "0", "true", "false", "left", etc. strings
              const rawLeftValue: string | undefined =
                imageLeftPositionField?.value ?? (imageLeftPositionField as any)?.jsonValue?.value;

              let imageLeft = false;
              if (typeof rawLeftValue === 'string') {
                const normalized = rawLeftValue.trim().toLowerCase();
                imageLeft = normalized === 'true' || normalized === '1' || normalized === 'left';
              }

              // Skip if no content and not editing
              if (!hasImageValue && !hasTitleValue && !hasDescriptionValue && !isPageEditing) {
                return null;
              }

              return (
                <div
                  key={item?.id || item?.itemId || index}
                  className={cn(
                    'flex min-h-[100px] flex-col items-start md:min-h-[350px] md:flex-row',
                    isContentImageHeight ? 'md:items-stretch' : 'md:items-start',
                    isFullImageWidth && 'md:items-center',
                  )}
                >
                  {/* Image Left Position field for PageEditor - render in editing mode for editability */}
                  {isPageEditing && imageLeftPositionField && (
                    <div className="mb-2 text-xs text-gray-500 md:mb-0">
                      <span className="mr-2">Image Left Position:</span>
                      <Text
                        field={(imageLeftPositionField as any)?.jsonValue ?? imageLeftPositionField}
                        className="inline-block text-xs"
                      />
                    </div>
                    
                  )}

                  {/* Image Section */}
                  {hasImageValue && (
                    <div
                      className={cn(
                        // Base styles
                        '-mx-2 flex w-[calc(100%+1rem)] items-center justify-center md:mx-0 md:w-1/2',
                        // Height classes based on variant
                        isFullImageWidth
                          ? 'h-auto'
                          : isContentImageHeight
                            ? 'h-auto'
                            : 'min-h-[100px] h-[300px] md:h-[372px]',
                        // Mobile: always order 1. Desktop: order based on checkbox
                        'order-1',
                        imageLeft ? 'md:order-1' : 'md:order-2',
                        isFullImageWidth && 'md:overflow-visible',
                      )}
                    >
                      {isFullImageWidth && hasLinkValue ? (
                        <Link field={patchedItemLink} className="block w-full h-full">
                          <Image
                            field={itemImageField}
                            className={cn(
                              'h-full w-full object-cover',
                              isFullImageWidth ? 'block w-full object-cover object-top md:p-0' : 'md:p-2',
                            )}
                            loading="lazy"
                            alt={''}
                          />
                        </Link>
                      ) : (
                        <Image
                          field={itemImageField}
                          className={cn(
                            'h-full w-full object-cover',
                            isFullImageWidth ? 'block w-full object-cover object-top md:p-0' : 'md:p-2',
                          )}
                          loading="lazy"
                          alt={''}
                        />
                      )}
                    </div>
                  )}

                  {/* Content Section */}
                  <div
                    className={cn(
                      'my-4 flex w-full flex-col justify-start gap-6 p-1 md:w-1/2',
                      // Mobile: always order 2. Desktop: order based on checkbox
                      'order-2',
                      imageLeft ? 'md:order-2 md:pl-7' : 'pr-2 md:order-1',
                      isFullImageWidth && (imageLeft ? 'md:max-w-[660px] md:h-full md:mr-auto' : 'md:max-w-[660px] md:h-full md:ml-auto'),
                      isFullImageWidth && 'md:justify-center',
                    )}
                  >
                    {/* Container for vertical centering */}
                    <div>
                      <div className="flex h-full flex-col items-start justify-start">
                        {hasTitleValue && (
                          <Text
                            tag="h4"
                            field={itemTitleField}
                            className="font-heading-h4 text-[18px]! lg:text-[22px]! m-0 mb-4!  md:mb-6! md:leading-[1.3]"
                          />
                        )}

                        {hasDescriptionValue && (
                          <RichText
                            field={itemDescriptionField}
                            className="text-base md:text-lg [&_h4]:m-0! [&_h4]:text-[18px]! lg:[&_h4]:text-[22px]!"
                          />
                        )}

                        {hasLinkValue && (
                          <Link
                            field={patchedItemLink}
                            className="mt-4 inline-flex h-12 items-center justify-center self-start rounded-2xl bg-(--color-accent-primary) px-16 text-base font-bold text-black no-underline transition-all duration-200 hover:bg-(--color-accent-primary) hover:text-white md:text-lg"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export const Default: React.FC<HorizontalCardsProps> = (props) => (
  <HorizontalCardsLayout {...props} variant={HorizontalCardsVariants.Default} />
);

export const TitleMedium: React.FC<HorizontalCardsProps> = (props) => (
  <HorizontalCardsLayout {...props} variant={HorizontalCardsVariants.TitleMedium} />
);

export const ContentImageHeight: React.FC<HorizontalCardsProps> = (props) => (
  <HorizontalCardsLayout {...props} variant={HorizontalCardsVariants.ContentImageHeight} />
);

export const ImageFullView: React.FC<HorizontalCardsProps> = (props) => (
  <HorizontalCardsLayout {...props} variant={HorizontalCardsVariants.ImageFullView} />
);

export default Default;

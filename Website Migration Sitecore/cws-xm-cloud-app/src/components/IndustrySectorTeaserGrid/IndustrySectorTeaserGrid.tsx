import React from 'react';
import { Text, RichText, useSitecore } from '@sitecore-content-sdk/nextjs';

import { IndustrySectorTeaserGridProps } from './IndustrySectorTeaserGrid.props';
import { Default as IndustrySectorTeaser } from '../IndustrySectorTeaser/IndustrySectorTeaser';
import { IndustrySectorTeaserProps } from '../IndustrySectorTeaser/industry-sector-teaser.props';

import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

/**
 * Helper to create IndustrySectorTeaser props from an item
 * Preserves original field structure with Sitecore metadata for Page Builder editing
 */
const createIndustrySectorTeaserProps = (item: any): IndustrySectorTeaserProps => {
  // Check if fields are nested under a 'fields' property (similar to AdvantageCards)
  const itemFields = item?.fields ?? item;

  // Preserve original field structure - pass fields with their original structure intact
  // If fields already have jsonValue, use it; otherwise wrap in jsonValue to match expected structure
  // This ensures Sitecore SDK components can access metadata needed for Page Builder editing
  return {
    fields: {
      data: {
        datasource: {
          // Preserve field structure - pass fields directly to maintain Sitecore metadata
          // The fields should maintain their original structure with jsonValue intact
          title: itemFields?.Title
            ? itemFields.Title.jsonValue
              ? { jsonValue: itemFields.Title.jsonValue }
              : { jsonValue: itemFields.Title }
            : undefined,
          image: itemFields?.Image
            ? itemFields.Image.jsonValue
              ? { jsonValue: itemFields.Image.jsonValue }
              : { jsonValue: itemFields.Image }
            : undefined,
          // Pass Caption field - handle case sensitivity
          caption: itemFields?.Caption
            ? itemFields.Caption.jsonValue
              ? { jsonValue: itemFields.Caption.jsonValue }
              : { jsonValue: itemFields.Caption }
            : itemFields?.caption
              ? itemFields.caption.jsonValue
                ? { jsonValue: itemFields.caption.jsonValue }
                : { jsonValue: itemFields.caption }
              : undefined,
          // Pass Link field - preserve structure for Page Builder editing
          // Always pass the field (even if empty) to enable editing in page builder
          link: itemFields?.Link
            ? itemFields.Link.jsonValue
              ? { jsonValue: itemFields.Link.jsonValue }
              : { jsonValue: itemFields.Link }
            : itemFields?.Link === undefined
              ? undefined
              : { jsonValue: itemFields.Link },
        },
      },
    },
    params: {},
    rendering: {
      componentName: 'IndustrySectorTeaser',
      uid: item?.id || item?.uid || item?.itemId, // Preserve item ID for proper field tracking
    },
  } as IndustrySectorTeaserProps;
};

export const Default: React.FC<IndustrySectorTeaserGridProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const initialDs: any =
    (fields as any)?.data?.datasource ??
    (fields as any)?.datasource ??
    (fields as any) ??
    (rendering as any)?.fields ??
    {};

  // Unwrap nested fields if present
  const ds: any =
    initialDs && typeof initialDs === 'object' && initialDs.fields ? initialDs.fields : initialDs;

  // Get Title field
  const titleField = ds?.Title?.jsonValue || ds?.Title;

  // Get IntroCopy field (RichText)
  const introCopyField = ds?.IntroCopy?.jsonValue || ds?.IntroCopy;

  // Get Items multilist - handle multiple formats (similar to AdvantageCards)
  const rawItems = ds?.Items;
  const itemsArray: any[] = rawItems?.targetItems ?? rawItems?.results ?? rawItems ?? [];

  const hasContent =
    Boolean(titleField?.value) || Boolean(introCopyField?.value) || itemsArray.length > 0;

  // Show placeholder in edit mode if no content
  if (isPageEditing && !hasContent) {
    return (
      <NoDataFallback componentName={rendering?.componentName ?? 'IndustrySectorTeaserGrid'} />
    );
  }

  // Don't render if no content in normal mode
  if (!hasContent) {
    return null;
  }

  return (
    <section
      className={cn('component industry-sector-teaser-grid mb-8 w-full mb-12 md:mb-[4.5rem]')}
      data-component="IndustrySectorTeaserGrid"
    >
      <div className="mx-auto max-w-[1360px] px-2 md:px-[10px]">
        {titleField && (
          <div className="mb-6 md:mb-8">
            <Text
              tag="h2"
              className="font-heading-h2 m-0 mt-[21px] mb-[48px] text-left"
              field={titleField}
            />
          </div>
        )}

        {introCopyField && (
          <div className="rte-content font-regular! mb-8! text-base! leading-[1.6]! md:mb-12! [&_p]:mb-3! [&_p:last-child]:mb-0!">
            <RichText field={introCopyField} />
          </div>
        )}

        {itemsArray.length > 0 && (
          <div
            className={cn(
              // Default: 1 column mobile, 2 columns tablet, 3 columns desktop
              'grid gap-8 sm:gap-6 sm:grid-cols-2 md:gap-6 lg:grid-cols-3',
              // Special cases
              itemsArray.length === 1 && 'md:grid-cols-2 lg:grid-cols-2',
              itemsArray.length === 2 && 'md:grid-cols-2 lg:grid-cols-2',
              // Mobile always 1 column
              'grid-cols-1',
            )}
          >
            {itemsArray.map((item, index) => {
              const teaserProps = createIndustrySectorTeaserProps(item);
              return (
                <IndustrySectorTeaser
                  key={item?.id || item?.itemId || index}
                  {...teaserProps}
                  itemCount={itemsArray.length}
                />
              );
            })}
          </div>
        )}

        {itemsArray.length === 0 && isPageEditing && (
          <div className="text-center text-gray-500">
            <p>No items selected. Please add items to the Items multilist field.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Default;

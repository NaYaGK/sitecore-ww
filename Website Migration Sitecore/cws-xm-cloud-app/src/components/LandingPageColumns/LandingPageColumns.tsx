'use client';

import { useSitecore, Text, Image, RichText } from '@sitecore-content-sdk/nextjs';
import type { FC } from 'react';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import type { LandingPageColumnsProps } from './LandingPageColumns.props';

export const LandingPageColumnsVariants = {
  Default: 'Default',
  TitleMedium: 'Title Medium',
  FourColumn: 'Four Column',
} as const;

const chunkBySize = <T,>(items: T[], size: number): T[][] => {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

type LandingPageColumnsVariant =
  (typeof LandingPageColumnsVariants)[keyof typeof LandingPageColumnsVariants];

const LandingPageColumnsLayout: FC<LandingPageColumnsProps & { variant: LandingPageColumnsVariant }> = (props) => {
  const { rendering, fields, variant } = props;
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing;

  const isDefault = variant === LandingPageColumnsVariants.Default;
  const isTitleMedium =  variant === LandingPageColumnsVariants.TitleMedium;
  const isFourColumn =  variant === LandingPageColumnsVariants.FourColumn;

  // Get the datasource - handle both direct fields and nested data.datasource
  const datasource = fields?.data?.datasource || fields;

  // Get field values with fallbacks
  const sectionTitle = datasource?.Title || { value: '' };

  // Handle treelist field - in XM Cloud, treelist items might be in different formats
  // Check if we have a treelist field with items
  // Match LinkList pattern: check datasource first, then fields fallback
  const landingColumnsItems = datasource?.LandingColumnsItems || fields?.LandingColumnsItems;

  let columns: any[] = [];

  if (landingColumnsItems) {
    // Handle different possible structures
    if (Array.isArray(landingColumnsItems)) {
      // Direct array of items
      columns = landingColumnsItems;
    } else if (Array.isArray(landingColumnsItems.targetItems)) {
      // Sitecore style with targetItems
      columns = landingColumnsItems.targetItems;
    } else if (Array.isArray(landingColumnsItems.children)) {
      // Alternative structure with children
      columns = landingColumnsItems.children;
    } else if (Array.isArray(landingColumnsItems.results)) {
      // GraphQL style with results
      columns = landingColumnsItems.results;
    }
  }

  // Check if we have content to display
  const hasContent = sectionTitle?.value || columns.length > 0 || isPageEditing;
  const shouldGroupByThree = isDefault;
  const groupedColumns = shouldGroupByThree ? chunkBySize(columns, 3) : [columns];

  // If in editing mode but no content, show placeholder
  if (isPageEditing && !hasContent) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center text-gray-500">
        <p>Landing Page Columns</p>
      </div>
    );
  }

  // If not editing and no content, don't render anything
  if (!hasContent) {
    return null;
  }

  return (
    <section
      className="mx-auto mb-4 max-w-[1360px] px-2 md:my-10 md:px-[10px]"
      data-component="LandingPageColumns" data-variant={variant}
    >
      <div className="">
        {(sectionTitle?.value || isPageEditing) && (
          <div className="mb-4 text-left md:mb-8">
            <Text
              tag={isTitleMedium ? "h3" : "h2"}
              field={sectionTitle}
              className={`${isTitleMedium ? "font-heading-h3" : "font-heading-h2"} pb-0! mb-0! md:-mb-4! md:pb-0`}
            />
          </div>
        )}

        {columns.length > 0 ? (
          // <div className={cn(
          //   'grid gap-x-8 gap-y-0 sm:grid-cols-2 md:gap-y-10',
          //   isFourColumn ? 'lg:grid-cols-4 lg:gap-y-0' : 'lg:grid-cols-3 lg:gap-y-2'
          // )}>
            <div className="flex flex-col">
            {groupedColumns.map((group, groupIndex) => (
              <div
                key={`group-${groupIndex}`}
                className={cn(
                  'grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:gap-x-6',
                  isFourColumn ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
                )}
              >
              {group.map((column, index) => {
              const itemIndex = groupIndex * 3 + index;
              // Resolve fields for the item
              const itemFields = column.fields || column;

              // Pass full field objects to SDK components to enable inline editing
              // The SDK handles jsonValue extraction internally while preserving metadata
              const titleField = itemFields?.Title || { value: '' };
              const descriptionField = itemFields?.Description || { value: '' };

              // Handle various case variations for the image field name
              const rawImage =
                itemFields?.Coloumimage || itemFields?.ColumnImage || itemFields?.Image;

              // Ensure image field has a value property for the SDK component
              // If rawImage is the field object (with value/jsonValue), pass it directly
              const imageField = rawImage || { value: {} };

              return (
                // <div
                //   key={`${column.id || 'col'}-${index}`}
                //   className={cn('mt-[40px] flex flex-col rounded-lg')}
                // >
                <div
                  key={`${column.id || 'col'}-${itemIndex}`}
                  className="mt-10 flex flex-col"
                >
                  {(imageField?.value?.src ||
                    imageField?.jsonValue?.value?.src ||
                    isPageEditing) && (
                    <div className="mb-1  lg:mb-3">
                      <Image
                        field={imageField}
                        // className="h-6 w-6 lg:h-12 lg:w-12"
                        className="h-12 w-12 object-contain"
                        alt={imageField?.value?.alt || imageField?.jsonValue?.value?.alt || ''}
                      />
                    </div>
                  )}
                  {(titleField?.value || titleField?.jsonValue?.value || isPageEditing) && (
                    <>
                      {(imageField?.value?.src || imageField?.jsonValue?.value?.src) ? (
                        isTitleMedium ? (
                          <h3 className="font-heading-h3 mb-8!">
                            <Text tag="span" field={titleField} />
                          </h3>
                        ) : (
                          <h4 className="font-heading-h4  text-[18px]! lg:text-[22px]! mb-14! lg:mb-16!">
                            <Text tag="span" field={titleField} />
                          </h4>
                        )
                      ) : (
                        <h2 className="font-heading-h2">
                          <Text tag="span" field={titleField} />
                        </h2>
                      )}
                    </>
                  )}
                  {(descriptionField?.value ||
                    descriptionField?.jsonValue?.value ||
                    isPageEditing) && (
                    <div className="text-[17px] md:text-lg ">
                      <div className="rte-content [&_h4]:!text-[22px]">
                        <RichText
                          tag="div"
                          field={descriptionField}
                          className="prose prose-indigo"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
              </div>
            ))}
          </div>
        ) : isPageEditing ? (
          <div className="py-8 text-gray-500">
            <p>No columns found.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export const Default: FC<LandingPageColumnsProps> = (props) => (
  <LandingPageColumnsLayout {...props} variant="Default" />
);

export const TitleMedium: FC<LandingPageColumnsProps> = (props) => (
  <LandingPageColumnsLayout {...props} variant="Title Medium" />
);

export const FourColumn: FC<LandingPageColumnsProps> = (props) => (
  <LandingPageColumnsLayout {...props} variant="Four Column" />
);

export default Default;

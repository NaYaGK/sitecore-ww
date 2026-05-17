'use client';

import React from 'react';
import { Text, Image, Link, RichText, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { Field, RichTextField } from '@sitecore-content-sdk/nextjs';

import type { CategoryListingProps, CategoryItem } from './Category-listing.props';
import { useSiteName } from '@/hooks/useSiteName';
import { patchLinkField } from '@/lib/patch-link';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

// Helper to normalize text fields
const asTextField = (f: any): Field<string> | undefined => {
  if (!f) return undefined;
  const v = f?.jsonValue ?? f;
  if (v == null) return undefined;
  if (typeof v === 'string') return { value: v } as Field<string>;
  if (typeof v?.value === 'string') return v as Field<string>;
  return undefined;
};

// Helper to normalize rich text fields
const asRichTextField = (f: any): RichTextField | undefined => {
  if (!f) return undefined;
  return (f?.jsonValue ?? f) as RichTextField;
};

// Helper to handle case-insensitive property access
const pickCI = (obj: any, names: string[]) => {
  if (!obj) return undefined;
  const keys = Object.keys(obj);
  for (const n of names) {
    const k = keys.find((kk) => kk.toLowerCase() === n.toLowerCase());
    if (k && obj[k] != null) return obj[k];
  }
  return undefined;
};

interface CategoryCardProps {
  item: CategoryItem;
  index: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ item, index }) => {
  const siteName = useSiteName();
  const fields = item.fields || item;

  const titleField = fields.Title?.jsonValue;
  const imageField = fields.Image?.jsonValue;
  const rawLinkField = fields.CTALink?.jsonValue;
  const linkField = rawLinkField ? (patchLinkField(rawLinkField, siteName) ?? rawLinkField) : rawLinkField;
  const altTextField = fields.AltText?.jsonValue;
  const captionField = fields.Caption?.jsonValue;

  const title = titleField?.value;
  const altText = altTextField?.value || title || 'Category image';
  const caption = captionField?.value;

  const hasImage = !!imageField?.value?.src;

  const cardContent = (
    <div className="group relative flex h-full w-full flex-row items-center overflow-hidden bg-white transition-all duration-300 md:flex-col md:items-stretch">
      <div className="relative aspect-square w-28 shrink-0 overflow-hidden bg-[#EBEBEB] p-3 md:w-full md:p-5">
        <div
          className={cn(
            'relative flex h-full w-full items-center justify-center transition-transform duration-300 group-hover:scale-105',
            !hasImage && 'border border-gray-300',
          )}
        >
          {hasImage && (
            <Image field={imageField} className="h-full w-full object-contain p-2" alt={altText} />
          )}
        </div>
      </div>
      {(title || caption) && (
        <div className="flex flex-1 flex-col justify-center px-4 py-0 text-left md:justify-start md:px-0 md:py-2">
          {title && (
            <h3 className="mb-0 text-[13px] font-bold text-gray-900 md:mb-2 md:text-[15px]">
              {titleField ? <Text field={titleField} /> : title}
            </h3>
          )}
          {caption && (
            <p className="mt-1 text-sm text-gray-600 md:mt-auto">
              {captionField ? <Text field={captionField} /> : caption}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (linkField?.value?.href) {
    return (
      <Link field={linkField} className="block h-full w-full">
        {cardContent}
      </Link>
    );
  }

  return <div className="h-full w-full">{cardContent}</div>;
};

export const Default: React.FC<CategoryListingProps> = (props) => {
  const { fields: initialFields, rendering, className } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  // Resolve datasource from multiple shapes (same pattern as ImageGallery)
  const initialDs: any =
    (initialFields as any)?.data?.datasource ??
    (initialFields as any)?.datasource ??
    initialFields ??
    (rendering as any)?.fields ??
    {};

  const ds: any =
    initialDs && typeof initialDs === 'object' && initialDs.fields ? initialDs.fields : initialDs;

  // Get fields with case-insensitive access
  const title = asTextField(pickCI(ds, ['Title', 'title']));
  const description = asRichTextField(pickCI(ds, ['Description', 'description']));

  // Get category items - handle both targetItems and direct array
  const categoryItemsRaw = pickCI(ds, ['CategoryItem', 'categoryItem', 'items']);
  const rawItems =
    categoryItemsRaw?.targetItems ||
    (Array.isArray(categoryItemsRaw) ? categoryItemsRaw : []) ||
    [];

  // Process items and extract fields
  const categoryItems = rawItems
    .map((item: any, index: number) => {
      const fields = item.fields || item;

      const titleField = pickCI(fields, ['Title', 'title']);
      const imageField = pickCI(fields, ['Image', 'image']);
      const ctaLinkField = pickCI(fields, ['CTALink', 'ctalink', 'link']);
      const altTextField = pickCI(fields, ['AltText', 'alttext', 'alt']);
      const captionField = pickCI(fields, ['Caption', 'caption']);

      // Check if image exists
      const imageUrl =
        imageField?.jsonValue?.value?.src || imageField?.value?.src || imageField?.src;

      return {
        id: item.id || `item-${index}`,
        fields: {
          Title: { jsonValue: titleField?.jsonValue || titleField || { value: '' } },
          Image: { jsonValue: imageField?.jsonValue || imageField || { value: { src: imageUrl } } },
          CTALink: {
            jsonValue: ctaLinkField?.jsonValue || ctaLinkField || { value: { href: '' } },
          },
          AltText: { jsonValue: altTextField?.jsonValue || altTextField || { value: '' } },
          Caption: { jsonValue: captionField?.jsonValue || captionField || { value: '' } },
        },
      };
    })
    .filter(Boolean);

  // Show fallback in editing mode without datasource
  if (isPageEditing && !(rendering as any).dataSource) {
    return <NoDataFallback componentName="Category Listing" />;
  }

  // Return null if no items
  if (categoryItems.length === 0) {
    return isPageEditing ? <div className="p-4">No category items found</div> : null;
  }

  return (
    <section className="mb-4 md:mb-16" data-component="CategoryListingSection">
      <div className="mx-auto max-w-[1360px] px-2 md:px-[10px]">
        {title?.value && (
          <Text
            tag="h2"
            field={title}
            className="mb-8 text-[30px] leading-8 font-bold text-gray-900 md:mb-8 md:text-[40px]"
          />
        )}

        {description && (
          <div className="mx-auto mb-8 max-w-3xl text-left md:mb-20">
            <RichText
              field={description}
              className="prose max-w-none text-[17px] text-gray-600 md:text-lg [&_p]:mb-4 [&_p]:leading-tight last:[&_p]:mb-0 md:[&_p]:leading-normal"
            />
          </div>
        )}

        <div className="-mx-3 flex flex-wrap">
          {categoryItems.map((item: CategoryItem, index: number) => (
            <div
              key={item.id || index}
              className="mb-6 flex w-full px-3 sm:w-1/2 lg:w-1/3 xl:w-1/4"
            >
              <CategoryCard item={item} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Default;

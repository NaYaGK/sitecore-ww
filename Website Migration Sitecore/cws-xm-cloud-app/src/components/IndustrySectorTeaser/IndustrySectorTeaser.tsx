// @ts-nocheck
import {
  Link,
  Text,
  Image,
  useSitecore,
  type Field,
  type ImageField,
  type LinkField,
} from '@sitecore-content-sdk/nextjs';
import { ChevronRight } from 'lucide-react';

import { IndustrySectorTeaserProps } from './industry-sector-teaser.props';

import { useSiteName } from '@/hooks/useSiteName';
import { patchLinkField } from '@/lib/patch-link';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

// Helper to convert any field format to Field<string>
const asTextField = (f: any): Field<string> | undefined => {
  if (!f) return undefined;
  const v = f?.jsonValue ?? f;
  if (v == null) return undefined;
  if (typeof v === 'string') return { value: v } as Field<string>;
  if (typeof v?.value === 'string') return v as Field<string>;
  return undefined;
};

// Helper to convert any field format to ImageField
const asImageField = (f: any): ImageField | undefined => {
  if (!f) return undefined;
  return f?.jsonValue ?? f;
};

// Helper to convert any field format to LinkField
const asLinkField = (f: any): LinkField | undefined => {
  if (!f) return undefined;
  const v = f?.jsonValue ?? f;
  if (v?.value?.href || v?.value?.id) return v as LinkField;
  return undefined;
};

// Helper: case-insensitive field access
const pickCI = (obj: any, names: string[]) => {
  if (!obj) return undefined;
  const keys = Object.keys(obj);
  for (const n of names) {
    const k = keys.find((kk) => kk.toLowerCase() === n.toLowerCase());
    if (k && obj[k] != null) return obj[k];
  }
  return undefined;
};

const hasMedia = (image?: ImageField, isPageEditing?: boolean): boolean => {
  if (image?.value?.src) return true;
  return Boolean(isPageEditing);
};

export const Default: React.FC<IndustrySectorTeaserProps> = (props) => {
  const { fields, rendering, itemCount } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const siteName = useSiteName();

  // FLEXIBLE FIELD RESOLUTION
  const initialDs: any =
    (fields as any)?.data?.datasource ??
    (fields as any)?.datasource ??
    (fields as any) ??
    (rendering as any)?.fields ??
    {};

  // Unwrap nested fields if present
  const ds: any =
    initialDs && typeof initialDs === 'object' && initialDs.fields ? initialDs.fields : initialDs;

  // Map fields using case-insensitive access
  const titleField = asTextField(pickCI(ds, ['title', 'Title']));
  const captionField = asTextField(pickCI(ds, ['caption', 'Caption']));
  const imageField = asImageField(pickCI(ds, ['image', 'Image']));
  // Access link field - handle both lowercase 'link' and uppercase 'Link'
  // The field structure is: { jsonValue: { value: { href: "...", text: "..." } } }
  const rawLinkField = (ds?.link ?? ds?.Link) as any;
  // Extract jsonValue to get the actual LinkField for the Link component
  // Provide fallback structure if field is empty to prevent rendering errors
  const resolvedLinkField = rawLinkField?.jsonValue
    ? (rawLinkField.jsonValue as LinkField)
    : rawLinkField?.value?.href || rawLinkField?.value?.id
      ? (rawLinkField as LinkField)
      : isPageEditing && rawLinkField
        ? (rawLinkField as LinkField)
        : undefined;

  const linkField = resolvedLinkField
    ? (patchLinkField(resolvedLinkField, siteName) ?? resolvedLinkField)
    : resolvedLinkField;

  // Derive CTA text from link field
  const linkValue = linkField?.value;
  const ctaText =
    typeof linkValue?.text === 'string' && linkValue.text.length > 0
      ? linkValue.text
      : typeof linkValue?.description === 'string' && linkValue.description.length > 0
        ? linkValue.description
        : undefined;

  // All fields are optional - component will render even if fields are missing
  // Only show fallback in editing mode if no fields are present at all
  if (isPageEditing && !titleField && !captionField && !imageField && !linkField) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'IndustrySectorTeaser'} />;
  }

  const hasValidLink = Boolean((linkField?.value as any)?.href);

  // Determine image size based on item count
  const getImageDimensions = () => {
    if (itemCount === 1 || itemCount === 2) {
      return 'w-full h-[70vw] sm:h-[40vw] md:max-h-[32rem]';
    } else {
      return 'w-full h-[70vw] sm:h-[40vw] md:max-h-[20rem]';
    }
  };


  // Image container content - use Sitecore SDK Image component for Page Builder editability
  const imageContent =
    imageField?.value?.src ? (
      <div className={`image-container relative block overflow-hidden ${getImageDimensions()}`}>
        <Image
          field={imageField}
          alt={imageField?.value?.alt || ''}
          className="w-full h-full object-cover  [&>img]:w-full [&>img]:h-full [&>img]:object-cover"
          loading="lazy"
        />
      </div>
    ) : null;


  return (
    <article data-component="IndustrySectorTeaser">
      {imageContent && (
        <div className="">
          {hasValidLink && linkField ? (
            <Link
              field={linkField}
              className="relative block h-full w-full overflow-hidden"
              aria-label={titleField?.value}
            >
              {imageContent}
            </Link>
          ) : (
            <div className="relative block h-full w-full overflow-hidden">{imageContent}</div>
          )}
        </div>
      )}
      <div className={`bg-(--color-accent-sectors) ${getImageDimensions()} h-auto! `}>
        <div className={`flex flex-col py-4 gap-2 px-4 lg:px-7 md:py-6 md:gap-0 md:pb-6 lg:pb-10`}>
          {(captionField || isPageEditing) && (
            <div className="font-body text-[17px]! lg:text-[18px]! text-black ">
              <Text field={captionField} />
            </div>
          )}

          {(titleField || isPageEditing) && (
            <>
              {hasValidLink && linkField ? (
                <Link
                  field={linkField}
                  className="inline-flex items-center gap-2 no-underline transition-opacity duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-outline)] pb-4"
                >
                  <Text
                    tag="h3"
                    className="m-0 mt-1 mb-1.75 text-[1.5625rem] leading-[1.9375rem] font-bold break-words sm:my-1.5 lg:mt-3.25 lg:mb-2.25 xl:text-[1.9rem] md:leading-[2.125rem] "
                    field={titleField}
                  />
                </Link>
              ) : (
                <div className="inline-flex items-center gap-2">
                  <Text
                    tag="h3"
                    className="m-0 text-[1.5625rem] leading-[1.9375rem] font-bold break-words lg:text-[1.6875rem] lg:leading-[2.125rem] xl:my-3.25 xl:mt-3.25 xl:mb-7.5"
                    field={titleField}
                  />
                </div>
              )}
            </>
          )}



          {hasValidLink && linkField && (
            <div>
              <Link
                field={linkField}
                className="group inline-flex items-center no-underline transition-opacity duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-outline)]"
                aria-label={ctaText}
              >
                <span
                  className="inline-flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center transition-transform duration-200"
                  aria-hidden="true"
                >
                  <ChevronRight strokeWidth={2.5} size={36} />
                </span>
                {ctaText && (
                  <span className="font-heading relative pb-0 text-[17px] lg:text-xl font-bold after:absolute after:bottom-[-0.1rem] after:left-0 after:h-[3px] after:w-0 after:bg-current after:transition-[width] after:duration-200 group-hover:after:w-full">
                    {ctaText}
                  </span>
                )}
              </Link>
            </div>
          )}

          {isPageEditing && linkField && !hasValidLink && (
            <div className="border border-dashed border-gray-400 p-2">
              <span className="mr-2 text-sm font-bold">Link:</span>
              <Link field={linkField}>Edit Link</Link>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default Default;

import React from 'react';
import { Text, RichText, Image, Link, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EntityReferenceItemProps } from './EntityReferenceItem.props';
import { patchLinkField } from '@/lib/patch-link';
import { useSiteName } from '@/hooks/useSiteName';

export const Default: React.FC<EntityReferenceItemProps> = (props) => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const siteName = useSiteName();
  if (!props) return null;
  const { fields } = props;

  // Resolve fields (handle both direct fields and jsonValue structure if needed)
  // When used as a rendering in a placeholder, fields are usually direct.
  const safeFields = fields || {};
  const titleField = safeFields.Title && safeFields.Title.value ? safeFields.Title : { value: '' };
  const descriptionField =
    safeFields.Description && safeFields.Description.value ? safeFields.Description : { value: '' };
  const imageField =
    safeFields.Image && safeFields.Image.value && safeFields.Image.value.src
      ? safeFields.Image
      : { value: { src: '' } };
  const rawLinkField =
    safeFields.Link && safeFields.Link.value && safeFields.Link.value.href
      ? safeFields.Link
      : { value: { href: '' } };
  const linkField = patchLinkField(rawLinkField, siteName) ?? rawLinkField;
  const leftAligned = safeFields.LeftAligned?.value;

  const hasMedia = Boolean(imageField?.value?.src) || isPageEditing;
  // Default to image on right if leftAligned is not specified (false)
  const isImageLeft = Boolean(leftAligned);
  const hasValidLink = Boolean(linkField?.value?.href) || isPageEditing;
  const ctaText = linkField?.value?.text?.trim();

  // Create a safe field for LeftAligned to be rendered by Text component
  // We convert boolean to string to avoid Text component crashing on boolean values
  const leftAlignedDisplayField = safeFields.LeftAligned
    ? { ...safeFields.LeftAligned, value: String(safeFields.LeftAligned.value) }
    : { value: 'false' };

  return (
    <article className={cn('flex flex-col gap-4 md:grid md:grid-cols-12 md:gap-6 lg:gap-8')}>
      {hasMedia && (
        <div
          className={cn(
            'relative -mx-2 max-h-[220px] w-screen overflow-hidden md:col-span-6 md:mx-0 md:h-[375px] md:max-h-[375px] md:w-full',
            !isImageLeft && 'md:order-2',
          )}
        >
          <Image
            field={imageField}
            className="h-full w-full object-cover"
            loading="lazy"
            alt={''}
          />
        </div>
      )}

      <div
        className={cn(
          'flex flex-col justify-center gap-3 md:col-span-6 md:justify-self-end',
          !isImageLeft && 'md:order-1',
        )}
      >
        <Text tag="h3" className="font-heading-h3 m-0  md:my-4" field={titleField} />

        {(descriptionField?.value || isPageEditing) && (
          <div className="rte-content entity-ref-style font-body min-h-[20px]! text-[17px]! leading-7 md:px-8! md:text-lg [&_li]:my-4 [&_p]:mb-4! [&_p:first-child]:mt-0! [&_p:last-child]:mb-0!">
            <RichText className="[&_p:first-child]:mt-0! [&_p:last-child]:mb-0!" field={descriptionField as any} />
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
    </article>
  );
};

export default Default;

'use client';
import { Link, Image, useSitecore } from '@sitecore-content-sdk/nextjs';

import { LogosProps } from './Logos.props';

import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

export const Default: React.FC<LogosProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const titleValue = fields?.Title?.value;
  const logoItems = fields?.Logos ?? [];

  if (!fields || (logoItems.length === 0 && !isPageEditing)) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'Logos'} />;
  }

  const hasTitle = Boolean(titleValue?.trim());

  return (
    <section className="mb-4 md:mb-16" data-component="Logos">
      <div className="mx-auto max-w-[1360px] px-2 md:px-[10px]">
        {hasTitle && (
          <div className="mb-8 md:mb-12">
            <h2 className="m-0 text-[30px] leading-[1.2] font-bold md:text-[35px]">{titleValue}</h2>
          </div>
        )}

        <div
          className="grid gap-6 py-30 md:gap-8 md:py-0"
          style={{ gridTemplateColumns: 'repeat(3, 425.33px)' }}
        >
          {logoItems.map((logo, index) => {
            // Access fields directly from child item - pass full field objects for PageEditor compatibility
            // The Image and Link components will extract jsonValue internally while preserving field metadata
            const imageField = logo.fields?.Image;
            const linkField = logo.fields?.Link;
            const altField = logo.fields?.AltText;

            // Check for image value in both jsonValue and direct value formats
            const hasImageValue =
              imageField?.value?.src || (imageField as any)?.jsonValue?.value?.src || isPageEditing;

            if (!hasImageValue) {
              return null;
            }

            // Get alt text from AltText field or image field, with fallbacks
            const altText =
              (typeof altField?.value === 'string' ? altField.value : '') ||
              (typeof (altField as any)?.jsonValue?.value === 'string'
                ? (altField as any).jsonValue.value
                : '') ||
              (typeof imageField?.value?.alt === 'string' ? imageField.value.alt : '') ||
              (typeof (imageField as any)?.jsonValue?.value?.alt === 'string'
                ? (imageField as any).jsonValue.value.alt
                : '') ||
              logo.displayName ||
              'Logo';

            // Check for valid link in both jsonValue and direct value formats
            const hasValidLink =
              Boolean(linkField?.value?.href) ||
              Boolean((linkField as any)?.jsonValue?.value?.href);

            const logoImage = (
              <div className="flex h-[300px] w-[400px] items-center justify-center md:h-full md:w-full md:items-center md:justify-center">
                <Image
                  field={imageField}
                  alt={altText}
                  className="w-2/3 object-contain md:h-full md:w-full"
                  loading="lazy"
                />
              </div>
            );

            return (
              <div
                key={logo.id || index}
                className="flex items-center justify-center"
                style={{ width: '425.33px', height: '425.33px' }}
              >
                {hasValidLink && linkField ? (
                  <Link
                    field={linkField}
                    className="block h-full w-full transition-opacity duration-200 hover:opacity-80"
                    aria-label={altText}
                  >
                    {logoImage}
                  </Link>
                ) : (
                  logoImage
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Default;

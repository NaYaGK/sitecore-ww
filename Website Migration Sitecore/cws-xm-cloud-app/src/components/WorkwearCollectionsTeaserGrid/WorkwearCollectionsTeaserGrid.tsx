'use client';

import React from 'react';
import { Link, Image, Text } from '@sitecore-content-sdk/nextjs';
import type { WorkwearCollectionsTeaserGridProps, WorkwearCollectionsTeaserGridDatasource } from './WorkwearCollectionsTeaserGrid.props';
import { useSiteName } from '@/hooks/useSiteName';
import { patchLinkField } from '@/lib/patch-link';

const Default: React.FC<WorkwearCollectionsTeaserGridProps> = ({ rendering }) => {
  const siteName = useSiteName();
  // Cast rendering.fields to our expected datasource type
  const datasource = (rendering?.fields as unknown) as WorkwearCollectionsTeaserGridDatasource;
  const teasers = Array.isArray(datasource?.ProductListing) ? datasource.ProductListing : [];

  return (
    <section className="mb-16 w-full" data-component="WorkwearCollectionsTeaserGrid">
      <div className="mx-auto max-w-[1360px] px-2 md:px-[10px]">
        {datasource?.Title && (
          <div className="mb-6 md:mb-16">
            <Text field={datasource.Title} tag="h2" className="font-heading-h2" />
          </div>
        )}
        <div className="mx-auto grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-x-10 md:gap-y-0">
          {teasers.map((teaser, index) => {
            if (!teaser?.fields) return null;

            // Ensure we have a valid link field or fallback to ensure rendering
            const rawLinkField = teaser.fields.CTALink?.value?.href
              ? teaser.fields.CTALink
              : { ...teaser.fields.CTALink, value: { ...teaser.fields.CTALink?.value, href: '#' } };
            const linkField = patchLinkField(rawLinkField, siteName) ?? rawLinkField;

            return (
              <div key={teaser.id || `teaser-${index}`} className="mb-8 w-full md:mb-8">
                <Link
                  field={linkField}
                  className="group flex h-full flex-col no-underline"
                  title={teaser.fields.Title?.value}
                >
                  <div className="relative mb-2 w-full overflow-hidden rounded bg-[#f8f8f8] pt-[100%] md:mb-2">
                    <Image
                      field={teaser.fields.image}
                      className="absolute inset-0 h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.10]"
                      alt={teaser.fields.Title?.value || ''}
                      loading="lazy"
                    />
                  </div>
                  <h3 className="inline-block text-[17px] font-bold underline decoration-2 underline-offset-[5px] md:decoration-gray-500 md:decoration-2 2xl:md:decoration-4">
                    <Text field={teaser.fields.Title} />
                  </h3>
                  <div className="mt-2 text-[17px]">
                    <Text field={teaser.fields.CTAText} />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Default;

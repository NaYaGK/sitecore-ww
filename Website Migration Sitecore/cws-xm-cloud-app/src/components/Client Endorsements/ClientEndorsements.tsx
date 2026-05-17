import React from 'react';
import { Text, RichText, Image, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ClientEndorsementsProps } from './ClientEndorsements.props';
import { cn } from '@/lib/utils';

export const Default: React.FC<ClientEndorsementsProps> = (props) => {
  const { fields } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing;

  // Resolve datasource
  const datasource = (fields as any)?.data?.datasource || fields;

  // Helper for safe field resolution
  const getFieldValue = (field: any) => {
    if (!field) return { value: '' };
    if (field.jsonValue) return field.jsonValue;
    if (typeof field === 'object' && 'value' in field) return field;
    return { value: '' };
  };

  const titleField = datasource?.Title || { value: '' };
  const rawItems =
    datasource?.ClientEndorsementsItems?.targetItems || datasource?.ClientEndorsementsItems || [];

  // Normalize items
  const items = (Array.isArray(rawItems) ? rawItems : []).map((item: any, index: number) => {
    const f = item.fields || item;
    return {
      id: item.id || `endorsement-${index}`,
      description: f?.Description || { value: '' },
      image: f?.Image || { value: {} },
    };
  });

  const hasContent = Boolean(titleField?.value || items.length);

  if (!hasContent && !isEditing) {
    return null;
  }

  return (
    <section className="component client-endorsements py-16 md:py-24">
      <div className="container mx-auto max-w-[1360px] px-4">
        {(titleField?.value || isEditing) && (
          <div className="mb-12 text-left">
            <Text
              tag="h2"
              className="font-['Suisse\ Intl','Helvetica\ Neue',Arial,sans-serif] text-[24px] leading-[32px] font-bold md:mb-4 md:text-[28px] md:leading-[36px] lg:mb-4 lg:text-[28px] lg:leading-[40px]"
              field={titleField}
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col items-center">
              {(item.description?.value || isEditing) && (
                <div className="mb-6 text-lg leading-relaxed [&_img]:!h-[200px] [&_img]:!w-[350px] [&_img]:!object-cover">
                  <RichText field={item.description} />
                </div>
              )}

              <div className="mt-auto">
                <Image
                  field={item.image}
                  className="h-[200px] w-auto object-contain"
                  alt={item.image?.alt || ''}
                />
              </div>
            </div>
          ))}
        </div>

        {isEditing && items.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 p-4 text-center">
            No endorsements items found. Add items in Experience Editor.
          </div>
        )}
      </div>
    </section>
  );
};

export default Default;

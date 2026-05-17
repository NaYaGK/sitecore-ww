'use client';

import React from 'react';
import { Image, RichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { QuoteHighlightProps } from '../QuoteHighlight.props';
import { cn } from '@/lib/utils';

interface QuoteHighlightCwsStyleVariantProps extends QuoteHighlightProps {
  shouldPlaceImageLeft?: boolean;
  contentBackgroundColor: string;
}

const QuoteHighlightCwsStyleVariant: React.FC<QuoteHighlightCwsStyleVariantProps> = ({
  fields,
  shouldPlaceImageLeft = false,
  contentBackgroundColor,
}) => {
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing;

  if (!fields && !isPageEditing) {
    return null;
  }

  const signatureValue = fields?.Signature?.value?.trim();

  return (
    <section className="component quote-highlight mt-8 mb-12 w-full lg:mb-18">
      <div className="mx-auto w-full ">
        <div className={cn(
          'grid grid-cols-1 overflow-hidden lg:grid-cols-2',
          shouldPlaceImageLeft ? 'lg:grid-flow-col-dense' : ''
        )}>
          <div className={cn(
            'lg:h-auto lg:min-h-[550px]',
            shouldPlaceImageLeft ? 'lg:col-start-2' : ''
          )}>
            <Image
              field={fields?.Image}
              alt={fields?.Image?.value?.alt}
              className="h-full w-full object-cover object-center"
            />
          </div>

          <div
            className={cn(
              'px-5 py-6 md:px-8 md:py-8 lg:min-h-[550px] lg:px-14 lg:py-16',
              shouldPlaceImageLeft ? 'lg:col-start-1' : ''
            )}
            style={{ backgroundColor: contentBackgroundColor }}
          >
            <div className=" text-black">
              <div className="rte-content! [&_h2]:font-heading [&_h2]:font-bold! [&_h2]:text-[32px]! [&_h2]:leading-[38px]! [&_h2]:lg:text-[58px]! [&_h2]:lg:leading-[64px]! [&_h2]:my-3! [&_h2]:lg:my-8!">
                <RichText field={fields?.Title} className="rte-content" />
              </div>

              <div className="rte-content font-body text-[16px] leading-[23px] lg:text-[17px]! lg:leading-[28px] [&_p]:m-0 [&_p:first-child]:mb-2 [&_p:first-child]:font-bold [&_p:last-child]:mt-1">
                <RichText field={fields?.Description} />
              </div>

              {(isPageEditing || signatureValue) && (
                <Text
                  tag="p"
                  field={fields?.Signature}
                  className="font-body mt-4 text-[16px] leading-[22px] lg:mt-5 lg:text-[17px]! lg:leading-[28px]!"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuoteHighlightCwsStyleVariant;

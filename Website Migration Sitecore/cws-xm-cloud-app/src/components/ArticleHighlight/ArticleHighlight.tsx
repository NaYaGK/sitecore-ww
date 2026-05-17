'use client';

import React from 'react';
import { Image, RichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ArticleHighlightProps } from './ArticleHighlight.props';
import { cn } from '@/lib/utils';

const ArticleHighlight: React.FC<ArticleHighlightProps> = (props) => {
  const { fields } = props;
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing;

  if (!fields && !isPageEditing) {
    return null;
  }

  const bottomBgColor = fields?.BottomBackgroundColor?.value || 'transparent';

  return (
    <div className="component article-highlight my-8 w-full">
      <div className="mx-auto max-w-[1360px] px-2 lg:px-6 xl:px-4">
        <div className="rte-content mb-2! text-[17px]! leading-[28px]! font-medium! hyphens-manual! md:text-[20px]! [&_.bold-text]:font-bold! [&_.medium-text]:pl-3!">
          <RichText field={fields?.Title} />
        </div>

        {/* Content Section with Image */}
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 items-center lg:items-start">
          {/* Image */}
          <div className="min-w-[200px] px-10 md:px-0 md:w-[300px] min-h-[200px] md:min-h-[290px]">
            <Image
              field={fields?.Image}
              className="h-full w-full object-cover"
              alt={fields?.Image?.value?.altText || ''}
            />
          </div>

          {/* Content */}
          <div
            className="rte-content flex-1 font-body [&_p]:[margin-block:2px]! [&_p_strong]:inline! [&_p_strong]:p-0! [&_p_strong]:m-0! [&_strong]:block [&_p]:text-[17px] [&_p]:leading-[25px] [&_strong]:text-[18px] [&_strong]:leading-[28px] [&_strong]:antialiased"
            style={{ WebkitFontSmoothing: 'antialiased' }}
          >
            <RichText field={fields?.DescriptionTop} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleHighlight;

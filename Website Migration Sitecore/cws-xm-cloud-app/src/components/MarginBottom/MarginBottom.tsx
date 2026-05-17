'use client';

import React from 'react';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import type { MarginBottomProps } from './MarginBottom.props';

const MarginBottom: React.FC<MarginBottomProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  // Resolve datasource
  const datasource = fields?.data?.datasource || fields;

  // Get MarginBottom value
  // Check jsonValue first, then direct value
  const marginBottomField = datasource?.MarginBottom?.jsonValue || datasource?.MarginBottom;
  const marginBottomValue = marginBottomField?.value || '';

  if (!marginBottomValue && !isPageEditing) {
    return null;
  }

  return (
    <div
      className={cn('component margin-bottom', rendering?.params?.styles)}
      style={{ height: marginBottomValue }}
      data-component="MarginBottom"
      data-source-id={rendering?.dataSource}
    >
      {isPageEditing && !marginBottomValue && (
        <div className="p-4 text-center border border-dashed border-gray-300 text-gray-500">
          Margin Bottom: No value set
        </div>
      )}
    </div>
  );
};

export default MarginBottom;

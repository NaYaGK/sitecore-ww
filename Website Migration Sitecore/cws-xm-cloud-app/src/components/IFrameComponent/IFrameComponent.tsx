'use client';

import type { FC } from 'react';
import { useSitecore, RichText } from '@sitecore-content-sdk/nextjs';

import type { IFrameComponentProps } from './IFrameComponent.props';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { cn } from '@/lib/utils';

/**
 * Extract iframe src URL from HTML string
 * Handles both full iframe tags and just URLs
 */
function extractIframeSrc(html: string): string | null {
  if (!html || typeof html !== 'string') {
    return null;
  }

  // Try to extract src from iframe tag
  const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1];
  }

  // If no iframe tag found, check if it's just a URL
  const urlMatch = html.match(/https?:\/\/[^\s<>"']+/i);
  if (urlMatch && urlMatch[0]) {
    return urlMatch[0];
  }

  return null;
}

/**
 * Extract all iframe attributes from HTML string
 */
function extractIframeAttributes(html: string): {
  src: string | null;
  width?: string;
  height?: string;
  title?: string;
  allow?: string;
  allowFullScreen?: boolean;
} {
  const src = extractIframeSrc(html);
  if (!src) {
    return { src: null };
  }

  const attributes: {
    src: string | null;
    width?: string;
    height?: string;
    title?: string;
    allow?: string;
    allowFullScreen?: boolean;
  } = { src };

  // Extract width
  const widthMatch = html.match(/width=["']([^"']+)["']/i);
  if (widthMatch && widthMatch[1]) {
    attributes.width = widthMatch[1];
  }

  // Extract height
  const heightMatch = html.match(/height=["']([^"']+)["']/i);
  if (heightMatch && heightMatch[1]) {
    attributes.height = heightMatch[1];
  }

  // Extract title
  const titleMatch = html.match(/title=["']([^"']+)["']/i);
  if (titleMatch && titleMatch[1]) {
    attributes.title = titleMatch[1];
  }

  // Extract allow
  const allowMatch = html.match(/allow=["']([^"']+)["']/i);
  if (allowMatch && allowMatch[1]) {
    attributes.allow = allowMatch[1];
  }

  // Extract allowfullscreen
  const allowFullScreenMatch = html.match(/allowfullscreen/i);
  if (allowFullScreenMatch) {
    attributes.allowFullScreen = true;
  }

  return attributes;
}

const Default: FC<IFrameComponentProps> = ({ className, fields, rendering }) => {
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  // Extract IFrame field directly from fields
  const iframeField = fields?.IFrame;

  // Get the raw value from the IFrame field
  const iframeValue = iframeField?.value || iframeField?.jsonValue?.value || '';

  // Extract iframe attributes
  const iframeAttrs = extractIframeAttributes(iframeValue);

  // Check if there's any content
  const hasContent = iframeAttrs.src || iframeValue;

  if (!hasContent && !isEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'IFrameComponent'} />;
  }

  return (
    <section
      className={cn('component iframe-component my-8 w-full', className)}
      data-component="IFrameComponent"
    >
      <div className="w-full">
        {isEditing && iframeField && (
          <div className="rte-content mb-4! prose!">
            <RichText field={iframeField} />
          </div>
        )}
        {iframeAttrs.src ? (
          <div
            className="iframe-wrapper relative w-full overflow-hidden"
            style={{ paddingBottom: '56.25%' }}
          >
            <iframe
              src={iframeAttrs.src}
              width={iframeAttrs.width || '100%'}
              height={iframeAttrs.height || '100%'}
              title={iframeAttrs.title || 'Embedded content'}
              allow={iframeAttrs.allow}
              allowFullScreen={iframeAttrs.allowFullScreen}
              className="absolute top-0 left-0 h-full w-full border-0"
              loading="lazy"
            />
          </div>
        ) : isEditing ? (
          <div className="rounded border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
            Please configure the IFrame field with an iframe tag or URL
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default Default;

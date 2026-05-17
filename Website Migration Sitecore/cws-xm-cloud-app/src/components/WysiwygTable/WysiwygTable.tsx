'use client';

import { RichText, useSitecore, type Field } from '@sitecore-content-sdk/nextjs';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

import type { WysiwygTableProps, WysiwygTableFields } from './WysiwygTable.props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

// Helper to get field value with case-insensitive field name matching
const getFieldValue = (fields: WysiwygTableFields, fieldName: string): string => {
  if (!fields) return '';

  // Try exact match first
  const exactMatch = fields[fieldName as keyof WysiwygTableFields];
  if (exactMatch) {
    return (
      exactMatch.value ||
      (typeof exactMatch === 'object' && 'jsonValue' in exactMatch
        ? exactMatch.jsonValue?.value
        : '') ||
      ''
    );
  }

  // Try case-insensitive match
  const lowerFieldName = fieldName.toLowerCase();
  const fieldKey = Object.keys(fields).find((k) => k.toLowerCase() === lowerFieldName);
  if (!fieldKey) return '';

  const value = fields[fieldKey as keyof WysiwygTableFields];
  if (!value) return '';

  return (
    (value as any)?.value ||
    (typeof value === 'object' && 'jsonValue' in value ? (value as any).jsonValue?.value : '') ||
    ''
  );
};

const WysiwygTable: FC<WysiwygTableProps> = (props) => {
  const { rendering, className } = props;
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing;
  const [loadedDs, setLoadedDs] = useState<WysiwygTableFields | null>(null);

  // Resolve datasource from rendering
  const dsId = rendering?.dataSource || rendering?.datasource || '';
  const fields = rendering?.fields || {};

  // If we have a datasource id but no fields, fetch from API
  useEffect(() => {
    const shouldLoad = dsId && !Object.keys(fields).length && !loadedDs;
    if (!shouldLoad) return;

    const site = process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME || 'cws';
    const lang = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en';

    // Get rendering host URL from injected script variable or meta tag
    let apiBaseUrl = '';
    if (typeof window !== 'undefined') {
      apiBaseUrl = (window as any).__RENDERING_HOST_URL__ || '';
      if (!apiBaseUrl) {
        const metaTag = document.querySelector('meta[name="rendering-host-url"]');
        apiBaseUrl = metaTag ? metaTag.getAttribute('content') || '' : '';
      }
      if (!apiBaseUrl) {
        apiBaseUrl = window.location.origin;
      }
    }

    fetch(
      `${apiBaseUrl}/api/sitecore-datasource?id=${encodeURIComponent(dsId)}&site=${encodeURIComponent(site)}&lang=${encodeURIComponent(lang)}`,
    )
      .then((r) => r.json())
      .then((json) => {
        if (json?.fields) {
          setLoadedDs(json.fields);
        }
      })
      .catch(() => undefined);
  }, [dsId, fields, loadedDs]);

  // Use loaded datasource if available, otherwise use fields from rendering
  const effectiveFields = loadedDs || fields;

  // Get field values with case-insensitive matching
  const content = getFieldValue(effectiveFields, 'Content');
  const anchorId = getFieldValue(effectiveFields, 'AnchorId');
  const hasContent = (content && content.trim().length > 0) || isPageEditing;

  if (!hasContent) {
    return null;
  }

  return (
    <div
      className={cn('wysiwyg-table component md:16 mb-12 w-full', className)}
      data-component="WysiwygTable"
      {...(anchorId ? { id: anchorId } : {})}
    >
      <div className="mx-auto w-full max-w-[1360px] px-4 lg:px-6 xl:px-4">
        <div className="relative w-full overflow-x-auto">
          <div className="rte-content [&_table]:font-body! [&_h2]:font-heading-h2! [&_tr]:border-border! [&_strong]:font-heading! [&_p]:text-text! [&_a]:hover:text-cta-primary! [&_a]:focus-visible:text-cta-primary! [&_table]:md:my-10![&_table]:w-full! w-full! [&_.embedded-entity]:float-none! [&_.embedded-entity]:mr-5! [&_.embedded-entity]:mb-0! [&_.embedded-entity]:flex! [&_.embedded-entity]:h-[100px]! [&_.embedded-entity]:min-h-[100px]! [&_.embedded-entity]:w-[100px]! [&_.embedded-entity]:min-w-[100px]! [&_.embedded-entity]:shrink-0! [&_.embedded-entity_img]:block! [&_.embedded-entity_img]:h-[100px]! [&_.embedded-entity_img]:min-h-[100px]! [&_.embedded-entity_img]:w-[100px]! [&_.embedded-entity_img]:min-w-[100px]! [&_.embedded-entity_img]:object-contain! [&_a]:text-inherit! [&_a]:underline! [&_caption]:hidden! [&_h2]:m-0! [&_h2]:mb-7! [&_h2]:block! [&_h2]:text-[clamp(2rem,1.6rem+1.2vw,2.5rem)]! [&_h2]:leading-[1.2]! [&_h2]:font-bold! [&_h2]:md:mb-10! [&_p]:m-0! [&_p]:leading-[1.4]! [&_strong]:font-bold! [&_table]:my-6! [&_table]:border-collapse! [&_table]:border-spacing-0! [&_table]:text-base! [&_table]:leading-[1.4]! [&_table]:text-inherit! [&_table]:md:text-[18px]! [&_tbody]:block! [&_tbody]:md:grid! [&_tbody]:md:grid-cols-2! [&_tbody]:md:gap-x-0! [&_td]:flex! [&_td]:w-full! [&_td]:items-center! [&_td]:gap-5! [&_td]:border-b! [&_td]:border-b-black! [&_td]:p-2.5! [&_td]:text-left! [&_td]:transition-colors! [&_td]:md:gap-8! [&_td]:md:p-3! [&_td_.align-left]:min-h-[100px]! [&_td_.align-left]:min-w-[100px]! [&_th]:hidden! [&_tr]:block! [&_tr]:border-b!">
            {content ? (
              <RichText field={{ value: content }} />
            ) : (
              <span className="inline-block rounded border border-dashed border-black/20 p-4 text-black/30 italic">
                [No text in field]
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WysiwygTable;

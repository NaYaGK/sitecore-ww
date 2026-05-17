'use client';

import { RichText, useSitecore, type Field } from '@sitecore-content-sdk/nextjs';
import { useRouter } from 'next/router';
import { createPortal } from 'react-dom';
import { useEffect, useState, type FC } from 'react';

import type { WysiwygBlockProps, WysiwygBlockFields } from './wysiwyg-block.props';
import { useSiteName } from '@/hooks/useSiteName';
import { cn } from '@/lib/utils';
import { createSafeHtml } from '@/lib/sanitize';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { isCwsHomePage } from '@/utils/is-cws-home-page';

export const WYSIWYG_BLOCK_DESIGN_VARIANTS = {
  Default: 'Default',
  BrandBackground: 'Brand Background',
} as const;

type WysiwygBlockVariant =
  (typeof WYSIWYG_BLOCK_DESIGN_VARIANTS)[keyof typeof WYSIWYG_BLOCK_DESIGN_VARIANTS];

const CWS_HOME_MOBILE_WYSIWYG_SLOT_ID = 'cws-home-mobile-wysiwyg-slot';

// Helper to get field value with case-insensitive field name matching
const getFieldValue = (fields: WysiwygBlockFields, fieldName: string): string => {
  if (!fields) return '';

  // Try exact match first
  const exactMatch = fields[fieldName as keyof WysiwygBlockFields];
  if (exactMatch) {
    if (typeof exactMatch === 'string') return exactMatch;
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

  const value = fields[fieldKey as keyof WysiwygBlockFields];
  if (!value) return '';

  if (typeof value === 'string') return value;

  return (
    (value as any)?.value ||
    (typeof value === 'object' && 'jsonValue' in value ? (value as any).jsonValue?.value : '') ||
    ''
  );
};

const WysiwygBlock: FC<WysiwygBlockProps & { variant: WysiwygBlockVariant }> = (props) => {
  const { rendering, className, params } = props;
  const { page } = useSitecore();
  const router = useRouter();
  const pathname = router.asPath ?? router.pathname;
  const siteName = useSiteName();
  const isPageEditing = page?.mode?.isEditing;
  const routeName = page?.layout?.sitecore?.route?.name;
  const headlessMainRenderings = page?.layout?.sitecore?.route?.placeholders?.[
    'headless-main'
  ] as Array<{ uid?: string; componentName?: string }> | undefined;
  const currentRenderingIndex = headlessMainRenderings?.findIndex(
    (placeholderRendering) => placeholderRendering?.uid === rendering?.uid
  ) ?? -1;
  const isDirectlyAfterBoxesComponent =
    currentRenderingIndex > 0 &&
    String(headlessMainRenderings?.[currentRenderingIndex - 1]?.componentName ?? '').toLowerCase() ===
      'boxescomponent';
  const shouldPortalIntoBoxesMobileSlot =
    !isPageEditing &&
    isCwsHomePage({ siteName, routeName, pathname }) &&
    isDirectlyAfterBoxesComponent;
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);


  // Extract background color from params.Styles (e.g., "#f9e244")
  const backgroundColor = params?.Styles?.trim() || undefined;


  // Get fields from rendering or props
  const fields = rendering?.fields || (props as any).fields || {};

  // Get field values with fallbacks
  const contentField =
    fields?.content ||
    fields?.Content ||
    fields?.data?.datasource?.content ||
    fields?.data?.datasource?.Content;
  const anchorId =
    getFieldValue(fields, 'anchorId') ||
    getFieldValue(fields.data?.datasource || {}, 'anchorId') ||
    '';

  const hasContent =
    contentField?.value ||
    contentField?.jsonValue?.value ||
    (typeof contentField === 'string' && contentField.trim() !== '') ||
    isPageEditing;

  useEffect(() => {
    if (!shouldPortalIntoBoxesMobileSlot) {
      setPortalTarget(null);
      return;
    }

    const updatePortalTarget = () => {
      const target = document.getElementById(CWS_HOME_MOBILE_WYSIWYG_SLOT_ID);
      if (target) {
        setPortalTarget(target);
        return true;
      }
      return false;
    };

    if (updatePortalTarget()) {
      return;
    }

    const observer = new MutationObserver(() => {
      if (updatePortalTarget()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [shouldPortalIntoBoxesMobileSlot]);

  // Validate required fields
  if (!hasContent) {
    return <NoDataFallback componentName={rendering?.componentName || 'WysiwygBlock'} />;
  }

  const wysiwygMarkup = (
    <section
      className={cn(
        className,
        backgroundColor && 'mx-auto w-[calc(100%-20px)] mb-[48px] lg:mb-[48px] max-w-[1360px] p-[1.2rem]'
      )}
      data-component="WysiwygBlock"
      id={anchorId || undefined}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <div
        className={`mx-auto max-w-[1360px] px-2 pt-6 md:px-[10px] ${backgroundColor ? "mb-0 lg:mb-0" : "mb-[28px] lg:mb-[32px]"
          }`}
      >

      <div className="rte-content [&_h4]:m-0! [&_h4]:text-[18px]! lg:[&_h4]:text-[22px]!">
          {contentField ? (
            typeof contentField === 'string' ? (
              <div dangerouslySetInnerHTML={createSafeHtml(contentField)} />
            ) : (
              <RichText field={contentField.jsonValue || contentField} />
            )
          ) : (
            <span className="inline-block rounded border border-dashed border-black/20 p-4 text-black/30 italic"></span>
          )}
        </div>

      </div>
    </section>
  );

  if (shouldPortalIntoBoxesMobileSlot) {
    if (!portalTarget) return null;
    return createPortal(wysiwygMarkup, portalTarget);
  }

  return wysiwygMarkup;
};

export const Default: FC<WysiwygBlockProps> = (props) => (
  <WysiwygBlock {...props} variant={WYSIWYG_BLOCK_DESIGN_VARIANTS.Default} />
);

export const BrandBackground: FC<WysiwygBlockProps> = (props) => (
  <WysiwygBlock {...props} variant={WYSIWYG_BLOCK_DESIGN_VARIANTS.BrandBackground} />
);

export default Default;

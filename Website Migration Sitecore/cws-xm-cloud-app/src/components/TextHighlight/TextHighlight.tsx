'use client';
import type { CSSProperties, FC } from 'react';
import { useEffect, useState } from 'react';
import { useSitecore, Text, RichText, Image, type Field } from '@sitecore-content-sdk/nextjs';

import type { TextHighlightTheme } from './TextHighlight.props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

const THEME_STYLES: Record<TextHighlightTheme, string> = {
  light: 'var(--color-bg-secondary)',
  grey: 'var(--color-neutral-200)',
  red: 'var(--color-accent-primary)',
  yellow: 'var(--color-accent-primary)',
};

const asTextField = (f: any): Field<string> | undefined => {
  if (!f) return undefined;
  const v = f?.jsonValue ?? f;
  if (v == null) return undefined;
  if (typeof v === 'string') return { value: v } as Field<string>;
  if (typeof v?.value === 'string') return v as Field<string>;
  return undefined;
};

const asImageField = (f: any): Field<any> | undefined => {
  if (!f) return undefined;
  const v = f?.jsonValue ?? f;
  if (v == null) return undefined;
  if (v?.value && typeof v.value === 'object') return v;
  if (typeof v === 'object') return { value: v };
  return undefined;
};

const normalizeString = (value?: string): string => value?.trim() ?? '';

const resolveThemeColor = (theme?: TextHighlightTheme | string): string | undefined => {
  if (!theme) return undefined;
  const key = String(theme).toLowerCase() as TextHighlightTheme;
  return THEME_STYLES[key];
};

const TextHighlight: FC<any> = ({ className, fields, rendering }) => {
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  // Resolve datasource from multiple shapes (including rendering.fields) and allow root-level fields
  const initialDs: any =
    (fields as any)?.data?.datasource ??
    (fields as any)?.datasource ??
    (fields as any) ??
    (rendering as any)?.fields ??
    {};

  const dsId = (rendering as any)?.dataSource || (rendering as any)?.datasource || undefined;
  const [loadedDs, setLoadedDs] = useState<any | null>(null);

  // If we have a datasource id on the rendering but fields are empty, fetch from API
  const hasInitialContent = Boolean(
    initialDs &&
    (initialDs.title ||
      initialDs.subtitle ||
      initialDs.subTitle ||
      initialDs.eyebrow ||
      initialDs.content),
  );
  useEffect(() => {
    const shouldLoad = !!dsId && !hasInitialContent && !loadedDs;
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
  }, [dsId, hasInitialContent, loadedDs]);

  // Unwrap nested fields if present
  const ds: any =
    loadedDs ??
    (initialDs && typeof initialDs === 'object' && initialDs.fields ? initialDs.fields : initialDs);

  // Helper: case-insensitive field access
  const pickCI = (obj: any, names: string[]) => {
    if (!obj) return undefined;
    const keys = Object.keys(obj);
    for (const n of names) {
      const k = keys.find((kk) => kk.toLowerCase() === n.toLowerCase());
      if (k && obj[k] != null) return obj[k];
    }
    return undefined;
  };

  // Map datasource fields - keep as Field objects for Content SDK components
  const eyebrowField = asTextField(
    pickCI(ds, ['eyebrow', 'eyebrowLabel', 'label', 'pretitle', 'preTitle']),
  );
  const titleField = asTextField(pickCI(ds, ['title', 'heading']));
  const subtitleField = asTextField(
    pickCI(ds, ['subtitle', 'subTitle', 'leftTitle', 'leftHeading']),
  );
  const contentField = asTextField(pickCI(ds, ['content', 'body', 'text', 'richText']));
  const imageField = asImageField(pickCI(ds, ['image', 'img', 'picture']));
  const themeField = asTextField(pickCI(ds, ['theme', 'background', 'backgroundColor']));

  // Extract values for conditional logic and theme
  const eyebrow = normalizeString(eyebrowField?.value);
  const title = normalizeString(titleField?.value);
  const subtitle = normalizeString(subtitleField?.value);
  const content = normalizeString(contentField?.value);
  const themeColor = resolveThemeColor(themeField?.value) || THEME_STYLES.yellow;

  // Check if we have any content
  const hasAny = Boolean(title || subtitle || content || eyebrow);
  const hasDatasourceId = Boolean(dsId);
  if (!hasAny && !isEditing && !hasDatasourceId) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'TextHighlight'} />;
  }

  return (
    <section
      className={cn(
        'component text-highlight mb-16 w-full pt-16 pb-12 mb-3rem lg:mb-[4.5rem]',
        'md:py-4 lg:py-22',
        'font-body',
        className,
      )}
      data-component="TextHighlight"
      style={{ backgroundColor: themeColor }}
    >
      <div className="mx-auto w-full max-w-[1360px] px-2 md:px-[10px] md:pt-3">
        <div className={cn('text-left', 'flex flex-col gap-1', 'md:gap-1')}>
          {eyebrow && (
            <div
              className={cn(
                'font-heading text-xs md:text-sm',
                'font-medium tracking-wider uppercase',
                'm-0 opacity-80',
              )}
            >
              {eyebrow}
            </div>
          )}
          {title && (
            <h2
              className={cn(
                'font-heading-h2 font-bold md:mt-10',
                'm-0 leading-tight font-extrabold',
                '',
              )}
            >
              {title}
            </h2>
          )}
          {(subtitle || content) && (
            <div
              className={cn(
                'font-body text-base md:text-lg',
                'm-0 leading-relaxed',
                'block lg:grid lg:grid-cols-[1fr_2fr] lg:items-start lg:gap-7',
              )}
            >
              <div className="lg:[grid-column:1]">
                {subtitle ? (
                  <h3
                    className={cn(
                      'font-heading-h4 m-0 mb-6 text-[26px]! leading-8 font-bold lg:mb-4 lg:leading-[1.2]',
                      '',
                      'lg:text-[28px]! xl:text-[30px]! 2xl:text-[44px]!',
                    )}
                  >
                    {subtitle}
                  </h3>
                ) : null}
              </div>
              <div
                className={cn(
                  'rte-content',
                  'lg:[grid-column:2]! lg:self-start!',
                  'text-[17px]! leading-relaxed! lg:text-lg!',
                  '[&_p]:m-0! [&_p]:mb-4!',
                  '[&_li]:my-3! [&_ul]:my-4! [&_ul]:ml-6! [&_ul]:list-disc!',
                  '[&_ol]:my-4! [&_ol]:ml-6! [&_ol]:list-decimal!',
                )}
              >
                {(contentField || isEditing) && <RichText field={contentField} />}
                {imageField && (
                  <div className="mt-6">
                    <Image field={imageField} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section >
  );
};

export default TextHighlight;

'use client';

import type { FC } from 'react';
import { useSitecore, Text as SitecoreText, Link as SitecoreLink } from '@sitecore-content-sdk/nextjs';

import type { GlobalFooterProps } from './GlobalFooter.props';
import { cn } from '@/lib/utils';
import { patchLinkField } from '@/lib/patch-link';
import { useLocale } from '@/hooks/useLocale';
import { useSiteName } from '@/hooks/useSiteName';
import { useUrlContext } from '@/contexts/UrlContext';

export const Default: FC<GlobalFooterProps> = ({ className, fields, rendering }) => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const siteName = useSiteName();
  const locale = useLocale();
  const { isUrlActive } = useUrlContext();

  // Handle flexible field resolution - datasource might be at different levels
  const datasource: any = fields?.data?.datasource ?? (fields as any)?.datasource ?? fields;

  // Extract Copyright field
  const copyrightField = datasource?.Copyright ?? datasource?.copyright;
  const copyright = copyrightField?.value ?? copyrightField?.jsonValue?.value;

  // Extract Items directly from datasource
  const itemsField = datasource?.Items ?? datasource?.items;
  // If itemsField is empty, try to use children.results (Sitecore item children)
  const globalFooterLinks = Array.isArray(itemsField)
    ? itemsField
    : (itemsField?.targetItems || datasource?.children?.results || []);

  // Don't render if no data and not editing
  if (!copyright && globalFooterLinks.length === 0 && !isPageEditing) {
    return null;
  }

  return (
    <div className={cn('w-full bg-white', className)}>
      <div className="mx-auto flex max-w-[1360px] flex-col items-start gap-7 px-2 pt-18 pb-3 text-xs font-normal lg:flex-row lg:items-center lg:gap-3 lg:px-2 lg:pb-3">
        {/* GlobalFooter Links - Mobile: stacked vertically, Desktop: horizontal */}
        {globalFooterLinks.length > 0 && (
          <nav
            className="order-1 flex w-full flex-col items-start gap-6 lg:order-2 lg:w-auto lg:flex-row lg:items-center lg:gap-8"
            aria-label="Legal and utility links"
          >
            {globalFooterLinks.map((link: any, index: number) => {
              const rawLinkField = link?.fields?.Link ?? link?.link;
              const linkField = patchLinkField(rawLinkField, siteName, undefined, locale) ?? rawLinkField;
              const linkTitleField = link?.fields?.['Link Text'] ?? link?.['Link Text'];

              if (!linkField && !linkTitleField && !isPageEditing) return null;

              const hasLinkText = Boolean((linkTitleField as any)?.value) || Boolean((linkTitleField as any)?.jsonValue?.value);
              const href = (linkField as any)?.value?.href as string | undefined;
              const isActive = href ? isUrlActive(href) : false;

              return (
                <SitecoreLink
                  key={link?.id || index}
                  field={linkField as any}
                  className={cn(
                    'hover:text-brand-text-red no-underline transition-colors duration-200',
                    isActive ? 'text-brand-text-red' : 'text-black',
                  )}
                >
                  {hasLinkText ? <SitecoreText field={linkTitleField as any} /> : undefined}
                </SitecoreLink>
              );
            })}
          </nav>
        )}

        {/* Copyright - Mobile: bottom, Desktop: left */}
        {(copyrightField || isPageEditing) && (
          <div className="order-2 text-black md:order-1 md:mr-20">
            <SitecoreText field={copyrightField as any} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Default;

'use client';

import type { FC } from 'react';
import Image from 'next/image';
import { Link, useSitecore } from '@sitecore-content-sdk/nextjs';

import type { FooterSocialAccountsProps } from './FooterSocialAccounts.props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

// Helper to get social icon path
const getSocialIcon = (href: string): string | null => {
  const url = href.toLowerCase();
  if (url.includes('linkedin')) return '/assets/icons/social/linkedin.svg';
  if (url.includes('facebook')) return '/assets/icons/social/facebook.svg';
  if (url.includes('instagram')) return '/assets/icons/social/instagram.svg';
  if (url.includes('youtube')) return '/assets/icons/social/youtube.svg';
  if (url.includes('twitter') || url.includes('x.com')) return '/assets/icons/social/x-twitter.svg';
  return null;
};

export const Default: FC<FooterSocialAccountsProps> = ({ className, fields, rendering }) => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  // Handle flexible field resolution - datasource might be at different levels
  const datasource: any = fields?.data?.datasource ?? (fields as any)?.datasource ?? fields;

  // Extract Items from datasource
  const itemsField = datasource?.Items ?? datasource?.items;
  const items = Array.isArray(itemsField) ? itemsField : (itemsField?.targetItems ?? []);

  // Don't render if no data and not editing
  if (!items || items.length === 0) {
    if (!isPageEditing) {
      return null;
    }
  }

  return (
    <div className="mt-24 md:mt-19">
      <div className={cn('mb-2 flex items-center gap-4 pb-0 md:gap-[14px]', className)}>
        {items.map((item: any, index: number) => {
          // Handle Link field
          const linkField = item?.fields?.Link ?? item?.link;
          const href =
            linkField?.value?.href ?? linkField?.jsonValue?.value?.href ?? linkField?.href;

          // Handle Icon field
          const iconField = item?.fields?.Icon ?? item?.icon;
          const iconSrc =
            iconField?.value?.src ?? iconField?.jsonValue?.value?.src ?? iconField?.src;

          // Fallback to getSocialIcon if no icon provided
          const iconPath = iconSrc || (href ? getSocialIcon(href) : null);

          if (!href || !iconPath) {
            if (!isPageEditing) return null;
          }

          return (
            <Link
              key={item?.id || index}
              field={linkField?.jsonValue ?? linkField}
              target="_blank"
              rel="noopener noreferrer"
              className="group cursor-pointer"
              aria-label={item?.name || item?.displayName || 'Social link'}
            >
              <Image
                src={iconPath}
                alt={item?.name || item?.displayName || 'Social icon'}
                width={32}
                height={32}
                className="transition-all duration-200 group-hover:brightness-0 group-hover:saturate-100 group-hover:[filter:invert(17%)_sepia(99%)_saturate(7426%)_hue-rotate(346deg)_brightness(95%)_contrast(114%)]"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Default;

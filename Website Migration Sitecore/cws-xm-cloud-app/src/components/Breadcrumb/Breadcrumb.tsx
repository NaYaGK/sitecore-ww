import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { ChevronRight } from 'lucide-react';

import { BreadcrumbProps, BreadcrumbItem } from './Breadcrumb.props';
import { useLocale } from '@/hooks/useLocale';
import { useSiteName } from '@/hooks/useSiteName';
import { patchHref } from '@/lib/patch-link';

const LOCALE_PATH_PATTERN = /^\/[a-z]{2}(?:-[a-z]{2})?(?=\/|$)/i;

export const Default: React.FC<BreadcrumbProps> = (props) => {
  const { page } = useSitecore();
  const router = useRouter();
  const siteName = useSiteName();
  const locale = useLocale();

  // Get current route
  const route = page?.layout?.sitecore?.route as any;

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!route) {
    return null;
  }

  if (!isClient) {
    return null;
  }

  const graphql = props as any;

  const dataObj = graphql?.fields?.data;
  const contextItem = dataObj?.contextItem || dataObj?.item || dataObj?.contextitem;
  const ancestors = contextItem?.ancestors || [];
  const siteRootItem =
    contextItem?.name?.toLowerCase() === 'home' || contextItem?.url?.path === '/'
      ? contextItem
      : ancestors.find((ancestor: any) => ancestor?.name?.toLowerCase() === 'home' || ancestor?.url?.path === '/');
  const siteRootTitle = siteRootItem?.navigationTitle?.value;

  // Prefer the real browser pathname because router.asPath can be locale-stripped in some client transitions.
  const currentPath =
    (typeof window !== 'undefined' ? window.location.pathname : '') ||
    router.asPath?.split('?')[0] ||
    '';

  const resolveBreadcrumbHref = (url: string, isFirstItem: boolean): string => {
    if (isFirstItem) {
      return locale ? `/${locale}` : '/';
    }

    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    const localizedUrl =
      locale && !LOCALE_PATH_PATTERN.test(normalizedUrl)
        ? `/${locale}${normalizedUrl}`.replace(/\/+/g, '/')
        : normalizedUrl;

    return patchHref(localizedUrl, siteName, undefined, locale) ?? localizedUrl;
  };

  // Build breadcrumb trail from URL path
  const buildBreadcrumbFromPath = (): BreadcrumbItem[] => {
    // Remove leading/trailing slashes and split
    const segments = currentPath
      .replace(/^\/+|\/+$/g, '')
      .split('/')
      .filter(Boolean);
    const localeSegmentIndex = locale && segments[0]?.toLowerCase() === locale.toLowerCase() ? 0 : -1;
    const siteRootSegmentIndex = localeSegmentIndex === 0 ? 1 : 0;

    // Always start with Home
    const breadcrumbItems: BreadcrumbItem[] = [
      {
        Title: 'Home',
        NavigationTitle: 'Home',
        url: '/',
      },
    ];

    if (siteRootTitle && segments[siteRootSegmentIndex]) {
      breadcrumbItems.push({
        Title: siteRootTitle,
        NavigationTitle: siteRootTitle,
        url: '/' + segments.slice(0, siteRootSegmentIndex + 1).join('/'),
      });
    }

    // Build breadcrumb for each segment
    let accumulatedPath = '';
    segments.forEach((segment, index) => {
      accumulatedPath += '/' + segment;

      if (index === localeSegmentIndex || index === siteRootSegmentIndex) {
        return;
      }

      // For the last segment (current page), use data from route
      if (index === segments.length - 1) {
        if (index === 0) {
          return;
        }

        const title =
          route?.fields?.Title?.value ||
          route?.fields?.title?.value ||
          route?.displayName ||
          route?.name ||
          segment;
        const navTitle =
          route?.fields?.NavigationTitle?.value || route?.fields?.navigationTitle?.value || title;

        breadcrumbItems.push({
          Title: title,
          NavigationTitle: navTitle,
            url: accumulatedPath,
        });
      } else {
        // Skip locale segment (like "de-de") from creating an invalid breadcrumb
        if (locale && segment.toLowerCase() === locale.toLowerCase()) {
          return;
        }

        // Try to find matching ancestor first
        const matchingAncestor = ancestors.find((a: any) => {
          const aUrl = a?.url?.path || a?.url?.href || a?.url?.value || '';
          const aName = a?.name || '';
          const aDisplayName = a?.displayName || '';

          const cleanAUrl = typeof aUrl === 'string' ? aUrl.replace(/\/+$/, '').toLowerCase() : '';
          const cleanAccUrl = accumulatedPath.replace(/\/+$/, '').toLowerCase();

          if (cleanAUrl && cleanAUrl !== '/') {
            if (cleanAccUrl.endsWith(cleanAUrl) || cleanAUrl.endsWith(cleanAccUrl) || cleanAUrl.endsWith('/' + segment.toLowerCase())) {
              return true;
            }
          }

          return aName.toLowerCase() === segment.toLowerCase() || aDisplayName.toLowerCase() === segment.toLowerCase();
        });

        if (matchingAncestor) {
          // If the matched ancestor is the "Home" node, skip it 
          // to prevent "CWS Arbeitskleidung | CWS Arbeitskleidung" duplications 
          // because we already manually pushed "Home" and "CWS Workwear"
          if (matchingAncestor.name?.toLowerCase() === 'home') {
            return;
          }

          const titleField = matchingAncestor?.title?.value || matchingAncestor?.displayName || matchingAncestor?.name || segment;
          const navTitleField = matchingAncestor?.navigationTitle?.value || matchingAncestor?.linkCaption?.value || titleField;

          breadcrumbItems.push({
            Title: titleField,
            NavigationTitle: navTitleField,
            url: accumulatedPath,
          });
        } else {
          // For parent segments without ancestor match, create basic items from URL
          // Convert 'workwear-selection' to 'Workwear Selection'
          let formattedTitle = segment
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          breadcrumbItems.push({
            Title: formattedTitle,
            NavigationTitle: formattedTitle,
            url: accumulatedPath,
          });
        }
      }
    });

    return breadcrumbItems;
  };

  const breadcrumbData = buildBreadcrumbFromPath();

  // Don't render if only home item exists (but allow site-specific item to show)
  if (breadcrumbData.length <= 1) {
    return null;
  }

  return (
    <nav
      className="mx-auto px-[12.8px] md:pt-[16px] lg:mb-[3.4rem] mb-[1.4rem] max-w-[1360px] text-black lg:pt-[24px] lg:px-[10px]"
      aria-label="Breadcrumb"
      data-component="Breadcrumb"
    >
      <ol className="m-0 flex list-none flex-wrap items-center gap-0 p-0">
        {breadcrumbData.map((item, index) => {
          const isLast = index === breadcrumbData.length - 1;
          const isFirstItem = index === 0;

          return (
            <li key={index} className="flex items-center gap-0 text-[15px] leading-6">
              {!isLast ? (
                <a
                  href={resolveBreadcrumbHref(item.url, isFirstItem)}
                  className="relative inline-block text-black no-underline after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-black after:transition-all after:duration-300 after:content-[''] hover:after:w-full active:text-black lg:mt-0"
                >
                  {isFirstItem ? (
                    <>
                      <span
                        className="inline-flex items-center lg:hidden"
                        aria-label={item.NavigationTitle || 'Home'}
                      >
                        <img
                          src="/assets/icons/home.svg"
                          alt="Home"
                          width={20}
                          height={20}
                          className="mt-1 text-black"
                        />
                      </span>
                      <span className="hidden lg:inline">{item.NavigationTitle}</span>
                    </>
                  ) : (
                    <span>{item.NavigationTitle}</span>
                  )}
                </a>
              ) : (
                <>
                  {isFirstItem ? (
                    <>
                      <span
                        className="inline-flex items-center lg:hidden"
                        aria-label={item.NavigationTitle || 'Home'}
                      >
                        <img
                          src="/assets/icons/home.svg"
                          alt="Home"
                          width={18}
                          height={18}
                          className="text-black"
                        />
                      </span>
                      <span className="hidden font-bold lg:inline">{item.NavigationTitle}</span>
                    </>
                  ) : (
                    <span className="font-bold text-black ">{item.NavigationTitle}</span>
                  )}
                </>
              )}

              {!isLast && (
                <span
                  className="mx-1 inline-flex h-4 w-4 shrink-0 items-center justify-center text-black"
                  aria-hidden="true"
                >
                  <ChevronRight strokeWidth={2} size={16} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Default;

// @ts-nocheck
import { Link, Text, useSitecore, type Field, type LinkField } from '@sitecore-content-sdk/nextjs';
import { ChevronRight, Home } from 'lucide-react';

import { BreadcrumbNavigationProps } from './BreadcrumbNavigation.props';

import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { hasLinkField } from '@/utils/sitecoreFields';

type SafeField<T> = Field<T> | undefined;
type SafeLinkField = LinkField | undefined;

interface BreadcrumbItemData {
  label: SafeField<string>;
  destination: SafeLinkField;
  isCurrentPage: SafeField<boolean>;
}

const hasValidItems = (items?: BreadcrumbItemData[]): boolean => {
  if (!items || items.length === 0) return false;
  return items.some((item) => item.label?.value);
};

const normalizeBreadcrumbItems = (
  items?: Array<{
    label?: { jsonValue?: Field<string> };
    destination?: { jsonValue?: LinkField };
    isCurrentPage?: { jsonValue?: Field<boolean> };
  }>,
): BreadcrumbItemData[] => {
  if (!items) return [];

  return items
    .map((item) => ({
      label: item.label?.jsonValue,
      destination: item.destination?.jsonValue,
      isCurrentPage: item.isCurrentPage?.jsonValue,
    }))
    .filter((item): item is BreadcrumbItemData => Boolean(item.label?.value));
};

const truncateItems = (items: BreadcrumbItemData[], maxItems: number = 4): BreadcrumbItemData[] => {
  if (items.length <= maxItems) return items;

  // Keep first item (home), last item (current page), and truncate middle
  const first = items[0];
  const last = items[items.length - 1];
  const remaining = items.slice(1, -1);

  // If we have too many middle items, show only the most recent ones
  const middleItemsToShow = maxItems - 2; // Reserve space for first and last
  const truncatedMiddle = remaining.slice(-middleItemsToShow);

  return [first, ...truncatedMiddle, last];
};

export const Default: React.FC<BreadcrumbNavigationProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  // Try to get breadcrumb data from multiple sources:
  // 1. Route-level fields (Sitecore default breadcrumb - checkbox enabled)
  // 2. Component datasource (manually added breadcrumb component)
  const route = page?.layout?.sitecore?.route;
  const routeFields = route?.fields;

  // Check for route-level breadcrumb data (default Sitecore breadcrumb)
  const routeBreadcrumbItems =
    routeFields?.breadcrumbItems?.targetItems ||
    routeFields?.breadcrumb?.targetItems ||
    routeFields?.ancestors;

  // Check for datasource-based breadcrumb data (component-specific)
  const datasource = fields?.data?.datasource;
  const datasourceBreadcrumbItems = datasource?.breadcrumbItems?.targetItems;

  // Prioritize route-level data (default breadcrumb) over datasource
  const breadcrumbItems = routeBreadcrumbItems || datasourceBreadcrumbItems;

  const normalizedItems = normalizeBreadcrumbItems(breadcrumbItems);
  const truncatedItems = truncateItems(normalizedItems);

  // Show fallback only in editing mode if no data available
  if (!hasValidItems(truncatedItems)) {
    if (!isPageEditing) return null;
    return <NoDataFallback componentName={rendering?.componentName ?? 'BreadcrumbNavigation'} />;
  }

  return (
    <nav
      className={cn('block py-3 font-sans text-black', 'component', 'breadcrumb-navigation')}
      aria-label="Breadcrumb"
      data-component="BreadcrumbNavigation"
    >
      <ol className="m-0 flex list-none flex-wrap items-center gap-0 p-0">
        {truncatedItems.map((item, index) => {
          const isCurrent = item.isCurrentPage?.value === true;
          const isLast = index === truncatedItems.length - 1;
          const shouldRenderAsLink = !isCurrent && !isLast && hasLinkField(item.destination);
          const isFirstItem = index === 0;

          return (
            <li key={index} className="flex items-center gap-2 text-sm leading-6">
              {shouldRenderAsLink ? (
                <Link
                  field={item.destination}
                  className="relative inline-block text-black no-underline after:absolute after:bottom-0 after:left-0 after:h-px after:w-0 after:bg-black after:transition-all after:duration-300 after:content-[''] hover:after:w-full active:text-black"
                >
                  {isFirstItem ? (
                    <>
                      <span
                        className="inline-flex items-center md:hidden"
                        aria-label={item.label?.value || 'Home'}
                      >
                        <Home size={18} strokeWidth={2} />
                      </span>
                      <span className="hidden md:inline">
                        <Text tag="span" field={item.label} />
                      </span>
                    </>
                  ) : (
                    <Text tag="span" field={item.label} />
                  )}
                </Link>
              ) : (
                <>
                  {isFirstItem ? (
                    <>
                      <span
                        className="inline-flex items-center md:hidden"
                        aria-label={item.label?.value || 'Home'}
                      >
                        <Home size={18} strokeWidth={2} />
                      </span>
                      <span className="hidden md:inline">
                        <Text
                          tag="span"
                          field={item.label}
                          className={cn('text-black', (isCurrent || isLast) && 'font-bold')}
                        />
                      </span>
                    </>
                  ) : (
                    <Text
                      tag="span"
                      field={item.label}
                      className={cn('text-black', (isCurrent || isLast) && 'font-bold')}
                    />
                  )}
                </>
              )}

              {!isLast && (
                <span
                  className="mx-2 inline-flex h-4 w-4 shrink-0 items-center justify-center text-black"
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

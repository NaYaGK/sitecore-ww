import type React from 'react';
import {
  Image,
  Link,
  useSitecore,
  type ImageField,
  type LinkField,
} from '@sitecore-content-sdk/nextjs';
import { NoDataFallback } from '@/utils/NoDataFallback';
import type { ComponentProps } from '@/lib/component-props';
import { useUrlContext } from '@/contexts/UrlContext';
import { cn } from '@/lib/utils';
import { patchHref } from '@/lib/patch-link';
import { useLocale } from '@/hooks/useLocale';
import { useSiteName } from '@/hooks/useSiteName';

interface TopHeaderChild {
  Icon?: { jsonValue?: ImageField } | ImageField;
  Link?: LinkField;
  Text?: { value?: string };
  IsCustomerPortal?: { value?: boolean };
}

interface TopHeaderProps extends ComponentProps {
  fields?: {
    // Flat items array provided by the rendering (preferred for this component)
    items?: Array<{
      id?: string;
      name?: string;
      displayName?: string;
      fields?: {
        Icon?: { jsonValue?: ImageField } | ImageField | { value?: any };
        Link?: LinkField | { value?: any };
        Text?: { value?: string };
        IsCustomerPortal?: { value?: boolean };
      };
    }>;
    // Legacy/nested shapes still supported but discouraged
    children?: { results?: TopHeaderChild[] };
    datasource?: { children?: { results?: TopHeaderChild[] } };
    data?: { datasource?: { children?: { results?: TopHeaderChild[] } } };
  };
  isPageEditing?: boolean;
}

export const Default: React.FC<TopHeaderProps> = (props) => {
  const { fields, rendering } = props;

  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;
  const { isUrlActive } = useUrlContext();
  const siteName = useSiteName();
  const isCwsSite = siteName?.toLowerCase() === 'cws';
  const locale = useLocale();
  const flatItems = fields?.items ?? [];
  const nestedItems: TopHeaderChild[] =
    fields?.data?.datasource?.children?.results ??
    (fields as any)?.datasource?.children?.results ??
    fields?.children?.results ??
    [];

  // Prefer flat items if provided; otherwise fallback to nested items
  const itemsSource: Array<any> = flatItems.length > 0 ? flatItems : (nestedItems as any[]);

  if (itemsSource.length === 0 && !isEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'TopHeader'} />;
  }

  const desktopItems = isCwsSite ? itemsSource.slice(-2) : itemsSource;
  const mobileItems = itemsSource;

  const renderItem = (item: any, index: number, itemCount: number) => {
    const isLastItem = index === itemCount - 1;
    // Support both flat child (with Icon/Link directly) and object with fields.Icon/fields.Link
    const iconSource = item?.fields?.Icon ?? item?.Icon;
    const iconField: ImageField | undefined =
      (iconSource as any)?.jsonValue ?? (iconSource as ImageField | undefined);

    const linkSource = item?.fields?.Link ?? item?.Link;
    const linkValue = (linkSource as any)?.value ?? undefined;
    const textSource = item?.fields?.Text ?? item?.Text;
    const textValue = typeof textSource?.value === 'string' ? textSource.value.trim() : '';
    const label = textValue || linkValue?.text || linkValue?.description || linkValue?.href || '';

    if (!linkValue?.href && !label && !isEditing) {
      return null;
    }

    // Check IsCustomerPortal field from Sitecore, with fallback to string matching for backward compatibility
    const isCustomerPortalField = item?.fields?.IsCustomerPortal ?? item?.IsCustomerPortal;
    const isCustomerPortalValue = isCustomerPortalField?.value ?? false;
    const isCustomerPortal = isCustomerPortalValue || label.toLowerCase().includes('customer portal');

    // Render with link if href exists, otherwise render as span
    if (linkValue?.href) {
      const patchedHref = patchHref(linkValue.href, siteName, undefined, locale) ?? linkValue.href;
      const patchedLinkValue = { ...linkValue, href: patchedHref };
      const linkField = { value: patchedLinkValue } as unknown as LinkField;
      const isActive = isUrlActive(patchedHref);
      return (
        <Link
          key={index}
          field={linkField}
          className={cn(
            'font-regular hover:text-brand-text-red flex items-center gap-[5px] text-sm leading-none antialiased transition-colors duration-200 pt-[2px]',
            'w-full lg:w-auto py-[14px] lg:py-0 lg:border-b border-gray-100 lg:border-none', // Mobile styles
            isLastItem ? '' : 'lg:pr-0',
            isActive ? 'text-brand-text-red' : 'text-black'
          )}
        >
          {isCustomerPortal && (
            <img
              src="/assets/icons/cws_customer_portal.svg"
              alt="Customer Portal"
              className="mb-1 h-[19px] w-4 pt-px"
            />
          )}
          {!isCustomerPortal && iconField?.value?.src && (
            <Image field={iconField} className="h-4 w-4" alt="" />
          )}
          {label && <span>{label}</span>}
        </Link>
      );
    }

    // Render without link - show as span
    return (
      <span
        key={index}
        className={cn(
          'flex items-center gap-[5px] text-sm leading-none antialiased pt-[2px]',
          'w-full lg:w-auto py-[14px] lg:py-0', // Mobile styles
          isLastItem ? '' : 'lg:pr-0',
          'text-black'
        )}
      >
        {isCustomerPortal && (
          <img
            src="/assets/icons/cws_customer_portal.svg"
            alt="Customer Portal"
            className="mb-1 h-[19px] w-4 pt-px"
          />
        )}
        {!isCustomerPortal && iconField?.value?.src && (
          <Image field={iconField} className="h-4 w-4" alt="" />
        )}
        {label && <span>{label}</span>}
      </span>
    );
  };

  return (
    <div className="flex w-full flex-col items-start lg:ml-auto lg:w-auto lg:flex-row lg:items-center lg:pt-[3px] lg:justify-end lg:gap-5">
      {isCwsSite ? (
        <>
          <div className="hidden lg:flex lg:items-center lg:gap-5">
            {desktopItems.map((item: any, index: number) =>
              renderItem(item, index, desktopItems.length),
            )}
          </div>
          <div className="w-full lg:hidden">
            {mobileItems.map((item: any, index: number) =>
              renderItem(item, index, mobileItems.length),
            )}
          </div>
        </>
      ) : (
        itemsSource.map((item: any, index: number) => renderItem(item, index, itemsSource.length))
      )}
    </div>
  );
};

export default Default;

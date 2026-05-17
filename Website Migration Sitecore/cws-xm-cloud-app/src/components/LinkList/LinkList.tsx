import { Link, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ChevronRight } from 'lucide-react';

import { LinkListProps } from './LinkList.props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { patchLinkField } from '@/lib/patch-link';
import { useSiteName } from '@/hooks/useSiteName';

export const Default: React.FC<LinkListProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const siteName = useSiteName();

  const datasource = isPageEditing ? fields : fields?.data?.datasource || fields;

  const titleField =
    datasource?.Title?.jsonValue || datasource?.Title || fields?.Title?.jsonValue || fields?.Title;

  const itemsSource = isPageEditing ? fields?.Items : datasource?.Items;
  const items = Array.isArray(itemsSource) ? itemsSource : fields?.Items || [];
  const hasItems = items.length > 0;

  if (isPageEditing && !hasItems) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'LinkList'} />;
  }

  if (!hasItems) {
    return null;
  }

  const hasTitle = Boolean(titleField?.value?.trim() || (isPageEditing && titleField));

  return (
    <div className="mx-auto my-5 max-w-[1360px] px-2 md:mt-12 md:mb-15" data-component="LinkList">
      <div className="relative">
        <div className="px-auto mx-auto">
          {(hasTitle || isPageEditing) && (
            <Text tag="h2" field={titleField} className="font-heading-h2 px-0!" />
          )}

          <div className="flex flex-col divide-y divide-black border-y border-black md:divide-y-2 md:border-y-2">
            {items.map((item, index) => {
              const rawLinkField = item.fields?.Link;
              const isEditableLink = Boolean(isPageEditing && rawLinkField?.editable);

              const resolvedLinkField = isPageEditing
                ? rawLinkField?.editable
                  ? rawLinkField
                  : rawLinkField?.jsonValue || rawLinkField
                : rawLinkField?.jsonValue || rawLinkField;
              const linkField = patchLinkField(resolvedLinkField, siteName) ?? resolvedLinkField;

              const linkTextField = item.fields?.LinkText?.jsonValue || item.fields?.LinkText;

              const textField = item.fields?.Text?.jsonValue || item.fields?.Text;

              if (!linkField && !isPageEditing) {
                return null;
              }

              const hasText = Boolean(textField?.value?.trim() || (isPageEditing && textField));

              return (
                <div
                  key={item.id || item.uid || `link-${index}`}
                  className="pl-2 pr-6 py-[10px] text-xl leading-normal  font-bold md:text-[20px] lg:text-[24px] 2xl:px-2 2xl:text-[28px]"
                >
                  {/* Layout wrapper */}
                  <div className="flex flex-col gap-1 px-0 md:flex-row md:items-center md:gap-0 xl:px-0">
                    {/* Chevron + Link */}
                    <div className="flex items-center">
                      <ChevronRight className="" size={24} strokeWidth={3} aria-hidden="true" />

                      {isEditableLink ? (
                        <Link
                          field={(patchLinkField(rawLinkField, siteName) ?? rawLinkField) as any}
                          className={cn(
                            'ml-1 inline-flex flex-wrap items-baseline no-underline',
                            'transition-opacity duration-200',
                            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-outline)]',
                          )}
                        />
                      ) : (
                        <Link
                          field={linkField as any}
                          className={cn(
                            'ml-1 inline-flex flex-wrap items-baseline no-underline',
                            'transition-opacity duration-200',
                            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-outline)]',
                          )}
                        >
                          {linkTextField ? (
                            <Text field={linkTextField} />
                          ) : (
                            <span>
                              {(linkField?.value?.text || linkField?.value?.description || '').toString()}
                            </span>
                          )}
                        </Link>
                      )}
                    </div>

                    {/* Description Text */}
                    {hasText && (
                      <span className="text-[17px] font-normal md:ml-2 lg:text-[18px]">
                        <span className="hidden md:inline">{' - '}</span>
                        <Text field={textField} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Default;

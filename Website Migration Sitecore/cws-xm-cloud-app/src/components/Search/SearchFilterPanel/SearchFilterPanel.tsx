import React from 'react';
import { Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { Field } from '@sitecore-content-sdk/nextjs';

import { useOptionalSearchContext } from '@/contexts/SearchContext';
import type {
  SearchFilterPanelProps,
  FilterGroup,
  FilterOption,
} from './search_filter_panel.props';

import { cn } from '@/lib/utils';

const getStringValue = (field?: Field<string>): string | undefined => {
  const value = field?.value;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const getNumberValue = (field?: Field<number>): number | undefined => {
  if (typeof field?.value !== 'number' || Number.isNaN(field.value)) return undefined;
  return field.value;
};

export const Default: React.FC<SearchFilterPanelProps> = (props) => {
  const { fields, className, isOpen: isOpenProp = false, onClose, onFilterChange } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const searchContext = useOptionalSearchContext();
  const selectedFacets = searchContext?.selectedFacets ?? {};
  const isFilterPanelOpen = searchContext?.isFilterPanelOpen ?? isOpenProp;

  const datasource = fields?.data?.datasource;
  const filterHeadingField = datasource?.filterHeading?.jsonValue;
  const resetButtonTextField = datasource?.resetButtonText?.jsonValue;
  const closeButtonTextField = datasource?.closeButtonText?.jsonValue;
  const contentTypeGroup = datasource?.contentTypeGroup;
  const tagsGroup = datasource?.tagsGroup;

  const filterHeading = getStringValue(filterHeadingField) ?? 'Filter';
  const resetButtonText = getStringValue(resetButtonTextField) ?? 'Reset';
  const closeButtonText = getStringValue(closeButtonTextField) ?? 'Close';

  const groupKeyToFacetType: Record<string, string> = {
    contentType: 'type',
    tags: 'news_tags',
  };

  // Use live facets from context so the panel reflects the latest API results
  const liveFacets = searchContext?.facets ?? [];
  const dynamicTypeFacet = liveFacets.find((f) => f?.name === 'type');
  const dynamicTagsFacet = liveFacets.find((f) => f?.name === 'news_tags');

  const dynamicContentTypeGroup: FilterGroup | undefined = dynamicTypeFacet
    ? {
        heading: contentTypeGroup?.heading || ({ jsonValue: { value: 'Content Type' } } as any),
        options: dynamicTypeFacet.value.map((v) => ({
          label: { jsonValue: { value: v.text } },
          value: { jsonValue: { value: v.text } },
          count: { jsonValue: { value: v.count } },
        })),
      }
    : undefined;

  const dynamicTagsGroup: FilterGroup | undefined = dynamicTagsFacet
    ? {
        heading: tagsGroup?.heading || ({ jsonValue: { value: 'Tags' } } as any),
        options: dynamicTagsFacet.value.map((v) => ({
          label: { jsonValue: { value: v.text } },
          value: { jsonValue: { value: v.text } },
          count: { jsonValue: { value: v.count } },
        })),
      }
    : undefined;

  const handleCheckboxChange = (groupKey: string, value: string) => {
    const facetType = groupKeyToFacetType[groupKey] || groupKey;
    // Clean value: remove any existing prefix (e.g., 'tags_workwear:Events' -> 'Events')
    const cleanValue = value.includes(':') ? value.split(':').pop() || value : value;
    searchContext?.toggleFacet?.(facetType, cleanValue);

    // Also call legacy callback if provided
    if (onFilterChange) {
      const updatedFacets = { ...selectedFacets };
      const currentValues = updatedFacets[facetType] || [];
      const isSelected = currentValues.includes(cleanValue);
      updatedFacets[facetType] = isSelected
        ? currentValues.filter((v) => v !== cleanValue)
        : [...currentValues, cleanValue];
      onFilterChange(updatedFacets);
    }
  };

  const handleReset = () => {
    searchContext?.clearFacets?.();
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  const handleClose = () => {
    searchContext?.setFilterPanelOpen?.(false);
    if (onClose) {
      onClose();
    }
  };

  const renderFilterGroup = (group: FilterGroup | undefined, groupKey: string) => {
    if (!group) return null;

    const heading = getStringValue(group.heading?.jsonValue);
    const options = group.options || [];

    if (!heading || options.length === 0) return null;

    return (
      <div className="mb-8 last:mb-0" key={groupKey}>
        <h3 className="m-0 mb-4 text-base leading-normal font-bold text-black">{heading}</h3>
        <div className="flex flex-col gap-3">
          {options.map((option: FilterOption, index: number) => {
            const label = getStringValue(option.label?.jsonValue);
            const value = getStringValue(option.value?.jsonValue);
            const count = getNumberValue(option.count?.jsonValue);

            if (!label || !value) return null;

            const facetType = groupKeyToFacetType[groupKey] || groupKey;
            const cleanValue = value.includes(':') ? value.split(':').pop() || value : value;
            const isChecked = selectedFacets[facetType]?.includes(cleanValue) || false;
            const checkboxId = `${groupKey}-${cleanValue}-${index}`;

            return (
              <div key={checkboxId} className="relative flex items-center gap-3">
                <input
                  type="checkbox"
                  id={checkboxId}
                  className={cn(
                    'peer h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-none border-2 border-black bg-white',
                    'checked:border-black checked:bg-white',
                    "relative before:absolute before:top-1/2 before:left-1/2 before:h-2 before:w-2 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-black before:content-['']",
                    'checked:before:block',
                    'before:hidden',
                    isPageEditing && 'cursor-not-allowed opacity-50',
                  )}
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(groupKey, value)}
                  disabled={isPageEditing}
                />
                <label
                  htmlFor={checkboxId}
                  className={cn(
                    'flex-1 text-[17px] leading-[28px] font-[400] text-black select-none',
                    'my-2 h-auto hyphens-manual',
                    isPageEditing ? 'cursor-not-allowed' : 'cursor-pointer',
                  )}
                >
                  {label}
                </label>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'fixed z-[9999] w-full overflow-y-auto bg-white shadow-[-2px_0_8px_rgba(0,0,0,0.1)] transition-[right] duration-200 ease-in-out',
        'top-[var(--drupal-displace-offset-top,0px)] h-[calc(100dvh-var(--drupal-displace-offset-top,0px))]',
        'lg:w-[432px]',
        isFilterPanelOpen ? 'right-0' : 'right-[-100%]',
        className,
      )}
      role="complementary"
      data-component="SearchFilterPanel"
    >
      <div className="flex h-full flex-col p-0">
        <div className="flex shrink-0 items-center justify-between px-6 py-5">
          <h2 className="m-0 text-xl leading-snug font-bold text-black">
            {filterHeadingField ? <Text field={filterHeadingField} /> : filterHeading}
          </h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="border-none bg-transparent p-0 text-[15px] font-normal text-black cursor-pointer"
              onClick={handleReset}
              aria-label={resetButtonText}
            >
              {resetButtonTextField ? <Text field={resetButtonTextField} /> : resetButtonText}
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center border-none bg-transparent text-black transition-opacity hover:opacity-70 focus-visible:opacity-70 focus-visible:outline-none cursor-pointer"
              onClick={handleClose}
              aria-label="Close filter panel"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-1">
          {renderFilterGroup(dynamicContentTypeGroup || contentTypeGroup, 'contentType')}
          {renderFilterGroup(dynamicTagsGroup || tagsGroup, 'tags')}
        </div>

        <div className="shrink-0 px-6 py-5">
          <button
            type="button"
            className="flex w-full items-center justify-center rounded-2xl border border-black bg-white px-8 py-3 text-base font-semibold text-black transition-colors hover:bg-black hover:text-white focus-visible:bg-black focus-visible:text-white focus-visible:outline-none"
            onClick={handleClose}
          >
            {closeButtonTextField ? <Text field={closeButtonTextField} /> : closeButtonText}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Default;

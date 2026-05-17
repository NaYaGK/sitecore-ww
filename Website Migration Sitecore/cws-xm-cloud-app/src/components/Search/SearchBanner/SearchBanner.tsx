import { Text, Placeholder } from '@sitecore-content-sdk/nextjs';
import { SearchBannerProps } from './SearchBanner.props';
import { cn } from '@/lib/utils';
import { useOptionalSearchContext } from '../../../contexts/SearchContext';
import { SlidersHorizontal } from 'lucide-react';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SearchFacetsModal } from '../Listing/SearchFacetsModal';
import { LEGACY_SEARCH_QUERY_PARAM, SEARCH_QUERY_PARAM } from '@/utils/searchUrlUtils';

type SearchBannerVariant = 'default';

const SearchBannerLayout: React.FC<SearchBannerProps & { variant: SearchBannerVariant }> = (
  props,
) => {
  const { fields, params, rendering } = props;
  const searchParams = useSearchParams();

  const searchContext = useOptionalSearchContext();
  const keyword = searchContext?.keyword;
  const resultCount = searchContext?.resultCount;

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const selectedFacets = searchContext?.selectedFacets ?? {};
  const isFilterPanelOpen = searchContext?.isFilterPanelOpen ?? false;

  const getSelectedFacetNames = () => {
    const facetValues: string[] = [];
    Object.entries(selectedFacets).forEach(([facetType, values]) => {
      values.forEach((value) => {
        // Values are now stored clean in context, so just use them directly
        facetValues.push(value);
      });
    });
    return facetValues.join(', ');
  };

  const selectedFacetNames = getSelectedFacetNames();

  const handleFilterButtonClick = () => {
    searchContext?.setFilterPanelOpen?.(!isFilterPanelOpen);
  };

  useEffect(() => {
    const query =
      searchParams?.get(SEARCH_QUERY_PARAM) || searchParams?.get(LEGACY_SEARCH_QUERY_PARAM);
    if (query && !keyword) {
      searchContext?.setKeyword?.(query);
    }
  }, [searchParams, keyword, searchContext]);

  return (
    <section
      className={cn('component search-banner', 'w-full pt-8 pb-9 lg:pt-12 lg:pb-[57px]')}
      style={{ backgroundColor: 'var(--color-accent-primary)' }}
      data-component="SearchBanner"
      id={params?.RenderingIdentifier}
    >
      <div className="mx-auto max-w-[1360px] px-2.5">
        {/* Heading */}
        {fields.Heading && <Text tag="h1" field={fields.Heading} className="font-heading-h1" />}

        <h5 className="font-heading-h5 my-6">
          <>
            {fields.SearchQuery && <Text field={fields.SearchQuery} />}{' '}
            <span>&quot;{keyword}&quot;</span>{' '}
            <span>
              ({typeof resultCount === 'number' ? resultCount : 0}{' '}
              {fields.ResultCountText && <Text field={fields.ResultCountText} />})
            </span>
          </>
        </h5>

        {/* Search bar + filter button */}
        <div className="my-3 flex flex-col gap-10 lg:gap-4 py-2.5 lg:flex-row lg:items-center">
          {/* Search input (50% on desktop) */}
          <div className="w-full lg:w-1/2">
            <Placeholder
              name={`search-banner-${params?.DynamicPlaceholderId}`}
              rendering={rendering}
            />
          </div>

          {/* Filter button (50% on desktop) */}
          {fields.FilterButtonText && (
            <button
              type="button"
              onClick={handleFilterButtonClick}
              // onClick={() => setIsFilterOpen(true)}
              className={cn(
                'flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-black py-[9px] pl-10 text-xl font-bold hover:bg-black hover:text-white focus:bg-black focus:text-white md:pl-[50px] lg:w-1/2 lg:pl-[60px]',
                isFilterPanelOpen && 'bg-black text-white',
              )}
              aria-expanded={isFilterPanelOpen}
              aria-controls="search-filter-panel"
            >
              <SlidersHorizontal
                aria-hidden
                className="mr-3 inline-block rotate-180 align-middle"
                strokeWidth={2.5}
              />
              <span className="text-left lg:text-center">
                <Text field={fields.FilterButtonText} />
                {selectedFacetNames && (
                  <span className="ml-0 truncate font-[suisse_intlregular,sans-serif] text-[17px] leading-[25px] font-normal capitalize opacity-60 lg:ml-2 lg:text-[18px] lg:leading-[28px]">
                    {selectedFacetNames}
                  </span>
                )}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <SearchFacetsModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
    </section>
  );
};

export const Default: React.FC<SearchBannerProps> = (props) => (
  <SearchBannerLayout {...props} variant="default" />
);

export default Default;

import React from 'react';
import { Placeholder } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { SearchProvider } from '../../../contexts/SearchContext';
import SearchFilterPanel from '../SearchFilterPanel/SearchFilterPanel';


const SearchContainer = (props: ComponentProps) => {
  return (
    <SearchProvider>
      <div
        className="component search-container lg:mt-5"
        data-component="SearchContainer"
        id={props?.params?.RenderingIdentifier}
      >
        <Placeholder
          name={`search-container-${props?.params?.DynamicPlaceholderId}`}
          rendering={props?.rendering}
        />

        <SearchFilterPanel {...(props as any)} />
      </div>
    </SearchProvider>
  );
};

export default SearchContainer;

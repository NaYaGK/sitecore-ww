'use client';

import React from 'react';
import { useRouter } from 'next/router';
import { SearchBarProps } from './SearchBar.props';
import SearchBarAllPages from './SearchBarAllPages';
import SearchBarSearchPage from './SearchBarSearchPage';
import { useSearchPage } from '@/hooks/useSearchPage';

const SearchBar: React.FC<SearchBarProps> = (props) => {
    const isSearchPageCurrent = useSearchPage();

    if (isSearchPageCurrent) {
        return <SearchBarSearchPage {...props} />;
    }

    return <SearchBarAllPages {...props} />;
};

export const Default: React.FC<SearchBarProps> = (props) => <SearchBar {...props} />;

export const Jobs: React.FC<SearchBarProps> = (props) => <SearchBar {...props} />;

export default Default;

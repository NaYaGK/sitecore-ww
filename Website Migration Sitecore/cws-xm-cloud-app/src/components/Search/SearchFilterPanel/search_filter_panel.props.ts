import type { ComponentProps } from '@/lib/component-props';
import type { Field } from '@sitecore-content-sdk/nextjs';

export interface FilterOption {
  label?: {
    jsonValue?: Field<string>;
  };
  value?: {
    jsonValue?: Field<string>;
  };
  count?: {
    jsonValue?: Field<number>;
  };
}

export interface FilterGroup {
  heading?: {
    jsonValue?: Field<string>;
  };
  options?: FilterOption[];
}

export interface SearchFilterPanelDatasource {
  filterHeading?: {
    jsonValue?: Field<string>;
  };
  resetButtonText?: {
    jsonValue?: Field<string>;
  };
  closeButtonText?: {
    jsonValue?: Field<string>;
  };
  contentTypeGroup?: FilterGroup;
  tagsGroup?: FilterGroup;
}

export interface SearchFilterPanelFields {
  data?: {
    datasource?: SearchFilterPanelDatasource;
  };
}

export interface SearchFilterPanelProps extends ComponentProps {
  className?: string;
  fields?: SearchFilterPanelFields;
  isOpen?: boolean;
  onClose?: () => void;
  onFilterChange?: (filters: Record<string, string[]>) => void;
}

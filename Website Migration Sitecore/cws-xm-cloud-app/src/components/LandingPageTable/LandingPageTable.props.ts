import type { ComponentProps } from '@/lib/component-props';

export interface LandingPageTableColumn {
  label: string;
}

export interface LandingPageTableRow {
  icon: string;
  cells: string[];
}

export interface LandingPageTableDatasource {
  ariaLabel?: { value?: string };
  columns?: { targetItems?: Array<Record<string, unknown>> };
  rows?: { targetItems?: Array<Record<string, unknown>> };
}

export interface LandingPageTableProps extends ComponentProps {
  fields?: {
    data?: {
      datasource?: LandingPageTableDatasource | Record<string, unknown>;
    };
    datasource?: LandingPageTableDatasource | Record<string, unknown>;
  };
}

import { Field, RichTextField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

interface IndustrySectorTeaserGridDatasource {
  Title?: {
    jsonValue?: Field<string>;
  };
  IntroCopy?: {
    jsonValue?: RichTextField;
  };
  Items?: {
    targetItems?: any[];
  };
}

export interface IndustrySectorTeaserGridFields {
  data?: {
    datasource?: IndustrySectorTeaserGridDatasource;
  };
}

export interface IndustrySectorTeaserGridProps extends ComponentProps {
  fields: IndustrySectorTeaserGridFields;
}


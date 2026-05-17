import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

export interface AdvantageCardItem {
  icon?: {
    jsonValue?: ImageField;
  };
  title?: {
    jsonValue?: Field<string>;
  };
  bodyCopy?: {
    jsonValue?: Field<string>;
  };
  ctaText?: {
    jsonValue?: Field<string>;
  };
  ctaLink?: {
    jsonValue?: LinkField;
  };
}

interface AdvantageCardsDatasource {
  sectionTitle?: {
    jsonValue?: Field<string>;
  };
  cards?: {
    targetItems?: AdvantageCardItem[];
  };
}

export interface AdvantageCardsProps extends ComponentProps {
  params: ComponentProps['params'];
  fields: {
    data?: {
      datasource?: AdvantageCardsDatasource;
    };
  };
}

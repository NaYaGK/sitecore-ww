import { Field } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

type AccordionRenderingParams = ComponentProps['params'] & {
  /**
   * Optional rendering parameter that controls how many FAQ items are rendered
   * before the "Load more" button reveals the remaining entries.
   */
  initialVisibleItems?: string;
};

export interface AccordionFaqItem {
  question?: {
    jsonValue?: Field<string>;
  };
  answer?: {
    jsonValue?: Field<string>;
  };
}

interface AccordionDatasource {
  title?: {
    jsonValue?: Field<string>;
  };
  subtitle?: {
    jsonValue?: Field<string>;
  };
  introductionText?: {
    jsonValue?: Field<string>;
  };
  faqItems?: {
    results?: AccordionFaqItem[];
  };
  loadMoreButtonText?: {
    jsonValue?: Field<string>;
  };
  loadMoreEnabled?: {
    jsonValue?: Field<string>;
  };
  backgroundColor?: {
    jsonValue?: Field<string>;
  };
}

export interface AccordionProps extends ComponentProps {
  params: AccordionRenderingParams;
  fields: {
    data?: {
      datasource?: AccordionDatasource;
    };
  };
}

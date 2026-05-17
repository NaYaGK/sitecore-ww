import { Field, RichTextField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

export interface AccordionItemFields {
  Question?: {
    jsonValue?: Field<string>;
  };
  Answer?: {
    jsonValue?: RichTextField;
  };
}

export interface AccordionItemProps extends ComponentProps {
  fields: AccordionItemFields;
}

import type { ComponentRendering, ComponentFields } from '@sitecore-content-sdk/nextjs';
import type { ComponentProps } from '@/lib/component-props';

type FieldValue = {
  value?: string;
  jsonValue?: {
    value?: string;
  };
};

type WysiwygTableFields = ComponentFields & {
  // Main content field for the table HTML (case-insensitive)
  Content?: FieldValue;
  content?: FieldValue;
  
  // Optional anchor ID for the component (case-insensitive)
  AnchorId?: FieldValue;
  anchorId?: FieldValue;
  
  // Support for datasource pattern
  data?: {
    datasource?: any;
  };
  
  // Support direct field access
  fields?: any;
  
  // Allow any other string key
  [key: string]: any;
};

interface WysiwygTableRendering extends Omit<ComponentRendering, 'fields'> {
  dataSource?: string;
  datasource?: string;
  fields?: WysiwygTableFields;
  [key: string]: any;
}

interface WysiwygTableProps extends Omit<ComponentProps, 'rendering'> {
  rendering: WysiwygTableRendering;
  className?: string;
}

export type { WysiwygTableFields, WysiwygTableRendering, WysiwygTableProps };

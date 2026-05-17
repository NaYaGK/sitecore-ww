import { Field, RichTextField, ComponentRendering } from '@sitecore-content-sdk/nextjs';

export interface WysiwygBlockFields {
  content?: {
    jsonValue?: RichTextField;
    value?: string;
  };
  Content?: {
    jsonValue?: RichTextField;
    value?: string;
  };
  anchorId?: {
    jsonValue?: Field<string>;
    value?: string;
  };
  AnchorId?: {
    jsonValue?: Field<string>;
    value?: string;
  };
  data?: {
    datasource?: {
      content?: {
        jsonValue?: RichTextField;
        value?: string;
      };
      anchorId?: {
        jsonValue?: Field<string>;
        value?: string;
      };
    };
  };
  [key: string]: any; // For dynamic field access
}

export interface WysiwygBlockProps {
  rendering: ComponentRendering & {
    componentName?: string;
    fields?: WysiwygBlockFields;
  };
  fields?: WysiwygBlockFields;
  className?: string;
  params?: {
    Design?: string;
    Styles?: string;
    RenderingIdentifier?: string;
  };
  [key: string]: unknown;
}

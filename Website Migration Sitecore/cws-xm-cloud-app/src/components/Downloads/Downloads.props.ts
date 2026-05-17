// src/components/Downloads/Downloads.props.ts
import { ComponentParams, ComponentRendering, Field, LinkField, TextField } from '@sitecore-content-sdk/nextjs';

export interface DownloadItem {
  id?: string;
  fields?: {
    DisplayName?: TextField;
    Description?: TextField;
    FileLink?: LinkField;
    FileType?: Field<string>;
    FileSize?: Field<string>;
  };
}

export interface DownloadsFields {
  Title?: TextField;
  DownloadItems?: {
    targetItems?: DownloadItem[];
  };
}

export interface DownloadsProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: DownloadsFields;
}
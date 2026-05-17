// @ts-nocheck
import { Field, LinkField } from '@sitecore-content-sdk/nextjs';

import { ComponentProps } from '@/lib/component-props';

export interface DownloadComponentFields {
  Heading?: Field<string>;
  Title?: Field<string>;
  Description?: Field<string>;
  DocumentLink?: LinkField;
  ButtonLabel?: Field<string>;
  FileMetaOverride?: Field<string>;
}

export interface DownloadComponentProps extends ComponentProps {
  fields: DownloadComponentFields;
}

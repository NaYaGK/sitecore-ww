import { TextField, ComponentParams } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

export interface JobBannerFields {
  Title?: TextField;
}

export interface JobBannerProps extends ComponentProps {
  fields: JobBannerFields;
  params: ComponentParams;
}

import type { ComponentRendering, ComponentParams } from '@sitecore-content-sdk/nextjs';

export type DownwardAnimationProps = {
  rendering?: ComponentRendering & { params?: ComponentParams };
  params?: ComponentParams;
};

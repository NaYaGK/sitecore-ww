import type { ComponentProps } from '@/lib/component-props';

export interface LandingPageFooterProps extends ComponentProps {
  fields: {
    data?: {
      datasource?: Record<string, unknown>;
    };
  };
}

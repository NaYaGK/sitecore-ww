import type { ComponentProps } from '@/lib/component-props';

export interface HorizontalTeaserProps extends ComponentProps {
  className?: string;
  fields?: Record<string, unknown>;
  styles?: string;
}
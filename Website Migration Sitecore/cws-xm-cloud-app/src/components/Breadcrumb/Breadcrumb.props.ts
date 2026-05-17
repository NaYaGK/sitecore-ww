import { ComponentProps } from '@/lib/component-props';

export interface BreadcrumbItem {
  Title: string;
  NavigationTitle: string;
  url: string;
}

export interface BreadcrumbProps extends ComponentProps {}

import type { ComponentProps } from '@/lib/component-props';

export interface LandingPageHeroUsp {
  title: string;
  description: string;
}

export interface LandingPageHeroImage {
  src: string;
  alt: string;
}

export interface LandingPageHeroTrustBadge {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface LandingPageHeroLogo {
  src: string;
  alt: string;
}

export interface LandingPageHeroDatasource {
  headline?: { value?: string };
  formHeading?: { value?: string };
  formSubheading?: { value?: string };
  solutionLabel?: { value?: string };
  phoneNumber?: { value?: string };
  phoneDisplay?: { value?: string };
  ctaButtonText?: { value?: string };
  logo?: { jsonValue?: { value?: { src?: string; alt?: string } } };
  images?: { targetItems?: Array<Record<string, unknown>> };
  usps?: { targetItems?: Array<Record<string, unknown>> };
  trustBadges?: { targetItems?: Array<Record<string, unknown>> };
}

export interface LandingPageHeroProps extends ComponentProps {
  fields?: {
    data?: {
      datasource?: LandingPageHeroDatasource | Record<string, unknown>;
    };
    datasource?: LandingPageHeroDatasource | Record<string, unknown>;
  };
}

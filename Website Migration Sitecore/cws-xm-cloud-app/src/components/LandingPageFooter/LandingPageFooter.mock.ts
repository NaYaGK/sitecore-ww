/**
 * Mock data for LandingPageFooter component.
 * This data will be replaced by Sitecore datasource fields once wired up.
 */
export interface LandingPageFooterLink {
  href: string;
  label: string;
  rel?: string;
}

export interface LandingPageFooterMock {
  copyrightText: string;
  navAriaLabel: string;
  ctaButton: {
    href: string;
    label: string;
    title: string;
  };
  links: LandingPageFooterLink[];
}

export const landingPageFooterMock: LandingPageFooterMock = {
  copyrightText: '\u00a9 2026 CWS International GmbH',
  navAriaLabel: 'Footer navigation Workwear LP',
  ctaButton: {
    href: '#kontakt',
    label: 'Request a quote today',
    title: 'Request a quote today',
  },
  links: [
    {
      href: '/en/privacy-policy',
      label: 'Data Protection',
    },
    {
      href: '/en/imprint',
      label: 'Imprint',
    },
  ],
};

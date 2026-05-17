/**
 * MfeLink — Bridge between Sitecore LinkField and Next.js Link
 *
 * Renders internal links using Next.js Link (for client-side navigation within
 * the same zone) and external/cross-zone links as plain <a> tags.
 * Cross-zone navigation between workwear/healthcare/hygiene is handled at the
 * Vercel platform level via microfrontends.json and vercel.ts rewrites.
 *
 * Usage: drop-in replacement for `import { Link } from '@sitecore-content-sdk/nextjs'`
 * in navigation components.
 */

'use client';

import React, { forwardRef } from 'react';
import NextLink from 'next/link';
import type { LinkField } from '@sitecore-content-sdk/nextjs';

export interface MfeLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /** Sitecore LinkField — same API as the Sitecore SDK Link component */
  field?: LinkField;
  /** Optional children override. If not provided, uses field.value.text */
  children?: React.ReactNode;
  /** Optional click handler */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

/**
 * Determines if a URL is internal (relative path or same-origin) and should
 * use the MFE Link for soft navigation.
 */
function isInternalHref(href: string): boolean {
  if (href.startsWith('/')) return true;
  if (href.startsWith('#')) return true;
  try {
    const url = new URL(href);
    // Consider same-domain links as internal
    if (typeof window !== 'undefined' && url.origin === window.location.origin) return true;
    // Also consider known MFE domains as "internal" for soft nav
    const mfeDomains = [
      'dev-sc.cws.com',
      'dev-sc-workwear.cws.com',
      'dev-sc-healthcare.cws.com',
      'cws-hy.vercel.app',
      'www.cws.com',
    ];
    return mfeDomains.some((d) => url.hostname === d || url.hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

const MfeLink = forwardRef<HTMLAnchorElement, MfeLinkProps>(
  ({ field, children, className, onClick, ...rest }, ref) => {
    const href = (field as { value?: { href?: string } })?.value?.href;
    const text = (field as { value?: { text?: string } })?.value?.text;
    const target = (field as { value?: { target?: string } })?.value?.target;
    const title = (field as { value?: { title?: string } })?.value?.title;

    const displayContent = children ?? text;

    // No href — render as a span (non-interactive fallback)
    if (!href) {
      return (
        <span className={className} {...(rest as React.HTMLAttributes<HTMLSpanElement>)}>
          {displayContent}
        </span>
      );
    }

    // External link — render as a plain <a> tag
    if (!isInternalHref(href)) {
      return (
        <a
          ref={ref}
          href={href}
          className={className}
          target={target || '_blank'}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          title={title}
          onClick={onClick}
          {...rest}
        >
          {displayContent}
        </a>
      );
    }

    // Internal link — use Next.js Link for client-side navigation.
    // href is a runtime value from Sitecore so we bypass typedRoutes with `as any`.
    const NextLinkAny = NextLink as any;
    return (
      <NextLinkAny
        ref={ref}
        href={href}
        className={className}
        target={target}
        title={title}
        onClick={onClick}
        {...rest}
      >
        {displayContent}
      </NextLinkAny>
    );
  },
);

MfeLink.displayName = 'MfeLink';

export { MfeLink };
export default MfeLink;

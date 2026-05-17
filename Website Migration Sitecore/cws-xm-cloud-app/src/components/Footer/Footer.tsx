'use client';
import { useState, type FC } from 'react';
import { Placeholder, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ChevronDown, Mail, Phone } from 'lucide-react';

import type { FooterProps } from './Footer.props';
import { cn } from '@/lib/utils';
import { openContactFormModal } from '@/ui/Modal/contact_form_modal';
import { useUrlContext } from '@/contexts/UrlContext';
import { patchHref } from '@/lib/patch-link';
import { useSiteName } from '@/hooks/useSiteName';

// Mobile accordion component for footer link columns
const FooterLinkColumn: FC<{
  title: string;
  links: any[];
  index: number;
  siteName: string;
  onLinkClick?: (href: string) => void;
}> = ({ title, links, index, siteName, onLinkClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isUrlActive } = useUrlContext();

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="-mt-1 flex flex-col gap-3 lg:mt-0 lg:gap-3">
      {/* Desktop: Always show title, Mobile: Clickable accordion header */}
      <button
        onClick={toggleAccordion}
        className={cn(
          'flex w-full items-center justify-between text-left font-bold transition-colors lg:pointer-events-none',
          isOpen ? 'text-brand-text-red lg:text-black' : 'text-black',
        )}
        aria-expanded={isOpen}
        aria-controls={`footer-links-${index}`}
      >
        <span className="block text-[14px] md:text-[12px] 2xl:text-base leading-[12px] font-bold break-words text-black antialiased">
          {title}
        </span>
        <ChevronDown
          className={cn(
            '-mr-2 h-6 w-6 text-black transition-transform duration-300 lg:hidden',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {/* Links - Hidden on mobile when closed, always visible on desktop */}
      {links.length > 0 && (
        <ul
          id={`footer-links-${index}`}
          className={cn(
            'flex list-none flex-col gap-3 p-0 font-light transition-all duration-300 md:gap-0 2xl:gap-3',
            isOpen ? 'block' : 'hidden lg:flex',
          )}
        >
          {links.map((linkItem: any, linkIndex: number) => {
            // Handle link.link.value structure
            const linkValue = linkItem?.link?.link?.value;
            const rawHref = linkValue?.href;
            const linkText = linkValue?.text;
            const href = patchHref(rawHref, siteName) ?? rawHref;

            if (!linkText || !href) return null;

            return (
              <li key={linkItem?.id || linkIndex} className="mt-4">
                <a
                  href={href}
                  className={cn(
                    'hover:text-brand-text-red cursor-pointer no-underline transition-colors',
                    isUrlActive(href)
                      ? 'text-brand-text-red'
                      : 'text-black'
                  )}
                  onClick={(e: React.MouseEvent) => {
                    // Check if it's a mail or phone link
                    if (href.startsWith('mailto:') || href.startsWith('tel:')) {
                      e.preventDefault();
                      onLinkClick?.(href);
                    }
                  }}
                >
                  {linkText}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export const Default: FC<FooterProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const siteName = useSiteName();
  const routeRendering = page?.layout?.sitecore?.route as
    | { placeholders?: Record<string, Array<any>> }
    | undefined;
  const routePlaceholders = routeRendering?.placeholders as Record<string, unknown> | undefined;
  const routePlaceholderKeys = Object.keys(routePlaceholders ?? {});
  const dynamicPlaceholderId =
    props?.params?.DynamicPlaceholderId ?? props?.rendering?.params?.DynamicPlaceholderId;
  const getPlaceholderLeafName = (placeholderName: string) =>
    placeholderName.split('/').filter(Boolean).pop() ?? placeholderName;
  const getMatchingPlaceholderKeys = (placeholderKeys: string[], baseName: string): string[] => {
    const normalizedBaseName = baseName.toLowerCase();
    return placeholderKeys.filter((placeholderName) => {
      const placeholderLeafName = getPlaceholderLeafName(placeholderName).toLowerCase();
      return (
        placeholderLeafName === normalizedBaseName ||
        placeholderLeafName.startsWith(`${normalizedBaseName}-`)
      );
    });
  };
  const hasPlaceholderContent = (
    placeholderMap: Record<string, unknown> | undefined,
    placeholderName: string,
  ): boolean => {
    const placeholderValue = placeholderMap?.[placeholderName];
    if (Array.isArray(placeholderValue)) return placeholderValue.length > 0;
    return Boolean(placeholderValue);
  };
  const getFooterRenderingsFromRoute = () => {
    const headlessFooterRenderings = routeRendering?.placeholders?.['headless-footer'] ?? [];
    const footerRenderings = headlessFooterRenderings.filter(
      (footerRendering) => footerRendering?.componentName === 'Footer',
    );

    const uniqueRenderings = [rendering, ...footerRenderings].filter(
      (footerRendering, index, list) =>
        list.findIndex((candidate) => candidate?.uid === footerRendering?.uid) === index,
    );

    return uniqueRenderings;
  };
  const expandKeyWithDynamicId = (placeholderName: string, footerRendering: any): string[] => {
    if (!placeholderName.includes('{*}')) return [placeholderName];

    const footerDynamicId =
      footerRendering?.params?.DynamicPlaceholderId ??
      dynamicPlaceholderId;

    if (!footerDynamicId) return [placeholderName];
    return [placeholderName, placeholderName.replace('{*}', footerDynamicId)];
  };
  const resolveFooterPlaceholderTarget = (baseName: string) => {
    const routeLevelRawMatches = getMatchingPlaceholderKeys(routePlaceholderKeys, baseName).filter(
      (placeholderName) => placeholderName.toLowerCase().includes('headless-footer'),
    );
    const routeLevelExpandedMatches = routeLevelRawMatches
      .flatMap((placeholderName) =>
        expandKeyWithDynamicId(placeholderName, {
          params: { DynamicPlaceholderId: dynamicPlaceholderId },
        }),
      )
      .filter((placeholderName, index, list) => list.indexOf(placeholderName) === index);
    const routeLevelMatchesWithContent = routeLevelExpandedMatches.filter((placeholderName) =>
      hasPlaceholderContent(routePlaceholders, placeholderName),
    );

    if (routeLevelMatchesWithContent.length > 0 && routeRendering) {
      return {
        renderingContext: routeRendering as typeof rendering,
        placeholderNames: routeLevelMatchesWithContent,
      };
    }

    const footerRenderings = getFooterRenderingsFromRoute();
    let fallbackTarget:
      | { renderingContext: typeof rendering; placeholderNames: string[] }
      | undefined;

    for (const footerRendering of footerRenderings) {
      const placeholderMap = footerRendering?.placeholders as Record<string, unknown> | undefined;
      const placeholderKeys = Object.keys(placeholderMap ?? {});
      const rawMatches = getMatchingPlaceholderKeys(placeholderKeys, baseName);
      if (rawMatches.length === 0) continue;

      const expandedMatches = rawMatches
        .flatMap((placeholderName) => expandKeyWithDynamicId(placeholderName, footerRendering))
        .filter((placeholderName, index, list) => list.indexOf(placeholderName) === index);
      const matchesWithContent = expandedMatches.filter((placeholderName) =>
        hasPlaceholderContent(placeholderMap, placeholderName),
      );

      if (matchesWithContent.length > 0) {
        return {
          renderingContext: footerRendering as typeof rendering,
          placeholderNames: matchesWithContent,
        };
      }

      if (!fallbackTarget) {
        fallbackTarget = {
          renderingContext: footerRendering as typeof rendering,
          placeholderNames: expandedMatches,
        };
      }
    }

    if (fallbackTarget) return fallbackTarget;

    if (routeLevelExpandedMatches.length > 0 && routeRendering) {
      return {
        renderingContext: routeRendering as typeof rendering,
        placeholderNames: routeLevelExpandedMatches,
      };
    }

    return { renderingContext: rendering, placeholderNames: [] };
  };
  const socialPlaceholderTarget = resolveFooterPlaceholderTarget('social-accounts');
  const globalPlaceholderTarget = resolveFooterPlaceholderTarget('global-footer');

  // Handle link clicks for mail and phone - opens default system applications
  const handleLinkClick = (href: string, linkType?: string) => {
    // Determine the protocol if not explicitly provided
    let finalHref = href;

    if (linkType === 'mailto' && !href.startsWith('mailto:')) {
      finalHref = `mailto:${href}`;
    } else if (linkType === 'tel' && !href.startsWith('tel:')) {
      // Clean phone number and format as tel: protocol
      const cleanNumber = href.replace(/[^\d+]/g, '');
      finalHref = `tel:${cleanNumber}`;
    }

    // Use standard protocols to open default system applications
    // mailto: opens default email client
    // tel: opens default phone/calling application
    window.location.href = finalHref;
  };

  // Handle flexible field resolution - datasource might be at different levels
  const datasource: any = fields?.data?.datasource ?? fields?.datasource ?? fields;

  // Extract data from the actual structure
  const phoneNumber = datasource?.phoneNumber?.value;
  const workingHours = datasource?.workingHours?.value;
  const messageLabel = datasource?.messageLabel?.value;
  const pressContactHtml = datasource?.pressContact?.value;
  const prAgencyHtml = datasource?.prAgency?.value;
  const contactTitle = datasource?.contactTitle?.value;
  // Footer datasource children - containers with children (Services, About CWS Workwear)
  const footerChildren = datasource?.children?.results ?? [];
  const hasFooterDatasourceContent = Boolean(
    phoneNumber ||
      workingHours ||
      messageLabel ||
      pressContactHtml ||
      prAgencyHtml ||
      contactTitle ||
      footerChildren.length > 0,
  );

  // Parse HTML content for Press Contact and PR Agency
  const parseContactHtml = (html: string) => {
    if (!html) return null;

    // Helper to decode HTML entities
    const decodeHtml = (str: string) => {
      return str
        .replace(/&amp;/g, '&')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    };

    // Unified parsing logic for both server and client to avoid hydration mismatches
    const titleMatch = html.match(/<p><strong>(.*?)<\/strong><\/p>/);
    const title = titleMatch ? decodeHtml(titleMatch[1] || '') : '';

    // Split by paragraph tags and clean up
    const paragraphs = html
      .split('</p>')
      .map((p) => {
        // Remove all HTML tags and trim
        const text = p.replace(/<[^>]*>/g, '').trim();
        return decodeHtml(text);
      })
      .filter(Boolean);

    const name = paragraphs[1] || '';
    const role = paragraphs[2] || '';

    const emailMatch = html.match(/href="([^"]+)"/);
    const email = emailMatch?.[1]?.replace('mailto:', '') || '';

    const emailTextMatch = html.match(/<a[^>]*>([^<]+)<\/a>/);
    const emailText = emailTextMatch ? decodeHtml(emailTextMatch[1] || '') : '';

    return { title, name, role, email, emailText };
  };

  const pressContact = parseContactHtml(pressContactHtml);
  const prAgency = parseContactHtml(prAgencyHtml);

  return (
    <footer
      className={cn('bg-accent w-full text-sm lg:py-0 lg:pt-0 lg:text-xs')}
      data-component="Footer"
    >
      <div
        className={cn(
          'mx-auto max-w-[1360px] px-2 lg:px-[10px]',
          hasFooterDatasourceContent || isPageEditing ? 'py-8 lg:pt-10 lg:pb-8' : 'py-0',
        )}
      >
        {hasFooterDatasourceContent || isPageEditing ? (
          <>
            {/* Main Content Grid */}
            <div className="mt-2 grid grid-cols-1 gap-8 lg:grid-cols-4  lg:gap-0 mb-0 text-[14px] md:text-[12px] leading-[14px] md:leading-[22px] 2xl:text-base">
              {/* Left Column - Contact Section */}
              <div className="flex flex-col gap-6 md:gap-4 2xl:gap-6">
                {/* Contact Label */}
                <div className="mb-0 text-[16px] md:text-[12px] leading-[14px] md:leading-[12px] font-bold tracking-wide break-words text-black antialiased  2xl:text-base lg:mb-2">
                  {contactTitle || 'Contact'}
                </div>
                {/* Phone */}
                {phoneNumber && (
                  <div className="phone flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-black/50" aria-hidden="true" />
                    <div className="flex flex-col">
                      <a
                        href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                        title="Call us now!"
                        className="hover:text-brand-text-red my-1 cursor-pointer font-bold text-black no-underline transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          handleLinkClick(phoneNumber, 'tel');
                        }}
                      >
                        {phoneNumber}
                      </a>
                      {workingHours && (
                        <span className="pl-2  font-light lg:text-[11px] 2xl:text-[14px]">{workingHours}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Email */}
                {messageLabel && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-black/50" />
                    <span
                      className="hover:text-brand-text-red cursor-pointer font-light text-black transition-colors"
                      onClick={() => {
                        openContactFormModal();
                      }}
                    >
                      {messageLabel}
                    </span>
                  </div>
                )}

                {/* Press Contact */}
                {pressContact && (
                  <div className="flex flex-col gap-2">
                    <div className="my-1 2xl:my-2 font-bold">{pressContact.title}</div>
                    <div className="flex flex-col gap-2 font-light md:gap-1 2xl:gap-2">
                      {pressContact.name && <p className="m-0 text-black">{pressContact.name}</p>}
                      {pressContact.role && <p className="m-0 text-black">{pressContact.role}</p>}
                      {pressContact.emailText && (
                        <a
                          href={pressContact.email}
                          className="hover:text-brand-text-red cursor-pointer text-black no-underline transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            handleLinkClick(pressContact.email, 'mailto');
                          }}
                        >
                          {pressContact.emailText}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* PR Agency */}
                {prAgency && (
                  <div className="mb-8 flex flex-col gap-3 md:gap-2 2xl:gap-3 2xl:-mt-2 lg:mb-0">
                    <div className="font-bold lg:mb-2">{prAgency.title}</div>
                    <div className="flex flex-col gap-2 font-light md:gap-1 2xl:gap-2">
                      {prAgency.name && <p className="m-0 text-black">{prAgency.name}</p>}
                      {prAgency.role && <p className="m-0 text-black">{prAgency.role}</p>}
                      {prAgency.emailText && (
                        <a
                          href={prAgency.email}
                          className="hover:text-brand-text-red cursor-pointer text-black no-underline transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            handleLinkClick(prAgency.email, 'mailto');
                          }}
                        >
                          {prAgency.emailText}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Middle and Right Columns - Services and About CWS Workwear */}
              {footerChildren.map((child: any, index: number) => {
                // Get title from child
                const title = child?.title?.value;
                // Get links from child's children.results
                const childLinks = child?.children?.results ?? [];

                if (!title && childLinks.length === 0) return null;

                return (
                  <FooterLinkColumn
                    key={child?.id || index}
                    title={title}
                    links={childLinks}
                    index={index}
                    siteName={siteName}
                    onLinkClick={handleLinkClick}
                  />
                );
              })}
            </div>
          </>
        ) : null}

        {/* Social Accounts Placeholder */}
        {socialPlaceholderTarget.placeholderNames.map((placeholderName) => (
          <Placeholder
            key={`social-${placeholderName}`}
            name={placeholderName}
            rendering={socialPlaceholderTarget.renderingContext}
          />
        ))}
      </div>

      {/* Downward Animation Portal Target */}
      <div id="downward-animation-portal" className="w-full bg-white" />

      {/* Global Footer Placeholder */}
      {globalPlaceholderTarget.placeholderNames.map((placeholderName) => (
        <Placeholder
          key={`global-${placeholderName}`}
          name={placeholderName}
          rendering={globalPlaceholderTarget.renderingContext}
        />
      ))}
    </footer>
  );
};

export default Default;

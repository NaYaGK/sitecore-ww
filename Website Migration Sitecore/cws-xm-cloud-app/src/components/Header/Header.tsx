'use client';

import { useState, useEffect, useRef, type MouseEvent as ReactMouseEvent } from 'react';
import { useRouter } from 'next/router';
import { useSitecore, useComponentProps, type LinkField, Placeholder } from '@sitecore-content-sdk/nextjs';
import { MfeLink as Link } from '@components/MfeLink/MfeLink';
import { Globe, ChevronRight, Check } from 'lucide-react';
import type { HeaderNavigationNode } from './Header.props';
import { HeaderProps } from './Header.props';
import { cn } from '@/lib/utils';
import {
  SearchBarVisibilityProvider,
  useOptionalSearchBarVisibility,
} from '@/contexts/SearchBarVisibilityContext';
import { MobileMenuProvider, useOptionalMobileMenu } from '@/contexts/MobileMenuContext';
import { openContactFormModal } from '@/ui/Modal/contact_form_modal';
import { useUrlContext } from '@/contexts/UrlContext';
import { useSearchPage } from '@/hooks/useSearchPage';
import { patchLinkField } from '@/lib/patch-link';
import { useLocale } from '@/hooks/useLocale';
import { useSiteName } from '@/hooks/useSiteName';
import HeaderLogo from '../HeaderLogo/HeaderLogo';

const getNodeTitle = (node?: HeaderNavigationNode): string => {
  return node?.title?.value?.trim() ?? '';
};

const getNodeLink = (node?: HeaderNavigationNode): LinkField | undefined => {
  return node?.link?.link;
};

const getChildNodes = (node?: HeaderNavigationNode): HeaderNavigationNode[] => {
  return node?.children?.results ?? [];
};

const patchLink = (
  link: LinkField | undefined,
  siteName: string,
  locale?: string,
): LinkField | undefined => {
  return patchLinkField(link as { value?: { href?: string } }, siteName, undefined, locale ?? undefined) as
    | LinkField
    | undefined;
};

const hasActiveDescendantLink = (
  node: HeaderNavigationNode | undefined,
  isUrlActive: (href: string) => boolean,
  siteName: string,
  locale: string,
): boolean => {
  if (!node) return false;

  const rawLink = getNodeLink(node);
  const patched = patchLink(rawLink, siteName, locale);
  const nodeHref = patched?.value?.href;

  if (nodeHref && isUrlActive(nodeHref)) return true;

  const children = getChildNodes(node);
  for (const child of children) {
    if (hasActiveDescendantLink(child, isUrlActive, siteName, locale)) return true;
  }

  return false;
};

const HeaderContent: React.FC<HeaderProps> = (props) => {
  const { fields, rendering, contactFormId } = props;
  const { page } = useSitecore();
  const router = useRouter();
  const siteName = useSiteName();
  const isCwsSite = siteName?.toLowerCase() === 'cws';
  const isPageEditing = page.mode.isEditing;
  const locale = useLocale();

  const isSearchPageCurrent = useSearchPage();
  const mobileMenuContext = useOptionalMobileMenu();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenuIndex, setActiveMenuIndex] = useState<number | null>(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);
  const [expandedMobileMenus, setExpandedMobileMenus] = useState<number[]>([]);
  const [isSticky, setIsSticky] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileLanguageOpen, setIsMobileLanguageOpen] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);
  const navBarRef = useRef<HTMLDivElement>(null);
  const [failedFlagImages, setFailedFlagImages] = useState<Set<string>>(new Set());

  const renderingPlaceholders = rendering?.placeholders as Record<string, unknown> | undefined;
  const renderingPlaceholderKeys = Object.keys(renderingPlaceholders ?? {});
  const getPlaceholderLeafName = (placeholderName: string) =>
    placeholderName.split('/').filter(Boolean).pop() ?? placeholderName;
  const resolveHeaderPlaceholderName = (baseName: string): string => {
    const matchedPlaceholderName = renderingPlaceholderKeys.find((placeholderKey) => {
      const leafName = getPlaceholderLeafName(placeholderKey).toLowerCase();
      const normalizedBaseName = baseName.toLowerCase();
      return leafName === normalizedBaseName || leafName.startsWith(`${normalizedBaseName}-`);
    });

    if (matchedPlaceholderName) {
      const leafName = getPlaceholderLeafName(matchedPlaceholderName);
      const dynamicPlaceholderId =
        props?.params?.DynamicPlaceholderId ?? props?.rendering?.params?.DynamicPlaceholderId;

      if (leafName.includes('{*}') && dynamicPlaceholderId) {
        return leafName.replace('{*}', String(dynamicPlaceholderId));
      }

      return leafName;
    }

    const dynamicPlaceholderId =
      props?.params?.DynamicPlaceholderId ?? props?.rendering?.params?.DynamicPlaceholderId;
    return dynamicPlaceholderId ? `${baseName}-${dynamicPlaceholderId}` : baseName;
  };

  const headerLogoPlaceholderName = resolveHeaderPlaceholderName('header-logo');
  const topHeaderPlaceholderName = resolveHeaderPlaceholderName('top-header');
  const headerSearchPlaceholderName = resolveHeaderPlaceholderName('header-search-container');
  const placeholderHasItems = (baseName: string): boolean =>
    Object.entries(renderingPlaceholders ?? {}).some(([placeholderName, placeholderItems]) => {
      const placeholderLeafName = getPlaceholderLeafName(placeholderName).toLowerCase();
      const normalizedBaseName = baseName.toLowerCase();
      if (
        placeholderLeafName !== normalizedBaseName &&
        !placeholderLeafName.startsWith(`${normalizedBaseName}-`)
      ) {
        return false;
      }

      if (Array.isArray(placeholderItems)) return placeholderItems.length > 0;
      return Boolean(placeholderItems);
    });
  const getPlaceholderItems = (baseName: string): any[] => {
    const matchingEntry = Object.entries(renderingPlaceholders ?? {}).find(([placeholderName]) => {
      const placeholderLeafName = getPlaceholderLeafName(placeholderName).toLowerCase();
      const normalizedBaseName = baseName.toLowerCase();
      return (
        placeholderLeafName === normalizedBaseName ||
        placeholderLeafName.startsWith(`${normalizedBaseName}-`)
      );
    });

    if (!matchingEntry) return [];
    const [, placeholderItems] = matchingEntry;
    return Array.isArray(placeholderItems) ? placeholderItems : placeholderItems ? [placeholderItems] : [];
  };

  const datasource = fields?.data?.datasource;
  const navigationSections = datasource?.children?.results ?? [];
  const languages = datasource?.languages?.results ?? [];
  const mobileFooterLinks = datasource?.mobileFooterLinks?.results ?? [];
  const customerPortalLink = datasource?.customerPortalLink?.link;
  const contactButtonText = datasource?.ContactLabel?.value || 'Contact';
  const backButtonText = datasource?.backButtonText?.value || 'Back';
  const openSearchAriaLabel = datasource?.openSearchAriaLabel?.value || 'Open search';
  const closeMenuAriaLabel = datasource?.closeMenuAriaLabel?.value || 'Close menu';
  const openMenuAriaLabel = datasource?.openMenuAriaLabel?.value || 'Open menu';
  const backToNavigationAriaLabel =
    datasource?.backToNavigationAriaLabel?.value || 'Back to main navigation';

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasTopHeaderPlaceholder, setHasTopHeaderPlaceholder] = useState(false);
  const [hasHeaderSearchPlaceholder, setHasHeaderSearchPlaceholder] = useState(false);

  // Client-side only placeholder detection to prevent hydration mismatch
  useEffect(() => {
    setHasTopHeaderPlaceholder(placeholderHasItems('top-header'));
    setHasHeaderSearchPlaceholder(placeholderHasItems('header-search-container'));
  }, [renderingPlaceholders]);

  const hasNavigation = navigationSections.length > 0;
  const hasDesktopNavigation = navigationSections.some((section) => Boolean(getNodeTitle(section)));
  const showMainNavigationBar =
    hasDesktopNavigation || (!isSearchPageCurrent && hasHeaderSearchPlaceholder);
  const desktopHeaderOffset = showMainNavigationBar ? 106 : 52;
  const headerLogoRendering = getPlaceholderItems('header-logo').find(
    (placeholderRendering) => placeholderRendering?.componentName === 'HeaderLogo',
  );
  const headerLogoComponentProps = useComponentProps<{ fields?: Record<string, unknown> }>(
    headerLogoRendering?.uid,
  );
  const showHealthcareLogoFallback =
    siteName === 'healthcare' && !headerLogoRendering && !isPageEditing;
  const showMobileSearchButton =
    !isCwsSite && !isSearchPageCurrent && hasHeaderSearchPlaceholder;
  const showMobileMenuToggle =
    hasNavigation || hasTopHeaderPlaceholder || hasHeaderSearchPlaceholder;
  const showMobileHeaderControls = showMobileSearchButton || showMobileMenuToggle;

  // Get search bar visibility from context
  const searchBarVisibility = useOptionalSearchBarVisibility();
  const isSearchBarOpen = searchBarVisibility?.isSearchBarOpen ?? false;

  // Get URL context for active link detection
  const { isUrlActive } = useUrlContext();

  // Update active section based on current URL
  useEffect(() => {
    const findActiveSection = () => {
      for (let i = 0; i < navigationSections.length; i++) {
        const section = navigationSections[i];
        if (!section) continue;

        if (hasActiveDescendantLink(section, isUrlActive, siteName, locale)) {
          return i;
        }
      }
      return -1;
    };

    const activeIndex = findActiveSection();
    setActiveSectionIndex(activeIndex >= 0 ? activeIndex : null);
  }, [navigationSections, isUrlActive, router.pathname, siteName]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setExpandedMobileMenus([]);
    setIsMobileLanguageOpen(false);
  }, [router.asPath]);

  // Sync mobile menu state with context
  useEffect(() => {
    if (mobileMenuContext) {
      mobileMenuContext.setIsMobileMenuOpen(isMobileMenuOpen);
      // Reset showMobileSearch when menu closes
      if (!isMobileMenuOpen) {
        mobileMenuContext.setShowMobileSearch(false);
      }
    }
  }, [isMobileMenuOpen, mobileMenuContext]);

  // Sticky header on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Expose current header offset (fixed header + spacer) as a CSS variable for viewport-fit sections.
  useEffect(() => {
    const applyHeaderOffset = () => {
      const isDesktop = window.innerWidth >= 1024;
      const headerOffset = isDesktop ? desktopHeaderOffset : 52;
      document.documentElement.style.setProperty('--header-offset', `${headerOffset}px`);
    };

    applyHeaderOffset();
    window.addEventListener('resize', applyHeaderOffset);
    return () => window.removeEventListener('resize', applyHeaderOffset);
  }, [desktopHeaderOffset]);

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setActiveMenuIndex(null);
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const navBarEl = navBarRef.current;

      if (
        megaMenuRef.current &&
        !megaMenuRef.current.contains(target) &&
        (!navBarEl || !navBarEl.contains(target))
      ) {
        setActiveMenuIndex(null);
      }
      if (languageRef.current && !languageRef.current.contains(target)) {
        setIsLanguageOpen(false);
      }
    };

    if (activeMenuIndex !== null || isLanguageOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeMenuIndex, isLanguageOpen]);

  const toggleMobileSubmenu = (index: number) => {
    setExpandedMobileMenus((prev) => (prev[0] === index ? [] : [index]));
  };

  const sectionHasRenderableLinks = (section: HeaderNavigationNode | undefined): boolean => {
    if (!section) return false;
    const primaryItems = getChildNodes(section);
    return primaryItems.some((primaryItem) => {
      const primaryTitle = getNodeTitle(primaryItem);
      const primaryLink = patchLink(getNodeLink(primaryItem), siteName);
      const primaryHref = primaryLink?.value?.href;
      const primaryText = primaryLink?.value?.text || primaryTitle;

      if (primaryHref && primaryText) return true;

      const childLinks = getChildNodes(primaryItem);
      return childLinks.some((childLink) => {
        const itemTitle = getNodeTitle(childLink);
        const itemLink = patchLink(getNodeLink(childLink), siteName, locale);

        if (!itemLink?.value?.href) return false;
        const displayText = itemLink.value.text || itemTitle;
        return Boolean(displayText);
      });
    });
  };

  const renderMegaMenu = (index: number) => {
    const section = navigationSections[index];
    const primaryItems = getChildNodes(section);

    if (!section || primaryItems.length === 0) return null;

    if (!sectionHasRenderableLinks(section)) return null;

    const sectionTitle = getNodeTitle(section);

    return (
      <div
        ref={megaMenuRef}
        className="fixed top-[108px] right-0 left-0 z-[55] mx-auto w-full max-w-[1360px] border-t-[1px] border-[var(--color-brand-primary)]"
        style={{ animation: 'slideDown 0.15s ease-out' }}
        onMouseEnter={() => setActiveMenuIndex(index)}
        onMouseLeave={(event: ReactMouseEvent<HTMLDivElement>) => {
          const nextTarget = event.relatedTarget;
          const navBarEl = navBarRef.current;
          // Don't close if moving to navbar
          if (navBarEl && nextTarget instanceof Node && navBarEl.contains(nextTarget)) {
            return;
          }
          setActiveMenuIndex(null);
        }}
      >
        <div className="mx-auto max-w-[1360px] border-b-[6px] border-[var(--color-accent-primary)] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.1)] md:min-h-[300px]">
          <div style={{ padding: '44px 32px 64px 50px' }}>
            <div className="flex max-w-4/5 flex-col gap-6">
              {primaryItems.map((primaryItem, categoryIndex) => {
                const categoryTitle = getNodeTitle(primaryItem);
                const categoryLink = patchLink(getNodeLink(primaryItem), siteName, locale);
                const childLinks = getChildNodes(primaryItem);

                return (
                  <div key={categoryIndex} className="flex flex-col gap-3">
                    {/* Category Header */}
                    {categoryTitle && (
                      <div className="mb-2">
                        {categoryLink?.value?.href ? (
                          <Link
                            field={categoryLink}
                            className="hover:text-brand-text-red inline-flex items-center gap-1.5 text-base font-semibold tracking-wide no-underline transition-colors duration-200"
                          >
                            {categoryTitle}
                            <ChevronRight size={16} strokeWidth={2.5} />
                          </Link>
                        ) : (
                          <h4 className="inline-flex items-center gap-1.5 text-base font-bold tracking-wide">
                            {categoryTitle}
                            <ChevronRight size={16} strokeWidth={2.5} />
                          </h4>
                        )}
                      </div>
                    )}

                    {/* Category Items in Grid */}
                    {childLinks.length > 0 && (
                      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-x-5">
                        {childLinks.map((childLink, childIndex) => {
                          const itemTitle = getNodeTitle(childLink);
                          const itemLink = patchLink(getNodeLink(childLink), siteName, locale);

                          if (!itemTitle && !itemLink?.value?.text) return null;

                          const displayText = itemLink?.value?.text || itemTitle;

                          return itemLink?.value?.href ? (
                            <Link
                              key={childIndex}
                              field={itemLink}
                              className={cn(
                                'hover:text-brand-text-red block text-[16px] leading-[16px] font-normal break-words no-underline antialiased transition-colors duration-200',
                                isUrlActive(itemLink.value.href)
                                  ? 'text-brand-text-red'
                                  : 'text-black',
                              )}
                            >
                              {displayText}
                            </Link>
                          ) : (
                            <span key={childIndex} className="leading-[16px]">
                              {displayText}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

      {/* Overlay when mega menu is open */}
      {activeMenuIndex !== null && (
        <div
          className="fixed top-[108px] right-0 bottom-0 left-0 z-40 bg-black/50"
          onClick={() => setActiveMenuIndex(null)}
          aria-hidden="true"
        />
      )}

      <header
        className={cn(
          'fixed top-0 z-60 w-full bg-white transition-all duration-300',
          !isCwsSite && 'shadow-[0px_0_10px_0_rgba(0,0,0,0.16)]',
          !isCwsSite && isSticky && 'shadow-[0_4px_12px_rgba(0,0,0,0.08)]',
        )}
        role="banner"
        data-component="Header"
      >
        {/* Top bar with logo and utility links */}
        <div className="">
          <div className="-md:px-6 mx-auto max-w-[1360px] px-2 shadow-[0_1px_12px_rgba(0,0,0,0.10)] sm:px-[10px] md:px-[10px] lg:shadow-[0px]">
            <div className="flex h-[55px] items-center justify-between md:h-[50px]">
              {/* Header logo placeholder (renders HeaderLogo component) */}
              {headerLogoRendering && !isPageEditing ? (
                <HeaderLogo
                  rendering={headerLogoRendering}
                  params={(headerLogoRendering as any)?.params ?? {}}
                  fields={
                    (headerLogoComponentProps?.fields as any) ??
                    (headerLogoRendering as any)?.fields
                  }
                />
              ) : showHealthcareLogoFallback ? (
                <a
                  href={`/${locale}/healthcare`}
                  aria-label="CWS Healthcare"
                  className="inline-flex items-center no-underline"
                >
                  <div className="inline-flex h-10 overflow-hidden md:h-11">
                    <div className="flex items-center justify-center bg-[#eb0045] px-5 md:px-6">
                      <span className="text-[26px] font-bold leading-none tracking-tight text-black italic md:text-[28px]">
                        CWS
                      </span>
                    </div>
                    <div className="flex items-center justify-center bg-[#acd800] px-4 md:px-5">
                      <span className="text-[12px] font-bold leading-none tracking-[0.28em] text-black uppercase md:text-[13px]">
                        Healthcare
                      </span>
                    </div>
                  </div>
                </a>
              ) : (
                <Placeholder
                  name={headerLogoPlaceholderName}
                  rendering={props.rendering}
                />
              )}

              {/* Right side utility links */}
              {hasTopHeaderPlaceholder && (
                <div className="hidden lg:flex lg:items-center">
                  <Placeholder
                    name={topHeaderPlaceholderName}
                    rendering={props.rendering}
                  />
                </div>
              )}

              {/* Mobile menu and search buttons */}
              {showMobileHeaderControls && (
                <div className="flex items-center gap-0 lg:hidden">
                  {showMobileSearchButton && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(true);
                      if (mobileMenuContext) {
                        mobileMenuContext.setShowMobileSearch(true);
                      }
                    }}
                    aria-label={openSearchAriaLabel}
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95"
                  >
                    <img src="/assets/icons/header-search.svg" alt="Search" className="h-6 w-6" />
                  </button>
                  )}

                  {showMobileMenuToggle && (
                    <span
                      role="button"
                      className="mr-[2px] flex h-8 w-5 cursor-pointer items-center justify-center pt-[1px] transition-all duration-200 ease-in-out"
                      onClick={() => {
                        setIsMobileMenuOpen(!isMobileMenuOpen);
                        if (mobileMenuContext && !isMobileMenuOpen) {
                          mobileMenuContext.setShowMobileSearch(false);
                        }
                      }}
                      aria-label={isMobileMenuOpen ? closeMenuAriaLabel : openMenuAriaLabel}
                      aria-expanded={isMobileMenuOpen}
                    >
                      {isMobileMenuOpen ? (
                        <div className="relative h-6 w-6">
                          <span className="absolute top-1/2 left-0 h-[2px] w-full origin-center -translate-y-1/2 rotate-45 bg-black transition-transform" />
                          <span className="absolute top-1/2 left-0 h-[2px] w-full origin-center -translate-y-1/2 -rotate-45 bg-black transition-transform" />
                        </div>
                      ) : (
                        <div className="relative h-[26px] w-6">
                          <span className="absolute top-[6px] left-0 h-[2px] w-full bg-black transition-all" />
                          <span className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 bg-black transition-all" />
                          <span className="absolute bottom-[6px] left-0 h-[2px] w-full bg-black transition-all" />
                        </div>
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main navigation bar */}
        {showMainNavigationBar && (
          <div
            className="hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] lg:block lg:shadow-[0px_0px_rgba(0,0,0,0)]"
            ref={navBarRef}
            onMouseLeave={(event: ReactMouseEvent<HTMLDivElement>) => {
              const nextTarget = event.relatedTarget;
              if (
                megaMenuRef.current &&
                nextTarget instanceof Node &&
                megaMenuRef.current.contains(nextTarget)
              ) {
                return;
              }
              setActiveMenuIndex(null);
            }}
          >
            <div className="mx-auto px-4 md:px-[10px] md:pt-[11px] md:pb-2 lg:max-w-[1360px]">
              <div className="flex h-10 items-center justify-between">
                {/* Desktop Navigation - Hidden when search bar is open */}
                <nav
                  className={cn('h-full', isSearchBarOpen ? 'hidden lg:hidden' : 'lg:flex')}
                  aria-label="Main navigation"
                >
                  {navigationSections.map((section, index) => {
                    const menuTitle = getNodeTitle(section);
                    const sectionLink = patchLink(getNodeLink(section), siteName, locale);
                    const hasMenu = sectionHasRenderableLinks(section);

                    if (!menuTitle) return null;

                    const isHoverActive = activeMenuIndex === index;
                    const isRouteActive = activeSectionIndex === index;

                    const triggerClasses = cn(
                      'relative inline-flex items-center gap-1 h-full px-0   font-semibold no-underline transition-all duration-200 cursor-pointer pl-0 mr-[40px]',
                      'after:absolute after:bottom-[-13px] after:h-[2px] after:origin-left after:transition-all after:duration-300',
                      'after:right-0 after:left-0',
                      isHoverActive
                        ? 'text-brand-text-red after:scale-x-100 after:bg-[#eb0045]'
                        : isRouteActive
                          ? 'text-brand-text-red after:scale-x-50 after:bg-[#eb0045]'
                          : 'after:scale-x-0 after:bg-[#eb0045] hover:text-brand-text-red hover:after:scale-x-100',
                    );

                    const triggerContent = <>{menuTitle}</>;

                    return (
                      <div
                        key={menuTitle + index}
                        className="relative flex h-full items-center md:pb-1"
                        onMouseEnter={() => setActiveMenuIndex(hasMenu ? index : null)}
                      >
                        {sectionLink?.value?.href ? (
                          <Link field={sectionLink} className={triggerClasses}>
                            {triggerContent}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className={triggerClasses}
                            onClick={() =>
                              setActiveMenuIndex((prev) => (prev === index ? null : index))
                            }
                            aria-expanded={activeMenuIndex === index}
                          >
                            {triggerContent}
                          </button>
                        )}

                        {activeMenuIndex === index && hasMenu && renderMegaMenu(index)}
                      </div>
                    );
                  })}
                </nav>

                {/* Search */}
                <div
                  className={cn(
                    'ml-auto hidden items-center transition-all duration-200 ease-in-out lg:flex',
                    !isCwsSite && 'gap-4',
                    isSearchBarOpen ? 'w-full' : 'w-auto',
                  )}
                >
                  {!isSearchPageCurrent && (
                    <Placeholder
                      name={headerSearchPlaceholderName}
                      rendering={props.rendering}
                    />
                  )}
                  {!isCwsSite && (
                    <button
                      type="button"
                      onClick={() => openContactFormModal(contactFormId)}
                      data-tracking="header-contact"
                      className=" mb-1 inline-flex  items-center justify-center rounded-full bg-[#eb0045] px-4 py-0 text-[14px] leading-[32px] font-bold tracking-wide text-white no-underline shadow-sm transition-all duration-200  hover:text-black  md:px-8"
                    >
                      <span className="text-[14px]">{contactButtonText}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 top-[49px] z-40 mt-[0.5px] flex flex-col bg-white shadow-[0_4px_12px_rgba(0,0,0,0.25)] lg:hidden"
            style={{ animation: 'fadeIn 0.3s ease-in-out' }}
          >
            {mobileMenuContext?.showMobileSearch ? (
              <div className="flex w-full flex-1 justify-center overflow-y-auto px-2">
                {!isSearchPageCurrent && (
                  <div className="w-full">
                    <Placeholder
                      name={headerSearchPlaceholderName}
                      rendering={props.rendering}
                    />
                  </div>
                )}
              </div>
            ) : (
              <nav className="flex-1 overflow-y-auto px-2" aria-label="Mobile navigation">
                {isMobileLanguageOpen ? (
                  <div className="space-y-6">
                    <div className="">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          className="flex h-10 w-10 cursor-pointer items-center justify-center"
                          onClick={() => setIsMobileLanguageOpen(false)}
                          aria-label={backButtonText}
                        >
                          <img
                            src="/assets/icons/arrow-right-black.svg"
                            alt=""
                            className="h-5 w-5 rotate-180"
                          />
                        </button>
                        <h4 className="text-medium font-medium">{backButtonText}</h4>
                        <span className="h-10 w-10" aria-hidden="true" />
                      </div>
                      <div className="h-px w-full bg-[#ebebeb]" />
                    </div>

                    <div className="space-y-0">
                      {languages.map((lang) => {
                        const langName = lang.name?.value || '';
                        const langCode = lang.code?.value || '';
                        const isSelected = lang.selected?.value || false;
                        const flagSvgUrl = lang.flagSvg?.value;

                        return (
                          <button
                            key={langCode}
                            type="button"
                            className="flex w-full cursor-pointer items-center justify-between border-b border-[#000000] py-4 text-left"
                            onClick={() => {
                              setIsMobileLanguageOpen(false);
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-4 w-6 bg-gray-200">
                                {flagSvgUrl && !failedFlagImages.has(flagSvgUrl) ? (
                                  <img
                                    src={flagSvgUrl}
                                    alt={langName}
                                    className="h-full w-full object-cover"
                                    onError={() => {
                                      if (flagSvgUrl) {
                                        setFailedFlagImages((prev) => new Set(prev).add(flagSvgUrl));
                                      }
                                    }}
                                  />
                                ) : lang.flagColor?.value ? (
                                  <div
                                    className="h-full w-full"
                                    style={{ backgroundColor: lang.flagColor.value }}
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gray-300" />
                                )}
                              </div>
                              <span className={` ${isSelected ? 'font-bold' : 'font-normal'}`}>
                                {langName}
                              </span>
                            </div>
                            {isSelected && <Check size={20} className=" " />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : expandedMobileMenus.length === 0 ? (
                  <>
                    {navigationSections.map((section, index) => {
                      const menuTitle = getNodeTitle(section);
                      const destination = patchLink(getNodeLink(section), siteName, locale);
                      const hasMenu = getChildNodes(section).length > 0;
                      const isRouteActive = activeSectionIndex === index;

                      if (!menuTitle) return null;

                      return (
                        <div key={menuTitle + index} className="">
                          <div className="py-4">
                            {hasMenu ? (
                              <button
                                type="button"
                                className={cn(
                                  'group relative mt-[2px] flex w-full cursor-pointer items-center justify-between text-[14px] font-semibold md:mt-0',
                                  'after:absolute after:left-0 after:bottom-[-12px] after:h-[2px] after:w-0 after:bg-[#eb0045] after:transition-all after:duration-300 hover:after:w-full',
                                  isRouteActive && 'text-brand-text-red',
                                )}
                                onClick={() => toggleMobileSubmenu(index)}
                                aria-expanded={expandedMobileMenus.includes(index)}
                              >
                                <span
                                  className={cn(
                                    'relative inline-block',
                                    isRouteActive && 'before:absolute before:left-0 before:bottom-[-12px] before:h-[2px] before:w-1/2 before:min-w-[100px] before:bg-[#eb0045]',
                                  )}
                                >
                                  {menuTitle}
                                </span>
                                <img
                                  src="/assets/icons/arrow-right-black.svg"
                                  alt=""
                                  className="h-5 w-5"
                                />
                              </button>
                            ) : destination?.value?.href ? (
                              <Link
                                field={destination}
                                className={cn(
                                  'group relative block font-bold no-underline',
                                  'after:absolute after:left-0 after:bottom-[-12px] after:h-[2px] after:w-0 after:bg-[#eb0045] after:transition-all after:duration-300 hover:after:w-full',
                                  isRouteActive && 'text-brand-text-red',
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <span
                                  className={cn(
                                    'relative inline-block',
                                    isRouteActive && 'before:absolute before:left-0 before:bottom-[-12px] before:h-[2px] before:w-1/2 before:min-w-[100px] before:bg-[#eb0045]',
                                  )}
                                >
                                  {menuTitle}
                                </span>
                              </Link>
                            ) : (
                              <span
                                className={cn(
                                  'group relative mt-[2px] block font-bold',
                                  'after:absolute after:left-0 after:bottom-[-12px] after:h-[2px] after:w-0 after:bg-[#eb0045] after:transition-all after:duration-300 hover:after:w-full',
                                  isRouteActive && 'text-brand-text-red',
                                )}
                              >
                                <span
                                  className={cn(
                                    'relative inline-block',
                                    isRouteActive && 'before:absolute before:left-0 before:bottom-[-12px] before:h-[2px] before:w-1/2 before:min-w-[100px] before:bg-[#eb0045]',
                                  )}
                                >
                                  {menuTitle}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {expandedMobileMenus.map((menuIndex) => {
                      const section = navigationSections[menuIndex];
                      const menuTitle = getNodeTitle(section);
                      const destination = patchLink(getNodeLink(section), siteName, locale);
                      const primaryItems = getChildNodes(section);

                      if (!section) return null;

                      return (
                        <div key={`mobile-section-${menuIndex}`} className="space-y-6">
                          <div className="mb-2 pb-1">
                            <div className="border-brand-text-red flex items-center justify-between border-t pt-4 pb-3">
                              <button
                                type="button"
                                className="flex h-10 w-14 cursor-pointer items-center"
                                onClick={() => setExpandedMobileMenus([])}
                                aria-label={backToNavigationAriaLabel}
                              >
                                <img
                                  src="/assets/icons/arrow-right-black.svg"
                                  alt=""
                                  className="h-5 w-5 rotate-180"
                                />
                              </button>
                              <span className="text-[14px] font-medium">{menuTitle}</span>
                              <span className="h-10 w-10" aria-hidden="true" />
                            </div>
                            <div className="h-px w-full bg-[#ebebeb]" />
                          </div>

                          <div className="space-y-6">
                            {menuTitle && destination?.value?.href && (
                              <Link
                                field={destination}
                                className={cn(
                                  'flex items-center justify-between border-b border-gray-200 pb-4 text-[16px] font-semibold no-underline hover:text-[#eb0045]',
                                  isUrlActive(destination.value.href) && 'text-brand-text-red',
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <span>{menuTitle}</span>
                                <img
                                  src="/assets/icons/arrow-right-black.svg"
                                  alt=""
                                  className="h-[18px] w-[18px]"
                                />
                              </Link>
                            )}

                            {primaryItems.map((primaryItem, primaryIndex) => {
                              const primaryTitle = getNodeTitle(primaryItem);
                              const primaryLink = patchLink(getNodeLink(primaryItem), siteName, locale);
                              const childLinks = getChildNodes(primaryItem);

                              if (!primaryTitle && !childLinks.length) {
                                return null;
                              }

                              return (
                                <div
                                  key={`primary-${primaryIndex}`}
                                  className="space-y-3 border-b border-gray-200 pb-4"
                                >
                                  {primaryLink?.value?.href && (
                                    <Link
                                      field={primaryLink}
                                      className={`flex items-center gap-1 font-bold font-semibold no-underline hover:text-[#eb0045] ${isUrlActive(primaryLink.value.href) ? 'text-[#eb0045]' : ''
                                        }`}
                                      onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                      <span>{primaryLink.value?.text || primaryTitle}</span>
                                      <ChevronRight size={16} />
                                    </Link>
                                  )}
                                  {!primaryLink?.value?.href && primaryTitle && (
                                    <span className="block font-semibold">{primaryTitle}</span>
                                  )}

                                  <div className="flex flex-col">
                                    {childLinks.map((childLink, childIndex) => {
                                      const nestedLink = patchLink(
                                        getNodeLink(childLink),
                                        siteName,
                                        locale,
                                      );
                                      if (!nestedLink?.value?.href) return null;

                                      const isActive = isUrlActive(nestedLink.value.href);

                                      return (
                                        <Link
                                          key={`child-${primaryIndex}-${childIndex}`}
                                          field={nestedLink}
                                          className={`block py-3 no-underline hover:text-[#eb0045] ${isActive ? 'text-[#eb0045]' : ''
                                            }`}
                                          onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                          {nestedLink.value?.text ||
                                            getNodeTitle(childLink) ||
                                            nestedLink.value?.href}
                                        </Link>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                {/* Mobile utility links - only show when no submenu is open */}
                {!isMobileLanguageOpen && expandedMobileMenus.length === 0 && (
                  <>
                    <div className="mt-4 mb-2 space-y-1 border-t border-gray-200 pt-4 lg:mt-0">
                      <Placeholder
                        name={topHeaderPlaceholderName}
                        rendering={props.rendering}
                      />
                    </div>
                  </>
                )}
              </nav>
            )}

            {!isCwsSite && !isMobileLanguageOpen && (
              <div className="border-t border-gray-200 bg-white px-2 py-[14px] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:p-6">
                <button
                  type="button"
                  onClick={() => {
                    openContactFormModal(contactFormId);
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-md flex w-full items-center justify-center gap-3 rounded-full bg-[#eb0045] px-4 py-2 font-medium text-white no-underline shadow-lg"
                >
                  <span className="py-1 text-[14px] leading-4 font-bold tracking-wide">
                    {contactButtonText}
                  </span>
                </button>
              </div>
            )}

          </div>
        )}
      </header>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div
        className={cn(
          'h-[52px]',
          showMainNavigationBar ? 'lg:h-[106px]' : 'lg:h-[52px]',
        )}
        aria-hidden="true"
      />
    </>
  );
};

export const Default: React.FC<HeaderProps> = (props) => {
  return (
    <MobileMenuProvider>
      <SearchBarVisibilityProvider>
        <HeaderContent {...props} />
      </SearchBarVisibilityProvider>
    </MobileMenuProvider>
  );
};

export default Default;

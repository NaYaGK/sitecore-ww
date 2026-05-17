'use client';

import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Text as SitecoreText,
  Image,
  useSitecore,
  type ImageField,
} from '@sitecore-content-sdk/nextjs';
import { NoDataFallback } from '@/utils/NoDataFallback';
import type { ComponentProps } from '@/lib/component-props';
import { cn } from '@/lib/utils';
import { SUPPORTED_LOCALES } from '@/config/locales';
import { extractProductIdFromPath } from '@/lib/product-path';
import { useRouter } from 'next/router';
import { openContactFormModal } from '@/ui/Modal/contact_form_modal';
import {
  fetchLanguageDisplayNames,
  createLanguageDisplayNameMap,
  createLanguagePathMap,
  normalizeLocale,
  inferLocaleFromUrl,
  resolveDisplayName,
  buildLocalizedUrlForCurrentItem,
  buildUrlFromItemPath,
  stripLocales,
  ensureLocaleFirst,
  ensureLanguageSwitcherHostSegment,
} from '@/utils/language-url-helper';
import { patchHref } from '@/lib/patch-link';
import { useSiteName } from '@/hooks/useSiteName';

// SiteLanguage item
export interface SiteLanguageItem {
  id?: string;
  name?: string;
  displayName?: string;
  url?: string;
  icon?: string;
  fields?: {
    ['Language Name Field']?: { value?: string };
    ['Language Code Field']?: { value?: string };
    ['Second Language Code Field']?: { value?: string };
    Url?: { value?: { href?: string; text?: string } };
    ['Second Url']?: { value?: { href?: string; text?: string } };
    Icon?: { value?: { src?: string; alt?: string } };
  };
}

// Component props
interface LanguageSelectorProps extends ComponentProps {
  fields?: {
    ['Site Languages']?: SiteLanguageItem[];
  };
}

// Helper functions
export function getString(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value.value && typeof value.value === 'string') return value.value;
  return '';
}

export function getHref(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value.value?.href) return value.value.href;
  return '';
}

export function getLinkText(value: any): string {
  if (!value) return '';
  if (value.value?.text) return value.value.text;
  return '';
}

export function getImageSrc(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value.src) return value.src;
  if (value.value?.src) return value.value.src;
  return '';
}

const localeMatchesCurrent = (currentLocale: string, candidateLocale?: string): boolean => {
  const normalizedCurrent = normalizeLocale(currentLocale);
  const normalizedCandidate = normalizeLocale(candidateLocale);

  if (!normalizedCurrent || !normalizedCandidate) return false;
  if (normalizedCurrent === normalizedCandidate) return true;
  if (normalizedCandidate.length === 2 && normalizedCurrent.startsWith(`${normalizedCandidate}-`)) {
    return true;
  }
  if (normalizedCurrent.length === 2 && normalizedCandidate.startsWith(`${normalizedCurrent}-`)) {
    return true;
  }

  return false;
};

const isJobsPagePath = (path: string): boolean => {
  const strippedPath = stripLocales(path);
  const segments = strippedPath.replace(/^\//, '').split('/').filter(Boolean);
  return segments.some((segment) => segment.toLowerCase() === 'jobs');
};

const isOtherCountriesItem = (label: string): boolean => {
  const normalizedLabel = label.trim().toLowerCase().replace(/\s+/g, ' ');
  return normalizedLabel === 'other countries';
};

const getExplicitOtherCountriesUrl = (rawUrl: string, label: string): string | null => {
  if (!rawUrl || !isOtherCountriesItem(label)) return null;

  const forceEnglishLocale = (url: string): string => {
    const localePattern = /^\/([a-z]{2}(?:-[a-z]{2})?)(?=\/|$)/i;

    if (/^https?:\/\//i.test(url)) {
      try {
        const parsed = new URL(url);
        const pathWithLocale = localePattern.test(parsed.pathname)
          ? parsed.pathname.replace(localePattern, '/en')
          : `/en${parsed.pathname.startsWith('/') ? parsed.pathname : `/${parsed.pathname}`}`;
        parsed.pathname = pathWithLocale.replace(/\/+/g, '/');
        return parsed.toString();
      } catch {
        return url;
      }
    }

    const normalized = url.startsWith('/') ? url : `/${url}`;
    return localePattern.test(normalized)
      ? normalized.replace(localePattern, '/en')
      : `/en${normalized}`.replace(/\/+/g, '/');
  };

  return forceEnglishLocale(rawUrl);
};

/** Check if a language version exists for the given locale based on fetched display names.
 * Returns true if the API hasn't responded yet (map is empty) to avoid false negatives. */
const hasLanguageVersion = (locale: string, map: Map<string, string>): boolean => {
  if (map.size === 0) return true; // API data not yet loaded, assume version exists
  const normalized = normalizeLocale(locale);
  if (!normalized) return true;
  return map.has(normalized);
};

/** Build the site-specific home URL for a locale (mirrors HeaderLogo pattern).
 * e.g. hr-HR on workwear → /hr-HR/radna-odjeca */
const getLocaleHomeUrl = (locale: string, siteName: string): string => {
  const canonical =
    SUPPORTED_LOCALES.find((l) => l.toLowerCase() === normalizeLocale(locale)) || locale;
  if (siteName === 'cws') {
    return `/${canonical}/`;
  }
  return (
    patchHref(
      `/${canonical}/${siteName === 'healthcare' ? 'healthcare' : 'workwear'}`,
      siteName,
      undefined,
      locale,
    ) ?? `/${canonical}`
  );
};


export const Default: React.FC<LanguageSelectorProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const router = useRouter();
  const isEditing = page.mode.isEditing;
  const siteName = useSiteName();
  const isCWS = siteName === 'cws';

  // Extract items from Site Languages field
  const items: SiteLanguageItem[] = fields?.['Site Languages'] || [];

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);
  const [languageDisplayNames, setLanguageDisplayNames] = useState<Map<string, string>>(new Map());
  const [languagePaths, setLanguagePaths] = useState<Map<string, string>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine current selection from location path (use router.asPath for SSR consistency, avoid window to prevent hydration mismatch)
  const currentPath = ((router.asPath ?? '').split('?')[0] ?? '').split('#')[0] ?? '';
  const currentLocale = normalizeLocale(router.locale || inferLocaleFromUrl(currentPath) || '');
  const isJobsPage = useMemo(() => isJobsPagePath(currentPath), [currentPath]);

  // Product detail page: path-based detection (last segment = product slug)
  const productRouteMatch = useMemo(() => {
    if (!currentPath) return null;
    const segments = currentPath.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    if (!lastSegment) return null;
    const variantMatch = lastSegment.match(/^(.+?)(-\d+)$/);
    const currentSlug = variantMatch ? variantMatch[1] : lastSegment;
    const variantSuffix = variantMatch ? variantMatch[2] : '';
    return extractProductIdFromPath(currentPath)
      ? { currentSlug, variantSuffix }
      : null;
  }, [currentPath]);

  const productLocalizedSlugs: Record<string, string> | null = useMemo(() => {
    if (!productRouteMatch) return null;
    try {
      const raw = (page?.layout?.sitecore?.route?.fields as any)?.ProductLocalizedSlugs?.value;
      return raw && typeof raw === 'string' ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [productRouteMatch, page?.layout?.sitecore?.route?.fields]);

  const itemPath = useMemo(() => stripLocales(currentPath), [currentPath]);
  const pageUrl = itemPath.replace(/^\//, '');

  const selectedIndex = useMemo(() => {
    if (!items?.length) return 0;

    const pathPart = ((router.asPath ?? '').split('?')[0] ?? '').split('#')[0] ?? '';
    const path = (pathPart.toLowerCase() || '').replace(/\/$/, '') || '/';
    const activeLocale = normalizeLocale(router.locale || inferLocaleFromUrl(pathPart) || '');

    // 1. Try to match by active locale (router locale or locale inferred from URL)
    if (activeLocale) {
      const localeMatch = items.findIndex((item) => {
        const f = item.fields ?? {};
        const code1 = getString(f['Language Code Field']);
        const code2 = getString(f['Second Language Code Field']);
        const urlLocale1 = inferLocaleFromUrl(getHref(f.Url)) || undefined;
        const urlLocale2 = inferLocaleFromUrl(getHref(f['Second Url'])) || undefined;

        return (
          localeMatchesCurrent(activeLocale, code1) ||
          localeMatchesCurrent(activeLocale, code2) ||
          localeMatchesCurrent(activeLocale, urlLocale1) ||
          localeMatchesCurrent(activeLocale, urlLocale2)
        );
      });
      if (localeMatch >= 0) return localeMatch;
    }

    // 2. Try to find match based on current path (case-insensitive)
    const matchIndex = items.findIndex((item) => {
      const f = item.fields ?? {};
      const rawUrl1 = getHref(f.Url);
      const rawUrl2 = getHref(f['Second Url']);
      const url1 = (patchHref(rawUrl1, siteName) ?? rawUrl1).toLowerCase().replace(/\/$/, '');
      const url2 = (patchHref(rawUrl2, siteName) ?? rawUrl2).toLowerCase().replace(/\/$/, '');

      if (url1 && url1 !== '' && (path === url1 || path.startsWith(url1 + '/'))) return true;
      if (url2 && url2 !== '' && (path === url2 || path.startsWith(url2 + '/'))) return true;
      return false;
    });

    if (matchIndex >= 0) return matchIndex;

    // 3. Default to Germany (de-DE) if no match
    const germanyIndex = items.findIndex((item) => {
      const f = item.fields ?? {};
      const code1 = getString(f['Language Code Field']).toLowerCase();
      const code2 = getString(f['Second Language Code Field']).toLowerCase();
      const name = (
        getString(f['Language Name Field']) ||
        item.displayName ||
        item.name ||
        ''
      ).toLowerCase();
      return code1 === 'de-de' || code2 === 'de-de' || name.includes('germany');
    });

    return germanyIndex >= 0 ? germanyIndex : 0;
  }, [items, router.locale, router.asPath, siteName]);

  // Fetch language-specific display names and paths (for correct language-switcher URLs)
  useEffect(() => {
    const itemId = page?.layout?.sitecore?.route?.itemId;

    if (itemId) {
      fetchLanguageDisplayNames(itemId)
        .then((names) => {
          setLanguageDisplayNames(createLanguageDisplayNameMap(names));
          setLanguagePaths(createLanguagePathMap(names));
        })
        .catch(() => { });
    }
  }, [page?.layout?.sitecore?.route?.itemId]);

  // Close on ESC / outside click
  useEffect(() => {
    setIsMounted(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  if ((!items || items.length === 0) && !isEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'LanguageSelector'} />;
  }

  // Selected language
  const selected = items[selectedIndex];

  const primaryCode = getString(selected?.fields?.['Language Code Field']);
  const secondaryCode = getString(selected?.fields?.['Second Language Code Field']);
  const countryCode = (primaryCode || secondaryCode || '').split('-').pop()?.toLowerCase();
  const derivedFlagUrl = countryCode
    ? `https://www.cws.com/themes/custom/cwsdesign/assets/images/flag-${countryCode}.svg`
    : '';

  const selectedIconSrc =
    getImageSrc(selected?.fields?.Icon?.value) ||
    getImageSrc(selected?.fields?.Icon) ||
    selected?.icon ||
    derivedFlagUrl;

  const selectedName =
    getString(selected?.fields?.['Language Name Field']) ||
    selected?.displayName ||
    selected?.name ||
    'Language';

  const [displayIcon, setDisplayIcon] = useState(selectedIconSrc);

  useEffect(() => {
    if (isMounted) {
      setDisplayIcon(selectedIconSrc);
    }
  }, [selectedIconSrc, isMounted]);

  if (!isMounted) return null;

  return (
    <>
      {/* Overlay when language selector is open */}
      {isOpen && (
        <div
          className={cn(
            'fixed right-0 bottom-0 left-0 z-40 bg-black/50',
            isCWS ? 'top-[55px]' : 'top-[105px]',
          )}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className="relative lg:ml-6 mt-4 lg:mt-0"
        ref={containerRef}
        data-component="LanguageSelector"
      >
        <button
          type="button"
          className="hover:text-brand-text-red flex items-center gap-2 transition-colors duration-200"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((v) => !v)}
        >
          <img
            key={displayIcon}
            src={displayIcon}
            alt={selectedName}
            className="h-5 md:h-3 w-5 cursor-pointer object-cover"
          />
          <span className="text-[14px] lg:hidden">{selectedName}</span>
        </button>

        {isOpen && (
          <div
            className={cn(
              'fixed left-0 right-0 bottom-0 z-40 top-[60px] bg-white lg:absolute  lg:right-0 lg:left-auto lg:bottom-auto lg:w-max lg:min-w-[300px] lg:max-w-[650px] lg:bg-[#ebebeb] lg:shadow-xl',
              isCWS ? 'lg:top-[35px]' : 'lg:top-[85px]',
            )}
            style={{ animation: 'slideDown 0.2s ease-out' }}
            role="dialog"
            aria-label="Select language"
          >
            {/* Mobile-only header with back button */}
            <div className="flex items-center border-b border-gray-200  px-2 lg:px-4 py-3 lg:hidden">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center"
                aria-label="Close language selector"
              >
                <img
                  src="/assets/icons/arrow-right-black.svg"
                  alt=""
                  className="h-5 w-5 rotate-180"
                />
              </button>
              <div className="flex-1 text-center">
                <span className="text-base text-[14px]">Back</span>
              </div>
            </div>

            <div className="h-full overflow-y-auto px-[8px] lg:px-[30px] lg:pt-5 pb-30 lg:pb-10 text-base lg:h-auto lg:overflow-visible">
              <div className={items.length <= 8 ? "flex flex-col" : "grid grid-cols-1 gap-y-0 lg:grid-cols-2 lg:gap-x-16"}>
                {items.length <= 8 ? (
                  // Single column layout for 8 or fewer languages
                  items.map((item, idx) =>
                    renderLanguageItem(
                      item,
                      idx,
                      selected,
                      currentPath,
                      currentLocale,
                      isJobsPage,
                      languageDisplayNames,
                      languagePaths,
                      siteName,
                      productLocalizedSlugs,
                      productRouteMatch?.currentSlug ?? '',
                      productRouteMatch?.variantSuffix ?? '',
                    ),
                  )
                ) : (
                  // Two-column layout for more than 8 languages
                  [0, 1].map((col) => {
                    const colItems = items.filter((_, idx) => idx % 2 === col);
                    return (
                      <div key={`col-${col}`} className="flex flex-col">
                        {colItems.map((item, idx) =>
                          renderLanguageItem(
                            item,
                            idx,
                            selected,
                            currentPath,
                            currentLocale,
                            isJobsPage,
                            languageDisplayNames,
                            languagePaths,
                            siteName,
                            productLocalizedSlugs,
                            productRouteMatch?.currentSlug ?? '',
                            productRouteMatch?.variantSuffix ?? '',
                          ),
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Mobile-only Contact button at bottom */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-2 py-[14px] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:hidden">
              <button
                type="button"
                onClick={() => {
                  openContactFormModal();
                  setIsOpen(false);
                }}
                className="text-md flex w-full items-center justify-center gap-3 rounded-full bg-[#eb0045] px-4 py-2 font-medium text-white no-underline shadow-lg"
              >
                <span className="py-1 text-[14px] leading-4 tracking-wide font-bold">contact</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

/** Look up localized product slug from a slug map, with language-prefix and English fallback. */
const lookupProductSlug = (
  slugMap: Record<string, string>,
  locale: string,
): string | undefined => {
  const normalized = normalizeLocale(locale);
  if (!normalized) return undefined;

  // 1. Exact locale match (e.g. "de-de")
  if (slugMap[normalized]) return slugMap[normalized];

  // 2. Language-only key (e.g. "de")
  const lang = normalized.split('-')[0] || '';
  if (lang && slugMap[lang]) return slugMap[lang];

  // 3. Any key with same language prefix (e.g. "de-de" for lookup "de-at")
  const prefixKey = Object.keys(slugMap).find((k) => k.startsWith(`${lang}-`));
  if (prefixKey) return slugMap[prefixKey];

  // 4. English fallback (matches resolveLocalizedValue behavior in Content Hub)
  if (slugMap['en-us']) return slugMap['en-us'];
  if (slugMap['en']) return slugMap['en'];
  const enKey = Object.keys(slugMap).find((k) => k.startsWith('en-'));
  return enKey ? slugMap[enKey] : undefined;
};

/** Valid product slug: alphanumeric and hyphens, at least 2 chars, no leading/trailing punctuation. */
const isValidProductSlug = (slug: string | undefined): boolean => {
  if (!slug || typeof slug !== 'string' || slug.length < 2) return false;
  const trimmed = slug.trim();
  if (trimmed.length < 2) return false;
  if (/^[,-.\s]+$/.test(trimmed)) return false;
  if (/^[,.-]*[a-zA-Z][,.-]*$/.test(trimmed)) return false;
  if (!/^[a-zA-Z0-9-]+$/.test(trimmed)) return false;
  return true;
};

// Helper function to render a language item
const renderLanguageItem = (
  item: SiteLanguageItem,
  idx: number,
  selected: SiteLanguageItem | undefined,
  currentPath: string,
  currentLocale: string,
  isJobsPage: boolean,
  languageDisplayNames: Map<string, string>,
  languagePaths: Map<string, string>,
  siteName: string,
  productSlugs: Record<string, string> | null,
  currentProductSlug: string,
  variantSuffix: string,
) => {
  const fields = item.fields ?? {};
  // Extract field values
  const countryName =
    getString(fields['Language Name Field']) ||
    item.displayName ||
    item.name ||
    '';
  const primaryLangCode = getString(fields['Language Code Field']) || '';
  const secondaryLangCode = getString(fields['Second Language Code Field']) || '';

  const primaryUrlRaw = getHref(fields.Url);
  const secondaryUrlRaw = getHref(fields['Second Url']);
  const primaryAuthoredOtherCountriesUrl = getExplicitOtherCountriesUrl(
    primaryUrlRaw,
    countryName,
  );
  const secondaryAuthoredOtherCountriesUrl = getExplicitOtherCountriesUrl(
    secondaryUrlRaw,
    countryName,
  );

  const primaryDisplayName = resolveDisplayName(
    primaryLangCode,
    primaryUrlRaw,
    languageDisplayNames,
  );

  const secondaryDisplayName = resolveDisplayName(
    secondaryLangCode,
    secondaryUrlRaw,
    languageDisplayNames,
  );

  const originalPath = stripLocales(currentPath);

  // For product pages, resolve slug from Content Hub localized H1 + variant suffix.
  // Falls back to Sitecore display-name slug when no product slug is available.
  // If the derived slug is invalid (e.g. ", -w-," from malformed display names),
  // fall back to the current URL's product slug.
  const primaryProductSlug = productSlugs
    ? lookupProductSlug(productSlugs, primaryLangCode)
    : undefined;
  const secondaryProductSlug = productSlugs
    ? lookupProductSlug(productSlugs, secondaryLangCode)
    : undefined;

  const primaryDerived = primaryProductSlug
    ? primaryProductSlug + variantSuffix
    : primaryDisplayName?.replace(/\s+/g, '-');
  const secondaryDerived = secondaryProductSlug
    ? secondaryProductSlug + variantSuffix
    : secondaryDisplayName?.replace(/\s+/g, '-');

  const primaryLocalizedSlug =
    primaryDerived && isValidProductSlug(primaryDerived)
      ? primaryDerived
      : currentProductSlug + variantSuffix;
  const secondaryLocalizedSlug =
    secondaryDerived && isValidProductSlug(secondaryDerived)
      ? secondaryDerived
      : currentProductSlug + variantSuffix;

  const primaryBase = patchHref(primaryUrlRaw, siteName) ?? primaryUrlRaw;
  const primaryLocale = inferLocaleFromUrl(primaryBase) || primaryLangCode;
  const primaryPathFromSitecore = primaryLocale ? languagePaths.get(primaryLocale.toLowerCase().replace(/_/g, '-')) : undefined;
  // Prefer Sitecore languagePaths when available (content pages: bestsellers, basics, etc.).
  // Product detail pages (cws-xxx-trousers-0) typically have no Sitecore path, so use product slug logic.
  const isProductPage = !!currentProductSlug;
  const primaryFullUrlRaw =
    primaryAuthoredOtherCountriesUrl ??
    (primaryPathFromSitecore
      ? buildUrlFromItemPath(primaryPathFromSitecore, primaryLocale, siteName)
      : isProductPage && primaryUrlRaw
        ? buildLocalizedUrlForCurrentItem({
          baseUrl: primaryBase,
          originalPath,
          localizedSlug: primaryLocalizedSlug,
        })
        : primaryUrlRaw
          ? buildLocalizedUrlForCurrentItem({
            baseUrl: primaryBase,
            originalPath,
            localizedSlug: primaryLocalizedSlug,
          })
          : '');
  // No language version for this page → redirect to site-specific locale home instead of 404
  const primaryHasVersion = productSlugs !== null || hasLanguageVersion(primaryLocale, languageDisplayNames);
  const primaryFullUrl = primaryAuthoredOtherCountriesUrl
    ? ensureLocaleFirst(primaryAuthoredOtherCountriesUrl)
    : !primaryHasVersion
      ? getLocaleHomeUrl(primaryLocale, siteName)
      : isJobsPage && localeMatchesCurrent(currentLocale, primaryLocale)
        ? ensureLocaleFirst(currentPath || '/')
        : primaryFullUrlRaw
          ? ensureLocaleFirst(
            ensureLanguageSwitcherHostSegment(primaryFullUrlRaw, primaryLocale, siteName) || primaryFullUrlRaw
          )
          : '';

  const secondaryBase = patchHref(secondaryUrlRaw, siteName) ?? secondaryUrlRaw;
  const secondaryLocale = inferLocaleFromUrl(secondaryBase) || secondaryLangCode;
  const secondaryPathFromSitecore = secondaryLocale ? languagePaths.get(secondaryLocale.toLowerCase().replace(/_/g, '-')) : undefined;
  const secondaryFullUrlRaw =
    secondaryAuthoredOtherCountriesUrl ??
    (secondaryPathFromSitecore
      ? buildUrlFromItemPath(secondaryPathFromSitecore, secondaryLocale, siteName)
      : isProductPage && secondaryUrlRaw
        ? buildLocalizedUrlForCurrentItem({
          baseUrl: secondaryBase,
          originalPath,
          localizedSlug: secondaryLocalizedSlug,
        })
        : secondaryUrlRaw
          ? buildLocalizedUrlForCurrentItem({
            baseUrl: secondaryBase,
            originalPath,
            localizedSlug: secondaryLocalizedSlug,
          })
          : '');
  // No language version for this page → redirect to site-specific locale home instead of 404
  const secondaryHasVersion = productSlugs !== null || hasLanguageVersion(secondaryLocale, languageDisplayNames);
  const secondaryFullUrl = secondaryAuthoredOtherCountriesUrl
    ? ensureLocaleFirst(secondaryAuthoredOtherCountriesUrl)
    : !secondaryHasVersion
      ? getLocaleHomeUrl(secondaryLocale, siteName)
      : isJobsPage && localeMatchesCurrent(currentLocale, secondaryLocale)
        ? ensureLocaleFirst(currentPath || '/')
        : secondaryFullUrlRaw
          ? ensureLocaleFirst(
            ensureLanguageSwitcherHostSegment(secondaryFullUrlRaw, secondaryLocale, siteName) || secondaryFullUrlRaw
          )
          : '';

  const primaryLinkText =
    (primaryLangCode?.includes('-') ? primaryLangCode.split('-')[0] : primaryLangCode)?.toUpperCase() ||
    getLinkText(fields.Url) ||
    '';

  const secondaryLinkText =
    (secondaryLangCode?.includes('-') ? secondaryLangCode.split('-')[0] : secondaryLangCode)?.toUpperCase() ||
    getLinkText(fields['Second Url']) ||
    '';

  const iconSrc = getImageSrc(fields.Icon?.value);

  const hasSecondaryLanguage = !!secondaryLangCode;

  // Robust selection check
  const normalizedCurrentPath = currentPath.toLowerCase().replace(/\/$/, '') || '/';
  const normalizedPrimaryUrl = primaryFullUrl.toLowerCase().replace(/\/$/, '') || '/';
  const normalizedSecondaryUrl = secondaryFullUrl.toLowerCase().replace(/\/$/, '') || '/';

  const isSelected =
    selected?.id === item.id ||
    (!!primaryFullUrl && (normalizedCurrentPath === normalizedPrimaryUrl || normalizedCurrentPath.startsWith(normalizedPrimaryUrl + '/'))) ||
    (!!secondaryFullUrl && (normalizedCurrentPath === normalizedSecondaryUrl || normalizedCurrentPath.startsWith(normalizedSecondaryUrl + '/')));

  return (
    <div
      key={`${item.id || countryName || idx}`}
      className="group pointer-events-auto relative isolate box-border flex h-[51px] w-full list-none items-center gap-3 border-b-2 border-black px-2 py-[15px] text-base leading-4 font-normal break-words text-black antialiased lg:w-[263px] lg:px-0"
    >
      {iconSrc ? (
        <img
          src={iconSrc}
          alt={countryName}
          className="inline-block h-[20px] w-[24px] md:w-[30px] shrink-0 bg-cover bg-center bg-no-repeat lg:h-[20px] lg:w-[24px]"
        />
      ) : (
        <img
          src="https://www.cws.com/themes/custom/cwsdesign/assets/images/flag-de.svg"
          alt=""
          className="inline-block h-[20px] w-[20px] shrink-0 bg-cover bg-center bg-no-repeat lg:h-[24px] lg:w-[24px]"
        />
      )}

      <div className="flex w-full items-center text-[14px] lg:text-[16px] leading-[20px]">
        {!hasSecondaryLanguage && primaryFullUrl ? (
          <a
            href={ensureLocaleFirst(primaryFullUrl)}
            className={cn(
              `no-underline relative inline-flex items-center text-[#000] after:absolute after:bottom-px after:left-0 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-200 ${
                isSelected ? 'font-bold' : 'font-normal'
              }`,
              'group-hover:after:w-full hover:after:w-full focus-visible:after:w-full',
            )}
          >
            {countryName}
            <span className="ml-1">({primaryLinkText || primaryLangCode})</span>
          </a>
        ) : (
          <>
            <span className={`${isSelected ? 'font-bold' : 'font-normal'}`}>
              {countryName}
            </span>

            <span
              className={`ml-1 `}
            >
              (
              {primaryFullUrl ? (
                <a
                  href={ensureLocaleFirst(primaryFullUrl)}
                  className="text-[#000] no-underline relative inline-block after:absolute after:bottom-px after:left-0 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-200 hover:after:w-full focus-visible:after:w-full"
                  aria-label={`${primaryLinkText}`}
                >
                  {primaryLinkText || primaryLangCode}
                </a>
              ) : (
                primaryLinkText || primaryLangCode
              )}
              {secondaryLinkText && (
                <>
                  {' | '}
                  {secondaryFullUrl ? (
                    <a
                      href={ensureLocaleFirst(secondaryFullUrl)}
                      className="text-[#000] no-underline relative inline-block after:absolute after:bottom-px after:left-0 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-200 hover:after:w-full focus-visible:after:w-full"
                      aria-label={`${secondaryLinkText}`}
                    >
                      {secondaryLinkText}
                    </a>
                  ) : (
                    secondaryLinkText
                  )}
                </>
              )}
              )
            </span>
          </>
        )}
        {isSelected && (
          <svg
            className="ml-auto h-5 w-5 lg:h-6 lg:w-6 flex-shrink-0 text-[#000]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default Default;

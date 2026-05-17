'use client';

import { Placeholder, useComponentProps, useSitecore } from '@sitecore-content-sdk/nextjs';
import { motion, useReducedMotion } from 'framer-motion';
import type { FC } from 'react';
import { useEffect, useMemo } from 'react';

import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';
import { useSiteName } from '@/hooks/useSiteName';
import { patchHref } from '@/lib/patch-link';

import type {
  LandingPageHeroImage,
  LandingPageHeroLogo,
  LandingPageHeroProps,
  LandingPageHeroTrustBadge,
  LandingPageHeroUsp,
} from './LandingPageHero.props';

const FONT = "'Suisse Intl', 'Helvetica Neue', Arial, sans-serif";
const BOLD_FONT = 'suisse_intlbold, sans-serif';
const CWS_LOGO_SRC = 'https://www.cws.com/themes/custom/cwsdesign/logo.svg';
const PHONE_ICON_SRC =
  'https://www.cws.com/themes/custom/cwsdesign/assets/images/icons/phone_bu_bold.svg';
const HERO_FORM_PLACEHOLDER_NAME = 'landing-page-hero-form';

interface HeroData {
  headline: string;
  usps: LandingPageHeroUsp[];
  formHeading: string;
  formSubheading: string;
  images: LandingPageHeroImage[];
  trustBadges: LandingPageHeroTrustBadge[];
  logo: LandingPageHeroLogo;
  solutionLabel: string;
  phoneNumber: string;
  phoneDisplay: string;
  ctaButtonText: string;
}

interface LetterData {
  letter: string;
  globalIdx: number;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined;
}

function unwrapItemFields(value: unknown): Record<string, unknown> {
  const item = asRecord(value);
  if (!item) return {};
  const nestedFields = asRecord(item.fields);
  return nestedFields ?? item;
}

function getPrimitiveValue(field: unknown): string | number | boolean | undefined {
  if (typeof field === 'string' || typeof field === 'number' || typeof field === 'boolean') {
    return field;
  }

  const obj = asRecord(field);
  if (!obj) return undefined;

  if (
    typeof obj.value === 'string' ||
    typeof obj.value === 'number' ||
    typeof obj.value === 'boolean'
  ) {
    return obj.value;
  }

  if (
    typeof obj.jsonValue === 'string' ||
    typeof obj.jsonValue === 'number' ||
    typeof obj.jsonValue === 'boolean'
  ) {
    return obj.jsonValue;
  }

  const jsonValue = asRecord(obj.jsonValue);
  if (
    jsonValue &&
    (typeof jsonValue.value === 'string' ||
      typeof jsonValue.value === 'number' ||
      typeof jsonValue.value === 'boolean')
  ) {
    return jsonValue.value;
  }

  return undefined;
}

function getTextValue(field: unknown): string {
  const value = getPrimitiveValue(field);
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function getNumberValue(field: unknown): number | undefined {
  const value = getPrimitiveValue(field);
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function getImageField(field: unknown): LandingPageHeroImage {
  if (typeof field === 'string') return { src: field, alt: '' };

  const obj = asRecord(field);
  if (!obj) return { src: '', alt: '' };

  const href = obj.href ?? obj.url;
  if (typeof href === 'string') return { src: href, alt: '' };

  const jsonValue = asRecord(obj.jsonValue);
  const imageValue = (asRecord(jsonValue?.value) ?? asRecord(obj.value)) as
    | { src?: string; alt?: string }
    | undefined;

  return {
    src: typeof imageValue?.src === 'string' ? imageValue.src : '',
    alt: typeof imageValue?.alt === 'string' ? imageValue.alt : '',
  };
}

function getTargetItems(field: unknown): Record<string, unknown>[] {
  if (Array.isArray(field)) {
    return field.filter((item): item is Record<string, unknown> => !!asRecord(item));
  }

  const obj = asRecord(field);
  if (!obj) return [];

  const candidates = [obj.targetItems, obj.results, obj.children];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is Record<string, unknown> => !!asRecord(item));
    }
  }

  return [];
}

function resolveHeroData(datasource: Record<string, unknown> | undefined): HeroData {
  const ds = unwrapItemFields(datasource);

  const headline = getTextValue(ds.headline ?? ds.Headline);
  const formHeading = getTextValue(ds.formHeading ?? ds.FormHeading);
  const formSubheading = getTextValue(ds.formSubheading ?? ds.FormSubheading);
  const solutionLabel = getTextValue(ds.solutionLabel ?? ds.SolutionLabel);
  const phoneNumber = getTextValue(ds.phoneNumber ?? ds.PhoneNumber);
  const phoneDisplay = getTextValue(ds.phoneDisplay ?? ds.PhoneDisplay);
  const ctaButtonText = getTextValue(ds.ctaButtonText ?? ds.CtaButtonText);

  const logoField = getImageField(ds.logo ?? ds.Logo);
  const logo: LandingPageHeroLogo = {
    src: logoField.src,
    alt: logoField.alt,
  };

  const images = getTargetItems(ds.images ?? ds.Images)
    .map((rawImage) => {
      const image = unwrapItemFields(rawImage);
      const imageField = getImageField(image.image ?? image.Image);
      const alt = getTextValue(image.alt ?? image.Alt) || imageField.alt;
      return { src: imageField.src, alt };
    })
    .filter((image) => Boolean(image.src || image.alt));

  const usps = getTargetItems(ds.usps ?? ds.USPs)
    .map((rawUsp) => {
      const usp = unwrapItemFields(rawUsp);
      return {
        title: getTextValue(usp.title ?? usp.Title),
        description: getTextValue(usp.description ?? usp.Description),
      };
    })
    .filter((usp) => Boolean(usp.title || usp.description));

  const trustBadges = getTargetItems(ds.trustBadges ?? ds.TrustBadges)
    .map((rawBadge) => {
      const badge = unwrapItemFields(rawBadge);
      const imageField = getImageField(badge.image ?? badge.Image);
      const alt = getTextValue(badge.alt ?? badge.Alt) || imageField.alt;
      const width = getNumberValue(badge.width ?? badge.Width) ?? 0;
      const height = getNumberValue(badge.height ?? badge.Height) ?? 0;
      return { src: imageField.src, alt, width, height };
    })
    .filter((badge) => Boolean(badge.src || badge.alt));

  return {
    headline,
    usps,
    formHeading,
    formSubheading,
    images,
    trustBadges,
    logo,
    solutionLabel,
    phoneNumber,
    phoneDisplay,
    ctaButtonText,
  };
}

function hasHeroFormContent(rendering: LandingPageHeroProps['rendering']): boolean {
  const placeholders = asRecord(rendering?.placeholders);
  if (!placeholders) return false;

  return Object.entries(placeholders).some(([key, value]) => {
    if (!key) return false;
    const leaf = key.split('/').pop()?.trim() || key;
    if (leaf !== HERO_FORM_PLACEHOLDER_NAME && key !== HERO_FORM_PLACEHOLDER_NAME) return false;
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
}

const HeroHeader: FC<{
  logo: LandingPageHeroLogo;
  solutionLabel: string;
  phoneNumber: string;
  phoneDisplay: string;
  homeHref: string;
}> = ({ logo, solutionLabel, phoneNumber, phoneDisplay, homeHref }) => {
  const resolvedSolutionLabel = solutionLabel || 'Workwear';
  const resolvedLogoAlt = logo.alt || `${resolvedSolutionLabel} logo image`;

  return (
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 max-w-[1360px] mx-auto">
      <div className="flex items-start justify-between px-[8px] lg:px-[20px] pt-[1px]">
        <div className="pointer-events-auto hidden h-[48px] w-[336px] items-stretch overflow-hidden lg:flex">
          <a
            href={homeHref}
            title={`${resolvedSolutionLabel} logo link`}
            rel="home"
            className="block basis-1/2"
            style={{ backgroundColor: 'var(--color-brand-primary)' }}
          >
            <img
              src={logo.src || CWS_LOGO_SRC}
              alt={resolvedLogoAlt}
              loading="eager"
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          </a>

          <a
            href={homeHref}
            title={`${resolvedSolutionLabel} logo link`}
            className="flex basis-1/2 items-center justify-center no-underline"
            style={{
              fontFamily: FONT,
              backgroundColor: 'var(--color-accent-primary)',
              color: 'var(--color-text-primary)',
            }}
          >
            <span
              className="inline-block text-[11px] leading-none uppercase"
              style={{
                fontFamily: BOLD_FONT,
                letterSpacing: '0.37rem',
              }}
            >
              {resolvedSolutionLabel}
            </span>
          </a>
        </div>

        {/* Phone CTA */}
        <a
          href={`tel:${phoneNumber}`}
          className={cn(
            'pointer-events-auto ml-auto flex items-center',
            'px-[16px] py-[8px] no-underline',
            'transition-colors lg:px-[38px]',
          )}
          style={{
            backgroundColor: 'var(--color-brand-primary)',
            color: 'var(--color-text-inverse)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-brand-destructive)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-brand-primary)';
          }}
        >
          <img
            src={PHONE_ICON_SRC}
            alt=""
            aria-hidden="true"
            loading="eager"
            className="mr-[12px] h-[18px] w-[18px] shrink-0"
          />
          <span
            className="text-[14px] font-bold leading-[17px]"
            style={{ fontFamily: FONT }}
          >
            {phoneDisplay}
          </span>
        </a>
      </div>
    </div>
  );
};

const ImageGallery: FC<{ images: LandingPageHeroImage[] }> = ({ images }) => {
  return (
    <div className="flex flex-nowrap items-stretch">
      {images.map((image, idx) => (
        <div
          key={idx}
          className={cn('flex-1', idx > 0 && 'hidden lg:block')}
        >
          <img
            src={image.src}
            alt={image.alt}
            loading="eager"
            className="aspect-square h-full w-full max-h-[70vw] object-cover lg:aspect-auto lg:max-h-[50vh]"
          />
        </div>
      ))}
    </div>
  );
};

const AnimatedHeadline: FC<{ text: string }> = ({ text }) => {
  const prefersReducedMotion = useReducedMotion();

  const lettersByWord = useMemo(() => {
    const words = text.split(' ');
    let globalIdx = 0;
    return words.map((word) =>
      word.split('').map(
        (letter): LetterData => ({
          letter,
          globalIdx: globalIdx++,
        }),
      ),
    );
  }, [text]);

  return (
    <h1
      className="m-0 pt-[10px] text-[26px] leading-none lg:pt-[20px] lg:text-[44px]"
      style={{ fontFamily: FONT, fontWeight: 700, lineHeight: 1 }}
    >
      {lettersByWord.map((wordLetters, wordIdx) => (
        <span
          key={wordIdx}
          className="mr-[5px] inline-block overflow-hidden align-top leading-[30px] lg:mr-[10px] lg:leading-[50px]"
        >
          {wordLetters.map(({ letter, globalIdx }) => (
            <motion.span
              key={globalIdx}
              className="inline-block"
              style={{ lineHeight: 'inherit' }}
              initial={prefersReducedMotion ? false : { y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 1.4,
                ease: [0.16, 1, 0.3, 1],
                delay: globalIdx * 0.03,
              }}
            >
              {letter}
            </motion.span>
          ))}
        </span>
      ))}
    </h1>
  );
};

const UspRow: FC<{ usps: LandingPageHeroUsp[] }> = ({ usps }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        'w-full lg:w-[54%] xl:w-[56%]',
        'flex flex-col lg:flex-row lg:flex-nowrap',
        'gap-0 lg:gap-[20px]',
        'mt-[10px] lg:mt-[18px]',
        'pb-[15px] lg:pb-[60px] lg:pr-[38px] xl:pr-[46px] 2xl:pb-[30px]',
      )}
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 1.6 }}
    >
      {usps.map((usp, idx) => (
        <div
          key={idx}
          className={cn(
            'mb-[15px] pl-[15px] lg:mb-0',
            'flex-1 lg:basis-1/3',
          )}
          style={{ borderLeft: '6px solid var(--color-bg-primary)' }}
        >
          <p
            className="m-0 mb-[10px] text-[13px] leading-[18px] lg:mb-[12px] lg:text-[15px] lg:leading-[20px]"
            style={{ fontFamily: FONT, fontWeight: 700 }}
          >
            {usp.title}
          </p>
          <p
            className="m-0 text-[13px] leading-[18px] lg:text-[15px] lg:leading-[20px]"
            style={{ fontFamily: FONT, fontWeight: 400 }}
          >
            {usp.description}
          </p>
        </div>
      ))}
    </motion.div>
  );
};

const FormPanel: FC<{
  heading: string;
  subheading: string;
  trustBadges: LandingPageHeroTrustBadge[];
  rendering: LandingPageHeroProps['rendering'];
  isPageEditing?: boolean;
  hasFormContent?: boolean;
}> = ({ heading, subheading, trustBadges, rendering, isPageEditing, hasFormContent }) => {
  return (
    <div className="relative mx-auto w-full max-w-[1360px]">
      <div
        data-hero-form-panel
        className={cn(
          'z-10 lg:mt-[63px] mb-[50px] bg-white',
          'w-[calc(100%+16px)] -mx-[8px] lg:border-[8px]  p-[24px]',
          'lg:absolute lg:right-0 lg:bottom-[69px] lg:mr-[42px] xl:bottom-[71px] xl:mr-[48px]',
          'lg:mt-0 lg:mb-0 lg:w-[428px] xl:w-[430px] lg:border-0',
        )}
      >
      <div
        id="kontakt"
        data-hero-form-slot
        className="relative min-h-[700px] rounded-[4px]  lg:min-h-[580px] xl:min-h-[580px] 2xl:h-[600px] 3xl:h-[620px]"
      >
        <div className="h-full w-full">
          <Placeholder name={HERO_FORM_PLACEHOLDER_NAME} rendering={rendering} />
        </div>
      </div>

      {trustBadges.length > 0 && (
        <div className="mt-[16px] flex items-center justify-center gap-[16px]">
          {trustBadges.map((badge, idx) => (
            <img
              key={idx}
              src={badge.src}
              alt={badge.alt}
              width={badge.width}
              height={badge.height}
              loading="lazy"
              className="h-[64px] lg:h-[90px] w-auto object-contain"
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
};

const LandingPageHeroLayout: FC<LandingPageHeroProps> = (props) => {
  const { rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing;
  const siteName = useSiteName();
  const locale = useLocale();

  const componentUid = props.rendering?.uid;
  const serverProps = useComponentProps<{ fields?: { data?: { datasource?: Record<string, unknown> } } }>(
    componentUid,
  );
  const fieldsOrRendering = props.fields ?? serverProps?.fields ?? props.rendering?.fields;
  const fieldsObj = fieldsOrRendering as Record<string, unknown> | null | undefined;
  const renderingObj = props.rendering as unknown as Record<string, unknown> | null | undefined;
  const datasource = (
    (fieldsObj?.data as Record<string, unknown> | undefined)?.datasource ??
    fieldsObj?.datasource ??
    fieldsObj ??
    (typeof renderingObj?.dataSource === 'object' && renderingObj?.dataSource
      ? (renderingObj.dataSource as Record<string, unknown>)
      : undefined)
  ) as Record<string, unknown> | undefined;

  const mappedData = useMemo(() => resolveHeroData(datasource), [datasource]);
  const hasSitecoreData = Boolean(
    datasource &&
      (mappedData.headline ||
        mappedData.formHeading ||
        mappedData.formSubheading ||
        mappedData.images.length > 0 ||
        mappedData.usps.length > 0 ||
        mappedData.trustBadges.length > 0 ||
        mappedData.logo.src ||
        mappedData.solutionLabel ||
        mappedData.phoneNumber ||
        mappedData.phoneDisplay ||
        mappedData.ctaButtonText),
  );

  useEffect(() => {
    if (isPageEditing || typeof document === 'undefined') {
      return;
    }

    const TARGET_ID = 'kontakt';
    const PREFERRED_FORM_SELECTOR =
      'input[name="form_name"][data-prefill="Hero Form LP WW"]';

    let observer: MutationObserver | null = null;
    let timeoutId: number | null = null;

    const moveFormIntoKontakt = (): boolean => {
      const kontakt = document.getElementById(TARGET_ID);
      if (!kontakt) {
        return false;
      }

      const source = document
        .querySelector<HTMLInputElement>(PREFERRED_FORM_SELECTOR)
        ?.closest('.main-form-wrapper') as HTMLElement | null;

      if (!source) {
        return false;
      }

      if (kontakt.contains(source)) {
        kontakt.dataset.hasLpWwForm = 'true';
        source.dataset.movedToKontakt = 'true';
        return true;
      }

      kontakt.appendChild(source);
      kontakt.dataset.hasLpWwForm = 'true';
      source.dataset.movedToKontakt = 'true';
      return true;
    };

    if (moveFormIntoKontakt()) {
      return;
    }

    observer = new MutationObserver(() => {
      if (!observer) {
        return;
      }

      if (moveFormIntoKontakt()) {
        observer.disconnect();
        observer = null;

        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
          timeoutId = null;
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    timeoutId = window.setTimeout(() => {
      observer?.disconnect();
      observer = null;
      timeoutId = null;
    }, 10000);

    return () => {
      observer?.disconnect();
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isPageEditing]);

  const {
    headline,
    usps,
    formHeading,
    formSubheading,
    images,
    trustBadges,
    logo,
    solutionLabel,
    phoneNumber,
    phoneDisplay,
    ctaButtonText,
  } = mappedData;

  const hasFormContent = hasHeroFormContent(rendering);
  const workwearHomeHref =
    patchHref(`/${locale}/workwear`, siteName, 'workwear', locale) ?? `/${locale}/workwear`;

  if (isPageEditing && !hasSitecoreData) {
    return (
      <div
        className="rounded-lg border-2 border-dashed p-8 text-center"
        style={{
          borderColor: 'var(--color-border-light)',
          color: 'var(--color-text-muted)'
        }}
      >
        <p className="text-lg font-semibold">Landing Page Hero</p>
        <p className="text-sm">Component placeholder — configure in Sitecore</p>
      </div>
    );
  }

  if (!isPageEditing && !hasSitecoreData) {
    return null;
  }

  return (
    <>
      <section
        className="relative z-10 lg:flex lg:min-h-screen lg:flex-col mb-10"
        style={{ backgroundColor: 'var(--color-accent-primary)' }}
        data-component="LandingPageHero"
      >
        <HeroHeader
          logo={logo}
          solutionLabel={solutionLabel}
          phoneNumber={phoneNumber}
          phoneDisplay={phoneDisplay}
          homeHref={workwearHomeHref}
        />
        <ImageGallery images={images} />

        <div
          className={cn(
            'relative mx-auto flex w-full max-w-[1360px] flex-col items-start justify-between',
            'px-[8px] lg:flex-1 lg:px-[20px]',
          )}
        >
          <div
            className={cn(
              'w-full',
              'lg:flex lg:w-[60%] lg:flex-1 lg:flex-wrap lg:items-center xl:w-[62%]',
            )}
          >
            <AnimatedHeadline text={headline} />
          </div>

          <UspRow usps={usps} />

          <FormPanel
            heading={formHeading}
            subheading={formSubheading}
            trustBadges={trustBadges}
            rendering={rendering}
            isPageEditing={isPageEditing}
            hasFormContent={hasFormContent}
          />
        </div>
      </section>

      {/* Sticky CTA — fixed bottom-right, hidden on mobile */}
      {ctaButtonText && (
        <>
          <div
            className="fixed bottom-0 left-0 z-49 w-full border-t px-2 py-[14px] lg:hidden"
            style={{
              borderTopColor: 'var(--color-border-default)',
              backgroundColor: 'var(--color-bg-primary)',
              boxShadow: '0 -4px 6px -1px var(--color-shadow, rgba(0, 0, 0, 0.1))'
            }}
          >
            <a
              href="#kontakt"
              className="text-md flex w-full items-center justify-center gap-3 rounded-full px-4 py-2 font-medium no-underline shadow-lg transition-colors"
              style={{
                fontFamily: FONT,
                backgroundColor: 'var(--color-brand-primary)',
                color: 'var(--color-text-inverse)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-brand-destructive)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-brand-primary)';
              }}
            >
              <span className="py-1 text-[14px] leading-4 font-bold tracking-wide">
                {ctaButtonText}
              </span>
            </a>
          </div>

          <a
            href="#kontakt"
            className={cn(
              'fixed bottom-[20px] right-[20px] z-0',
              'hidden lg:block',
              'rounded-full px-[25px] py-[6px]',
              'text-[17px] no-underline',
              'transition-colors',
            )}
            style={{
              fontFamily: FONT,
              backgroundColor: 'var(--color-brand-primary)',
              color: 'var(--color-text-inverse)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-brand-destructive)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-brand-primary)';
            }}
          >
            {ctaButtonText}
          </a>
        </>
      )}
    </>
  );
};

export const Default: FC<LandingPageHeroProps> = (props) => (
  <LandingPageHeroLayout {...props} />
);

export async function getComponentServerProps(
  rendering: { fields?: Record<string, unknown> },
): Promise<{ fields?: Record<string, unknown> }> {
  const fields = rendering?.fields;
  if (!fields) return {};
  return { fields };
}

export default Default;

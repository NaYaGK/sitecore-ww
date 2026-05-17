'use client';

import React from 'react';
import { Image, RichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { QuoteHighlightProps } from './QuoteHighlight.props';
import { cn } from '@/lib/utils';
import QuoteHighlightCwsStyleVariant from './variants/QuoteHighlightCwsStyleVariant';

type QuoteHighlightVariant =
  | 'default'
  | 'reducedlHeight'
  | 'landingPage'
  | 'landingPageImageLeft'
  | 'cwsStyle';

const normalizeVariant = (variant?: string): QuoteHighlightVariant => {
  const normalized = (variant ?? '').trim().toLowerCase();
  if (normalized === 'reducedlheight' || normalized === 'reducedheight') {
    return 'reducedlHeight';
  }

  if (normalized === 'landingpage' || normalized === 'landing') {
    return 'landingPage';
  }

  if (
    normalized === 'landingpageimageleft' ||
    normalized === 'landingimageleft' ||
    normalized === 'landingpageleft'
  ) {
    return 'landingPageImageLeft';
  }

  if (normalized === 'cwsstyle') {
    return 'cwsStyle';
  }

  return 'default';
};

type ImageAlign = 'left' | 'right';

const normalizeParamKey = (key: string): string =>
  key.toLowerCase().replace(/[^a-z0-9]/g, '');

const normalizeToString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return undefined;
};

const normalizeImageAlignValue = (value?: string): ImageAlign | undefined => {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'left' || normalized === 'right') return normalized;
  return undefined;
};

const getParamValue = (
  params: Record<string, unknown>,
  keyName: string,
): string | undefined => {
  const targetKey = normalizeParamKey(keyName);
  const entry = Object.entries(params).find(([key]) => normalizeParamKey(key) === targetKey);
  if (!entry) return undefined;
  return normalizeToString(entry[1]);
};

const parseAdditionalParameters = (rawValue: string): Record<string, string> => {
  const normalized = rawValue.trim();
  if (!normalized) return {};

  const params = new URLSearchParams(normalized.replace(/&amp;/gi, '&').replace(/^\?/, ''));

  const parsed: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    parsed[normalizeParamKey(key)] = value.trim();
  }

  for (const chunk of normalized.split(/[|;\r\n]+/)) {
    const trimmedChunk = chunk.trim();
    if (!trimmedChunk) continue;

    const match = trimmedChunk.match(/^([^:=]+)\s*[:=]\s*(.+)$/);
    if (!match) continue;

    const key = normalizeParamKey(match[1] ?? '');
    const value = (match[2] ?? '').trim();
    if (key && value && !parsed[key]) {
      parsed[key] = value;
    }
  }
  return parsed;
};

const getImageAlignFromText = (rawValue: string): ImageAlign | undefined => {
  const pairMatch = rawValue.match(/image\s*[-_ ]?align\s*[:=]\s*(left|right)/i);
  if (pairMatch?.[1]) {
    return pairMatch[1].toLowerCase() as ImageAlign;
  }

  const tokenMatch = rawValue.match(/\b(imagealign|image-align)\s*[-_:]?(left|right)\b/i);
  if (tokenMatch?.[2]) {
    return tokenMatch[2].toLowerCase() as ImageAlign;
  }

  return undefined;
};

const getImageAlignFromStyles = (styleClasses: string): ImageAlign | undefined => {
  const normalized = ` ${styleClasses.toLowerCase()} `;
  if (
    normalized.includes(' imagealign-left ') ||
    normalized.includes(' image-align-left ')
  ) {
    return 'left';
  }

  if (
    normalized.includes(' imagealign-right ') ||
    normalized.includes(' image-align-right ')
  ) {
    return 'right';
  }

  // Style classes represent content alignment, so they map inversely to image position.
  if (
    normalized.includes(' position-right ') ||
    normalized.includes(' align-content-right ')
  ) {
    return 'left';
  }

  if (
    normalized.includes(' position-left ') ||
    normalized.includes(' align-content-left ')
  ) {
    return 'right';
  }

  return undefined;
};

const getImageAlignFromParams = (props: QuoteHighlightProps): ImageAlign | undefined => {
  const mergedParams: Record<string, unknown> = {
    ...((props?.rendering?.params as Record<string, unknown> | undefined) ?? {}),
    ...((props?.params as Record<string, unknown> | undefined) ?? {}),
  };

  const directImageAlign =
    normalizeImageAlignValue(getParamValue(mergedParams, 'imagealign')) ??
    normalizeImageAlignValue(getParamValue(mergedParams, 'image align')) ??
    normalizeImageAlignValue(getParamValue(mergedParams, 'image-align'));
  if (directImageAlign) return directImageAlign;

  const additionalParameterValues = [
    getParamValue(mergedParams, 'AdditionalParameters'),
    getParamValue(mergedParams, 'Additional Parameters'),
    getParamValue(mergedParams, 'Additional Parameter'),
    getParamValue(mergedParams, 'additionalParameters'),
  ].filter((v): v is string => Boolean(v));

  for (const additionalParamValue of additionalParameterValues) {
    const parsedAdditionalParameters = parseAdditionalParameters(additionalParamValue);
    const imageAlignFromAdditional =
      normalizeImageAlignValue(parsedAdditionalParameters.imagealign) ??
      getImageAlignFromText(additionalParamValue);
    if (imageAlignFromAdditional) return imageAlignFromAdditional;
  }

  for (const value of Object.values(mergedParams)) {
    const stringValue = normalizeToString(value);
    if (!stringValue || !/image\s*[-_ ]?align/i.test(stringValue)) continue;

    const imageAlignFromValue = getImageAlignFromText(stringValue);
    if (imageAlignFromValue) return imageAlignFromValue;
  }

  return undefined;
};

const getBackgroundColorFromParams = (props: QuoteHighlightProps): string => {
  const mergedParams: Record<string, unknown> = {
    ...((props?.rendering?.params as Record<string, unknown> | undefined) ?? {}),
    ...((props?.params as Record<string, unknown> | undefined) ?? {}),
  };

  const backgroundColorValue =
    getParamValue(mergedParams, 'Background Color') ??
    getParamValue(mergedParams, 'BackgroundColor') ??
    getParamValue(mergedParams, 'background color') ??
    getParamValue(mergedParams, 'backgroundcolor');

  const normalizedBackgroundColor = backgroundColorValue?.trim().toLowerCase();

  if (!normalizedBackgroundColor) return '#f9e244';
  if (normalizedBackgroundColor === 'green') return '#acd800';
  if (normalizedBackgroundColor === 'yellow') return '#f9e244';

  return normalizedBackgroundColor;
};

const QuoteHighlightLayout: React.FC<QuoteHighlightProps & { variant: QuoteHighlightVariant }> = (props) => {
  const { fields, variant } = props;
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing;
  const backgroundColor =
    ((props?.params as Record<string, unknown> | undefined)?.Styles as string | undefined)?.trim() ||
    ((props?.rendering?.params as Record<string, unknown> | undefined)?.Styles as string | undefined)?.trim() ||
    undefined;
  const resolvedBackgroundColor = backgroundColor || 'var(--color-accent-primary)';
  const rawStyles =
    (props?.params as Record<string, unknown> | undefined)?.styles ||
    (props?.params as Record<string, unknown> | undefined)?.Styles ||
    (props?.rendering?.params as Record<string, unknown> | undefined)?.styles ||
    (props?.rendering?.params as Record<string, unknown> | undefined)?.Styles ||
    '';
  const styleClasses = typeof rawStyles === 'string' ? rawStyles : '';
  const imageAlign = getImageAlignFromParams(props);
  const imageAlignFromStyles = getImageAlignFromStyles(styleClasses);
  const contentBackgroundColor = getBackgroundColorFromParams(props);
  const shouldPlaceImageLeftFromParams = imageAlign
    ? imageAlign === 'left'
    : imageAlignFromStyles === 'left';
  const shouldPlaceImageLeft =
    variant === 'default' || variant === 'landingPageImageLeft'
      ? true
      : variant === 'landingPage'
        ? false
        : shouldPlaceImageLeftFromParams;

  if (!fields) {
    return null;
  }

  const signatureValue = fields?.Signature?.value?.trim();
  const isReducedHeight = variant === 'reducedlHeight';
  const normalizedTitleClasses = '[&_h1]:m-0! [&_h2]:m-0! [&_h3]:m-0! [&_h4]:m-0! [&_h5]:m-0! [&_h6]:m-0! [&_h1]:font-heading! [&_h2]:font-heading! [&_h3]:font-heading! [&_h4]:font-heading! [&_h5]:font-heading! [&_h6]:font-heading! [&_h1]:font-bold! [&_h2]:font-bold! [&_h3]:font-bold! [&_h4]:font-bold! [&_h5]:font-bold! [&_h6]:font-bold! [&_h1]:text-[22px]! [&_h2]:text-[22px]! [&_h3]:text-[22px]! [&_h4]:text-[22px]! [&_h5]:text-[22px]! [&_h6]:text-[22px]! [&_h1]:leading-[24px]! [&_h2]:leading-[24px]! [&_h3]:leading-[24px]! [&_h4]:leading-[24px]! [&_h5]:leading-[24px]! [&_h6]:leading-[24px]! lg:[&_h1]:text-[28px]! lg:[&_h2]:text-[28px]! lg:[&_h3]:text-[28px]! lg:[&_h4]:text-[28px]! lg:[&_h5]:text-[28px]! lg:[&_h6]:text-[28px]! lg:[&_h1]:leading-[36px]! lg:[&_h2]:leading-[36px]! lg:[&_h3]:leading-[36px]! lg:[&_h4]:leading-[36px]! lg:[&_h5]:leading-[36px]! lg:[&_h6]:leading-[36px]!';
  const normalizedDescriptionClasses = '[&_h1]:m-0! [&_h2]:m-0! [&_h3]:m-0! [&_h4]:m-0! [&_h5]:m-0! [&_h6]:m-0! [&_p]:m-0! [&_ul]:my-0 [&_ol]:my-0 [&_strong]:font-bold! [&_b]:font-bold! [&_h1]:font-body! [&_h2]:font-body! [&_h3]:font-body! [&_h4]:font-body! [&_h5]:font-body! [&_h6]:font-body! [&_h1]:font-bold! [&_h2]:font-bold! [&_h3]:font-bold! [&_h4]:font-bold! [&_h5]:font-bold! [&_h6]:font-bold! [&_h1]:text-[17px]! [&_h2]:text-[17px]! [&_h3]:text-[17px]! [&_h4]:text-[17px]! [&_h5]:text-[17px]! [&_h6]:text-[17px]! [&_h1]:leading-[26px]! [&_h2]:leading-[26px]! [&_h3]:leading-[26px]! [&_h4]:leading-[26px]! [&_h5]:leading-[26px]! [&_h6]:leading-[26px]! [&_p]:text-[17px]! [&_p]:leading-[26px]! [&_li]:text-[17px]! [&_li]:leading-[26px]! lg:[&_h1]:text-[17px]! lg:[&_h2]:text-[17px]! lg:[&_h3]:text-[17px]! lg:[&_h4]:text-[17px]! lg:[&_h5]:text-[17px]! lg:[&_h6]:text-[17px]! lg:[&_h1]:leading-[28px]! lg:[&_h2]:leading-[28px]! lg:[&_h3]:leading-[28px]! lg:[&_h4]:leading-[28px]! lg:[&_h5]:leading-[28px]! lg:[&_h6]:leading-[28px]! lg:[&_p]:text-[17px]! lg:[&_p]:leading-[28px]! lg:[&_li]:text-[17px]! lg:[&_li]:leading-[28px]!';

  if (variant === 'cwsStyle') {
    return (
      <div data-component="QuoteHighlight-cwsStyle">
        <QuoteHighlightCwsStyleVariant
          {...props}
          shouldPlaceImageLeft={shouldPlaceImageLeft}
          contentBackgroundColor={contentBackgroundColor}
        />
      </div>
    );
  }

  if (
    variant === 'default' ||
    variant === 'landingPage' ||
    variant === 'landingPageImageLeft'
  ) {
    return (
      <section
        className="component quote-highlight mt-8 mb-12 w-full lg:mb-18"
        data-component={`QuoteHighlight-${variant}`}
      >
        <div className="mx-auto w-full max-w-[1360px] px-2">
          <div className={cn(
            'grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 lg:gap-8',
            shouldPlaceImageLeft ? '' : 'lg:grid-flow-col-dense'
          )}>
            <div className={cn(
              'min-h-[480px] w-full overflow-hidden',
              shouldPlaceImageLeft ? '' : 'lg:col-start-2'
            )}>
              <Image
                field={fields?.Image}
                alt={fields?.Image?.value?.alt}
                className="block h-full w-full object-cover"
              />
            </div>

            <div className={cn(
              'flex min-h-[480px] w-full flex-col justify-between p-7 md:p-10 lg:p-12',
              'flex min-h-[480px] w-full flex-col justify-between p-7 md:p-10 lg:p-12',
              shouldPlaceImageLeft ? '' : 'lg:col-start-1'
            )} style={{ backgroundColor: contentBackgroundColor }}>
              <div className="space-y-6 text-black">
                <div className={cn('rte-content font-heading! mb-0!', normalizedTitleClasses)}>
                  <RichText field={fields?.Title} />
                </div>
                <div className={cn(
                  'rte-content font-body! mt-0! mb-0! text-[17px]! leading-[26px]!',
                  normalizedDescriptionClasses
                )}>
                  <RichText field={fields?.Description} />
                </div>
              </div>

              <div className="mt-auto">
                {isPageEditing ? (
                  <Text tag="p" field={fields?.Signature} className="font-body text-[17px]" />
                ) : signatureValue ? (
                  <a
                    href="#kontakt"
                    className="w-fit rounded-full bg-(--color-accent-red) px-6 py-2 text-sm leading-5 font-bold text-white no-underline"
                    title={signatureValue}
                  >
                    {signatureValue}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div
      className={cn('component quote-highlight mt-8 mb-12 lg:mb-18 w-full', styleClasses)}
      data-component={`QuoteHighlight-${variant}`}
      style={{ backgroundColor: isReducedHeight ? 'transparent' : contentBackgroundColor }}
    >
      {/* Below lg: yellow on top, image below */}
      <div className="lg:hidden w-full">
        {/* Yellow Content - Top */}
        <div
          className="w-full mx-auto max-w-[1360px] px-4 py-10 md:px-8 md:py-12"
          style={{ backgroundColor: isReducedHeight ? contentBackgroundColor : undefined }}
        >
          <div className="mx-auto max-w-[1360px]">
            <div className={cn(
              'rte-content font-heading! mb-6! text-[22px]! leading-[24px]! md:text-xl! md:leading-normal!',
              normalizedTitleClasses
            )}>
              <RichText field={fields?.Title} />
            </div>
            <div className={cn(
              'rte-content font-body! pr-4 mt-0! mb-[13px]! text-[17px]! leading-[26px]! hyphens-manual!',
              normalizedDescriptionClasses
            )}>
              <RichText field={fields?.Description} />
            </div>
            <Text tag="p" field={fields?.Signature} className="font-body text-[17px]" />
          </div>
        </div>
        {/* Image - Bottom */}
        <div
          className="w-full overflow-hidden"
          style={{
            height: isReducedHeight
              ? 'clamp(190px, calc(40px + 46.88vw), 372px)'
              : 'clamp(190px, calc(40px + 46.88vw), 400px)',
          }}
        >
          <div className="mx-auto max-w-[1360px]">
            <Image
              field={fields?.Image}
              alt={fields?.Image?.value?.alt}
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </div>

      {/* lg and above: 50/50 viewport split */}
      <div
        className={cn(
          'hidden lg:flex lg:w-screen lg:relative lg:left-1/2 lg:-translate-x-1/2',
          shouldPlaceImageLeft ? 'lg:flex-row-reverse' : 'lg:flex-row',
        )}
      >
        {/* Yellow Content - Left 50% */}
        <div
          className={cn('w-1/2 flex items-center', shouldPlaceImageLeft ? 'justify-start' : 'justify-end')}
          style={{
            backgroundColor: contentBackgroundColor,
          }}
        >
          <div
            className={cn(
              'w-full max-w-[680px] px-2 py-12',
              shouldPlaceImageLeft ? 'pl-12' : 'pr-12',
            )}
          >
            <div className={cn('w-full max-w-lg', shouldPlaceImageLeft ? 'mr-auto' : 'ml-auto')}>
              <div className={cn(
                'rte-content font-heading! mb-6! text-[22px]! leading-[24px]! lg:text-2xl!',
                normalizedTitleClasses
              )}>
                <RichText field={fields?.Title} />
              </div>
              <div className={cn(
                'rte-content font-body lg:pr-8 pxl:pr-12 mt-0! mb-[13px]! lg:mb-[24px]! xl:mb-[44px]! text-[17px]! leading-[26px]! hyphens-manual!',
                normalizedDescriptionClasses
              )}>
                <RichText field={fields?.Description} />
              </div>
              <Text tag="p" field={fields?.Signature} className="font-body text-[17px]" />
            </div>
          </div>
        </div>
        {/* Image section - Right 50% takes full width of right half */}
        <div className="w-1/2 overflow-hidden">
          {isReducedHeight ? (
            <div className="mx-auto w-full max-w-[680px]">
              <div className="h-[372px] w-full">
                <Image
                  field={fields?.Image}
                  alt={fields?.Image?.value?.alt}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="w-full">
              <Image
                field={fields?.Image}
                alt={fields?.Image?.value?.alt}
                className="h-auto w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Default: React.FC<QuoteHighlightProps> = (props) => (
  <QuoteHighlightLayout {...props} variant="default" />
);

export const ReducedlHeight: React.FC<QuoteHighlightProps> = (props) => (
  <QuoteHighlightLayout {...props} variant="reducedlHeight" />
);

export const LandingPage: React.FC<QuoteHighlightProps> = (props) => (
  <QuoteHighlightLayout {...props} variant="landingPage" />
);

export const LandingPageImageLeft: React.FC<QuoteHighlightProps> = (props) => (
  <QuoteHighlightLayout {...props} variant="landingPageImageLeft" />
);

export const CwsStyle: React.FC<QuoteHighlightProps> = (props) => (
  <QuoteHighlightLayout {...props} variant="cwsStyle" />
);

const QuoteHighlight: React.FC<QuoteHighlightProps> = (props) => {
  const variantParam = (
    props?.params?.Variant ||
    props?.rendering?.params?.Variant ||
    props?.rendering?.params?.FieldNames
  ) as string | undefined;
  const variant = normalizeVariant(variantParam);

  switch (variant) {
    case 'reducedlHeight':
      return <ReducedlHeight {...props} />;
    case 'landingPage':
      return <LandingPage {...props} />;
    case 'landingPageImageLeft':
      return <LandingPageImageLeft {...props} />;
    case 'cwsStyle':
      return <CwsStyle {...props} />;
    case 'default':
    default:
      return <Default {...props} />;
  }
};

Object.assign(QuoteHighlight, {
  Default,
  ReducedlHeight,
  LandingPage,
  LandingPageImageLeft,
  CwsStyle,
});

export default QuoteHighlight;

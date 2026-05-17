'use client';

import { useComponentProps, useSitecore } from '@sitecore-content-sdk/nextjs';
import { motion, useReducedMotion } from 'framer-motion';
import type { FC } from 'react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import type {
  LandingPageProductsTopPicksProps,
  TopPickHotspot,
  TopPickProduct,
  TopPickVariant,
} from './LandingPageProductsTopPicks.props';

const FONT = "'Suisse Intl', 'Helvetica Neue', Arial, sans-serif";

interface TopPicksData {
  title: string;
  lifestyleImage: { src: string; alt: string; width: number; height: number };
  hotspots: TopPickHotspot[];
  products: TopPickProduct[];
}

type LandingPageProductsTopPicksVariant = 'default' | 'largeSize' | 'extraLargeSize';

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

function getImageField(field: unknown): { src: string; alt: string; width: number; height: number } {
  if (typeof field === 'string') return { src: field, alt: '', width: 0, height: 0 };

  const obj = asRecord(field);
  if (!obj) return { src: '', alt: '', width: 0, height: 0 };

  const href = obj.href ?? obj.url;
  if (typeof href === 'string') return { src: href, alt: '', width: 0, height: 0 };

  const jsonValue = asRecord(obj.jsonValue);
  const imageValue = (asRecord(jsonValue?.value) ?? asRecord(obj.value)) as
    | { src?: string; alt?: string; width?: string | number; height?: string | number }
    | undefined;
  const width = Number(imageValue?.width) || 0;
  const height = Number(imageValue?.height) || 0;

  return {
    src: typeof imageValue?.src === 'string' ? imageValue.src : '',
    alt: typeof imageValue?.alt === 'string' ? imageValue.alt : '',
    width,
    height,
  };
}

function getImageSrc(field: unknown): string {
  return getImageField(field).src;
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

function getItemId(item: unknown): string {
  const obj = asRecord(item);
  if (!obj) return '';
  const id =
    obj.id ??
    obj.Id ??
    obj.itemId ??
    obj.ItemId ??
    (asRecord(obj.jsonValue)?.id as unknown) ??
    (asRecord(obj.jsonValue)?.Id as unknown);
  return typeof id === 'string' ? id : '';
}

function getItemName(item: unknown): string {
  const obj = asRecord(item);
  if (!obj) return '';
  const name =
    obj.displayName ??
    obj.DisplayName ??
    obj.name ??
    obj.Name ??
    obj.itemName ??
    obj.ItemName;
  return typeof name === 'string' ? name : '';
}

function htmlToHighlights(html: string | undefined): string[] {
  if (!html || typeof html !== 'string') return [];
  const matches = html.match(/<li[^>]*>([\s\S]*?)<\/li>/gi);
  if (!matches) return [];

  return matches
    .map((match) =>
      match
        .replace(/<\/?li[^>]*>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim(),
    )
    .filter(Boolean);
}

function getProductReferenceId(field: unknown): string {
  const obj = asRecord(field);
  if (!obj) return typeof field === 'string' ? field : '';

  const directId = getItemId(obj);
  if (directId) return directId;

  const targetItem =
    asRecord(obj.targetItem) ??
    asRecord(obj.TargetItem) ??
    asRecord(obj.item) ??
    asRecord(obj.Item);
  const targetId = getItemId(targetItem);
  if (targetId) return targetId;

  const valueObj = asRecord(obj.value);
  const valueId = getItemId(valueObj);
  if (valueId) return valueId;

  return '';
}

function getVariantKey(rawVariant: unknown, index: number, color: string): string {
  return getItemId(rawVariant) || `${color || 'variant'}-${index}`;
}

function findVariantByKey(
  product: TopPickProduct | undefined,
  variantKey: string | undefined,
): TopPickVariant | undefined {
  if (!product) return undefined;
  if (variantKey) {
    const matchedVariant = product.variants.find((variant) => variant.key === variantKey);
    if (matchedVariant) return matchedVariant;
  }
  return product.variants[0];
}

function mapSitecoreProduct(rawProduct: unknown): TopPickProduct {
  const product = unwrapItemFields(rawProduct);
  const name = getTextValue(product.title ?? product.Title);
  const highlightsHtml = getTextValue(
    product.highlights ?? product.Highlights ?? product.description ?? product.Description,
  );
  const highlights = htmlToHighlights(highlightsHtml);

  const variants = getTargetItems(
    product.variants ?? product.Variants ?? product.productVariants ?? product.ProductVariants,
  );

  const variantOptions: TopPickVariant[] = [];
  let imgSrc = getImageSrc(product.image ?? product.Image);

  variants.forEach((variantRaw, index) => {
    const variantItemName = getItemName(variantRaw);
    const variant = unwrapItemFields(variantRaw);
    const color =
      getTextValue(variant.variant ?? variant.Variant ?? variant.colors ?? variant.Colors) ||
      variantItemName;
    const variantImage =
      getImageSrc(variant.image ?? variant.Image ?? variant.colorImages ?? variant.ColorImages) ||
      getImageSrc(variant.imageLink ?? variant.ImageLink);

    const normalizedColor = color || `Variant ${index + 1}`;
    if (!imgSrc && variantImage) imgSrc = variantImage;

    variantOptions.push({
      key: getVariantKey(variantRaw, index, normalizedColor),
      color: normalizedColor,
      imageSrc: variantImage,
    });
  });

  const explicitDefaultColor = getTextValue(product.defaultColor ?? product.DefaultColor);
  const matchedDefaultVariant = explicitDefaultColor
    ? variantOptions.find(
        (variant) => variant.color.toLowerCase() === explicitDefaultColor.toLowerCase(),
      )
    : undefined;
  const fallbackVariant =
    matchedDefaultVariant ??
    variantOptions[0] ??
    (imgSrc || explicitDefaultColor
      ? {
          key: 'default',
          color: explicitDefaultColor || 'Default',
          imageSrc: imgSrc,
        }
      : undefined);
  const resolvedVariants = fallbackVariant ? (variantOptions.length > 0 ? variantOptions : [fallbackVariant]) : [];
  const defaultVariant = matchedDefaultVariant ?? resolvedVariants[0];
  const defaultColor = defaultVariant?.color ?? explicitDefaultColor;

  return {
    name,
    imgSrc,
    highlights,
    defaultColor,
    defaultVariantKey: defaultVariant?.key ?? '',
    variants: resolvedVariants,
  };
}

function mapSitecoreHotspot(
  rawHotspot: unknown,
  productIndexById: Record<string, number>,
  maxProductIndex: number,
): TopPickHotspot {
  const hotspot = unwrapItemFields(rawHotspot);

  const top = getTextValue(hotspot.top ?? hotspot.Top);
  const left = getTextValue(hotspot.left ?? hotspot.Left);
  const width = getTextValue(hotspot.width ?? hotspot.Width);
  const height = getTextValue(hotspot.height ?? hotspot.Height);

  const productRefId = getProductReferenceId(hotspot.product ?? hotspot.Product);
  const referencedProductIndex =
    typeof productRefId === 'string' ? productIndexById[productRefId] : undefined;

  const rawIndex = getPrimitiveValue(hotspot.productIndex ?? hotspot.ProductIndex);
  let productIndex =
    referencedProductIndex ??
    Number(rawIndex);

  if (Number.isNaN(productIndex)) {
    productIndex = 0;
  }

  if (maxProductIndex >= 0) {
    productIndex = Math.max(0, Math.min(productIndex, maxProductIndex));
  } else {
    productIndex = 0;
  }

  return {
    top,
    left,
    width,
    height,
    productIndex,
  };
}

function resolveTopPicks(datasource: Record<string, unknown> | undefined): TopPicksData {
  const ds = unwrapItemFields(datasource);

  const title = getTextValue(ds.title ?? ds.Title);
  const lifestyleImage = getImageField(ds.lifestyleImage ?? ds.LifestyleImage);

  const productsRaw = getTargetItems(ds.products ?? ds.Products);
  const productsWithIds = productsRaw.map((rawProduct) => ({
    id: getItemId(rawProduct),
    product: mapSitecoreProduct(rawProduct),
  }));

  const products = productsWithIds.map((entry) => entry.product);

  const productIndexById: Record<string, number> = {};
  productsWithIds.forEach((entry, index) => {
    if (entry.id) productIndexById[entry.id] = index;
  });

  const hotspotsRaw = getTargetItems(ds.hotspots ?? ds.Hotspots);
  const hotspots = hotspotsRaw.map((rawHotspot) =>
    mapSitecoreHotspot(rawHotspot, productIndexById, products.length - 1),
  );

  return {
    title,
    lifestyleImage,
    hotspots,
    products,
  };
}

function parsePercent(value: string): number | null {
  const parsed = Number.parseFloat(value.replace('%', '').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(value, 100));
}

function resolveHotspotPoint(
  hotspot: TopPickHotspot,
  imageAspectRatio: number,
): { top: string; left: string } {
  const top = parsePercent(hotspot.top);
  const left = parsePercent(hotspot.left);
  const width = parsePercent(hotspot.width);
  const height = parsePercent(hotspot.height);

  if (top === null || left === null) {
    return {
      top: hotspot.top,
      left: hotspot.left,
    };
  }

  if (imageAspectRatio > 1) {
    const projectedTop = clampPercent(top * imageAspectRatio);
    const lowerBodyBias = Math.max(0, top - 25) * 0.3;
    const projectedLeft = clampPercent(left + (width ?? 0) + lowerBodyBias);

    return {
      top: `${projectedTop}%`,
      left: `${projectedLeft}%`,
    };
  }

  return {
    top: `${clampPercent(top + (height ?? 0) / 2)}%`,
    left: `${clampPercent(left + (width ?? 0) / 2)}%`,
  };
}

/* ------------------------------------------------------------------ */
/*  Hotspot Marker                                                     */
/* ------------------------------------------------------------------ */

const HotspotMarker: FC<{
  hotspot: TopPickHotspot;
  imageAspectRatio: number;
  isActive: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}> = ({ hotspot, imageAspectRatio, isActive, onClick }) => {
  const prefersReducedMotion = useReducedMotion();
  const point = resolveHotspotPoint(hotspot, imageAspectRatio);

  const cycleDurationSeconds = 4;
  const pulsePhase = 1 / cycleDurationSeconds;

  const rippleColor = isActive ? 'var(--color-accent-primary)' : '#ffffff';

  const rippleAnimation = prefersReducedMotion
    ? undefined
    : {
        scale: [1, 1, 2.6],
        opacity: [0, 1, 0],
      };

  const rippleTransition = prefersReducedMotion
    ? undefined
    : {
        duration: cycleDurationSeconds,
        ease: 'easeOut' as const,
        times: [0, pulsePhase, 1],
        repeat: Infinity,
        repeatType: 'loop' as const,
      };

  const innerDotAnimation = prefersReducedMotion
    ? undefined
    : {
        scale: [1.1, 1, 1],
      };

  const innerDotTransition = prefersReducedMotion
    ? undefined
    : {
        duration: cycleDurationSeconds,
        ease: 'easeOut' as const,
        times: [0, pulsePhase, 1],
        repeat: Infinity,
        repeatType: 'loop' as const,
      };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group absolute cursor-pointer overflow-visible border-0 bg-transparent p-0"
      style={{
        top: point.top,
        left: point.left,
        width: '26px',
        height: '26px',
        transform: 'translate(-50%, -50%)',
      }}
      aria-label={`View product ${hotspot.productIndex + 1}`}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute left-1/2 top-1/2 h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2 rounded-full border',
          isActive ? 'border-[#ff4b2b]' : 'border-[rgba(34,34,56,0.7)]',
        )}
      />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[24px] w-[24px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        animate={rippleAnimation}
        transition={rippleTransition}
        style={{ border: `1.25px solid ${rippleColor}` }}
      />
      <motion.span
        aria-hidden="true"
        className={cn(
          'absolute left-1/2 top-1/2 h-[15px] w-[15px] -translate-x-1/2 -translate-y-1/2 rounded-full',
          isActive ? 'bg-(--color-accent-primary)' : 'bg-white',
          'transition-colors duration-300 group-hover:bg-(--color-accent-primary)',
        )}
        animate={innerDotAnimation}
        transition={innerDotTransition}
      />
    </button>
  );
};

/* ------------------------------------------------------------------ */
/*  Lifestyle Image with Hotspots                                      */
/* ------------------------------------------------------------------ */

const LifestylePanel: FC<{
  imageSrc: string;
  imageAlt: string;
  imageAspectRatio: number;
  imageHeightClass: string;
  hotspots: TopPickHotspot[];
  activeProduct: number;
  onSelectProduct: (idx: number, e: React.MouseEvent<HTMLButtonElement>) => void;
  isMobileTooltipOpen: boolean;
  onCloseMobileTooltip: () => void;
  mobileTooltipProduct?: TopPickProduct;
  mobileTooltipVariantKey: string;
  mobileTooltipImageSrc: string;
  onMobileTooltipVariantChange: (variantKey: string) => void;
  mobileTooltipPos: { top: number; left: number; anchorLeft: number } | null;
}> = ({
  imageHeightClass,
  imageSrc,
  imageAlt,
  imageAspectRatio,
  hotspots,
  activeProduct,
  onSelectProduct,
  isMobileTooltipOpen,
  onCloseMobileTooltip,
  mobileTooltipProduct,
  mobileTooltipVariantKey,
  mobileTooltipImageSrc,
  onMobileTooltipVariantChange,
  mobileTooltipPos,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const hasFixedImageHeight = Boolean(imageHeightClass);
  const [clampedPos, setClampedPos] = useState<{
    top: number;
    left: number;
    anchorLeft: number;
  } | null>(null);

  useEffect(() => {
    if (!isMobileTooltipOpen) {
      setClampedPos(null);
      return;
    }

    if (!mobileTooltipPos || !containerRef.current || !tooltipRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    const padding = 12;
    const minLeft = padding;
    const maxLeft = Math.max(padding, containerRect.width - tooltipRect.width - padding);

    const nextLeft = Math.min(Math.max(mobileTooltipPos.left, minLeft), maxLeft);
    const nextAnchorLeft = mobileTooltipPos.anchorLeft - nextLeft;

    setClampedPos({
      top: mobileTooltipPos.top,
      left: nextLeft,
      anchorLeft: nextAnchorLeft,
    });
  }, [isMobileTooltipOpen, mobileTooltipPos]);

  const resolvedPos = clampedPos ?? mobileTooltipPos;

  return (
    <div
      ref={containerRef}
      data-lifestyle-panel
      className="relative z-30 overflow-visible pb-12 lg:pb-0"
    >
      <div
        className={cn(
          'relative mx-auto w-full max-w-[400px] overflow-hidden lg:mx-0 lg:max-w-none',
          imageHeightClass,
        )}
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="lazy"
          className={cn(
            'block w-full',
            hasFixedImageHeight ? 'h-full object-cover' : 'h-auto object-contain',
          )}
        />
        {hotspots.map((hotspot, idx) => (
          <HotspotMarker
            key={idx}
            hotspot={hotspot}
            imageAspectRatio={imageAspectRatio}
            isActive={activeProduct === hotspot.productIndex}
            onClick={(e) => onSelectProduct(hotspot.productIndex, e)}
          />
        ))}
      </div>

      {isMobileTooltipOpen && mobileTooltipProduct && resolvedPos && (
        <div
          ref={tooltipRef}
          className="absolute z-9999 w-[calc(100%-32px)] max-w-[360px] border border-black bg-white shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
          style={{ top: resolvedPos.top, left: resolvedPos.left }}
        >
        <div
          className="absolute -top-[16px] h-0 w-0 border-l-14 border-r-14 border-b-16 border-l-transparent border-r-transparent border-b-black"
          style={{ left: `clamp(16px, ${resolvedPos.anchorLeft}px, calc(100% - 16px))`, transform: 'translateX(-50%)' }}
          aria-hidden="true"
        />
        <div
          className="absolute -top-[15px] h-0 w-0 border-l-13 border-r-13 border-b-15 border-l-transparent border-r-transparent border-b-white"
          style={{ left: `clamp(16px, ${resolvedPos.anchorLeft}px, calc(100% - 16px))`, transform: 'translateX(-50%)' }}
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={onCloseMobileTooltip}
          className="absolute right-[8px] top-[8px] cursor-pointer border-0 bg-transparent p-0 text-[16px] leading-none text-[#8f8f8f]"
          aria-label="Close"
        >
          ×
        </button>
        <div className="p-[16px] pr-[32px] pt-[16px]">
          <div className=" flex items-start gap-[12px] py-3">
            <div className="w-[72px] shrink-0 overflow-hidden bg-white">
              <img
                src={mobileTooltipImageSrc}
                alt={mobileTooltipProduct.name}
                loading="lazy"
                className="block h-auto w-full object-contain"
                style={{ aspectRatio: '3 / 4' }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div
                className="mb-[8px] text-[14px] leading-[18px] text-black"
                style={{ fontFamily: FONT, fontWeight: 700 }}
              >
                {mobileTooltipProduct.name}
              </div>
              <ul className="m-0 mb-[12px] list-disc pl-[16px]">
                {mobileTooltipProduct.highlights.map((highlight, i) => (
                  <li
                    key={i}
                    className="mb-0 text-[11px] leading-[15px] text-black"
                    style={{ fontFamily: FONT }}
                  >
                    {highlight}
                  </li>
                ))}
              </ul>
              <div className="relative w-full">
                <select
                  className={cn(
                    'h-[34px] w-full appearance-none rounded-[2px] bg-white',
                    'border-2 border-black',
                    'px-[10px] pr-[26px] text-[13px] leading-[16px] text-black',
                  )}
                  style={{ fontFamily: FONT }}
                  value={mobileTooltipVariantKey}
                  onChange={(e) => onMobileTooltipVariantChange(e.target.value)}
                >
                  {mobileTooltipProduct.variants.map((variant, i) => (
                    <option key={variant.key || i} value={variant.key}>
                      {variant.color}
                    </option>
                  ))}
                </select>
                <svg
                  className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2"
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                >
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Product Image Panel (with yellow left accent)                      */
/* ------------------------------------------------------------------ */

const ProductImagePanel: FC<{ product: TopPickProduct; imageSrc: string }> = ({
  product,
  imageSrc,
}) => (
  <div className="flex h-full">
    {/* Yellow accent bar — 4px matches source visual */}
    <div className="w-[15px] shrink-0 bg-(--color-accent-primary)" />
    {/* Product image on gray bg */}
    <div className="flex flex-1 items-center justify-center bg-[#b8b8b8] px-[17px]">
      <img
        src={imageSrc}
        alt={product.name}
        loading="lazy"
        className="h-auto max-h-full w-auto max-w-full object-contain"
      />
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Product Details Panel                                              */
/* ------------------------------------------------------------------ */

const ProductDetailsPanel: FC<{
  product: TopPickProduct;
  selectedVariantKey: string;
  onVariantChange: (variantKey: string) => void;
}> = ({ product, selectedVariantKey, onVariantChange }) => (
  <div className="flex h-full flex-col justify-end pb-0">
    {/* Product name — source: 15px, weight 400, margin-bottom 10px */}
    <p
      className="m-0 mb-[10px] text-[15px] leading-[20px]"
      style={{ fontFamily: FONT, fontWeight: 400 }}
    >
      {product.name}
    </p>

    {/* Highlights — source: 12px / 17px, margin-bottom 20px */}
    <ul className="m-0 mb-[20px] list-disc pl-[18px]">
      {product.highlights.map((highlight, idx) => (
        <li
          key={idx}
          className="mb-0 text-[12px] leading-[17px] text-black"
          style={{ fontFamily: FONT }}
        >
          {highlight}
        </li>
      ))}
    </ul>

    {/* Color selector — source: full width, height 34px, font 14px */}
    <div className="relative w-full">
      <select
        className={cn(
          'h-[34px] w-full appearance-none rounded-[4px] border-2 border-black bg-white',
          'px-[10px] pr-[24px] text-[14px] text-black',
        )}
        style={{ fontFamily: FONT }}
        value={selectedVariantKey}
        onChange={(e) => onVariantChange(e.target.value)}
      >
        {product.variants.map((variant, idx) => (
          <option key={variant.key || idx} value={variant.key}>
            {variant.color}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2"
        width="12"
        height="8"
        viewBox="0 0 12 8"
        fill="none"
      >
        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

const LandingPageProductsTopPicksLayout = memo(function LandingPageProductsTopPicksLayout(
  props: LandingPageProductsTopPicksProps & { variant: LandingPageProductsTopPicksVariant },
) {
  const { variant } = props;
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing;

  const imageHeightClass =
    variant === 'largeSize' ? 'h-[500px]' : variant === 'extraLargeSize' ? 'h-[600px]' : '';

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

  const { title, lifestyleImage, hotspots, products } = useMemo(
    () => resolveTopPicks(datasource),
    [datasource],
  );
  const lifestyleImageAspectRatio =
    lifestyleImage.width > 0 && lifestyleImage.height > 0
      ? lifestyleImage.height / lifestyleImage.width
      : 1;

  const hasSitecoreData = Boolean(
    datasource &&
      (title || lifestyleImage.src || hotspots.length > 0 || products.length > 0),
  );

  const [activeProduct, setActiveProduct] = useState(0);
  const [isTooltipViewport, setIsTooltipViewport] = useState(false);
  const [mobileTooltipOpen, setMobileTooltipOpen] = useState(false);
  const [mobileTooltipPos, setMobileTooltipPos] = useState<{
    top: number;
    left: number;
    anchorLeft: number;
  } | null>(null);
  const [selectedVariantKeys, setSelectedVariantKeys] = useState<Record<number, string>>({});

  const handleVariantChange = useCallback((productIdx: number, variantKey: string) => {
    setSelectedVariantKeys((prev) => ({ ...prev, [productIdx]: variantKey }));
  }, []);

  useEffect(() => {
    const nextVariantKeys = Object.fromEntries(
      products.map((product, index) => [
        index,
        product.defaultVariantKey || product.variants[0]?.key || '',
      ]),
    ) as Record<number, string>;
    setSelectedVariantKeys(nextVariantKeys);
    setActiveProduct((current) =>
      products.length > 0 ? Math.max(0, Math.min(current, products.length - 1)) : 0,
    );
    setMobileTooltipOpen(false);
  }, [products]);

  const currentProduct = products[activeProduct];
  const currentVariant = findVariantByKey(
    currentProduct,
    selectedVariantKeys[activeProduct] ?? currentProduct?.defaultVariantKey,
  );
  const currentVariantKey = currentVariant?.key ?? currentProduct?.defaultVariantKey ?? '';
  const currentImageSrc = currentVariant?.imageSrc || currentProduct?.imgSrc || '';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsTooltipViewport(mq.matches);
    update();

    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (isPageEditing && !hasSitecoreData) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
        <p className="text-lg font-semibold">Landing Page Products Top Picks</p>
        <p className="text-sm">Component placeholder — configure in Sitecore</p>
      </div>
    );
  }

  if (!isPageEditing && products.length === 0) {
    return null;
  }

  return (
    <section data-component="LandingPageProductsTopPicks">
      <div className="cws-container mx-auto w-full max-w-[1360px] px-[8px] py-[10px] lg:px-[16px] xl:px-[10px] my-10 lg:my-14">
        {/* Section title */}
        <h2
          className="m-0 mb-[38px] text-[28px] font-bold leading-[34px]"
          style={{ fontFamily: FONT }}
        >
          {title}
        </h2>

        {/* Source layout: lifestyle 400px | 27px gap | product-image 400px + text 513px (pl-24) */}
        {/* As percentages of 1340: 29.85% | 2% gap | 29.85% | 38.3% */}
        {/* Responsive: <lg (tooltip only) | lg+ (full 3-column horizontal) */}
        <div className="flex flex-row items-stretch gap-0">
          {/* Column 1: Lifestyle image — always visible, 29.85% at lg+ */}
          <div className="w-full shrink-0 lg:w-[29.85%]">
            <LifestylePanel
              imageSrc={lifestyleImage.src}
              imageAlt={lifestyleImage.alt}
              imageAspectRatio={lifestyleImageAspectRatio}
              imageHeightClass={imageHeightClass}
              hotspots={hotspots}
              activeProduct={activeProduct}
              onSelectProduct={(idx, e) => {
                const safeIndex = products.length > 0 ? Math.max(0, Math.min(idx, products.length - 1)) : 0;
                setActiveProduct(safeIndex);

                if (!isTooltipViewport) return;

                const buttonRect = e.currentTarget.getBoundingClientRect();
                const containerEl = e.currentTarget.closest('[data-lifestyle-panel]') as HTMLElement | null;
                const containerRect = containerEl?.getBoundingClientRect();

                if (!containerRect) return;

                const anchorX = buttonRect.left + buttonRect.width / 2 - containerRect.left;
                const anchorY = buttonRect.bottom - containerRect.top;

                const tooltipWidthGuess = Math.min(containerRect.width - 24, 420);

                setMobileTooltipPos({
                  top: anchorY + 8,
                  left: anchorX - tooltipWidthGuess / 2,
                  anchorLeft: anchorX,
                });
                setMobileTooltipOpen(true);
              }}
              isMobileTooltipOpen={isTooltipViewport && mobileTooltipOpen}
              onCloseMobileTooltip={() => setMobileTooltipOpen(false)}
              mobileTooltipProduct={currentProduct}
              mobileTooltipVariantKey={currentVariantKey}
              mobileTooltipImageSrc={currentImageSrc}
              onMobileTooltipVariantChange={(variantKey) =>
                handleVariantChange(activeProduct, variantKey)
              }
              mobileTooltipPos={mobileTooltipPos}
            />
          </div>

          {/* Column 2: Product image — hidden below lg, visible lg+ at 29.85% with 27px left gap */}
          {currentProduct && (
            <div
              className={cn(
                'hidden lg:block lg:ml-[27px] lg:w-[29.85%] lg:shrink-0 lg:overflow-hidden',
                imageHeightClass,
              )}
              style={{ aspectRatio: '3 / 2' }}
            >
              <ProductImagePanel product={currentProduct} imageSrc={currentImageSrc} />
            </div>
          )}

          {/* Column 3: Product details — hidden below lg, visible lg+ as flex-1 with pl-24 */}
          {currentProduct && (
            <div className="hidden lg:flex lg:flex-1 lg:items-end lg:pl-[24px]">
              <div className="max-w-[342px]">
                <ProductDetailsPanel
                  product={currentProduct}
                  selectedVariantKey={currentVariantKey}
                  onVariantChange={(variantKey) => handleVariantChange(activeProduct, variantKey)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

export const Default: FC<LandingPageProductsTopPicksProps> = (props) => (
  <LandingPageProductsTopPicksLayout {...props} variant="default" />
);

export const LargeSize: FC<LandingPageProductsTopPicksProps> = (props) => (
  <LandingPageProductsTopPicksLayout {...props} variant="largeSize" />
);

export const ExtraLargeSize: FC<LandingPageProductsTopPicksProps> = (props) => (
  <LandingPageProductsTopPicksLayout {...props} variant="extraLargeSize" />
);

export async function getComponentServerProps(
  rendering: { fields?: Record<string, unknown> },
): Promise<{ fields?: Record<string, unknown> }> {
  const fields = rendering?.fields;
  if (!fields) return {};
  return { fields };
}

export default Default;

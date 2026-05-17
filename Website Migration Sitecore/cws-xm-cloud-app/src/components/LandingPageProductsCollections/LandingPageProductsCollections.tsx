'use client';

import { useSitecore, useComponentProps } from '@sitecore-content-sdk/nextjs';
import type { FC, ReactNode } from 'react';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import type {
  LandingPageProductsCollectionsProps,
  SitecoreTabItem,
  CollectionTab,
  ProductItem,
  ProductVariantOption,
} from './LandingPageProductsCollections.props';

type LandingPageProductsCollectionsVariant = 'default' | 'rightAlign';

/** Extracts list item text from HTML (e.g. <ul><li>...</li></ul>) */
function htmlToHighlights(html: string | undefined): string[] {
  if (!html || typeof html !== 'string') return [];
  const matches = html.match(/<li>([\s\S]*?)<\/li>/gi);

  const normalize = (text: string) =>
    text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();

  if (matches?.length) {
    return matches
      .map((m) => normalize(m.replace(/<\/?li>/gi, '').replace(/<[^>]+>/g, '')))
      .filter(Boolean);
  }

  const textWithBreaks = html
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/\s*(p|div|section|article|h\d)\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ');

  const rawParts = textWithBreaks
    .split(/\n|•|\u2022/g)
    .map((s) => normalize(s))
    .filter(Boolean);

  if (rawParts.length > 1) return rawParts;

  const single = normalize(textWithBreaks);
  return single ? [single] : [];
}

/** Extracts image src – accepts a link/URL string or object with href, url, or jsonValue.value.src */
function getImageSrc(imgField: unknown): string {
  if (!imgField) return '';
  if (typeof imgField === 'string') return imgField;
  if (typeof imgField !== 'object') return '';
  const obj = imgField as Record<string, unknown>;

  const direct = obj.href ?? obj.url ?? obj.src;
  if (typeof direct === 'string') return direct;

  const val =
    obj.jsonValue && typeof obj.jsonValue === 'object'
      ? (obj.jsonValue as Record<string, unknown>).value
      : obj.value;

  if (typeof val === 'string') return val;

  if (val && typeof val === 'object') {
    const v = val as Record<string, unknown>;
    const vDirect = v.href ?? v.url ?? v.src;
    if (typeof vDirect === 'string') return vDirect;

    const nestedValue = v.value;
    if (typeof nestedValue === 'string') return nestedValue;
    if (nestedValue && typeof nestedValue === 'object') {
      const nv = nestedValue as Record<string, unknown>;
      const nvDirect = nv.href ?? nv.url ?? nv.src;
      if (typeof nvDirect === 'string') return nvDirect;
    }
  }

  return '';
}

/** Maps Sitecore product to ProductItem. Title and description from product; image and dropdown from productVariants. */
function mapSitecoreProductToItem(p: Record<string, unknown>): ProductItem {
  const titleVal = (p.title ?? p.Title) as { value?: string } | undefined;
  const descVal = (p.description ?? p.Description) as { value?: string } | undefined;
  const variantsField = (p.productVariants ?? p.ProductVariants) as
    | { targetItems?: Array<Record<string, unknown>> }
    | undefined;
  const variants = variantsField?.targetItems ?? [];

  const colors: string[] = [];
  const colorImages: Record<string, string> = {};
  const variantOptions: ProductVariantOption[] = [];
  let imgSrc = getImageSrc(p.image ?? p.Image);
  let defaultColor = '';
  let defaultVariantKey = '';

  variants.forEach((v, variantIndex) => {
    const variantVal = (v.variant ?? v.Variant ?? v.colors ?? v.Colors) as
      | { value?: string }
      | undefined;
    const color = variantVal?.value ?? '';
    if (color) colors.push(color);
    if (!defaultColor) defaultColor = color;

    const variantImg =
      getImageSrc(v.image ?? v.Image ?? v.colorImages ?? v.ColorImages) ||
      getImageSrc(v.imageLink ?? v.ImageLink);
    const variantKey = `${color || 'variant'}-${variantIndex}`;

    variantOptions.push({
      key: variantKey,
      label: color,
      imageSrc: variantImg || undefined,
    });
    if (!defaultVariantKey) defaultVariantKey = variantKey;

    if (variantImg) {
      if (color && !(color in colorImages)) {
        colorImages[color] = variantImg;
      }
      if (!imgSrc) imgSrc = variantImg;
    }
  });

  const highlights = htmlToHighlights(descVal?.value);
  const name = titleVal?.value ?? '';

  return {
    name,
    imgSrc,
    highlights,
    defaultColor: (defaultColor || colors[0]) ?? '',
    defaultVariantKey,
    colors: colors.length > 0 ? colors : [''],
    colorImages: Object.keys(colorImages).length > 0 ? colorImages : undefined,
    variantOptions: variantOptions.length > 0 ? variantOptions : undefined,
  };
}

/** Maps Sitecore tab to CollectionTab */
function mapSitecoreTabToCollection(tab: SitecoreTabItem | Record<string, unknown>): CollectionTab {
  const t = tab as Record<string, unknown>;
  const imgField = (t.image ?? t.Image) as SitecoreTabItem['image'];
  const imgVal = imgField?.jsonValue?.value;
  const productsField = (t.products ?? t.Products) as
    | { targetItems?: unknown[]; results?: unknown[]; children?: unknown[] }
    | unknown[]
    | undefined;
  const productsRaw = Array.isArray(productsField)
    ? productsField
    : productsField?.targetItems ?? productsField?.results ?? productsField?.children ?? [];

  const products: ProductItem[] = Array.isArray(productsRaw)
    ? (productsRaw as Record<string, unknown>[])
        .filter((p) => p != null && typeof p === 'object')
        .map((p) => mapSitecoreProductToItem(p))
    : [];

  const titleField = (t.title ?? t.Title) as { value?: string } | undefined;
  const descField = (t.description ?? t.Description) as { value?: string } | undefined;

  return {
    label: titleField?.value ?? '',
    description: descField?.value ?? '',
    mainImage: {
      src: imgVal?.src ?? '',
      alt: imgVal?.alt ?? '',
    },
    products,
  };
}

/** Resolves title + collections from Sitecore datasource */
function resolveCollections(datasource: Record<string, unknown> | undefined): {
  title: string;
  collections: CollectionTab[];
} {
  const ds = datasource as Record<string, unknown> | undefined;
  if (!ds) return { title: '', collections: [] };

  const titleVal =
    (ds.title as { value?: string })?.value ?? (ds.Title as { value?: string })?.value ?? '';
  const tabsField = (ds.tabs ?? ds.Tabs) as { targetItems?: unknown[] } | undefined;
  const tabItems = tabsField?.targetItems ?? [];

  if (tabItems.length === 0) {
    return { title: titleVal, collections: [] };
  }

  const collections: CollectionTab[] = (
    tabItems as (SitecoreTabItem | Record<string, unknown>)[]
  ).map((tab) => mapSitecoreTabToCollection(tab));

  return {
    title: titleVal,
    collections,
  };
}

const LEFT_ARROW_ICON =
  'https://www.cws.com/themes/custom/cwsdesign/assets/images/icons/ww-arrow-white-triangle-left.svg';
const RIGHT_ARROW_ICON =
  'https://www.cws.com/themes/custom/cwsdesign/assets/images/icons/ww-arrow-white-triangle-right.svg';

const DescriptionText: FC<{ text: string; boldTerm: string }> = ({ text, boldTerm }) => {
  if (!boldTerm || !text.includes(boldTerm)) return <>{text}</>;

  const parts: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.includes(boldTerm)) {
    const index = remaining.indexOf(boldTerm);
    if (index > 0) parts.push(remaining.slice(0, index));
    parts.push(
      <strong key={key++} className="font-bold">
        {boldTerm}
      </strong>,
    );
    remaining = remaining.slice(index + boldTerm.length);
  }

  if (remaining) parts.push(remaining);
  return <>{parts}</>;
};

const CollectionDescription: FC<{ collection: CollectionTab; className?: string }> = ({
  collection,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setExpanded(false);
    setHasOverflow(false);
  }, [collection.label]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const element = textRef.current;
      if (!element) return;
      setHasOverflow(element.scrollHeight > element.clientHeight + 1);
    });

    return () => cancelAnimationFrame(frame);
  }, [collection.label]);

  return (
    <div className={cn('text-[13px] leading-[18px] text-black', className)}>
      <p
        ref={textRef}
        className={cn(
          'font-regular m-0',
          !expanded && 'max-h-[90px] overflow-hidden lg:max-h-none',
        )}
      >
        <DescriptionText text={collection.description} boldTerm={collection.label} />
      </p>
      {hasOverflow && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="font-regular mt-[4px] block border-none bg-transparent p-0 text-[13px] leading-[18px] text-black underline underline-offset-[5px] lg:hidden"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
};

const ProductCard: FC<{ product: ProductItem; index: number; slideWidth: number }> = memo(({
  product,
  index,
  slideWidth,
}) => {
  const variantOptions = useMemo(
    () =>
      product.variantOptions?.length
        ? product.variantOptions
        : product.colors.map((color, colorIndex) => ({
            key: `${product.name}-color-${colorIndex}`,
            label: color,
            imageSrc: product.colorImages?.[color],
          })),
    [product.colorImages, product.colors, product.name, product.variantOptions],
  );
  const defaultVariantKey =
    product.defaultVariantKey ||
    variantOptions.find((option) => option.label === product.defaultColor)?.key ||
    variantOptions[0]?.key ||
    '';
  const [selectedVariantKey, setSelectedVariantKey] = useState(defaultVariantKey);

  useEffect(() => {
    setSelectedVariantKey(defaultVariantKey);
  }, [defaultVariantKey, product.name]);

  const mainProductImage = product.imgSrc;
  const selectedVariant = variantOptions.find((option) => option.key === selectedVariantKey);
  const variantImage =
    selectedVariant?.imageSrc ||
    (selectedVariant?.label && product.colorImages?.[selectedVariant.label]) ||
    product.colorImages?.[product.defaultColor];
  const primaryProductImage = variantImage || mainProductImage;

  return (
    <div
      className={cn(
        'shrink-0 border-r border-[#b8b8b8] px-[20px] py-[20px]',
        index === 0 && 'border-l border-[#b8b8b8]',
      )}
      style={{ width: `${slideWidth}px` }}
    >
      {/* Vertical layout: Image (top) → Title → Content → Dropdown (bottom) */}
      <div className="flex h-full flex-col">
        {/* 1. Product image at top - max 300x200px */}
        <div className="mb-4 flex w-full items-center justify-center">
          <div className="relative h-[130px] w-full max-w-[260px]">
            {primaryProductImage ? (
              <img
                src={primaryProductImage}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-contain"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center bg-[#f5f5f5] text-[12px] text-[#999]"
                aria-hidden
              >
                {product.name}
              </div>
            )}
          </div>
        </div>

        {/* 2. Product title */}
        <div className="mb-3 text-[16px] font-semibold leading-[22px] text-black">
          {product.name}
        </div>

        {/* 3. Bullet points / highlights */}
        <div className="font-regular mb-4 flex-1 min-h-0 max-h-[170px] overflow-hidden text-[12px] leading-[17px]">
          <ul className="m-0 list-disc pl-[20px] text-[12px] leading-[17px]!">
            {product.highlights.map((highlight, highlightIndex) => (
              <li
                key={`${product.name}-highlight-${highlightIndex}`}
                className="mb-1 text-[12px] leading-[17px] text-black"
              >
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Color dropdown at bottom */}
        {variantOptions.length > 0 && variantOptions[0]?.label !== '' && (
          <div className="mt-auto w-full max-w-[440px] lg:max-w-none">
            <div className="m-0 w-full border border-[#b8b8b8]">
              <div className="relative m-0 w-full border-none p-0 leading-[1]">
                <select
                  value={selectedVariantKey}
                  onChange={(event) => setSelectedVariantKey(event.target.value)}
                  className="font-regular inline-block h-[34px] w-full appearance-none border bg-transparent px-[10px] pt-[8px] pr-[24px] pb-[4px] text-[14px] leading-[14px] text-black focus:outline-none"
                >
                  {variantOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute top-1/2 right-[9px] h-[8px] w-[12px] -translate-y-1/2">
                  <svg
                    viewBox="0 0 12 8"
                    width="12"
                    height="8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 1.5L6 6.5L11 1.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

const ProductSlider: FC<{
  products: ProductItem[];
  isActive: boolean;
  className?: string;
}> = memo(({ products, isActive, className }) => {
  if (products.length === 0) return null;

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [scrollCompletion, setScrollCompletion] = useState(0);
  const [slideWidth, setSlideWidth] = useState(312);
  const [desktopPanelHeight, setDesktopPanelHeight] = useState<number | null>(null);

  const updateSlideWidth = useCallback(() => {
    const element = scrollRef.current;
    if (!element || typeof window === 'undefined') return;

    const slidesToShow = window.innerWidth < 1024 ? 1.2 : 2.5;
    setSlideWidth(Math.ceil(element.clientWidth / slidesToShow));
  }, []);

  const updateDesktopPanelHeight = useCallback(() => {
    const element = scrollRef.current;
    if (!element || typeof window === 'undefined') return;

    if (window.innerWidth < 1024) {
      setDesktopPanelHeight(null);
      return;
    }

    const panel = element.closest<HTMLElement>('[data-products-collections-panel]');
    const referenceImage = panel?.querySelector<HTMLImageElement>('[data-products-collections-image]');
    if (!referenceImage) {
      setDesktopPanelHeight(null);
      return;
    }

    const { width } = referenceImage.getBoundingClientRect();
    setDesktopPanelHeight(width > 0 ? width : null);
  }, []);

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth);
    const left = element.scrollLeft;

    setCanScrollLeft(left > 2);
    setCanScrollRight(left < maxScroll - 2);
    setScrollCompletion(
      element.scrollWidth > 0
        ? Math.min(1, Math.max(0, (left + element.clientWidth) / element.scrollWidth))
        : 0,
    );
  }, []);

  useEffect(() => {
    if (!isActive) return;

    updateSlideWidth();
    updateDesktopPanelHeight();
    updateScrollState();
    window.addEventListener('resize', updateSlideWidth);
    window.addEventListener('resize', updateDesktopPanelHeight);
    window.addEventListener('resize', updateScrollState);

    const element = scrollRef.current;
    const observer = new ResizeObserver(() => {
      updateSlideWidth();
      updateDesktopPanelHeight();
      updateScrollState();
    });
    if (element) observer.observe(element);

    return () => {
      window.removeEventListener('resize', updateSlideWidth);
      window.removeEventListener('resize', updateDesktopPanelHeight);
      window.removeEventListener('resize', updateScrollState);
      observer.disconnect();
    };
  }, [isActive, updateDesktopPanelHeight, updateScrollState, updateSlideWidth, products]);

  const handleScroll = useCallback(
    (direction: 'left' | 'right') => {
      const element = scrollRef.current;
      if (!element) return;

      const amount = Math.max(260, Math.round(element.clientWidth * 0.85));
      element.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' });
    },
    [],
  );

  const progressWidthDesktop = useMemo(() => scrollCompletion * 100, [scrollCompletion]);

  const isInteracting = isHovered || isFocused;

  const showPrevArrow = isInteracting && canScrollLeft;
  const showNextArrow = isInteracting && canScrollRight;

  return (
    <>
      <div
        className={cn(
          'relative mt-[18px] w-full max-w-full lg:mt-0',
          className,
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocusCapture={() => setIsFocused(true)}
        onBlurCapture={() => setIsFocused(false)}
        style={
          desktopPanelHeight
            ? { height: `${desktopPanelHeight}px`, maxHeight: `${desktopPanelHeight}px` }
            : undefined
        }
      >
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:h-full"
          data-product-slider
        >
          <div className="flex border-t border-b border-[#b8b8b8] lg:h-full">
            {products.map((product, index) => (
              <ProductCard
                key={`${product.name}-${index}`}
                product={product}
                index={index}
                slideWidth={slideWidth}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleScroll('left')}
          aria-label="Previous products"
          aria-disabled={!canScrollLeft}
          className={cn(
            'absolute top-1/2 left-[16px] z-10 h-[70px] w-[70px] -translate-y-1/2 cursor-pointer overflow-hidden rounded-full border-none bg-black p-0 transition-all duration-400 lg:left-[31px]',
            showPrevArrow ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <span
            className="absolute top-[23px] left-[21px] block h-[24px] w-[24px] bg-contain bg-center bg-no-repeat lg:left-[21px]"
            style={{ backgroundImage: `url(${LEFT_ARROW_ICON})` }}
          />
        </button>

        <button
          type="button"
          onClick={() => handleScroll('right')}
          aria-label="Next products"
          aria-disabled={!canScrollRight}
          className={cn(
            'absolute top-1/2 right-[16px] z-10 h-[70px] w-[70px] -translate-y-1/2 cursor-pointer overflow-hidden rounded-full border-none bg-black p-0 transition-all duration-400 lg:right-[31px]',
            showNextArrow ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          <span
            className="absolute top-[24px] left-[24px] block h-[24px] w-[24px] bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${RIGHT_ARROW_ICON})` }}
          />
        </button>
      </div>

      <div
        className={cn(
          'absolute bottom-[-26px] left-0 mt-[26px] block h-[3px] w-full overflow-hidden rounded-[10px] bg-[rgba(0,0,0,0.12)] transition-opacity duration-400',
          isInteracting ? 'opacity-100' : 'lg:opacity-0',
        )}
      >
        <div
          className="block h-[3px] rounded-[10px] bg-[rgba(0,0,0,0.35)] transition-[width,transform] duration-400"
          style={{ width: `${progressWidthDesktop}%`, transform: 'translateX(0%)' }}
        />
      </div>
    </>
  );
});

ProductSlider.displayName = 'ProductSlider';

const TabPanel: FC<{
  collection: CollectionTab;
  isActive: boolean;
  pid: string;
  variant: LandingPageProductsCollectionsVariant;
}> = memo(({
  collection,
  isActive,
  pid,
  variant,
}) => {
  if (!isActive) return null;

  const isRightAlign = variant === 'rightAlign';

  return (
    <div data-products-collections-panel data-tab-pid={pid}>
      {/* Description text - appears above the main content */}
      <div className={cn('mb-6 max-w-[450px]', isRightAlign && 'lg:ml-auto')}>
        <CollectionDescription collection={collection} />
      </div>

      {/* Main content: Image (left) and ProductSlider (right) side-by-side with equal heights */}
      <div
        className={cn(
          'flex flex-col gap-6 lg:items-stretch',
          isRightAlign ? 'lg:flex-row-reverse' : 'lg:flex-row',
        )}
      >
        {/* Left: Main image */}
        <div className="shrink-0 lg:w-[450px]">
          <div className="w-full h-full flex items-start max-w-[450px] max-h-[450px]">
            <img
              src={collection.mainImage.src}
              alt={collection.mainImage.alt}
              loading="lazy"
              data-products-collections-image
              className="w-full h-full  object-center object-cover"
            />
          </div>
        </div>

        {/* Right: Product slider */}
        <div className="flex-1 min-w-0">
          <ProductSlider
            products={collection.products}
            isActive={isActive}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
});

TabPanel.displayName = 'TabPanel';

const LandingPageProductsCollectionsLayout = memo(function LandingPageProductsCollectionsLayout(
  props: LandingPageProductsCollectionsProps & { variant: LandingPageProductsCollectionsVariant },
) {
  const { variant } = props;
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing;

  const [activeTab, setActiveTab] = useState(0);
  const [isTabContentVisible, setIsTabContentVisible] = useState(true);

  const handleTabChange = useCallback((index: number) => {
    setIsTabContentVisible(false);
    setActiveTab(index);
  }, []);

  useEffect(() => {
    if (isPageEditing) {
      setIsTabContentVisible(true);
      return;
    }

    const id = window.setTimeout(() => {
      setIsTabContentVisible(true);
    }, 50);

    return () => {
      window.clearTimeout(id);
    };
  }, [activeTab, isPageEditing]);

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
  const { title, collections } = resolveCollections(datasource);

  const hasSitecoreData =
    datasource &&
    ((datasource.tabs as { targetItems?: unknown[] })?.targetItems?.length ?? 0) > 0;

  if (isPageEditing && !hasSitecoreData) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
        <p className="text-lg font-semibold">Landing Page Products Collections</p>
        <p className="text-sm">Component placeholder — configure in Sitecore</p>
      </div>
    );
  }

  if (!isPageEditing && collections.length === 0) {
    return null;
  }

  return (
    <section
      data-component="LandingPageProductsCollections"
      className="font-regular  relative mx-auto mb-[78px] w-full max-w-[1360px] px-[8px] text-[17px] leading-[25px] text-black lg:px-[16px] lg:leading-[28px] xl:px-[10px]"
    >
      <div>
        <h3 className="my-[22px] text-[22px] leading-[28px] text-black font-bold sm:my-[28px] sm:text-[28px] sm:leading-[36px]">
          {title}
        </h3>
      </div>

      <div className="-mx-[15px] mb-[10px] flex w-max max-w-[calc(100%+30px)] flex-nowrap items-center justify-start overflow-x-auto [scrollbar-width:thin] [scrollbar-color:#b8b8b8_#ebebeb] [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar-track]:bg-[#ebebeb] [&::-webkit-scrollbar-thumb]:bg-[#b8b8b8] [&::-webkit-scrollbar-thumb]:rounded-full lg:mb-[2px] lg:w-[calc(100%+30px)] lg:flex-wrap">
        {collections.map((tab, index) => (
          <button
            key={`${tab.label}-${index}`}
            type="button"
            className={cn(
              'mx-[15px] my-[15px] grow shrink-0 cursor-pointer border px-[25px] pt-[7px] pb-[5px] text-center text-[17px] leading-[22px] transition-all duration-400 lg:basis-[calc(25%-30px)] lg:grow-0 lg:px-0 font-bold',
              index === activeTab
                ? 'active border-black bg-black text-white'
                : 'border-[#b8b8b8] bg-transparent text-[#b8b8b8] hover:border-black hover:bg-black hover:text-white',
            )}
            onClick={() => handleTabChange(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className="transition-opacity ease-in-out"
        style={{
          opacity: isTabContentVisible ? 1 : 0,
          transitionDuration: isTabContentVisible ? '800ms' : '0ms',
        }}
      >
        {collections[activeTab] && (
          <TabPanel
            key={`${collections[activeTab].label}-${activeTab}`}
            collection={collections[activeTab]}
            isActive={true}
            pid={String(activeTab + 1)}
            variant={variant}
          />
        )}
      </div>
    </section>
  );
});

export const Default: FC<LandingPageProductsCollectionsProps> = (props) => (
  <LandingPageProductsCollectionsLayout {...props} variant="default" />
);

export const RightAlign: FC<LandingPageProductsCollectionsProps> = (props) => (
  <LandingPageProductsCollectionsLayout {...props} variant="rightAlign" />
);

/** Passes rendering fields through getComponentData so the component receives its datasource */
export async function getComponentServerProps(
  rendering: { fields?: Record<string, unknown> },
): Promise<{ fields?: Record<string, unknown> }> {
  const fields = rendering?.fields;
  if (!fields) return {};
  return { fields };
}

export default Default;

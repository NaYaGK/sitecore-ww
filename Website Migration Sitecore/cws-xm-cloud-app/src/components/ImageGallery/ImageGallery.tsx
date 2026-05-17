'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Custom CSS for drop bounce animation
const dropBounceStyles = `
  @keyframes dropBounce {
    0% {
      transform: translateY(-20px);
      opacity: 0;
    }
    20% {
      transform: translateY(0);
      opacity: 1;
    }
    40% {
      transform: translateY(-8px);
    }
    60% {
      transform: translateY(0);
    }
    80% {
      transform: translateY(-3px);
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;
import {
  Text,
  RichText,
  Image,
  Link,
  useSitecore,
  type Field,
  type ImageField,
  type LinkField,
} from '@sitecore-content-sdk/nextjs';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { cn } from '@/lib/utils';
import { patchLinkField, patchHref } from '@/lib/patch-link';
import { useSiteName } from '@/hooks/useSiteName';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import type { ImageGalleryProps } from './ImageGallery.props';

const clampIndex = (index: number, length: number) => {
  if (length <= 0) return 0;
  if (index < 0) return 0;
  if (index > length - 1) return length - 1;
  return index;
};

// ============================================================================
// LANDING PAGE VARIANT
// ============================================================================

const LandingPageGalleryVariant: React.FC<ImageGalleryProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const siteName = useSiteName();
  const id = rendering?.params?.RenderingIdentifier;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const arrowsHostRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [buttonsTop, setButtonsTop] = useState<number | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const datasource = resolveDatasource(fields);
  const titleField = datasource?.Title?.jsonValue || datasource?.Title || { value: '' };
  const descriptionField = datasource?.Description?.jsonValue ||
    datasource?.Description || { value: '' };

  const galleryItems = resolveGalleryItems(datasource, fields);
  const isTwoImageSubVariant = galleryItems.length === 2;
  const isDesktopStaticLayout = galleryItems.length <= 2 && !isMobileViewport;
  const fullImageDimensions =
    'max-h-[550px]  lg:max-h-[430px] xl:max-h-[400px] w-full object-cover';
  const imageDimensions = isTwoImageSubVariant
    ? 'md:w-[480px] md:h-[280px] lg:h-[320px] xl:h-[380px] object-cover'
    : fullImageDimensions;
  const itemTitleClasses = isTwoImageSubVariant
    ? 'mb-[12px] text-left text-[18px] leading-[25px] font-bold'
    : 'mb-[8px] text-left text-[18px] leading-[22px] font-bold';
  const itemCaptionWrapperClasses = isTwoImageSubVariant
    ? 'mt-2 mb-auto pb-8 text-left'
    : 'mb-auto pb-8 text-left';
  const itemCaptionClasses = cn(
    'rte-content text-left! text-black! [&_p]:m-0! [&_div]:m-0! [&_span]:leading-inherit!',
    isTwoImageSubVariant
      ? 'text-[13px]! font-medium! lg:leading-[18px]!'
      : 'text-[13px]! font-medium! leading-[18px]! lg:text-[13px]! lg:leading-[18px]!',
  );

  if (isPageEditing && !galleryItems.length && !datasource) {
    return <NoDataFallback componentName="Image Gallery" />;
  }

  if (galleryItems.length === 0 && !isPageEditing) {
    return null;
  }

  const updateButtonVisibility = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const canScroll = maxScroll > 10;

    setShowLeftButton(canScroll && scrollLeft > 10);
    setShowRightButton(canScroll && scrollLeft < maxScroll - 10);
  };

  const scrollToSlide = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const firstSlide = container.firstElementChild as HTMLElement | null;
    const slideWidth = firstSlide?.getBoundingClientRect().width ?? 320;
    const computed = window.getComputedStyle(container);
    const gap = Number.parseFloat(computed.columnGap || computed.gap || '0') || 0;
    const scrollAmount = slideWidth + gap;

    const targetScroll =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  // Inject custom CSS for drop bounce animation
  useEffect(() => {
    const styleId = 'drop-bounce-styles';

    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = dropBounceStyles;
      document.head.appendChild(styleElement);
    }

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobileViewport(mq.matches);
    update();

    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const updateButtonsTop = useCallback(() => {
    const container = scrollContainerRef.current;
    const host = arrowsHostRef.current;
    if (!container || !host || typeof window === 'undefined') return;

    const hostRect = host.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const containerCenterX = containerRect.left + containerRect.width / 2;

    const imgs = Array.from(container.querySelectorAll('img')) as HTMLImageElement[];
    const best = imgs
      .map((img) => ({ img, rect: img.getBoundingClientRect() }))
      .filter(({ rect }) => rect.width > 0 && rect.height > 0)
      .map(({ img, rect }) => ({
        img,
        rect,
        distance: Math.abs((rect.left + rect.right) / 2 - containerCenterX),
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    const imgRect = best?.rect;
    if (!imgRect) return;

    setButtonsTop(imgRect.top - hostRect.top + imgRect.height / 2);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(updateButtonsTop);
    window.addEventListener('resize', updateButtonsTop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateButtonsTop);
    };
  }, [galleryItems.length, updateButtonsTop]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateButtonVisibility();

    const handleScroll = () => {
      updateButtonVisibility();
      updateButtonsTop();
      const progress =
        ((container.scrollLeft + container.clientWidth) / container.scrollWidth) * 100;
      setScrollProgress(progress);
    };

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateButtonVisibility);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateButtonVisibility);
    };
  }, [galleryItems.length]);

  return (
    <div
      className={cn(
        'component image-gallery',
        rendering?.params?.styles,
        rendering?.params?.className,
      )}
      id={id}
      data-component="ImageGallery LandingPage"
      data-source-id={rendering?.dataSource}
    >
      <div className="container mx-auto mb-[30px] max-w-[1360px] lg:mb-[45px] lg:px-2">
        {(titleField?.value || isPageEditing) && (
          <Text
            tag="h3"
            field={titleField}
            className="mb-0 mb-4 text-left text-[22px] leading-[28px] font-bold lg:text-[28px] lg:leading-[34px] xl:text-[30px] xl:leading-[36px]"
          />
        )}

        {(descriptionField?.value || isPageEditing) && (
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <Text field={descriptionField} className="text-lg text-gray-600" />
          </div>
        )}

        {galleryItems.length === 0 && isPageEditing && (
          <div className="rounded border border-dashed border-gray-300 p-4 text-center">
            No images found. Add items in Page Builder.
          </div>
        )}

        <div
          ref={arrowsHostRef}
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {!isDesktopStaticLayout && !isPageEditing && (isHovered || isMobileViewport) && (
            <>
              {showLeftButton && (
                <button
                  onClick={() => scrollToSlide('left')}
                  className="absolute left-4 z-10 flex h-16 w-16 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-lg transition-all duration-200 hover:scale-100 focus:outline-none"
                  style={buttonsTop != null ? { top: `${buttonsTop}px` } : { top: '50%' }}
                  aria-label="Previous slide"
                  type="button"
                >
                  <ChevronLeft
                    size={32}
                    strokeWidth={2}
                    style={{
                      animation: 'dropBounce 1.5s ease-out 0s 1 normal forwards',
                    }}
                  />
                </button>
              )}

              {showRightButton && (
                <button
                  onClick={() => scrollToSlide('right')}
                  className="absolute right-4 z-10 flex h-16 w-16 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-lg transition-all duration-200 hover:scale-100 focus:outline-none"
                  style={buttonsTop != null ? { top: `${buttonsTop}px` } : { top: '50%' }}
                  aria-label="Next slide"
                  type="button"
                >
                  <ChevronRight
                    size={32}
                    strokeWidth={2}
                    style={{
                      animation: 'dropBounce 1.5s ease-out 0s 1 normal forwards',
                    }}
                  />
                </button>
              )}
            </>
          )}

          <div
            ref={isDesktopStaticLayout ? undefined : scrollContainerRef}
            className={cn(
              'flex cursor-default items-stretch gap-4 pb-6 select-none',
              isDesktopStaticLayout
                ? 'mx-auto w-full max-w-[1000px] flex-col justify-center gap-10 lg:flex-row'
                : 'snap-x overflow-x-auto scroll-smooth lg:gap-10 lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden',
              isTwoImageSubVariant && 'mx-auto px-auto max-w-3/4',
            )}
            style={
              isDesktopStaticLayout
                ? undefined
                : { msOverflowStyle: isMobileViewport ? 'auto' : 'none' }
            }
          >
            {galleryItems.map((item: any, index: number) => {
              if (!item) return null;

              const { itemImage, itemTitle, itemCaption, itemLink } = resolveItemFields(item);

              const patchedItemLink = patchLinkField(itemLink, siteName) ?? itemLink;
              const itemHref = patchHref(patchedItemLink?.value?.href, siteName);

              return (
                <div
                  key={getId(item, index)}
                  className={cn(
                    'w-full',
                    isDesktopStaticLayout
                      ? 'mx-auto max-w-[720px]'
                      : 'shrink-0 basis-[83.333333%] snap-start lg:basis-1/3',
                  )}
                >
                  <div className="relative flex h-full flex-col overflow-hidden p-2 md:px-0">
                    {(itemTitle?.value || isPageEditing) && (
                      <Text
                        field={itemTitle}
                        tag="h3"
                        className={itemTitleClasses}
                      />
                    )}

                    {(itemCaption?.value || isPageEditing) && (
                      <div className={itemCaptionWrapperClasses}>
                        <div className={itemCaptionClasses}>
                          <RichText
                            className={cn(
                              '[&_p]:m-0!',
                              isTwoImageSubVariant
                                ? 'text-[13px]! font-medium! lg:leading-[18px]!'
                                : 'text-[13px]! font-medium! leading-[18px]! lg:text-[13px]! lg:leading-[18px]!',
                            )}
                            field={itemCaption}
                          />
                        </div>
                      </div>
                    )}

                    {itemHref && !isPageEditing ? (
                      <Link field={patchedItemLink} className="block cursor-pointer">
                        <Image
                          field={itemImage}
                          className={imageDimensions}
                          alt={itemTitle?.value}
                        />
                      </Link>
                    ) : (
                      <Image
                        field={itemImage}
                        className={imageDimensions}
                        alt={itemTitle?.value}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!isDesktopStaticLayout && (
            <div className="mx-auto mt-6 h-[3px] w-full max-w-[1360px] overflow-hidden rounded-full bg-[rgba(0,0,0,0.12)]">
              <div
                className="h-full bg-[rgba(0,0,0,0.35)] transition-all duration-300 ease-out"
                style={{ width: `${scrollProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const circularIndex = (index: number, length: number) => {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
};

const getId = (item: any, index: number) => {
  return String(item?.id ?? item?.uid ?? index);
};

// ============================================================================
// SHARED UTILITIES
// ============================================================================

/**
 * Resolves datasource from props - handles both direct fields and nested data.datasource
 */
const resolveDatasource = (fields: any) => {
  return fields?.data?.datasource || fields;
};

/**
 * Resolves gallery items from various possible field structures
 */
const resolveGalleryItems = (datasource: any, fields: any): any[] => {
  let galleryItemsRaw = Array.isArray(datasource?.Items) ? datasource.Items : fields?.Items;

  if (!galleryItemsRaw) {
    galleryItemsRaw =
      datasource?.GalleryImages || datasource?.galleryImages || datasource?.items || [];
  }

  let galleryItems: any[] = [];
  if (galleryItemsRaw) {
    if (Array.isArray(galleryItemsRaw)) {
      galleryItems = galleryItemsRaw;
    } else if (Array.isArray(galleryItemsRaw.targetItems)) {
      galleryItems = galleryItemsRaw.targetItems;
    } else if (Array.isArray(galleryItemsRaw.results)) {
      galleryItems = galleryItemsRaw.results;
    }
  }

  return galleryItems;
};

/**
 * Resolves item fields from gallery item
 */
const resolveItemFields = (item: any) => {
  const itemFields = item.fields || item;

  const itemImage = itemFields?.Image?.jsonValue || itemFields?.Image || { value: {} };
  const itemCaption = itemFields?.Caption?.jsonValue || itemFields?.Caption || { value: '' };
  const itemTitle = itemFields?.Title?.jsonValue || itemFields?.Title || { value: '' };
  const itemLink = itemFields?.Link?.jsonValue || itemFields?.Link || { value: { href: '' } };

  // Resolve IsLeftCaption boolean
  const leftCaptionField = itemFields?.IsLeftCaption?.jsonValue ||
    itemFields?.IsLeftCaption || { value: '' };

  const rawLeftValue: any =
    itemFields?.IsLeftCaption?.jsonValue?.value ??
    itemFields?.IsLeftCaption?.value ??
    itemFields?.IsLeftCaption;

  let isLeftCaption = false;
  if (typeof rawLeftValue === 'boolean') {
    isLeftCaption = rawLeftValue;
  } else if (typeof rawLeftValue === 'string') {
    const normalized = rawLeftValue.trim().toLowerCase();
    isLeftCaption = normalized === 'true' || normalized === '1';
  } else if (typeof rawLeftValue === 'number') {
    isLeftCaption = rawLeftValue === 1;
  }

  return {
    itemImage,
    itemCaption,
    itemTitle,
    itemLink,
    leftCaptionField,
    isLeftCaption,
    itemDescription: itemFields?.Description?.jsonValue || itemFields?.Description || { value: '' },
  };
};

// ============================================================================
// DEFAULT GALLERY VARIANT
// ============================================================================

const DefaultGallery: React.FC<ImageGalleryProps> = (props) => {
  const { fields, rendering, isFullImage = false } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const siteName = useSiteName();
  const id = rendering?.params?.RenderingIdentifier;

  const isDownloadLinkVariant =
    rendering?.params?.FieldNames === 'Download Link' ||
    rendering?.params?.FieldNames === 'DownloadLink';

  const dataComponentVariant = isDownloadLinkVariant
    ? 'DownloadLink'
    : isFullImage
      ? 'ImageFull'
      : 'Default';

  const datasource = resolveDatasource(fields);
  const titleField = datasource?.Title?.jsonValue || datasource?.Title || { value: '' };
  const descriptionField = datasource?.Description?.jsonValue ||
    datasource?.Description || { value: '' };

  const galleryItems = resolveGalleryItems(datasource, fields);
  const itemCount = galleryItems.length;

  if (isPageEditing && !galleryItems.length && !datasource) {
    return <NoDataFallback componentName="Image Gallery" />;
  }

  if (galleryItems.length === 0 && !isPageEditing) {
    return null;
  }

  // Grid classes based on item count
  const getGridClasses = () => {
    return 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';
  };

  // Image dimensions based on item count
  const getImageDimensions = () => {
    return isFullImage
      ? 'max-h-[450px] md:max-h-[400px] lg:max-h-[430px] xl:max-h-[400px] w-full object-cover'
      : 'h-[230px]  sm:h-[225px] lg:h-[200px] xl:h-[225px] w-full object-cover';
  };

  return (
    <div
      className={cn(
        'component image-gallery',
        rendering?.params?.styles,
        rendering?.params?.className,
      )}
      id={id}
      data-component={`ImageGallery ${dataComponentVariant}`}
      data-source-id={rendering?.dataSource}
    >
      <div className="container mx-auto mb-[3rem] max-w-[1360px] lg:mb-[4.5rem] lg:px-2">
        {(titleField?.value || isPageEditing) && (
          <Text
            field={titleField}
            className="mb-0 text-center text-lg font-bold md:mb-6 md:text-3xl"
          />
        )}

        {(descriptionField?.value || isPageEditing) && (
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <Text field={descriptionField} className="text-lg text-gray-600" />
          </div>
        )}

        {galleryItems.length === 0 && isPageEditing && (
          <div className="rounded border border-dashed border-gray-300 p-4 text-center">
            No images found. Add items in Page Builder.
          </div>
        )}

        <div className={cn(getGridClasses())}>
          {galleryItems.map((item: any, index: number) => {
            if (!item) return null;

            const {
              itemImage,
              itemCaption,
              itemTitle,
              itemLink,
              leftCaptionField,
              isLeftCaption,
              itemDescription,
            } = resolveItemFields(item);
            const patchedItemLink = patchLinkField(itemLink, siteName) ?? itemLink;
            const itemHref = patchedItemLink?.value?.href;

            return (
              <div key={item.id || index} className="relative overflow-hidden p-4 md:px-4">
                {/* Title above image */}
                {(itemTitle?.value || isPageEditing) && (
                  <Text field={itemTitle} tag="h3" className="mb-2 font-bold" />
                )}

                {itemHref && !isPageEditing ? (
                  rendering?.params?.FieldNames === 'Download Link' ||
                  rendering?.params?.FieldNames === 'DownloadLink' ? (
                    <a
                      href={itemHref}
                      download=""
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block cursor-pointer"
                    >
                      <Image
                        field={itemImage}
                        className={getImageDimensions()}
                        alt={itemTitle?.value}
                      />
                    </a>
                  ) : (
                    <Link field={patchedItemLink} className="block cursor-pointer">
                      <Image
                        field={itemImage}
                        className={getImageDimensions()}
                        alt={itemTitle?.value}
                      />
                    </Link>
                  )
                ) : (
                  <Image
                    field={itemImage}
                    className={getImageDimensions()}
                    alt={itemTitle?.value}
                  />
                )}

                {isPageEditing && (
                  <div className="my-2 border border-dashed border-gray-400 p-2">
                    <div className="mb-2">
                      <span className="mr-2 text-sm font-bold">Left Caption (1=Yes, 0=No):</span>
                      <Text field={leftCaptionField} />
                    </div>
                    <div>
                      <span className="mr-2 text-sm font-bold">Link:</span>
                      <Link field={patchedItemLink}>Edit Link</Link>
                    </div>
                  </div>
                )}

                {/* Description for Download Link variant */}
                {(rendering?.params?.FieldNames === 'Download Link' ||
                  rendering?.params?.FieldNames === 'DownloadLink') &&
                  (itemDescription?.value || isPageEditing) && (
                    <div className="mt-4 mb-2">
                      <RichText field={itemDescription} className="text-black" />
                    </div>
                  )}

                {(itemCaption?.value || isPageEditing) && (
                  <div
                    className={cn(
                      'mt-2 text-gray-700',
                      isLeftCaption ? 'text-left' : 'text-center',
                    )}
                  >
                    {itemHref && !isPageEditing ? (
                      <div className="btn_wrap">
                        {rendering?.params?.FieldNames === 'Download Link' ||
                        rendering?.params?.FieldNames === 'DownloadLink' ? (
                          <a
                            href={itemHref}
                            download=""
                            target="_blank"
                            rel="noopener noreferrer"
                            className="button group flex items-center gap-2 text-black no-underline"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="8"
                              height="12"
                              viewBox="0 0 8 12"
                              fill="none"
                            >
                              <path
                                d="M1 1L6 6L1 11"
                                stroke="#000"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="rte-content **:m-0! **:text-[17px]! **:leading-[28px]!">
                              <span className="relative pb-0 after:absolute after:bottom-[-0.1rem] after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-[width] after:duration-200 group-hover:after:w-full">
                                <RichText field={itemCaption} />
                              </span>
                            </div>
                          </a>
                        ) : (
                          <Link
                            field={patchedItemLink}
                            className="button group flex items-center gap-2 text-black no-underline"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="8"
                              height="12"
                              viewBox="0 0 8 12"
                              fill="none"
                            >
                              <path
                                d="M1 1L6 6L1 11"
                                stroke="#000"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="rte-content **:m-0! **:text-[18px]! **:leading-[28px]!">
                              <span className="relative pb-0 after:absolute after:bottom-[-0.1rem] after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-[width] after:duration-200 group-hover:after:w-full">
                                <RichText field={itemCaption} />
                              </span>
                            </div>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div
                        className={cn(
                          'rte-content',
                          isLeftCaption ? 'text-left!' : 'text-center!',
                          '**:font-suisse_intlregular! mt-[18px]! **:mb-0! **:text-[18px]! **:leading-[28px]! **:font-normal! md:mt-1!',
                        )}
                      >
                        <RichText field={itemCaption} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SCROLL GALLERY VARIANT
// ============================================================================

const ScrollGalleryVariant: React.FC<ImageGalleryProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const siteName = useSiteName();
  const id = rendering?.params?.RenderingIdentifier;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const [scrollProgress, setScrollProgress] = useState(0);

  const datasource = resolveDatasource(fields);
  const titleField = datasource?.Title?.jsonValue || datasource?.Title || { value: '' };
  const descriptionField = datasource?.Description?.jsonValue ||
    datasource?.Description || { value: '' };

  const galleryItems = resolveGalleryItems(datasource, fields);

  if (isPageEditing && !galleryItems.length && !datasource) {
    return <NoDataFallback componentName="Image Gallery" />;
  }

  if (galleryItems.length === 0 && !isPageEditing) {
    return null;
  }

  // Update button visibility based on scroll position
  const updateButtonVisibility = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;

    setShowLeftButton(scrollLeft > 10);
    setShowRightButton(scrollLeft < maxScroll - 10);
  };

  // Scroll one slide at a time
  const scrollToSlide = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const slideWidth = 300;
    const gap = window.innerWidth >= 768 ? 160 : 16;
    const scrollAmount = slideWidth + gap;

    const targetScroll =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  // Inject custom CSS for drop bounce animation
  useEffect(() => {
    const styleId = 'drop-bounce-styles';

    // Check if styles already exist
    if (!document.getElementById(styleId)) {
      const styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.textContent = dropBounceStyles;
      document.head.appendChild(styleElement);
    }

    // Cleanup on unmount
    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  // Listen to scroll events
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateButtonVisibility();

    const handleScroll = () => {
      updateButtonVisibility();
      if (container) {
        const progress =
          ((container.scrollLeft + container.clientWidth) / container.scrollWidth) * 100;
        setScrollProgress(progress);
      }
    };

    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateButtonVisibility);

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateButtonVisibility);
    };
  }, [galleryItems.length]);

  return (
    <div
      className={cn(
        'component image-gallery',
        rendering?.params?.styles,
        rendering?.params?.className,
      )}
      id={id}
      data-component="ImageGallery ScrollGallery"
      data-source-id={rendering?.dataSource}
    >
      <div className="container mx-auto mb-[3rem] max-w-[1360px] px-2 py-8 md:px-2 lg:mb-[4.5rem]">
        {(titleField?.value || isPageEditing) && (
          <Text
            tag="h2"
            field={titleField}
            className="mb-0 text-center text-lg font-bold md:mb-6 md:text-3xl"
          />
        )}

        {(descriptionField?.value || isPageEditing) && (
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <Text field={descriptionField} className="text-lg text-gray-600" />
          </div>
        )}

        {galleryItems.length === 0 && isPageEditing && (
          <div className="rounded border border-dashed border-gray-300 p-4 text-center">
            No images found. Add items in Page Builder.
          </div>
        )}

        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Navigation Buttons */}
          {!isPageEditing && isHovered && (
            <>
              {showLeftButton && (
                <button
                  onClick={() => scrollToSlide('left')}
                  className="absolute top-1/2 left-4 z-10 flex h-16 w-16 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-lg transition-all duration-200 hover:scale-100 focus:outline-none"
                  aria-label="Previous slide"
                  type="button"
                >
                  <ChevronLeft
                    size={32}
                    strokeWidth={2}
                    style={{
                      animation: 'dropBounce 1.5s ease-out 0s 1 normal forwards',
                    }}
                  />
                </button>
              )}

              {showRightButton && (
                <button
                  onClick={() => scrollToSlide('right')}
                  className="absolute top-1/2 right-4 z-10 flex h-16 w-16 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-lg transition-all duration-200 hover:scale-100 focus:outline-none"
                  aria-label="Next slide"
                  type="button"
                >
                  <ChevronRight
                    size={32}
                    strokeWidth={2}
                    style={{
                      animation: 'dropBounce 1.5s ease-out 0s 1 normal forwards',
                    }}
                  />
                </button>
              )}
            </>
          )}

          <div
            ref={scrollContainerRef}
            className={cn(
              'scrollbar-hide flex cursor-default snap-x gap-4 overflow-x-auto scroll-smooth pb-6 select-none lg:gap-10',
            )}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {galleryItems.map((item: any, index: number) => {
              if (!item) return null;

              const {
                itemImage,
                itemCaption,
                itemTitle,
                itemLink,
                leftCaptionField,
                isLeftCaption,
              } = resolveItemFields(item);
              const patchedItemLinkScroll = patchLinkField(itemLink, siteName) ?? itemLink;
              const itemHrefScroll = patchedItemLinkScroll?.value?.href;

              return (
                <div
                  key={item.id || index}
                  className={cn('min-w-[300px] flex-shrink-0 snap-center', index === 0 && 'ml-0')}
                >
                  <div className="relative overflow-hidden p-4 md:px-4">
                    {/* Title above image */}
                    {(itemTitle?.value || isPageEditing) && (
                      <Text field={itemTitle} tag="h3" className="mb-2 font-bold" />
                    )}

                    {itemHrefScroll && !isPageEditing ? (
                      rendering?.params?.FieldNames === 'Download Link' ||
                      rendering?.params?.FieldNames === 'DownloadLink' ? (
                        <a
                          href={itemHrefScroll}
                          download=""
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block cursor-pointer"
                        >
                          <Image
                            field={itemImage}
                            className="h-[350px] w-full object-cover p-[10px_16px] md:w-[440px]"
                            alt={itemTitle?.value}
                          />
                        </a>
                      ) : (
                        <Link field={patchedItemLinkScroll} className="block cursor-pointer">
                          <Image
                            field={itemImage}
                            className="h-[350px] w-full object-cover p-[10px_16px] md:w-[440px]"
                            alt={itemTitle?.value}
                          />
                        </Link>
                      )
                    ) : (
                      <Image
                        field={itemImage}
                        className="h-[350px] w-full object-cover p-[10px_16px] md:w-[440px]"
                        alt={itemTitle?.value}
                      />
                    )}

                    {isPageEditing && (
                      <div className="my-2 border border-dashed border-gray-400 p-2 px-16">
                        <div className="mb-2">
                          <span className="mr-2 text-sm font-bold">
                            Left Caption (1=Yes, 0=No):
                          </span>
                          <Text field={leftCaptionField} />
                        </div>
                        <div>
                          <span className="mr-2 text-sm font-bold">Link:</span>
                          <Link field={patchedItemLinkScroll}>Edit Link</Link>
                        </div>
                      </div>
                    )}

                    {(itemCaption?.value || isPageEditing) && (
                      <div
                        className={cn(
                          'mt-2 text-gray-700',
                          isLeftCaption ? 'text-left' : 'text-center',
                        )}
                      >
                        {itemHrefScroll && !isPageEditing ? (
                          <div className="btn_wrap">
                            {rendering?.params?.FieldNames === 'Download Link' ||
                            rendering?.params?.FieldNames === 'DownloadLink' ? (
                              <a
                                href={itemHrefScroll}
                                download=""
                                target="_blank"
                                rel="noopener noreferrer"
                                className="button group flex items-center gap-2 font-bold text-black no-underline"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="8"
                                  height="12"
                                  viewBox="0 0 8 12"
                                  fill="none"
                                >
                                  <path
                                    d="M1 1L6 6L1 11"
                                    stroke="#000"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <div className="rte-content **:font-suisse_intlregular! **:m-0! **:text-[17px]! **:leading-[28px]! **:font-bold!">
                                  <span className="relative pb-0 after:absolute after:bottom-[-0.1rem] after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-[width] after:duration-200 group-hover:after:w-full">
                                    <RichText field={itemCaption} />
                                  </span>
                                </div>
                              </a>
                            ) : (
                              <Link
                                field={patchedItemLinkScroll}
                                className="button group flex items-center gap-2 text-black no-underline"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="8"
                                  height="12"
                                  viewBox="0 0 8 12"
                                  fill="none"
                                >
                                  <path
                                    d="M1 1L6 6L1 11"
                                    stroke="#000"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <div className="rte-content **:font-suisse_intlregular! **:m-0! **:text-[17px]! **:leading-[28px]!">
                                  <span className="relative pb-0 after:absolute after:bottom-[-0.1rem] after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-[width] after:duration-200 group-hover:after:w-full">
                                    <RichText field={itemCaption} />
                                  </span>
                                </div>
                              </Link>
                            )}
                          </div>
                        ) : (
                          <div
                            className={cn(
                              'rte-content',
                              isLeftCaption ? 'text-left!' : 'text-center!',
                              '**:font-suisse_intlregular! **:mt-[18px]! **:mb-0! **:text-[17px]! **:leading-[28px]! **:font-normal!',
                            )}
                          >
                            <RichText field={itemCaption} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mx-auto mt-8 h-1 w-full max-w-[1360px] overflow-hidden rounded-full bg-gray-200 px-4">
            <div
              className="h-full bg-black transition-all duration-300 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TWO IMAGES VARIANT
// ============================================================================

const TwoImagesGallery: React.FC<ImageGalleryProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const id = rendering?.params?.RenderingIdentifier;

  const datasource = resolveDatasource(fields);
  const titleField = datasource?.Title?.jsonValue || datasource?.Title || { value: '' };
  const descriptionField = datasource?.Description?.jsonValue ||
    datasource?.Description || { value: '' };

  const galleryItems = resolveGalleryItems(datasource, fields);
  const limitedGalleryItems = galleryItems.length > 2 ? galleryItems.slice(0, 2) : galleryItems;
  const itemCount = limitedGalleryItems.length;

  if (isPageEditing && !galleryItems.length && !datasource) {
    return <NoDataFallback componentName="Image Gallery" />;
  }

  if (galleryItems.length === 0 && !isPageEditing) {
    return null;
  }

  // Grid classes based on item count
  const getGridClasses = () => {
    if (itemCount <= 2) {
      return 'grid grid-cols-1 gap-0 md:gap-4 lg:gap-7 md:grid-cols-2';
    } else {
      return 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  // Image dimensions based on item count
  const getImageDimensions = () => {
    if (itemCount <= 2) {
      return 'h-[372px] w-[654px] object-cover ';
    } else {
      return 'h-[250px] w-[425px] object-cover';
    }
  };

  return (
    <div
      className={cn(
        'component image-gallery',
        rendering?.params?.styles,
        rendering?.params?.className,
      )}
      id={id}
      data-component="ImageGallery TwoImages"
      data-source-id={rendering?.dataSource}
    >
      <div className="container mx-auto mb-12 max-w-[1360px] lg:mb-18 lg:px-2">
        {(titleField?.value || isPageEditing) && (
          <Text
            tag="h2"
            field={titleField}
            className="mb-4 text-center text-2xl font-bold md:text-3xl lg:text-4xl"
          />
        )}
        {(descriptionField?.value || isPageEditing) && (
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <RichText field={descriptionField} />
          </div>
        )}
        <div className={getGridClasses()}>
          {limitedGalleryItems.map((item, index) => (
            <div key={item.id} className="relative overflow-hidden rounded-sm">
              <Image
                field={item.fields.Image}
                className={getImageDimensions()}
                alt={item.fields.Image?.value?.alt || `Gallery image ${index + 1}`}
              />
              {(item.fields.Title?.value || item.fields.Caption?.value || isPageEditing) && (
                <div className="bg-white p-4">
                  {(item.fields.Title?.value || isPageEditing) && (
                    <Text field={item.fields.Title} className="mb-2 text-lg font-semibold" />
                  )}
                  {(item.fields.Caption?.value || isPageEditing) && (
                    <RichText field={item.fields.Caption} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
// ============================================================================
// POPUP GALLERY VARIANT
// ============================================================================

type GalleryItemResolved = {
  id: string;
  imageField: any;
  titleField: any;
};

const PopupGalleryVariant: React.FC<ImageGalleryProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const id = rendering?.params?.RenderingIdentifier;

  const datasource = resolveDatasource(fields);
  const titleField = datasource?.Title?.jsonValue || datasource?.Title || { value: '' };
  const descriptionField = datasource?.Description?.jsonValue ||
    datasource?.Description || { value: '' };

  const rawItems = resolveGalleryItems(datasource, fields);

  const items: GalleryItemResolved[] = useMemo(() => {
    return (rawItems || [])
      .map((item: any, index: number) => {
        if (!item) return null;
        const { itemImage, itemTitle } = resolveItemFields(item);
        return {
          id: getId(item, index),
          imageField: itemImage,
          titleField: itemTitle,
        };
      })
      .filter(Boolean) as GalleryItemResolved[];
  }, [rawItems]);

  const itemCount = items.length;

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const dialogRef = useRef<HTMLDivElement>(null);
  const thumbStripRef = useRef<HTMLDivElement>(null);

  const openAt = useCallback(
    (index: number) => {
      setActiveIndex(clampIndex(index, itemCount));
      setIsOpen(true);
    },
    [itemCount],
  );

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => circularIndex(prev - 1, itemCount));
  }, [itemCount]);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => circularIndex(prev + 1, itemCount));
  }, [itemCount]);

  // Keep selected thumb in view
  useEffect(() => {
    const container = thumbStripRef.current;
    if (!container) return;

    const active = container.querySelector<HTMLButtonElement>(
      `button[data-index="${activeIndex}"]`,
    );
    if (!active) return;

    const activeRect = active.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    if (activeRect.left < containerRect.left) {
      container.scrollBy({ left: activeRect.left - containerRect.left - 16, behavior: 'smooth' });
    } else if (activeRect.right > containerRect.right) {
      container.scrollBy({ left: activeRect.right - containerRect.right + 16, behavior: 'smooth' });
    }
  }, [activeIndex]);

  // Keyboard handling when open
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close, goNext, goPrev, isOpen]);

  // Basic swipe support for mobile
  useEffect(() => {
    if (!isOpen) return;

    const el = dialogRef.current;
    if (!el) return;

    let startX: number | null = null;
    let startY: number | null = null;

    const onTouchStart = (e: TouchEvent) => {
      if (!e.touches?.[0]) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (startX === null || startY === null) return;
      const t = e.changedTouches?.[0];
      if (!t) return;

      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      // Horizontal swipe threshold
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) goNext();
        else goPrev();
      }

      startX = null;
      startY = null;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [goNext, goPrev, isOpen]);

  if (isPageEditing && itemCount === 0 && !datasource) {
    return <NoDataFallback componentName="Image Gallery" />;
  }

  if (itemCount === 0 && !isPageEditing) {
    return null;
  }

  const activeItem = items[clampIndex(activeIndex, itemCount)];

  return (
    <div
      className={cn(
        'component image-gallery',
        rendering?.params?.styles,
        rendering?.params?.className,
      )}
      id={id}
      data-component="ImageGallery PopupGallery"
      data-source-id={rendering?.dataSource}
    >
      <div className="container mx-auto mb-12 max-w-[1360px] lg:mb-18 lg:px-2">
        {(titleField?.value || isPageEditing) && (
          <Text
            tag="h2"
            field={titleField}
            className="mb-0 text-center text-lg font-bold md:mb-6 md:text-3xl"
          />
        )}

        {(descriptionField?.value || isPageEditing) && (
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <Text field={descriptionField} className="text-lg text-gray-600" />
          </div>
        )}

        {itemCount === 0 && isPageEditing && (
          <div className="rounded border border-dashed border-gray-300 p-4 text-center">
            No images found. Add items in Page Builder.
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                'relative overflow-hidden p-4 text-left md:px-4',
                !isPageEditing && 'cursor-zoom-in',
              )}
              onClick={() => {
                if (isPageEditing) return;
                openAt(index);
              }}
              aria-label={`Open image ${index + 1} of ${itemCount}`}
            >
              <div className="pointer-events-none">
                <Image
                  field={item.imageField}
                  className="h-[230px] w-full object-cover"
                  alt={item.titleField?.value || ''}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Popup overlay */}
      {isOpen && !isPageEditing && (
        <div className="fixed inset-0 z-70" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/80"
            onClick={close}
            aria-label="Close image gallery"
          />

          <div ref={dialogRef} className="relative z-71 flex h-full w-full flex-col p-0 sm:p-8">
            {/* Top bar */}
            <div className="pointer-events-none absolute top-0 left-0 z-72 flex w-full items-center justify-between p-2 sm:p-10">
              <div className="pointer-events-auto text-sm font-semibold text-white/90">
                {itemCount > 0 ? `${activeIndex + 1} / ${itemCount}` : ''}
              </div>

              <button
                type="button"
                className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center text-white hover:text-gray-300 focus:outline-none"
                onClick={close}
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Main image area */}
            <div className="relative flex h-full w-full items-center justify-center px-0 pt-0 sm:px-4 sm:pt-16">
              {/* Left arrow */}
              {itemCount > 1 && (
                <button
                  type="button"
                  className="absolute top-1/2 left-1 z-72 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-white hover:text-gray-300 focus:outline-none sm:left-4 sm:h-14 sm:w-14"
                  onClick={goPrev}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6 sm:h-12 sm:w-12" />
                </button>
              )}

              {/* Right arrow */}
              {itemCount > 1 && (
                <button
                  type="button"
                  className="absolute top-1/2 right-1 z-72 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-white hover:text-gray-300 focus:outline-none sm:right-4 sm:h-14 sm:w-14"
                  onClick={goNext}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6 sm:h-12 sm:w-12" />
                </button>
              )}

              {/* Image */}
              <div className="flex h-full w-full max-w-none items-center justify-center sm:w-[200vw]">
                {activeItem ? (
                  <Image
                    field={activeItem.imageField}
                    className="h-full w-full object-cover sm:h-[60vh] sm:w-[200vh] sm:object-cover"
                    alt={activeItem.titleField?.value || ''}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EXPORTS & ROUTER
// ============================================================================

/**
 * Main component that routes to the correct variant
 */
type ImageGalleryVariant =
  | 'default'
  | 'scrollGallery'
  | 'twoImages'
  | 'downloadLink'
  | 'popupGallery'
  | 'landingPage'
  | 'imageFull'
  | 'imageContentDuo';

const ImageContentDuoVariant: React.FC<ImageGalleryProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const siteName = useSiteName();
  const id = rendering?.params?.RenderingIdentifier;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const isButtonScrollInProgressRef = useRef(false);
  const normalizeTimeoutRef = useRef<number | null>(null);

  const datasource = resolveDatasource(fields);
  const titleField = datasource?.Title?.jsonValue || datasource?.Title || { value: '' };
  const descriptionField = datasource?.Description?.jsonValue ||
    datasource?.Description || { value: '' };

  const galleryItems = resolveGalleryItems(datasource, fields);
  const hasInfiniteLoop = galleryItems.length > 1;
  const loopedGalleryItems = useMemo(() => {
    if (!hasInfiniteLoop) {
      return galleryItems;
    }

    const first = galleryItems[0];
    const last = galleryItems[galleryItems.length - 1];
    return [last, ...galleryItems, first];
  }, [galleryItems, hasInfiniteLoop]);

  const getScrollMetrics = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return null;
    }

    const firstSlide = container.firstElementChild as HTMLElement | null;
    if (!firstSlide) {
      return null;
    }

    const slideWidth = firstSlide.getBoundingClientRect().width;
    const computed = window.getComputedStyle(container);
    const gap = Number.parseFloat(computed.columnGap || computed.gap || '0') || 0;
    const scrollAmount = slideWidth + gap;

    return { container, scrollAmount };
  }, []);

  const getRealIndexFromScroll = useCallback(() => {
    const metrics = getScrollMetrics();
    if (!metrics || galleryItems.length === 0) {
      return 0;
    }

    const { container, scrollAmount } = metrics;
    const rawIndex = Math.round(container.scrollLeft / scrollAmount);

    if (!hasInfiniteLoop) {
      return clampIndex(rawIndex, galleryItems.length);
    }

    if (rawIndex <= 0) {
      return galleryItems.length - 1;
    }

    if (rawIndex >= galleryItems.length + 1) {
      return 0;
    }

    return clampIndex(rawIndex - 1, galleryItems.length);
  }, [galleryItems.length, getScrollMetrics, hasInfiniteLoop]);

  const normalizeInfinitePosition = useCallback(() => {
    if (!hasInfiniteLoop) {
      return;
    }

    const metrics = getScrollMetrics();
    if (!metrics) {
      return;
    }

    const { container, scrollAmount } = metrics;
    const tolerance = 6;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const rawIndex = Math.round(container.scrollLeft / scrollAmount);

    const jumpWithoutAnimation = (left: number) => {
      const previousBehavior = container.style.scrollBehavior;
      container.style.scrollBehavior = 'auto';
      container.scrollLeft = left;
      container.style.scrollBehavior = previousBehavior;
    };

    if (container.scrollLeft <= tolerance) {
      jumpWithoutAnimation(galleryItems.length * scrollAmount);
      return;
    }

    if (container.scrollLeft >= maxScroll - tolerance || rawIndex >= galleryItems.length + 1) {
      jumpWithoutAnimation(scrollAmount);
    }
  }, [galleryItems.length, getScrollMetrics, hasInfiniteLoop]);

  const updateCurrentIndex = () => {
    if (galleryItems.length === 0) return;
    setCurrentIndex(getRealIndexFromScroll());
  };

  const scrollToSlide = (direction: 'left' | 'right') => {
    if (galleryItems.length === 0) return;
    const metrics = getScrollMetrics();
    if (!metrics) return;

    const { container, scrollAmount } = metrics;

    if (normalizeTimeoutRef.current !== null) {
      window.clearTimeout(normalizeTimeoutRef.current);
      normalizeTimeoutRef.current = null;
    }

    if (!hasInfiniteLoop) {
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      return;
    }

    isButtonScrollInProgressRef.current = true;
    const rawIndex = Math.round(container.scrollLeft / scrollAmount);
    const targetRawIndex = direction === 'left' ? rawIndex - 1 : rawIndex + 1;

    container.scrollTo({
      left: targetRawIndex * scrollAmount,
      behavior: 'smooth',
    });

    normalizeTimeoutRef.current = window.setTimeout(() => {
      normalizeInfinitePosition();
      updateCurrentIndex();
      isButtonScrollInProgressRef.current = false;
      normalizeTimeoutRef.current = null;
    }, 420);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsMobileViewport(mq.matches);
    update();

    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const updateButtonVisibility = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const maxScroll = container.scrollWidth - container.clientWidth;
    const canScroll = maxScroll > 10;

    setShowLeftButton(canScroll);
    setShowRightButton(canScroll);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (hasInfiniteLoop) {
      const frameId = window.requestAnimationFrame(() => {
        const metrics = getScrollMetrics();
        if (!metrics) return;

        const previousBehavior = container.style.scrollBehavior;
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = metrics.scrollAmount;
        container.style.scrollBehavior = previousBehavior;

        const initialIndex = getRealIndexFromScroll();
        setCurrentIndex(initialIndex);
        setScrollProgress(((initialIndex + 1) / galleryItems.length) * 100);
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    }

    const initialIndex = getRealIndexFromScroll();
    setCurrentIndex(initialIndex);
    setScrollProgress(((initialIndex + 1) / galleryItems.length) * 100);
  }, [galleryItems.length, getRealIndexFromScroll, getScrollMetrics, hasInfiniteLoop]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateCurrentIndex();
    updateButtonVisibility();
    const handleScroll = () => {
      if (!isButtonScrollInProgressRef.current) {
        normalizeInfinitePosition();
      }
      updateCurrentIndex();
      updateButtonVisibility();
      const realIndex = getRealIndexFromScroll();
      const progress = galleryItems.length > 0 ? ((realIndex + 1) / galleryItems.length) * 100 : 0;
      setScrollProgress(progress);
    };
    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateCurrentIndex);
    window.addEventListener('resize', updateButtonVisibility);
    window.addEventListener('resize', normalizeInfinitePosition);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateCurrentIndex);
      window.removeEventListener('resize', updateButtonVisibility);
      window.removeEventListener('resize', normalizeInfinitePosition);

      if (normalizeTimeoutRef.current !== null) {
        window.clearTimeout(normalizeTimeoutRef.current);
        normalizeTimeoutRef.current = null;
      }

      isButtonScrollInProgressRef.current = false;
    };
  }, [
    galleryItems.length,
    getRealIndexFromScroll,
    normalizeInfinitePosition,
    updateButtonVisibility,
  ]);

  if (isPageEditing && !galleryItems.length && !datasource) {
    return <NoDataFallback componentName="Image Gallery" />;
  }
  if (galleryItems.length === 0 && !isPageEditing) {
    return null;
  }

  return (
    <div
      className={cn(
        'component image-gallery',
        rendering?.params?.styles,
        rendering?.params?.className,
      )}
      id={id}
      data-component="ImageGallery ImageContentDuo"
      data-source-id={rendering?.dataSource}
    >
      <div className="container mx-auto mb-12 max-w-[1360px] px-2 py-8 lg:mb-18">
        {(titleField?.value || isPageEditing) && (
          <Text
            tag="h2"
            field={titleField}
            className="mb-0 text-center text-left text-lg font-bold md:mb-6 md:text-3xl"
          />
        )}
        {(descriptionField?.value || isPageEditing) && (
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <Text field={descriptionField} className="text-lg text-gray-600" />
          </div>
        )}

        <div
          className="relative"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onMouseEnter={() => setIsFocused(true)}
          onMouseLeave={() => setIsFocused(false)}
          tabIndex={0}
        >
          {!isPageEditing && isFocused && !isMobileViewport && (
            <>
              {showLeftButton && (
                <button
                  onClick={() => scrollToSlide('left')}
                  className="absolute top-1/2 left-4 z-10 flex h-16 w-16 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none"
                  aria-label="Previous slide"
                  type="button"
                >
                  <ChevronLeft size={32} strokeWidth={2} />
                </button>
              )}
              {showRightButton && (
                <button
                  onClick={() => scrollToSlide('right')}
                  className="absolute top-1/2 right-4 z-10 flex h-16 w-16 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black text-white shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none"
                  aria-label="Next slide"
                  type="button"
                >
                  <ChevronRight size={32} strokeWidth={2} />
                </button>
              )}
            </>
          )}

          <div
            ref={scrollContainerRef}
            className="flex cursor-default snap-x gap-4 overflow-x-auto scroll-smooth pb-6 select-none sm:pl-[5%] sm:scroll-pl-[5%] md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden"
            style={{ msOverflowStyle: isMobileViewport ? 'auto' : 'none' }}
          >
            {loopedGalleryItems.map((item: any, index: number) => {
              if (!item) return null;
              const { itemImage, itemCaption, itemTitle, itemLink, itemDescription } =
                resolveItemFields(item);
              const patchedItemLink = patchLinkField(itemLink, siteName) ?? itemLink;
              const itemHref = patchHref(patchedItemLink?.value?.href, siteName);

              return (
                <div
                  key={`${getId(item, index)}-${index}`}
                  className="flex w-full shrink-0 basis-[80%] snap-start flex-col gap-0 sm:inline-flex sm:w-max sm:basis-auto sm:flex-row sm:items-stretch sm:gap-4"
                >
                  {/* Image section */}
                  <div className="relative h-[360px] w-full shrink-0 overflow-hidden sm:h-[419px] sm:w-[500px] sm:max-w-[500px] sm:flex-none">
                    {itemHref && !isPageEditing ? (
                      <Link field={patchedItemLink} className="block h-full w-full">
                        <Image
                          field={itemImage}
                          className="h-full w-full object-cover"
                          alt={itemTitle?.value || ''}
                        />
                      </Link>
                    ) : (
                      <Image
                        field={itemImage}
                        className="h-full w-full object-cover"
                        alt={itemTitle?.value || ''}
                      />
                    )}
                  </div>
                  {/* Text section */}
                  <div className="flex h-auto w-full shrink-0 flex-col justify-start bg-(--color-accent-primary) p-8 sm:h-[419px] sm:w-[clamp(250px,30vw,500px)] sm:max-w-[380px] sm:min-w-[250px] sm:flex-none sm:overflow-hidden sm:px-6 sm:pt-5 sm:pb-8 xl:px-8 xl:pt-6 xl:pb-9">
                    {(itemCaption?.value || isPageEditing) && (
                      <div
                        className="rte-content mb-6 text-left text-[22px] leading-[1.32] font-medium text-black lg:text-[25px] lg:leading-[1.32] [&_p]:m-0! [&_p]:text-[22px]! [&_p]:leading-[1.32]! [&_p]:font-medium! lg:[&_p]:text-[25px]! lg:[&_p]:leading-[1.32]! lg:[&_p]:font-medium! [&_strong]:font-medium!"
                        style={{ fontFamily: "'Suisse Intl', 'Helvetica Neue', Arial, sans-serif" }}
                      >
                        <RichText field={itemCaption} />
                      </div>
                    )}

                    <div className="mt-auto">
                      {(itemTitle?.value || isPageEditing) && (
                        <div
                          className="mb-2 text-left text-[18px] leading-[1.35] font-medium text-black"
                          style={{ fontFamily: "'Suisse Intl', 'Helvetica Neue', Arial, sans-serif" }}
                        >
                          <Text field={itemTitle} tag="h3" className="m-0 text-[18px] leading-[1.35] font-medium" />
                        </div>
                      )}

                      {(itemDescription?.value || isPageEditing) && (
                        <div
                          className="rte-content text-left text-[15px] leading-[1.4] font-medium text-black/85 [&_p]:m-0! [&_p]:text-[15px]! [&_p]:leading-[1.4]! [&_p]:font-medium!"
                          style={{ fontFamily: "'Suisse Intl', 'Helvetica Neue', Arial, sans-serif" }}
                        >
                          <RichText field={itemDescription} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mx-auto mt-6 h-[3px] w-full max-w-[1360px] overflow-hidden rounded-full bg-[rgba(0,0,0,0.12)] md:hidden">
            <div
              className="h-full bg-[rgba(0,0,0,0.35)] transition-all duration-300 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageGalleryLayout: React.FC<ImageGalleryProps & { variant: ImageGalleryVariant }> = (
  props,
) => {
  const { variant } = props;
  const isScrollGallery = variant === 'scrollGallery';
  const isTwoImages = variant === 'twoImages';
  const isDownloadLink = variant === 'downloadLink';
  const isPopupGallery = variant === 'popupGallery';
  const isImageFull = variant === 'imageFull';
  const isLandingPage = variant === 'landingPage';
  const isImageContentDuo = variant === 'imageContentDuo';

  if (isScrollGallery) {
    return <ScrollGalleryVariant {...props} />;
  }

  if (isTwoImages) {
    return <TwoImagesGallery {...props} />;
  }

  if (isPopupGallery) {
    return <PopupGalleryVariant {...props} />;
  }

  if (isImageContentDuo) {
    return <ImageContentDuoVariant {...props} />;
  }

  if (isLandingPage) {
    return <LandingPageGalleryVariant {...props} isFullImage={true} />;
  }

  if (isImageFull) {
    return <DefaultGallery {...props} isFullImage={true} />;
  }

  if (isDownloadLink) {
    return <DefaultGallery {...props} />;
  }

  return <DefaultGallery {...props} />;
};

export const Default: React.FC<ImageGalleryProps> = (props) => (
  <ImageGalleryLayout {...props} variant="default" />
);

export const DownloadLink: React.FC<ImageGalleryProps> = (props) => (
  <ImageGalleryLayout {...props} variant="downloadLink" />
);

export const ScrollGallery: React.FC<ImageGalleryProps> = (props) => (
  <ImageGalleryLayout {...props} variant="scrollGallery" />
);

export const TwoImages: React.FC<ImageGalleryProps> = (props) => (
  <ImageGalleryLayout {...props} variant="twoImages" />
);

export const PopupGallery: React.FC<ImageGalleryProps> = (props) => (
  <ImageGalleryLayout {...props} variant="popupGallery" />
);

export const ImageFull: React.FC<ImageGalleryProps> = (props) => (
  <ImageGalleryLayout {...props} variant="imageFull" />
);

export const LandingPage: React.FC<ImageGalleryProps> = (props) => (
  <ImageGalleryLayout {...props} variant="landingPage" />
);

export const ImageContentDuo: React.FC<ImageGalleryProps> = (props) => (
  <ImageGalleryLayout {...props} variant="imageContentDuo" />
);

export default Default;

import React, { useState, useRef, useEffect } from 'react';
import { useSitecore, Text, RichText, Image, Link } from '@sitecore-content-sdk/nextjs';

import type { CertificatesSliderProps } from './certificates-slider.props';
import { NoDataFallback } from '@/utils/NoDataFallback';

export const Default: React.FC<CertificatesSliderProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const [currentSlide, setCurrentSlide] = useState(1);
  const sliderRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Resolve datasource from multiple shapes
  const initialDs: any =
    (fields as any)?.data?.datasource ??
    (fields as any)?.datasource ??
    (fields as any) ??
    (rendering as any)?.fields ??
    {};
  const ds: any =
    initialDs && typeof initialDs === 'object' && initialDs.fields ? initialDs.fields : initialDs;

  // Datasource id from rendering to decide fallback behavior
  const dsId = (rendering as any)?.dataSource || (rendering as any)?.datasource || undefined;

  // Access main datasource fields - use Title and Link directly
  // Pass full field objects for PageEditor compatibility
  const titleField = ds?.Title;
  const linkField = ds?.Link;

  // Get Items collection - handle both targetItems and direct array
  const itemsSource = ds?.Items;
  const originalItems = Array.isArray(itemsSource?.targetItems)
    ? itemsSource.targetItems
    : Array.isArray(itemsSource)
      ? itemsSource
      : [];

  // Slider configuration
  const CARDS_PER_SLIDE = 4;
  const isSliderMode = originalItems.length > 4;
  const originalTotalSlides = isSliderMode ? Math.ceil(originalItems.length / CARDS_PER_SLIDE) : 1;
  const items = isSliderMode
    ? [...originalItems, ...originalItems, ...originalItems]
    : originalItems;
  const totalSlides = isSliderMode ? originalTotalSlides * 3 : 1;

  useEffect(() => {
    const initialSlide = isSliderMode ? originalTotalSlides + 1 : 1;
    setCurrentSlide(initialSlide);

    if (isSliderMode && sliderRef.current) {
      const slideWidth = sliderRef.current.scrollWidth / totalSlides;
      sliderRef.current.scrollTo({
        left: slideWidth * originalTotalSlides,
        behavior: 'auto',
      });
    }
  }, [originalItems.length, isSliderMode, originalTotalSlides, totalSlides]);

  const scrollToSlide = (slideNumber: number, instant = false) => {
    if (!sliderRef.current || !isSliderMode) return;

    const slideWidth = sliderRef.current.scrollWidth / totalSlides;
    sliderRef.current.scrollTo({
      left: slideWidth * (slideNumber - 1),
      behavior: instant ? 'auto' : 'smooth',
    });

    if (!instant) {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        let equivalentSlide: number | null = null;

        if (slideNumber <= originalTotalSlides) {
          equivalentSlide = slideNumber + originalTotalSlides;
        } else if (slideNumber > 2 * originalTotalSlides) {
          equivalentSlide = slideNumber - originalTotalSlides;
        }

        if (equivalentSlide) {
          setCurrentSlide(equivalentSlide);
          scrollToSlide(equivalentSlide, true);
        }
      }, 500);
    }
  };

  const goToPrevSlide = () => {
    const newSlide = currentSlide - 1;
    setCurrentSlide(newSlide);
    scrollToSlide(newSlide);
  };

  const goToNextSlide = () => {
    const newSlide = currentSlide + 1;
    setCurrentSlide(newSlide);
    scrollToSlide(newSlide);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Group items into slides
  const slides = isSliderMode
    ? Array.from({ length: totalSlides }, (_, i) =>
      items.slice(i * CARDS_PER_SLIDE, (i + 1) * CARDS_PER_SLIDE),
    )
    : [items];

  // Show fallback only when there is no datasource id at all
  if (!dsId && !isPageEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'CertificatesSlider'} />;
  }

  return (
    <section
      className="mb-12 lg:mb-18 bg-[#ebebeb] py-6 md:pt-7"
      data-component="CertificatesSlider"
    >
      <div className="mx-auto max-w-[1360px] px-2 md:px-[10px]">
        {/* Title */}
        {(titleField || isPageEditing) && (
          <div className="mb-4">
            <Text tag="h2" field={titleField} className="font-heading-h2 lg:mt-[30px] lg:mb-[20px]" />
          </div>
        )}

        {/* Certificates Grid/Slider */}
        {(items.length > 0 || isPageEditing) && (
          <div className="relative">
            <div
              ref={sliderRef}
              className={` ${isSliderMode ? 'scrollbar-hide overflow-x-auto lg:overflow-hidden' : ''} ${isSliderMode ? 'flex' : 'grid grid-cols-1 md:grid-cols-1 sm:w-1/2 lg:w-full lg:grid-cols-4'} gap-8 md:gap-15 ${isSliderMode ? '' : 'md:mb-9'} `}
              style={{
                scrollSnapType: isSliderMode ? 'x mandatory' : undefined,
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {isSliderMode
                ? slides.map((slideItems, slideIndex) => (
                  <div
                    key={slideIndex}
                    className="grid min-w-full grid-cols-1 gap-8 md:grid-cols-2 md:gap-15 lg:grid-cols-4"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    {slideItems.map((item: any, index: number) =>
                      renderCard(item, slideIndex * CARDS_PER_SLIDE + index),
                    )}
                  </div>
                ))
                : items.map((item: any, index: number) => renderCard(item, index))}
            </div>

            {/* Desktop Navigation - Bottom Right */}
            {isSliderMode && (
              <div className="mt-24 hidden items-end justify-end gap-4 lg:flex">
                {/* Slide Indicator - Show position relative to original slides */}
                <span className="text-lg font-semibold text-[var(--color-text,#000000)]">
                  {((currentSlide - 1) % originalTotalSlides) + 1} / {originalTotalSlides}
                </span>

                {/* Navigation Buttons */}
                <div className="flex gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={goToPrevSlide}
                    onKeyDown={(e) => handleKeyDown(e, goToPrevSlide)}
                    aria-label="Previous slide"
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-black bg-white p-0 transition-all duration-200 hover:cursor-pointer"
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={goToNextSlide}
                    onKeyDown={(e) => handleKeyDown(e, goToNextSlide)}
                    aria-label="Next slide"
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[var(--color-text,#000000)] bg-white transition-all duration-200 hover:cursor-pointer"
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section CTA - with left-to-right underline animation */}
        <div>
          {linkField &&
            (() => {
              // Check for link value in both jsonValue and direct value formats
              const hasLinkValue =
                linkField?.value?.href ||
                (linkField as any)?.jsonValue?.value?.href ||
                isPageEditing;

              if (!hasLinkValue) {
                return null;
              }

              // Get link text from field
              const linkText =
                linkField?.value?.text ||
                (linkField as any)?.jsonValue?.value?.text ||
                'Our certificates';

              return (
                <div className="mt-8 flex justify-start font-bold md:mt-0 md:mb-1 md:pt-4 md:text-lg 2xl:text-xl">
                  <Link
                    field={linkField}
                    className="group relative inline-flex items-center gap-2 font-bold text-[var(--color-text,#000000)] no-underline transition-colors md:gap-1"
                  >
                    <img
                      src="/assets/icons/chevron-right.svg"
                      alt=""
                      className="-ml-1 h-4 w-4 md:h-5 md:w-5"
                    />
                    <span className="relative text-[17px] font-bold md:text-lg">
                      {linkText}
                      <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--color-text,#000000)] transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                </div>
              );
            })()}
        </div>
      </div>
    </section>
  );

  // Card rendering function
  function renderCard(item: any, index: number) {
    // Access fields directly from child item - pass full field objects for PageEditor compatibility
    const itemTitleField = item?.fields?.Title;
    const itemDescriptionField = item?.fields?.Description;
    const itemImageField = item?.fields?.Image;

    // Check for image value in both jsonValue and direct value formats
    const hasImageValue =
      itemImageField?.value?.src || (itemImageField as any)?.jsonValue?.value?.src || isPageEditing;

    // Check for title value
    const hasTitleValue =
      itemTitleField?.value || (itemTitleField as any)?.jsonValue?.value || isPageEditing;

    // Check for description value
    const hasDescriptionValue =
      itemDescriptionField?.value ||
      (itemDescriptionField as any)?.jsonValue?.value ||
      isPageEditing;

    // Skip if no content and not editing
    if (!hasImageValue && !hasTitleValue && !hasDescriptionValue && !isPageEditing) {
      return null;
    }

    return (
      <div
        key={item?.id || item?.itemId || index}
        // gap-0 on mobile | Desktop exactly restores initial flex-col-reverse layout
        className="grid grid-cols-[110px_1fr] gap-0 pr-2 sm:grid-cols-[130px_1fr] lg:flex lg:flex-col-reverse lg:gap-0 lg:px-0"
      >
        {/* LOGO COLUMN */}
        {hasImageValue && (
          // Mobile native wrapper | Desktop restores exact initial w-full row wrapper
          <div className="flex justify-start pl-[18px] pr-[15px] lg:m-0 lg:flex lg:w-full lg:items-end lg:p-0 lg:pt-1.5">
            {/* Desktop restores exact inner 30% image alignment wrapper */}
            <div className="lg:mr-0 lg:mb-0 lg:mt-10 lg:flex lg:w-[30%] lg:items-end">
              <Image
                field={itemImageField}
                // Mobile resized logic | Desktop restores exact initial h-[55px] with w-auto
                className="h-auto w-auto max-w-full max-h-[54px] object-contain object-left sm:max-h-[64px] lg:h-[55px] lg:w-auto lg:max-h-none lg:object-contain lg:object-left"
                loading="lazy"
                alt={item?.fields?.Image?.value?.alt || ''}
              />
            </div>
          </div>
        )}

        {/* CONTENT COLUMN */}
        <div className="flex flex-col lg:flex lg:flex-1 lg:flex-col lg:gap-2 lg:pt-1">
          {hasTitleValue && (
            <div className="lg:block">
              <Text
                tag="h3"
                field={itemTitleField}
                // Mobile custom weights | Desktop restores font-heading-h3 and explicit sizes
                className="font-heading-h3 m-0 text-[18px] font-bold leading-snug text-black sm:text-xl lg:mb-0! lg:text-2xl"
              />
            </div>
          )}

          {hasDescriptionValue && (
            // Mobile adjusted line-heights | Desktop restores exact text-lg leading-relaxed states
            <div className="mt-1 pr-2 text-[17px] leading-[24px] antialiased sm:text-[17px] sm:leading-[26px] lg:mt-0 lg:pr-0 lg:text-lg lg:text-[17px] lg:leading-relaxed">
              <RichText field={itemDescriptionField} />
            </div>
          )}
        </div>
      </div>
    );
  }
};

export const Advantages: React.FC<CertificatesSliderProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const [currentSlide, setCurrentSlide] = useState(1);
  const sliderRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Resolve datasource from multiple shapes
  const initialDs: any =
    (fields as any)?.data?.datasource ??
    (fields as any)?.datasource ??
    (fields as any) ??
    (rendering as any)?.fields ??
    {};
  const ds: any =
    initialDs && typeof initialDs === 'object' && initialDs.fields ? initialDs.fields : initialDs;

  // Datasource id from rendering to decide fallback behavior
  const dsId = (rendering as any)?.dataSource || (rendering as any)?.datasource || undefined;

  // Access main datasource fields - use Title and Link directly
  // Pass full field objects for PageEditor compatibility
  const titleField = ds?.Title;
  const linkField = ds?.Link;

  // Get Items collection - handle both targetItems and direct array
  const itemsSource = ds?.Items;
  const originalItems = Array.isArray(itemsSource?.targetItems)
    ? itemsSource.targetItems
    : Array.isArray(itemsSource)
      ? itemsSource
      : [];

  // Slider configuration
  const CARDS_PER_SLIDE = 4;
  const isSliderMode = originalItems.length > 4;
  const originalTotalSlides = isSliderMode ? Math.ceil(originalItems.length / CARDS_PER_SLIDE) : 1;
  const items = isSliderMode
    ? [...originalItems, ...originalItems, ...originalItems]
    : originalItems;
  const totalSlides = isSliderMode ? originalTotalSlides * 3 : 1;

  useEffect(() => {
    const initialSlide = isSliderMode ? originalTotalSlides + 1 : 1;
    setCurrentSlide(initialSlide);

    if (isSliderMode && sliderRef.current) {
      const slideWidth = sliderRef.current.scrollWidth / totalSlides;
      sliderRef.current.scrollTo({
        left: slideWidth * originalTotalSlides,
        behavior: 'auto',
      });
    }
  }, [originalItems.length, isSliderMode, originalTotalSlides, totalSlides]);

  const scrollToSlide = (slideNumber: number, instant = false) => {
    if (!sliderRef.current || !isSliderMode) return;

    const slideWidth = sliderRef.current.scrollWidth / totalSlides;
    sliderRef.current.scrollTo({
      left: slideWidth * (slideNumber - 1),
      behavior: instant ? 'auto' : 'smooth',
    });

    if (!instant) {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        let equivalentSlide: number | null = null;

        if (slideNumber <= originalTotalSlides) {
          equivalentSlide = slideNumber + originalTotalSlides;
        } else if (slideNumber > 2 * originalTotalSlides) {
          equivalentSlide = slideNumber - originalTotalSlides;
        }

        if (equivalentSlide) {
          setCurrentSlide(equivalentSlide);
          scrollToSlide(equivalentSlide, true);
        }
      }, 500);
    }
  };

  const goToPrevSlide = () => {
    const newSlide = currentSlide - 1;
    setCurrentSlide(newSlide);
    scrollToSlide(newSlide);
  };

  const goToNextSlide = () => {
    const newSlide = currentSlide + 1;
    setCurrentSlide(newSlide);
    scrollToSlide(newSlide);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Group items into slides
  const slides = isSliderMode
    ? Array.from({ length: totalSlides }, (_, i) =>
      items.slice(i * CARDS_PER_SLIDE, (i + 1) * CARDS_PER_SLIDE),
    )
    : [items];

  // Show fallback only when there is no datasource id at all
  if (!dsId && !isPageEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'CertificatesSlider'} />;
  }

  return (
    <section
      className="mb-12 py-6 md:mb-16 md:pt-8 md:pb-0"
      data-component="CertificatesSlider-Advantages"
    >
      <div className="mx-auto max-w-[1360px] px-2 md:px-[10px]">
        {/* Title */}
        {(titleField || isPageEditing) && (
          <div className="mb-4">
            <Text tag="h2" field={titleField} className="font-heading-h2 lg:mt-[30px] lg:mb-[20px]" />
          </div>
        )}

        {/* Certificates Grid/Slider */}
        {(items.length > 0 || isPageEditing) && (
          <div className="relative">
            <div
              ref={sliderRef}
              className={` ${isSliderMode ? 'scrollbar-hide overflow-x-auto lg:overflow-hidden' : ''} ${isSliderMode ? 'flex' : 'grid grid-cols-1 md:grid-cols-1 lg:grid-cols-4'} gap-8 md:gap-15 ${isSliderMode ? '' : 'md:mb-9'} `}
              style={{
                scrollSnapType: isSliderMode ? 'x mandatory' : undefined,
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {isSliderMode
                ? slides.map((slideItems, slideIndex) => (
                  <div
                    key={slideIndex}
                    className="grid min-w-full grid-cols-1 gap-8 md:grid-cols-2 md:gap-15 lg:grid-cols-4"
                    style={{ scrollSnapAlign: 'start' }}
                  >
                    {slideItems.map((item: any, index: number) =>
                      renderCard(item, slideIndex * CARDS_PER_SLIDE + index),
                    )}
                  </div>
                ))
                : items.map((item: any, index: number) => renderCard(item, index))}
            </div>

            {/* Desktop Navigation - Bottom Right */}
            {isSliderMode && (
              <div className="mt-24 hidden items-end justify-end gap-4 lg:flex">
                {/* Slide Indicator - Show position relative to original slides */}
                <span className="text-lg font-semibold text-[var(--color-text,#000000)]">
                  {((currentSlide - 1) % originalTotalSlides) + 1} / {originalTotalSlides}
                </span>

                {/* Navigation Buttons */}
                <div className="flex gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={goToPrevSlide}
                    onKeyDown={(e) => handleKeyDown(e, goToPrevSlide)}
                    aria-label="Previous slide"
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-black bg-white p-0 transition-all duration-200 hover:cursor-pointer"
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={goToNextSlide}
                    onKeyDown={(e) => handleKeyDown(e, goToNextSlide)}
                    aria-label="Next slide"
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[var(--color-text,#000000)] bg-white transition-all duration-200 hover:cursor-pointer"
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section CTA - with left-to-right underline animation */}
        <div>
          {linkField &&
            (() => {
              // Check for link value in both jsonValue and direct value formats
              const hasLinkValue =
                linkField?.value?.href ||
                (linkField as any)?.jsonValue?.value?.href ||
                isPageEditing;

              if (!hasLinkValue) {
                return null;
              }

              // Get link text from field
              const linkText =
                linkField?.value?.text ||
                (linkField as any)?.jsonValue?.value?.text ||
                'Our certificates';

              return (
                <div className="mt-8 flex justify-start font-bold md:mt-0 md:mb-1 md:pt-4 md:text-lg 2xl:text-xl">
                  <Link
                    field={linkField}
                    className="group relative inline-flex items-center gap-2 font-bold text-[var(--color-text,#000000)] no-underline transition-colors md:gap-1"
                  >
                    <img
                      src="/assets/icons/chevron-right.svg"
                      alt=""
                      className="-ml-1 h-4 w-4 md:h-5 md:w-5"
                    />
                    <span className="relative text-[17px] font-bold md:text-lg">
                      {linkText}
                      <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--color-text,#000000)] transition-all duration-300 group-hover:w-full"></span>
                    </span>
                  </Link>
                </div>
              );
            })()}
        </div>
      </div>
    </section>
  );

  // Card rendering function - modified for Advantages variant
  function renderCard(item: any, index: number) {
    // Access fields directly from child item - pass full field objects for PageEditor compatibility
    const itemTitleField = item?.fields?.Title;
    const itemDescriptionField = item?.fields?.Description;
    const itemImageField = item?.fields?.Image;

    // Check for image value in both jsonValue and direct value formats
    const hasImageValue =
      itemImageField?.value?.src || (itemImageField as any)?.jsonValue?.value?.src || isPageEditing;

    // Check for title value
    const hasTitleValue =
      itemTitleField?.value || (itemTitleField as any)?.jsonValue?.value || isPageEditing;

    // Check for description value
    const hasDescriptionValue =
      itemDescriptionField?.value ||
      (itemDescriptionField as any)?.jsonValue?.value ||
      isPageEditing;

    // Skip if no content and not editing
    if (!hasImageValue && !hasTitleValue && !hasDescriptionValue && !isPageEditing) {
      return null;
    }

    return (
      <div key={item?.id || item?.itemId || index} className="flex flex-row lg:flex-col lg:gap-4">
        {/* Icon Container (Left column on mobile) */}
        {hasImageValue && (
          <div className="mb-[15px] flex shrink-0 items-start pl-[32px] pr-[15px] lg:m-0 lg:p-0">
            <Image
              field={itemImageField}
              className="h-auto max-h-[48px] w-auto max-w-[48px] object-contain"
              loading="lazy"
              alt={item?.fields?.Image?.value?.alt || ''}
            />
          </div>
        )}

        {/* Content Column (Right column on mobile) */}
        <div className="flex flex-1 flex-col lg:gap-3">
          {hasTitleValue && (
            <Text
              tag="h3"
              field={itemTitleField}
              className="text-xl leading-snug font-bold lg:text-2xl"
            />
          )}

          {hasDescriptionValue && (
            <div className="mt-[15px] text-[17px] leading-[28px] antialiased lg:mt-0 lg:text-lg lg:text-[17px] lg:leading-relaxed">
              <RichText field={itemDescriptionField} />
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default Default;

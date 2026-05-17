'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Link as SitecoreLink,
  RichText,
  Text,
  Image as SitecoreImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import type { CarouselProps } from './Carousel.props';
import { ChevronLeft, ChevronRight, Droplets, RefreshCw, Coins } from 'lucide-react';

/* ---------- helpers modified---------- */
const hasLinkField = (field: any) => field && (field.value?.href || field.jsonValue?.value?.href);

type CarouselVariantProps = CarouselProps & {
  autoplayenabled?: boolean;
  autoplayinterval?: number;
};

const resolveSlides = (fields: any) => {
  const datasource: any = fields?.data?.datasource || fields;
  return datasource?.Slides?.targetItems || datasource?.Slides || datasource?.Items || [];
};

const useLandingSwipe = ({
  isPageEditing,
  slidesLength,
  onSwipeLeft,
  onSwipeRight,
}: {
  isPageEditing: boolean;
  slidesLength: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}) => {
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const touchEndYRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isPageEditing || slidesLength <= 1) return;
    const touch = e.touches[0];
    if (!touch) return;
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    touchEndXRef.current = null;
    touchEndYRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isPageEditing || slidesLength <= 1) return;
    const touch = e.touches[0];
    if (!touch) return;
    touchEndXRef.current = touch.clientX;
    touchEndYRef.current = touch.clientY;
  };

  const handleTouchEnd = () => {
    if (isPageEditing || slidesLength <= 1) return;

    const startX = touchStartXRef.current;
    const startY = touchStartYRef.current;
    const endX = touchEndXRef.current;
    const endY = touchEndYRef.current;

    if (startX == null || startY == null || endX == null || endY == null) return;

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < 50 || absX <= absY) return;

    if (deltaX < 0) {
      onSwipeLeft();
    } else {
      onSwipeRight();
    }
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};

const DefaultCarouselVariant: React.FC<CarouselVariantProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing ?? false;
  const slides = resolveSlides(fields);

  const [activeIndex, setActiveIndex] = useState(0);

  const goNext = () => {
    setActiveIndex((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const goPrev = () => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };

  if (!slides.length && !isPageEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'Carousel'} />;
  }

  return (
    <section className="relative mx-auto max-w-[1360px] overflow-hidden my-10 lg:my-14" data-component="HeroCarousel">
      <div className={cn('relative', isPageEditing ? 'flex flex-col gap-8' : 'min-h-[520px]')}>
        {slides.map((slide: any, index: number) => {
          const slideFields = slide.fields || slide;
          const imageField = slideFields?.Image?.jsonValue || slideFields?.Image;
          const titleField = slideFields?.Title?.jsonValue || slideFields?.Title;
          const descriptionField = slideFields?.Description?.jsonValue || slideFields?.Description;
          const linkField = slideFields?.Link?.jsonValue || slideFields?.Link;
          const isActive = index === activeIndex;

          return (
            <div
              key={slide.id || index}
              className={cn(
                'grid grid-cols-1 transition-opacity duration-700 md:grid-cols-[1.2fr_1fr]',
                isPageEditing
                  ? 'relative border-b border-black/10 pb-8 last:border-0'
                  : cn('absolute inset-0', isActive ? 'opacity-100' : 'pointer-events-none opacity-0'),
              )}
            >
              {isPageEditing && (
                <div className="absolute top-2 left-2 z-20 rounded bg-black/80 px-2 py-1 text-xs font-bold text-white">
                  Slide {index + 1}
                </div>
              )}

              <div className="relative">
                {(imageField?.value?.src || isPageEditing) && (
                  <SitecoreImage field={imageField} className="h-full w-full object-cover" priority={isActive} />
                )}
              </div>

              <div className="flex flex-col justify-center bg-(--color-accent-primary) px-6 xl:px-10">
                {(titleField?.value || isPageEditing) && (
                  <h2 className="font-heading-h3 mb-6 ">
                    <Text field={titleField} />
                  </h2>
                )}

                {(descriptionField?.value || isPageEditing) && (
                  <div className="mb-8 max-w-prose text-base leading-relaxed text-black text-[17px] ">
                    <RichText field={descriptionField} />
                  </div>
                )}

                {hasLinkField(linkField) && !isPageEditing && (
                  <SitecoreLink field={linkField} className="inline-flex items-center gap-2 font-bold text-black">
                    {linkField?.value?.text || 'Learn more'}
                    <ChevronRight className="h-4 w-4" />
                  </SitecoreLink>
                )}

                {isPageEditing && (
                  <div className="mt-6 border-t border-black/20 pt-3">
                    <SitecoreLink field={linkField} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!isPageEditing && slides.length > 1 && (
        <div className="absolute right-6 bottom-6 z-10 flex items-center gap-4 md:right-12 md:bottom-10">
          <div className="flex items-center gap-2">
            {slides.map((_: any, index: number) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'h-3 w-3 rounded-full transition-colors border border-black',
                  index === activeIndex ? 'border-pink-600 bg-pink-600' : 'border-black',
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goPrev}
              disabled={activeIndex === 0}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black bg-white transition-opacity hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goNext}
              disabled={activeIndex === slides.length - 1}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black bg-white transition-opacity hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

const LandingPageCarouselVariant: React.FC<CarouselVariantProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing ?? false;
  const slides = resolveSlides(fields);

  const [activeIndex, setActiveIndex] = useState(0);
  const TitleTag: React.ElementType = 'h3';

  const goNext = () => {
    setActiveIndex((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const goPrev = () => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useLandingSwipe({
    isPageEditing,
    slidesLength: slides.length,
    onSwipeLeft: () => setActiveIndex((prev) => (prev + 1) % slides.length),
    onSwipeRight: () => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length),
  });

  if (!slides.length && !isPageEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'Carousel'} />;
  }

  return (
    <section className="relative overflow-hidden my-10 lg:my-14 mx-auto w-[90%]" data-component="CarouselLandingPage">
      <div className={cn('relative', isPageEditing ? 'flex flex-col gap-8' : 'min-h-[620px]')}>
        {slides.map((slide: any, index: number) => {
          const slideFields = slide.fields || slide;
          const imageField = slideFields?.Image?.jsonValue || slideFields?.Image;
          const titleField = slideFields?.Title?.jsonValue || slideFields?.Title;
          const descriptionField = slideFields?.Description?.jsonValue || slideFields?.Description;
          const linkField = slideFields?.Link?.jsonValue || slideFields?.Link;
          const isActive = index === activeIndex;

          return (
            <div
              key={slide.id || index}
              className={cn(
                'transition-opacity duration-700',
                isPageEditing
                  ? 'relative border-b border-black/10 pb-8 last:border-0'
                  : isActive
                    ? 'block opacity-100 lg:absolute lg:inset-0'
                    : 'hidden lg:block lg:absolute lg:inset-0 lg:pointer-events-none lg:opacity-0',
              )}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {isPageEditing && (
                <div className="absolute top-2 left-2 z-20 rounded bg-black/80 px-2 py-1 text-xs font-bold text-white">
                  Slide {index + 1}
                </div>
              )}

              <div className="grid h-full grid-cols-1 lg:grid-cols-2 lg:items-stretch">
                <div className="relative h-[360px] lg:h-full">
                  {(imageField?.value?.src || isPageEditing) && (
                    <SitecoreImage
                      field={imageField}
                      className="h-full w-full object-contain object-center lg:object-cover"
                      priority={isActive}
                    />
                  )}
                </div>

                {!isPageEditing && slides.length > 1 && (
                  <div className="flex items-center justify-center gap-2 bg-(--color-accent-primary) px-6 py-4 lg:hidden">
                    {slides.map((_: any, dotIndex: number) => (
                      <button
                        key={dotIndex}
                        onClick={() => setActiveIndex(dotIndex)}
                        className={cn(
                          'h-6 w-6 md:h-6 md:w-6 rounded-full transition-colors border border-black',
                          dotIndex === activeIndex
                            ? 'border-pink-600 bg-pink-600'
                            : 'border-black bg-transparent',
                        )}
                        aria-label={`Go to slide ${dotIndex + 1}`}
                      />
                    ))}
                  </div>
                )}

                <div
                  className={cn(
                    'flex flex-col justify-center bg-(--color-accent-primary) px-6 xl:px-10',
                    'pb-10 lg:pb-0',
                    !isPageEditing && slides.length > 1 ? 'pt-6 lg:pt-0' : 'pt-10 lg:pt-0',
                    'lg:h-full',
                  )}
                >
                  <div className="mx-auto w-full min-w-[256px] max-w-[460px] lg:mx-0 lg:min-w-0 lg:max-w-none">
                    {(titleField?.value || isPageEditing) && (
                      <TitleTag className="font-heading-h3 mb-6 ">
                        <Text field={titleField} />
                      </TitleTag>
                    )}

                    {(descriptionField?.value || isPageEditing) && (
                      <div className="mb-8 max-w-prose text-base leading-relaxed text-black text-[17px] ">
                        <RichText field={descriptionField} />
                      </div>
                    )}

                    {hasLinkField(linkField) && !isPageEditing && (
                      <SitecoreLink field={linkField} className="inline-flex items-center gap-2 font-bold text-black">
                        {linkField?.value?.text || 'Learn more'}
                        <ChevronRight className="h-4 w-4" />
                      </SitecoreLink>
                    )}

                    {isPageEditing && (
                      <div className="mt-6 border-t border-black/20 pt-3">
                        <SitecoreLink field={linkField} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!isPageEditing && slides.length > 1 && (
                <div className="absolute bottom-6 z-10 hidden inset-x-0 lg:block lg:left-1/2 lg:w-1/2">
                  <div className="flex w-full items-center justify-between px-6 lg:px-8 xl:px-12">
                    <div className="flex items-center gap-2">
                      {slides.map((_: any, dotIndex: number) => (
                        <button
                          key={dotIndex}
                          onClick={() => setActiveIndex(dotIndex)}
                          className={cn(
                            'h-3 w-3 rounded-full transition-colors border border-black',
                            dotIndex === activeIndex ? 'border-pink-600 bg-pink-600' : 'border-black',
                          )}
                          aria-label={`Go to slide ${dotIndex + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={goPrev}
                        disabled={activeIndex === 0}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black bg-white transition-opacity hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={goNext}
                        disabled={activeIndex === slides.length - 1}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black bg-white transition-opacity hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white"
                        aria-label="Next slide"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

const LandingPageAutoScrollCarouselVariant: React.FC<CarouselVariantProps> = (props) => {
  const { fields, rendering, autoplayenabled = true } = props;
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing ?? false;
  const slides = resolveSlides(fields);

  const [activeIndex, setActiveIndex] = useState(0);
  const TitleTag: React.ElementType = 'h3';

  const goNext = () => {
    setActiveIndex((prev) => Math.min(prev + 1, slides.length - 1));
  };

  const goPrev = () => {
    setActiveIndex((prev) => Math.max(0, prev - 1));
  };

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useLandingSwipe({
    isPageEditing,
    slidesLength: slides.length,
    onSwipeLeft: () => setActiveIndex((prev) => (prev + 1) % slides.length),
    onSwipeRight: () => setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length),
  });

  useEffect(() => {
    if (isPageEditing) return;
    if (!autoplayenabled) return;
    if (slides.length <= 1) return;

    const intervalMs = 3000;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);

    return () => {
      window.clearInterval(id);
    };
  }, [autoplayenabled, isPageEditing, slides.length]);

  if (!slides.length && !isPageEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'Carousel'} />;
  }

  return (
    <section className="relative overflow-hidden my-10 lg:my-14 mx-auto w-[90%]" data-component="CarouselLandingPageAutoScroll">
      <div className={cn('relative', isPageEditing ? 'flex flex-col gap-8' : 'min-h-[620px]')}>
        {slides.map((slide: any, index: number) => {
          const slideFields = slide.fields || slide;
          const imageField = slideFields?.Image?.jsonValue || slideFields?.Image;
          const titleField = slideFields?.Title?.jsonValue || slideFields?.Title;
          const descriptionField = slideFields?.Description?.jsonValue || slideFields?.Description;
          const linkField = slideFields?.Link?.jsonValue || slideFields?.Link;
          const isActive = index === activeIndex;

          return (
            <div
              key={slide.id || index}
              className={cn(
                'transition-opacity duration-700',
                isPageEditing
                  ? 'relative border-b border-black/10 pb-8 last:border-0'
                  : cn(
                      isActive ? 'block lg:block' : 'hidden lg:block',
                      'lg:absolute lg:inset-0 lg:transition-transform lg:duration-700 lg:ease-in-out',
                    ),
              )}
              style={
                isPageEditing
                  ? undefined
                  : {
                      transform: `translateX(${(index - activeIndex) * 100}%)`,
                    }
              }
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {isPageEditing && (
                <div className="absolute top-2 left-2 z-20 rounded bg-black/80 px-2 py-1 text-xs font-bold text-white">
                  Slide {index + 1}
                </div>
              )}

              <div className="grid h-full grid-cols-1 lg:grid-cols-2 lg:items-stretch">
                <div className="relative h-[360px] lg:h-full">
                  {(imageField?.value?.src || isPageEditing) && (
                    <SitecoreImage
                      field={imageField}
                      className="h-full w-full object-contain object-center lg:object-cover"
                      priority={isActive}
                    />
                  )}
                </div>

                {!isPageEditing && slides.length > 1 && (
                  <div className="flex items-center justify-center gap-2 bg-(--color-accent-primary) px-6 py-4 lg:hidden">
                    {slides.map((_: any, dotIndex: number) => (
                      <button
                        key={dotIndex}
                        onClick={() => setActiveIndex(dotIndex)}
                        className={cn(
                          'h-6 w-6 md:h-6 md:w-6 rounded-full transition-colors border border-black',
                          dotIndex === activeIndex
                            ? 'border-pink-600 bg-pink-600'
                            : 'border-black bg-transparent',
                        )}
                        aria-label={`Go to slide ${dotIndex + 1}`}
                      />
                    ))}
                  </div>
                )}

                <div
                  className={cn(
                    'flex flex-col justify-center bg-(--color-accent-primary) px-6 xl:px-10',
                    'pb-10 lg:pb-0',
                    !isPageEditing && slides.length > 1 ? 'pt-6 lg:pt-0' : 'pt-10 lg:pt-0',
                    'lg:h-full',
                  )}
                >
                  <div className="mx-auto w-full min-w-[256px] max-w-[460px] lg:mx-0 lg:min-w-0 lg:max-w-none">
                    {(titleField?.value || isPageEditing) && (
                      <TitleTag className="font-heading-h3 mb-6 ">
                        <Text field={titleField} />
                      </TitleTag>
                    )}

                    {(descriptionField?.value || isPageEditing) && (
                      <div className="mb-8 max-w-prose text-base leading-relaxed text-black text-[17px] ">
                        <RichText field={descriptionField} />
                      </div>
                    )}

                    {hasLinkField(linkField) && !isPageEditing && (
                      <SitecoreLink field={linkField} className="inline-flex items-center gap-2 font-bold text-black">
                        {linkField?.value?.text || 'Learn more'}
                        <ChevronRight className="h-4 w-4" />
                      </SitecoreLink>
                    )}

                    {isPageEditing && (
                      <div className="mt-6 border-t border-black/20 pt-3">
                        <SitecoreLink field={linkField} />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {!isPageEditing && slides.length > 1 && (
                <div className="absolute bottom-6 z-10 hidden inset-x-0 lg:block lg:left-1/2 lg:w-1/2">
                  <div className="flex w-full items-center justify-between px-6 lg:px-8 xl:px-12">
                    <div className="flex items-center gap-2">
                      {slides.map((_: any, dotIndex: number) => (
                        <button
                          key={dotIndex}
                          onClick={() => setActiveIndex(dotIndex)}
                          className={cn(
                            'h-3 w-3 rounded-full transition-colors border border-black',
                            dotIndex === activeIndex ? 'border-pink-600 bg-pink-600' : 'border-black',
                          )}
                          aria-label={`Go to slide ${dotIndex + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={goPrev}
                        disabled={activeIndex === 0}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black bg-white transition-opacity hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={goNext}
                        disabled={activeIndex === slides.length - 1}
                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black bg-white transition-opacity hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-white"
                        aria-label="Next slide"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

/* =========================================================
   CARDS VARIANT (AUTOPLAY CONFIGURED)
========================================================= */
const Cards: React.FC<CarouselProps> = (props) => {
  const { fields, rendering } = props;

  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing ?? false;

  const datasource: any = fields?.data?.datasource || fields;

  const cards = datasource?.Slides?.targetItems || datasource?.Slides || datasource?.Items || [];

  const [activeIndex, setActiveIndex] = useState(0);

  const [itemsToShow, setItemsToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsToShow(1);
      } else if (window.innerWidth < 1024) {
        setItemsToShow(2);
      } else {
        setItemsToShow(3);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const goPrev = () => {
    setActiveIndex((prev) => Math.max(0, prev - itemsToShow));
  };

  const goNext = () => {
    setActiveIndex((prev) => Math.min(prev + itemsToShow, cards.length - 1));
  };

  const totalPages = Math.ceil(cards.length / itemsToShow);
  const currentPage = Math.floor(activeIndex / itemsToShow) + 1;

  if (!cards.length && !isPageEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'Carousel (Cards)'} />;
  }

  return (
    <section
      className="relative mx-auto max-w-[1360px] px-2 py-16"
      data-component="HeroCarouselCards"
    >
      {(datasource?.Title?.value || isPageEditing) && (
        <h2 className="mb-12 text-center text-4xl font-bold">
          <Text field={datasource?.Title} />
        </h2>
      )}

      <div className="relative overflow-hidden">
        <div
          className={cn('flex transition-transform duration-500', isPageEditing && 'flex-col')}
          style={{
            transform: isPageEditing ? 'none' : `translateX(-${activeIndex * (100 / itemsToShow)}%)`,
          }}
        >
          {cards.map((card: any, index: number) => {
            const fields = card.fields || card;

            const imageField = fields?.Image?.jsonValue || fields?.Image;
            const titleField = fields?.Title?.jsonValue || fields?.Title;
            const descriptionField = fields?.Description?.jsonValue || fields?.Description;

            return (
              <div
                key={card.id || index}
                className={cn(
                  'relative min-w-full p-4 md:min-w-[50%] lg:min-w-[33.333%]',
                  isPageEditing && 'md:min-w-full lg:min-w-full',
                )}
                style={{ padding: '0 1.6rem' }}
              >
                {isPageEditing && (
                  <div className="absolute top-6 left-10 z-20 rounded bg-black/80 px-2 py-1 text-xs font-bold text-white">
                    Slide {index + 1}
                  </div>
                )}

                <article
                  className="flex h-full flex-col p-8 bg-(--color-accent-primary)"
                  style={{
                    minHeight: '380px',
                  }}
                >
                  {/* Icon at the top */}
                  <div className="m-0 mb-6 mb-[calc(var(--spacing)*6)] block w-1/3 [align-self:unset] pr-0">
                    {(imageField?.value?.src || isPageEditing) && (
                      <SitecoreImage
                        field={imageField}
                        className="h-full w-full object-contain"
                        priority={false}
                      />
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className="mb-4 text-xl leading-tight font-bold"
                    style={{ margin: 0, lineHeight: '1.3' }}
                  >
                    <Text field={titleField} />
                  </h3>

                  {/* Description */}
                  <div className="text-base leading-relaxed">
                    <RichText field={descriptionField} />
                  </div>
                </article>
              </div>
            );
          })}
        </div>

        {!isPageEditing && cards.length > itemsToShow && (
          <div className="mt-8 flex items-center justify-end gap-3">
            <span className="text-lg font-medium">
              {currentPage}/{totalPages}
            </span>
            <button
              onClick={goPrev}
              disabled={activeIndex === 0}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black bg-white transition-opacity disabled:opacity-30"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={goNext}
              disabled={activeIndex + itemsToShow >= cards.length}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-black bg-white transition-opacity disabled:opacity-30"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

/* =========================================================
   COTTON VARIANT (2.5 slides visible, rolling background)
========================================================= */
const Cotton: React.FC<CarouselProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing ?? false;

  const datasource: any = fields?.data?.datasource || fields;

  const slides = datasource?.Slides?.targetItems || datasource?.Slides || datasource?.Items || [];

  const [currentSlide, setCurrentSlide] = useState(0);

  const SLIDE_WIDTH_PERCENT = 80;
  const translateX = currentSlide * SLIDE_WIDTH_PERCENT;

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (!slides.length && !isPageEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'Carousel (Cotton)'} />;
  }

  // Background image field from datasource
  const backgroundImage =
    datasource?.BackgroundImage?.jsonValue?.value?.src ||
    datasource?.BackgroundImage?.value?.src ||
    '/images/cws-cotton-texture.png';

  const leftImage =
    datasource?.LeftImage?.jsonValue?.value?.src ||
    datasource?.LeftImage?.value?.src ||
    '/images/cotton-rotation-loop00.png';

  return (
    <div className="w-full">
      <section className="relative w-full overflow-hidden" data-component="HeroCarouselCotton">
        {/* Rolling background */}
        <div
          className="absolute inset-0 h-full transition-transform duration-500 ease-in-out"
          style={{
            width: `${slides.length * SLIDE_WIDTH_PERCENT + 100}%`,
            backgroundImage: `url("${backgroundImage}")`,
            backgroundSize: 'auto 100%',
            backgroundRepeat: 'repeat-x',
            transform: `translateX(-${(translateX / (slides.length * SLIDE_WIDTH_PERCENT + 100)) * 100}%)`,
          }}
        />

        <div className={cn(' w-full h-[800px]', isPageEditing && 'h-auto')}>
          <div className={cn('relative flex ', isPageEditing && 'flex-col')}>
            {!isPageEditing && (
              <div className="w-full md:w-1/2 overflow-hidden relative">
                <img
                  src={leftImage || '/placeholder.svg'}
                  alt="Cotton towel roll"
                  className="absolute left-0 top-[-20px] w-full h-[900px] object-cover object-top z-10"
                />
              </div>
            )}

            <div
              className={cn('flex h-[800px] transition-transform duration-500 ease-in-out', isPageEditing && 'flex-col')}
              style={{ transform: isPageEditing ? 'none' : `translateX(-${translateX}%)` }}
            >
              {/* Content slides */}
              {slides.map((slide: any, index: number) => {
                const slideFields = slide.fields || slide;

                const titleField = slideFields?.Title?.jsonValue || slideFields?.Title;
                const descriptionField =
                  slideFields?.Description?.jsonValue || slideFields?.Description;

                return (
                  <div
                    key={slide.id || index}
                    className={cn('relative flex shrink-0 items-center', isPageEditing && 'w-full py-8 border-b border-black/10 last:border-0')}
                    style={{ width: isPageEditing ? '100%' : `${SLIDE_WIDTH_PERCENT}%` }}
                  >
                    {isPageEditing && (
                      <div className="absolute top-2 left-8 z-20 rounded bg-black/80 px-2 py-1 text-xs font-bold text-white">
                        Slide {index + 1}
                      </div>
                    )}

                    <div className="ml-2 sm:ml-0">
                      {/* Title */}
                      {(titleField?.value || isPageEditing) && (
                        <h2 className="text-foreground mb-4 text-2xl font-semibold lg:text-3xl">
                          <Text field={titleField} />
                        </h2>
                      )}

                      {/* Description (RichText - can include images like delivery van) */}
                      {(descriptionField?.value || isPageEditing) && (
                        <div className="text-muted-foreground text-base leading-relaxed lg:text-lg">
                          <RichText field={descriptionField} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Dots navigation below carousel */}
      {!isPageEditing && slides.length > 1 && (
        <div className="flex justify-center gap-3 bg-white py-6 cursor-pointer">
          {slides.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-4 w-4 md:h-6 md:w-6 rounded-full border-2 border-black transition-all',
                currentSlide === index ? 'bg-black' : 'bg-transparent hover:bg-gray-200',
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Named exports
export const Default: React.FC<CarouselVariantProps> = (props) => <DefaultCarouselVariant {...props} />;

export const LandingPage: React.FC<CarouselVariantProps> = (props) => (
  <LandingPageCarouselVariant {...props} />
);

export const LandingPageAutoScroll: React.FC<CarouselVariantProps> = (props) => (
  <LandingPageAutoScrollCarouselVariant {...props} />
);

export { Cards, Cotton };

export default Default;

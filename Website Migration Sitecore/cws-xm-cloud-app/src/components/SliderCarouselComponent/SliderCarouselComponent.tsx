'use client';

import { useEffect, useRef, useState } from 'react';
import type { LinkField } from '@sitecore-content-sdk/nextjs';
import { Image, Link, RichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ChevronRight } from 'lucide-react';

import type {
  SliderCarouselComponentProps,
  SliderCarouselItem,
} from './SliderCarouselComponent.props';

import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { patchLinkField } from '@/lib/patch-link';
import { useSiteName } from '@/hooks/useSiteName';

const hasLinkField = (field?: SliderCarouselComponentProps['fields']['Link']) => {
  return field && (field.value?.href || (field as any).href);
};

const hasValidItems = (items?: SliderCarouselItem[], isPageEditing?: boolean): boolean => {
  if (isPageEditing) return true;
  return Boolean(items && items.length > 0);
};

export const Default: React.FC<SliderCarouselComponentProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const siteName = useSiteName();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    startScrollLeft: 0,
    didDrag: false,
  });
  const [scrollBar, setScrollBar] = useState({ widthPct: 43, offsetPct: 0 });
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileLeftArrowActive, setMobileLeftArrowActive] = useState(false);
  const [hasTouchedOnce, setHasTouchedOnce] = useState(false);
  const [isDraggingUI, setIsDraggingUI] = useState(false);

  const titleField = fields?.Title;
  const subtitleField = fields?.Subtitle;
  const descriptionField = fields?.Description;
  const items = fields?.Items ?? [];
  const linkField = patchLinkField(fields?.Link, siteName) ?? fields?.Link;

  // Mouse wheel scrolling has been disabled so navigation happens only via the arrow controls.

  const getCardWidth = () => {
    if (typeof window === 'undefined') return 516;
    const w = window.innerWidth;
    if (w >= 1440) return 516;
    if (w >= 1024) return (138 / 416) * (w - 1024) + 378; // 1024-1440: 378 -> 516
    if (w >= 768) return (34 / 256) * (w - 768) + 344; // 768-1024: 344 -> 378
    return (60 / 448) * (Math.max(320, w) - 320) + 284; // 320-768: 284 -> 344
  };

  const scrollByCard = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const cardWidth = getCardWidth();
    const cardGap = 0;
    const cardMargin = 1.6 * 16;
    const step = cardWidth + cardGap + cardMargin * 2;
    const delta = direction === 'left' ? -step : step;
    container.scrollBy({ left: delta, behavior: 'smooth' });
  };

  // const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
  //   const container = scrollContainerRef.current;
  //   if (!container) return;

  //   // Only handle primary button drag.
  //   if (e.button !== 0) return;

  //   dragStateRef.current.isDragging = true;
  //   dragStateRef.current.startX = e.clientX;
  //   dragStateRef.current.startScrollLeft = container.scrollLeft;
  //   dragStateRef.current.didDrag = false;

  //   container.setPointerCapture(e.pointerId);
  // };
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Only handle primary button drag.
    if (e.button !== 0) return;

    // ADDED THIS: If the user is clicking a link or button, do not start the drag.
    // This allows the native click to go through to the "Learn more" link.
    if ((e.target as Element).closest('a, button')) {
      return;
    }

    dragStateRef.current.isDragging = true;
    dragStateRef.current.startX = e.clientX;
    dragStateRef.current.startScrollLeft = container.scrollLeft;
    dragStateRef.current.didDrag = false;
    setIsDraggingUI(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (!dragStateRef.current.isDragging) return;

    const deltaX = e.clientX - dragStateRef.current.startX;
    if (Math.abs(deltaX) > 5) {
      dragStateRef.current.didDrag = true;
      if (!container.hasPointerCapture(e.pointerId)) {
        try {
          container.setPointerCapture(e.pointerId);
        } catch { /* ignore */ }
      }
    }

    // Natural drag direction: dragging right moves content right (scrollLeft decreases).
    container.scrollLeft = dragStateRef.current.startScrollLeft - deltaX;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    dragStateRef.current.isDragging = false;
    setIsDraggingUI(false);
    try {
      container.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was not set.
    }

    // Keep `didDrag` true through the click phase; then clear it.
    window.setTimeout(() => {
      dragStateRef.current.didDrag = false;
    }, 0);
  };

  useEffect(() => {
    const updateIsMobile = () => {
      if (typeof window === 'undefined') return;
      // Treat tablet (md) the same as mobile for arrow behavior: below desktop (< 1024px)
      setIsMobile(window.innerWidth < 1024);
    };

    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);

    return () => {
      window.removeEventListener('resize', updateIsMobile);
    };
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateScrollBar = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;

      if (scrollWidth <= clientWidth) {
        setScrollBar({ widthPct: 100, offsetPct: 0 });
        setAtStart(true);
        setAtEnd(true);
        return;
      }

      // Calculate scroll progress (0 to 1)
      const totalScrollable = scrollWidth - clientWidth;
      const progress = totalScrollable > 0 ? Math.max(0, Math.min(1, scrollLeft / totalScrollable)) : 0;

      // Uniformly use 40% to 100% growth for all screens to ensure precision
      let widthPct;
      if (scrollLeft <= 5) {
        widthPct = 43;
      } else {
        widthPct = 43 + progress * 57;
      }

      // We no longer need an offset because the bar grows from the left edge
      setScrollBar({ widthPct, offsetPct: 0 });

      const isAtStart = scrollLeft <= 30;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1;
      setAtStart(isAtStart);
      setAtEnd(isAtEnd);
    };

    updateScrollBar();
    container.addEventListener('scroll', updateScrollBar);
    window.addEventListener('resize', updateScrollBar);
    return () => {
      container.removeEventListener('scroll', updateScrollBar);
      window.removeEventListener('resize', updateScrollBar);
    };
  }, [isMobile]); // Re-run if isMobile changes, though we're also using currentWidth internally

  const hasContent =
    titleField?.value ||
    subtitleField?.value ||
    descriptionField?.value ||
    hasValidItems(items, isPageEditing);

  if (!fields || (!hasContent && !isPageEditing)) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'SliderCarouselComponent'} />;
  }

  return (
    <section className="w-full mb-12 lg:mb-18 lg:ml-[5px]" data-component="SliderCarouselComponent">
      <div className="mx-auto w-full max-w-[1360px] px-2 md:px-[10px]">
        <div className="flex flex-col">
          <div className="mb-3 lg:mb-6 flex flex-col gap-[8px]">
            {(titleField?.value || isPageEditing) && (
              <Text
                tag="h2"
                field={titleField}
                className="font-heading-h3 m-0 text-[26px] lg:text-[28px] xl:text-[30px] 2xl:text-[44px] "
              />
            )}
            {(subtitleField?.value || isPageEditing) && (
              <Text
                tag="h2"
                field={subtitleField}
                className="font-heading-h2 m-0"
              />
            )}
            {(descriptionField?.value || isPageEditing) && (
              <div className="text-[17px] lg:text-[18px] leading-[28px] [&_p]:mb-3 [&_p:last-child]:mb-0">
                <RichText field={descriptionField} />
              </div>
            )}
          </div>

          <div className="relative w-full group">
            <div className="mx-auto w-full max-w-[1360px] py-3 lg:py-6">
              <div
                className={cn(
                  'no-scrollbar relative w-full flex-1 overflow-x-auto overflow-y-hidden',
                  !isDraggingUI && 'snap-x snap-mandatory',
                  'touch-pan-y',
                )}
                ref={scrollContainerRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onClickCapture={(e) => {
                  if (!dragStateRef.current.didDrag) return;
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <div className="flex items-stretch gap-0">
                  {items.map((item: SliderCarouselItem, index: number) => {
                    const itemFields = item.fields;
                    const itemTitle = itemFields?.Title;
                    const itemDescription = itemFields?.Description;
                    const itemImage = itemFields?.Image;
                    const itemLink = itemFields?.Link;
                    const rawItemLinkField = itemLink ?? ({ value: { href: '' } } as LinkField);
                    const itemLinkField = patchLinkField(rawItemLinkField, siteName) ?? rawItemLinkField;
                    const itemLinkText =
                      typeof itemLink?.value?.text === 'string'
                        ? itemLink.value.text
                        : typeof itemLink?.value?.description === 'string'
                          ? itemLink.value.description
                          : 'Learn more';

                    const showCard =
                      itemTitle?.value || itemDescription?.value || itemImage?.value?.src || isPageEditing;

                    if (!showCard) return null;

                    return (
                      <article
                        key={item.id || index}
                        className={cn(
                          'flex shrink-0 snap-start flex-col bg-white fluid-card',
                          'mx-[6px] lg:mx-[16px] border-l-[6px] lg:border-l-[16px] border-l-(--color-accent-primary) shadow-sm',
                        )}
                        style={{}}
                        onClick={() => {
                          if (dragStateRef.current.didDrag) return;
                          if (isMobile) {
                            setMobileLeftArrowActive(true);
                            setHasTouchedOnce(true);
                          }
                        }}
                      >
                        <style jsx>{`
                      article.fluid-card {
                        width: calc(13.39vw + 241.15px); /* 320-768 */
                      }
                      @media (min-width: 768px) {
                        article.fluid-card { width: calc(13.28vw + 242px); } /* 768-1024 */
                      }
                      @media (min-width: 1024px) {
                        article.fluid-card { width: calc(33.17vw + 38.31px); } /* 1024-1440 */
                      }
                      @media (min-width: 1440px) {
                        article.fluid-card { width: 516px; }
                      }

                      .image-container-fluid {
                        height: calc(10.71vw + 179.72px); /* 320-768 */
                      }
                      @media (min-width: 768px) {
                        .image-container-fluid { height: calc(10.94vw + 178px); } /* 768-1024 */
                      }
                      @media (min-width: 1024px) {
                        .image-container-fluid { height: calc(26.44vw + 19.23px); } /* 1024-1440 */
                      }
                      @media (min-width: 1440px) {
                        .image-container-fluid { height: 400px; }
                      }
                    `}</style>
                        {(itemImage?.value?.src || isPageEditing) && (
                          <div className="image-container-fluid min-h-[200px] max-w-[500px] overflow-hidden">
                            <Image
                              field={itemImage}
                              alt={itemTitle?.value ?? 'Carousel image'}
                              className="h-full w-full object-fit object-cover"
                              draggable="false"
                            />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col gap-3 pt-[12px] lg:pt-5 px-[12px] lg:px-5 pb-5 md:pb-7 bg-[#F9F9F9]">
                          {(itemTitle?.value || isPageEditing) && (
                            <Text
                              tag="h3"
                              field={itemTitle}
                              className="font-heading-h3 m-0! text-[18px]! lg:text-[24px]! font-bold! leading-[24px]! pb-[5px] lg:pb-[3px]"
                            />
                          )}
                          {(itemDescription?.value || isPageEditing) && (
                            <div className="text-[14px] leading-[1.6] [&_p]:mb-3 [&_p:last-child]:mb-0 pt-[1px]">
                              <RichText className="mb-8" field={itemDescription} />
                            </div>
                          )}
                          {(hasLinkField(itemLink) || isPageEditing) && (
                            <Link
                              field={itemLinkField}
                              className="group/link mt-auto inline-flex items-center pb-1 pt-0 lg:pt-[10px] text-[14px] font-bold text-black no-underline"
                            >
                              <ChevronRight className="mr-2 shrink-0" size={16} strokeWidth={3} aria-hidden />
                              <span className="relative">
                                {itemLinkText}
                                <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-black transition-all duration-300 group-hover/link:w-full"></span>
                              </span>
                            </Link>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Slider controls over cards - visible on hover (desktop) or via tap state on mobile/tablet */}
            <div className="pointer-events-none absolute inset-x-0 top-[59%] -translate-y-1/2 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100">
              <div className="mx-auto flex w-full max-w-[1360px] items-center px-2 md:px-[10px]">
                {/* Left side container */}
                <div className="flex flex-1 justify-start">
                  {!atStart && (
                    <button
                      type="button"
                      className={cn(
                        'group/arrow-left pointer-events-auto flex h-[70px] w-[70px] items-center justify-center rounded-full bg-black text-white shadow-md transition-opacity duration-200 ease-out',
                        isMobile && !mobileLeftArrowActive && !hasTouchedOnce && 'opacity-0 pointer-events-none',
                      )}
                      aria-label="Scroll left"
                      onClick={() => {
                        scrollByCard('left');
                        if (isMobile) {
                          // Don't hide arrows after first touch - keep them visible
                          if (!hasTouchedOnce) {
                            setMobileLeftArrowActive(false);
                          }
                        }
                      }}
                    >
                      <span className="flex h-8 w-8 items-center justify-center group-hover/arrow-left:animate-bounce">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-8 w-8 fill-current"
                          aria-hidden="true"
                        >
                          <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                        </svg>
                      </span>
                    </button>
                  )}
                </div>

                {/* Right side container */}
                <div className="flex flex-1 justify-end">
                  {!atEnd && (
                    <button
                      type="button"
                      className={cn(
                        'group/arrow-right pointer-events-auto flex h-[70px] w-[70px] items-center justify-center rounded-full bg-black text-white shadow-md transition-opacity duration-200 ease-out',
                        isMobile && !mobileLeftArrowActive && !hasTouchedOnce && 'opacity-0 pointer-events-none',
                      )}
                      aria-label="Scroll right"
                      onClick={() => {
                        scrollByCard('right');
                        if (isMobile) {
                          // Don't hide arrows after first touch - keep them visible
                          if (!hasTouchedOnce) {
                            setMobileLeftArrowActive(false);
                          }
                        }
                      }}
                    >
                      <span className="flex h-8 w-8 items-center justify-center group-hover/arrow-right:animate-bounce">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className="h-8 w-8 fill-current"
                          aria-hidden="true"
                        >
                          <path d="M8.59 16.59 10 18l6-6-6-6-1.41 1.41L13.17 12z" />
                        </svg>
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>

          <div className="mx-auto w-full max-w-[1360px] pb-6 pt-4">
            <div className="relative h-1.5 w-full rounded-full bg-black/20">
              <div
                // Added transition classes for a gentle, smooth filling effect
                className="absolute left-0 top-0 h-1.5 rounded-full bg-black transition-[width] duration-300 ease-out"
                style={{
                  width: `${scrollBar.widthPct}%`,
                }}
              />
            </div>
          </div>

          {(hasLinkField(linkField) || isPageEditing) && (
            <div className="mt-4 flex justify-center md:mt-6">
              <Link
                field={linkField ?? ({ value: { href: '' } } as LinkField)}
                className="inline-flex rounded-2xl border-2 border-black px-10 xl:px-12 py-2 min-[1024px]:max-[1439px]:p-[12px_57px_9px_50px]! text-center text-[16px] xl:text-[20px] font-bold text-black no-underline transition-colors hover:bg-black hover:text-white"
              >
                {typeof linkField?.value?.text === 'string'
                  ? linkField.value.text
                  : typeof linkField?.value?.description === 'string'
                    ? linkField.value.description
                    : 'Learn more'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Default;

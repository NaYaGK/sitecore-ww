'use client';

import { useEffect, useRef } from 'react';
import { Link, RichText, Text, Image, useSitecore } from '@sitecore-content-sdk/nextjs';

import { SliderComponentProps, SlideItem } from './SliderComponent.props';

import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

// Helper to check if link is valid
const hasLinkField = (field: any) => {
  return field && (field.value?.href || field.href);
};

const hasValidSlides = (slides?: SlideItem[], isPageEditing?: boolean): boolean => {
  if (isPageEditing) return true;
  return Boolean(slides && slides.length > 0);
};

export const Default: React.FC<SliderComponentProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Map props to UI data
  const sectionTitleField = fields?.Title;
  const slides = fields?.Slides ?? [];

  // Horizontal scroll hijacking
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Only apply hijack on desktop (md breakpoint is 768px)
      if (window.innerWidth < 768) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      const isAtStart = scrollLeft === 0;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1;

      // Only hijack vertical scroll if we can scroll horizontally
      if (e.deltaY !== 0) {
        // If scrolling down and not at end, or scrolling up and not at start
        if ((e.deltaY > 0 && !isAtEnd) || (e.deltaY < 0 && !isAtStart)) {
          e.preventDefault();
          container.scrollLeft += e.deltaY;
        }
        // If at start or end, allow normal page scroll (don't preventDefault)
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  if (!fields || (!sectionTitleField && !hasValidSlides(slides, isPageEditing))) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'SliderComponent'} />;
  }

  return (
    <section className="mb-4 md:mb-16" data-component="SliderComponent">
      <div className="mx-auto max-w-[1360px] px-2 md:px-[10px]">
        <div>
          {sectionTitleField?.value && (
            <h2 className="font-heading-h2 mb-0!">
              {sectionTitleField.value}
            </h2>
          )}
        </div>

        <div
          className="no-scrollbar relative min-h-[400px] w-full overflow-x-auto overflow-y-hidden py-[50px]"
          ref={scrollContainerRef}
        >
          <div className="grid min-h-[400px] auto-cols-[minmax(80%,1fr)] grid-flow-col items-stretch gap-6 px-2 pb-4 sm:auto-cols-[minmax(48%,1fr)] md:gap-12 lg:w-full lg:auto-cols-[minmax(680px,1fr)]">
            {slides.map((slide: SlideItem, index: number) => {
              const slideFields = slide.fields;
              const iconField = slideFields?.Image;
              const titleField = slideFields?.Title;
              const bodyCopyField = slideFields?.Description;
              const linkField = slideFields?.Link;

              const showIcon = iconField?.value?.src || isPageEditing;
              const showCard = titleField?.value || bodyCopyField?.value || isPageEditing;

              if (!showCard) return null;

              const ctaLink = hasLinkField(linkField) ? linkField : undefined;
              const isEvenCard = index % 2 === 1;

              return (
                <article
                  key={slide.id || index}
                  className={cn(
                    'flex flex-col self-start md:w-full',
                    isEvenCard && 'md:place-self-end',
                    isEvenCard && 'self-end',
                  )}
                >
                  <div className="flex flex-col items-start gap-4 md:w-full md:flex-row md:gap-20">
                    {showIcon && (
                      <div className="flex h-19 w-19 shrink-0 items-center justify-center md:h-25 md:w-25">
                        <Image
                          field={iconField}
                          alt={titleField?.value ?? 'Card icon'}
                          className="block h-full w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="flex flex-1 flex-col gap-3">
                      {(titleField?.value || isPageEditing) && (
                        <h3 className="font-heading-h3 mb-4!">
                          <Text field={titleField} tag="span" />
                        </h3>
                      )}

                      {(bodyCopyField?.value || isPageEditing) && (
                        <div className="rte-content -mt-[10px] mb-0 text-[18px] leading-[25px] font-normal hyphens-manual md:mt-[17px] md:mb-0 md:text-[17px] md:leading-[28px] [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:mb-3 [&_ul]:pl-6">
                          <RichText field={bodyCopyField} />
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {/* Empty slide for spacing */}
            <div className="flex min-h-[400px] w-full items-stretch" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Default;

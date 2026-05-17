'use client';

import { Text, RichText, Image, useSitecore } from '@sitecore-content-sdk/nextjs';
import { SpotlightStoriesProps, StoryItem } from './SpotlightStories.props';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { useState, useEffect, useRef, useCallback } from 'react';
import SpotlightStoriesMobile from './SpotlightStoriesMobile';

export const Default: React.FC<SpotlightStoriesProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const sectionTitleField = fields?.Title;
  const sectionDescriptionField = fields?.Description ;
  const stories = fields?.StoriesItem ?? [];
  const backgroundColor = fields?.BackgroundColor?.value || 'transparent';

  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [shouldCaptureScroll, setShouldCaptureScroll] = useState(false);
  const [stickyEdge, setStickyEdge] = useState<'top' | 'bottom'>('top');
  const IMAGE_FADE_MS = 500;
  const IMAGE_GAP_MS = 400;
  const IMAGE_SEQUENCE_MS = IMAGE_FADE_MS * 2 + IMAGE_GAP_MS;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stickyContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const previousIndexRef = useRef(0);
  const lastScrollTopRef = useRef(0);
  const isTransitioningRef = useRef(false);
  const lastWindowScrollYRef = useRef(0);
  const pageScrollDirectionRef = useRef<'up' | 'down'>('down');
  const wasCapturingRef = useRef(false);
  const imageTransitionTimeoutRef = useRef<number | undefined>(undefined);

  const hasValidStories = (items?: StoryItem[], isEditing?: boolean): boolean => {
    if (isEditing) return true;
    return Boolean(items && items.length > 0);
  };

  if (!fields || (!sectionTitleField && !hasValidStories(stories, isPageEditing))) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'SpotlightStories'} />;
  }

  // Function to scroll to next section
  const scrollToNextSection = useCallback(() => {
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    setShouldCaptureScroll(false);

    const currentSection = sectionRef.current;
    if (!currentSection) return;

    const allSections = Array.from(document.querySelectorAll('section'));
    const currentIndex = allSections.findIndex(section => section === currentSection);
    const nextSection = allSections[currentIndex + 1];

    if (nextSection) {
      nextSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 1000);
    } else {
      isTransitioningRef.current = false;
    }
  }, [stories.length]);

  // Function to scroll to previous section
  const scrollToPreviousSection = useCallback(() => {
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    setShouldCaptureScroll(false);

    const currentSection = sectionRef.current;
    if (!currentSection) return;

    const allSections = Array.from(document.querySelectorAll('section'));
    const currentIndex = allSections.findIndex(section => section === currentSection);
    const previousSection = allSections[currentIndex - 1];

    if (previousSection) {
      previousSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 1000);
    } else {
      isTransitioningRef.current = false;
    }
  }, []);

  // Capture wheel only when section is aligned with viewport top and still spans viewport height.
  useEffect(() => {
    if (!sectionRef.current) return;

    const updateCaptureState = () => {
      const section = sectionRef.current;
      if (!section || typeof window === 'undefined') return;

      const currentScrollY = window.scrollY;
      if (currentScrollY > lastWindowScrollYRef.current) {
        pageScrollDirectionRef.current = 'down';
      } else if (currentScrollY < lastWindowScrollYRef.current) {
        pageScrollDirectionRef.current = 'up';
      }
      lastWindowScrollYRef.current = currentScrollY;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const isAlignedAtTop = rect.top <= 0;
      const stillSpansViewport = rect.bottom >= viewportHeight;
      const nextShouldCapture = isAlignedAtTop && stillSpansViewport;

      const container = stickyContainerRef.current;
      if (nextShouldCapture && !wasCapturingRef.current && container) {
        const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);

        if (pageScrollDirectionRef.current === 'up') {
          container.scrollTop = maxScroll;
          const lastIndex = Math.max(0, stories.length - 1);
          previousIndexRef.current = lastIndex;
          setActiveIndex(lastIndex);
          setScrollDirection('up');
          setScrollProgress(100);
          setStickyEdge('bottom');
        } else {
          container.scrollTop = 0;
          previousIndexRef.current = 0;
          setActiveIndex(0);
          setScrollDirection('down');
          setScrollProgress(0);
          setStickyEdge('top');
        }
      }

      if (!nextShouldCapture && wasCapturingRef.current) {
        setStickyEdge('top');
      }

      wasCapturingRef.current = nextShouldCapture;

      setShouldCaptureScroll(nextShouldCapture);
    };

    updateCaptureState();
    window.addEventListener('scroll', updateCaptureState, { passive: true });
    window.addEventListener('resize', updateCaptureState);

    return () => {
      window.removeEventListener('scroll', updateCaptureState);
      window.removeEventListener('resize', updateCaptureState);
    };
  }, []);

  // Handle wheel events - only when section should capture scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Don't capture if:
      // - Not in editing mode
      // - Shouldn't capture scroll
      // - No container
      // - Currently transitioning between sections
      if (isPageEditing || !shouldCaptureScroll || !stickyContainerRef.current || isTransitioningRef.current) {
        return;
      }

      const container = stickyContainerRef.current;
      const scrollTop = container.scrollTop;
      const containerScrollHeight = container.scrollHeight;
      const containerClientHeight = container.clientHeight;

      const isAtBottom = Math.ceil(scrollTop + containerClientHeight) >= containerScrollHeight - 5;
      const isAtTop = scrollTop <= 5;

      // Scrolling down
      if (e.deltaY > 0) {
        if (!isAtBottom) {
          // Still within this section - allow internal scroll
          e.preventDefault();
          container.scrollTop += e.deltaY;
        } else if (isAtBottom) {
          // Reached bottom of section - move to next section
          e.preventDefault();
          scrollToNextSection();
        }
      }

      // Scrolling up
      if (e.deltaY < 0) {
        if (!isAtTop) {
          // Still within this section - allow internal scroll
          e.preventDefault();
          container.scrollTop += e.deltaY;
        } else if (isAtTop) {
          // Reached top of section - move to previous section
          e.preventDefault();
          scrollToPreviousSection();
        }
      }
    };

    // Add wheel event listener with { passive: false } to allow preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [shouldCaptureScroll, scrollToNextSection, scrollToPreviousSection, isPageEditing]);

  // Memoized scroll handler for internal container scroll
  const handleContainerScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (!stickyContainerRef.current) return;

      const container = stickyContainerRef.current;
      const scrollTop = container.scrollTop;
      const viewportHeight = window.innerHeight;
      const maxScroll = Math.max(0, container.scrollHeight - container.clientHeight);

      // Keep bottom pin only at reverse-capture entry; once internal reverse scrolling starts,
      // anchor to top to prevent sticky-bottom layout glitches/disappearing slides.
      if (stickyEdge === 'bottom' && scrollTop < maxScroll - 2) {
        setStickyEdge('top');
      }

      // Calculate slide index with a forward threshold so fast scroll updates active slide sooner
      const slideIndex = Math.floor((scrollTop + viewportHeight * 0.35) / viewportHeight);
      const clampedIndex = Math.max(0, Math.min(slideIndex, stories.length - 1));

      // Calculate progress once per active slide (0-100%) using the same threshold window
      // as slide activation to avoid a second progress cycle within one slide.
      const slideStart = clampedIndex * viewportHeight - viewportHeight * 0.35;
      const progressPercent = Math.max(
        0,
        Math.min(100, ((scrollTop - slideStart) / viewportHeight) * 100),
      );

      // Update scroll progress
      setScrollProgress(progressPercent);

      // Detect scroll direction
      if (scrollTop > lastScrollTopRef.current) {
        setScrollDirection('down');
      } else if (scrollTop < lastScrollTopRef.current) {
        setScrollDirection('up');
      }
      lastScrollTopRef.current = scrollTop;

      // Only update if index actually changed
      setActiveIndex((prevIndex) => {
        if (prevIndex !== clampedIndex) {
          previousIndexRef.current = prevIndex;
          setIsTransitioning(true);

          // Reset transition state after animation completes
          if (imageTransitionTimeoutRef.current) {
            window.clearTimeout(imageTransitionTimeoutRef.current);
          }
          imageTransitionTimeoutRef.current = window.setTimeout(() => {
            setIsTransitioning(false);
          }, IMAGE_SEQUENCE_MS);

          return clampedIndex;
        }
        return prevIndex;
      });
    });
  }, [stories.length, stickyEdge, IMAGE_SEQUENCE_MS]);

  // Scroll tracking effect on the sticky container
  useEffect(() => {
    const container = stickyContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleContainerScroll, { passive: true });
    handleContainerScroll(); // Initial calculation

    return () => {
      container.removeEventListener('scroll', handleContainerScroll);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (imageTransitionTimeoutRef.current) {
        window.clearTimeout(imageTransitionTimeoutRef.current);
      }
    };
  }, [handleContainerScroll]);

  // Render mobile and desktop versions
  return (
    <>
      {/* Mobile Version - visible on screens < lg */}
      <SpotlightStoriesMobile {...props} />

      {/* Desktop Version - visible on screens >= lg */}
      {renderDesktopVersion()}
    </>
  );

  function renderDesktopVersion() {
    return (
      <section
        ref={sectionRef}
        className="relative my-10 hidden p-0 lg:block"
        style={{ backgroundColor }}
        data-component-name="SpotlightStories"
      >
        <p ref={headerRef}></p>
        {/* Section Header */}
        <div className="mx-auto max-w-[1360px] px-2">
          <div className="pt-16 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-start lg:gap-[60px]">
            {sectionTitleField && (
              <h3 className="font-heading-h3 m-0 max-w-[100%] text-[28px] leading-[1.04] font-bold break-words text-[#1a1a1a] md:text-[40px] lg:text-[44px] [&_strong]:mt-0">
                <RichText field={sectionTitleField} />
              </h3>
            )}
            <div className="hidden lg:block" />
            {sectionDescriptionField && (
              <div className="font-body text-left text-[16px]! leading-[22px]! font-medium! lg:max-w-[520px] lg:text-[18px]! lg:leading-[28px]! [&_p]:m-0!">
                <RichText field={sectionDescriptionField} />
              </div>
            )}
          </div>

          {/* Scrollable Container */}
          <div
            ref={stickyContainerRef}
            className="h-screen w-full scrollbar-hide"
            style={{
              overflowY: shouldCaptureScroll ? 'scroll' : 'hidden',
              scrollSnapType: 'y mandatory',
            }}
          >
            {/* Content container */}
            <div ref={scrollContainerRef} style={{ height: `${(stories.length + 0.5) * 100}vh` }}>
              {/* Slides Container */}
              <div className={`sticky h-screen w-full ${stickyEdge === 'bottom' ? 'bottom-0' : 'top-0'}`}>
                {stories.map((story: StoryItem, index: number) => {
                  const storyFields = story.fields;
                  const titleField = storyFields?.Title;
                  const descriptionField = storyFields?.Description;
                  const imageField = storyFields?.Image;

                  const showItem =
                    titleField?.value ||
                    descriptionField?.value ||
                    imageField?.value?.src ||
                    isPageEditing;

                  if (!showItem) return null;

                  const isActive = index === activeIndex;
                  const isPrevious = index === previousIndexRef.current && isTransitioning;
                  const isNext = index === activeIndex + 1;
                  const isPrevSlide = index === activeIndex - 1;
                  const shouldRender = isActive || isPrevious || isNext || isPrevSlide;

                  if (!shouldRender && !isPageEditing) return null;

                  const getTextAnimationStyle = (): React.CSSProperties => {
                    if (isActive) {
                      return {
                        opacity: 1,
                        transform: 'translateY(0px)',
                        transition:
                          'opacity 0.8s ease-in-out 0.4s, transform 0.8s ease-in-out 0.4s',
                      };
                    } else if (isPrevious) {
                      if (scrollDirection === 'down') {
                        return {
                          opacity: 0,
                          transform: 'translateY(-400px)',
                          transition: 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out',
                        };
                      } else {
                        return {
                          opacity: 0,
                          transform: 'translateY(400px)',
                          transition: 'opacity 0.4s ease-in-out, transform 0.4s ease-in-out',
                        };
                      }
                    } else if (isNext || isPrevSlide) {
                      if (scrollDirection === 'down') {
                        return {
                          opacity: 0,
                          transform: 'translateY(400px)',
                          transition:
                            'opacity 0.8s ease-in-out 0.4s, transform 0.8s ease-in-out 0.4s',
                        };
                      } else {
                        return {
                          opacity: 0,
                          transform: 'translateY(-400px)',
                          transition:
                            'opacity 0.8s ease-in-out 0.4s, transform 0.8s ease-in-out 0.4s',
                        };
                      }
                    } else {
                      return {
                        opacity: 0,
                        transform:
                          scrollDirection === 'down' ? 'translateY(400px)' : 'translateY(-400px)',
                        transition: 'opacity 0.8s ease-in-out, transform 0.8s ease-in-out',
                      };
                    }
                  };

                  const getImageAnimationStyle = (): React.CSSProperties => {
                    if (isActive) {
                      if (isTransitioning && index !== previousIndexRef.current) {
                        return {
                          opacity: 1,
                          transition: `opacity ${IMAGE_FADE_MS}ms ease ${IMAGE_FADE_MS + IMAGE_GAP_MS}ms`,
                        };
                      }

                      return {
                        opacity: 1,
                        transition: 'opacity 0.3s ease-out',
                      };
                    } else if (isPrevious) {
                      return {
                        opacity: 0,
                        transition: `opacity ${IMAGE_FADE_MS}ms ease`,
                      };
                    } else {
                      return {
                        opacity: 0,
                        transition: 'opacity 0.25s ease-out',
                      };
                    }
                  };

                  return (
                    <div
                      key={story.id || index}
                      className="absolute top-1/2 left-0 right-0 h-screen w-full -translate-y-1/2 lg:top-[34%]"
                      style={{
                        pointerEvents: isActive ? 'auto' : 'none',
                        zIndex: isActive ? 10 : 0,
                      }}
                    >
                      <div className="mx-auto flex h-full w-full max-w-[1360px] flex-col px-2">
                        <div className="grid flex-1 grid-cols-1 items-start gap-5 pt-10 md:gap-6 md:pt-12 lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-[60px] lg:pt-5">
                          <div className="flex flex-col gap-[0.2rem]" style={getTextAnimationStyle()}>
                            {titleField && (
                              <div className="mb-0">
                                <h3 className="font-heading-h3 m-0 text-[24px] leading-[1.04] font-extrabold text-[#1a1a1a] md:text-[30px] lg:text-[36px]">
                                  <RichText field={titleField} />
                                </h3>
                              </div>
                            )}

                            {descriptionField && (
                              <div className="font-body m-0 text-[15px] leading-[22px] font-medium text-[#333333] md:text-[16px] md:leading-[24px] lg:text-[18px] lg:leading-[28px] [&_p]:mb-0 [&_p:last-child]:mb-0">
                                <RichText field={descriptionField} />
                              </div>
                            )}
                          </div>

                          <div
                            className="relative hidden h-screen flex-col items-center self-center lg:flex"
                            style={{
                              opacity: isActive ? 1 : 0,
                              transition: 'opacity 0.3s ease-in-out',
                            }}
                          >
                            <div className="relative w-0.5 flex-1 overflow-hidden bg-linear-to-b from-transparent via-white to-white"></div>

                            <div className="my-4 flex h-[78px] w-[78px] shrink-0 items-center justify-center rounded-full border-2 border-black px-0 pt-[16px] pb-[12px]">
                              <label className="font-heading text-[36px] leading-[50px] font-bold tracking-wider text-[#1a1a1a]">
                                {String(index + 1).padStart(2, '0')}
                              </label>
                            </div>

                            <div className="relative w-0.5 flex-1 overflow-hidden bg-linear-to-b from-white via-white to-transparent">
                              <div
                                className="w-full bg-black transition-all duration-100 ease-out"
                                style={{
                                  height: isActive
                                    ? `${scrollProgress}%`
                                    : index < activeIndex
                                      ? '100%'
                                      : '0%',
                                }}
                              ></div>
                            </div>
                          </div>

                          {imageField?.value?.src && (
                            <div
                              className="relative h-[353px] w-[540px] self-start overflow-hidden rounded-none lg:self-center"
                              style={getImageAnimationStyle()}
                            >
                              <Image
                                field={imageField}
                                loading="lazy"
                                alt={imageField?.value?.alt || ''}
                                className="block h-full w-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
};

export default Default;

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, Image, useSitecore } from '@sitecore-content-sdk/nextjs';

import { CircularAnimationComponentProps } from './CircularAnimationComponent.props';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { cn } from '@/lib/utils';
import { stripHtmlTags } from '@/lib/sanitize';

// Constants using CSS variables
const ACCENT_COLOR = 'var(--color-accent-primary)';

type CircularAnimationVariant = 'default' | 'containerWidth';

// Helper to safely access field - handles both jsonValue and direct value patterns
// For PageEditor compatibility, we preserve the field structure when jsonValue exists
const getField = (field: any) => {
  if (!field) return undefined;
  // Handle jsonValue pattern (from Layout Service) - return jsonValue for Text/Image components
  if (field.jsonValue) return field.jsonValue;
  // Handle direct value pattern
  return field;
};

const CircularAnimationLayout: React.FC<CircularAnimationComponentProps & { variant: CircularAnimationVariant }> = (props) => {
  const { fields, rendering, variant } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const isContainerWidth = variant === 'containerWidth';
  const isDefault = variant === 'default';

  // Access title field - handle both jsonValue and direct value patterns for editability
  const titleField = getField(fields?.Title);

  // Access steps array - handle both direct and nested patterns
  const steps = fields?.Steps ?? [];

  const [activeIndex, setActiveIndex] = useState(1); // Start at 1 to match CWS (1-indexed)

  // Responsive icon sizing: measure the actual SVG pixel width and back-calculate SVG units
  // so the rendered icon is exactly 180px on >=1024px screens and 90px on smaller screens.
  const svgRef = useRef<SVGSVGElement>(null);
  const [iconSvgUnits, setIconSvgUnits] = useState(118);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  // Tracks the active index from the PREVIOUS render so we know which segment to animate next
  const prevActiveRef = useRef(1);

  // Update prevActiveRef AFTER each render (so during the render it still holds the old value)
  useEffect(() => {
    prevActiveRef.current = activeIndex;
  });

  useEffect(() => {
    const updateIconSize = () => {
      const small = window.innerWidth < 1024;
      setIsSmallScreen(small);
      const desiredPx = small ? 90 : 180;
      const viewBoxWidth = small ? 400 : 600;
      if (svgRef.current) {
        const renderedWidth = svgRef.current.getBoundingClientRect().width;
        const scale = renderedWidth / viewBoxWidth;
        setIconSvgUnits(desiredPx / scale);
      }
    };
    updateIconSize();
    window.addEventListener('resize', updateIconSize);
    return () => window.removeEventListener('resize', updateIconSize);
  }, []);

  // Validate required fields - show in editing mode even if empty
  if ((!titleField && !isPageEditing) || (steps.length === 0 && !isPageEditing)) {
    return (
      <NoDataFallback componentName={rendering?.componentName ?? 'CircularAnimationComponent'} />
    );
  }

  const stepCount = steps.length;
  const radius = 160;
  const centerX = 300;
  const centerY = 300;
  const stepAngles = [45, 135, 225, 315];
  const activeStep = steps[activeIndex - 1]; // Convert to 0-indexed

  // Calculate position for each step on the circle
  const getStepPosition = (index: number) => {
    const safeIndex = index % stepAngles.length;
    const angle = ((stepAngles[safeIndex] ?? 45) - 90) * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const handleStepClick = useCallback(
    (index: number) => {
      const clickedStep = index + 1; // Convert 0-indexed to 1-indexed

      // Case 1: Clicking on inactive step (beyond current active)
      if (clickedStep > activeIndex) {
        setActiveIndex(clickedStep);
        return;
      }

      // Case 2: Clicking on an active step (at or before current active)
      if (clickedStep <= activeIndex) {
        // Special case: If clicking the last step and it's already the active one, reset to step 1
        if (clickedStep === stepCount && activeIndex === stepCount) {
          setActiveIndex(1); // switch content immediately
          return;
        }

        const nextStep = clickedStep + 1;

        // Scenario a: Next step is active → move backward (deactivate next, stay at clicked)
        if (nextStep <= activeIndex) {
          setActiveIndex(clickedStep);
        }
        // Scenario b: Next step is inactive → move forward (activate next)
        else if (nextStep <= stepCount) {
          setActiveIndex(nextStep);
        }
      }
    },
    [activeIndex, stepCount],
  );

  const handlePrevious = useCallback(() => {
    setActiveIndex((prev) => (prev > 1 ? prev - 1 : prev)); // Can't go before step 1
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < stepCount ? prev + 1 : 1)); // Loop back to step 1
  }, [stepCount]);

  return (
    <div
      className={cn(
        'paragraph paragraph--type--cycle-component bg-[#F5F5F7] mb-[48px] lg:mb-[72px] py-0 pt-[40px] md:pt-[40px] lg:py-1 lg:pt-1',
        isContainerWidth && 'lg:max-w-[1360px] lg:mx-auto',
      )}
      data-once="cycleComponent"
    >
      <style jsx global>{`
        @keyframes drawArc {
          from {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
          }
        }
        .animate-drawArc {
          animation: drawArc 1s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes eraseArc {
          from {
            stroke-dasharray: 1000 0;
            stroke-dashoffset: 0;
          }
          to {
            stroke-dasharray: 0 1000;
            stroke-dashoffset: 0;
          }
        }
        .animate-eraseArc {
          animation: eraseArc 0.75s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        /* Center icon responsive sizing */
        .center-icon-lg { display: inline; }
        .center-icon-sm { display: none; }
        @media (max-width: 1023px) {
          .center-icon-lg { display: none; }
          .center-icon-sm { display: inline; }
        }
      `}</style>

      {/* Title Container */}
      <div className="mt-0 mb-[32px] md:mt-0 md:mb-[35px] lg:mt-[60px] lg:mb-[120px] flex items-center justify-start px-6 text-[32px] font-bold lg:justify-center lg:px-0">
        {titleField && (
          <h2 className="leading-none text-[24px] font-semibold text-black lg:text-[32px] lg:leading-10">
            <Text field={titleField} />
          </h2>
        )}
      </div>

      {/* Inner Container with circular elements */}
      <div
        className={cn(
          'relative mx-auto -mt-8 mb-2 md:-mt-12 md:mb-[24px] flex min-h-[100px] w-full max-w-[700px] flex-col items-center justify-center md:max-h-[500px] md:max-w-[950px]',
          `items-count-${stepCount}`,
        )}
        data-items-count={stepCount}
      >
        {/* Positioned step text blocks */}
        {steps.map((step, index) => {
          // Access fields directly from child item - pass full field object for PageEditor compatibility
          // The Text component will extract jsonValue internally while preserving field metadata
          const stepTitleField = step?.fields?.Title;
          const stepDescriptionField = step?.fields?.Description;

          // Progressive activation: step is active if it's <= current activeIndex
          const isActive = index + 1 <= activeIndex; // All steps up to activeIndex are active

          // Responsive positioning classes - keep text hugging the circle edge
          const positionClasses = [
            'md:top-[4%] md:right-[1%] lg:top-[4%] lg:right-[1%]', // Delivery - top right
            'md:bottom-[4%] md:right-[1%] lg:bottom-[2%] lg:right-[1%]', // Washing - bottom right
            'md:bottom-[4%] md:left-[1%] lg:bottom-[2%] lg:left-[1%]', // Checking - bottom left
            'md:top-[4%] md:left-[1%] lg:top-[4%] lg:left-[1%]', // Repair - top left
          ];

          const textAlignmentStyles: Array<'left'> = ['left', 'left', 'left', 'left'];

          // Show text for active steps by keeping them mounted but toggling opacity/translate for transitions
          return (
            <div
              key={step.id || step.name || `step-${index}`}
              className={cn(
                // Enable pointer events in editing mode, disable in normal mode to allow SVG interactions
                isPageEditing ? 'pointer-events-auto' : 'pointer-events-none',
                'absolute hidden max-w-[250px] flex-col transition-all duration-200 lg:flex',
                index < 2 ? 'lg:-translate-x-[20px]' : 'lg:translate-x-[20px]',
                (isActive || isPageEditing)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-[15px]',
                positionClasses[index],
                'items-start text-left',
              )}
              style={{ textAlign: textAlignmentStyles[index] }}
            >
              {(stepTitleField || isPageEditing) && (
                <Text
                  tag="h3"
                  field={stepTitleField}
                  className="text-[17px] leading-4 font-[var(--font-body)] font-normal md:text-[20px] lg:mb-[12px]"
                />
              )}
              {(stepDescriptionField || isPageEditing) && (
                <div className="m-0 text-[12px] leading-[22px] font-[var(--font-body)] font-light">
                  <Text field={stepDescriptionField} />
                </div>
              )}
            </div>
          );
        })}

        {/* SVG Circle */}
        <div className="relative mx-auto w-[305px] h-[305px] md:w-[305px] md:h-[305px] lg:w-full lg:h-auto lg:max-w-[750px] lg:px-5">
          <svg
            ref={svgRef}
            viewBox={isSmallScreen ? '100 100 400 400' : '0 0 600 600'}
            className={cn(
              'block h-auto w-full',
              // Disable pointer events on SVG in editing mode so text fields above can be clicked
              isPageEditing && 'pointer-events-none',
            )}
            role="img"
            aria-label="Circular process diagram"
          >
            {/* Main circle outline - white (same path as yellow arc) */}
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              stroke="#ffffff"
              strokeWidth="4"
              fill="none"
            />

            {/* Center circle background */}
            <circle
              cx={centerX}
              cy={centerY}
              r="130"
              className="drop-shadow-[0_2px_8px_var(--color-shadow)] transition-all duration-300 ease-in-out"
              fill="transparent"
            />

            {/* Yellow arc — dynamic segments for forward AND backward movement */}
            {(() => {
              // Helper: build an SVG arc path string between two step button indexes
              const getArcPath = (fromIdx: number, toIdx: number) => {
                const safeFrom = Math.max(0, Math.min(fromIdx, stepAngles.length - 1));
                const safeTo = Math.max(0, Math.min(toIdx, stepAngles.length - 1));
                const startAngle = ((stepAngles[safeFrom] ?? 45) - 90) * (Math.PI / 180);
                const endAngle = ((stepAngles[safeTo] ?? 135) - 90) * (Math.PI / 180);
                const sx = centerX + radius * Math.cos(startAngle);
                const sy = centerY + radius * Math.sin(startAngle);
                const ex = centerX + radius * Math.cos(endAngle);
                const ey = centerY + radius * Math.sin(endAngle);
                const startDeg = stepAngles[safeFrom] ?? 45;
                const endDeg = stepAngles[safeTo] ?? 135;
                let diff = endDeg - startDeg;
                if (diff < 0) diff += 360;
                return `M ${sx} ${sy} A ${radius} ${radius} 0 ${diff > 180 ? 1 : 0} 1 ${ex} ${ey}`;
              };

              const prevActive = prevActiveRef.current;
              const strokeW = isSmallScreen ? '11' : '8';
              const isMovingForward = activeIndex > prevActive;
              const isMovingBackward = activeIndex < prevActive;
              const commonProps = { strokeWidth: strokeW, strokeLinecap: 'round' as const, fill: 'none', stroke: ACCENT_COLOR };

              if (activeIndex <= 1 && !isMovingBackward) return null;

              return (
                <>
                  {/* Static base arc: up to the smaller of activeIndex/prevActive */}
                  {activeIndex > 1 && (
                    <path
                      key={`arc-base-${activeIndex}`}
                      d={getArcPath(0, isMovingBackward ? activeIndex - 1 : prevActive - 1)}
                      {...commonProps}
                    />
                  )}

                  {/* Animated forward segment */}
                  {isMovingForward && prevActive >= 1 && (
                    <path
                      key={`arc-draw-${prevActive}-to-${activeIndex}`}
                      d={getArcPath(prevActive - 1, activeIndex - 1)}
                      className="animate-drawArc"
                      {...commonProps}
                    />
                  )}

                  {/* Animated backward segment (erasing) */}
                  {isMovingBackward && (
                    <path
                      key={`arc-erase-${prevActive}-to-${activeIndex}`}
                      d={getArcPath(activeIndex - 1, prevActive - 1)}
                      className="animate-eraseArc"
                      {...commonProps}
                    />
                  )}
                </>
              );
            })()}

            {/* Step arrow markers */}
            {steps.map((step, index) => {
              const position = getStepPosition(index);
              // Progressive activation: all steps up to and including activeIndex are active
              const isActive = index + 1 <= activeIndex; // Steps 1 to activeIndex are all active

              // Rotation angles for chevrons (clockwise flow + 45° clockwise shift)
              const chevronRotations = [45, 135, 225, 315];
              const rotation = chevronRotations[index] ?? 0;

              return (
                <g key={index} className={cn(isActive && 'scale-100')}>
                  {/* Step marker circles - layered for active state */}
                  {isActive ? (
                    <>
                      {/* Outer yellow border (4px) */}
                      <circle
                        cx={position.x}
                        cy={position.y}
                        r="28"
                        fill="none"
                        stroke={ACCENT_COLOR}
                        strokeWidth={isSmallScreen ? '6' : '4'}
                        className="transition-all duration-300 ease-in-out"
                      />
                      {/* Grey background gap (8px) - matches component background */}
                      <circle
                        cx={position.x}
                        cy={position.y}
                        r="24"
                        fill="none"
                        stroke="#F5F5F7"
                        strokeWidth="8"
                      />
                      {/* Inner yellow fill */}
                      <circle
                        cx={position.x}
                        cy={position.y}
                        r="20"
                        fill={ACCENT_COLOR}
                        stroke="none"
                        onClick={() => handleStepClick(index)}
                        style={{ cursor: 'pointer' }}
                        className="transition-all duration-300 ease-in-out hover:scale-110"
                      />
                    </>
                  ) : (
                    /* Inactive: grey background with yellow border - smaller size */
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r="15"
                      fill="#F5F5F7"
                      stroke={ACCENT_COLOR}
                      strokeWidth={isSmallScreen ? '5' : '3'}
                      className="transition-all duration-300 ease-in-out"
                      onClick={() => handleStepClick(index)}
                      style={{ cursor: 'pointer' }}
                    />
                  )}

                  {/* Chevron icon - size changes based on active state (inactive is 3/4 size) */}
                  <foreignObject
                    x={isActive ? position.x - 20 : position.x - 11}
                    y={isActive ? position.y - 20 : position.y - 11}
                    width={isActive ? '40' : '22'}
                    height={isActive ? '40' : '22'}
                    onClick={() => handleStepClick(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div
                      className="pointer-events-none flex h-full w-full items-center justify-center transition-transform duration-300 ease-in-out"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    >
                      <img
                        src="/assets/circular-animation/arrow-curved.svg"
                        alt="Arrow"
                        className="transition-all duration-300 ease-in-out"
                        style={{
                          width: isActive ? '40px' : '30px',
                          height: isActive ? '40px' : '30px',
                        }}
                      />
                    </div>
                  </foreignObject>
                </g>
              );
            })}

            {/* Center icon - changes with active step */}
            {activeStep &&
              (() => {
                // Access Icon field directly from child item - pass full field object for PageEditor compatibility
                // The Image component will extract jsonValue internally while preserving field metadata
                const iconField = activeStep?.fields?.Icon;
                // Check for image value in both jsonValue and direct value formats
                const hasImageValue =
                  iconField?.value?.src ||
                  (iconField as any)?.jsonValue?.value?.src ||
                  isPageEditing;

                if (!hasImageValue) {
                  return null;
                }

                return (
                  <foreignObject
                    x={centerX - iconSvgUnits / 2}
                    y={centerY - iconSvgUnits / 2}
                    width={iconSvgUnits}
                    height={iconSvgUnits}
                  >
                    <div className="animate-fadeInScale flex h-full w-full items-center justify-center bg-transparent">
                      <div className="image-container h-full w-full bg-transparent">
                        <Image
                          field={iconField}
                          className="h-full w-full bg-transparent object-contain"
                          loading="lazy"
                          alt="Icon"
                        />
                      </div>
                    </div>
                  </foreignObject>
                );
              })()}
          </svg>
        </div>
      </div>

      {/* Mobile: Single Active Step Content */}
      <div className="relative  block w-auto px-6 pb-[50px] md:pb-[70px] lg:hidden">
        {activeStep &&
          (() => {
            // Access fields directly from active step - pass full field objects for PageEditor compatibility
            const activeTitleField = activeStep?.fields?.Title;
            const activeDescriptionField = activeStep?.fields?.Description;

            return (
              <div key={`mobile-content-${activeIndex}`} className="animate-fadeInUp">
                {(activeTitleField || isPageEditing) && (
                  <Text
                    tag="h3"
                    field={activeTitleField}
                    className="mb-5 text-[20px] leading-1 font-normal"
                  />
                )}
                {(activeDescriptionField || isPageEditing) && (
                  <div className="font-regular mb-6 text-[12px] leading-[1.6] font-light">
                    <Text field={activeDescriptionField} />
                  </div>
                )}
              </div>
            );
          })()}

        {/* Simple Arrow Navigation - Bottom Left */}
        <div className="absolute bottom-[25px] left-6 flex items-center gap-1">
          <button
            onClick={handlePrevious}
            disabled={activeIndex <= 1}
            className={cn(
              'flex h-10 w-10 items-center justify-center',
              'cursor-pointer border-none bg-none p-0 text-2xl text-black select-none',
              'disabled:cursor-not-allowed',
              'transition-opacity hover:opacity-70 active:opacity-70',
            )}
            aria-label="Previous step"
          >
            ←
          </button>
          <button
            onClick={handleNext}
            className={cn(
              'flex h-10 w-10 items-center justify-center',
              'cursor-pointer border-none bg-none p-0 text-2xl text-red-500 select-none',
              'transition-opacity hover:opacity-70 active:opacity-70',
            )}
            aria-label="Next step"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export const Default: React.FC<CircularAnimationComponentProps> = (props) => (
  <CircularAnimationLayout {...props} variant="default" />
);

export const ContainerWidth: React.FC<CircularAnimationComponentProps> = (props) => (
  <CircularAnimationLayout {...props} variant="containerWidth" />
);

export default Default;

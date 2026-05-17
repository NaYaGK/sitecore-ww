'use client';
import React, { useState } from 'react';
import {
  RichText,
  Text,
  Image,
  useSitecore,
  type Field,
  type ImageField,
  type RichTextField,
} from '@sitecore-content-sdk/nextjs';
import { LinkAnimatedComponentProps } from './link-animated-component.props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

// Helper to normalize field values
const asTextField = (f: any): Field<string> | undefined => {
  if (!f) return undefined;
  const v = f?.jsonValue ?? f;
  if (v == null) return undefined;
  if (typeof v === 'string') return { value: v } as Field<string>;
  if (typeof v?.value === 'string') return v as Field<string>;
  return undefined;
};

const asImageField = (f: any): ImageField | undefined => {
  if (!f) return undefined;
  return f?.jsonValue ?? f;
};

const asRichTextField = (f: any): RichTextField | undefined => {
  if (!f) return undefined;
  return f?.jsonValue ?? f;
};

// Helper to handle case-insensitive property access
const pickCI = (obj: any, names: string[]) => {
  if (!obj) return undefined;
  const keys = Object.keys(obj);
  for (const n of names) {
    const k = keys.find((kk) => kk.toLowerCase() === n.toLowerCase());
    if (k && obj[k] != null) return obj[k];
  }
  return undefined;
};

export const Default: React.FC<LinkAnimatedComponentProps> = (props) => {
  const { fields: initialFields = {} as any, rendering = {} as any, className } = props;
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing;

  // Resolve datasource from multiple shapes and unwrap nested fields (same as SimpleHeading)
  const initialDs: any =
    (initialFields as any)?.data?.datasource ??
    (initialFields as any)?.datasource ??
    initialFields ??
    (rendering as any)?.fields ??
    {};

  const ds =
    initialDs && typeof initialDs === 'object' && 'fields' in initialDs
      ? initialDs.fields
      : initialDs;

  // Get fields with fallbacks
  const headerTitle = asTextField(pickCI(ds, ['HeaderTitle', 'headertitle', 'title', 'headline']));
  const mainImage = asImageField(
    pickCI(ds, ['MainImage', 'mainimage', 'image', 'backgroundImage']),
  );
  const itemListRaw = pickCI(ds, ['ItemList', 'itemlist', 'items', 'animationSteps']);
  const itemList = itemListRaw?.targetItems || itemListRaw || [];

  // State to track the clicked (locked) step
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  // State to track the hovered step
  const [hoverStepIndex, setHoverStepIndex] = useState<number | null>(null);
  // State to track where the hover is coming from: 'map' or 'link'
  const [hoverSource, setHoverSource] = useState<'map' | 'link' | null>(null);

  // Show fallback only in editing mode without a datasource
  if (isPageEditing && !(rendering as any).dataSource) {
    return <NoDataFallback componentName="LinkAnimated" />;
  }

  // Determine which step is currently "focused" for the map popup
  const currentStepIndex = hoverStepIndex !== null ? hoverStepIndex : activeStepIndex;

  const handleLinkClick = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveStepIndex(index === activeStepIndex ? null : index);
  };

  return (
    <section
      className="component link-animated-component mb-4 md:mb-16   md:max-w-[1360px]"
      data-component="LinkAnimatedComponent"
      data-source-id={(rendering as any)?.dataSource}
    >
      <div className="flex flex-col gap-8 px-2  md:px-[10px]">
        <div className="w-full lg:mx-auto lg:w-[70%]">
          {/* 1) Title Text */}
          {(headerTitle || isPageEditing) && (
            <Text
              tag="h2"
              className="m-0 mb-4 text-left text-3xl leading-tight font-bold md:text-[40px]"
              field={headerTitle}
            />
          )}

          {/* 2) Main Image with Hotspots */}
          <div className="relative lg:w-[800px] lg:h-[450px]">
            <div className="relative block w-full">
              {(mainImage || isPageEditing) && (
                <Image
                  field={mainImage}
                  className="block h-auto w-full object-contain transition-[filter] duration-300"
                  priority={true}
                  alt={''}
                />
              )}

              {/* Dark Overlay (visible when something is clicked OR when a link is hovered) */}
              <div
                className={cn(
                  'pointer-events-none absolute top-0 left-0 z-[5] h-full w-full bg-black/40 transition-opacity duration-300',
                  activeStepIndex !== null || (hoverStepIndex !== null && hoverSource === 'link')
                    ? 'opacity-100'
                    : 'opacity-0',
                )}
              />

              {/* Hotspots */}
              {itemList.map((item: any, index: number) => {
                const isActive = index === activeStepIndex;
                const isHovered = index === hoverStepIndex;
                const isFocused = index === currentStepIndex;

                // Get fields from item - handle nested structure
                const itemFields = item?.fields || item;
                const itemDs = itemFields?.fields || itemFields;

                const title = asTextField(pickCI(itemDs, ['Title', 'title', 'stepTitle']));
                const description = asRichTextField(
                  pickCI(itemDs, ['Description', 'description', 'tooltipCopy']),
                );

                // Calculate position based on index (you may want to add position fields in Sitecore)
                const positions = [
                  { top: '40%', left: '15%' },
                  { top: '25%', left: '40%' },
                  { top: '27%', left: '50%' },
                  { top: '67%', left: '85%' },
                  { top: '90%', left: '40%' },
                  { top: '82%', left: '55%' },
                  { top: '25%', left: '70%' },
                ];
                const position = positions[index % positions.length] || { top: '50%', left: '50%' };

                return (
                  <div
                    key={item.id || index}
                    className={cn(
                      'absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-transparent p-0',
                      isFocused && 'z-20',
                    )}
                    style={{
                      top: position.top,
                      left: position.left,
                      transition: 'z-index 0s linear 0.1s',
                    }}
                  >
                    <button
                      className={cn(
                        'flex h-8 w-8 md:h-10 md:w-10 cursor-pointer items-center justify-center rounded-full border-none bg-[#eb0045] p-0 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-[transform,background-color,box-shadow] duration-200',
                        'hover:bg-[#eb0045]',

                      )}
                      aria-label={`Show details for ${title?.value || 'item'}`}
                      aria-expanded={isFocused}
                      onMouseEnter={() => {
                        setHoverStepIndex(index);
                        setHoverSource('map');
                      }}
                      onMouseLeave={() => {
                        setHoverStepIndex(null);
                        setHoverSource(null);
                      }}
                      onClick={() => setActiveStepIndex(index === activeStepIndex ? null : index)}
                    >
                      <span className="-mt-0.5 text-xl md:text-5xl leading-none font-normal text-black">+</span>
                    </button>

                    {/* Map Popup (White Box) - Shows Title + Description */}
                    {(title || description) && (
                      <div
                        className={cn(
                          'pointer-events-none absolute bottom-full left-1/2 z-30 w-max max-w-[200px] -translate-x-1/2 border-[2px] border-black bg-white p-2 text-left shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-200',
                          "before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-[9px] before:border-solid before:border-x-transparent before:border-t-black before:border-b-transparent before:content-['']",
                          "after:absolute after:top-full after:left-1/2 after:-mt-[3px] after:-translate-x-1/2 after:border-[5px] after:border-solid after:border-x-transparent after:border-t-white after:border-b-transparent after:content-['']",
                          isFocused
                            ? 'visible -translate-y-3 opacity-100'
                            : 'invisible -translate-y-4 opacity-0',
                        )}
                      >
                        {title && (
                          <Text
                            tag="span"
                            className="mb-2 block font-[family-name:var(--font-suisse-intl-bold)] text-lg lg:text-xl font-bold text-black break-words"
                            field={title}
                          />
                        )}
                        {description && (
                          <RichText
                            className="font-[family-name:var(--font-suisse-intl)] text-sm leading-relaxed text-black [&_p]:m-0"
                            field={description}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3) Bottom Pointer Links */}
          {itemList.length > 0 && (
            <div className="">
              <ul className="m-0 flex list-none flex-wrap justify-start gap-x-2 gap-y-3 p-0 md:gap-y-0">
                {itemList.map((item: any, index: number) => {
                  const isActive = index === activeStepIndex;
                  const isHovered = index === hoverStepIndex && hoverSource === 'link';

                  // Get fields from item
                  const itemFields = item?.fields || item;
                  const itemDs = itemFields?.fields || itemFields;

                  const title = asTextField(pickCI(itemDs, ['Title', 'title', 'stepTitle']));
                  const description = asRichTextField(
                    pickCI(itemDs, ['Description', 'description', 'tooltipCopy']),
                  );

                  return (
                    <li key={item.id || index} className="relative m-0">
                      <button
                        className={cn(
                          'font-regular cursor-pointer border-none bg-transparent p-0 text-base underline underline-offset-1 transition-all duration-200 md:text-lg',
                          'hover:no-underline',
                          isActive && 'font-bold no-underline',
                        )}
                        onClick={(e) => handleLinkClick(index, e)}
                        onMouseEnter={() => {
                          setHoverStepIndex(index);
                          setHoverSource('link');
                        }}
                        onMouseLeave={() => {
                          setHoverStepIndex(null);
                          setHoverSource(null);
                        }}
                      >
                        {title ? <Text field={title} /> : `Item ${index + 1}`}
                      </button>

                      {/* Link Tooltip (Dark Box) - Shows Description only */}
                      {description && (
                        <div
                          className={cn(
                            'pointer-events-none absolute top-full left-1/2 z-40 w-max max-w-[200px] -translate-x-1/2 translate-y-2 rounded-[2px] bg-[#444] px-3 py-2 text-center text-xs leading-snug text-white transition-opacity duration-200',
                            isHovered ? 'visible opacity-100' : 'invisible opacity-0',
                          )}
                        >
                          <div className="rte-content text-xs! text-white! [&_p]:m-0!">
                            <RichText field={description} />
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Default;

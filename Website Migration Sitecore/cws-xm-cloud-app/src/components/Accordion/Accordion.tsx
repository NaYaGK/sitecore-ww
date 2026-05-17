'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Plus, Minus } from 'lucide-react';
import { RichText, Text, useSitecore, Placeholder, type Field } from '@sitecore-content-sdk/nextjs';
import { AccordionProps } from './accordion.props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

const DEFAULT_VISIBLE_ITEMS = 3;

type NormalizedItem = {
  id: string;
  question?: Field<string>;
  answer?: Field<string>;
};

const isTruthyFlag = (value?: string | null): boolean => {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes';
};

// Helper to convert any field format to Field<string>
const asTextField = (f: any): Field<string> | undefined => {
  if (!f) return undefined;

  // Prioritize existing field object to preserve 'editable' property
  // If it has 'editable' prop, return it even if value is missing (default to empty string)
  if (f.editable) {
    return {
      ...f,
      value: typeof f.value === 'string' ? f.value : '',
    } as Field<string>;
  }

  if (typeof f?.value === 'string') return f as Field<string>;

  // Fallback to jsonValue if present
  const v = f?.jsonValue;
  if (v && typeof v?.value === 'string') return v as Field<string>;

  // Handle raw string values
  if (typeof f === 'string') return { value: f } as Field<string>;

  // Handle object with value property but not string
  if (f?.value != null) return { value: String(f.value) } as Field<string>;

  return undefined;
};

// Helper: case-insensitive field access
const pickCI = (obj: any, names: string[]) => {
  if (!obj || typeof obj !== 'object') return undefined;
  try {
    const keys = Object.keys(obj);
    for (const n of names) {
      const k = keys.find((kk) => kk.toLowerCase() === n.toLowerCase());
      if (k && obj[k] != null) return obj[k];
    }
  } catch (e) {
    // Fallback for safety
    return undefined;
  }
  return undefined;
};

export const Default: React.FC<AccordionProps> = ({ fields, params, rendering }) => {
  const { page } = useSitecore();
  // Safely access page mode
  const isEditing = page?.mode?.isEditing ?? false;

  // Resolve datasource from multiple shapes (including rendering.fields) and allow root-level fields
  const initialDs: any =
    (fields as any)?.data?.datasource ??
    (fields as any)?.datasource ??
    (fields as any) ??
    (rendering as any)?.fields ??
    {};

  const dsId = (rendering as any)?.dataSource || (rendering as any)?.datasource || undefined;
  const [loadedDs, setLoadedDs] = useState<any | null>(null);

  // Determine if we have initial content
  const hasInitialContent = Boolean(
    initialDs && (initialDs.title || initialDs.Title || initialDs.faqItems || initialDs.FaqItems),
  );

  // Fetch datasource if we have an ID but no content
  useEffect(() => {
    const shouldLoad = !!dsId && !hasInitialContent && !loadedDs;
    if (!shouldLoad) return;
    const site = process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME || 'cws';
    const lang = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en';

    let apiBaseUrl = '';
    if (typeof window !== 'undefined') {
      apiBaseUrl = (window as any).__RENDERING_HOST_URL__ || '';
      if (!apiBaseUrl) {
        const metaTag = document.querySelector('meta[name="rendering-host-url"]');
        apiBaseUrl = metaTag ? metaTag.getAttribute('content') || '' : '';
      }
      if (!apiBaseUrl) {
        apiBaseUrl = window.location.origin;
      }
    }

    fetch(
      `${apiBaseUrl}/api/sitecore-datasource?id=${encodeURIComponent(dsId)}&site=${encodeURIComponent(site)}&lang=${encodeURIComponent(lang)}`,
    )
      .then((r) => r.json())
      .then((json) => {
        if (json?.fields) {
          setLoadedDs(json.fields);
        }
      })
      .catch(() => undefined);
  }, [dsId, hasInitialContent, loadedDs]);

  // Unwrap nested fields if present
  const ds: any =
    loadedDs ??
    (initialDs && typeof initialDs === 'object' && initialDs.fields ? initialDs.fields : initialDs);

  // Map fields using case-insensitive access
  const titleField = asTextField(pickCI(ds, ['title', 'Title'])) || { value: '' };
  const subtitleField = asTextField(pickCI(ds, ['subtitle', 'Subtitle'])) || { value: '' };
  const introductionTextField = asTextField(
    pickCI(ds, ['introductionText', 'IntroductionText', 'introduction']),
  ) || { value: '' };

  const hasTitleText = Boolean(titleField?.value?.trim());
  const hasSubtitleText = Boolean(subtitleField?.value?.trim());
  const loadMoreButtonTextField = asTextField(
    pickCI(ds, ['loadMoreButtonText', 'LoadMoreButtonText']),
  ) || { value: '' };

  // LoadMoreEnabled can be a checkbox field - check both value and jsonValue
  const loadMoreEnabledRaw = pickCI(ds, ['loadMoreEnabled', 'LoadMoreEnabled']);
  const loadMoreEnabledValue =
    loadMoreEnabledRaw?.value ?? loadMoreEnabledRaw?.jsonValue?.value ?? loadMoreEnabledRaw;
  const loadMoreEnabled = isTruthyFlag(String(loadMoreEnabledValue ?? ''));

  const backgroundColorField = asTextField(pickCI(ds, ['backgroundColor', 'BackgroundColor'])) || {
    value: '',
  };

  // Get FAQ items - handle multiple formats
  // Strictly use FaqItems as requested
  const rawFaqItems = pickCI(ds, ['faqItems', 'FaqItems']);

  // Safely extract the array
  let faqItemsArray: any[] = [];
  if (Array.isArray(rawFaqItems)) {
    faqItemsArray = rawFaqItems;
  } else if (rawFaqItems && typeof rawFaqItems === 'object') {
    // Handle Sitecore field structures (targetItems for Multilist/Treelist, results for search)
    faqItemsArray = rawFaqItems.targetItems ?? rawFaqItems.results ?? [];
  }

  // Map items to normalized format - handle nested fields
  const items = faqItemsArray
    .filter((item) => item != null)
    .map((item: any) => {
      // Ensure item is an object before accessing fields
      if (!item || typeof item !== 'object')
        return { question: { value: '' }, answer: { value: '' } };

      // Handle potential edge case where fields is present but null/undefined/not object
      const fields = item.fields;
      const f = fields && typeof fields === 'object' ? fields : item;

      return {
        question: asTextField(pickCI(f, ['question', 'Question'])) || { value: '' },
        answer: asTextField(pickCI(f, ['answer', 'Answer'])) || { value: '' },
      };
    });

  const accordionId = useId();

  const normalizedItems = useMemo<NormalizedItem[]>(
    () =>
      items.map((item, index) => ({
        id: `${accordionId}-item-${index}`,
        question: item?.question,
        answer: item?.answer,
      })),
    [accordionId, items],
  );

  const initialVisibleItems = useMemo(() => {
    const provided = params?.initialVisibleItems;
    const parsed = provided ? Number.parseInt(provided, 10) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_VISIBLE_ITEMS;
  }, [params?.initialVisibleItems]);

  const shouldEnableLoadMore = loadMoreEnabled && normalizedItems.length >= initialVisibleItems;

  const [showAllItems, setShowAllItems] = useState(!shouldEnableLoadMore);
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);
  const [contentHeights, setContentHeights] = useState<Record<string, number>>({});
  const contentRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const cleanupCallbacks = useRef<Map<string, () => void>>(new Map());
  const refCallbacks = useRef<Map<string, (node: HTMLDivElement | null) => void>>(new Map());

  useEffect(() => {
    setShowAllItems(!shouldEnableLoadMore);
  }, [shouldEnableLoadMore, normalizedItems.length]);

  useEffect(() => {
    if (openItem && !normalizedItems.some((item) => item.id === openItem)) {
      setOpenItem(undefined);
    }
  }, [normalizedItems, openItem]);

  useEffect(() => {
    return () => {
      cleanupCallbacks.current.forEach((cleanup) => cleanup());
      cleanupCallbacks.current.clear();
      contentRefs.current.clear();
      refCallbacks.current.clear();
    };
  }, []);

  // Check if we have any content
  const hasContent = Boolean(hasTitleText || hasSubtitleText || normalizedItems.length);
  const hasDatasourceId = Boolean(dsId);
  if (!hasContent && !isEditing && !hasDatasourceId) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'Accordion'} />;
  }

  const itemsToRender =
    showAllItems || !shouldEnableLoadMore
      ? normalizedItems
      : normalizedItems.slice(0, initialVisibleItems);

  const loadMoreButtonText = loadMoreButtonTextField?.value?.trim() || 'Load More';
  const backgroundColor = backgroundColorField?.value?.trim() || '#EEE';

  const getContentRef = useCallback((id: string) => {
    if (refCallbacks.current.has(id)) {
      return refCallbacks.current.get(id)!;
    }

    const callback = (node: HTMLDivElement | null) => {
      const existingCleanup = cleanupCallbacks.current.get(id);
      if (existingCleanup) {
        existingCleanup();
        cleanupCallbacks.current.delete(id);
      }

      if (!node) {
        contentRefs.current.delete(id);
        setContentHeights((prev) => {
          if (!(id in prev)) {
            return prev;
          }
          const { [id]: _removed, ...rest } = prev;
          return rest;
        });
        return;
      }

      contentRefs.current.set(id, node);

      const updateHeight = () => {
        const height = node.scrollHeight;
        setContentHeights((prev) => {
          if (prev[id] === height) return prev;
          return {
            ...prev,
            [id]: height,
          };
        });
      };

      // Initial measurement after layout
      updateHeight();
      if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
        window.requestAnimationFrame(updateHeight);
      } else {
        updateHeight();
      }

      if (typeof window !== 'undefined') {
        const win = window as Window & typeof globalThis;

        if (typeof win.ResizeObserver === 'function') {
          const observer = new win.ResizeObserver(() => {
            updateHeight();
          });
          observer.observe(node);
          cleanupCallbacks.current.set(id, () => observer.disconnect());
        } else if (
          typeof win.addEventListener === 'function' &&
          typeof win.removeEventListener === 'function'
        ) {
          const handleResize = () => updateHeight();
          win.addEventListener('resize', handleResize);
          cleanupCallbacks.current.set(id, () => {
            win.removeEventListener('resize', handleResize);
          });
        } else {
          cleanupCallbacks.current.set(id, () => { });
        }
      } else {
        cleanupCallbacks.current.set(id, () => { });
      }
    };

    refCallbacks.current.set(id, callback);
    return callback;
  }, []);

  const handleValueChange = useCallback((value: string) => {
    setOpenItem(value || undefined);
  }, []);


  return (
    <section
      className="component component-accordion font-body mb-18 p-0 md:mb-10"
      style={{ backgroundColor }}
      data-component="Accordion"
      suppressHydrationWarning
    >
      <div
        className={cn(
          'mx-auto max-w-[1360px] px-2 md:px-[8px] lg:px-[16px] py-[70px] lg:py-[60px] ',
          (!hasTitleText ) ? 'py-[0px] ' : ' py-1',
        )}
      >
        <header className="w-full">
          {(hasTitleText || isEditing) && (
            <Text
              tag="h2"
              className="font-heading-h2 mt-[25px] lg:mt-[29px] xl:mt-[33px] 2xl:mt-[49px]"
              field={titleField}
            />
          )}
          {(hasSubtitleText || isEditing) && (
            <Text
              tag="p"
              className="font-heading-h5 mb-6 text-[25px] lg:text-[30px]! leading-[35px]! lg:leading-[42px]! font-bold"
              field={subtitleField}
            />
          )}
           {(introductionTextField || isEditing) && (
            <RichText
              className="font-body text-[17px] lg:text-[18px] leading-[25px] lg:leading-[28px] [&_p]:leading-[25px] [&_p]:lg:leading-[28px] [&_p]:mb-4 [&_p:last-child]:mb-0"
              field={introductionTextField}
              suppressHydrationWarning
            />
          )}
        </header>

        {isEditing ? (
          <div className="mt-8 md:mt-10">
            {itemsToRender.map((item) => (
              <div key={item.id} className="border-b-2 border-black">
                <div className="font-heading flex w-full items-center justify-between gap-2 py-4 text-left text-lg leading-relaxed font-semibold text-inherit md:gap-4 md:py-6 lg:py-5 lg:text-base">
                  <span className="text-pretty">
                    <Text
                      tag="span"
                      field={item.question}
                       className="font-bold text-[17px] leading-[25px] lg:text-[18px] lg:leading-[28px] 2xl:text-[22px] 2xl:leading-[30px]"
                    />
                  </span>
                  <span
                    className="inline-flex h-10 w-10 flex-none items-center justify-center"
                    aria-hidden="true"
                  >
                    <Minus strokeWidth={1.5} className="h-full w-full" />
                  </span>
                </div>
                <div className="overflow-hidden text-lg">
                  {item.answer && (
                    <RichText
                      className="font-body pb-6 text-[17px] lg:text-[18px] leading-[25px] lg:leading-[28px] lg:pb-12 [&_p]:leading-[25px] [&_p]:lg:leading-[28px] [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-2 [&_li]:leading-[25px] [&_li]:lg:leading-[28px]"
                      field={item.answer}
                      suppressHydrationWarning
                    />
                  )}
                </div>
              </div>
            ))}
            {rendering?.placeholders &&
              (rendering.placeholders['accordion-items'] || isEditing) && (
                <Placeholder name="accordion-items" rendering={rendering} />
              )}
          </div>
        ) : (
          <AccordionPrimitive.Root
            type="single"
            collapsible
            value={openItem || ''}
            onValueChange={handleValueChange}
            className={cn(
              'list-none',
              (hasTitleText || hasSubtitleText || isEditing) ? 'mt-8 md:mt-10' : undefined,
            )}
          >
            {itemsToRender.map((item) => {
              const isOpen = openItem === item.id;
              const contentStyle = contentHeights[item.id]
                ? ({
                  '--accordion-content-max-height': `${contentHeights[item.id]}px`,
                } as CSSProperties)
                : undefined;
              return (
                <AccordionPrimitive.Item
                  key={item.id}
                  value={item.id}
                  className="border-b-2 border-black"
                >
                <AccordionPrimitive.Header>
                    <AccordionPrimitive.Trigger className="font-heading flex w-full cursor-pointer appearance-none items-center justify-between gap-2 border-0 bg-transparent py-4 text-left text-lg leading-relaxed font-semibold text-inherit focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black/20 md:gap-2 py-3! md:py-4! lg:py-5! lg:text-base">
                      <span className="text-pretty">
                        <Text
                          tag="span"
                          field={item.question}
                          className="font-bold text-[17px] leading-[25px] lg:text-[18px] lg:leading-[28px]"
                        />
                      </span>
                      <span
                        className="inline-flex h-9 w-9 flex-none items-center justify-center"
                        aria-hidden="true"
                      >
                          {isOpen ? (
                            <Minus
                              size={28}
                              strokeWidth={2}
                              strokeLinecap="butt"
                              strokeLinejoin="miter"
                              className="h-full w-full"
                            />
                          ) : (
                            <Plus
                              size={28}
                              strokeWidth={2}
                              strokeLinecap="butt"
                              strokeLinejoin="miter"
                              className="h-full w-full"
                            />
                          )}


                      </span>
                    </AccordionPrimitive.Trigger>
                  </AccordionPrimitive.Header>
                  <AccordionPrimitive.Content
                    className="invisible max-h-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out data-[open=true]:visible data-[open=true]:max-h-[var(--accordion-content-max-height,0px)] data-[open=true]:opacity-100 motion-reduce:transition-none"
                    data-open={isOpen}
                    ref={getContentRef(item.id)}
                    style={contentStyle}
                  >
                    {item.answer && (
                      <RichText
                        className="font-body pb-6 text-[17px] lg:text-[18px] leading-[25px] lg:leading-[28px] lg:pb-12 [&_p]:leading-[25px] [&_p]:lg:leading-[28px] [&_p]:mb-4 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-2 [&_li]:leading-[25px] [&_li]:lg:leading-[28px]"
                        field={item.answer}
                        suppressHydrationWarning
                      />
                    )}
                  </AccordionPrimitive.Content>
                </AccordionPrimitive.Item>
              );
            })}
            {rendering?.placeholders &&
              (rendering.placeholders['accordion-items'] || isEditing) && (
                <Placeholder name="accordion-items" rendering={rendering} />
              )}
          </AccordionPrimitive.Root>
        )}

        {shouldEnableLoadMore && !showAllItems && (
          <div className="text-left ml-[4.9%] lg:ml-0">
            <button
              type="button"
              className={cn(
                'inline-flex cursor-pointer items-center justify-center gap-2',
                'rounded-2xl border-2 border-black bg-transparent',
                'text-[16px] h-[46px] leading-[24px] mt-[30px] px-[40px] py-[9px] ml-0 font-[700] hyphens-manual',
                'lg:text-[18px] lg:h-[48px] lg:leading-[26px] lg:mt-[47px] lg:px-[50px]',
                'xl:text-[20px] xl:h-[50px] xl:leading-[28px] xl:mt-[47px] xl:px-[60px]',
                'transition-all duration-200 ease-in-out',
                'hover:bg-black hover:text-white',
                'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black/20',
                'motion-reduce:transition-none',
              )}
              onClick={() => setShowAllItems(true)}
            >
              {loadMoreButtonText}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Default;

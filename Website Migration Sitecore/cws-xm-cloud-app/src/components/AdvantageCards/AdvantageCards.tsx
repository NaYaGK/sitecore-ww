'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Link,
  RichText,
  Text,
  Image,
  useSitecore,
  type Field,
  type ImageField,
  type LinkField,
} from '@sitecore-content-sdk/nextjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { type AdvantageCardsProps } from './AdvantageCards.props';

import { useSiteName } from '@/hooks/useSiteName';
import { patchLinkField } from '@/lib/patch-link';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

// Helper to convert any field format to Field<string>
const asTextField = (f: any): Field<string> | undefined => {
  if (!f) return undefined;
  const v = f?.jsonValue ?? f;
  if (v == null) return undefined;
  if (typeof v === 'string') return { value: v } as Field<string>;
  if (typeof v?.value === 'string') return v as Field<string>;
  return undefined;
};

// Helper to convert any field format to ImageField
const asImageField = (f: any): ImageField | undefined => {
  if (!f) return undefined;
  return f?.jsonValue ?? f;
};

// Helper to convert any field format to LinkField
// Preserves original field structure for Page Builder editability
const asLinkField = (f: any): LinkField | undefined => {
  if (!f) return undefined;
  // If it's already a LinkField, return it as-is to preserve Sitecore metadata
  if (f?.value?.href || f?.value?.id) return f as LinkField;
  // Try jsonValue path
  const v = f?.jsonValue ?? f;
  if (v?.value?.href || v?.value?.id) return v as LinkField;
  return undefined;
};

// Helper: case-insensitive field access
const pickCI = (obj: any, names: string[]) => {
  if (!obj) return undefined;
  const keys = Object.keys(obj);
  for (const n of names) {
    const k = keys.find((kk) => kk.toLowerCase() === n.toLowerCase());
    if (k && obj[k] != null) return obj[k];
  }
  return undefined;
};

const hasIcon = (icon?: ImageField, isPageEditing?: boolean): boolean => {
  if (icon?.value?.src) return true;
  return Boolean(isPageEditing);
};

const hasLinkField = (link?: LinkField): boolean => {
  return Boolean(link?.value?.href || link?.value?.id);
};

const chunkCards = <T,>(items: T[], chunkSize: number): T[][] => {
  if (chunkSize <= 0) return [items];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    pages.push(items.slice(i, i + chunkSize));
  }
  return pages;
};

const DefaultComponent: React.FC<AdvantageCardsProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const siteName = useSiteName();

  // FLEXIBLE FIELD RESOLUTION: Handle multiple data shapes
  const initialDs: any =
    (fields as any)?.data?.datasource ??
    (fields as any)?.datasource ??
    (fields as any) ??
    (rendering as any)?.fields ??
    {};

  // Unwrap nested fields if present
  const ds: any =
    initialDs && typeof initialDs === 'object' && initialDs.fields ? initialDs.fields : initialDs;

  // Map fields using case-insensitive access
  const titleField = asTextField(pickCI(ds, ['SectionTitle', 'SectionTitle']));

  // Get cards - handle multiple formats (multiline field with AdvantageCard items)
  const rawCards = pickCI(ds, ['cards', 'Cards']);
  const cardsArray: any[] = rawCards?.targetItems ?? rawCards?.results ?? rawCards ?? [];

  // Map cards to normalized format
  const cards = cardsArray.map((card: any) => {
    // Check if fields are nested under a 'fields' property
    const cardFields = card?.fields ?? card;

    // Try to find Icon field
    const iconField = asImageField(pickCI(cardFields, ['icon', 'Icon']));

    // Try to find Title field (preserve raw field for Page Builder editability)
    const rawTitleField = pickCI(cardFields, ['title', 'Title']);
    const titleField = (asTextField(rawTitleField) ?? rawTitleField?.jsonValue ?? rawTitleField) as
      | Field<string>
      | undefined;

    // Try to find Text field
    const textField = asTextField(pickCI(cardFields, ['text', 'Text']));

    // Try to find TextWithoutLink field
    const textWithoutLinkField = asTextField(pickCI(cardFields, ['TextWithoutLink']));

    const rawLinkField = cardFields?.Link;

    const resolvedLinkField: LinkField | undefined =
      rawLinkField?.value?.href || rawLinkField?.value?.id
        ? (rawLinkField as LinkField)
        : rawLinkField?.jsonValue?.value?.href || rawLinkField?.jsonValue?.value?.id
          ? (rawLinkField.jsonValue as LinkField)
          : rawLinkField // Keep the raw field even if empty for editing mode
            ? (rawLinkField as LinkField)
            : asLinkField(rawLinkField);

    const linkField = resolvedLinkField
      ? (patchLinkField(resolvedLinkField, siteName) ?? resolvedLinkField)
      : resolvedLinkField;

    const linkValue = linkField?.value;
    const linkText =
      typeof linkValue?.description === 'string'
        ? linkValue.description
        : typeof linkValue?.text === 'string'
          ? linkValue.text
          : '';

    // Try to find Background Color field
    const backgroundColorField = asTextField(cardFields?.['Background Color']);
    const backgroundColor = backgroundColorField?.value?.trim() || '';

    return {
      icon: iconField,
      title: titleField,
      text: textField,
      textWithoutLink: textWithoutLinkField,
      link: linkField,
      linkText: linkText,
      backgroundColor: backgroundColor,
      rawLinkField: rawLinkField, // Store raw field for editing mode fallback
    };
  });

  // Check if we have any content
  const hasContent = Boolean(titleField || cards.length);
  if (!hasContent && !isPageEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'AdvantageCards'} />;
  }

  const isSingleCard = cards.length === 1;

  return (
    <section
      className={cn('component advantage-cards mb-4 w-full bg-white lg:mb-25 2xl:mb-24')}
      data-component="AdvantageCards-Default"
    >
      {' '}
      <div className="mx-auto mb-10 max-w-[1360px] px-2 font-bold lg:mb-14 lg:px-0">
        {(titleField || isPageEditing) && (
          <Text
            tag="h2"
            className="font-heading-h2 m-0 px-0 sm:px-2 lg:px-[10px]"
            field={titleField}
          />
        )}
      </div>
      <div
        className={cn(
          'mx-auto max-w-[1360px] px-2 pb-8 lg:pb-0',
          isSingleCard ? 'lg:px-0' : 'lg:px-6.5',
        )}
      >
        <div
          className={cn(
            'grid grid-cols-1 gap-3 lg:gap-8 xl:gap-9',
            !isSingleCard && 'lg:grid-cols-2',
          )}
        >
          {cards.map((card, index: number) => {
            const iconField = card.icon;
            const cardTitleField = card.title;
            const textField = card.text;
            const textWithoutLinkField = card.textWithoutLink;
            const linkField = card.link;
            const linkText = card.linkText;
            const backgroundColor = card.backgroundColor;
            const rawLinkField = card.rawLinkField;

            const showIcon = hasIcon(iconField, isPageEditing);
            const showCard = cardTitleField?.value || textField?.value || isPageEditing;

            if (!showCard) return null;

            const hasLink = hasLinkField(linkField);

            return (
              <article
                key={index}
                className={cn(
                  'flex flex-col rounded-none border-none bg-(--color-accent-primary) p-6 sm:px-[20px] sm:py-[28px] lg:h-auto lg:p-8 lg:py-6 lg:pr-13 lg:pb-[30px] lg:pl-15',
                  !isSingleCard && 'sm:mx-auto sm:w-[356px] lg:mx-0 lg:w-auto',
                  isSingleCard && 'w-full',
                )}
              >
                <div className="flex h-full w-full flex-col items-start lg:gap-0">
                  {showIcon && (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-start">
                      <Image
                        field={iconField}
                        className="block h-full w-full object-contain"
                        alt=""
                      />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col lg:gap-0">
                    {(cardTitleField || isPageEditing) &&
                      ((hasLink || (isPageEditing && linkField)) && linkField ? (
                        <Link
                          field={linkField}
                          className="my-3 text-inherit no-underline hover:no-underline focus:rounded-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-text)]"
                        >
                          <Text
                            tag="h3"
                            className="font-heading-h3 my-0 leading-[1.3] font-bold lg:my-4  text-[18px]! lg:text-[20px]! "
                            field={cardTitleField}
                          />
                        </Link>
                      ) : (
                        <Text
                          tag="h3"
                          className="font-heading-h3 my-3 mt-[24px] mb-[18px] leading-[1.3] font-bold lg:my-6"
                          field={cardTitleField}
                        />
                      ))}

                    {(textField || isPageEditing) && (
                      <div className="font-regular min-h-[50px] text-base text-[14px] leading-loose [&_li]:mb-2 [&_li:last-child]:mb-0 [&_ol]:mb-3 [&_ol]:pl-6 [&_ol:last-child]:mb-0 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:mb-3 [&_ul]:pl-6 [&_ul:last-child]:mb-0">
                        <RichText field={textField} />
                      </div>
                    )}

                    {/* Always render Link in editing mode for Page Builder editability */}
                    {/* Similar to LinkList pattern: check if linkField exists, but show in editing mode even if empty */}
                    {(linkField && (hasLink || linkText)) || (isPageEditing && rawLinkField) ? (
                      <div className="group mt-auto pt-2 lg:pt-5">
                        <Link
                          field={linkField || (rawLinkField as LinkField)}
                          className="group relative mt-auto inline-flex gap-3 items-center pb-1 text-sm font-bold no-underline"
                        >
                          <span className="relative pr-2 mt-2 text-base lg:pr-0">
                            {linkText || (isPageEditing ? 'Link' : '')}
                            <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--color-text,#000000)] transition-all duration-300 group-hover:w-full"></span>
                          </span>

                          <ChevronRight
                            className="shrink-0 mt-2 text-normal"
                            size={20}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        </Link>
                      </div>
                    ) : null}

                    {!hasLink && (textWithoutLinkField || isPageEditing) ? (
                      <div className="flex items-center gap-2 pt-2 lg:pt-5">
                        {textWithoutLinkField?.value && (
                          <ChevronRight
                            className="mt-2 shrink-0"
                            size={20}
                            strokeWidth={3}
                            aria-hidden="true"
                          />
                        )}
                        <Text
                          tag="p"
                          className="mt-3 text-[17px] leading-[1.6] font-normal lg:text-lg"
                          field={textWithoutLinkField}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const AdvantageScrollVersionComponent: React.FC<AdvantageCardsProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const siteName = useSiteName();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const programmaticScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [activePage, setActivePage] = useState(1);

  // FLEXIBLE FIELD RESOLUTION: Handle multiple data shapes
  const initialDs: any =
    (fields as any)?.data?.datasource ??
    (fields as any)?.datasource ??
    (fields as any) ??
    (rendering as any)?.fields ??
    {};

  // Unwrap nested fields if present
  const ds: any =
    initialDs && typeof initialDs === 'object' && initialDs.fields ? initialDs.fields : initialDs;

  // Map fields using case-insensitive access
  const titleField = asTextField(pickCI(ds, ['SectionTitle', 'SectionTitle']));

  // Get cards - handle multiple formats (multiline field with AdvantageCard items)
  const rawCards = pickCI(ds, ['cards', 'Cards']);
  const cardsArray: any[] = rawCards?.targetItems ?? rawCards?.results ?? rawCards ?? [];

  const cards = cardsArray.map((card: any) => {
    const cardFields = card?.fields ?? card;
    const iconField = asImageField(pickCI(cardFields, ['icon', 'Icon']));

    const rawTitleField = pickCI(cardFields, ['title', 'Title']);
    const cardTitleField = (asTextField(rawTitleField) ??
      rawTitleField?.jsonValue ??
      rawTitleField) as Field<string> | undefined;

    const textField = asTextField(pickCI(cardFields, ['text', 'Text']));
    const textWithoutLinkField = asTextField(pickCI(cardFields, ['TextWithoutLink']));

    const rawLinkField = cardFields?.Link;
    const resolvedLinkField: LinkField | undefined =
      rawLinkField?.value?.href || rawLinkField?.value?.id
        ? (rawLinkField as LinkField)
        : rawLinkField?.jsonValue?.value?.href || rawLinkField?.jsonValue?.value?.id
          ? (rawLinkField.jsonValue as LinkField)
          : rawLinkField
            ? (rawLinkField as LinkField)
            : asLinkField(rawLinkField);

    const linkField = resolvedLinkField
      ? (patchLinkField(resolvedLinkField, siteName) ?? resolvedLinkField)
      : resolvedLinkField;

    const linkValue = linkField?.value;
    const linkText =
      typeof linkValue?.description === 'string'
        ? linkValue.description
        : typeof linkValue?.text === 'string'
          ? linkValue.text
          : '';

    const backgroundColorField = asTextField(cardFields?.['Background Color']);
    const backgroundColor = backgroundColorField?.value?.trim() || '';

    return {
      icon: iconField,
      title: cardTitleField,
      text: textField,
      textWithoutLink: textWithoutLinkField,
      link: linkField,
      linkText,
      backgroundColor,
      rawLinkField,
    };
  });

  const displayCards = useMemo(
    () =>
      cards.filter(
        (card) =>
          card.title?.value || card.text?.value || card.textWithoutLink?.value || isPageEditing,
      ),
    [cards, isPageEditing],
  );

  useEffect(() => {
    const updateCardsPerView = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth >= 1024) {
        setCardsPerView(3);
        return;
      }
      if (window.innerWidth >= 640) {
        setCardsPerView(2);
        return;
      }
      setCardsPerView(1);
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  const pagedCards = useMemo(
    () => chunkCards(displayCards, cardsPerView),
    [displayCards, cardsPerView],
  );
  const totalPages = Math.max(1, pagedCards.length);

  useEffect(() => {
    setActivePage(1);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'auto' });
    }
  }, [cardsPerView, totalPages]);

  const scrollToPage = (pageToMove: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const nextPage = pageToMove < 1 ? totalPages : pageToMove > totalPages ? 1 : pageToMove;
    const firstPageEl = container.firstElementChild as HTMLElement | null;
    const pageWidth = firstPageEl?.clientWidth ?? container.clientWidth;

    container.scrollTo({
      left: (nextPage - 1) * pageWidth,
      behavior: 'smooth',
    });
    setActivePage(nextPage);

    isProgrammaticScrollRef.current = true;
    if (programmaticScrollTimeoutRef.current) {
      clearTimeout(programmaticScrollTimeoutRef.current);
    }
    programmaticScrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 450);
  };

  const hasContent = Boolean(titleField || displayCards.length);
  if (!hasContent && !isPageEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'AdvantageCards'} />;
  }

  const isSingleCard = displayCards.length === 1;
  const canScroll = totalPages > 1 && !isSingleCard;

  return (
    <section
      className={cn('component advantage-cards mb-4 w-full bg-white lg:mb-25 2xl:mb-24')}
      data-component="AdvantageCards-ScrollVersion"
    >
      <div className="mx-auto mb-8 max-w-[1360px] px-2 font-bold lg:mb-10 lg:px-0">
        {(titleField || isPageEditing) && (
          <Text
            tag="h2"
            className="font-heading-h2 m-0 px-0 sm:px-2 lg:px-[10px]"
            field={titleField}
          />
        )}
      </div>

      <div className="mx-auto max-w-[1360px] px-2 pb-8 lg:px-[10px] lg:pb-2">
        {/* Mobile view - always show single card or scroll */}
        <div className={cn('grid gap-3 sm:hidden', isSingleCard ? 'grid-cols-1' : 'grid-cols-1')}>
          {displayCards.map((card, index) => {
            const iconField = card.icon;
            const cardTitleField = card.title;
            const linkField = card.link;
            const rawLinkField = card.rawLinkField;
            const hasLink = hasLinkField(linkField);
            const showIcon = hasIcon(iconField, isPageEditing);
            const cardBgStyle = card.backgroundColor
              ? { backgroundColor: card.backgroundColor }
              : undefined;

            const content = (
              <div className="flex w-full items-center gap-4">
                {showIcon && (
                  <div className="flex h-[70px] w-[70px] shrink-0 items-center justify-start">
                    <Image
                      field={iconField}
                      className="block h-full w-full object-contain"
                      alt=""
                    />
                  </div>
                )}

                <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <Text tag="h3" className="font-heading-h3 mb-4! ml-7!" field={cardTitleField} />
                  <ChevronRight className="shrink-0" size={36} strokeWidth={3} aria-hidden="true" />
                </div>
              </div>
            );

            return (
              <article
                key={`advantage-mobile-${index}`}
                className={cn(
                  'rounded-none bg-[var(--color-accent-primary)] p-4',
                  isSingleCard ? 'w-full' : 'w-full',
                )}
                style={cardBgStyle}
              >
                {(hasLink || isPageEditing) && (linkField || rawLinkField) ? (
                  <Link
                    field={linkField || (rawLinkField as LinkField)}
                    className="block text-inherit no-underline hover:no-underline focus:rounded-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-text)]"
                  >
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </article>
            );
          })}
        </div>

        <div
          className={cn(
            'hidden overflow-x-auto overflow-y-hidden pb-3 sm:flex lg:hidden',
            isSingleCard ? 'justify-center' : '',
          )}
        >
          <div className={cn('flex gap-3', isSingleCard ? 'w-full max-w-[1360px]' : '')}>
            {displayCards.map((card, index) => {
              const iconField = card.icon;
              const cardTitleField = card.title;
              const textField = card.text;
              const textWithoutLinkField = card.textWithoutLink;
              const linkField = card.link;
              const linkText = card.linkText;
              const rawLinkField = card.rawLinkField;
              const hasLink = hasLinkField(linkField);
              const showIcon = hasIcon(iconField, isPageEditing);
              const cardBgStyle = card.backgroundColor
                ? { backgroundColor: card.backgroundColor }
                : undefined;

              return (
                <article
                  key={`advantage-scroll-${index}`}
                  className={cn(
                    'flex flex-col rounded-none bg-[var(--color-accent-primary)] p-6',
                    isSingleCard
                      ? 'min-h-[300px] w-full'
                      : 'min-h-[300px] w-[280px] shrink-0 md:min-h-[310px] md:w-[320px]',
                  )}
                  style={cardBgStyle}
                >
                  <div className="flex h-full w-full flex-col items-start">
                    {showIcon && (
                      <div className="mb-3 flex h-25 w-25 shrink-0 items-center justify-start">
                        <Image
                          field={iconField}
                          className="block h-full w-full object-contain"
                          alt=""
                        />
                      </div>
                    )}

                    <div className="flex flex-1 flex-col">
                      {(cardTitleField || isPageEditing) &&
                        ((hasLink || (isPageEditing && linkField)) && linkField ? (
                          <Link
                            field={linkField}
                            className="mb-3 text-inherit no-underline hover:no-underline focus:rounded-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-text)]"
                          >
                            <Text tag="h3" className="font-heading-h3" field={cardTitleField} />
                          </Link>
                        ) : (
                          <Text tag="h3" className="font-heading-h3" field={cardTitleField} />
                        ))}

                      {(textField || isPageEditing) && (
                        <div className="text-[15px] leading-[1.45] [&_li]:mb-2 [&_li:last-child]:mb-0 [&_ol]:mb-2 [&_ol]:pl-5 [&_ol:last-child]:mb-0 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul]:pl-5 [&_ul:last-child]:mb-0">
                          <RichText field={textField} />
                        </div>
                      )}

                      {(linkField && (hasLink || linkText)) || (isPageEditing && rawLinkField) ? (
                        <div className="group mt-auto pt-3">
                          <Link
                            field={linkField || (rawLinkField as LinkField)}
                            className="group relative inline-flex items-center pb-1 text-[30px] leading-[1] font-bold no-underline"
                          >
                            <ChevronRight
                              className="mr-2 shrink-0"
                              size={24}
                              strokeWidth={3}
                              aria-hidden
                            />
                            <span className="relative text-[20px] leading-[28px]">
                              {linkText || (isPageEditing ? 'Link' : '')}
                              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--color-text,#000000)] transition-all duration-300 group-hover:w-full" />
                            </span>
                          </Link>
                        </div>
                      ) : null}

                      {!hasLink && (textWithoutLinkField || isPageEditing) ? (
                        <div className="mt-auto flex items-center gap-2 pt-3">
                          <Text
                            tag="p"
                            className="text-[17px] leading-[1.4] font-normal"
                            field={textWithoutLinkField}
                          />
                          {textWithoutLinkField?.value && (
                            <ChevronRight
                              className="shrink-0"
                              size={18}
                              strokeWidth={3}
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* Desktop view - scrollable for multiple cards, static for single card */}
        {isSingleCard ? (
          <div className="hidden justify-center lg:flex">
            <div className="w-full max-w-[1360px]">
              {displayCards.map((card, index) => {
                const iconField = card.icon;
                const cardTitleField = card.title;
                const textField = card.text;
                const textWithoutLinkField = card.textWithoutLink;
                const linkField = card.link;
                const linkText = card.linkText;
                const rawLinkField = card.rawLinkField;
                const hasLink = hasLinkField(linkField);
                const showIcon = hasIcon(iconField, isPageEditing);
                const cardBgStyle = card.backgroundColor
                  ? { backgroundColor: card.backgroundColor }
                  : undefined;

                return (
                  <article
                    key={`advantage-single-${index}`}
                    className="flex min-h-[330px] w-full flex-col rounded-none bg-[var(--color-accent-primary)] px-6 py-8"
                    style={cardBgStyle}
                  >
                    <div className="flex h-full w-full flex-col items-start">
                      {showIcon && (
                        <div className="mb-3 flex h-25 w-25 shrink-0 items-center justify-start">
                          <Image
                            field={iconField}
                            className="block h-full w-full object-contain"
                            alt=""
                          />
                        </div>
                      )}

                      <div className="flex flex-1 flex-col">
                        {(cardTitleField || isPageEditing) &&
                          ((hasLink || (isPageEditing && linkField)) && linkField ? (
                            <Link
                              field={linkField}
                              className="mb-3 text-inherit no-underline hover:no-underline focus:rounded-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-text)]"
                            >
                              <Text
                                tag="h3"
                                className="font-heading-h3 mb-5! pt-2!"
                                field={cardTitleField}
                              />
                            </Link>
                          ) : (
                            <Text
                              tag="h3"
                              className="font-heading-h3 mb-5! pt-2!"
                              field={cardTitleField}
                            />
                          ))}

                        {(textField || isPageEditing) && (
                          <div className="text-[17px] leading-[25px] md:text-[18px] [&_li]:mb-2 [&_li:last-child]:mb-0 [&_ol]:mb-2 [&_ol]:pl-5 [&_ol:last-child]:mb-0 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul]:pl-5 [&_ul:last-child]:mb-0">
                            <RichText field={textField} />
                          </div>
                        )}

                        {(linkField && (hasLink || linkText)) || (isPageEditing && rawLinkField) ? (
                          <div className="group mt-auto pt-3">
                            <Link
                              field={linkField || (rawLinkField as LinkField)}
                              className="group relative inline-flex items-center pb-1 text-[30px] leading-[1] font-bold no-underline"
                            >
                              <ChevronRight
                                className="mr-2 shrink-0"
                                size={24}
                                strokeWidth={3}
                                aria-hidden
                              />
                              <span className="relative text-[20px] leading-[28px]">
                                {linkText || (isPageEditing ? 'Link' : '')}
                                <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--color-text,#000000)] transition-all duration-300 group-hover:w-full" />
                              </span>
                            </Link>
                          </div>
                        ) : null}

                        {!hasLink && (textWithoutLinkField || isPageEditing) ? (
                          <div className="mt-auto flex items-center gap-2 pt-3">
                            <Text
                              tag="p"
                              className="text-[17px] leading-[1.4] font-normal"
                              field={textWithoutLinkField}
                            />
                            {textWithoutLinkField?.value && (
                              <ChevronRight
                                className="shrink-0"
                                size={18}
                                strokeWidth={3}
                                aria-hidden="true"
                              />
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="scrollbar-hide hidden snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth pb-3 lg:flex"
            onScroll={(event) => {
              if (isProgrammaticScrollRef.current) return;
              const target = event.currentTarget;
              if (!target.clientWidth) return;
              const firstPageEl = target.firstElementChild as HTMLElement | null;
              const pageWidth = firstPageEl?.clientWidth ?? target.clientWidth;
              const pageFromScroll = Math.min(
                Math.max(Math.round(target.scrollLeft / pageWidth) + 1, 1),
                totalPages,
              );
              setActivePage((prev) => (prev === pageFromScroll ? prev : pageFromScroll));
            }}
          >
            {pagedCards.map((pageCards, pageIndex) => (
              <div key={`advantage-page-${pageIndex}`} className="w-full shrink-0 snap-start">
                <div className="grid grid-cols-3 gap-4">
                  {pageCards.map((card, cardIndex) => {
                    const iconField = card.icon;
                    const cardTitleField = card.title;
                    const textField = card.text;
                    const textWithoutLinkField = card.textWithoutLink;
                    const linkField = card.link;
                    const linkText = card.linkText;
                    const rawLinkField = card.rawLinkField;
                    const hasLink = hasLinkField(linkField);
                    const showIcon = hasIcon(iconField, isPageEditing);
                    const cardBgStyle = card.backgroundColor
                      ? { backgroundColor: card.backgroundColor }
                      : undefined;

                    return (
                      <article
                        key={`advantage-card-${pageIndex}-${cardIndex}`}
                        className="min:h-[330px] flex w-full flex-col rounded-none bg-[var(--color-accent-primary)] px-6 py-8"
                        style={cardBgStyle}
                      >
                        <div className="flex h-full w-full flex-col items-start">
                          {showIcon && (
                            <div className="mb-3 flex h-25 w-25 shrink-0 items-center justify-start">
                              <Image
                                field={iconField}
                                className="block h-full w-full object-contain"
                                alt=""
                              />
                            </div>
                          )}

                          <div className="flex flex-1 flex-col">
                            {(cardTitleField || isPageEditing) &&
                              ((hasLink || (isPageEditing && linkField)) && linkField ? (
                                <Link
                                  field={linkField}
                                  className="mb-3 text-inherit no-underline hover:no-underline focus:rounded-sm focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--color-text)]"
                                >
                                  <Text
                                    tag="h3"
                                    className="font-heading-h3 mb-5! pt-2!"
                                    field={cardTitleField}
                                  />
                                </Link>
                              ) : (
                                <Text
                                  tag="h3"
                                  className="font-heading-h3 mb-5! pt-2!"
                                  field={cardTitleField}
                                />
                              ))}

                            {(textField || isPageEditing) && (
                              <div className="text-[17px] leading-[25px] md:text-[18px] [&_li]:mb-2 [&_li:last-child]:mb-0 [&_ol]:mb-2 [&_ol]:pl-5 [&_ol:last-child]:mb-0 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul]:pl-5 [&_ul:last-child]:mb-0">
                                <RichText field={textField} />
                              </div>
                            )}

                            {(linkField && (hasLink || linkText)) ||
                            (isPageEditing && rawLinkField) ? (
                              <div className="group mt-auto pt-10">
                                <Link
                                  field={linkField || (rawLinkField as LinkField)}
                                  className="group relative inline-flex items-center pb-1 text-[30px] leading-[1] font-bold no-underline"
                                >
                                  <ChevronRight
                                    className="mr-2 shrink-0"
                                    size={32}
                                    strokeWidth={3}
                                    aria-hidden
                                  />
                                  <span className="relative text-[20px] leading-[28px]">
                                    {linkText || (isPageEditing ? 'Link' : '')}
                                    <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--color-text,#000000)] transition-all duration-300 group-hover:w-full" />
                                  </span>
                                </Link>
                              </div>
                            ) : null}

                            {!hasLink && (textWithoutLinkField || isPageEditing) ? (
                              <div className="mt-auto flex items-center gap-2 pt-3">
                                <Text
                                  tag="p"
                                  className="text-[17px] leading-[1.4] font-normal"
                                  field={textWithoutLinkField}
                                />
                                {textWithoutLinkField?.value && (
                                  <ChevronRight
                                    className="shrink-0"
                                    size={18}
                                    strokeWidth={3}
                                    aria-hidden="true"
                                  />
                                )}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        {canScroll && (
          <div className="mt-8 hidden items-center justify-end gap-3 lg:flex">
            <span className="mr-2 self-end text-[18px] font-bold text-black">
              {activePage}/{totalPages}
            </span>

            <button
              type="button"
              onClick={() => scrollToPage(activePage - 1)}
              disabled={!canScroll}
              aria-label="Previous cards"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black text-black transition hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={32} strokeWidth={2.5} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => scrollToPage(activePage + 1)}
              disabled={!canScroll}
              aria-label="Next cards"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black text-black transition hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={32} strokeWidth={2.5} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

type AdvantageCardsVariant = 'default' | 'scrollVersion' | 'Scroll Version' | 'ScrollVersion';

const AdvantageCardsLayout: React.FC<AdvantageCardsProps & { variant: AdvantageCardsVariant }> = (
  props,
) => {
  const { variant } = props;

  if (variant === 'scrollVersion' || variant === 'ScrollVersion') {
    return <AdvantageScrollVersionComponent {...props} />;
  } else return <DefaultComponent {...props} />;
};

export const Default: React.FC<AdvantageCardsProps> = (props) => (
  <AdvantageCardsLayout {...props} variant="default" />
);

export const ScrollVersion: React.FC<AdvantageCardsProps> = (props) => (
  <AdvantageCardsLayout {...props} variant="ScrollVersion" />
);

export default Default;

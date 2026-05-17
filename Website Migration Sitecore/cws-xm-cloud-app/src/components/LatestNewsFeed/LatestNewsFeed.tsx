'use client';

import React, { useState, useMemo } from 'react';
import {
  Text,
  Link,
  Image,
  useSitecore,
  type LinkField,
  type Field,
  type ImageField,
} from '@sitecore-content-sdk/nextjs';
import { ChevronRight } from 'lucide-react';
import type { LatestNewsFeedProps } from './LatestNewsFeed.props';
import { useSiteName } from '@/hooks/useSiteName';
import { patchLinkField } from '@/lib/patch-link';
import { cn } from '@/lib/utils';

// Default items per page
const ITEMS_PER_PAGE = 6;

// Helper to check if link field is valid
const hasLinkField = (field: any) => {
  return field && (field.value?.href || field.href || field.jsonValue?.value?.href);
};

export const Default: React.FC<LatestNewsFeedProps> = (props) => {
  const { fields, rendering, className } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const siteName = useSiteName();

  // Resolve datasource - handle both direct fields and nested data.datasource
  const datasource: any = fields?.data?.datasource || fields;

  // Get field values with fallbacks
  const titleField = datasource?.Title?.jsonValue || datasource?.Title || { value: '' };
  const ctaTextField = datasource?.CtaText?.jsonValue || datasource?.CtaText || { value: '' };
  // ItemsPerPage is a numeric field - extract value directly
  const itemsPerPageValue =
    datasource?.ItemsPerPage?.value || datasource?.ItemsPerPage || ITEMS_PER_PAGE;
  const itemsPerPage = parseInt(String(itemsPerPageValue), 10) || ITEMS_PER_PAGE;

  const loadMoreButtonText = datasource?.LoadMoreButtonText?.jsonValue ||
    datasource?.LoadMoreButtonText || { value: 'Load More' };

  // State for pagination
  const [displayedCount, setDisplayedCount] = useState(itemsPerPage);

  // Handle manualNewsItems
  const manualNewsItems =
    datasource?.Items ||
    fields?.Items ||
    datasource?.ManualNewsItems ||
    datasource?.manualNewsItems ||
    datasource?.items ||
    datasource?.newsItems;

  let allNewsItems: any[] = [];
  if (manualNewsItems) {
    if (Array.isArray(manualNewsItems)) {
      allNewsItems = manualNewsItems;
    } else if (Array.isArray(manualNewsItems.targetItems)) {
      allNewsItems = manualNewsItems.targetItems;
    } else if (Array.isArray(manualNewsItems.results)) {
      allNewsItems = manualNewsItems.results;
    }
  }

  // Calculate items to display and if load more should show

  const newsItems = useMemo(
    () => allNewsItems.slice(0, displayedCount),
    [allNewsItems, displayedCount],
  );
  const hasMoreItems = displayedCount < allNewsItems.length;

  const handleLoadMore = () => {
    setDisplayedCount((prev) => Math.min(prev + itemsPerPage, allNewsItems.length));
  };

  return (
    <section
      className={cn(
        'component font-body mx-auto w-full max-w-[1360px] bg-[var(--color-bg-primary)] px-2 md:px-[10px] md:pt-0 mb-12 lg:mb-16',
        className,
      )}
      data-component="LatestNewsFeed"
      id={rendering?.uid}
    >
      <div className="mx-auto flex  max-w-[1360px] flex-col overflow-hidden bg-white md:pt-2">
        {(titleField?.value || isPageEditing) && (
          <Text tag="h2" className="font-heading-h2" field={titleField} />
        )}

        <div className="grid auto-cols-fr gap-3 md:gap-4 lg:grid-cols-3 lg:gap-6">
          {newsItems.map((item: any, index: number) => {
            // Resolve fields for the item
            const itemFields = item.fields || item;

            // Pass full field objects to SDK components to enable inline editing
            // Check jsonValue first to match LinkList pattern
            // Robust casing checks (PascalCase vs camelCase)
            const itemTitle = itemFields?.Title?.jsonValue ||
              itemFields?.Title ||
              itemFields?.title?.jsonValue ||
              itemFields?.title || { value: '' };
            const itemSummary = itemFields?.Summary?.jsonValue ||
              itemFields?.Summary ||
              itemFields?.summary?.jsonValue ||
              itemFields?.summary ||
              itemFields?.Content?.jsonValue ||
              itemFields?.Content || { value: '' };
            const itemImage = itemFields?.Image?.jsonValue ||
              itemFields?.Image ||
              itemFields?.image?.jsonValue ||
              itemFields?.image || { value: {} };
            const itemDate = itemFields?.PublishDate?.jsonValue ||
              itemFields?.PublishDate ||
              itemFields?.publishDate?.jsonValue ||
              itemFields?.publishDate ||
              itemFields?.Date?.jsonValue ||
              itemFields?.Date || { value: '' };
            const rawItemLink = itemFields?.ArticleLink?.jsonValue ||
              itemFields?.ArticleLink ||
              itemFields?.articleLink?.jsonValue ||
              itemFields?.articleLink ||
              itemFields?.Link?.jsonValue ||
              itemFields?.Link || { value: { href: '' } };
            const itemLink = patchLinkField(rawItemLink, siteName) ?? rawItemLink;
            const hasLink = hasLinkField(itemLink);
            const tags = itemFields?.TagList || [];

            return (
              <article
                key={item.id || index}
                className="mt-2 flex h-[600px] flex-col overflow-hidden border border-black/5 bg-white md:mt-0"
              >
                {/* Image Link - Unwrap in editing mode to allow Image editing */}
                {(itemImage?.value?.src || isPageEditing) && (
                  <>
                    {isPageEditing ? (
                      <div className="relative block w-full shrink-0 basis-[42%] overflow-hidden">
                        <div className="h-full w-full">
                          <Image
                            field={itemImage}
                            alt={itemImage?.value?.alt || ''}
                            className="h-full w-full object-contain transition-transform duration-200"
                          />
                        </div>
                      </div>
                    ) : hasLink ? (
                      <Link
                        field={itemLink}
                        className="relative block w-full shrink-0 basis-[42%] overflow-hidden focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-[var(--color-focus-outline)]"
                      >
                        <div className="h-full w-full">
                          <Image
                            field={itemImage}
                            alt={itemImage?.value?.alt || ''}
                            className="h-full w-full object-cover transition-transform duration-200"
                          />
                        </div>
                      </Link>
                    ) : (
                      <div className="relative block w-full shrink-0 basis-[42%] overflow-hidden">
                        <div className="h-full w-full">
                          <Image
                            field={itemImage}
                            alt={itemImage?.value?.alt || ''}
                            className="h-full w-full object-cover  object-top transition-transform duration-200"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="bg-accent-medium flex flex-1 flex-col gap-4 px-6 py-7 md:px-5 md:pt-6 md:pb-6">
                  {tags.length > 0 && (
                    <div className="mb-[1.4rem] flex max-h-[6.5rem] flex-row flex-wrap gap-4 overflow-hidden">
                      {tags.map((tag: any, tagIndex: number) => {
                        const tagFields = tag.fields || tag;
                        const tagName = { value: tag.displayName || tag.name || '' };
                        // Create link field from tag.url or fields.Link
                        const tagUrl =
                          tag.url ||
                          tagFields?.Link?.value?.href ||
                          tagFields?.Link?.jsonValue?.value?.href;
                        const rawTagLink = tagUrl
                          ? { value: { href: tagUrl } }
                          : tagFields?.Link?.jsonValue || tagFields?.Link;
                        const tagLink = patchLinkField(rawTagLink, siteName) ?? rawTagLink;
                        const hasValidLink =
                          tagLink?.value?.href && tagLink.value.href.trim() !== '';

                        if (isPageEditing) {
                          return (
                            <div
                              key={tag.id}
                              data-field="TagList"
                              data-component="TagList"
                              className="mb-[1.4rem] flex flex-col gap-3"
                            >
                              {/* Inline visual tag chips (editable names + link field shown) */}
                              <div className="flex flex-row flex-wrap gap-4">
                                {tags.map((tag: any, tagIndex: number) => {
                                  const tagFields = tag.fields || tag;
                                  const tagName = tag.displayName || {
                                    value: tag.displayName || '',
                                  };
                                  const rawTagLinkEdit = tagFields?.Link?.jsonValue || tagFields?.Link;
                                  const tagLinkEdit = patchLinkField(rawTagLinkEdit, siteName) ?? rawTagLinkEdit;

                                  return (
                                    <div
                                      key={tag.id || tagIndex}
                                      className="flex max-w-full min-w-27 items-center justify-center overflow-hidden rounded-full border border-black/40 bg-transparent p-[0.2rem] text-center text-sm text-ellipsis whitespace-nowrap text-black/40"
                                    >
                                      <Text field={tagName} />
                                      <div className="ml-2 text-xs">
                                        <Link field={tagLinkEdit} className="text-blue-600 underline" />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }

                        if (hasValidLink) {
                          return (
                            <Link
                              key={tag.id || tagIndex}
                              field={tagLink}
                              className="flex max-w-full min-w-27 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-black/40 bg-transparent p-[0.2rem] px-2 text-center text-sm text-ellipsis whitespace-nowrap text-black/40 transition-all duration-100 ease-linear hover:border-black hover:text-black"
                            >
                              <Text field={tagName} />
                            </Link>
                          );
                        }
                        if (tagName?.value) {
                          return (
                            <div
                              key={tag.id || tagIndex}
                              className="flex max-w-full min-w-27 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-black/40 bg-transparent p-[0.2rem] px-2 text-center text-sm text-ellipsis whitespace-nowrap text-black/40 transition-all duration-100 ease-linear hover:border-black hover:text-black"
                            >
                              <Text field={tagName} />
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}
                  {/* Date */}
                  {(itemDate?.value || isPageEditing) && (
                    <div className="font-regular text-sm tracking-[0.02em]">
                      {itemDate?.value
                        ? new Date(itemDate.value).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : ''}
                    </div>
                  )}

                  {/* Title Link */}
                  {/* Title Link - Unwrap in editing mode to allow Title text editing without Link interference */}
                  {isPageEditing ? (
                    <div className="text-inherit no-underline">
                      <Text tag="h3" className="m-0 text-xl font-bold" field={itemTitle} />
                    </div>
                  ) : hasLink ? (
                    <Link
                      field={itemLink}
                      className="text-inherit no-underline focus-visible:rounded-md focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-outline)]"
                    >
                      <Text tag="h3" className="m-0 text-xl font-bold" field={itemTitle} />
                    </Link>
                  ) : (
                    <div className="text-inherit no-underline">
                      <Text tag="h3" className="m-0 text-xl font-bold" field={itemTitle} />
                    </div>
                  )}

                  {/* Summary */}
                  <Text
                    tag="p"
                    className="font-regular m-0 line-clamp-3 text-sm"
                    field={itemSummary}
                  />

                  {/* CTA */}
                  {isPageEditing ? (
                    <div className="group relative mt-auto inline-flex cursor-pointer items-center pb-1 text-sm font-bold no-underline">
                      <ChevronRight className="h-5 w-5 pb-1" strokeWidth={3} aria-hidden="true" />
                      <span className="relative ml-1">
                        {ctaTextField?.value ? (
                          <Text field={ctaTextField} />
                        ) : (
                          itemLink?.value?.text || 'Learn more'
                        )}
                        <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--color-text,#000000)] transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </div>
                  ) : hasLink ? (
                    <Link
                      field={itemLink}
                      className="group relative mt-auto inline-flex cursor-pointer items-center pb-1 text-sm font-bold no-underline"
                    >
                      <ChevronRight className="h-5 w-5 pb-1" strokeWidth={3} aria-hidden="true" />
                      <span className="relative ml-1">
                        {ctaTextField?.value ? (
                          <Text field={ctaTextField} />
                        ) : (
                          itemLink?.value?.text || 'Learn more'
                        )}
                        <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--color-text,#000000)] transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </Link>
                  ) : (
                    <div className="group relative mt-auto inline-flex cursor-pointer items-center pb-1 text-sm font-bold no-underline">
                      <ChevronRight className="h-5 w-5 pb-1" strokeWidth={3} aria-hidden="true" />
                      <span className="relative ml-1">
                        {ctaTextField?.value ? <Text field={ctaTextField} /> : 'Learn more'}
                        <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--color-text,#000000)] transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </div>
                  )}

                  {/* Dedicated Article Link Field - Only visible in Edit Mode */}
                  {isPageEditing && (
                    <div className="mt-4 border-t border-gray-300 pt-2">
                      <span className="mb-1 block text-xs font-bold text-gray-500 uppercase">
                        Article Link
                      </span>
                      <Link field={itemLink} className="text-sm text-blue-600 underline" />
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          {isPageEditing && newsItems.length === 0 && (
            <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] p-6 text-center text-[0.95rem] opacity-60">
              <p>Latest News Feed</p>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {(hasMoreItems || isPageEditing) && (
          <div className="mt-8 flex justify-center">
            {isPageEditing ? (
              <div className="group relative inline-flex items-center gap-2 rounded-md border border-black px-6 py-3 text-sm font-bold text-black transition-all duration-300 ease-in-out">
                <Text field={loadMoreButtonText} />
              </div>
            ) : (
              <button
                onClick={handleLoadMore}
                className="group relative inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-black px-6 py-3 text-sm font-bold text-black transition-all duration-300 ease-in-out hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-black"
                aria-label="Load more news items"
              >
                <span>{loadMoreButtonText?.value || 'Load More'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Default;

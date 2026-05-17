'use client';

import React from 'react';
import { useRouter } from 'next/router';
import {
  Link,
  RichText,
  Text,
  Image,
  Placeholder,
  useSitecore,
  type Field,
  type ImageField,
  type LinkField,
} from '@sitecore-content-sdk/nextjs';
import { BoxesComponentProps } from './BoxesComponent.props';
import { useSiteName } from '@/hooks/useSiteName';
import { patchLinkField } from '@/lib/patch-link';
import { cn } from '@/lib/utils';
import { getDepartmentIconPath } from '@/config/department-icons';

const mobileDepartmentCtaIconPath = '/assets/department-icons/cta-chevron.svg';
import { isCwsHomePage } from '@/utils/is-cws-home-page';

// Helper to case-insensitive pick
const pickCI = (obj: any, names: string[]) => {
  if (!obj) return undefined;
  const keys = Object.keys(obj);
  for (const n of names) {
    const k = keys.find((kk) => kk.toLowerCase() === n.toLowerCase());
    if (k && obj[k] != null) return obj[k];
  }
  return undefined;
};

const asImageField = (f: any): ImageField | undefined => f?.jsonValue ?? f;
const asTextField = (f: any): Field<string> | undefined => {
  if (!f) return undefined;
  const v = f?.jsonValue ?? f;
  if (typeof v === 'string') return { value: v };
  if (typeof v?.value === 'string') return v;
  return undefined;
};
const asLinkField = (f: any): LinkField | undefined => {
  if (!f) return undefined;
  if (f?.value?.href) return f;
  const v = f?.jsonValue ?? f;
  if (v?.value?.href) return v;
  return undefined;
};

export const Default: React.FC<BoxesComponentProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const router = useRouter();
  const pathname = router.asPath ?? router.pathname;
  const isPageEditing = page.mode.isEditing;
  const siteName = useSiteName();
  const routeName = page?.layout?.sitecore?.route?.name;
  const showMobileWysiwygSlot =
    !isPageEditing && isCwsHomePage({ siteName, routeName, pathname });

  const renderingPlaceholders = rendering?.placeholders as Record<string, unknown> | undefined;
  const renderingPlaceholderKeys = Object.keys(renderingPlaceholders ?? {});
  const getPlaceholderLeafName = (placeholderName: string) =>
    placeholderName.split('/').filter(Boolean).pop() ?? placeholderName;
  const resolvePlaceholderName = (baseName: string): string => {
    const matchedPlaceholderName = renderingPlaceholderKeys.find((placeholderKey) => {
      const leafName = getPlaceholderLeafName(placeholderKey).toLowerCase();
      const normalizedBaseName = baseName.toLowerCase();
      return leafName === normalizedBaseName || leafName.startsWith(`${normalizedBaseName}-`);
    });

    if (matchedPlaceholderName) {
      return getPlaceholderLeafName(matchedPlaceholderName);
    }

    const dynamicPlaceholderId =
      (props as any)?.params?.DynamicPlaceholderId ?? (props as any)?.rendering?.params?.DynamicPlaceholderId;
    return dynamicPlaceholderId ? `${baseName}-${dynamicPlaceholderId}` : baseName;
  };

  const mobileBetweenStacksPlaceholderName = resolvePlaceholderName('boxes-between-stacks');

  // Resolve Datasource
  const datasource =
    (fields as any)?.data?.datasource ?? (fields as any)?.datasource ?? rendering?.fields;

  // Resolve Items
  const rawItems = pickCI(datasource, ['items', 'children', 'targetItems']) ?? datasource?.items;
  const itemsArray = rawItems?.targetItems ?? rawItems ?? [];

  if (itemsArray.length === 0 && !isPageEditing) {
    return null;
  }

  const normalizedItems = itemsArray
    .slice(0, 6)
    .map((item: any, index: number) => {
      const nestedFields = item?.fields ?? item;

      const logo = asImageField(pickCI(nestedFields, ['Logo', 'logo']));
      const bgImage = asImageField(pickCI(nestedFields, ['Background Image', 'BackgroundImage']));
      const bgColorField = asTextField(pickCI(nestedFields, ['Background Color', 'BackgroundColor']));
      const bgColor = bgColorField?.value || '';
      const title = asTextField(pickCI(nestedFields, ['Title', 'title']));
      const description = asTextField(pickCI(nestedFields, ['Description', 'description']));
      const rawLink = asLinkField(pickCI(nestedFields, ['Link', 'link']));
      const link = rawLink ? (patchLinkField(rawLink, siteName) ?? rawLink) : rawLink;
      const hoverColorField = asTextField(pickCI(nestedFields, ['Hover Color', 'HoverColor']));
      const hoverColor = hoverColorField?.value || '';
      const linkText =
        (link?.value as { text?: string; description?: string })?.text ||
        (link?.value as { text?: string; description?: string })?.description ||
        'Learn more';

      return {
        index,
        logo,
        bgImage,
        bgColor,
        title,
        description,
        link,
        hoverColor,
        linkText,
      };
    })
    .filter(
      (entry: {
        index: number;
        logo: ImageField | undefined;
        bgImage: ImageField | undefined;
        title: Field<string> | undefined;
        description: Field<string> | undefined;
        link: LinkField | undefined;
        hoverColor: string;
        linkText: string;
      }) => entry.title || entry.description || isPageEditing
    );

  const getDesktopTileClassName = (itemCount: number, index: number): string => {
    const  count = Math.min(Math.max(itemCount, 1), 6);

    if (count === 1) return 'lg:col-span-6 lg:row-span-2';
    if (count === 2) return 'lg:col-span-3 lg:row-span-2';
    if (count === 3) return 'lg:col-span-2 lg:row-span-2';
    if (count === 4) return 'lg:col-span-3 lg:row-span-1';

    if (count === 5) {
      if (index === 0) return 'lg:col-span-3 lg:col-start-1 lg:row-start-1';
      if (index === 1) return 'lg:col-span-3 lg:col-start-4 lg:row-start-1';
      if (index === 2) return 'lg:col-span-2 lg:col-start-1 lg:row-start-2';
      if (index === 3) return 'lg:col-span-2 lg:col-start-3 lg:row-start-2';
      return 'lg:col-span-2 lg:col-start-5 lg:row-start-2';
    }

    // 6 items (or fallback): 3 columns x 2 rows
    return 'lg:col-span-2 lg:row-span-1';
  };

  return (
    <section
      className="component boxes-component relative left-1/2 -ml-[50vw] w-screen max-w-none py-0  lg:h-[calc(100dvh-var(--header-offset,106px))] overflow-hidden lg:pt-[18px]"
      data-component="BoxesComponent"
    >
      <div className="w-full lg:h-full">
        {/* Mobile: images and content are separated sections */}
        <div className="lg:hidden">
          <div className="flex h-[calc(100dvh-var(--header-offset,100px))] flex-col">
            {normalizedItems.map(
              ({
                index,
                logo,
                bgImage,
                bgColor,
                link,
                hoverColor,
                title,
                linkText,
              }: {
                index: number;
                logo: ImageField | undefined;
                bgImage: ImageField | undefined;
                bgColor: string;
                title: Field<string> | undefined;
                description: Field<string> | undefined;
                link: LinkField | undefined;
                hoverColor: string;
                linkText: string;
              }) => {
                const imageContent = (
                  <>
                    <div className="absolute inset-0 z-0">
                      {bgImage?.value?.src ? (
                        <Image field={bgImage} className="h-full w-full object-cover" alt="" />
                      ) : (
                        <div className="h-full w-full" style={{ backgroundColor: bgColor }} />
                      )}
                    </div>
                    {logo?.value?.src && (
                      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                        <Image field={logo} className="h-auto  w-[44%] max-w-[400px] object-contain" alt="" />
                      </div>
                    )}
                  </>
                );

                const imageTileClassName =
                  'relative block h-[16.6666667%] w-full min-w-0 overflow-hidden no-underline';

                return link?.value?.href ? (
                  <Link
                    key={`mobile-image-${index}`}
                    field={link}
                    className={imageTileClassName}
                    style={{ '--hover-color': hoverColor } as React.CSSProperties}
                    aria-label={title?.value || linkText}
                  >
                    {imageContent}
                  </Link>
                ) : (
                  <div
                    key={`mobile-image-${index}`}
                    className={imageTileClassName}
                    style={{ '--hover-color': hoverColor } as React.CSSProperties}
                  >
                    {imageContent}
                  </div>
                );
              },
            )}
          </div>

          {showMobileWysiwygSlot && <div id="cws-home-mobile-wysiwyg-slot" data-wysiwyg-slot="cws-home-mobile" />}

          <div className="mt-0 space-y-2.5">
            {normalizedItems.map(
              ({
                index,
                logo,
                title,
                description,
                link,
                hoverColor,
                linkText,
              }: {
                index: number;
                logo: ImageField | undefined;
                bgImage: ImageField | undefined;
                title: Field<string> | undefined;
                description: Field<string> | undefined;
                link: LinkField | undefined;
                hoverColor: string;
                linkText: string;
              }) => {
              const departmentIconPath = getDepartmentIconPath(link?.value?.href, title?.value);
              const contentCard = (
                <div className="w-full p-6 text-left text-black" style={{ backgroundColor: 'var(--hover-color)' }}>

                  {departmentIconPath && (
                    <img
                      src={departmentIconPath}
                      alt={title?.value ? `${title.value} icon` : 'Department icon'}
                      className="h-[24px] w-auto object-contain"
                      loading="lazy"
                    />
                  )}


                  {title && (
                    <Text tag="h3" field={title} className="text-[20px]  pt-[10px] pb-[30px] lg:pt-0 lg:pb-0 lg:text-[32px] leading-[1.02] font-bold" />
                  )}

                  {description && (
                    <div className="text-left text-[14px] leading-[18px]! tracking-[0.1px] opacity-90 lg:mb-4 [&_*]:text-black">
                      <RichText field={description} />
                    </div>
                  )}

                  {link?.value?.href && (
                    <span className="mt-[50px] pointer-events-auto inline-flex h-[24px] items-center gap-1 rounded-[20px] border border-black bg-transparent px-3 py-4 text-[14px] leading-none font-normal text-black transition-colors duration-200 hover:bg-black hover:text-white">
                      <img
                        src="/assets/department-icons/up-right-arrow-black.svg"
                        alt=""
                        className="h-3 w-3 object-contain mr-2"
                        aria-hidden="true"
                        loading="lazy"
                      />
                      {linkText}
                    </span>
                  )}
                </div>
              );

              return link?.value?.href ? (
                <Link
                  key={`mobile-content-${index}`}
                  field={link}
                  className="block no-underline px-2"
                  style={{ '--hover-color': hoverColor } as React.CSSProperties}
                  aria-label={title?.value || linkText}
                >
                  {contentCard}
                </Link>
              ) : (
                <div
                  key={`mobile-content-${index}`}
                  style={{ '--hover-color': hoverColor } as React.CSSProperties}
                >
                  {contentCard}
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop: count-aware layout that always fills the available area */}
        <div className="hidden h-full lg:grid lg:grid-cols-6 lg:grid-rows-2">
          {normalizedItems.map(
            ({
              index,
              logo,
              bgImage,
              bgColor,
              title,
              description,
              link,
              hoverColor,
              linkText,
            }: {
              index: number;
              logo: ImageField | undefined;
              bgImage: ImageField | undefined;
              bgColor: string;
              title: Field<string> | undefined;
              description: Field<string> | undefined;
              link: LinkField | undefined;
              hoverColor: string;
              linkText: string;
            }) => {
              const desktopTileLayoutClassName = getDesktopTileClassName(normalizedItems.length, index);

              const boxContent = (
                <div className="h-full w-full">
                  {/* Background Image - always visible */}
                  <div className="absolute inset-0 z-0">
                    {bgImage?.value?.src ? (
                      <Image
                        field={bgImage}
                        className="h-full w-full overflow-hidden object-cover transition-all duration-200 ease-in-out"
                        alt=""
                      />
                    ) : (
                      <div className="h-full w-full" style={{ backgroundColor: bgColor }} />
                    )}
                    <div
                      className="pointer-events-none absolute inset-0 block w-full bg-linear-to-b from-black/0 to-black/20"
                      aria-hidden
                    />
                    {/* Hover color overlay - fades in on hover (or always in edit mode) */}
                    <div
                      className={cn(
                        'absolute inset-0 block w-full transition-opacity duration-300',
                        isPageEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                      )}
                      style={{ backgroundColor: 'var(--hover-color)' }}
                      aria-hidden
                    />
                  </div>

                  {/* Logo - centered, hidden on hover */}
                  {logo?.value?.src && (
                    <div
                      className={cn(
                        'pointer-events-none absolute inset-0 z-10 flex h-full w-full items-center justify-center transition-opacity duration-300 lg:flex-col lg:items-start lg:justify-center lg:p-[10%_15%] scale-[0.88]',
                        isPageEditing ? 'opacity-50' : 'opacity-100 group-hover:opacity-0',
                      )}
                    >
                      <div
                        className="absolute left-0 top-0 h-full w-full bg-center bg-no-repeat bg-size-[50vw_auto] lg:bg-size-[23vw_auto]"
                        style={{ backgroundImage: `url(${logo.value.src})` }}
                        aria-hidden
                      />
                      <Image field={logo} className="sr-only" alt="" />
                    </div>
                  )}

                  {/* Title + Description + Button - visible only on hover (or always in edit mode) */}
                  <div
                    className={cn(
                      'pointer-events-none absolute inset-0 z-10 h-full w-full text-left text-black transition-opacity duration-300 lg:flex lg:flex-col lg:items-start lg:justify-center lg:p-[10%_15%]',
                      isPageEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                    )}
                  >
                    {title && (
                      <Text
                        tag="h3"
                        field={title}
                        className="mb-4 hidden font-bold text-[32px] leading-[50px] lg:block"
                      />
                    )}
                    {description && (
                      <div className="relative hidden items-start justify-start lg:flex">
                        <div className="text-[17px] font-normal leading-[28px] text-black opacity-90 antialiased [text-rendering:optimizeLegibility] [&_*]:text-black">
                          <RichText field={description} />
                        </div>
                      </div>
                    )}
                    {link?.value?.href && (
                      <span className="pointer-events-auto block cursor-pointer bg-transparent text-center text-[14px] leading-none text-black transition-colors duration-200 ease-in-out min-w-[220px] h-[34px] rounded-[30px] border border-black px-[15px] py-[10px] font-normal hover:bg-black hover:text-white lg:relative lg:w-max lg:mt-[30px]">
                        {linkText}
                      </span>
                    )}
                  </div>
                </div>
              );

              return link?.value?.href ? (
                <Link
                  key={`desktop-${index}`}
                  field={link}
                  className={cn(
                    'group relative block min-w-0 overflow-hidden no-underline transition-all duration-300',
                    desktopTileLayoutClassName,
                  )}
                  style={{ '--hover-color': hoverColor } as React.CSSProperties}
                  aria-label={title?.value || linkText}
                >
                  {boxContent}
                </Link>
              ) : (
                <div
                  key={`desktop-${index}`}
                  className={cn(
                    'group relative min-w-0 overflow-hidden transition-all duration-300',
                    desktopTileLayoutClassName,
                  )}
                  style={{ '--hover-color': hoverColor } as React.CSSProperties}
                >
                  {boxContent}
                </div>
              );
            },
          )}
        </div>
      </div>
    </section>
  );
};

export default Default;

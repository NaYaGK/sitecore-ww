'use client';

import { Link, RichText, Text, Image, useSitecore } from '@sitecore-content-sdk/nextjs';

import { ProductTeaserGridProps } from './ProductTeaserGrid.props';

import { useSiteName } from '@/hooks/useSiteName';
import { patchHref, patchLinkField } from '@/lib/patch-link';
import { NoDataFallback } from '@/utils/NoDataFallback';

export const Default: React.FC<ProductTeaserGridProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const siteName = useSiteName();

  // Handle flexible field resolution
  const datasource: any = fields?.data?.datasource ?? (fields as any)?.datasource ?? fields;

  // Extract fields
  const titleFieldRaw = datasource?.Title ?? datasource?.title;
  const titleField = titleFieldRaw?.jsonValue ?? titleFieldRaw;
  const titleValue = titleFieldRaw?.value ?? titleFieldRaw?.jsonValue?.value;

  const subTitleFieldRaw = datasource?.SubTitle ?? datasource?.subTitle;
  const subTitleField = subTitleFieldRaw?.jsonValue ?? subTitleFieldRaw;
  const subTitleValue = subTitleFieldRaw?.value ?? subTitleFieldRaw?.jsonValue?.value;

  const descriptionFieldRaw = datasource?.Description ?? datasource?.description;
  const descriptionField = descriptionFieldRaw?.jsonValue ?? descriptionFieldRaw;
  const descriptionValue = descriptionFieldRaw?.value ?? descriptionFieldRaw?.jsonValue?.value;

  const itemsField = datasource?.Items ?? datasource?.items;
  let items = Array.isArray(itemsField) ? itemsField : (itemsField?.targetItems ?? []);
  // to remove

  const linkFieldRaw = datasource?.Link ?? datasource?.link;
  const mainLinkFieldResolved = linkFieldRaw?.jsonValue ?? linkFieldRaw;
  const mainLinkField = mainLinkFieldResolved
    ? (patchLinkField(mainLinkFieldResolved, siteName) ?? mainLinkFieldResolved)
    : mainLinkFieldResolved;
  const mainLinkValue = linkFieldRaw?.value ?? linkFieldRaw?.jsonValue?.value;

  // Don't render if no data and not editing
  if (!titleValue && items.length === 0 && !isPageEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'ProductTeaserGrid'} />;
  }

  return (
    <section
      className="component font-body mb-10 bg-white mb-12 lg:mb-18"
      data-component="ProductTeaserGrid"
    >
      <div className="mx-auto max-w-[1360px] pr-0 pl-2 md:pl-[10px]">
        {subTitleField && (
          <div className="subtitle my-[17px] text-[17px]">
            <Text field={subTitleField} tag="p" />
          </div>
        )}
        {/* Title */}
        {(titleField || titleValue) && (
          <>
            {titleField ? (
              <Text
                tag="h2"
                field={titleField}
                className="font-heading-h2 mb-6!"
              />
            ) : (
              <h2 className="font-heading-h2 text-[1.75rem] leading-[1.2] font-bold text-(--color-text) md:text-[40px]">
                {titleValue}
              </h2>
            )}
          </>
        )}

        {/* Description */}
        {(descriptionField || descriptionValue) && (
          <div className="mb-[20px] sm:mb-[65px]">
            {descriptionField ? (
              <RichText field={descriptionField} className="m-0 text-base leading-[25px] lg:leading-[28px] text-(--color-text) [&_p]:text-[18px] [&_p]:leading-[25px] lg:[&_p]:leading-[28px]" />
            ) : (
              <p className="m-0 text-base  leading-[25px] lg:leading-[28px] text-(--color-text)">{descriptionValue}</p>
            )}
          </div>
        )}

        {/* Product Grid */}
        <div className="flex flex-row gap-8 overflow-x-auto pb-4 md:gap-8 md:pr-2 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
          {items.map((item: any, index: number) => {
            const itemFields = item?.fields;
            const itemTitleFieldRaw = itemFields?.Title;
            const itemTitleField = itemTitleFieldRaw?.jsonValue ?? itemTitleFieldRaw;
            const itemTitleValue =
              itemTitleFieldRaw?.value ?? itemTitleFieldRaw?.jsonValue?.value ?? item?.name ?? item?.displayName;
            const itemImageFieldRaw = itemFields?.Image;
            const itemImageField = itemImageFieldRaw?.jsonValue ?? itemImageFieldRaw;
            const itemImageValue = itemImageFieldRaw?.value ?? itemImageFieldRaw?.jsonValue?.value;
            const itemLinkFieldRaw = itemFields?.Link;
            const itemLinkFieldResolved = itemLinkFieldRaw?.jsonValue ?? itemLinkFieldRaw;
            const itemLinkField = itemLinkFieldResolved
              ? (patchLinkField(itemLinkFieldResolved, siteName) ?? itemLinkFieldResolved)
              : itemLinkFieldResolved;
            const itemLinkValue = itemLinkFieldRaw?.value ?? itemLinkFieldRaw?.jsonValue?.value;
            const rawLinkHref = itemLinkValue?.href ?? itemLinkValue?.url;
            const linkHref = patchHref(rawLinkHref, siteName) ?? rawLinkHref;
            const linkText = itemLinkValue?.text ?? 'Show details';

            return (
              <div
                key={item?.id || index}
                className="mt-2 flex min-w-[165px] flex-col md:mt-0 md:max-w-[328px] md:min-w-[228px] lg:min-w-0"
              >
                {/* Image with Link */}
                {(itemImageField || itemImageValue?.src) && (
                  <>
                    {isPageEditing ? (
                      <div className="group relative block aspect-square w-full overflow-hidden bg-[#f5f5f5]">
                        {itemImageField ? (
                          <Image field={itemImageField} className="h-full w-full object-cover" />
                        ) : (
                          <img
                            src={itemImageValue?.src}
                            alt={itemImageValue?.alt || itemTitleValue || ''}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                    ) : itemLinkField ? (
                      <Link
                        field={itemLinkField}
                        className="group relative block aspect-square w-full overflow-hidden bg-[#f5f5f5]"
                        title={linkText}
                      >
                        {itemImageField ? (
                          <Image field={itemImageField} className="h-full w-full object-cover" />
                        ) : (
                          <img
                            src={itemImageValue?.src}
                            alt={itemImageValue?.alt || itemTitleValue || ''}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </Link>
                    ) : linkHref ? (
                      <a
                        href={linkHref}
                        className="group relative block aspect-square w-full overflow-hidden bg-[#f5f5f5]"
                        title={linkText}
                      >
                        {itemImageField ? (
                          <Image field={itemImageField} className="h-full w-full object-cover" />
                        ) : (
                          <img
                            src={itemImageValue?.src}
                            alt={itemImageValue?.alt || itemTitleValue || ''}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </a>
                    ) : (
                      <div className="group relative block aspect-square w-full overflow-hidden bg-[#f5f5f5]">
                        {itemImageField ? (
                          <Image field={itemImageField} className="h-full w-full object-cover" />
                        ) : (
                          <img
                            src={itemImageValue?.src}
                            alt={itemImageValue?.alt || itemTitleValue || ''}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between">
                  {(itemTitleField || itemTitleValue) && (
                    <>
                      {itemTitleField ? (
                        <Text
                          tag="h3"
                          field={itemTitleField}
                          className="m-0 mt-3 line-clamp-4 text-2xl leading-[1.5rem] font-bold md:mt-6"
                        />
                      ) : (
                        <h3 className="m-0 mt-3 line-clamp-4 text-2xl leading-[1.5rem] font-bold md:mt-6">
                          {itemTitleValue}
                        </h3>
                      )}
                    </>
                  )}

                  {(itemLinkField || linkHref) && (
                    <>
                      {itemLinkField ? (
                        <Link
                          field={itemLinkField}
                          className="group mt-4 mb-6 inline-flex items-center gap-0 font-bold"
                          title={linkText}
                        >
                          <img src="/assets/icons/chevron-right.svg" alt="" className="-ml-2 h-7 w-7" />
                          <span className="relative text-[17px] lg:text-[18px] after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-0 after:bg-current after:transition-[width] after:duration-300 group-hover:after:w-full">
                            {linkText}
                          </span>
                        </Link>
                      ) : (
                        <a
                          href={linkHref}
                          className="group mt-4 mb-6 inline-flex items-center gap-0 font-bold"
                          title={linkText}
                        >
                          <img src="/assets/icons/chevron-right.svg" alt="" className="-ml-2 h-7 w-7" />
                          <span className="relative text-[17px] lg:text-[18px] after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-0 after:bg-current after:transition-[width] after:duration-300 group-hover:after:w-full">
                            {linkText}
                          </span>
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* All Products Link Box */}
          {(mainLinkField?.value?.href || mainLinkValue?.href) && (
            <div className="mr-[26px] mt-2 flex aspect-square min-w-[165px] self-start border-[2px] border-black sm:mr-[60px] md:mt-0 md:min-w-[230px] lg:min-w-0 lg:mr-0 lg:self-auto">
              {mainLinkField?.value?.href ? (
                <Link
                  field={mainLinkField}
                  className="flex w-full items-end justify-center p-4 md:px-5 md:py-6 lg:justify-start"
                >
                  <div className="flex items-center">
                    <img
                      src="/assets/icons/chevron-right.svg"
                      alt=""
                      className="h-7 w-7 shrink-0 md:h-8 md:w-8"
                    />
                    <span className="text-[18px] font-bold leading-tight md:text-[20px]">
                      {mainLinkValue?.text || 'All products'}
                    </span>
                  </div>
                </Link>
              ) : (
                <a
                  href={patchHref(mainLinkValue?.href, siteName) ?? mainLinkValue?.href}
                  className="flex w-full items-end justify-center p-4 md:px-5 md:py-6 lg:justify-start"
                  title={mainLinkValue?.text}
                >
                  <div className="flex items-center">
                    <img
                      src="/assets/icons/chevron-right.svg"
                      alt=""
                      className="h-7 w-7 shrink-0 md:h-8 md:w-8"
                    />
                    <span className="text-[18px] font-bold leading-tight md:text-[20px]">
                      {mainLinkValue?.text || 'All products'}
                    </span>
                  </div>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Default;

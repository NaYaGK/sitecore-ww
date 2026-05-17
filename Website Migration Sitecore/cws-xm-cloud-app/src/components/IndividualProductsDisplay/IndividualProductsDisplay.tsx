'use client';

import React from 'react';
import { Text, Image, useSitecore, type ImageField } from '@sitecore-content-sdk/nextjs';

import { IndividualProductsDisplayProps } from './IndividualProductsDisplay.props';

import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

const hasValidAttributes = (attributes?: Array<any>): boolean => {
  if (!attributes || attributes.length === 0) return false;
  return attributes.some((attr) => {
    const attrField = attr?.fields?.Attribute;
    const attrValue = attrField?.value ?? attrField?.jsonValue?.value;
    return attrValue && attrValue.trim().length > 0;
  });
};

export const Default: React.FC<IndividualProductsDisplayProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing || page.mode.isPreview;

  // Handle flexible field resolution - datasource might be at different levels
  const datasource: any = fields?.data?.datasource ?? fields?.data ?? fields;
  const rootFields: any = (props as any)?.rendering?.fields ?? (props as any)?.fields ?? {};

  // Case-insensitive field access
  const titleFieldRaw = datasource?.Title ?? datasource?.title;
  const imageFieldRaw = datasource?.Image ?? datasource?.image;
  const attributesField = datasource?.Attributes ?? datasource?.attributes ?? [];
  const productsField =
    datasource?.Products ?? datasource?.products ?? rootFields?.Products ?? rootFields?.products;
  const products = Array.isArray(productsField)
    ? productsField
    : Array.isArray(productsField?.targetItems)
      ? productsField.targetItems
      : [];

  const titleField = titleFieldRaw?.jsonValue ?? titleFieldRaw;
  const titleValue = titleFieldRaw?.value ?? titleFieldRaw?.jsonValue?.value;
  const imageField = imageFieldRaw?.jsonValue ?? imageFieldRaw;
  const imageValue = imageFieldRaw?.value ?? imageFieldRaw?.jsonValue?.value;
  const attributes = Array.isArray(attributesField) ? attributesField : [];

  const hasImage = imageField?.value?.src || imageValue?.src || isPageEditing;
  const hasTitle = Boolean(titleField || titleValue || isPageEditing);
  const hasAttributes = attributes.length > 0 || isPageEditing;
  const hasProducts = products.length > 0;
  const hasContent = Boolean(
    titleField || titleValue || imageField || imageValue || attributes.length || hasProducts,
  );

  const editableTitleField = titleField ?? { value: '' };
  const editableImageField =
    imageField ??
    ({
      value: {
        src: '',
        alt: '',
      },
    } as ImageField);

  if (!hasContent && !isPageEditing) {
    return (
      <NoDataFallback componentName={rendering?.componentName ?? 'IndividualProductsDisplay'} />
    );
  }

  const renderAttributes = (items: any[]) => (
    <ul className="font-regular m-0 flex flex-col gap-0 pl-0 text-lg">
      {items.length > 0
        ? items.map((attr: any, attrIndex: number) => {
            const attrField = attr?.fields?.Attribute;
            const attrValue = attrField?.value ?? attrField?.jsonValue?.value;

            if (!attrValue && !isPageEditing) {
              return null;
            }

            return (
              <li
                key={attr?.id || attrIndex}
                className="relative pl-5 before:absolute before:left-0 before:top-[14px] before:h-[5px] before:w-[5px] before:-translate-y-1/2 before:bg-current lg:before:h-[5px] lg:before:w-[5px]"
              >
                {attrField ? (
                  <Text
                    tag="span"
                    className="font-body"
                    field={attrField?.jsonValue ?? attrField}
                  />
                ) : (
                  <span className="font-body">{attrValue}</span>
                )}
              </li>
            );
          })
        : isPageEditing && (
            <li className="relative pl-5 before:absolute before:left-0 before:top-1/2 before:h-[8px] before:w-[8px] before:-translate-y-1/2 before:bg-current lg:before:h-[9px] lg:before:w-[9px]">
              <span className="font-body"></span>
            </li>
          )}
    </ul>
  );

  const renderProductItem = (product: any, index: number) => {
    const productFields = product?.fields ?? product;
    const productTitleRaw = productFields?.Title ?? productFields?.title;
    const productImageRaw = productFields?.Image ?? productFields?.image;
    const productAttributes = Array.isArray(productFields?.Attributes)
      ? productFields.Attributes
      : Array.isArray(productFields?.attributes)
        ? productFields.attributes
        : [];

    const productTitleField = productTitleRaw?.jsonValue ?? productTitleRaw;
    const productTitleValue = productTitleRaw?.value ?? productTitleRaw?.jsonValue?.value ?? '';
    const productImageField = productImageRaw?.jsonValue ?? productImageRaw;
    const productImageValue =
      productImageRaw?.value ?? productImageRaw?.jsonValue?.value ?? undefined;

    const productEditableTitle = productTitleField ?? { value: '' };
    const productEditableImage =
      productImageField ??
      ({
        value: {
          src: '',
          alt: '',
        },
      } as ImageField);

    const showProductTitle = Boolean(productTitleField || productTitleValue || isPageEditing);
    const showProductImage = Boolean(productImageField || productImageValue?.src || isPageEditing);

    return (
      <div key={product?.id || index} className="flex w-full flex-col gap-4 p-1">
        {showProductImage && (
          <div className="flex w-full items-center justify-center">
            {productImageField || isPageEditing ? (
              <Image field={productEditableImage} className="h-auto max-w-full object-contain"  alt=""/>
            ) : productImageValue ? (
              <Image
                field={{ value: productImageValue as ImageField['value'] }}
                className="h-auto max-w-full object-contain"
                alt=""
              />
            ) : null}
          </div>
        )}

        {showProductTitle && (
          <Text
            tag="h3"
            className="m-0 p-0 text-[17px] leading-[25px] md:text-lg   font-bold"
            field={isPageEditing ? productEditableTitle : { value: productTitleValue ?? '' }}
          />
        )}

        {renderAttributes(productAttributes)}
      </div>
    );
  };

  return (
    <section
      className={cn('component individual-products-display mb-12 lg:mb-18')}
      data-component="IndividualProductsDisplay"
    >
      <div className="mx-auto w-full max-w-[1360px] px-2 md:px-[10px]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:gap-6">
          {hasProducts ? (
            products.map((product: any, index: number) => renderProductItem(product, index))
          ) : (
            <>
              <div className="flex w-full items-center justify-center">
                {hasImage && (
                  <div className="flex w-full items-center justify-center">
                    {imageField || isPageEditing ? (
                      <Image
                        field={editableImageField}
                        className="h-auto max-w-full object-contain"
                        alt=""
                      />
                    ) : imageValue ? (
                      <Image
                        field={{ value: imageValue as ImageField['value'] }}
                        className="h-auto max-w-full object-contain"
                        alt=""
                      />
                    ) : null}
                  </div>
                )}
              </div>

              <div className="flex w-full flex-col gap-4">
                {hasTitle && (
                  <Text
                    tag="h3"
                    className="font-heading-h3 m-0 p-0 text-xl font-semibold"
                    field={isPageEditing ? editableTitleField : { value: titleValue ?? '' }}
                  />
                )}

                {hasAttributes && renderAttributes(attributes)}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Default;

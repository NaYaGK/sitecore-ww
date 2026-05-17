'use client';

import React from 'react';
import { Text, useSitecore } from '@sitecore-content-sdk/nextjs';

import { ProductTeaserGridProps } from './IndividualProductTeaserGrid.props';
import { Default as IndividualProductsDisplay } from '../IndividualProductsDisplay/IndividualProductsDisplay';
import type { IndividualProductsDisplayProps } from '../IndividualProductsDisplay/IndividualProductsDisplay.props';

import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

const hasValidProducts = (products?: Array<any>, isPageEditing?: boolean): boolean => {
  if (!products || products.length === 0) return Boolean(isPageEditing);
  return products.some((product) => {
    const productFields = product?.fields ?? product;
    const titleValue =
      productFields?.Title?.value ?? productFields?.Title?.jsonValue?.value;
    const imageValue =
      productFields?.Image?.value ?? productFields?.Image?.jsonValue?.value;
    const hasTitle = Boolean(titleValue?.trim());
    const hasImage = Boolean(imageValue?.src);
    const hasAttributes = Boolean(productFields?.Attributes && productFields.Attributes.length > 0);
    return hasTitle || hasImage || hasAttributes || isPageEditing;
  });
};

const createIndividualProductsDisplayProps = (product: any): IndividualProductsDisplayProps => {
  // Handle both nested fields structure and direct structure
  const productFields = product?.fields ?? product;
  return {
    fields: {
      data: {
        datasource: {
          Title: productFields?.Title,
          Image: productFields?.Image,
          Attributes: productFields?.Attributes ?? [],
        },
      },
    },
    rendering: {
      componentName: 'IndividualProductsDisplay',
    },
    params: {},
  } as IndividualProductsDisplayProps;
};

export const Default: React.FC<ProductTeaserGridProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  // Handle flexible field resolution - fields can be an array directly or nested
  let products: any[] = [];
  let sectionTitleField: any = null;

  // Check if fields is an array directly
  if (Array.isArray(fields)) {
    products = fields;
  } else {
    // Handle nested structure
    const datasource: any = fields?.data?.datasource ?? fields?.data ?? fields;
    const sectionTitleFieldRaw = datasource?.SectionTitle ?? datasource?.sectionTitle;
    sectionTitleField = sectionTitleFieldRaw?.jsonValue ?? sectionTitleFieldRaw;
    const productsField = datasource?.Products ?? [];
    products = Array.isArray(productsField) ? productsField : (productsField?.targetItems ?? []);
  }

  if (!products || products.length === 0) {
    if (!isPageEditing) {
      return <NoDataFallback componentName={rendering?.componentName ?? 'ProductTeaserGrid'} />;
    }
  }

  if (!hasValidProducts(products, isPageEditing) && !isPageEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'ProductTeaserGrid'} />;
  }

  return (
    <section className="mb-8 md:mb-16" data-component="ProductTeaserGrid">
      <div className="mx-auto max-w-[1440px] px-2 md:px-[10px]">
        {sectionTitleField && (
          <Text
            tag="h2"
            className="font-heading-h2 m-0 mb-12 text-left"
            field={
              sectionTitleField?.jsonValue ??
              (typeof sectionTitleField === 'string' ? { value: sectionTitleField } : sectionTitleField)
            }
          />
        )}

        {products && products.length > 0 && (
          <div className="flex flex-nowrap gap-8 overflow-x-auto pb-2">
            {products.map((product: any, index: number) => (
              <IndividualProductsDisplay
                key={product?.id || index}
                {...createIndividualProductsDisplayProps(product)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Default;

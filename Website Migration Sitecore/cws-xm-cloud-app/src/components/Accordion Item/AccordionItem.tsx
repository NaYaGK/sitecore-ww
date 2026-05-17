'use client';

import { useState } from 'react';
import { RichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { Plus, Minus } from 'lucide-react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';

import { AccordionItemProps } from './accordionItem.props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

export const Default: React.FC<AccordionItemProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing;

  // Resolve datasource - handle both direct fields and fields.data.datasource patterns
  const datasource = (fields as any)?.data?.datasource ?? fields ?? {};

  const getFieldValue = (field: any) => {
    if (!field) return { value: '' };
    if (field.jsonValue) return field.jsonValue;
    if (typeof field === 'object' && 'value' in field) return field;
    return { value: '' };
  };

  const questionField = getFieldValue(datasource?.Question);
  const answerField = getFieldValue(datasource?.Answer);

  const hasContent = Boolean(questionField?.value?.trim()) || Boolean(answerField?.value?.trim());

  if (!hasContent && !isEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'AccordionItem'} />;
  }

  const backgroundColor = datasource?.BackgroundColor?.jsonValue?.value || '#FDE428';

  return (
    <div
      className="component component-accordion-item w-full"
      data-component="AccordionItem"
      style={{ backgroundColor }}
    >
      <div className="mx-auto max-w-[1360px] px-2 md:px-[10px]">
        <AccordionPrimitive.Root type="single" collapsible className="w-full">
          <AccordionPrimitive.Item value="item-1" className="border-b-2 border-black">
            <AccordionPrimitive.Header>
              <AccordionPrimitive.Trigger className="font-heading flex w-full cursor-pointer appearance-none items-center justify-between gap-6 border-0 bg-transparent py-4 text-left text-lg leading-relaxed font-semibold text-inherit focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black/20 md:gap-4 md:py-6 lg:py-5 lg:text-base [&[data-state=closed]>span>svg.minus]:hidden [&[data-state=closed]>span>svg.plus]:block [&[data-state=open]>span>svg.minus]:block [&[data-state=open]>span>svg.plus]:hidden">
                <span className="flex-1 text-pretty">
                  <Text
                    tag="span"
                    field={questionField}
                    className="text-[17px] leading-[25px] font-bold sm:text-[19px] md:text-[22px]"
                  />
                </span>
                <span
                  className="inline-flex h-10 w-10 flex-none items-center justify-center"
                  aria-hidden="true"
                >
                  <Plus strokeWidth={1.5} className="plus h-full w-full" />
                  <Minus strokeWidth={1.5} className="minus hidden h-full w-full" />
                </span>
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-lg">
              <div className="pb-6 lg:pb-12">
                <RichText
                  className="font-body text-lg leading-relaxed [&_P]:leading-[25px] [&_p]:mb-4 [&_p:last-child]:mb-0"
                  field={answerField}
                />
              </div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        </AccordionPrimitive.Root>
      </div>
    </div>
  );
};

export default Default;

'use client';

import React from 'react';
import {
    Image,
    RichText,
    Text,
    useSitecore,
    type Field,
    type ImageField,
    type RichTextField,
} from '@sitecore-content-sdk/nextjs';

import { ComparisonProps } from './Comparison.props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

// ─── field helpers ────────────────────────────────────────────────────────────

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

// Case-insensitive field pick
const pickCI = (obj: any, names: string[]) => {
    if (!obj) return undefined;
    const keys = Object.keys(obj);
    for (const n of names) {
        const k = keys.find((kk) => kk.toLowerCase() === n.toLowerCase());
        if (k && obj[k] != null) return obj[k];
    }
    return undefined;
};

// ─── component ────────────────────────────────────────────────────────────────

export const Default: React.FC<ComparisonProps> = (props) => {
    const { fields, rendering } = props;
    const { page } = useSitecore();
    const isPageEditing = page?.mode?.isEditing;

    // Flexible datasource resolution
    const initialDs: any =
        (fields as any)?.data?.datasource ??
        (fields as any)?.datasource ??
        (fields as any) ??
        (rendering as any)?.fields ??
        {};

    const ds: any =
        initialDs && typeof initialDs === 'object' && initialDs.fields ? initialDs.fields : initialDs;

    // Left section
    const leftTitle = asTextField(pickCI(ds, ['LeftTitle', 'lefttitle']));
    const leftSubTitle = asTextField(pickCI(ds, ['LeftSubTitle', 'leftsubtitle']));
    const leftText = asRichTextField(pickCI(ds, ['LeftCamparisonText', 'leftcamparisontext']));

    // Centre image
    const imageField = asImageField(pickCI(ds, ['Image', 'image']));
    const hasImage = Boolean(imageField?.value?.src) || Boolean(isPageEditing);

    // Right section
    const rightTitle = asTextField(pickCI(ds, ['RightTitle', 'righttitle']));
    const rightSubTitle = asTextField(pickCI(ds, ['RightSubTitle', 'rightsubtitle']));
    const rightText = asRichTextField(pickCI(ds, ['RightCamparsionText', 'rightcamparsiontext']));

    const hasContent =
        leftTitle?.value ||
        leftText?.value ||
        rightTitle?.value ||
        rightText?.value ||
        hasImage;

    if (!hasContent && !isPageEditing) {
        return <NoDataFallback componentName={rendering?.componentName ?? 'Comparison'} />;
    }

    return (
        <section
            className={cn('component comparison relative w-full overflow-hidden bg-bg-comparison-left mb-10 lg:mb-14')}
            data-component="Comparison"
        >
            <div className="mx-auto flex max-w-[1360px] flex-col lg:flex-row lg:items-stretch ">

                {/* ── Left column — cream background ── */}
                <div
                    className={cn(
                        '-order-1 w-full basis-full bg-bg-comparison-left px-2 py-5',
                        'lg:order-0 lg:w-[34%] lg:basis-[34%] lg:pl-[16px] lg:pr-[37px] lg:pt-[70px] lg:pb-[85px]',
                    )}
                >
                    {(leftTitle || isPageEditing) && (
                        <Text
                            tag="h2"
                            className="m-0 text-[27px] font-bold leading-[34px] text-black"
                            field={leftTitle}
                        />
                    )}
                    {(leftSubTitle || isPageEditing) && (
                        <Text
                            tag="p"
                            className="mt-[5px] mb-[23px] text-[16px] leading-[24px] text-[#666666]"
                            field={leftSubTitle}
                        />
                    )}
                    {(leftText || isPageEditing) && (
                        <div
                            className={cn(
                                'text-black',
                                // RichText may render either <p> items or <ul><li> items.
                                // Apply the same "highlight row" styling to both.
                                '[&_p]:text-[17px] [&_p]:leading-[28px] [&_p]:break-words',
                                '[&_li]:text-[17px] [&_li]:leading-[28px] [&_li]:break-words',
                                // If RichText outputs <li><p>...</p></li>, reset inner <p> defaults.
                                '[&_li>p]:m-0 [&_li>p]:p-0 [&_li>p]:font-inherit [&_li>p]:text-inherit [&_li>p]:leading-inherit [&_li>p]:break-words',
                                '[&_li>p]:border-0 [&_li>p]:pb-0 [&_li>p]:pl-0 [&_li>p]:mt-0',
                                '[&_li>p::before]:content-none',
                                '[&_p]:font-semibold [&_li]:font-semibold',
                                // 1rem=10px: margin-top 1.4rem => 14px
                                '[&_p]:mt-[14px] [&_li]:mt-[14px]',
                                '[&_p:first-child]:mt-0 [&_li:first-child]:mt-0',
                                // padding: 0 0 1.3rem 3.3rem => pb 13px, pl 33px
                                '[&_p]:pb-[13px] [&_li]:pb-[13px]',
                                '[&_p]:pl-[33px] [&_li]:pl-[33px]',
                                // bottom border
                                '[&_p]:border-b-2 [&_p]:border-black [&_li]:border-b-2 [&_li]:border-black',
                                '[&_p:last-child]:border-b-0 [&_p:last-child]:pb-0',
                                '[&_li:last-child]:border-b-0 [&_li:last-child]:pb-0',
                                // tick mark
                                '[&_p]:relative [&_li]:relative',
                                // If RichText inserts a leading <br>, hide it so text aligns with the tick.
                                '[&_p>br]:hidden [&_li>br]:hidden [&_li>p>br]:hidden',
                                '[&_p::before]:absolute [&_p::before]:left-0 [&_p::before]:top-[2px]',
                                '[&_li::before]:absolute [&_li::before]:left-0 [&_li::before]:top-[2px]',
                                '[&_p::before]:content-[""] [&_p::before]:h-[25px] [&_p::before]:w-[25px]',
                                '[&_li::before]:content-[""] [&_li::before]:h-[25px] [&_li::before]:w-[25px]',
                                '[&_p::before]:bg-[url("/assets/icons/check.svg")] [&_p::before]:bg-contain [&_p::before]:bg-no-repeat',
                                '[&_li::before]:bg-[url("/assets/icons/check.svg")] [&_li::before]:bg-contain [&_li::before]:bg-no-repeat',
                                // Keep lists (if present) clean
                                '[&_ul]:m-0 [&_ul]:list-none [&_ul]:p-0',
                            )}
                        >
                            <RichText field={leftText} />
                        </div>
                    )}
                </div>

                {/* ── Centre image ── */}
                {hasImage && imageField && (
                    <div
                        className={cn(
                            'order-0 flex w-full basis-full items-center justify-center bg-[linear-gradient(to_bottom,var(--color-bg-comparison-left)_50%,var(--color-bg-comparison-right)_50%)] py-5',
                            'lg:order-0 lg:w-[32%] lg:basis-[32%] lg:pr-0 lg:bg-[linear-gradient(to_right,var(--color-bg-comparison-left)_50%,var(--color-bg-comparison-right)_50%)] lg:py-0',
                        )}
                    >
                        <div className="pl-2 pr-5 md:px-2">
                            <Image
                                field={imageField}
                                className="h-full w-full object-cover"
                                alt=""
                            />
                        </div>
                    </div>
                )}

                {/* ── Right column — yellow background ── */}
                <div
                    className={cn(
                        'order-1 w-full basis-full bg-bg-comparison-right px-2 py-5 ',
                        'lg:order-0 lg:w-[34%] lg:basis-[34%] lg:pl-[37px] lg:pr-[16px] lg:pt-[70px] lg:pb-[85px]',
                        // Bleed background to the right edge of the viewport (like .comparison-content--right:before)
                        'lg:relative lg:z-0 lg:after:content-[""] lg:after:absolute lg:after:inset-y-0 lg:after:left-0 lg:after:right-[calc(50%-50vw)] lg:after:bg-(--color-bg-comparison-right) lg:after:z-0 lg:[&>*]:relative lg:[&>*]:z-10',
                    )}
                >
                    {(rightTitle || isPageEditing) && (
                        <Text
                            tag="h2"
                            className="m-0 text-[27px] font-bold leading-[34px] text-black"
                            field={rightTitle}
                        />
                    )}
                    {(rightSubTitle || isPageEditing) && (
                        <Text
                            tag="p"
                            className="mt-[5px] mb-[23px] text-[16px] leading-[24px] text-black"
                            field={rightSubTitle}
                        />
                    )}
                    {(rightText || isPageEditing) && (
                        <div
                            className={cn(
                                'text-black',
                                '[&_p]:text-[17px] [&_p]:leading-[28px] [&_p]:break-words',
                                '[&_li]:text-[17px] [&_li]:leading-[28px] [&_li]:break-words',
                                '[&_li>p]:m-0 [&_li>p]:p-0 [&_li>p]:font-inherit [&_li>p]:text-inherit [&_li>p]:leading-inherit [&_li>p]:break-words',
                                '[&_li>p]:border-0 [&_li>p]:pb-0 [&_li>p]:pl-0 [&_li>p]:mt-0',
                                '[&_li>p::before]:content-none',
                                '[&_p]:font-semibold [&_li]:font-semibold',
                                '[&_p]:mt-[14px] [&_li]:mt-[14px]',
                                '[&_p:first-child]:mt-0 [&_li:first-child]:mt-0',
                                '[&_p]:pb-[13px] [&_li]:pb-[13px]',
                                '[&_p]:pl-[33px] [&_li]:pl-[33px]',
                                '[&_p]:border-b-2 [&_p]:border-black [&_li]:border-b-2 [&_li]:border-black',
                                '[&_p:last-child]:border-b-0 [&_p:last-child]:pb-0',
                                '[&_li:last-child]:border-b-0 [&_li:last-child]:pb-0',
                                '[&_p]:relative [&_li]:relative',
                                '[&_p>br]:hidden [&_li>br]:hidden [&_li>p>br]:hidden',
                                '[&_p::before]:absolute [&_p::before]:left-0 [&_p::before]:top-[2px]',
                                '[&_li::before]:absolute [&_li::before]:left-0 [&_li::before]:top-[2px]',
                                '[&_p::before]:content-[""] [&_p::before]:h-[25px] [&_p::before]:w-[25px]',
                                '[&_li::before]:content-[""] [&_li::before]:h-[25px] [&_li::before]:w-[25px]',
                                '[&_p::before]:bg-[url("/assets/icons/check.svg")] [&_p::before]:bg-contain [&_p::before]:bg-no-repeat',
                                '[&_li::before]:bg-[url("/assets/icons/check.svg")] [&_li::before]:bg-contain [&_li::before]:bg-no-repeat',
                                '[&_ul]:m-0 [&_ul]:list-none [&_ul]:p-0',
                            )}
                        >
                            <RichText field={rightText} />
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
}
;

export default Default;

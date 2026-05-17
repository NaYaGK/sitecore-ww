'use client';

import React from 'react';
import {
    Image,
    Link,
    RichText,
    Text,
    useSitecore,
    type Field,
    type ImageField,
    type LinkField,
    type RichTextField,
} from '@sitecore-content-sdk/nextjs';

import { PromoCardProps } from './PromoCard.props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { patchLinkField } from '@/lib/patch-link';
import { useSiteName } from '@/hooks/useSiteName';

// ─── field helpers (same pattern as AdvantageCards) ─────────────────────────

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

const asLinkField = (f: any): LinkField | undefined => {
    if (!f) return undefined;
    if (f?.value?.href || f?.value?.id) return f as LinkField;
    const v = f?.jsonValue ?? f;
    if (v?.value?.href || v?.value?.id) return v as LinkField;
    return f as LinkField; // keep for editing mode even if empty
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

const hasImageValue = (img?: ImageField, isEditing?: boolean) =>
    Boolean(img?.value?.src) || Boolean(isEditing);

const hasLinkValue = (link?: LinkField) => Boolean(link?.value?.href || link?.value?.id);

// ─── component ───────────────────────────────────────────────────────────────

export const Default: React.FC<PromoCardProps> = (props) => {
    const { fields, rendering } = props;
    const { page } = useSitecore();
    const isPageEditing = page?.mode?.isEditing;
    const siteName = useSiteName();

    // Flexible datasource resolution (same as AdvantageCards)
    const initialDs: any =
        (fields as any)?.data?.datasource ??
        (fields as any)?.datasource ??
        (fields as any) ??
        (rendering as any)?.fields ??
        {};

    const ds: any =
        initialDs && typeof initialDs === 'object' && initialDs.fields ? initialDs.fields : initialDs;

    // Resolve the Cards multilist — handles targetItems, results, or raw array
    const rawCards = pickCI(ds, ['Cards', 'cards']);
    const cardsArray: any[] = rawCards?.targetItems ?? rawCards?.results ?? rawCards ?? [];

    // Normalise each card's fields
    const cards = cardsArray.map((card: any) => {
        const cf = card?.fields ?? card;
        return {
            title: asTextField(pickCI(cf, ['Title', 'title'])),
            subTitle: asTextField(pickCI(cf, ['SubTitle', 'subtitle', 'Subtitle'])),
            image: asImageField(pickCI(cf, ['Image', 'image'])),
            description: asRichTextField(pickCI(cf, ['Description', 'description'])),
            cta: patchLinkField(asLinkField(pickCI(cf, ['CTA', 'cta', 'Link', 'link'])), siteName) ?? asLinkField(pickCI(cf, ['CTA', 'cta', 'Link', 'link'])),
        };
    });

    if (!cards.length && !isPageEditing) {
        return <NoDataFallback componentName={rendering?.componentName ?? 'PromoCard'} />;
    }

    return (
        <section
            className={cn('component promo-card  my-10')}
            data-component="PromoCard"
        >
            <div className="mx-auto max-w-[1360px] px-2 lg:px-4 mb-10">
                <div className="grid grid-cols-1 gap-0 sm:gap-6  md:grid-cols-2">
                    {cards.map((card, index) => {
                        const showImage = hasImageValue(card.image, isPageEditing);
                        const showCard =
                            card.title?.value ||
                            card.description?.value ||
                            card.image?.value?.src ||
                            isPageEditing;

                        if (!showCard) return null;

                        return (
                            <article key={index} className="group flex flex-col overflow-hidden pb-10">
                                {/* Image */}

                                {/* Text content */}
                                <div className="flex flex-1 flex-col ">
                                    {(card.title || isPageEditing) && (
                                        <Text
                                            tag="h4"
                                            className="font-heading-h4 text-[18px]! leading-[26px]! md:text-[20px]! mb-3 "
                                            field={card.title}
                                        />
                                    )}

                                    {(card.subTitle || isPageEditing) && (
                                        <Text
                                            tag="h3"
                                            className="font-heading-h3 "
                                            field={card.subTitle}
                                        />
                                    )}

                                    {showImage && card.image && (
                                        <div className="relative aspect-4/3 w-full overflow-hidden  p-6 lg:p-8">
                                            <Image
                                                field={card.image}
                                                className="h-full w-full object-cover"
                                                alt={card.image?.value?.alt || ""}
                                            />
                                        </div>
                                    )}

                                    {(card.description || isPageEditing) && (
                                        <div className="text-base text-gray-700 [&_a]:underline [&_li]:mb-1 [&_ol]:pl-5 [&_p]:mb-2 [&_p]:text-[17px] [&_p]:leading-[25px] md:[&_p]:text-[18px] md:[&_p]:leading-[28px] [&_p:last-child]:mb-0 [&_ul]:pl-5">
                                            <RichText field={card.description} />
                                        </div>
                                    )}

                                    {(hasLinkValue(card.cta) || isPageEditing) && card.cta && (
                                        <div className="mt-[47px] pt-4">
                                            <Link
                                                field={card.cta}
                                                className="rounded-2xl  px-8 py-2 text-[18px] lg:text-[22px] font-bold transition-all duration-200 cursor-pointer bg-[rgb(249,226,68)]  hover:text-white md:px-15"
                                            />
                                        </div>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Default;

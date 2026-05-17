import Head from 'next/head';
import React from 'react';
import { Field, ImageField, Page } from '@sitecore-content-sdk/nextjs';
import { HeroBannerFields } from '../HeroBanner/HeroBanner.props';

interface SEOFields {
    MetaTitle?: Field<string>;
    MetaDescription?: Field<string>;
    MetaKeywords?: Field<string>;
    OGTitle?: Field<string>;
    OGDescription?: Field<string>;
    OGImage?: ImageField;
    MetaType?: Field<string>;
    OGURL?: Field<string>;
    OGSiteName?: Field<string>;
    IOSWebAppTitle?: Field<string>;
    CanonicalURL?: Field<string>;
    isSearchable?: Field<boolean>;
    PageIdentifier?: Field<string>;
}

interface SitecoreContext {
    language?: string;
    itemPath?: string;
    site?: {
        name?: string;
    };
}

interface SEOProps {
    fields: SEOFields;
    context?: SitecoreContext;
    page: Page;
}

/**
 * Utility: Strip HTML tags
 */
const stripHtml = (html?: string): string =>
    html ? html.replace(/<[^>]*>/g, '').trim() : '';




export const SEO = ({ fields, context, page }: SEOProps) => {
    /* --------------------------------------------
     * Resolve HeroBanner
     * ------------------------------------------ */
    const heroBanner = page?.layout?.sitecore?.route?.placeholders?.['headless-main']
        ?.find((component: any) => component.componentName === 'HeroBanner');

    const heroFields = heroBanner?.fields as unknown as HeroBannerFields;

    const heroTitle = heroFields?.Title?.value;
    const heroImage = heroFields?.Image?.value?.src;
    const heroDescription = stripHtml(heroFields?.Text?.value);

    /* --------------------------------------------
     * Resolve Site & URL info
     * ------------------------------------------ */
    const siteUrl =
        process.env.NEXT_PUBLIC_RENDERING_HOST_URL?.replace(/\/$/, '') || '';

    const siteName = context?.site?.name;
    const language = context?.language;
    const itemPath = context?.itemPath || '/';

    const resolvedPath = language ? `/${language}${itemPath}` : itemPath;

    let canonicalUrl =
        fields?.CanonicalURL?.value ||
        fields?.OGURL?.value ||
        resolvedPath;

    if (canonicalUrl && !canonicalUrl.startsWith('http')) {
        canonicalUrl = `${siteUrl}${canonicalUrl.startsWith('/') ? canonicalUrl : `/${canonicalUrl}`}`;
    }

    /* --------------------------------------------
     * SEO Resolution Logic
     * ------------------------------------------ */
    const routeTitle = (page?.layout?.sitecore?.route?.fields?.Title as Field)?.value;
    const pageTitle = (fields?.MetaTitle?.value || routeTitle || 'Page').toString();

    const resolvedOgTitle =
        fields?.OGTitle?.value ||
        heroTitle ||
        fields?.MetaTitle?.value;

    const resolvedOgDescription =
        fields?.OGDescription?.value ||
        heroDescription ||
        fields?.MetaDescription?.value;

    const resolvedOgImage =
        fields?.OGImage?.value?.src ||
        heroImage;

    const resolvedOgType =
        fields?.MetaType?.value;


    const resolvedOgSiteName =
        fields?.OGSiteName?.value ||
        siteName;

    const resolvedIOSAppTitle =
        fields?.IOSWebAppTitle?.value ||
        'cws';

    const ogUrl =
        fields?.OGURL?.value ||
        canonicalUrl;

    /* --------------------------------------------
     * Render SEO Tags
     * ------------------------------------------ */
    return (
        <Head>
            {/* Title */}
            <title key="title">{pageTitle}</title>

            {/* Canonical */}
            {canonicalUrl && <link key="canonical" rel="canonical" href={canonicalUrl} />}

            {/* Basic SEO */}
            {fields?.MetaTitle?.value && (
                <meta key="title-meta" name="title" content={fields.MetaTitle.value} />
            )}

            {fields?.MetaDescription?.value && (
                <meta key="description" name="description" content={fields.MetaDescription.value} />
            )}

            {fields?.MetaKeywords?.value && (
                <meta key="keywords" name="keywords" content={fields.MetaKeywords.value} />
            )}

            {/* Open Graph */}
            <meta key="og:type" property="og:type" content={resolvedOgType} />

            {resolvedOgTitle && (
                <meta key="og:title" property="og:title" content={resolvedOgTitle as string} />
            )}

            {resolvedOgDescription && (
                <meta key="og:description" property="og:description" content={resolvedOgDescription as string} />
            )}

            {resolvedOgImage && (
                <meta key="og:image" property="og:image" content={resolvedOgImage} />
            )}

            {ogUrl && (
                <meta key="og:url" property="og:url" content={ogUrl} />
            )}

            {resolvedOgSiteName && (
                <meta key="og:site_name" property="og:site_name" content={resolvedOgSiteName} />
            )}

            {resolvedIOSAppTitle && (
                <meta
                    key="apple-mobile-web-app-title"
                    name="apple-mobile-web-app-title"
                    content={resolvedIOSAppTitle}
                />
            )}

            {/* Application Specific */}
            {fields?.isSearchable?.value !== undefined && (
                <meta key="isSearchable" name="isSearchable" content={fields.isSearchable.value.toString()} />
            )}

        </Head>
    );
};

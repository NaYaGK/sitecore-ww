import { ComponentProps } from '@/lib/component-props';
import { Field } from '@sitecore-content-sdk/nextjs';

export type SearchListingVariant = 'Default' | 'Jobs';

export interface FieldMapping {
    title: string;        // Field name for title (e.g., 'name' or 'job_title')
    description: string;  // Field name for description
    url: string;         // Field name for URL
    metadata: string;    // Field name for metadata (e.g., 'type' or 'job_country')
    image?: string;      // Optional field name for image
}

export interface SearchListingProps extends ComponentProps {
    fields?: {
        SearchWidgetID?: Field<string>;
        ResultCount?: Field<string>;
        EntityName?: Field<string>;
        SourceID?: Field<string>;
        NoResultText?: Field<string>;
        LoadMoreText?: Field<string>;
    };
    variant?: SearchListingVariant;
    className?: string;
}

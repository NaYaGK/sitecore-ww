import { ComponentProps } from '@/lib/component-props';

export type JobListingProps = ComponentProps & {
    fields?: {
        // Optional override for the widget ID if needed
        SearchWidgetID?: {
            value: string;
        };
        ResultCount?: {
            value: string;
        };
        EntityName?: {
            value: string;
        };
        SourceID?: {
            value: string;
        };
        NoResultText?: {
            value: string;
        };
    };
    className?: string;
};

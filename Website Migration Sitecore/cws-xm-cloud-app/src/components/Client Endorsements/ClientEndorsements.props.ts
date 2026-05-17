import { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

export interface ClientEndorsementsItem {
    id?: string;
    fields?: {
        Description?: Field<string>;
        Image?: ImageField;
    };
}

export interface ClientEndorsementsDatasource {
    Title?: Field<string>;
    ClientEndorsementsItems?: {
        targetItems?: ClientEndorsementsItem[];
    };
}

export interface ClientEndorsementsProps extends ComponentProps {
    fields?: {
        data?: {
            datasource?: ClientEndorsementsDatasource;
        };
    };
}

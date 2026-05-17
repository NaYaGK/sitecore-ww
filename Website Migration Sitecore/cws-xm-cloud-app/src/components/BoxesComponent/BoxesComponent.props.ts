import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

export interface BoxItem {
    logo?: {
        jsonValue?: ImageField;
    };
    backgroundImage?: {
        jsonValue?: ImageField;
    };
    title?: {
        jsonValue?: Field<string>;
    };
    description?: {
        jsonValue?: Field<string>;
    };
    link?: {
        jsonValue?: LinkField;
    };
    hoverColor?: {
        jsonValue?: Field<string>;
    };
}

interface BoxesComponentDatasource {
    items?: {
        targetItems?: BoxItem[];
    };
}

export interface BoxesComponentProps extends ComponentProps {
    fields?: {
        data?: {
            datasource?: BoxesComponentDatasource;
        };
    };
}

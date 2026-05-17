// @ts-nocheck
import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

export interface EntityReferenceItemProps {
    fields: {
        Title: Field<string>;
        Description?: Field<string>;
        Image?: ImageField;
        Link?: LinkField;
        LeftAligned?: Field<boolean>;
    };
    rendering?: any;
    params?: any;
}

export type EntityReferenceItem = {
    id: string;
    url: string;
    name: string;
    displayName: string;
    fields: {
        Title: { value: string };
        Description: { value: string };
        Image: { value: { src: string; alt: string } };
        Link: { value: { href: string; text: string } };
        LeftAligned: { value: boolean };
    };
};

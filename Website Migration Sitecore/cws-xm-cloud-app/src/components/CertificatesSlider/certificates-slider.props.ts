import { ComponentProps } from '@/lib/component-props';
import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';

export interface CertificatesSliderProps extends ComponentProps {
    fields: {
        Title: Field<string>;
        CertificateItems: Array<{
            id: string;
            url: string;
            name: string;
            displayName: string;
            fields: {
                Icon: ImageField;
                Link: LinkField;
            };
        }>;
        CTA: LinkField;
    };
}

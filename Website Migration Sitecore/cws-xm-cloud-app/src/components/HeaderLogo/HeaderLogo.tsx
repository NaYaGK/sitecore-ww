import type React from 'react';
import {
  Image,
  Link,
  useComponentProps,
  useSitecore,
  type ImageField,
  type LinkField,
} from '@sitecore-content-sdk/nextjs';
import { NoDataFallback } from '@/utils/NoDataFallback';
import type { ComponentProps } from '@/lib/component-props';
import { patchHref } from '@/lib/patch-link';
import { useSiteName } from '@/hooks/useSiteName';
import { useLocale } from '@/hooks/useLocale';

const asImageField = (field: any): ImageField | undefined => {
  if (!field) return undefined;
  return field?.jsonValue ?? field;
};

const asLinkField = (field: any): LinkField | undefined => {
  if (!field) return undefined;
  return field?.jsonValue ?? field;
};

const pickCI = (obj: any, names: string[]) => {
  if (!obj) return undefined;
  const keys = Object.keys(obj);
  for (const name of names) {
    const key = keys.find((candidate) => candidate.toLowerCase() === name.toLowerCase());
    if (key && obj[key] != null) return obj[key];
  }
  return undefined;
};

interface HeaderLogoFields {
  Image?: { jsonValue?: ImageField } | ImageField;
  Link?: LinkField;
}

interface HeaderLogoProps extends ComponentProps {
  fields?: HeaderLogoFields;
  isPageEditing?: boolean;
}

export const Default: React.FC<HeaderLogoProps> = (props) => {
  const { rendering } = props;
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;
  const siteName = useSiteName();
  const locale = useLocale();
  const serverProps = useComponentProps<{ fields?: Record<string, unknown> }>(rendering?.uid);
  const initialDatasource: any =
    serverProps?.fields ??
    (props.fields as any)?.data?.datasource ??
    (props.fields as any)?.datasource ??
    props.fields ??
    (props.rendering as any)?.fields ??
    {};
  const datasource =
    initialDatasource && typeof initialDatasource === 'object' && 'fields' in initialDatasource
      ? initialDatasource.fields
      : initialDatasource;

  const imageField = asImageField(
    pickCI(datasource, ['Image', 'Logo', 'LogoImage', 'HeaderLogo', 'HeaderLogoImage']),
  );
  const linkField = asLinkField(
    pickCI(datasource, ['Link', 'LogoLink', 'HeaderLogoLink']),
  );

  if (!imageField && !linkField && !isEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'HeaderLogo'} />;
  }

  const innerContent = (
    <div className="flex h-10 items-center md:h-11 lg:h-12">
      {imageField?.value?.src ? (
        <>
          <Image
            field={imageField}
            className="h-8 w-auto max-w-[336px] md:h-8.5 lg:h-12"
            alt="cws workwear logo"
            width={582}
            height={82}
            // Next Image is used internally by ContentSDK; alt comes from field
            loading="lazy"
          />
        </>
      ) : (
        <>
          <div className="flex w-16 items-center justify-center bg-[#eb0045] md:w-[68px] lg:w-[72px]">
            <span className="text-lg font-bold tracking-tight text-black italic md:text-xl">
              CWS
            </span>
          </div>
          <div className="flex w-16 items-center justify-center bg-[var(--color-accent-primary)] px-1.5 md:w-[68px] md:px-2 lg:w-[72px]">
            <span className="text-[9px] font-bold tracking-wider text-black uppercase md:text-[10px]">
              WORKWEAR
            </span>
          </div>
        </>
      )}
    </div>
  );

  const homepageHref =
    siteName === 'cws'
      ? `/${locale}/`
      : (patchHref(
          `/${locale}/${siteName === 'healthcare' ? 'healthcare' : 'workwear'}`,
          siteName,
          undefined,
          locale,
        ) ?? `/${locale}`);
  const resolvedLinkField = linkField?.value?.href
    ? ({
        ...linkField,
        value: {
          ...linkField.value,
          href: patchHref(linkField.value.href, siteName, undefined, locale) ?? linkField.value.href,
        },
      } as LinkField)
    : ({ value: { href: homepageHref, text: 'CWS Home' } } as LinkField);

  return (
    <Link
      field={resolvedLinkField}
      className="flex items-center no-underline"
      aria-label={resolvedLinkField.value?.text || 'CWS Home'}
      target="_self"
    >
      {innerContent}
    </Link>
  );
};

export default Default;

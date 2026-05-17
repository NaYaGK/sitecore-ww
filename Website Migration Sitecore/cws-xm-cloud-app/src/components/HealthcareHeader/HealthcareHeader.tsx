import type React from 'react';
import {
  Image,
  Link,
  useComponentProps,
  type ImageField,
  type LinkField,
} from '@sitecore-content-sdk/nextjs';
import type { ComponentProps } from '@/lib/component-props';
import { patchHref } from '@/lib/patch-link';
import { useLocale } from '@/hooks/useLocale';
import { useSiteName } from '@/hooks/useSiteName';

const asImageField = (field: unknown): ImageField | undefined => {
  if (!field) return undefined;
  return (field as { jsonValue?: ImageField }).jsonValue ?? (field as ImageField);
};

const asLinkField = (field: unknown): LinkField | undefined => {
  if (!field) return undefined;
  return (field as { jsonValue?: LinkField }).jsonValue ?? (field as LinkField);
};

const pickCI = (obj: unknown, names: string[]) => {
  if (!obj || typeof obj !== "object") return undefined;
  const source = obj as Record<string, unknown>;
  const keys = Object.keys(source);
  for (const name of names) {
    const key = keys.find((candidate) => candidate.toLowerCase() === name.toLowerCase());
    if (key && source[key] != null) return source[key];
  }
  return undefined;
};

type HealthcareHeaderProps = ComponentProps & {
  fields?: Record<string, unknown>;
};

export const Default: React.FC<HealthcareHeaderProps> = (props) => {
  const siteName = useSiteName();
  const locale = useLocale();
  const serverProps = useComponentProps<{ fields?: Record<string, unknown> }>(props.rendering?.uid);

  const initialDatasource =
    serverProps?.fields ??
    (props.fields as { data?: { datasource?: Record<string, unknown> } } | undefined)?.data
      ?.datasource ??
    (props.fields as { datasource?: Record<string, unknown> } | undefined)?.datasource ??
    props.fields ??
    (props.rendering as { fields?: Record<string, unknown> } | undefined)?.fields ??
    {};
  const datasource =
    initialDatasource && typeof initialDatasource === "object" && "fields" in initialDatasource
      ? (initialDatasource as { fields: Record<string, unknown> }).fields
      : initialDatasource;

  const imageField = asImageField(
    pickCI(datasource, ["Image", "Logo", "LogoImage", "HeaderLogo", "HeaderLogoImage"]),
  );
  const linkField = asLinkField(
    pickCI(datasource, ["Link", "LogoLink", "HeaderLogoLink"]),
  );

  const homepageHref =
    patchHref(`/${locale}/healthcare`, siteName, undefined, locale) ?? `/${locale}/healthcare`;
  const resolvedLinkField = linkField?.value?.href
    ? ({
        ...linkField,
        value: {
          ...linkField.value,
          href: patchHref(linkField.value.href, siteName, undefined, locale) ?? linkField.value.href,
        },
      } as LinkField)
    : ({ value: { href: homepageHref, text: "CWS Healthcare" } } as LinkField);

  const logoContent = imageField?.value?.src ? (
    <Image
      field={imageField}
      className="h-9 w-auto max-w-[320px] md:h-10 lg:h-11"
      alt={imageField.value.alt || "CWS Healthcare"}
      width={582}
      height={82}
      loading="lazy"
    />
  ) : (
    <div className="inline-flex h-10 overflow-hidden md:h-11">
      <div className="flex items-center justify-center bg-[#eb0045] px-5 md:px-6">
        <span className="text-[26px] font-bold leading-none tracking-tight text-black italic md:text-[28px]">
          CWS
        </span>
      </div>
      <div className="flex items-center justify-center bg-[#acd800] px-4 md:px-5">
        <span className="text-[12px] font-bold leading-none tracking-[0.28em] text-black uppercase md:text-[13px]">
          Healthcare
        </span>
      </div>
    </div>
  );

  return (
    <div className="relative z-30 w-full border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-[52px] max-w-screen-2xl items-center px-4 md:h-[56px] md:px-6 lg:px-8">
        <Link
          field={resolvedLinkField}
          className="inline-flex items-center no-underline"
          aria-label={resolvedLinkField.value?.text || "CWS Healthcare"}
          target="_self"
        >
          {logoContent}
        </Link>
      </div>
    </div>
  );
};

export default Default;

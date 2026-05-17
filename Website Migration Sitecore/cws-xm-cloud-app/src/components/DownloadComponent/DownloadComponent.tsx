// @ts-nocheck
import { Link, RichText,Text, useSitecore, type Field, type LinkField } from '@sitecore-content-sdk/nextjs';
import { DownloadComponentProps } from './DownloadComponent.props';
import { NoDataFallback } from '@/utils/NoDataFallback';

type SafeField<T> = Field<T> | undefined;

const getButtonLabel = (link?: LinkField, buttonLabel?: SafeField<string>): string => {
  if (link?.value?.text && link.value.text.trim().length > 0) {
    return link.value.text.trim();
  }
  const value = buttonLabel?.value?.trim();
  return value && value.length > 0 ? value : 'Download';
};

const hasValidLink = (link?: LinkField, isPageEditing?: boolean): boolean => {
  if (link?.value?.href && link.value.href.trim().length > 0) return true;
  return Boolean(isPageEditing);
};

const highlightNumbers = (text: string) => {
  const parts = text.split(/(\d+(?:[.,]\d+)?)/g);
  return parts.map((part, index) =>
    /^\d+(?:[.,]\d+)?$/.test(part) ? (
      <span key={index} className="text-[18px] font-semibold">
        {part}
      </span>
    ) : (
      part
    ),
  );
};

const formatLabelText = (text: string) => {
  const parts = text.split(/(\([^)]+\))/g);
  return parts.map((part, index) =>
    part.startsWith('(') && part.endsWith(')') ? (
      <span key={index}>{highlightNumbers(part)}</span>
    ) : (
      part
    ),
  );
};

export const Default: React.FC<DownloadComponentProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
   const Heading = fields?.Heading;
  const titleField = fields?.Title;
  const descriptionField = fields?.Description;
  const documentLinkField = fields?.DocumentLink;
  const buttonLabelField = fields?.ButtonLabel;
  const fileMetaField = fields?.FileMetaOverride;

  if (!hasValidLink(documentLinkField, isPageEditing)) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'DownloadComponent'} />;
  }

  const buttonLabel = getButtonLabel(documentLinkField, buttonLabelField);
  const hasTitle = Boolean(titleField?.value?.trim());
  const hasDescription = Boolean(descriptionField?.value?.trim());
  const hasFileMeta = Boolean(fileMetaField?.value?.trim());

  const fileLink = documentLinkField?.value?.href;

  return (
    <section className="mb-4 md:mb-8 mx-auto max-w-[1360px] px-2 md:px-[10px]" data-component="DownloadComponent">
     {Heading?.value && (
  <div className="rte-content">
    <RichText field={Heading} />
  </div>
)}
      <div className="">
        {hasTitle && (
          <Text tag="h2" field={titleField} className="font-heading-h2 mb-6 text-3xl font-bold" />
        )}

        <div className="mx-auto mb-5 flex w-full flex-col justify-between border-b border-[var(--color-text,#333)] bg-[var(--color-accent-primary,#f3f4f6)] px-8 py-4 font-bold last:border-b-0 md:flex-row md:items-center md:py-6 md:pr-2 md:pl-10 md:text-[22px]">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Link
              field={documentLinkField}
              className="text-[var(--color-text,#333)] no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-outline,#3b82f6)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="m-0 text-[1.1875rem] leading-[1.5625rem] font-bold break-words text-[var(--color-text,#333)] antialiased md:text-[1.375rem] md:leading-[1.75rem]">
                {formatLabelText(buttonLabel)}
                {hasFileMeta && (
                  <span className="font-bold">
                    {' '}
                    ({highlightNumbers(fileMetaField?.value || '')})
                  </span>
                )}
              </span>
            </Link>
            {hasDescription && (
              <Text
                tag="div"
                field={descriptionField}
                className="m-0 text-sm leading-snug font-normal text-[var(--color-text,#333)] opacity-90"
              />
            )}
          </div>
          {fileLink && (
            <a
              href={fileLink}
              className="mt-2 flex h-8 w-8 items-center justify-center bg-transparent transition-transform md:mx-4 md:mt-0"
              download
              aria-label={`Download ${buttonLabel}`}
            >
              <img src="/assets/icons/download.svg" alt="" className="h-8" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default Default;

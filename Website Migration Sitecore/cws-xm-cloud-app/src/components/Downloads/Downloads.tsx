import React from 'react';
import { Text, Link, useSitecore } from '@sitecore-content-sdk/nextjs';

import type { DownloadsProps } from './Downloads.props';

export const Default: React.FC<DownloadsProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const id = props.params.RenderingIdentifier;

  // Access datasource - handle both direct fields and fields.data.datasource patterns
  const datasource = (fields as any)?.data?.datasource || fields;

  // Get title - handle both value and jsonValue patterns
  const titleField = datasource?.Title?.jsonValue || datasource?.Title;

  // Get download items - DownloadItems is already an array in this case
  const downloadItems = Array.isArray(datasource?.DownloadItems)
    ? datasource.DownloadItems
    : datasource?.DownloadItems?.targetItems || datasource?.downloadItems?.targetItems || [];

  const hasItems = downloadItems.length > 0;

  // Show placeholder in edit mode if no items
  if (isPageEditing && !hasItems) {
    return null;
  }

  // Don't render if no items in normal mode
  if (!hasItems) {
    return null;
  }

  return (
    <section className="component downloads" id={id ? id : undefined} data-component="Downloads">
      <div className="mx-auto max-w-[1360px] px-2 md:pr-0">
        {titleField && (
          <Text tag="h2" field={titleField} className="font-heading-h2 mb-6 text-3xl font-bold" />
        )}

        <div>
          {downloadItems.map((item: any, index: number) => {
            // Handle both item.fields and direct item structure
            const itemData = item.fields?.datasource || item.fields || item;

            const displayName =
              itemData.DisplayName?.jsonValue?.value ||
              itemData.DisplayName?.value ||
              itemData.displayName?.jsonValue?.value ||
              itemData.displayName?.value ||
              item.displayName ||
              item.name;

            const description =
              itemData.Description?.jsonValue?.value ||
              itemData.Description?.value ||
              itemData.description?.jsonValue?.value ||
              itemData.description?.value;

            const fileLinkField =
              itemData.FileLink?.jsonValue ||
              itemData.FileLink ||
              itemData.fileLink?.jsonValue ||
              itemData.fileLink;

            const fileLink = fileLinkField?.value?.href || fileLinkField?.href;

            const fileType = (
              itemData.FileType?.jsonValue?.value ||
              itemData.FileType?.value ||
              itemData.fileType?.jsonValue?.value ||
              itemData.fileType?.value
            )?.toUpperCase();

            const fileSize =
              itemData.FileSizeOverride?.jsonValue?.value ||
              itemData.FileSizeOverride?.value ||
              itemData.FileSize?.jsonValue?.value ||
              itemData.FileSize?.value ||
              itemData.fileSizeOverride?.jsonValue?.value ||
              itemData.fileSizeOverride?.value;

            const fileSizeNumber =
              typeof fileSize === 'string' ? fileSize.trim().split(' ')[0] : undefined;
            const fileSizeUnit =
              typeof fileSize === 'string' && fileSizeNumber
                ? fileSize.slice(fileSizeNumber.length)
                : undefined;

            return (
              <div
                key={item.id || `download-${index}`}
                className="mx-auto mb-8 flex max-w-[1360px] flex-col justify-between border-b border-[var(--color-text,#333)] bg-[var(--color-accent-primary,#f3f4f6)] px-8 py-4 font-bold last:border-b-0 md:flex-row md:items-center md:px-0 md:py-6 md:pl-10 md:text-[22px]"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  {fileLink ? (
                    <Link
                      field={fileLinkField}
                      className="text-[var(--color-text,#333)] no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-outline,#3b82f6)]"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="m-0 text-[19px] leading-snug font-bold text-[var(--color-text,#333)] md:text-[22px]">
                        {displayName}
                        {fileType || fileSize ? ' (' : ''}
                        {fileType && (
                          <span className="font-bold">
                            {fileType}
                            {fileSize ? ', ' : ''}
                          </span>
                        )}
                        {fileSize && fileSizeNumber && (
                          <>
                            <span className="text-[17px] font-normal md:text-[18px] md:font-semibold">
                              {fileSizeNumber}
                            </span>
                            {fileSizeUnit && <span>{fileSizeUnit}</span>}
                          </>
                        )}
                        {fileType || fileSize ? ')' : ''}
                      </span>
                    </Link>
                  ) : (
                    <span className="m-0 leading-snug font-bold text-[var(--color-text,#333)]">
                      {displayName}
                      {fileType || fileSize ? ' (' : ''}
                      {fileType && (
                        <span className="font-bold">
                          {fileType}
                          {fileSize ? ', ' : ''}
                        </span>
                      )}
                      {fileSize && fileSizeNumber && (
                        <>
                          <span className="text-[17px] font-normal md:text-[18px] md:font-semibold">
                            {fileSizeNumber}
                          </span>
                          {fileSizeUnit && <span>{fileSizeUnit}</span>}
                        </>
                      )}
                      {fileType || fileSize ? ')' : ''}
                    </span>
                  )}
                  {description && (
                    <div className="m-0 text-sm leading-snug font-normal text-[var(--color-text,#333)] opacity-90">
                      {description}
                    </div>
                  )}
                </div>
                {fileLink && (
                  <a
                    href={fileLink}
                    className="mt-2 flex h-8 w-8 items-center justify-center bg-transparent transition-transform md:mx-4 md:mt-0"
                    download
                    aria-label={`Download ${displayName}`}
                  >
                    <img src="/assets/icons/download.svg" alt="" className="h-8" />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Default;

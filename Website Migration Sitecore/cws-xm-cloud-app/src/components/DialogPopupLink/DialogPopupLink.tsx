// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { Text, RichText, useSitecore, type Field } from '@sitecore-content-sdk/nextjs';
import { ExternalLink } from 'lucide-react';

import { DialogPopupLinkProps } from './DialogPopupLink.props';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

type SafeField<T> = Field<T> | undefined;

const getLinkText = (linkText?: SafeField<string>): string => {
  const value = linkText?.value?.trim();
  return value && value.length > 0 ? value : 'View details';
};

const getTrackingEventName = (trackingEvent?: SafeField<string>): string | undefined => {
  const value = trackingEvent?.value?.trim();
  return value && value.length > 0 ? value : undefined;
};

export const Default: React.FC<DialogPopupLinkProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const [isOpen, setIsOpen] = useState(false);

  const datasource = fields?.data?.datasource;
  const linkTextField = datasource?.linkText?.jsonValue;
  const destinationLinkField = datasource?.destinationLink?.jsonValue;
  const dialogContentItemField = datasource?.dialogContentItem?.jsonValue;
  const trackingEventNameField = datasource?.trackingEventName?.jsonValue;

  const linkText = getLinkText(linkTextField);
  const destinationHref = destinationLinkField?.value?.href ?? '#';
  const trackingEventName = getTrackingEventName(trackingEventNameField);
  const dialogContent = dialogContentItemField?.fields?.content?.jsonValue;

  // Track analytics event when dialog opens
  useEffect(() => {
    if (isOpen && trackingEventName && typeof window !== 'undefined') {
      // Dispatch custom event for analytics tracking
      const event = new CustomEvent('dialog-opened', {
        detail: { trackingEventName },
      });
      window.dispatchEvent(event);
    }
  }, [isOpen, trackingEventName]);

  // Validation: require link text and destination link at minimum
  if (
    !datasource ||
    !linkTextField ||
    !destinationLinkField ||
    (!destinationLinkField.value?.href && !isPageEditing)
  ) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'DialogPopupLink'} />;
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Only prevent default if we have dialog content
    if (dialogContent) {
      e.preventDefault();
      setIsOpen(true);
    }
    // Otherwise, let the link work normally as a fallback
  };

  return (
    <>
      <a
        href={destinationHref}
        onClick={handleLinkClick}
        className={cn(
          'group font-body text-text hover:text-text focus-visible:outline-cta-primary inline-flex cursor-pointer items-center gap-2 py-1 text-base leading-normal no-underline transition-all duration-200 ease-in-out focus-visible:rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-2',
          'component',
          'dialog-popup-link',
        )}
        data-component="DialogPopupLink"
        data-tracking={trackingEventName}
        aria-label={linkText}
      >
        <span className="font-inherit leading-inherit text-inherit">
          <Text tag="span" field={linkTextField} />
        </span>
        <span
          className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center text-inherit transition-transform duration-200 ease-in-out group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          <ExternalLink strokeWidth={2} />
        </span>
      </a>

      {dialogContent && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-h-[90vh] w-full max-w-[95vw] overflow-y-auto md:max-h-[85vh] md:max-w-[768px]">
            <DialogHeader>
              <DialogTitle className="font-heading text-text mb-4 text-2xl leading-tight font-bold md:text-[1.75rem]">
                <Text tag="span" field={linkTextField} />
              </DialogTitle>
              <DialogDescription asChild>
                <div
                  className={cn(
                    'font-body text-text text-base leading-normal opacity-90',
                    '[&_p]:mb-4 [&_p:last-child]:mb-0',
                    '[&_h1]:font-heading-h1 [&_h1]:text-text [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:leading-tight [&_h1]:font-bold [&_h1:first-child]:mt-0',
                    '[&_h2]:font-heading-h2 [&_h2]:text-text [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:leading-tight [&_h2]:font-bold [&_h2:first-child]:mt-0',
                    '[&_h3]:font-heading-h3 [&_h3]:text-text [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:leading-tight [&_h3]:font-bold [&_h3:first-child]:mt-0',
                    '[&_h4]:font-heading-h4 [&_h4]:text-text [&_h4]:mt-6 [&_h4]:mb-3 [&_h4]:text-lg [&_h4]:leading-tight [&_h4]:font-bold [&_h4:first-child]:mt-0',
                    '[&_h5]:font-heading-h5 [&_h5]:text-text [&_h5]:mt-6 [&_h5]:mb-3 [&_h5]:leading-tight [&_h5]:font-bold [&_h5:first-child]:mt-0',
                    '[&_h6]:font-heading-h6 [&_h6]:text-text [&_h6]:mt-6 [&_h6]:mb-3 [&_h6]:leading-tight [&_h6]:font-bold [&_h6:first-child]:mt-0',
                    '[&_ol]:mb-4 [&_ol]:pl-6 [&_ul]:mb-4 [&_ul]:pl-6',
                    '[&_li]:mb-2',
                    '[&_a]:text-cta-primary hover:[&_a]:text-accent-red [&_a]:underline',
                    '[&_img]:my-4 [&_img]:block [&_img]:h-auto [&_img]:max-w-full',
                    '[&_blockquote]:border-border [&_blockquote]:text-text [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:opacity-70',
                    '[&_code]:bg-bg-primary [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em]',
                    '[&_pre]:bg-bg-primary [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0',
                    '[&_b]:font-bold [&_strong]:font-bold',
                  )}
                >
                  <RichText field={dialogContent} />
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export const Button: React.FC<DialogPopupLinkProps> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const [isOpen, setIsOpen] = useState(false);

  const datasource = fields?.data?.datasource;
  const linkTextField = datasource?.linkText?.jsonValue;
  const destinationLinkField = datasource?.destinationLink?.jsonValue;
  const dialogContentItemField = datasource?.dialogContentItem?.jsonValue;
  const trackingEventNameField = datasource?.trackingEventName?.jsonValue;

  const linkText = getLinkText(linkTextField);
  const destinationHref = destinationLinkField?.value?.href ?? '#';
  const trackingEventName = getTrackingEventName(trackingEventNameField);
  const dialogContent = dialogContentItemField?.fields?.content?.jsonValue;

  // Track analytics event when dialog opens
  useEffect(() => {
    if (isOpen && trackingEventName && typeof window !== 'undefined') {
      // Dispatch custom event for analytics tracking
      const event = new CustomEvent('dialog-opened', {
        detail: { trackingEventName },
      });
      window.dispatchEvent(event);
    }
  }, [isOpen, trackingEventName]);

  // Validation: require link text and destination link at minimum
  if (
    !datasource ||
    !linkTextField ||
    !destinationLinkField ||
    (!destinationLinkField.value?.href && !isPageEditing)
  ) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'DialogPopupLink'} />;
  }

  const handleButtonClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Only prevent default if we have dialog content
    if (dialogContent) {
      e.preventDefault();
      setIsOpen(true);
    }
    // Otherwise, let the link work normally as a fallback
  };

  return (
    <>
      <a
        href={destinationHref}
        onClick={handleButtonClick}
        className={cn(
          'bg-accent-red font-heading text-bg-primary focus-visible:outline-accent-red inline-flex h-[48.48px] w-[330px] cursor-pointer items-center justify-center rounded-[20px] border-none text-base leading-normal font-bold whitespace-nowrap no-underline focus-visible:outline-2 focus-visible:outline-offset-4',
          'component',
          'dialog-popup-button',
        )}
        data-component="DialogPopupLink"
        data-variant="button"
        data-tracking={trackingEventName}
        aria-label={linkText}
      >
        <Text tag="span" field={linkTextField} />
      </a>

      {dialogContent && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-h-[90vh] w-full max-w-[95vw] overflow-y-auto md:max-h-[85vh] md:max-w-[768px]">
            <DialogHeader>
              <DialogTitle className="font-heading text-text mb-4 text-2xl leading-tight font-bold md:text-[1.75rem]">
                <Text tag="span" field={linkTextField} />
              </DialogTitle>
              <DialogDescription asChild>
                <div
                  className={cn(
                    'font-body text-text text-base leading-normal opacity-90',
                    '[&_p]:mb-4 [&_p:last-child]:mb-0',
                    '[&_h1]:font-heading-h1 [&_h1]:text-text [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:leading-tight [&_h1]:font-bold [&_h1:first-child]:mt-0',
                    '[&_h2]:font-heading-h2 [&_h2]:text-text [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:leading-tight [&_h2]:font-bold [&_h2:first-child]:mt-0',
                    '[&_h3]:font-heading-h3 [&_h3]:text-text [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:leading-tight [&_h3]:font-bold [&_h3:first-child]:mt-0',
                    '[&_h4]:font-heading-h4 [&_h4]:text-text [&_h4]:mt-6 [&_h4]:mb-3 [&_h4]:text-lg [&_h4]:leading-tight [&_h4]:font-bold [&_h4:first-child]:mt-0',
                    '[&_h5]:font-heading-h5 [&_h5]:text-text [&_h5]:mt-6 [&_h5]:mb-3 [&_h5]:leading-tight [&_h5]:font-bold [&_h5:first-child]:mt-0',
                    '[&_h6]:font-heading-h6 [&_h6]:text-text [&_h6]:mt-6 [&_h6]:mb-3 [&_h6]:leading-tight [&_h6]:font-bold [&_h6:first-child]:mt-0',
                    '[&_ol]:mb-4 [&_ol]:pl-6 [&_ul]:mb-4 [&_ul]:pl-6',
                    '[&_li]:mb-2',
                    '[&_a]:text-cta-primary hover:[&_a]:text-accent-red [&_a]:underline',
                    '[&_img]:my-4 [&_img]:block [&_img]:h-auto [&_img]:max-w-full',
                    '[&_blockquote]:border-border [&_blockquote]:text-text [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:opacity-70',
                    '[&_code]:bg-bg-primary [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.9em]',
                    '[&_pre]:bg-bg-primary [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:p-4 [&_pre_code]:bg-transparent [&_pre_code]:p-0',
                    '[&_b]:font-bold [&_strong]:font-bold',
                  )}
                >
                  <RichText field={dialogContent} />
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Default;

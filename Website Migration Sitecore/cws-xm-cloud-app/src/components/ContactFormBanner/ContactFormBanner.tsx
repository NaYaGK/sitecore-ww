'use client';

import React from 'react';
import {
  ComponentParams,
  ComponentRendering,
  Field,
  LinkField,
  TextField,
  Text,
  RichText,
  RichTextField,
  Link,
} from '@sitecore-content-sdk/nextjs';
import { cn } from '@/lib/utils';
import { openContactFormModal } from '@/ui/Modal/contact_form_modal';
import { useSiteName } from '@/hooks/useSiteName';
import { patchHref, patchLinkField } from '@/lib/patch-link';

interface ContactFormBannerFields {
  BackgroundTheme: Field<string>;
  Description: RichTextField;
  PhoneNumber: TextField;
  PrimaryCta: LinkField;
  secondaryCta: LinkField;
  TertiaryCTA: LinkField;
  Title: TextField;
  ShowContactFormPopup?: Field<boolean>;
}

interface ContactFormBannerProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: ContactFormBannerFields;
}

type ContactFormBannerVariant = 'default' | 'twoColoum' | "brandButton";

// Shared utility functions
const handleLinkClick = (linkField: any) => {
  const linkType = linkField?.value?.linktype;
  const href = linkField?.value?.href;

  if (linkType === 'mailto' && href) {
    window.location.href = href;
  } else if (linkType === 'tel' && href) {
    const phoneNumber = href.replace('tel:', '');
    window.location.href = `facetime:${phoneNumber}`;
  }
};

const handlePhoneClick = (phoneNumber: string) => {
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
  window.location.href = `facetime:${cleanNumber}`;
};

/** Normalize phone for display and href - avoids hydration mismatch from differing CMS formats */
const normalizePhone = (field: ContactFormBannerFields['PhoneNumber']): { display: string; href: string } | null => {
  const raw = field?.value ?? (field as { jsonValue?: { value?: string } })?.jsonValue?.value;
  if (raw == null) return null;
  const cleaned = String(raw).replace(/[^0-9+]/g, '').trim();
  if (!cleaned) return null;
  return { display: cleaned, href: `tel:${cleaned}` };
};

// Default Layout (single column with automatic CTA detection)
const ContactFormBannerDefaultLayout: React.FC<
  ContactFormBannerProps & { variant: ContactFormBannerVariant }
> = ({ fields, params, variant }) => {
  const siteName = useSiteName();
  const id = params.RenderingIdentifier;
  const backgroundTheme = fields?.BackgroundTheme?.value;
  const showContactFormPopup = fields?.ShowContactFormPopup?.value === true;

  const primaryButtonClassName = cn(
    'mr-4 cursor-pointer inline-flex items-center justify-center rounded-2xl border-2 font-bold text-[16px] px-[40px] py-[9px] lg:text-[18px] lg:px-[50px] xl:text-[20px] xl:px-[60px] transition-colors duration-300 md:mr-0',
    'border-[var(--color-text,#000000)] bg-transparent hover:cursor-pointer hover:bg-[var(--color-text,#000000)] hover:text-[var(--color-text-inverse,#ffffff)]'
  );

  const primaryLinkButtonClassName = cn(
    'mr-0 inline-flex items-center justify-center rounded-2xl border-2 px-9 py-2.5 text-base font-bold transition-colors duration-300 md:mr-0 md:px-16 md:py-2 md:text-lg',
    'border-[var(--color-text,#000000)] bg-transparent text-[var(--color-text,#000000)] hover:bg-[var(--color-text,#000000)] hover:text-[var(--color-text-inverse,#ffffff)]'
  );

  // Automatically show CTAs based on field presence
  const showPrimary = !!fields?.PrimaryCta;
  const showSecondary = !!fields?.secondaryCta;
  const showTertiary = !!fields?.TertiaryCTA;

  return (

    <div
      className={cn(
        "component contact-form-banner mt-2 mb-[3rem] block bg-[var(--color-accent-primary)] md:mb-[4.8rem]",
        variant === 'brandButton'
          ? "w-[calc(100%-1.5rem)] max-w-[1360px] mx-auto px-[16px] py-[32px] md:w-[calc(100%-2rem)] md:px-[32px] md:py-[48px] lg:w-[calc(100%-3rem)] lg:px-[64px] lg:py-[64px] min-[1360px]:w-full"
          : "w-full pt-[28px] pb-[12px] pl-[2px] pr-0 md:pb-[28px] lg:pb-[64px]"
      )}
      id={id}
      style={backgroundTheme ? { backgroundColor: backgroundTheme } : undefined}
      data-component={`ContactFormBanner-${variant}`}
    >
      <div className="component-content mx-auto max-w-[1360px] px-[8px]">
        <div className="flex flex-col items-start justify-center text-left">
          {/* Text Content Area */}
          {fields?.Title && (
            <Text
              tag="h3"
              field={fields.Title}
              className="mb-4 mt-4 leading-[1.1] font-bold text-[26px] min-[1024px]:text-[28px] min-[1024px]:mb-[30px] min-[1268px]:text-[30px] min-[1900px]:text-[44px] min-[1900px]:mb-[38px]"
            />
          )}

          {fields?.Description && (
            <div className="rte-content mt-0 mb-2 text-[17px] leading-[26px] font-bold opacity-90 md:mt-0 md:pt-1 md:text-lg md:leading-8 xl:text-xl [&_p_strong]:text-[17px] md:[&_p_strong]:text-[18px]">
              <RichText field={fields.Description} />
            </div>
          )}

          {/* Actions Area */}
          <div className="flex flex-col gap-5 mt-1 md:mt-8 md:flex-row md:gap-8">
            {showPrimary && fields?.PrimaryCta && (
              <>
                {showContactFormPopup ? (
                  <button
                    type="button"
                    onClick={() => openContactFormModal()}
                    className={primaryButtonClassName}
                  >
                    {fields.PrimaryCta.value.text}
                  </button>
                ) : ['mailto', 'tel'].includes(fields.PrimaryCta?.value?.linktype ?? '') ? (
                  <span className="group relative mr-4 inline-flex items-center gap-2 text-base font-bold md:mr-0 md:text-lg md:text-[20px]">
                    <img src="/assets/icons/email.svg" alt="Mail" className="h-5 w-5 md:h-7 md:w-7" />

                    <a
                      href={fields.PrimaryCta.value.href}
                      className="relative font-normal no-underline transition-colors duration-300"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(fields.PrimaryCta);
                      }}
                    >
                      {fields.PrimaryCta.value.text}
                      <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--color-text,#000000)] transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </span>
                ) : (
                  <Link
                    field={patchLinkField(fields.PrimaryCta, siteName) ?? fields.PrimaryCta}
                    className={primaryLinkButtonClassName}
                  />
                )}
              </>
            )}

            {showSecondary && fields?.secondaryCta && (
              <>
                {['mailto', 'tel'].includes(fields.secondaryCta?.value?.linktype ?? '') ? (
                  <span className="group relative mr-4 inline-flex items-center gap-2 text-base font-bold md:mr-0 md:text-lg md:text-[20px]">
                    <img
                      src={fields.secondaryCta.value.linktype === 'mailto' ? '/assets/icons/email.svg' : '/assets/icons/cws_phone_icon.svg'}
                      alt={fields.secondaryCta.value.linktype === 'mailto' ? 'Mail' : 'Phone'}
                      className="h-5 w-5 md:h-7 md:w-7"
                    />
                    <a
                      href={patchHref(fields.secondaryCta.value.href, siteName) ?? fields.secondaryCta.value.href}
                      className="relative font-normal no-underline transition-colors duration-300"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(fields.secondaryCta);
                      }}
                    >
                      {fields.secondaryCta.value.text}
                      <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--color-text,#000000)] transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </span>
                ) : (
                  <Link
                    field={patchLinkField(fields.secondaryCta, siteName) ?? fields.secondaryCta}
                    className="mr-4 inline-flex items-center justify-center rounded-2xl border-2 border-[var(--color-text,#000000)] bg-transparent px-16 py-2 text-base font-bold text-[var(--color-text,#000000)] transition-colors duration-300 hover:bg-[var(--color-text,#000000)] hover:text-[var(--color-text-inverse,#ffffff)] md:mr-0 md:text-lg"
                  />
                )}
              </>
            )}

            {showTertiary && fields?.TertiaryCTA && (
              <>
                {['mailto', 'tel'].includes(fields.TertiaryCTA?.value?.linktype ?? '') ? (
                  <span className="group relative mr-4 inline-flex items-center gap-2 text-base font-bold md:mr-0 md:text-lg md:text-[20px]">
                    <img
                      src={fields.TertiaryCTA.value.linktype === 'mailto' ? '/assets/icons/email.svg' : '/assets/icons/cws_phone_icon.svg'}
                      alt={fields.TertiaryCTA.value.linktype === 'mailto' ? 'Mail' : 'Phone'}
                      className="h-5 w-5 md:h-7 md:w-7"
                    />
                    <a
                      href={patchHref(fields.TertiaryCTA.value.href, siteName) ?? fields.TertiaryCTA.value.href}
                      className="relative font-normal no-underline transition-colors duration-300"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(fields.TertiaryCTA);
                      }}
                    >
                      {fields.TertiaryCTA.value.text}
                      <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--color-text,#000000)] transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </span>
                ) : (
                  <Link
                    field={patchLinkField(fields.TertiaryCTA, siteName) ?? fields.TertiaryCTA}
                    className="mr-4 inline-flex items-center justify-center rounded-2xl border-2 border-[var(--color-text,#000000)] bg-transparent px-16 py-2 text-base font-bold text-[var(--color-text,#000000)] transition-colors duration-300 hover:bg-[var(--color-text,#000000)] hover:text-[var(--color-text-inverse,#ffffff)] md:mr-0 md:text-lg"
                  />
                )}
              </>
            )}

            {(() => {
              const phone = normalizePhone(fields?.PhoneNumber);
              if (!phone) return null;
              return (
                <div className="phone flex items-center gap-2">
                  <img src="/assets/icons/cws_phone_icon.svg" alt="Phone" className="h-8 w-8" aria-hidden="true" />
                  <a
                    href={phone.href}
                    title="Call us now!"
                    className="group relative flex items-center gap-2 text-2xl font-bold hover:cursor-pointer no-underline"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePhoneClick(phone.display);
                    }}
                    suppressHydrationWarning
                  >
                    <span suppressHydrationWarning>{phone.display}</span>
                    <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--color-text,#000000)] transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Two Column Layout (for twoColoum variant)
const ContactFormBannerTwoColumnLayout: React.FC<
  ContactFormBannerProps & { variant: ContactFormBannerVariant }
> = (props) => {
  const { fields, variant } = props;
  const siteName = useSiteName();
  const id = props.params.RenderingIdentifier;
  const backgroundTheme = fields?.BackgroundTheme?.value;
  const showContactFormPopup = fields?.ShowContactFormPopup?.value === true;

  const primaryButtonClassName = cn(
    'mr-4 inline-flex items-center justify-center rounded-2xl border-2 font-bold text-[16px] px-[40px] py-[9px] lg:text-[18px] lg:px-[50px] xl:text-[20px] xl:px-[60px] transition-colors duration-300 md:mr-0',
    'border-[var(--color-text,#000000)] bg-transparent hover:cursor-pointer hover:bg-[var(--color-text,#000000)] hover:text-[var(--color-text-inverse,#ffffff)]'
  );

  const primaryLinkButtonClassName = cn(
    'mr-4 inline-flex items-center justify-center rounded-2xl border-2 bg-transparent px-6 py-2 text-base font-bold transition-colors duration-300 md:mr-0 md:text-lg',
    'border-[var(--color-text,#000000)] text-[var(--color-text,#000000)] hover:bg-[var(--color-text,#000000)] hover:text-[var(--color-text-inverse,#ffffff)]'
  );

  const showPrimary = true;

  return (
    <div
      className="component contact-form-banner mx-0 mt-2 mb-6 block w-full bg-[var(--color-accent-primary)] pt-[40px] pr-0 pb-[56px] pl-0 leading-[25px] md:mb-16 md:p-[60px_56px_80px] xl:pr-[32px] xl:pl-[32px]"
      id={id ? id : undefined}
      style={backgroundTheme ? { backgroundColor: backgroundTheme } : undefined}
      data-component={`ContactFormBanner-${variant}`}
    >
      <div className="component-content mx-auto max-w-[1360px] px-2">
        {/* Title above two columns */}
        {fields?.Title && (
          <div className="mb-[30px]">
            <Text
              tag="h2"
              field={fields.Title}
              className="mb-0 text-[36px] leading-none font-bold md:mb-[38px] md:text-[35px] md:leading-[40px] lg:text-[40px] lg:leading-[48px] xl:text-[80px]"
            />
          </div>
        )}

        <div className="flex w-full flex-wrap items-start pb-0">
          {/* Text Content Area - Left Column */}
          <div className="flex w-1/2 flex-col items-start justify-center text-left">
            {fields?.Description && (
              <div className="rte-content mt-3 mb-2 text-[17px] leading-[26px] font-bold opacity-90 md:mt-0 md:pt-1 md:text-lg md:leading-8 xl:text-xl [&_p_strong]:text-[17px] md:[&_p_strong]:text-[18px]">
                <RichText field={fields.Description} />
              </div>
            )}
          </div>

          {/* Actions Area - Right Column */}
          <div className="flex w-1/2 flex-col justify-start gap-5 md:flex-row md:gap-8">
            {showPrimary && fields?.PrimaryCta && (
              <>
                {showContactFormPopup ? (
                  <button
                    type="button"
                    onClick={() => openContactFormModal()}
                    className={primaryButtonClassName}
                  >
                    {fields.PrimaryCta.value.text}
                  </button>
                ) : ['mailto', 'tel'].includes(fields.PrimaryCta?.value?.linktype ?? '') ? (
                  <span className="group relative mr-4 inline-flex items-center gap-2 text-base font-bold md:mr-0 md:text-lg md:text-[20px]">
                    <img
                      src="/assets/icons/email.svg"
                      alt="Mail"
                      className="h-5 w-5 md:h-7 md:w-7"
                    />
                    <a
                      href={patchHref(fields.PrimaryCta.value.href, siteName) ?? fields.PrimaryCta.value.href}
                      className="relative font-normal no-underline transition-colors duration-300"
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(fields.PrimaryCta);
                      }}
                    >
                      {fields.PrimaryCta.value.text}
                      <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--color-text,#000000)] transition-all duration-300 group-hover:w-full"></span>
                    </a>
                  </span>
                ) : (
                  <Link
                    field={patchLinkField(fields.PrimaryCta, siteName) ?? fields.PrimaryCta}
                    className={primaryLinkButtonClassName}
                  />
                )}
              </>
            )}

            {(() => {
              const phone = normalizePhone(fields?.PhoneNumber);
              if (!phone) return null;
              return (
                <div className="phone flex items-center gap-2">
                  <img src="/assets/icons/cws_phone_icon.svg" alt="Phone" className="h-8 w-8" aria-hidden="true" />
                  <a
                    href={phone.href}
                    title="Call us now!"
                    className="group relative flex items-center gap-2 text-2xl font-bold hover:cursor-pointer no-underline"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePhoneClick(phone.display);
                    }}
                    suppressHydrationWarning
                  >
                    <span suppressHydrationWarning>{phone.display}</span>
                    <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--color-text,#000000)] transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component exports
export const Default: React.FC<ContactFormBannerProps> = (props) => (
  <ContactFormBannerDefaultLayout {...props} variant="default" />
);

export const TwoColoum: React.FC<ContactFormBannerProps> = (props) => (
  <ContactFormBannerTwoColumnLayout {...props} variant="twoColoum" />
);

export const BrandButton: React.FC<ContactFormBannerProps> = (props) => (
  <ContactFormBannerDefaultLayout {...props} variant="brandButton" />
);

export default Default;

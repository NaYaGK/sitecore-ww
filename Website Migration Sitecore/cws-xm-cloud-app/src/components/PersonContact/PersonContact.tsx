import type React from 'react';
import { Text, RichText, Image, useSitecore, type LinkField } from '@sitecore-content-sdk/nextjs';
import { Globe, Phone } from 'lucide-react';
import { PersonContactProps } from './PersonContact.props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

export const PersonContactVariants = {
  Default: 'default',
  TwoColumn: 'two-column',
  BrandBackground: 'brand-background',
} as const;

type PersonContactVariant =
  (typeof PersonContactVariants)[keyof typeof PersonContactVariants];

function normalizeWebsiteUrl(rawUrl: unknown): string {
  const trimmed = typeof rawUrl === 'string' ? rawUrl.trim() : String(rawUrl ?? '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function asLinkField(field: unknown): LinkField | undefined {
  if (!field) return undefined;
  return (field as { jsonValue?: LinkField }).jsonValue ?? (field as LinkField);
}

function getWebsiteData(field: unknown): { href: string; text: string; target?: string } {
  const linkField = asLinkField(field);
  const rawHref = linkField?.value?.href?.trim() || '';
  const href = normalizeWebsiteUrl(rawHref);
  const text = linkField?.value?.text?.trim() || rawHref.replace(/^https?:\/\//i, '');
  const target = linkField?.value?.target?.trim() || undefined;

  return { href, text, target };
}

const PersonContactLayout: React.FC<PersonContactProps & { variant: PersonContactVariant }> = (props) => {
  const { fields, params, rendering, variant } = props;
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;
  const isTwoColumn = variant === PersonContactVariants.TwoColumn;
  const isBrandBackground = variant === PersonContactVariants.BrandBackground;


  const backgroundColorVariant = isBrandBackground
    ? 'var(--color-accent-primary)'
    : '';


    const backgroundColor = params?.Styles?.trim() || 'var(--color-accent-medium)';
  const website = getWebsiteData(fields.Website);
  const hasWebsite = Boolean(website.href || website.text);
  // Check if there's any content
  const hasContent =
    fields.Name?.value ||
    fields.Job?.value ||
    fields.Company?.value ||
    fields.Email?.value ||
    hasWebsite ||
    fields.Phonenumber?.value ||
    fields.MobilePhonenumber?.value ||
    fields.Address?.value ||
    fields.Image?.value?.src;

  if (!hasContent && !isEditing) {
    return <NoDataFallback componentName={rendering?.componentName ?? 'PersonContact'} />;
  }

  // Two column variant - original layout
  if (isTwoColumn) {
    return (
    <section
      className={cn('component person-contact-two-column mb-4 w-full md:mb-8', 'relative')}
      data-component={`PersonContact-${variant}`}
     style={backgroundColor ? { backgroundColor } : { backgroundColor: 'var(--color-accent-primary)' }}
    >
      <div className="mx-auto w-full max-w-[1360px] px-2 py-6 md:px-[10px] md:py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {/* Left column: Person info and image */}
          <div className="flex flex-col gap-4">
            {/* Image at top in two-column layout */}
            {fields.Image && (fields.Image.value?.src || isEditing) && (
              <div className="flex justify-start">
                <div className="relative h-32 w-32 overflow-hidden rounded-full md:h-40 md:w-40">
                  <Image
                    field={fields.Image}
                    className="h-full w-full object-cover object-center"
                    alt={fields.Name?.value || 'Contact person'}
                  />
                </div>
              </div>
            )}

            {/* Person details */}
            <div className="flex flex-col gap-2">
              {/* Name - most prominent, large bold */}
              {fields.Name && (fields.Name.value || isEditing) && (
                <Text
                  tag="h3"
                  field={fields.Name}
                  className="m-0 text-left text-2xl leading-tight font-bold text-black md:text-3xl"
                />
              )}

              {/* Job title - smaller, regular weight */}
              {fields.Job && (fields.Job.value || isEditing) && (
                <Text
                  tag="p"
                  field={fields.Job}
                  className="m-0 text-left text-14 leading-relaxed font-normal text-black md:text-[20px]"
                />
              )}

              {/* Company - bold */}
              {fields.Company && (fields.Company.value || isEditing) && (
                <Text
                  tag="p"
                  field={fields.Company}
                  className="m-0 mt-1 text-left text-base leading-relaxed font-bold text-black md:text-lg"
                />
              )}

              {/* Address (Rich text) - regular weight, below company */}
              {fields.Address && (fields.Address.value || isEditing) && (
                <div className="rte-content mt-1 text-left text-base leading-relaxed font-normal text-black md:text-lg">
                  <RichText field={fields.Address} />
                </div>
              )}
            </div>
          </div>

          {/* Right column: Contact information */}
          <div className="flex flex-col justify-center gap-4">
            {(fields.Phonenumber?.value ||
              fields.MobilePhonenumber?.value ||
              fields.Email?.value ||
              hasWebsite ||
              isEditing) && (
                <div className="flex flex-col gap-4">
                  <div className="text-lg font-bold text-black md:text-xl">Contact</div>

                  {fields.Phonenumber && (fields.Phonenumber.value || isEditing) && (
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-medium text-black/70">Phone</div>
                      <a
                        href={`tel:${fields.Phonenumber.value || ''}`}
                        className="group flex items-center gap-3 text-left text-lg leading-relaxed font-normal text-black no-underline md:text-xl"
                      >
                        <Phone className="h-5 w-5 shrink-0 text-black/50" />
                        <span className="relative pb-0 after:absolute after:bottom-[-0.1rem] after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-[width] after:duration-200 group-hover:after:w-full">
                          <Text field={fields.Phonenumber} />
                        </span>
                      </a>
                    </div>
                  )}

                  {fields.MobilePhonenumber && (fields.MobilePhonenumber.value || isEditing) && (
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-medium text-black/70">Mobile</div>
                      <a
                        href={`tel:${fields.MobilePhonenumber.value || ''}`}
                        className="group flex items-center gap-3 text-left text-lg leading-relaxed font-normal text-black no-underline md:text-xl"
                      >
                        <Phone className="h-5 w-5 shrink-0 text-black/50" />
                        <span className="relative pb-0 after:absolute after:bottom-[-0.1rem] after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-[width] after:duration-200 group-hover:after:w-full">
                          <Text field={fields.MobilePhonenumber} />
                        </span>
                      </a>
                    </div>
                  )}

                  {fields.Email && (fields.Email.value || isEditing) && (
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-medium text-black/70">Email</div>
                      <div className="flex items-center gap-3">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="shrink-0"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 3h12c.55 0 1 .45 1 1v8c0 .55-.45 1-1 1H2c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="none"
                          />
                          <path d="M2 4l6 4 6-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </svg>
                        <a
                          href={`mailto:${fields.Email.value || ''}`}
                          className="group text-left text-lg leading-relaxed font-normal text-black no-underline md:text-xl"
                        >
                          <span className="relative pb-0 after:absolute after:bottom-[-0.1rem] after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-[width] after:duration-200 group-hover:after:w-full">
                            <Text field={fields.Email} />
                          </span>
                        </a>
                      </div>
                    </div>
                  )}

                  {(hasWebsite || isEditing) && (
                    <div className="flex flex-col gap-1">
                      <div className="text-sm font-medium text-black/70">Website</div>
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 shrink-0 text-black/50" aria-hidden="true" />
                        <a
                          href={website.href || undefined}
                          target={website.target}
                          rel={website.target === '_blank' ? 'noreferrer' : undefined}
                          className="group text-left text-lg leading-relaxed font-normal text-black no-underline md:text-xl"
                        >
                          <span className="relative pb-0 after:absolute after:bottom-[-0.1rem] after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-[width] after:duration-200 group-hover:after:w-full">
                            {website.text}
                          </span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </section>
  );
  }

  // Default variant

  return (
      <section
        className={cn('component person-contact w-full mb-[3rem] sm:mb-[4.5rem]', 'relative')}
        data-component="PersonContact"
        style={{ backgroundColor }}
      >
        <div className="mx-auto w-full max-w-[1360px] px-6 lg:px-[32px] py-6 py-[30px] lg:pt-24 lg:pb-13">
          {/* Contact heading */}
          {fields.Name && (fields.Name.value || isEditing) && (
            <Text
              tag="h1"
              field={fields.Name}
              className="font-heading-h1 mb-[30px] lg:mb-[50px] text-[36px] lg:text-[80px]"
            />
          )}

          {/* Main content: Person details on left, email on right */}
          <div className="flex flex-col sm:gap-40 md:gap:70 lg:gap-100 xl:gap-120 mt-4 sm:mt-0 sm:flex-row md:items-start">
            {/* Left side: Person details */}
            <div className="flex flex-col">
              {/* Name */}


              {/* Company - bold */}
              {fields.Company && (fields.Company.value || isEditing) && (
                <Text
                  tag="p"
                  field={fields.Company}
                  className="m-0 text-left text-[14px] leading-relaxed font-bold text-black md:text-xl"
                />
              )}

              {/* Address (Rich text) */}
              {fields.Address && (fields.Address.value || isEditing) && (
                <div className="rte-content mt-1 text-left text-base leading-relaxed font-normal text-black md:text-lg [&_strong]:pb-1">
                  <RichText field={fields.Address} />
                </div>
              )}
            </div>

            {/* Right side: Contact details */}
            <div className="flex flex-col gap-1 md:mt-0">
              {/* Phone numbers */}
              {(fields.Phonenumber?.value ||
                fields.MobilePhonenumber?.value ||
                isEditing) && (
                  <div className="flex flex-col text-[14px] lg:text-[20px]">
                    {fields.Phonenumber && (fields.Phonenumber.value || isEditing) && (
                      <a
                        href={`tel:${fields.Phonenumber.value || ''}`}
                        className="group flex items-center gap-2 text-left text-base leading-relaxed font-normal text-black no-underline text-[14px] lg:text-[20px]"
                      >
                        <Phone className="h-7 w-7 shrink-0 text-black/400" />
                        <span className="relative pb-0 after:absolute after:bottom-[-0.1rem] after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-[width] after:duration-200 group-hover:after:w-full">
                          <Text field={fields.Phonenumber} />
                        </span>
                      </a>
                    )}
                    {fields.MobilePhonenumber && (fields.MobilePhonenumber.value || isEditing) && (
                      <a
                        href={`tel:${fields.MobilePhonenumber.value || ''}`}
                        className="group flex items-center gap-2 text-left text-base leading-relaxed font-normal text-black no-underline text-[14px] lg:text-[20px]"
                      >
                         <Phone className="h-7 w-7 shrink-0 text-black/400" />
                        <span className="relative pb-0 after:absolute after:bottom-[-0.1rem] after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-[width] after:duration-200 group-hover:after:w-full">
                          <Text field={fields.MobilePhonenumber} />
                        </span>
                      </a>
                    )}
                  </div>
                )}

              {/* Email */}
              {fields.Email && (fields.Email.value || isEditing) && (
                <div className="flex items-center gap-2">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="shrink-0"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 3h12c.55 0 1 .45 1 1v8c0 .55-.45 1-1 1H2c-.55 0-1-.45-1-1V4c0-.55.45-1 1-1z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <path d="M2 4l6 4 6-4" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                  <a
                    href={`mailto:${fields.Email.value || ''}`}
                    className="group text-left text-base leading-relaxed font-normal text-black no-underline text-[14px] lg:text-[20px]"
                  >
                    <span className="relative pb-0 after:absolute after:bottom-[-0.1rem] after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-[width] after:duration-200 group-hover:after:w-full">
                      <Text field={fields.Email} />
                    </span>
                  </a>
                </div>
              )}

              {/* Website */}
              {(hasWebsite || isEditing) && (
                <div className="flex items-center gap-2">
                  <Globe className="h-7 w-7 shrink-0" aria-hidden="true" />
                  <a
                    href={website.href || undefined}
                    target={website.target}
                    rel={website.target === '_blank' ? 'noreferrer' : undefined}
                    className="group text-left text-base leading-relaxed font-normal text-black no-underline text-[14px] lg:text-[20px]"
                  >
                    <span className="relative pb-0 after:absolute after:bottom-[-0.1rem] after:left-0 after:h-[2px] after:w-0 after:bg-current after:transition-[width] after:duration-200 group-hover:after:w-full">
                      {website.text}
                    </span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Job title - below main content */}
          {fields.Job && (fields.Job.value || isEditing) && (
            <div className="mt-4">
              <Text
                tag="p"
                field={fields.Job}
                className="m-0 text-left text-base leading-relaxed font-normal text-black md:text-lg"
              />
            </div>
          )}

          {/* Image - optional, hidden by default to match screenshot */}
          {fields.Image && (fields.Image.value?.src || isEditing) && (
            <div className="mt-4 hidden md:flex md:justify-start">
              <div className="relative h-32 w-32 overflow-hidden rounded-full md:h-40 md:w-40">
                <Image
                  field={fields.Image}
                  className="h-full w-full object-cover object-center"
                  alt={fields.Name?.value || 'Contact person'}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    );
};

export const Default: React.FC<PersonContactProps> = (props) => (
  <PersonContactLayout {...props} variant={PersonContactVariants.Default} />
);

export const TwoColumn: React.FC<PersonContactProps> = (props) => (
  <PersonContactLayout {...props} variant={PersonContactVariants.TwoColumn} />
);

export const BrandBackground: React.FC<PersonContactProps> = (props) => (
  <PersonContactLayout {...props} variant={PersonContactVariants.BrandBackground} />
);

export default Default;

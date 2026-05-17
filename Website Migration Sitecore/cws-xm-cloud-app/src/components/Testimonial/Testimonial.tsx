'use client';

import { Image, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { FC } from 'react';
import type { TestimonialProps } from './Testimonial.props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

type TestimonialVariant = 'default' | 'imageLeft' | 'imageLeftMaxWidth';

const TestimonialLayout: FC<TestimonialProps & { variant: TestimonialVariant }> = ({
  fields,
  rendering,
  variant,
}) => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;


  const titleField = fields?.Title;
  const nameField = fields?.Name;
  const imageField = fields?.Image;

  const imageSrc = imageField?.value?.src;
  const shouldRenderImage = Boolean(imageSrc) || (isPageEditing && Boolean(imageField));
  const imageAlt =
    imageField?.value?.alt ||
    (typeof nameField?.value === 'string' ? nameField.value : 'Testimonial portrait');


  /* ================================
     VARIANT: IMAGE LEFT (MAX WIDTH)
  ================================= */
  if (variant === 'imageLeft' || variant === 'imageLeftMaxWidth') {
    return (
      <section
        className="component testimonial w-full  px-10 md:px-0 mb-12 lg:mb-18"
        data-component={`Testimonial-${variant}`}
      >
        <div className="mx-auto max-w-[1360px] -mt-8">
          <div className=" flex w-full flex-col  md:h-auto md:w-[80%] md:flex-row md:gap-5 lg:px-10">
            {shouldRenderImage && (
              <Image
                field={imageField}
                alt={imageAlt}
                className="relative block w-full h-[65vw] min-w-[250px] object-cover sm:h-full sm:max-w-[500px] sm:max-h-[500px]  border-0"
              />
            )}

            <div className="flex w-full bg-[var(--color-accent-primary)] p-0 md:w-[40%]">
              <div className="w-full max-w-[914px] px-5 py-5 pb-[28px] md:px-5">
                <Text
                  tag="p"
                  field={titleField}
                  className="font-heading text-xl leading-relaxed font-medium md:text-2xl"
                />
                <Text
                  tag="p"
                  field={nameField}
                  className="font-body text-[18px] leading-[24px] md:leading-[37px] font-normal text-[rgb(0,0,0)] mb-10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* =========================
     VARIANT: IMAGE LEFT
  // ========================== */
  // if (variant === 'imageLeft') {
  //   return (
  //     <section
  //       className="component testimonial w-full bg-white py-12 md:py-20"
  //       data-component="Testimonial-imageLeft"
  //     >
  //       <div className="mx-auto grid max-w-[1360px] grid-cols-1 md:grid-cols-2 md:gap-7">
  //         {shouldRenderImage && (
  //           <div className="relative h-[320px] md:h-[460px]">
  //             <Image field={imageField} alt={imageAlt} className="h-full w-full object-cover" />
  //           </div>
  //         )}

  //         <div className="flex bg-[var(--color-accent-primary)] p-0">
  //           <div className="max-w-lg px-5 py-7 md:px-5">
  //             <Text
  //               tag="p"
  //               field={titleField}
  //               className="font-heading text-xl leading-relaxed font-medium md:text-2xl"
  //             />
  //             <Text tag="p" field={nameField} className="font-body mt-6 text-base font-semibold" />
  //           </div>
  //         </div>
  //       </div>
  //     </section>
  //   );
  // }



  /* =========================
     VARIANT: DEFAULT
  ========================== */
  return (
    <section
      className={cn(
        'component testimonial relative w-full bg-[var(--color-accent-primary)] p-0 mb-12 lg:mb-18',
      )}
      data-component="Testimonial-default"
    >
      <div className="mx-auto max-w-[1360px] px-2 lg:px-6 xl:px-4">
        <div className="flex flex-col md:flex-row">
          <div className="mt-20 mb-12 flex w-full flex-col items-center justify-center px-2 md:mt-0 md:mb-0 md:min-w-1/2 md:pr-12 lg:min-w-1/2">
            <div className="w-full max-w-lg break-words">
              <Text
                tag="p"
                className="mb-6 text-[18px] leading-[24px] font-bold md:mb-24 md:text-[20px] md:leading-[22px] lg:text-[22px]"
                field={titleField}
              />
              <Text tag="p" className="font-body text-base" field={nameField} />
            </div>
          </div>

          {shouldRenderImage && (
            <div className="flex min-h-[150px] w-full shrink-0 items-center justify-center md:min-h-full md:w-auto">
              <div className="h-[170px] w-[300px] overflow-hidden md:h-[550px] md:w-auto">
                <Image field={imageField} alt={imageAlt} className="h-full w-full object-cover" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================
   VARIANT EXPORTS
========================== */

export const Default: FC<TestimonialProps> = (props) => (
  <TestimonialLayout {...props} variant="imageLeftMaxWidth" />
);

export const ImageLeft: FC<TestimonialProps> = (props) => (
  <TestimonialLayout {...props} variant="imageLeftMaxWidth" />
);

export const ImageLeftMaxWidth: FC<TestimonialProps> = (props) => (
  <TestimonialLayout {...props} variant="imageLeftMaxWidth" />
);

export default Default;

'use client';

import type { FC } from 'react';

import type { LandingPageFooterProps } from './LandingPageFooter.props';
import { landingPageFooterMock } from './LandingPageFooter.mock';

const FONT_FAMILY = 'suisse_intlregular, sans-serif';

export const Default: FC<LandingPageFooterProps> = () => {
  const { copyrightText, navAriaLabel, ctaButton, links } = landingPageFooterMock;

  return (
    <footer
      id="footer"
      data-component="LandingPageFooter"
      className="relative bg-black pt-[70px] text-[17px] leading-[25px] text-black lg:pt-[110px] lg:leading-[28px]"
      style={{ fontFamily: FONT_FAMILY }}
    >
      <div className="global-footer">
        <div className="cws-container relative mx-auto w-full max-w-[1360px] px-[8px] lg:px-[16px] xl:px-[10px]">
          <div className="region region-footer flex flex-col items-start justify-start lg:flex-row lg:items-center lg:justify-start">
            <div
              id="block-cwsdesign-copyright"
              className="block block-block-content order-2 lg:order-1 lg:mr-[30px]"
            >
              <div className="field field--name-body field--type-text-with-summary field--label-hidden entity_type-block-content field__item">
                <p className="m-[15px_0] text-[12px] leading-[12px] text-white">
                  {copyrightText}
                </p>
              </div>
            </div>

            <nav
              role="navigation"
              aria-labelledby="block-cwsdesign-footernavigationworkwearlp-menu"
              id="block-cwsdesign-footernavigationworkwearlp"
              className="block block-menu navigation menu--footer-navigation-workwear-lp order-1 w-full lg:order-2 lg:w-auto"
            >
              <label
                id="block-cwsdesign-footernavigationworkwearlp-menu"
                className="sr-only"
              >
                {navAriaLabel}
              </label>
              <ul className="menu m-0 flex w-full list-none flex-wrap items-center justify-start gap-x-[30px] gap-y-0 p-0 lg:w-auto lg:gap-x-0">
                {links.map((link) => (
                  <li
                    key={link.href}
                    className="menu-item m-0 p-0 lg:mr-[30px]"
                  >
                    <a
                      href={link.href}
                      className="block bg-transparent py-[15px] text-[12px] leading-[12px] text-white no-underline transition-colors duration-200 hover:text-white hover:underline hover:underline-offset-[5px]"
                      rel={link.rel}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <a
        href={ctaButton.href}
        title={ctaButton.title}
        className="sticky-cta-link hidden lg:block fixed right-[20px] bottom-[20px] z-40 max-w-[calc(100vw-40px)] rounded-[20px] bg-[#eb0045] px-[25px] py-[6px] text-center text-[17px] leading-[28px] whitespace-nowrap text-white no-underline transition-colors duration-100 hover:bg-[#d1003d]"
      >
        {ctaButton.label}
      </a>
    </footer>
  );
};

export default Default;

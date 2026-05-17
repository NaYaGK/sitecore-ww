/**
 * This Layout is needed for Starter Kit.
 */
import React, { JSX, useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { Placeholder, Field, DesignLibrary, Page } from '@sitecore-content-sdk/nextjs';
import Scripts from 'src/Scripts';
import SitecoreStyles from 'src/components/content-sdk/SitecoreStyles';
import { SEO } from './components/SEO/SEO';
import { useFormInterceptor } from './hooks/useFormInterceptor';
import { useSiteName } from './hooks/useSiteName';
import { FormSubmissionDialog } from './components/FormSubmissionDialog/FormSubmissionDialog';
import { UrlProvider } from './contexts/UrlContext';

interface LayoutProps {
  page: Page;
}

interface RouteFields {
  [key: string]: unknown;
  Title?: Field;
  CampaignID?: Field;
  MetaType?: { value: any };
  PageIdentifier?: { value: string };
}

const FormInterceptorLayer = () => {
  const { open, status, title, message, closeDialog } = useFormInterceptor();

  return (
    <FormSubmissionDialog
      open={open}
      onOpenChange={closeDialog}
      status={status}
      title={title}
      message={message}
    />
  );
};

const Layout = ({ page }: LayoutProps): JSX.Element => {
  const { layout, mode } = page;
  const { route } = layout.sitecore;
  const fields = route?.fields as RouteFields;
  const mainClassPageEditing = mode.isEditing ? 'editing-mode' : 'prod-mode';
  const importMapDynamic = async () => ({ default: [] } as any);
  const pageType = (fields?.['Page Tags'] as any)?.[0]?.fields?.Title?.value;
  const pageIdentifier = fields?.PageIdentifier?.value;
  const siteName = useSiteName();

  const isWorkwearSite = siteName === 'workwear';
  const isHealthcareSite = siteName === 'healthcare';

  const faviconIcoHref = isHealthcareSite
    ? '/healthcare-favicon.ico'
    : isWorkwearSite
      ? '/favicon.ico'
      : '/cws-favicon.ico';
  const faviconSvgHref = isHealthcareSite
    ? '/healthcare-favicon.svg'
    : isWorkwearSite
      ? '/favicon.svg'
      : '/cws-favicon.svg';
  const faviconPngHref = isHealthcareSite
    ? '/healthcare-favicon.png'
    : isWorkwearSite
      ? '/favicon.png'
      : '/cws-favicon.png';
  const appleTouchIconHref = isHealthcareSite
    ? '/healthcare-apple-touch-icon.png'
    : isWorkwearSite
      ? '/apple-touch-icon.png'
      : '/cws-apple-touch-icon.png';

  // Store CampaignID globally for forms to access
  useEffect(() => {
    if (fields?.CampaignID?.value) {
      (window as any).CWS_CAMPAIGN_ID = fields.CampaignID.value;
    }
  }, [fields?.CampaignID]);

  return (
    <UrlProvider>
      <>
        <Scripts />
        <SitecoreStyles layoutData={layout} />
        <Head>
          <link rel="icon" href={faviconIcoHref} sizes="any" />
          <link rel="icon" type="image/svg+xml" href={faviconSvgHref} />
          <link rel="icon" type="image/png" href={faviconPngHref} sizes="32x32" />
          <link rel="apple-touch-icon" sizes="180x180" href={appleTouchIconHref} />
        </Head>
        <Script
          id="consentmanager-cmp"
          data-cmp-ab="1"
          strategy="beforeInteractive"
          src="https://c.delivery.consentmanager.net/delivery/cmp.php?&cdid=539d2ed0a2b5d&h=https%3A%2F%2Fwww.cws.com%2Fen-IE%2Fhygiene%2Fcotton-towel-roll&&__cmpfcc=1&l=en&ls=EN_EN_EN&lp=EN-IE_EN&o=1768306987186"
        />
        <Script
          id="consentmanager-cmp-final"
          data-cmp-ab="1"
          strategy="beforeInteractive"
          src="https://cdn.consentmanager.net/delivery/js/cmp_final.min.js?t=2026-1-13"
        />
        <SEO
          key={page.layout.sitecore.route?.itemId || page.layout.sitecore.route?.name}
          fields={fields as any}
          context={layout.sitecore.context}
          page={page}
        />

        {/* root placeholder for the app, which we add components to using route data */}
        <div
          className={mainClassPageEditing}
          data-page-type={pageType}
          data-page-identifier={pageIdentifier}
        >
          {mode.isDesignLibrary ? (
            <DesignLibrary loadImportMap={importMapDynamic} />
          ) : (
            <>
              <header>
                <div id="header">
                  {route && <Placeholder name="headless-header" rendering={route} />}
                </div>
              </header>
              <main>
                <div id="content">
                  {route && <Placeholder name="headless-main" rendering={route} />}
                </div>
              </main>
              <footer>
                <div id="footer">
                  {route && <Placeholder name="headless-footer" rendering={route} />}
                </div>
              </footer>
            </>
          )}
        </div>

        {/* Isolated form interceptor/dialog layer to avoid Layout-wide rerender side effects */}
        <FormInterceptorLayer />
      </>
    </UrlProvider>
  );
};

export default Layout;

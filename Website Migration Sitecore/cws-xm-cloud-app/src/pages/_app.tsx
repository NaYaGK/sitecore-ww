import { JSX, useEffect } from 'react';
import type { AppProps } from 'next/app';
import { I18nProvider } from 'next-localization';
import Bootstrap from 'src/Bootstrap';
import { SitecorePageProps } from '@sitecore-content-sdk/nextjs';
import scConfig from 'sitecore.config';
import '@/assets/styles/globals.css';
import { FormValidation } from '@/utils/formValidation';
import { ContactFormModalController } from '@/ui/Modal/ContactFormModalController';
import { GTMTracker } from '@/GTM/GTMTracker';
import { GTMProvider } from '@/GTM/gtm';

function App({ Component, pageProps }: AppProps<SitecorePageProps>): JSX.Element {
  const { dictionary, ...rest } = pageProps;


  // Server-side brand detection with fallback hierarchy
  const BRAND =
    pageProps.page?.siteName?.toLowerCase() ||
    pageProps.page?.layout?.sitecore?.context?.site?.name?.toLowerCase() ||
    scConfig.defaultSite?.toLowerCase() || 'workwear';

  return (
    <div data-brand={BRAND}>
      <Bootstrap {...pageProps} />
      {/*
        // Use the next-localization (w/ rosetta) library to provide our translation dictionary to the app.
        // Note Next.js does not (currently) provide anything for translation, only i18n routing.
        // If your app is not multilingual, next-localization and references to it can be removed.
      */}
      <I18nProvider
        lngDict={dictionary}
        locale={pageProps.page?.locale || scConfig.defaultLanguage}
      >
        <GTMProvider />
        <FormValidation />
        <Component {...rest} />
        <ContactFormModalController />
        <GTMTracker />
      </I18nProvider>
    </div>
  );
}

export default App;

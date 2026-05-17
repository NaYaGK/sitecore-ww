import { useEffect, JSX } from 'react';
import { CloudSDK } from '@sitecore-cloudsdk/core/browser';
import { SitecorePageProps } from '@sitecore-content-sdk/nextjs';
import '@sitecore-cloudsdk/events/browser';
import '@sitecore-cloudsdk/personalize/browser';
import '@sitecore-cloudsdk/search/browser';
import config from 'sitecore.config';

/**
 * The Bootstrap component is the entry point for performing any initialization logic
 * that needs to happen early in the application's lifecycle.
 */
const Bootstrap = (props: SitecorePageProps): JSX.Element | null => {
  const { page } = props;

  // Browser ClientSDK init allows for page view events to be tracked

  useEffect(() => {
    if (!page) {
      return;
    }

    const mode = page.mode;
    if (!mode.isNormal) {
      console.debug('Browser Events SDK is not initialized in edit and preview modes');
      return;
    }

    if (!config.api.edge?.clientContextId) {
      console.error('Client Edge API settings missing from configuration');
      return;
    }

    void (async () => {
      await import('@sitecore-cloudsdk/events/browser');

      CloudSDK({
        sitecoreEdgeUrl: config.api.edge.edgeUrl,
        sitecoreEdgeContextId: config.api.edge.clientContextId,
        siteName: page.siteName || config.defaultSite,
        enableBrowserCookie: true,
        // Replace with the top level cookie domain of the website that is being integrated e.g ".example.com" and not "www.example.com"
        cookieDomain: window.location.hostname.replace(/^www\./, ''),
      })
        .addEvents()
        .addPersonalize({
          enablePersonalizeCookie: true,
          webPersonalization: {
            language: page?.layout.sitecore.context.language,
          },
        })
        .addSearch()
        .initialize();
    })();
  }, [page?.siteName]);

  return null;
};

export default Bootstrap;

'use client';

import type { Page, ComponentPropsCollection } from '@sitecore-content-sdk/nextjs';
import type { SitecoreConfig } from '@sitecore-content-sdk/nextjs/config';
import { Placeholder, SitecoreProvider, ComponentPropsContext } from '@sitecore-content-sdk/nextjs';
import { AppProviders } from '@/providers/AppProviders';
import { componentMap } from '../../../.sitecore/component-map';
import { EditingScriptsWrapper } from '@components/EditingScriptsWrapper';

const DEFAULT_PLACEHOLDERS = ['headless-header', 'headless-main', 'headless-footer'];

type SitecoreRenderRootProps = {
  page: Page;
  apiConfig: SitecoreConfig['api'];
  componentProps?: ComponentPropsCollection;
};

const hasPlaceholder = (page: Page, placeholder: string) =>
  Boolean(page.layout.sitecore.route?.placeholders?.[placeholder]);

export const SitecoreRenderRoot = ({
  page,
  apiConfig,
  componentProps = {},
}: SitecoreRenderRootProps) => {
  const route = page.layout.sitecore.route;
  const placeholders = route?.placeholders ? Object.keys(route.placeholders) : [];

  if (!route) {
    return null;
  }

  const placeholdersToRender = placeholders.length > 0 ? placeholders : DEFAULT_PLACEHOLDERS;

  return (
    <SitecoreProvider api={apiConfig} page={page} componentMap={componentMap}>
      <ComponentPropsContext value={componentProps}>
        <AppProviders>
          <EditingScriptsWrapper />
          <div className="flex min-h-screen flex-col">
            {placeholdersToRender.map((placeholderName) => {
              if (!hasPlaceholder(page, placeholderName)) return null;

              if (placeholderName === 'headless-header') {
                return (
                  <header key={placeholderName} className="sticky top-0 z-50 w-full">
                    <Placeholder name={placeholderName} rendering={route} />
                  </header>
                );
              }

              if (placeholderName === 'headless-main') {
                return (
                  <main key={placeholderName} className="flex-1">
                    <Placeholder name={placeholderName} rendering={route} />
                  </main>
                );
              }

              if (placeholderName === 'headless-footer') {
                return (
                  <footer key={placeholderName} className="w-full">
                    <Placeholder name={placeholderName} rendering={route} />
                  </footer>
                );
              }

              return <Placeholder key={placeholderName} name={placeholderName} rendering={route} />;
            })}
          </div>
        </AppProviders>
      </ComponentPropsContext>
    </SitecoreProvider>
  );
};

export default SitecoreRenderRoot;

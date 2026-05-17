import type { Preview } from '@storybook/react';
import React from 'react';
import '../src/assets/styles/globals.css';
import { AppProviders } from '../src/providers/AppProviders';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';
import type { NextRouter } from 'next/router';

if (typeof window !== 'undefined' && !(window as typeof window & { process?: any }).process) {
  (window as typeof window & { process?: any }).process = { env: { NODE_ENV: 'development' } };
  (window as any).__STORYBOOK__ = true;
}

if (
  typeof globalThis !== 'undefined' &&
  !(globalThis as typeof globalThis & { React?: typeof React }).React
) {
  (globalThis as typeof globalThis & { React?: typeof React }).React = React;
}

(globalThis as any).__NEXT_IMAGE_OPTS = {
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  path: '/',
  loader: 'default',
  domains: ['images.unsplash.com', 'images.pexels.com', 'i.ytimg.com'],
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: 'images.pexels.com' },
    { protocol: 'https', hostname: 'i.ytimg.com' },
  ],
};

const mockRouter: NextRouter = {
  basePath: '',
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  push: async () => true,
  replace: async () => true,
  reload: () => {},
  back: () => {},
  forward: () => {},
  prefetch: async () => {},
  beforePopState: () => {},
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
  events: {
    on: () => {},
    off: () => {},
    emit: () => {},
  },
};

if (typeof window !== 'undefined') {
  try {
    const nextRouter = require('next/router');
    if (nextRouter) {
      nextRouter.useRouter = () => mockRouter;
      nextRouter.withRouter = (Component: React.ComponentType<any>) => {
        const WithRouter = (props: any) => <Component {...props} router={mockRouter} />;
        WithRouter.displayName = `withRouter(${Component.displayName || Component.name || 'Component'})`;
        return WithRouter;
      };
      nextRouter.Router = mockRouter;
      nextRouter.router = mockRouter;
      nextRouter.default = mockRouter;
    }
  } catch {
    // ignore module resolution issues
  }

  try {
    const nextLink = require('next/link');
    if (nextLink) {
      nextLink.default = React.forwardRef<HTMLAnchorElement, any>(function MockLink(
        { href, children, onClick, ...rest },
        ref,
      ) {
        const stringHref =
          typeof href === 'object' ? href?.pathname || (href?.href as string) || '/' : href || '/';

        const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
          onClick?.(event);
          if (!event.defaultPrevented) {
            mockRouter.asPath = stringHref;
            mockRouter.pathname = stringHref;
          }
        };

        return (
          <a ref={ref} href={stringHref} onClick={handleClick} {...rest}>
            {children}
          </a>
        );
      });
    }
  } catch {
    // ignore module resolution issues
  }

  try {
    const nextImage = require('next/image');
    if (nextImage?.default) {
      nextImage.default = Object.assign((props: any) => {
        const { src, alt, ...rest } = props;
        // ensure src resolves to string for object inputs
        const resolvedSrc =
          typeof src === 'string'
            ? src
            : typeof src === 'object' && 'src' in src
              ? (src as { src: string }).src
              : '';
        return <img src={resolvedSrc} alt={alt ?? ''} {...rest} />;
      }, nextImage.default);
    }
  } catch {
    // ignore module resolution issues
  }
}

const preview: Preview = {
  parameters: {
    nextjs: { appDirectory: true },
    layout: 'centered',
    controls: { expanded: true },
    a11y: { disable: false },
  },
  decorators: [
    (Story) => (
      <RouterContext.Provider value={mockRouter}>
        <AppProviders>
          <Story />
        </AppProviders>
      </RouterContext.Provider>
    ),
  ],
};

export default preview;

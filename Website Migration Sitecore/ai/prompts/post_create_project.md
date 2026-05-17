## How to apply (one‑time)

1. Create an empty folder (`cws-xm-cloud-app`) and **copy each file** below to the indicated path.
2. Run:

```bash
npm install
npm run prepare        # sets up Husky hook
npm run story          # start Storybook (local, no Sitecore dependency)
npm run dev            # start Next dev server (local)
npm run test           # runs Playwright tests
```

> When XM Cloud access is granted, set `.env.local` from `.env.example` and run `npm run sitecore:build` before `npm run build`. ([Sitecore Documentation][2])

---

# 📁 Files

> Copy each block’s content into the file at the given path.

---

### `package.json`

```json
{
  "name": "cws-xm-cloud-app",
  "private": true,
  "version": "0.1.0",
  "description": "CWS – Sitecore XM Cloud + Next.js 15 app using Sitecore Content SDK",
  "engines": {
    "node": ">=18.18.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "npm run sitecore:build && next build",
    "start": "next start",
    "type-check": "tsc --noEmit",
    "lint": "next lint",
    "format": "prettier --write .",
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "story": "storybook dev -p 6006",
    "story:build": "storybook build",
    "prepare": "husky install",
    "sitecore:build": "sitecore-tools project build",
    "sitecore:component:scaffold": "sitecore-tools project component scaffold",
    "sitecore:component:map": "sitecore-tools project component generate-map",
    "sitecore:component:map:watch": "sitecore-tools project component generate-map --watch",
    "agents:init:claude": "playwright init-agents --loop=claude",
    "agents:init:vscode": "playwright init-agents --loop=vscode"
  },
  "dependencies": {
    "@sitecore-content-sdk/core": "latest",
    "@sitecore-content-sdk/nextjs": "latest",
    "graphql": "latest",
    "next": "15.5.0",
    "react": "19.0.0",
    "react-dom": "19.0.0"
  },
  "devDependencies": {
    "@playwright/test": "latest",
    "@storybook/addon-a11y": "latest",
    "@storybook/addon-essentials": "latest",
    "@storybook/addon-interactions": "latest",
    "@storybook/nextjs": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@typescript-eslint/parser": "latest",
    "autoprefixer": "latest",
    "eslint": "latest",
    "eslint-config-next": "latest",
    "eslint-plugin-unicorn": "latest",
    "husky": "latest",
    "lint-staged": "latest",
    "postcss": "latest",
    "prettier": "latest",
    "prettier-plugin-tailwindcss": "latest",
    "tailwindcss": "latest",
    "typescript": "latest",
    "@sitecore-content-sdk/cli": "latest",
    "sharp": "latest"
  },
  "lint-staged": {
    "*.{ts,tsx,js,json,md,css}": [
      "prettier --write"
    ],
    "*.{ts,tsx}": [
      "eslint --max-warnings=0"
    ]
  }
}
```

---

### `.gitignore`

```gitignore
# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Env
.env*
!.env.example

# Next
.next/
out/

# Storybook
storybook-static/

# Playwright
test-results/
playwright-report/
trace.zip

# Misc
.DS_Store
.vscode/
```

---

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": false,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "jsx": "preserve",
    "types": ["@types/node"]
  },
  "include": ["next-env.d.ts", "src", ".storybook", "playwright.config.ts"],
  "exclude": ["node_modules"]
}
```

---

### `next.config.mjs`

```js
// @ts-check
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  images: {
    // allow external images if you use them in Hero stories
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  }
};
export default nextConfig;
```

> Next config shape per Next.js docs. ([Next.js][7])

---

### `.env.example`

```bash
# ===== XM Cloud / Experience Edge =====
# Context ID is preferred for XM Cloud-connected apps.
SITECORE_CONTEXT_ID=00000000-0000-0000-0000-000000000000
# Edge Delivery token (aka API key) for Delivery API (published content)
SITECORE_API_KEY=xxxxx-xxxxx-xxxxx-xxxxx
# Delivery API (GraphQL)
SITECORE_EDGE_URL=https://edge.sitecorecloud.io/api/graphql/v1

# ===== Editing / Pages =====
# Secret used by XM Cloud Pages integration for preview/editing callbacks.
SITECORE_EDITING_SECRET=super-secret-string

# ===== Default site and language =====
NEXT_PUBLIC_DEFAULT_SITE_NAME=cws-site
NEXT_PUBLIC_DEFAULT_LANGUAGE=en

# ===== Debug logging for Content SDK (optional) =====
# DEBUG=core:*
```

> Edge endpoint & token usage validated. ([Sandeep Pote - Sitecore MVP][6])

---

### `postcss.config.js`

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

---

### `tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{ts,tsx}',
    './.storybook/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config;
```

> Tailwind + Next recommended setup. ([Sitecore Documentation][8])

---

### `src/styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Global tokens and element defaults go here */
:root {
  --brand-primary: #0b5fff;
}
```

---

### `.eslintrc.json`

```json
{
  "root": true,
  "extends": ["next/core-web-vitals"],
  "plugins": ["unicorn"],
  "rules": {
    "unicorn/filename-case": ["error", { "case": "pascalCase", "ignore": ["^next\\..+$", ".*\\.stories\\.tsx?$", ".*\\.spec\\.tsx?$"] }],
    "@next/next/no-img-element": "off"
  }
}
```

---

### `.prettierrc`

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

### `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

---

### `.storybook/main.ts`

```ts
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y'
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {}
  },
  docs: { autodocs: true }
};

export default config;
```

---

### `.storybook/preview.tsx`

```tsx
import type { Preview } from '@storybook/react';
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    nextjs: {
      // Needed when stories import components that use next/navigation (App Router)
      appDirectory: true
    },
    layout: 'centered',
    controls: { expanded: true },
    a11y: { disable: false }
  }
};

export default preview;
```

> `appDirectory: true` per Storybook’s Next.js guidance. ([Storybook][4])

---

### `playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } }
  ]
});
```

---

### `.github/playwright-agent-prompt.md`

```md
You are a Playwright test generator for the CWS Sitecore Content SDK project.

Rules:
1) Do not emit final test code until you have executed all steps using Playwright MCP tools.
2) Prefer role-based selectors and the accessibility tree; avoid XPath.
3) Use routes under /component-tests/[component] for component coverage.
4) Save generated tests to tests/ with .spec.ts extension.
5) Run tests and self-heal failures (update robust selectors) before finalizing.
6) Follow component props and states from Storybook stories when possible.
```

> Initialize agents with `npx playwright init-agents --loop=claude` (or VS Code). ([Playwright][5])

---

### `sitecore.config.ts`

```ts
import { defineConfig } from '@sitecore-content-sdk/nextjs/config';

export default defineConfig({
  // Values here override envs; see docs for precedence.
  // You can omit this object and rely on env variables if desired.
  defaultSiteName: process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME || 'cws-site',
  defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en',
  clientContextId: process.env.SITECORE_CONTEXT_ID,
  editingSecret: process.env.SITECORE_EDITING_SECRET
});
```

> Central config file for Content SDK; env fallbacks are supported. ([Sitecore Documentation][9])

---

### `sitecore.cli.config.ts`

```ts
import scConfig from './sitecore.config';
import { defineCliConfig } from '@sitecore-content-sdk/nextjs/config-cli';
import { generateSites, generateMetadata } from '@sitecore-content-sdk/nextjs/tools';

export default defineCliConfig({
  build: {
    // Runs when you call: npm run sitecore:build
    commands: [
      generateMetadata(),
      generateSites({ scConfig })
    ]
  },
  component: {
    // Optional: customize scaffolds; default templates are provided by SDK
  }
});
```

> CLI config + `project build` pipe is per Content SDK CLI docs; `defineCliConfig` import path reflects recent change. ([Sitecore Documentation][2])

---

### `.sitecore/component-map.ts`

```ts
/**
 * Component map used by XM Cloud Pages to resolve renderings to React components.
 * Add each component you want available to editors in Pages.
 */
import type { NextjsJssComponent } from '@sitecore-content-sdk/nextjs';
import * as Hero from '@/components/Hero/Hero';

export const componentMap = new Map<string, NextjsJssComponent>([
  ['Hero', Hero]
]);
```

> Component mapping file location and usage are mandated by the Content SDK. ([Sitecore Documentation][10])

---

### `src/lib/sitecore/client.ts`

```ts
import { SitecoreClient } from '@sitecore-content-sdk/core';
import scConfig from '../../../sitecore.config';

export const scClient = new SitecoreClient({
  // The client uses Context ID and env to locate the right XM Cloud resources
  clientContextId: scConfig.clientContextId,
  apiKey: process.env.SITECORE_API_KEY,
  api: {
    deliveryEndpoint: process.env.SITECORE_EDGE_URL
  },
  defaultSiteName: scConfig.defaultSiteName,
  defaultLanguage: scConfig.defaultLanguage
});
```

> SitecoreClient is the unified data client for Content & Layout across XM Cloud. ([Sitecore Documentation][11])

---

### `src/app/layout.tsx`

```tsx
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CWS – XM Cloud',
  description: 'Sitecore Content SDK + Next.js 15 App Router'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

---

### `src/app/page.tsx`

```tsx
export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-3xl font-bold">CWS – XM Cloud starter</h1>
      <p className="mt-4 text-neutral-600">
        Local-first workflow with Storybook, Playwright, and a flat component library.
      </p>
      <p className="mt-2">
        Try <code>/component-tests/hero</code> to see the first component.
      </p>
    </main>
  );
}
```

---

### `src/app/component-tests/hero/page.tsx`

```tsx
import { Hero } from '@/components/Hero/Hero';

export default function HeroTestPage() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Hero – Component Tests</h1>

      <Hero
        eyebrow="Introducing"
        title="CWS XM Cloud"
        text="A clean, component-first Next.js starter powered by the Sitecore Content SDK."
        image={{ src: 'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?w=1600', alt: 'Backdrop' }}
        primaryCta={{ label: 'Get started', href: '#' }}
        secondaryCta={{ label: 'Learn more', href: '#' }}
        align="center"
      />

      <Hero
        title="Left-aligned Hero"
        text="This variant demonstrates left alignment and no eyebrow."
        align="left"
      />
    </div>
  );
}
```

---

### `src/components/Hero/Hero.tsx`

```tsx
import * as React from 'react';

export type HeroAlign = 'left' | 'center';

export interface HeroProps {
  eyebrow?: string;
  title: string;
  text?: string;
  image?: { src: string; alt?: string };
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  align?: HeroAlign;
}

export function Hero({
  eyebrow,
  title,
  text,
  image,
  primaryCta,
  secondaryCta,
  align = 'center'
}: HeroProps) {
  const alignCls = align === 'left' ? 'text-left items-start' : 'text-center items-center';

  return (
    <section className="relative overflow-hidden rounded-xl border border-neutral-200 bg-white">
      {image?.src ? (
        // Using <img> keeps Storybook setup simple; swap to next/image if preferred.
        <img
          src={image.src}
          alt={image.alt ?? ''}
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
          loading="lazy"
        />
      ) : null}

      <div className={`mx-auto flex max-w-5xl flex-col gap-4 p-10 ${alignCls}`}>
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">{eyebrow}</p> : null}

        <h2 className="text-4xl font-extrabold leading-tight">{title}</h2>

        {text ? <p className="max-w-2xl text-lg text-neutral-700">{text}</p> : null}

        {(primaryCta || secondaryCta) && (
          <div className="mt-2 flex flex-wrap gap-3">
            {primaryCta && (
              <a
                className="rounded-md bg-blue-600 px-5 py-2 text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                href={primaryCta.href}
              >
                {primaryCta.label}
              </a>
            )}
            {secondaryCta && (
              <a
                className="rounded-md border border-neutral-300 bg-white px-5 py-2 text-neutral-900 shadow-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-300"
                href={secondaryCta.href}
              >
                {secondaryCta.label}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

Hero.displayName = 'Hero';
```

---

### `src/components/Hero/Hero.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Hero } from './Hero';

const meta = {
  title: 'Components/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
    nextjs: { appDirectory: true }
  },
  args: {
    eyebrow: 'Introducing',
    title: 'CWS XM Cloud',
    text: 'A clean, component-first Next.js starter powered by the Sitecore Content SDK.',
    image: {
      src: 'https://images.unsplash.com/photo-1529101091764-c3526daf38fe?w=1600',
      alt: 'Backdrop'
    },
    primaryCta: { label: 'Get started', href: '#' },
    secondaryCta: { label: 'Learn more', href: '#' }
  },
  tags: ['autodocs']
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LeftAligned: Story = {
  args: {
    align: 'left',
    eyebrow: undefined,
    title: 'Left-aligned Hero',
    text: 'No eyebrow; alignment set to left.',
    secondaryCta: undefined
  }
};

export const NoImage: Story = {
  args: {
    image: undefined
  }
};
```

---

### `src/components/Hero/Hero.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test.describe('Hero component test page', () => {
  test('renders title and CTAs', async ({ page }) => {
    await page.goto('/component-tests/hero');
    await expect(page.getByRole('heading', { name: 'CWS XM Cloud' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();
  });
});
```

---

### `src/components/index.ts`

```ts
export { Hero } from './Hero/Hero';
```

---

### `src/app/[...path]/page.tsx`  *(placeholder for Phase 2)*

```tsx
// Placeholder dynamic route; wire to XM Cloud Layout Service later.
export default function DynamicRoute() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <h1 className="text-2xl font-bold">Dynamic route</h1>
      <p className="mt-4 text-neutral-700">
        This catch-all route will be connected to Sitecore layout data in Phase 2.
      </p>
    </main>
  );
}
```

---

## Optional (next step when ready)

* Initialize the official app template (if you prefer scaffolding from CLI and diff‑in your files):

  ```bash
  npx create-content-sdk-app
  ```

  Then copy over this repo’s `components`, Storybook, Playwright, and config changes as needed. ([GitHub][1])
* Generate/refresh the component map automatically during dev:

  ```bash
  npm run sitecore:component:map:watch
  ```

  This uses the CLI’s generate‑map feature. ([Sitecore Documentation][2])

---

### What’s wired vs. pending (quick checklist)

* ✅ Local, Sitecore‑agnostic workflow (Next.js, Tailwind, Storybook, Playwright).
* ✅ Sitecore Content SDK config and CLI ready (`sitecore.config.ts`, `sitecore.cli.config.ts`, `.sitecore/component-map.ts`). ([Sitecore Documentation][2])
* ✅ Example component with stories and tests (`Hero`).
* ⏳ XM Cloud wiring (Layout Service fetch, Pages editing mode) — add once credentials are provided; the client and env scaffolding are in place. ([Sitecore Documentation][11])

If you want, I can also emit **shell commands** that create each file on disk (with `cat <<'EOF' > path`) so the agent can run a single script to materialize the repo.

[1]: https://github.com/Sitecore/content-sdk "GitHub - Sitecore/content-sdk: The Content SDK to support building sites with XM Cloud"
[2]: https://doc.sitecore.com/xmc/en/developers/content-sdk/cli-commands-and-configuration.html?utm_source=chatgpt.com "CLI commands and configuration"
[3]: https://github.com/Sitecore/content-sdk/releases "Releases · Sitecore/content-sdk · GitHub"
[4]: https://storybook.js.org/docs/get-started/frameworks/nextjs "Storybook for Next.js | Storybook docs"
[5]: https://playwright.dev/docs/test-agents "Agents | Playwright"
[6]: https://sandeeppote.com/2025/04/09/use-experience-edge-graphql-to-access-xm-cloud-hosted-site/?utm_source=chatgpt.com "Use Experience Edge GraphQL to access XM Cloud hosted site"
[7]: https://nextjs.org/docs/app/api-reference/config/next-config-js?utm_source=chatgpt.com "Configuration: next.config.js"
[8]: https://doc.sitecore.com/xmc/en/developers/content-sdk/create-a-content-sdk-app-locally.html?utm_source=chatgpt.com "Create a Content SDK app locally"
[9]: https://doc.sitecore.com/xmc/en/developers/content-sdk/the-sitecore-configuration-file.html?utm_source=chatgpt.com "The Sitecore configuration file"
[10]: https://doc.sitecore.com/xmc/en/developers/content-sdk/register-a-component-in-the-component-map.html "Register a component in the component map | Sitecore Documentation"
[11]: https://doc.sitecore.com/xmc/en/developers/content-sdk/the-sitecoreclient-api.html?utm_source=chatgpt.com "The SitecoreClient API"

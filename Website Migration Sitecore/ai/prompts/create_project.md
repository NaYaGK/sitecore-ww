
# Sitecore XM Cloud + Next.js Project Setup — **Technical Specification (Agent‑Executable)**

## Role & Context

You are a **Senior Sitecore Architect** and **Full‑Stack Developer** with expertise in:

* Sitecore **XM Cloud** and **Content SDK**
* **Next.js 15** App Router
* **Storybook** for component‑driven development
* **Playwright Test Agents** (MCP loop) for AI‑assisted testing
* Modern DevOps and CI/CD

**Project**: Build a scalable Sitecore XM Cloud front end for **CWS** using **Sitecore Content SDK** (not JSS), **Next.js 15 App Router**, and a **local‑first** development workflow that later connects to XM Cloud.

---

## Critical Requirements

### Technology Stack (verified)

* **Sitecore**: Content SDK (latest; initialize with official `create-content-sdk-app` CLI) ([Sitecore Documentation][1])
* **Frontend**: **Next.js 15** with **App Router** (stable) ([Next.js][2])
* **Language**: TypeScript (**strict**)
* **Styling**: Tailwind CSS (Next.js guide) ([Tailwind CSS][7])
* **Component Library**: Storybook **8/9** with `@storybook/nextjs` and App Router support via `appDirectory` parameter ([Storybook][3])
* **Testing**: Playwright **Test Agents** (MCP loop) + standard Playwright tests (TS) ([Playwright][4])
* **Package Manager**: `npm`

### Development Phases

1. **Phase 1**: Local component library (Storybook) + Next.js app shell (no Sitecore dependency).
2. **Phase 2**: Wire to **XM Cloud** (Experience Edge GraphQL) + enable editing in Pages.
3. **Phase 3**: CI/CD & deployments.

---

## Research & Discovery (one‑time tasks)

> Agent: perform these **before coding**, save notes in `/docs/research.md`.

* [ ] Read **Content SDK** docs (overview, getting started, changelog, CLI) and note differences vs. JSS; attach links. ([Sitecore Documentation][8])
* [ ] Review **Next.js 15 App Router** patterns and **optional catch‑all** routing for Sitecore pages (`app/[[...path]]/page.tsx`). ([Next.js][9])
* [ ] Confirm **Component Map** usage and location `.sitecore/component-map.ts`. ([Sitecore Documentation][6])
* [ ] Record **Experience Edge** limitations (no persisted queries; no mixing literals + variables). ([Sitecore Documentation][5])
* [ ] Decide **SSR vs SSG** per route (document trade‑offs for pages/components).

---

## Implementation Task List

### Phase 1 — Project Initialization & Local Setup

#### Task 1.1 — Bootstrap a Content SDK + Next.js 15 App

```bash
# Create a Content SDK app (Next.js starter)
npx create-content-sdk-app@latest nextjs

# Follow prompts; when asked for project name, use:
# > cws-xm-cloud-app

cd cws-xm-cloud-app
npm install
git init
```

**Acceptance**

* [x] App uses **App Router** under `/src/app/`.
* [x] TypeScript configured (`"strict": true`).
* [x] Starter includes Content SDK config files (`sitecore.config.ts`, `sitecore.cli.config.ts`). ([Sitecore Documentation][10])
* [ ] Provide `.env.local` from `.env.remote.example` (don’t commit). ([Sitecore Documentation][11])

**Recommended folder layout (flat components)**:

```
cws-xm-cloud-app/
├── .sitecore/
│   └── component-map.ts          # Component Map (Content SDK)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── component-tests/      # Local-only test routes
│   │   └── [[...path]]/page.tsx  # Optional catch-all for Sitecore pages
│   ├── components/               # Flat component folders
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Header/
│   │   ├── Hero/
│   │   └── ...
│   ├── lib/
│   │   ├── sitecore/             # client, queries, helpers
│   │   └── utils/
│   ├── styles/
│   └── types/
├── public/
├── .storybook/
├── tests/
└── specs/                        # For Playwright Agents plans
```

* Use **optional catch‑all** `[[...path]]` to also match `/` for Sitecore‑backed pages. ([Next.js][9])

#### Task 1.2 — Dev Tooling (ESLint, Prettier, Husky)

```bash
npm i -D eslint eslint-config-next @typescript-eslint/parser prettier husky lint-staged eslint-plugin-unicorn
npx husky init
```

* [x] Pre-commit: `lint-staged` runs `eslint --fix` + `prettier --write`.

#### Task 1.3 — Tailwind CSS

```bash
# If the starter didn’t add Tailwind, add it now:
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

* [x] Configure per Tailwind/Next guide; ensure `globals.css` imports Tailwind and that Storybook preview imports the same CSS (see Task 1.4). ([Tailwind CSS][7])

#### Task 1.4 — Storybook (App Router‑aware)

```bash
# Official init (Storybook 8/9)
npm create storybook@latest
```

* [x] Framework: `@storybook/nextjs` (or `@storybook/nextjs-vite` if you prefer Vite)
* [x] In `.storybook/main.ts`, ensure:

```ts
import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials','@storybook/addon-interactions','@storybook/addon-a11y'],
  framework: { name: '@storybook/nextjs', options: {} },
};
export default config;
```

* [x] In `.storybook/preview.ts` set App Router support & Tailwind CSS:

```ts
import type { Preview } from '@storybook/react';
// Import Tailwind/global styles once for all stories:
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    nextjs: { appDirectory: true }, // App Router support
    layout: 'centered'
  },
};
export default preview;
```

* [x] If components call `next/navigation`, Storybook provides mocks automatically via `@storybook/nextjs` when `appDirectory` is true. ([Storybook][3])

#### Task 1.5 — Component Templates

Create scaffolding templates to keep new components consistent.

`src/components/_templates/ComponentName/ComponentName.tsx`

```tsx
import { FC } from 'react';

export interface ComponentNameProps {
  // define props
}
export const ComponentName: FC<ComponentNameProps> = (props) => {
  return <div>{/* TODO */}</div>;
};
ComponentName.displayName = 'ComponentName';
```

`src/components/_templates/ComponentName/ComponentName.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './ComponentName';

const meta: Meta<typeof ComponentName> = {
  title: 'Components/ComponentName',
  component: ComponentName,
  parameters: { layout: 'centered', nextjs: { appDirectory: true } },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
```

---

### Phase 2 — Component Development (local-first)

#### Task 2.1 — Use Content SDK CLI to Scaffold Components

Prefer **Content SDK CLI** over custom scripts, so output matches expected patterns.

```bash
# Example: scaffold a component
npx sitecore-tools project component scaffold Card

# BYOC example (if needed later):
npx sitecore-tools project component scaffold MyBYOCComponent --byoc
```

* Out-of-the-box templates place components under `src/components/`.
* You can define custom templates in `sitecore.cli.config.ts` (scaffold section). ([Sitecore Documentation][12])

#### Task 2.2 — Keep a Flat Component Tree

For each component:

```
src/components/ComponentName/
├── ComponentName.tsx
├── ComponentName.stories.tsx
├── ComponentName.spec.ts      # Playwright test (seed later)
├── types.ts                    # as needed
└── README.md                   # optional
```

Checklist:

* [ ] Props typed, defaults sensible
* [ ] **A11y**: keyboard/focus, ARIA
* [ ] Variants and responsive states covered in stories
* [x] Tailwind used for styling

#### Task 2.3 — Local Test Pages (optional)

Create quick Next pages for manual QA (independent of Sitecore):

```
src/app/component-tests/card/page.tsx
```

```tsx
import { Card } from '@/components/Card/Card';
export default function CardTestPage() {
  return (
    <main className="p-8 space-y-8">
      <h1>Card Tests</h1>
      <Card title="Sample" description="..." />
    </main>
  );
}
```

#### Task 2.4 — Component Index (barrel)

```ts
// src/components/index.ts
export { Card } from './Card/Card';
// ...export others here
```

---

### Phase 3 — Playwright + **Test Agents** (MCP loop)

> These steps wire AI agents to plan → generate → heal tests. Store plans in `/specs/` and generated tests in `/tests/`. ([Playwright][4])

#### Task 3.1 — Install & Initialize

```bash
npm i -D @playwright/test
npx playwright install

# Initialize Test Agents (choose a loop you will actually use)
npx playwright init-agents --loop=claude   # or --loop=vscode / --loop=opencode
```

* This creates `.github/` agent definitions, `specs/` (plans), and `tests//seed.spec.ts`. ([Playwright][4])

#### Task 3.2 — Seed + Prompting

Create/adjust `.github/playwright-agent-prompt.md`:

```markdown
You are a Playwright test generator for the CWS Content SDK + Next.js app.

Rules:
1) Use the Planner → Generator → Healer agent flow.
2) Use routes under /component-tests/[component] for story parity.
3) Prefer getByRole/getByLabel over XPath.
4) Save Markdown plans under /specs and TS tests under /tests.
5) Iterate with the Healer until passing or skipped with reason.
```

Run agents from your IDE’s AI client (Claude Code / VS Code) per Playwright docs. ([Playwright][4])

---

### Phase 4 — Connect to XM Cloud (when credentials available)

> This phase can be **skipped initially**. Keep the app fully functional locally without Sitecore; then toggle the `.env.local` to connect.

#### Task 4.1 — Environment Variables

* Copy `.env.remote.example` → `.env.local` and fill **minimum** vars for Experience Edge (values come from XM Cloud **Developer settings**):

  * `SITECORE_EDGE_CONTEXT_ID=<context id>`
  * `SITECORE_API_KEY=<edge api key>`
  * `SITECORE_SITE_NAME=<site name>` (used by some templates/tools)
* Content SDK examples ship `.env.*.example` files; use them as templates. ([Sitecore Documentation][11])
* Note: If you must fetch Edge data **client‑side**, you’d expose the context ID via `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID` (discouraged—treat as a secret). ([Sitecore Documentation][13])
* Edge base endpoint: `https://edge.sitecorecloud.io/api/graphql/v1` (header `sc_apikey:` or product‑specific header per docs). **Avoid persisted queries—unsupported.** ([Sitecore Documentation][14])

#### Task 4.2 — Sitecore Client & GraphQL

Create `src/lib/sitecore/client.ts` to wrap Content SDK/GraphQL fetches. Use Delivery API for published content. ([Sitecore Documentation][14])

#### Task 4.3 — Component Map

* Register renderings → components in `.sitecore/component-map.ts`.
* Manual registration example (simplified):

```ts
// .sitecore/component-map.ts
import * as Card from 'src/components/Card/Card';
export const componentMap = new Map<string, any>([
  ['Card', Card],
]);
```

* Optionally enable **auto generation** (generate on build and in watch mode):

```jsonc
// package.json (scripts)
"sitecore-tools:generate-map": "sitecore-tools project component generate-map",
"sitecore-tools:generate-map:watch": "sitecore-tools project component generate-map --watch",
"build": "npm-run-all --serial sitecore-tools:generate-map sitecore-tools:build next:build",
"dev": "npm-run-all --serial sitecore-tools:build --parallel next:dev sitecore-tools:generate-map:watch"
```

* Add in `sitecore.cli.config.ts`:

```ts
export default defineCliConfig({
  build: { commands: [generateMetadata(), generateSites({ scConfig: config })] },
  componentMap: { paths: ['src/components'], exclude: ['src/components/content-sdk/*'] }
});
```

([Sitecore Documentation][15])

#### Task 4.4 — Routing to Sitecore pages

* Implement `app/[[...path]]/page.tsx` that:

  1. Fetches layout data (Edge) for the requested path,
  2. Resolves renderings → components via the **Component Map**,
  3. Renders placeholders/fields using Content SDK helpers.
* Use **optional catch‑all** so `/` resolves without a separate home route. ([Next.js][9])

> Note on queries: Edge forbids persisted queries; keep standard GraphQL requests and **do not mix** literals and variables in the same query. If using variables, make all values variables. ([Sitecore Documentation][5])

---

### Phase 5 — Testing

#### Task 5.1 — Component tests (Playwright)

Create simple smoke tests per component:

```ts
// tests/components/Card.spec.ts
import { test, expect } from '@playwright/test';
test('Card renders', async ({ page }) => {
  await page.goto('/component-tests/card');
  await expect(page.getByRole('heading', { name: /card/i })).toBeVisible();
});
```

#### Task 5.2 — Agentic tests

* Use **Planner** to produce `/specs/*.md`, **Generator** to emit tests in `/tests`, and **Healer** to fix failing selectors. ([Playwright][4])

---

### Phase 6 — CI (basic)

`.github/workflows/ci.yml`

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 'lts/*' }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check || true
      - run: npx playwright install --with-deps
      - run: npm test
```

---

## Agent Details & Commands (cheat‑sheet)

### Bootstrap

```bash
npx create-content-sdk-app@latest nextjs
cd cws-xm-cloud-app
npm i
git init
```

([Sitecore Documentation][1])

### Dev tools & Storybook

```bash
npm i -D eslint eslint-config-next @typescript-eslint/parser prettier husky lint-staged eslint-plugin-unicorn
npx husky init

npm create storybook@latest
```

([Storybook][3])

### Tailwind (if not included by starter)

```bash
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

([Tailwind CSS][7])

### Playwright + Agents

```bash
npm i -D @playwright/test
npx playwright install
npx playwright init-agents --loop=claude
```

([Playwright][4])

### Content SDK CLI (scaffold & component map)

```bash
# Generate component files
npx sitecore-tools project component scaffold Hero

# Optional: auto-generate map (build/dev scripts use it)
npx sitecore-tools project component generate-map --watch
```

([Sitecore Documentation][12])

---

## Acceptance Criteria (Phase‑1 local)

* ✅ Next.js 15 App Router initialized; dev server runs. ([Next.js][2])
* ✅ Storybook runs; components render with **App Router** mocks and Tailwind styles. ([Storybook][3])
* ✅ Playwright installed; **Test Agents** initialized; a seed test and one generated test pass. ([Playwright][4])
* ✅ At least **5 components** scaffolded via Content SDK CLI and registered in `.sitecore/component-map.ts` (manual or generated). ([Sitecore Documentation][6])
* ✅ Optional route `app/[[...path]]/page.tsx` exists for future XM Cloud layout rendering. ([Next.js][9])

---

## Notes you (and the agent) must respect

* **Do not** rely on persisted GraphQL queries on Experience Edge; they are **not supported**. Build standard queries, and if you use variables, **don’t mix** literals in the same query. ([Sitecore Documentation][5])
* Content SDK favors an explicit **Component Map** in `.sitecore/component-map.ts`. You can generate it automatically during `dev` and `build` via `sitecore-tools project component generate-map`. ([Sitecore Documentation][6])
* Storybook’s App Router support is a **parameter** (`nextjs.appDirectory: true`) in **preview**; it is **not** a setting in `main.ts`. ([Storybook][3])
* Keep **secrets** out of client bundles. Only expose public vars with `NEXT_PUBLIC_` if absolutely necessary (e.g., demos). ([Sitecore Documentation][13])

---

## Useful links (keep in repo as `/docs/links.md`)

* **Content SDK – Getting started / Create app**: `npx create-content-sdk-app@latest nextjs` ([Sitecore Documentation][1])
* **Content SDK – Component Map** (location, manual registration) ([Sitecore Documentation][6])
* **Content SDK – CLI (scaffold, build, generate‑map)** ([Sitecore Documentation][12])
* **Experience Edge Delivery API (GraphQL endpoint)** ([Sitecore Documentation][14])
* **Experience Edge limitations (no persisted queries)** ([Sitecore Documentation][5])
* **Next.js 15 release notes** (App Router stable) ([Next.js][2])
* **App Router dynamic/optional catch‑all** ([Next.js][9])
* **Storybook for Next.js (App Router support, mocks)** ([Storybook][3])
* **Tailwind + Next.js** (official guide) ([Tailwind CSS][7])
* **Playwright Test Agents** (Planner/Generator/Healer, `init-agents`) ([Playwright][4])

---

## Minimal `.env.local` template (to be filled when connecting to XM Cloud)

```
# XM Cloud / Experience Edge (published content)
SITECORE_EDGE_CONTEXT_ID=xxx
SITECORE_API_KEY=xxx
SITECORE_SITE_NAME=cws-site

# Only if you knowingly expose context ID on client (discouraged)
# NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID=xxx
```

* Populate these from XM Cloud **Developer settings** in the target environment. ([Sitecore Documentation][16])

---

## Example code snippets (copy‑paste safe)

**Storybook `main.ts`**

```ts
import type { StorybookConfig } from '@storybook/nextjs';
const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials','@storybook/addon-interactions','@storybook/addon-a11y'],
  framework: { name: '@storybook/nextjs', options: {} },
};
export default config;
```

**Storybook `preview.ts` (App Router + Tailwind)**

```ts
import type { Preview } from '@storybook/react';
import '../src/styles/globals.css';
const preview: Preview = {
  parameters: { nextjs: { appDirectory: true }, layout: 'centered' },
};
export default preview;
```

([Storybook][3])

**Optional catch‑all page** (`src/app/[[...path]]/page.tsx`)

```tsx
export default async function SitecoreRoutedPage() {
  // Phase 2: fetch layout by path via Experience Edge
  return <main>Coming soon: Sitecore‑routed page</main>;
}
```

([Next.js][9])

**Manual component registration** (`.sitecore/component-map.ts`)

```ts
import * as Card from 'src/components/Card/Card';
export const componentMap = new Map<string, any>([['Card', Card]]);
```

([Sitecore Documentation][6])

---

## Context (CWS Program)

This setup aligns with the **Phase‑1 deliverables** and roles captured in the internal CWS migration outline you shared (capacity, AI ramp, and component factory focus). 

---

**Done.** This is ready to paste into your coding agent. If you want, I can also emit the repository scaffold (package.json scripts, base configs, and a first component) as files in a follow‑up.

[1]: https://doc.sitecore.com/xmc/en/developers/content-sdk/create-a-content-sdk-app-locally.html?utm_source=chatgpt.com "Create a Content SDK app locally"
[2]: https://nextjs.org/blog/next-15?utm_source=chatgpt.com "Next.js 15"
[3]: https://storybook.js.org/docs/get-started/frameworks/nextjs "Storybook for Next.js | Storybook docs"
[4]: https://playwright.dev/docs/test-agents "Agents | Playwright"
[5]: https://doc.sitecore.com/xmc/en/developers/xm-cloud/limitations-and-restrictions-of-experience-edge.html?utm_source=chatgpt.com "Limitations and restrictions of Experience Edge"
[6]: https://doc.sitecore.com/xmc/en/developers/content-sdk/register-a-component-in-the-component-map.html?utm_source=chatgpt.com "Register a component in the component map"
[7]: https://tailwindcss.com/docs/guides/nextjs?utm_source=chatgpt.com "Install Tailwind CSS with Next.js"
[8]: https://doc.sitecore.com/xmc/en/developers/content-sdk/sitecore-content-sdk-for-xm-cloud.html?utm_source=chatgpt.com "Sitecore Content SDK for XM Cloud"
[9]: https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes?utm_source=chatgpt.com "Dynamic Route Segments"
[10]: https://doc.sitecore.com/xmc/en/developers/content-sdk/the-sitecore-configuration-file.html?utm_source=chatgpt.com "The Sitecore configuration file"
[11]: https://doc.sitecore.com/xmc/en/developers/content-sdk/example-environment-variable-files.html?utm_source=chatgpt.com "Example environment variable files"
[12]: https://doc.sitecore.com/xmc/en/developers/content-sdk/cli-commands-and-configuration.html "CLI commands and configuration | Sitecore Documentation"
[13]: https://doc.sitecore.com/xmc/en/developers/content-sdk/migrate-jss-22-8-next-js-apps-to-content-sdk-1-0.html?utm_source=chatgpt.com "Migrate JSS 22.8 Next.js apps to Content SDK 1.0"
[14]: https://doc.sitecore.com/ch/en/developers/cloud-dev/delivery-api.html?utm_source=chatgpt.com "Delivery API"
[15]: https://doc.sitecore.com/xmc/en/developers/content-sdk/upgrade-content-sdk-0-2-0-next-js-apps-to-version-0-3-0.html?utm_source=chatgpt.com "Upgrade Content SDK 0.2.0 Next.js apps to version 0.3.0"
[16]: https://doc.sitecore.com/xmc/en/developers/content-sdk/connect-your-content-sdk-app-to-xm-cloud.html?utm_source=chatgpt.com "Connect your Content SDK app to XM Cloud"

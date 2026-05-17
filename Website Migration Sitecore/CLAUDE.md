# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Drupal → Sitecore XM Cloud migration** for CWS's workwear and healthcare sections. The project uses **Next.js 14** with the **Sitecore Content SDK**, Content Hub for products/assets, Sitecore Search, and XM Cloud Forms integrated with Salesforce via Sitecore Connect.

**Key Architecture:**
- **Content Delivery:** Experience Edge Delivery GraphQL (read-only, authenticated via `sc_apikey`)
- **Content Authoring/ETL:** Authoring & Management GraphQL API for content import and publishing
- **Products/Assets:** Content Hub Experience Edge (Preview & Delivery GraphQL)
- **Search:** Sitecore Search React JS SDK
- **Forms → CRM:** XM Cloud Forms → Sitecore Connect (Workato) → Salesforce
- **Hosting:** Vercel with ISR (Incremental Static Regeneration)
- **Coexistence:** Next.js Middleware + Vercel rewrites proxy legacy Drupal routes during migration

**Important Constraints:**
- Experience Edge does NOT support persisted queries—use well-structured parameterized queries
- READ from Experience Edge Delivery GraphQL; MUTATE only via Authoring & Management GraphQL API
- Never push secrets, API keys, or PII to the repository

## Common Development Commands

All commands run from `cws-xm-cloud-app/` directory:

```bash
# Development
npm run dev                  # Start Next.js dev server (localhost:3000)
npm run story                # Start Storybook (localhost:6006)

# Building & Testing
npm run build                # Build Next.js app (runs sitecore:build first)
npm test                     # Run Playwright E2E tests
npm run test:ui              # Run Playwright tests with UI
npm run type-check           # Run TypeScript type checking
npm run lint                 # Run ESLint
npm run format               # Format code with Prettier

# Sitecore Commands
npm run sitecore:component:scaffold       # Scaffold new Sitecore components
npm run sitecore:component:map            # Generate component map
npm run sitecore:component:map:watch      # Watch mode for component map
npm run sitecore:build                    # Build Sitecore project (requires env vars)

# Storybook
npm run story:build          # Build Storybook for deployment
```

**Prerequisites:**
- Node.js >= 18.18.0
- Environment variables configured (copy `.env.remote.example` to `.env.local`)

**Required Environment Variables:**
- `SITECORE_EDGE_CONTEXT_ID` - XM Cloud context ID
- `SITECORE_API_KEY` - API key for Experience Edge
- `SITECORE_SITE_NAME` - Site name (default: cws-site)
- `SITECORE_EDITING_SECRET` - Secret for Pages editor integration

## Code Architecture

### Component Pattern (Locality of Behavior)

Components follow a strict pattern for XM Cloud integration:

**Structure:**
- One file per component: `ComponentName.tsx` containing all variants
- Props extend `ComponentProps` from `@/lib/component-props`
- Access datasource via `fields.data.datasource` pattern
- Export named variants: `Default`, `ThreeUp`, `Slider`, etc.

**Example Component:**
```typescript
import { useSitecore, Text, RichText, Image } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { NoDataFallback } from '@/utils/NoDataFallback';

interface HeroFields {
  title?: { jsonValue: Field<string> };
  description?: { jsonValue: Field<string> };
  backgroundImage?: { jsonValue: ImageField };
}

interface HeroProps extends ComponentProps {
  params: { [key: string]: any };
  fields: {
    data: {
      datasource: HeroFields;
    };
  };
  isPageEditing?: boolean;
}

// Named export for variant
export const Default: React.FC<HeroProps> = (props) => {
  const { page } = useSitecore();
  const { isEditing } = page.mode;
  return <HeroDefault {...props} isPageEditing={isEditing} />;
};

const HeroDefault: React.FC<HeroProps> = ({ fields, params, isPageEditing }) => {
  // Always validate datasource
  if (!fields?.data?.datasource) {
    return <NoDataFallback componentName="Hero" />;
  }

  const { title, description, backgroundImage } = fields.data.datasource;

  return (
    <section>
      {title?.jsonValue && (
        <Text tag="h1" field={title.jsonValue} className="text-4xl font-bold" />
      )}
      {description?.jsonValue && (
        <RichText field={description.jsonValue} />
      )}
      {backgroundImage?.jsonValue && (
        <Image field={backgroundImage.jsonValue} alt={title?.jsonValue?.value || ''} />
      )}
    </section>
  );
};
```

**Key Patterns:**
- Always check `fields?.data?.datasource` existence before rendering
- Use `NoDataFallback` component for missing datasources
- Access field values through `.jsonValue` property
- Use Sitecore field components (`Text`, `RichText`, `Image`, `Link`) from `@sitecore-content-sdk/nextjs`
- Pass `isPageEditing` prop to handle editing vs. preview modes differently

### Sitecore Content SDK Import Rules

**CRITICAL:** The Sitecore Content SDK has submodules that are restricted to specific contexts:

**✅ Client-Safe (Components & Client Code):**
```typescript
import {
  Text, RichText, Image, Link,
  Field, LinkField, ImageField,
  useSitecore, SitecoreProvider, Placeholder
} from '@sitecore-content-sdk/nextjs';
```

**✅ Middleware (Edge Runtime):**
```typescript
import { LocalizationMiddleware, RedirectsMiddleware } from '@sitecore-content-sdk/nextjs/middleware';
```

**❌ NEVER in Client Components (Server-Only):**
```typescript
// These will cause build errors if used in components:
import { defineConfig } from '@sitecore-content-sdk/nextjs/config';
import { SitecoreClient } from '@sitecore-content-sdk/nextjs/client';
import { defineCliConfig } from '@sitecore-content-sdk/nextjs/config-cli';
import { generateSites } from '@sitecore-content-sdk/nextjs/tools';
```

**Where to Use Server-Only Imports:**
- `sitecore.config.ts` - Use `/config` submodule
- `sitecore.cli.config.ts` - Use `/config-cli` and `/tools` submodules
- `lib/sitecore-client.ts` - Use `/client` submodule
- API routes - Use `/middleware`, `/editing`, `/monitoring` submodules

### Directory Structure

```
cws-xm-cloud-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   └── [[...path]]/        # Catch-all route for Sitecore pages
│   ├── components/             # React components (30-40 components)
│   │   └── ComponentName/      # Kebab-case directory
│   │       ├── ComponentName.tsx
│   │       ├── ComponentName.module.scss
│   │       └── component-name.props.ts
│   ├── lib/                    # Utilities and configuration
│   │   ├── component-props/    # Shared component prop types
│   │   ├── sitecore-client.ts  # Sitecore client setup
│   │   └── utils.ts            # cn() utility and helpers
│   ├── mocks/                  # Mock data for Storybook stories
│   │   └── components/         # Component-specific mocks
│   ├── utils/                  # Shared utilities
│   │   └── NoDataFallback.tsx  # Fallback for missing datasources
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   └── styles/                 # Global styles
├── .storybook/                 # Storybook configuration
├── sitecore.config.ts          # Sitecore SDK configuration
└── playwright.config.ts        # Playwright test configuration
```

### Styling and UI

- **Tailwind CSS** for all styling (utility-first approach)
- **Radix UI** primitives for accessible components (`@radix-ui/*`)
- **Shadcn/ui** component library in `src/components/ui/`
- **Framer Motion** for animations (check `prefers-reduced-motion`)
- Use `cn()` utility from `@/lib/utils` for conditional classes

**Component CSS Pattern:**
```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  '@container bg-primary rounded-default',
  'relative mx-auto my-6 max-w-7xl px-4 py-16',
  isActive && '@md:w-full'
)}>
```

### Testing Strategy

**Unit Tests:** 80% coverage for new code
**E2E Tests:** Playwright smoke tests on top routes (run via `npm test`)
**Accessibility:** WCAG-AA compliance via axe (integrated in Storybook)
**Performance:** Lighthouse CI on P0 templates (TTFB <1s, LCP <2.5s)

**Run Single Test:**
```bash
npx playwright test tests/example.spec.ts
```

### Storybook for Component Development

**What is Storybook:** UI workbench for building, testing, and documenting components in isolation. Each component state (e.g., "Hero with long title", "empty results") is captured as a "story".

**Benefits:**
- Living catalog of all components available in XM Cloud
- Accelerates accessibility/performance checks
- Provides designers, content authors, and QA with visual reference
- Reduces surprises during content migration

**Story Pattern:**
```typescript
// ComponentName.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Default as Component } from './ComponentName';
import { mockComponentData } from '@/mocks/components/componentName';

const meta: Meta<typeof Component> = {
  title: 'Components/ComponentName',
  component: Component,
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Default: Story = {
  args: mockComponentData,
};

export const WithLongTitle: Story = {
  args: {
    ...mockComponentData,
    fields: {
      data: {
        datasource: {
          title: { jsonValue: { value: 'This is a very long title...' } },
        },
      },
    },
  },
};
```

### Git Workflow (DMZ Pattern - Planned)

**Current:** Standard feature branch workflow to `main`

**Planned DMZ Workflow:**
- Fork repository for personal workspace
- Create feature branches from `main` in your fork
- Push changes to fork, create PR to `dmz` branch in upstream
- PRs merged to `dmz` after review
- CI validates `dmz` branch HEAD with full build
- If clean, CI automatically fast-forwards `main` to `dmz` HEAD
- If build fails, changes can be reverted from `dmz` by rebasing

**Commit Convention:**
- Use Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- Keep PRs focused; reference issues (`Closes #123`)

## AI-Assisted Development

The project supports AI-assisted development for repetitive tasks. See `requirements/implementation_plan.md` sections 8-9 for detailed guidelines.

**Supported AI Tasks:**
- Component scaffolding (use `npm run sitecore:component:scaffold`)
- ETL transform generation
- GraphQL query generation
- Test automation

**Key Rules:**
1. Never generate/commit secrets, API keys, or PII
2. READ from Experience Edge Delivery GraphQL only
3. MUTATE via Authoring & Management GraphQL API only
4. No persisted queries on Experience Edge (not supported)
5. Prefer ISR over SSR where possible
6. All AI output must pass type checks, tests, and PR review

## Important Files

- **`sitecore.config.ts`** - Sitecore SDK configuration with environment variables
- **`AGENTS.md`** - Repository-wide guidelines and conventions
- **`requirements/implementation_plan.md`** - Comprehensive Phase-1 plan with RACI and work plan
- **`requirements/Component Matrix.xlsx`** - Drupal → XM component mapping
- **`ai/prompts/`** - AI prompt templates for component generation

## Performance & Caching

- **ISR (Incremental Static Regeneration)** with on-demand revalidation
- Use SSR only where necessary (dynamic content that cannot be cached)
- Vercel Edge Config for redirects and feature flags
- Next.js Middleware handles geo/locale/redirect logic

## Localization

- 21-locale framework with top locales at launch
- Use `next-localization` for i18n
- English (en) and Canadian English (en-CA) supported by default
- Dictionary-based translations at `@/variables/dictionary`

## Key Resources

- [Sitecore Content SDK Docs](https://doc.sitecore.com/xmc/en/developers/content-sdk/sitecore-content-sdk-for-xm-cloud.html)
- [Experience Edge](https://doc.sitecore.com/xmc/en/developers/xm-cloud/experience-edge.html)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Storybook Docs](https://storybook.js.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

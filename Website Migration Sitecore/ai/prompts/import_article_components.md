# Implement Article Starter Components in `cws-xm-cloud-app`

## Context
- Reference implementation lives in `xmcloud-starter-js-main/examples/kit-nextjs-article-starter`.
- Target project is `cws-xm-cloud-app` (Next.js 15 App Router, Tailwind, Storybook, Playwright).
- Goal: Port every component under `src/components/**` from the starter into the target project, including supporting utilities that reside outside that folder, and fully wire them into Storybook with realistic mock data.
- Constraints: Preserve existing functionality, stay TypeScript strict, and avoid breaking current build/test workflows.

## Component & Dependency Inventory
- Component directories to port:  
  `accordion-block`, `alert-banner`, `animated-section`, `article-header`, `article-listing`, `background-thumbnail`, `breadcrumbs`, `button-component`, `card`, `container` (and subfolders), `content-sdk`, `cta-banner`, `flex`, `floating-dock`, `footer-navigation-callout`, `global-footer`, `global-header`, `hero`, `icon`, `image`, `logo`, `logo-tabs`, `magicui`, `media-section`, `mode-toggle`, `multi-promo`, `multi-promo-tabs`, `page-header`, `portal`, `promo-animated`, `promo-block`, `rich-text-block`, `secondary-navigation`, `site-metadata`, `subscription-banner`, `sxa`, `testimonial-carousel`, `text-banner`, `theme-provider`, `topic-listing`, `ui`, `vertical-image-accordion`, `video`.
- Supporting modules likely required: `contexts`, `enumerations`, `hooks`, `lib`, `types`, `utils`, `variables`, assets under `src/assets`, plus any additional imports encountered.
- External npm packages referenced include Radix UI primitives, `framer-motion`, `embla-carousel-react`, `lucide-react`, `react-hook-form`, `react-day-picker`, `recharts`, `tailwind-merge`, `class-variance-authority`, `cmdk`, `sonner`, `vaul`, `focus-trap-react`, `input-otp`, `react-resizable-panels`, Font Awesome icon packs, and others. Bring only what is actually used.

## Deliverables Checklist
- [ ] All components and helpers from the starter exist in `cws-xm-cloud-app/src/**`, aligned with local naming conventions and re-exported via `src/components/index.ts`.
- [ ] Each component has a Storybook story leveraging realistic mock data or args, independent of Sitecore runtime.
- [ ] Starter `.dev` or `.meta` helpers are either converted into Storybook stories or otherwise incorporated.
- [ ] Shared utilities (hooks, contexts, enums, types, utils) are ported/adapted without breaking existing codebase assumptions.
- [ ] `package.json` and lockfile list all newly required dependencies; lint, type-check, build, Storybook, and test commands pass.

## Task Plan

### 1. Repo Analysis
- [ ] Inspect starter component tree and supporting folders to map dependencies (aliases, contexts, utilities, CSS).
- [ ] List third-party packages required by the components; note which already exist in `cws-xm-cloud-app`.
- [ ] Record configuration expectations (Tailwind plugins, PostCSS mods, CSS variables, theme providers) that must be mirrored.

### 2. Foundation Setup
- [ ] Align TypeScript path aliases in `cws-xm-cloud-app` with the starter’s `@/` usage (tsconfig + Storybook config).
- [ ] Port shared primitives first (`ui` suite, enums, utils, contexts, hooks, types) so downstream components compile.
- [ ] Import styling tokens/variables and update `src/styles/globals.css` or Tailwind config as needed.
- [ ] Configure Storybook/global providers (theme, toaster, localization) to match component expectations.

### 3. Component Migration Loop
For each component directory (see inventory):
- [ ] Copy/adapt `.tsx` and related files into `src/components/<ComponentName>/`.
- [ ] Create or convert Storybook stories with mock data (`ComponentName.stories.tsx`), storing shared mocks in `src/mocks` or colocated files.
- [ ] Update imports to local aliases; ensure TypeScript strict types are satisfied.
- [ ] Export the component via `src/components/index.ts`; update `.sitecore/component-map.ts` if integration stubs are required.
- [ ] Provide mock data structures for CMS-driven props so stories/tests run offline.
- Recommended order: `ui` → `icon`/`image` → container/layout → navigation/header/footer → content blocks → advanced widgets → theme/portal utilities.

### 4. Integration & Cleanup
- [ ] Register any required global providers (theme toggle, toaster, etc.) in `src/app/layout.tsx` or Storybook preview.
- [ ] Update Tailwind config content globs and plugins to include new files.
- [ ] Stub or guard any runtime fetchers so local builds do not require CMS credentials.
- [ ] Resolve TypeScript, lint, or formatting issues introduced during migration.

### 5. Verification
- [ ] Run `npm install` to ensure dependencies resolve.
- [ ] Run `npm run lint`.
- [ ] Run `npm run type-check`.
- [ ] Run `npm run build`.
- [ ] Run `npm run story` and spot-check stories for key components.
- [ ] Run `npm test` (Playwright) or relevant checks.
- [ ] Run Playwright MCP loop (e.g., `npm run agents:init:claude` and execute planner/generator/healer) for at least one newly migrated component test page.
- [ ] Document notable deviations or TODOs in commit/PR notes.

## Implementation Tips
- Add dependencies incrementally; prefer stubs for optional features.
- Confirm alias resolution in TypeScript and Storybook.
- Configure Storybook decorators for themes/localization as needed.
- Provide mocks for Sitecore SDK integrations to keep the app buildable without credentials.
- Port CSS assets or keyframes that components rely on.
- Copy static assets into `public/` or appropriate directories and update paths.
- Consider lightweight tests only if time allows; prioritize Storybook coverage.
- Leverage Playwright MCP agents to plan and heal UI tests for migrated components; store plans under `/specs` and tests under `/tests`.

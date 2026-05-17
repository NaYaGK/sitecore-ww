# CWS Drupal → Sitecore XM Cloud Migration

Enterprise migration project transforming CWS's Drupal-based web presence to **Sitecore XM Cloud** with **Next.js 14**, **Content Hub**, and **Sitecore Search**.

## Project Overview

This repository contains the Phase-1 implementation for migrating **/workwear** and **/healthcare** sections to a modern headless CMS architecture powered by Sitecore XM Cloud, replacing legacy Drupal infrastructure while preserving SEO equity and enabling a 21-locale framework.

### Key Objectives

- Launch /workwear and /healthcare on XM Cloud + Next.js with improved performance (TTFB <1s, LCP <2.5s)
- Replace pink.php with XM Cloud Forms → Sitecore Connect → Salesforce integration
- Power search with Sitecore Search (zero-results <2%)
- Deliver products/assets via Content Hub Experience Edge
- Enable 21-locale framework with top locales at launch
- Maintain SEO parity (redirect coverage ≥98%, proper hreflang/canonicals)

## Solution Architecture

### Technology Stack

- **Content & Rendering:** Sitecore Content SDK for XM Cloud with Next.js 14 App Router
- **Content Delivery:** Experience Edge Delivery GraphQL (authenticated via `sc_apikey`)
- **Authoring/ETL:** Authoring & Management GraphQL API for content import and workflows
- **Products & Assets:** Content Hub Experience Edge (Preview & Delivery GraphQL + CDN)
- **Search:** Sitecore Search React JS SDK + UI components
- **Forms & CRM:** XM Cloud Forms → Sitecore Connect (Workato) → Salesforce
- **Hosting:** Vercel with Edge Config for redirects and feature flags
- **Caching:** ISR (Incremental Static Regeneration) with on-demand revalidation

### Coexistence Strategy

During the migration, Vercel rewrites proxy remaining Drupal routes while new sections run on XM Cloud. Next.js Middleware handles geo/locale/redirect logic, and Edge Config backs redirect data and feature flags.

## Repository Structure

```
cws_sitecore/
├── ai/                          # Agent prompts and scaffolding docs
│   └── prompts/                 # AI prompt templates
├── requirements/                # Product requirements, plans, and assets
│   ├── implementation_plan.md   # Comprehensive Phase-1 plan
│   └── Component Matrix.xlsx    # Component mapping
├── cws-xm-cloud-app/           # Main Next.js XM Cloud application
│   ├── src/                     # Application source code
│   │   ├── components/          # React components
│   │   └── app/                 # Next.js App Router
│   ├── .storybook/             # Storybook configuration
│   ├── sitecore.config.ts      # Sitecore SDK configuration
│   └── package.json            # Dependencies and scripts
├── AGENTS.md                    # Repository guidelines
└── README.md                    # This file
```

## Getting Started

### Prerequisites

Before setting up the project, ensure you have the following installed:

#### Required Software

- **Node.js** >= 18.18.0
  - Verify installation: `node --version`
  - Download from [nodejs.org](https://nodejs.org/)

- **npm** or **yarn** (npm comes with Node.js)
  - Verify installation: `npm --version`

- **.NET 8 SDK** (required for Sitecore CLI)
  - **Requirement:** Sitecore CLI 6.0.23 requires .NET 8 SDK
  - Verify installation: `dotnet --version` (should show version 8.x.x)
  - Download from [.NET Downloads](https://dotnet.microsoft.com/download/dotnet/8.0)
  - **Note:** Ensure you install the SDK (not just the runtime)

#### Sitecore Access

- **Sitecore XM Cloud tenant access** with appropriate permissions
- **Sitecore Management Services** module installed on your Sitecore instance (required for CLI operations)
  - Download from [Sitecore Downloads](https://developers.sitecore.com/downloads/Sitecore_CLI)

#### Configuration

- Environment variables configured (see `.env.example` in `cws-xm-cloud-app` directory)

### Installation

#### 1. Set up Sitecore CLI (Root Directory)

From the main project folder (repository root), first verify that .NET 8 SDK is installed:

```bash
dotnet --version
```

You should see version 8.x.x. If not, install the .NET 8 SDK from the [.NET Downloads page](https://dotnet.microsoft.com/download/dotnet/8.0).

Then restore and install the Sitecore CLI tool:

```bash
dotnet tool restore
```

This installs Sitecore CLI version 6.0.23 as configured in `.config/dotnet-tools.json`. Verify the installation:

```bash
dotnet sitecore --version
```

You should see `6.0.23` or similar. If you encounter errors, ensure:
- .NET 8 SDK (not just runtime) is installed
- You have internet access to download the CLI tool
- Your Sitecore instance has the Management Services module installed

#### 2. Set up Next.js Application

Navigate to the application directory:

```bash
cd cws-xm-cloud-app
```

Install dependencies:

```bash
npm install
```

#### 3. Configure Environment Variables

Copy the example environment file and configure it with your Sitecore credentials:

```bash
cp .env.example .env
# Edit .env with your Sitecore credentials and API keys
```

### Development Commands

All development commands should be run from the `cws-xm-cloud-app` directory.

#### Run Development Server
```bash
cd cws-xm-cloud-app
npm run dev
```
Starts the Next.js development server at http://localhost:3000

#### Run Storybook
```bash
npm run story
```
Starts Storybook at http://localhost:6006 for component development and testing

**What is Storybook?**
Storybook is a UI workbench for building, testing, and documenting components in isolation. Each component state (e.g., "Hero with long title", "empty results") is captured as a "story". It provides designers, content authors, and QA with a living catalog of all blocks available in XM, accelerates accessibility/performance checks, and reduces surprises during migration.

#### Build Storybook
```bash
npm run story:build
```
Creates a production build of Storybook for deployment

#### Other Commands
```bash
npm run build          # Build Next.js application
npm run start          # Start production server
npm run lint           # Run ESLint
npm run type-check     # Run TypeScript checks
npm run format         # Format code with Prettier
npm test               # Run Playwright E2E tests
npm run test:ui        # Run Playwright tests with UI
```

### Sitecore Commands
```bash
npm run sitecore:component:scaffold    # Scaffold new components
npm run sitecore:component:map         # Generate component map
npm run sitecore:component:map:watch   # Watch mode for component map
```

## Key Features

### Component Library
30-40 editor-friendly components built with:
- **Storybook** for component isolation and documentation
- **Radix UI** primitives for accessibility
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- Full a11y compliance (WCAG-AA)

### Content Management
- Visual editing via XM Cloud Pages editor
- Multi-site/multi-language support (21 locales)
- GraphQL-based content delivery via Experience Edge
- ISR with on-demand revalidation

### Search Integration
- Sitecore Search React SDK
- Faceted search with filters
- Typeahead/autocomplete
- Search analytics and tuning

### Forms & CRM
- XM Cloud Forms with webhooks
- Sitecore Connect (Workato) integration
- Salesforce Lead/Case management
- Error handling with DLQ and retries

## Development Guidelines

### AI-Assisted Development

This project supports AI-assisted development for repetitive tasks. See `requirements/implementation_plan.md` sections 8-9 for detailed guidelines on:
- Using AI for component scaffolding
- ETL transform generation
- GraphQL query generation
- Test automation

**Key Rules:**
1. Never push secrets, API keys, or PII
2. READ from Experience Edge Delivery GraphQL; MUTATE via Authoring & Management GraphQL only
3. No persisted queries on Experience Edge (not supported)
4. Prefer ISR over SSR where possible
5. All AI output must pass type checks, tests, and PR review

### Testing Requirements
- **Unit:** 80% coverage for new code
- **E2E:** Playwright smoke tests on top routes
- **a11y:** WCAG-AA compliance via axe
- **Performance:** Lighthouse CI on P0 templates

## Documentation

- **[Implementation Plan](requirements/implementation_plan.md)** - Comprehensive Phase-1 plan with RACI, work plan, and technical specifications
- **[Component Matrix](requirements/Component%20Matrix.xlsx)** - Drupal → XM component mapping
- **[AGENTS.md](AGENTS.md)** - Repository guidelines and conventions

## Key Resources

### Sitecore Documentation
- [Content SDK for XM Cloud](https://doc.sitecore.com/xmc/en/developers/content-sdk/sitecore-content-sdk-for-xm-cloud.html)
- [Experience Edge](https://doc.sitecore.com/xmc/en/developers/xm-cloud/experience-edge.html)
- [Authoring & Management GraphQL API](https://doc.sitecore.com/xmc/en/developers/xm-cloud/sitecore-authoring-and-management-graphql-api.html)
- [Content Hub Experience Edge](https://doc.sitecore.com/ch/en/developers/cloud-dev/experience-edge-for-content-hub-apis.html)
- [Sitecore Search React SDK](https://doc.sitecore.com/search/en/developers/search-js-sdk-for-react/sitecore-search-js-sdk-for-react.html)

### Framework Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Storybook Docs](https://storybook.js.org/docs)
- [Vercel Docs](https://vercel.com/docs)

## Phase Gates

- **Gate A (Week 2):** Content SDK app online, Pages editor connected, rewrites live
- **Gate B (Week 6):** 30+ components in Storybook; CH Edge product pages rendering; Search UI functional
- **Gate C (Week 10):** ETL run ≥70% auto, forms to Salesforce verified, SEO hygiene complete
- **Go-Live (Week 12):** Performance & a11y budgets met; cutover and rollback rehearsed

## Contributing

1. Follow Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
2. Keep PRs focused and reference issues (`Closes #123`)
3. Run linters and tests before committing
4. See [AGENTS.md](AGENTS.md) for detailed guidelines

## License

Proprietary - CWS Internal Project



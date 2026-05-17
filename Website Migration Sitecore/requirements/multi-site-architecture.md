# Multi-Site Architecture (Hybrid: Path-Based + Vercel Rewrites)

This document describes the architecture for `cws-xm-cloud-app`: **CWS, Workwear, and Healthcare** share the same codebase and use path-based routing. Only external backends (e.g. Drupal) use rewrites.

## URL Structure

| Site        | Path prefix      | Served by                    | Example                     |
|-------------|------------------|------------------------------|-----------------------------|
| CWS         | `/` or `/en`     | cws-xm-cloud-app (path-based)| `cws.com/`, `cws.com/en`    |
| Workwear    | `/en/workwear`   | cws-xm-cloud-app (path-based)| `cws.com/en/workwear`       |
| Healthcare  | `/en/healthcare` | cws-xm-cloud-app (path-based)| `cws.com/en/healthcare`     |
| Fire-safety | `/en/fire-safety`| Vercel rewrite → Drupal      | Add explicit rewrites       |

**Note:** All three sites use the same Next.js app and components; content is sourced from their respective Sitecore sites in XM Cloud.

## Implementation in cws-xm-cloud-app

### 1. Sites configuration (`.sitecore/sites.json`)

```json
[
  {"name":"cws","hostName":"*","language":"en"},
  {"name":"workwear","hostName":"*","language":"en"},
  {"name":"healthcare","hostName":"*","language":"en"}
]
```

### 2. Site resolution

- **Middleware** (`src/middleware.ts`): `resolveSiteNameFromPathname()` derives site from path and sets `x-sitecore-site` and `x-site` headers.
- **Page** (`src/pages/[[...path]].tsx`): `getSiteNameFromParams()` passes the site to `client.getPage(path, { locale, site: siteName })`.
- **Layout** (`src/Layout.tsx`): Root element has `data-site={siteName}` and `site-{siteName}` class for site-specific styling.

### 3. Environment variables (single deployment)

Use one set of Sitecore credentials; site content is distinguished by `siteName` passed to the API:

- `SITECORE_EDGE_CONTEXT_ID`
- `SITECORE_API_KEY` / `NEXT_PUBLIC_SITECORE_API_KEY`
- `NEXT_PUBLIC_DEFAULT_SITE_NAME` (default: `cws`)

If separate XM Cloud tenants are used per site, configure additional env vars (e.g. `SITECORE_WORKWEAR_API_KEY`) and update the Sitecore client to switch by site.

### 4. Vercel deployment

- **Root Directory**: `cws-xm-cloud-app`
- **Build Command**: `npm run build`
- **Single project**: One Vercel project serves all sites under the same domain.

### 5. Workwear & healthcare (same codebase, path-based)

Workwear and healthcare are served by **cws-xm-cloud-app** via path-based routing (same codebase as CWS). No proxy or iframe.

- **CWS** `/` or `/en` → site `cws`
- **Workwear** `/en/workwear` → site `workwear` (Sitecore)
- **Healthcare** `/en/healthcare` → site `healthcare` (Sitecore)

All three use the same components; content comes from their respective Sitecore sites.

### 6. Vercel rewrites (external only)

Only external backends use rewrites:

- **Fire-safety** (`/en/fire-safety/*`) → proxy to Drupal

Add explicit rewrites per site. Do not use a generic `/en/:site/:path*` or it would intercept routes before specific rewrites.

See `docs/monorepo-vercel-single-domain-guide.md` for full deployment steps.

## Site-specific styling

Apply styles per site (CWS, Healthcare) with the root class:

```css
.site-healthcare { /* healthcare branding */ }
.site-cws { /* main CWS branding */ }
```

Workwear has its own deployment and branding. Use the `data-site` attribute for component logic.

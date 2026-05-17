# Monorepo + Single Vercel Project (cws.com) – Step-by-Step Guide

This guide describes how to run one repo as an XM Cloud–style monorepo, deploy a **single** Vercel project for **cws.com**, and serve **workwear** and **healthcare** as path-based sites under the same domain. It also covers proxying other (e.g. Drupal) sites under `cws.com/en/...`.

---

## Target setup

| Before | After |
|--------|--------|
| 3 Vercel projects (cws-website, workwear, healthcare) | **1 Vercel project** (e.g. **cws-website**) |
| 3 different domains / hostnames | **One domain: cws.com** |
| Workwear / Healthcare on separate hosts | **cws.com/en/workwear** and **cws.com/en/healthcare** |
| — | **cws.com/en** can also proxy to 3 other (Drupal) sites |

- **CWS** = main site at `cws.com` and `cws.com/en`, etc.
- **Workwear** = `cws.com/en/workwear`, `cws.com/en/workwear/...`
- **Healthcare** = `cws.com/en/healthcare`, `cws.com/en/healthcare/...`
- **Drupal (3 sites)** = e.g. `cws.com/en/<site-a>`, `cws.com/en/<site-b>`, `cws.com/en/<site-c>` → proxy to Drupal.

All three Sitecore sites (cws, workwear, healthcare) live in **one XM Cloud instance** and are served by **one Next.js app** in **one repo** (`cws-xm-cloud-app`).

---

## Step 1: Repo structure (monorepo, use `cws-xm-cloud-app`)

Keep the existing layout; do **not** introduce `apps/web`. The app that Vercel builds is **`cws-xm-cloud-app`**.

```
Website Migration Sitecore/   (repo root)
├── package.json              # root workspace: "cws-xm-cloud-app", "packages/*"
├── xmcloud.build.json        # one rendering host entry pointing at cws-xm-cloud-app
├── cws-xm-cloud-app/         # single Next.js + Content SDK app (used by Vercel)
│   ├── package.json
│   ├── next.config.ts
│   ├── sitecore.config.ts
│   ├── src/
│   │   ├── middleware.ts      # already resolves site from path: /en/workwear → workwear
│   │   ├── pages/
│   │   └── ...
│   └── .sitecore/
│       └── sites.json        # generated; must list cws, workwear, healthcare
├── authoring/                # Sitecore items (rendering hosts, sites, content)
└── docs/
```

- **Root** `package.json`: workspaces = `["cws-xm-cloud-app", "packages/*"]`; scripts run via `npm --workspace cws-xm-cloud-app ...`.
- **Build**: from repo root run `npm run build` (builds `cws-xm-cloud-app`). Vercel will use this same app.

Your app already resolves the site from the URL path in `src/middleware.ts` (`resolveSiteNameFromPathname`) and in `src/pages/[[...path]].tsx` (`getSiteNameFromParams`):

- `cws.com/en` or `cws.com/` → site **cws**
- `cws.com/en/workwear` or `cws.com/en/workwear/...` → site **workwear**
- `cws.com/en/healthcare` or `cws.com/en/healthcare/...` → site **healthcare**

So no extra “monorepo” code is required beyond keeping this single app and configuring Vercel + Sitecore correctly.

---

## Step 2: Single Vercel project (CWS = cws.com)

1. **Use one Vercel project** (e.g. the existing **cws-website** or **CWS**).
2. **Domains**
   - Production: **cws.com** (and www.cws.com if needed).
   - Remove production domains from the old **workwear** and **healthcare** Vercel projects (so only CWS serves cws.com).
3. **Project settings**
   - **Root Directory**: `cws-xm-cloud-app`  
     So the project root in Vercel is the repo root, and the app root is `cws-xm-cloud-app`.
   - **Build Command**: `npm run build` (run from `cws-xm-cloud-app`; same as root workspace script).
   - **Install Command**: `npm ci` (from repo root) or `npm ci` inside `cws-xm-cloud-app` depending on how you run the build; see Step 5.
4. **Environment variables**  
   In Vercel → Project → Settings → Environment Variables, set the same vars you use locally for the **single** deployment (e.g. from `.env.local`), including:
   - `SITECORE_EDGE_CONTEXT_ID`
   - `SITECORE_API_KEY`
   - `NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID`
   - `NEXT_PUBLIC_DEFAULT_SITE_NAME` (e.g. `cws`)
   - `SITECORE_EDITING_SECRET`
   - Any Content Hub / product / Drupal proxy vars you need.

You can keep the other two Vercel projects (workwear, healthcare) for legacy or preview if you want, but **production traffic for cws.com should only go to this one project**.

---

## Step 3: XM Cloud – one rendering host URL (cws.com)

All three Sitecore sites (cws, workwear, healthcare) must use the **same** rendering host URL so that Pages editor and layout work for the single domain.

1. In **XM Cloud** (or Sitecore Connect), open **Rendering Hosts** (or the place where CWS, Workwear, Healthcare rendering hosts are defined).
2. Set **one** base URL for all three:
   - **ServerSideRenderingEngineApplicationUrl**: `https://cws.com/` (or your Vercel production URL until cws.com is live)
   - **ServerSideRenderingEngineConfigUrl**: `https://cws.com/api/editing/config`
   - **ServerSideRenderingEngineEndpointUrl**: `https://cws.com/api/editing/render`
3. Apply this to **cws**, **workwear**, and **healthcare** (replace the current `cws-website-fawn.vercel.app`, `cws-ww.vercel.app`, healthcare URL, etc.).

In this repo, those values are stored under:

- `authoring/items/apikey/Services/Rendering Hosts/cws.yml`
- `authoring/items/apikey/Services/Rendering Hosts/workwear.yml`
- `authoring/items/apikey/Services/Rendering Hosts/healthcare.yml`

Update the three `Value` fields (ServerSideRenderingEngineApplicationUrl, ServerSideRenderingEngineConfigUrl, ServerSideRenderingEngineEndpointUrl) in each file to use `https://cws.com` (or the final production domain). Then deploy authoring to XM Cloud so the instance points all three sites at the same host.

---

## Step 4: Sites and host names in Sitecore (for path-based routing)

Your app resolves the site from the path (`/en/workwear` → workwear). For that to work with **one host** (cws.com), Sitecore must know that cws.com can serve all three sites (e.g. by host name or by path).

1. In **Sitecore XM Cloud** (Content Editor or API), for each site (**cws**, **workwear**, **healthcare**):
   - Ensure the site’s **host name** (or equivalent setting) includes **cws.com** (and optionally the Vercel preview URL).
   - So when a request comes to `cws.com`, the middleware can set `x-sitecore-site` from the path and the layout service can resolve the correct site.
2. After deploy, **sites.json** is generated by `generateSites()` (sitecore-tools build). It should list all three sites and a shared host (e.g. `cws.com`). If your authoring defines the three sites and one rendering host, the generated `.sitecore/sites.json` should look like:

   ```json
   [
     { "name": "cws", "hostName": "cws.com|...", "language": "en" },
     { "name": "workwear", "hostName": "cws.com|...", "language": "en" },
     { "name": "healthcare", "hostName": "cws.com|...", "language": "en" }
   ]
   ```

If `sites.json` is generated from XM Cloud / authoring, sync the site definitions and host names there so that all three appear with the same host.

---

## Step 5: CI/CD (Azure Pipelines) – one pipeline, one Vercel project

Use a **single** pipeline that deploys the **single** app to the **single** Vercel project (CWS).

1. **Install from repo root** so workspaces are available:
   ```yaml
   - script: npm ci
     displayName: 'Install dependencies'
   ```
   (No `cd cws-xm-cloud-app` before `npm ci` if the root has the workspace; then build will be `npm run build` which runs the workspace script.)

2. **Build**: either from root `npm run build` (builds `cws-xm-cloud-app`) or `cd cws-xm-cloud-app && npm run build`. The important part is that the **artifact** Vercel deploys is the same app.

3. **Vercel deploy**: point at the **CWS** project only.
   - **vercelCwd**: `cws-xm-cloud-app` (so Vercel CLI runs in the app directory), **or** leave at repo root and set Vercel **Root Directory** to `cws-xm-cloud-app` (so Vercel’s build runs in that folder).
   - Use **one** `vercelProjectId` (the CWS project).
   - Use the same **vercelToken** / **vercelTeamId** / **vercelOrgId**.

4. **Optional**: Keep separate pipelines for “workwear” and “healthcare” only if you need to deploy the **same** repo to different Vercel projects (e.g. preview); for **production cws.com**, only the CWS pipeline should deploy.

Example (conceptual):

```yaml
# Single pipeline for CWS (cws.com)
steps:
  - script: npm ci
    displayName: 'Install dependencies'
  - task: vercel-deployment-task@3
    inputs:
      vercelCwd: 'cws-xm-cloud-app'
      vercelProjectId: '<CWS_PROJECT_ID>'
      # ... token, team, org
      production: true
```

Ensure **Root Directory** in Vercel matches: if `vercelCwd` is `cws-xm-cloud-app`, then in Vercel the project’s Root Directory should be `cws-xm-cloud-app` (relative to repo root).

---

## Step 6: Proxying Drupal sites under cws.com/en

For paths under `cws.com/en` that should be served by **other** (e.g. Drupal) sites not in this repo:

1. **Option A – Vercel rewrites**  
   In the Vercel project (CWS), add rewrites so that e.g.:
   - `cws.com/en/site-a` → `https://drupal-site-a.example.com/...`
   - `cws.com/en/site-b` → `https://drupal-site-b.example.com/...`
   - `cws.com/en/site-c` → `https://drupal-site-c.example.com/...`  

   Configure this in **Vercel → Project → Settings → Rewrites** (or in `vercel.json` in the repo).

2. **Option B – Next.js rewrites**  
   In `cws-xm-cloud-app/next.config.ts`, extend `rewrites()` to proxy specific path prefixes to the Drupal origins. You must avoid conflicting with `/en/workwear` and `/en/healthcare` (e.g. only proxy `/en/site-a`, `/en/site-b`, `/en/site-c` or whatever the real path prefixes are).

Example pattern (customize paths and destinations):

```ts
// next.config.ts – add to rewrites()
{ source: '/en/site-a', destination: 'https://drupal-site-a.example.com/en/site-a' },
{ source: '/en/site-a/:path*', destination: 'https://drupal-site-a.example.com/en/site-a/:path*' },
// repeat for site-b, site-c
```

3. **Path order**: Put more specific rules (e.g. `/en/workwear`, `/en/healthcare`) before broad Drupal rules so Sitecore paths are handled by the Next.js app and only the intended Drupal prefixes are proxied.

---

## Step 7: Checklist

- [ ] Repo: single app in `cws-xm-cloud-app`; root `package.json` workspaces include it; no duplicate `apps/web` used for this flow.
- [ ] Vercel: one production project (CWS) with domain **cws.com**; Root Directory = `cws-xm-cloud-app`; env vars set.
- [ ] XM Cloud: all three rendering hosts (cws, workwear, healthcare) point to **cws.com** (or same Vercel URL).
- [ ] Sitecore sites: cws, workwear, healthcare have host name cws.com (or equivalent) so path-based resolution works.
- [ ] `sites.json`: after deploy, contains cws, workwear, healthcare with shared host.
- [ ] CI/CD: one pipeline deploys to the CWS Vercel project; install/build use repo root or `cws-xm-cloud-app` consistently.
- [ ] Drupal: rewrites (Vercel or Next.js) for `cws.com/en/<other-sites>` only; do not override `/en/workwear` or `/en/healthcare`.

After this, **cws.com** serves the CWS site, **cws.com/en/workwear** serves workwear, **cws.com/en/healthcare** serves healthcare, and **cws.com/en/...** can proxy to your three Drupal sites where needed.

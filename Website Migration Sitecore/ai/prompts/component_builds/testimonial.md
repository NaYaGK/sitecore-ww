**Variables**
    - `{COMPONENT_SPEC_PATH}` — `ai/prompts/component_specs/testimonial.md`
    - `{COMPONENT_NAME}` — `Testimonial`

  ---

  **Prompt for Docind**

  You’re working inside the Next.js 15 / TypeScript repo `cws-xm-cloud-app`.
  I need a new component built “Storybook-first” (local only for now) so it can later be wired into Sitecore XM Cloud. Use Sass modules for styling.

  **1. Understand the spec and reference UI**

  - Read the component requirements at `ai/prompts/component_specs/testimonial.md`.
  - Inspect the live reference element and URL mentioned in that file. Capture exact fonts, weights, spacing, colors, breakpoints, animations, and iconography so the component matches the reference pixel-for-pixel.

  **2. Plan the files and structure**

  The component must live under `src/components/Testimonial`. Within that folder include:

  - `Testimonial.tsx` — main component (strictly typed props, exported).
  - `Testimonial.module.scss` — all styling here; use Sass features (variables, nesting, mixins) as needed.
  - `Testimonial.props.ts` — Sitecore field/interface definitions if needed.
  - `Testimonial.stories.tsx` — Storybook story with realistic mock data.
  - Optional helper/subcomponent files colocated.

  Also:

  - Add mock factories/data under `src/mocks/components` if required.
  - Update `src/components/index.ts` to re-export the new component.
  - Make sure Storybook knows about the component: keep the story file under the `src/components/**` tree (or update `.storybook/main.ts` if you add a new location) and provide a default export with a unique `title` so the story registers correctly.
  - Keep the structure generic so the same process works for other specs.

  **3. Implementation specifics**

  - Use strict TypeScript. Props should map 1:1 to Sitecore fields described in the spec (titles, subtitles, intro text, repeating items, toggles, background colors, etc.).
  - Reuse existing primitives/utilities (`@/components/ui`, button-component, Icon, `cn`, hooks) to stay consistent with the codebase.
  - Implement the interactions exactly as the spec dictates (accordion behavior, load-more logic, theming, etc.).
  - Mirror the reference design exactly in `Testimonial.module.scss`: fonts, sizes, weights, spacing, border radii, shadows, responsive layout, motion.
  - Ensure accessibility: semantic markup, ARIA attributes, keyboard/focus handling, hover/focus states true to the reference.

  **4. Storybook-first deliverable**

  - `Testimonial.stories.tsx` must render the component using realistic mock data derived from the spec.
  - Cover key states (default, expanded/collapsed, optional features toggled).
  - Ensure the story’s `default` export registers the component (set `component`, `title`, and relevant args/controls).
  - Ensure Storybook runs without runtime warnings (use our `next/image` alias mock).
  - Rely on existing global decorators/providers so theme, router, and Sitecore mocks work.

  **5. Post-checks**

  - Run `npm run story -- --smoke-test` to verify Storybook builds.
  - Run `npm run lint` and `npm run type-check` to keep CI clean.
  - Document any Sitecore integration assumptions or TODOs (dictionary keys, analytics, localization, etc.).

  Deliver the component, Sass module, story, types, and mocks. The Storybook story should be pixel-perfect and ready for wiring into a Sitecore rendering later.

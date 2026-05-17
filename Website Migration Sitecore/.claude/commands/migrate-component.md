# Migrate Storybook Component to Sitecore XM Cloud

Migrate the Storybook component **$ARGUMENTS** to a production-ready Sitecore XM Cloud component using the Sitecore Content SDK.

## Instructions

1. Read the migration prompt template: `ai/prompts/storybook-to-sitecore-migration.md`
2. Use **$ARGUMENTS** as the COMPONENT_NAME (the component folder name in `cws-xm-cloud-app/src/story-book/`)
3. Follow all steps in the migration prompt to create:
   - React component files in `cws-xm-cloud-app/src/components/{COMPONENT_NAME}/`
   - Sitecore template YML files in `authoring/items/templates/cws/Page Content/` (use /Project/ paths only, NOT /Foundation/ or /Feature/)
   - Sitecore rendering YML file in `authoring/items/renderings/cws/Page Content/`
   - Component map registration in `cws-xm-cloud-app/.sitecore/component-map.ts`
4. Generate unique GUIDs for all new Sitecore items using `uuidgen | tr '[:upper:]' '[:lower:]'`
5. **EXECUTE** `cd authoring && dotnet sitecore ser push -n default` to push changes to Sitecore (do not just document - actually run it)
6. **CREATE TEST PAGE** manually in XM Cloud Pages or Content Editor:
   - Create test page at `/sitecore/content/cws/workwear/Home/tests/{component-name}-test`
   - **IMPORTANT:** Create datasource item **under the test page** at `/sitecore/content/cws/workwear/Home/tests/{component-name}-test/Data`
   - **DO NOT** create datasource items under `/sitecore/content/cws/workwear/Data/` - always use the test page path
   - Add the rendering to the test page with the datasource assigned

## Source Location
`cws-xm-cloud-app/src/story-book/$ARGUMENTS/`

## Expected Deliverables
- `cws-xm-cloud-app/src/components/$ARGUMENTS/$ARGUMENTS.tsx`
- `cws-xm-cloud-app/src/components/$ARGUMENTS/$ARGUMENTS.props.ts`
- `cws-xm-cloud-app/src/components/$ARGUMENTS/$ARGUMENTS.module.scss` (only if complex animations needed)
- Template YML files for the component in `authoring/items/templates/cws/Page Content/`
- Rendering YML file in `authoring/items/renderings/cws/Page Content/`
- Updated `cws-xm-cloud-app/.sitecore/component-map.ts`
- Sitecore items pushed via CLI

## Styling Guidelines
- Use Tailwind CSS for all styling (utility-first approach)
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Use CSS variables for theme colors: `var(--color-text)`, `var(--color-accent-primary)`
- Only create SCSS module for complex animations that Tailwind can't handle
- If SCSS module needed, import theme: `@use '../../assets/styles/theme' as *;`
- Never mix global CSS with module CSS - keep all styles scoped

# Storybook to Sitecore XM Cloud Component Migration

## Variables (Update These)

```
COMPONENT_NAME: [ComponentName]  # e.g., Accordion, HeroBanner
```

## Overview

Migrate a Storybook component to a production-ready Sitecore XM Cloud component using the Sitecore Content SDK and CLI.

## IMPORTANT: Use Project Layer Only

**All Sitecore items MUST use the Project layer paths:**
- Templates: `/sitecore/templates/Project/cws/...`
- Renderings: `/sitecore/layout/Renderings/Project/cws/...`

**DO NOT use Foundation or Feature layers** - these are not configured in the serialization module.

## Source & Target Locations

| Type | Path |
|------|------|
| **Source (Storybook)** | `cws-xm-cloud-app/src/story-book/{COMPONENT_NAME}/` |
| **Target (Sitecore)** | `cws-xm-cloud-app/src/components/{COMPONENT_NAME}/` |
| **Templates** | `authoring/items/templates/cws/Page Content/{Component Display Name}/` |
| **Renderings** | `authoring/items/renderings/cws/Page Content/` |
| **Test Pages** | `/sitecore/content/cws/workwear/Home/tests/{component-name}-test` |
| **Component Map** | `cws-xm-cloud-app/.sitecore/component-map.ts` |

**Sitecore Paths (must be Project layer):**
- Templates: `/sitecore/templates/Project/cws/Page Content/...`
- Renderings: `/sitecore/layout/Renderings/Project/cws/Page Content/...`

## Migration Steps

### Step 1: Analyze Source Component

Read all files in `src/story-book/{COMPONENT_NAME}/`:
- `{COMPONENT_NAME}.tsx` - Main component implementation
- `{component-name}.props.ts` - TypeScript interfaces
- `{COMPONENT_NAME}.module.scss` - Styles (if present)
- `{COMPONENT_NAME}.stories.tsx` - Storybook stories (for test data reference)

Identify:
1. All fields and their types (text, rich text, image, link, multilist, etc.)
2. Rendering parameters
3. Child item structures (for multilists)
4. Variants (Default, ThreeUp, Slider, etc.)

### Step 2: Create React Component Files

#### 2.1 Props File (`{COMPONENT_NAME}.props.ts`)

```typescript
import { Field, ImageField, LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';

// For GraphQL datasource pattern (recommended for complex components)
interface {COMPONENT_NAME}Datasource {
  fieldName?: {
    jsonValue?: Field<string>;
  };
  // For multilist fields
  items?: {
    results?: Array<{
      fieldName?: { jsonValue?: Field<string> };
    }>;
  };
}

export interface {COMPONENT_NAME}Props extends ComponentProps {
  params: ComponentProps['params'] & {
    // Rendering parameters
    paramName?: string;
  };
  fields: {
    data?: {
      datasource?: {COMPONENT_NAME}Datasource;
    };
  };
}
```

#### 2.2 Component File (`{COMPONENT_NAME}.tsx`)

**IMPORTANT: Use the flexible field resolution pattern** to handle multiple data formats that Sitecore may deliver:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useSitecore, Text, RichText, Image, Link, type Field } from '@sitecore-content-sdk/nextjs';
import type { {COMPONENT_NAME}Props } from './{component-name}.props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

// Optional: Import SCSS module only if complex animations/transitions needed
// import styles from './{COMPONENT_NAME}.module.scss';

// Helper to convert any field format to Field<string>
const asTextField = (f: any): Field<string> | undefined => {
  if (!f) return undefined;
  const v = f?.jsonValue ?? f;
  if (v == null) return undefined;
  if (typeof v === 'string') return { value: v } as Field<string>;
  if (typeof v?.value === 'string') return v as Field<string>;
  return undefined;
};

// Helper: case-insensitive field access
const pickCI = (obj: any, names: string[]) => {
  if (!obj) return undefined;
  const keys = Object.keys(obj);
  for (const n of names) {
    const k = keys.find((kk) => kk.toLowerCase() === n.toLowerCase());
    if (k && obj[k] != null) return obj[k];
  }
  return undefined;
};

export const Default: React.FC<{COMPONENT_NAME}Props> = (props) => {
  const { fields, rendering } = props;
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;

  // FLEXIBLE FIELD RESOLUTION: Handle multiple data shapes
  const initialDs: any =
    (fields as any)?.data?.datasource ??
    (fields as any)?.datasource ??
    (fields as any) ??
    (rendering as any)?.fields ??
    {};

  const dsId = (rendering as any)?.dataSource || (rendering as any)?.datasource || undefined;
  const [loadedDs, setLoadedDs] = useState<any | null>(null);

  // Determine if we have initial content
  const hasInitialContent = Boolean(
    initialDs &&
      (initialDs.title || initialDs.Title || /* add other key fields */)
  );

  // Fetch datasource if we have an ID but no content (API fallback)
  useEffect(() => {
    const shouldLoad = !!dsId && !hasInitialContent && !loadedDs;
    if (!shouldLoad) return;
    const site = process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME || 'cws';
    const lang = process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || 'en';

    let apiBaseUrl = '';
    if (typeof window !== 'undefined') {
      apiBaseUrl = (window as any).__RENDERING_HOST_URL__ || '';
      if (!apiBaseUrl) {
        const metaTag = document.querySelector('meta[name="rendering-host-url"]');
        apiBaseUrl = metaTag ? metaTag.getAttribute('content') || '' : '';
      }
      if (!apiBaseUrl) {
        apiBaseUrl = window.location.origin;
      }
    }

    fetch(
      `${apiBaseUrl}/api/sitecore-datasource?id=${encodeURIComponent(dsId)}&site=${encodeURIComponent(site)}&lang=${encodeURIComponent(lang)}`,
    )
      .then((r) => r.json())
      .then((json) => {
        if (json?.fields) {
          setLoadedDs(json.fields);
        }
      })
      .catch(() => undefined);
  }, [dsId, hasInitialContent, loadedDs]);

  // Unwrap nested fields if present
  const ds: any =
    loadedDs ??
    (initialDs && typeof initialDs === 'object' && initialDs.fields ? initialDs.fields : initialDs);

  // Map fields using case-insensitive access (handles both Title and title)
  const titleField = asTextField(pickCI(ds, ['title', 'Title']));
  const contentField = asTextField(pickCI(ds, ['content', 'Content', 'body', 'Body']));
  // Add more fields as needed...

  // Check if we have any content
  const hasContent = Boolean(titleField || contentField);
  const hasDatasourceId = Boolean(dsId);
  if (!hasContent && !isEditing && !hasDatasourceId) {
    return <NoDataFallback componentName={rendering?.componentName ?? '{COMPONENT_NAME}'} />;
  }

  return (
    <section
      className={cn('component component-{component-name}', 'your-tailwind-classes')}
      data-component="{COMPONENT_NAME}"
    >
      {/* Use Sitecore field components with the resolved fields */}
      {(titleField || isEditing) && (
        <Text tag="h2" field={titleField} className="..." />
      )}
      {(contentField || isEditing) && (
        <RichText field={contentField} className="..." />
      )}
    </section>
  );
};

export default Default;
```

**Why this pattern is required:**
1. Sitecore delivers data in different formats depending on context (editing vs preview vs delivery)
2. Field names may come as PascalCase or camelCase
3. The API fallback ensures the component works even if fields aren't passed initially
4. The `asTextField` helper normalizes various field formats to the `Field<string>` type expected by SDK components

**Styling Guidelines:**
- Use Tailwind CSS for all styling (utility-first)
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Use CSS variables for theme colors: `var(--color-text)`, `var(--color-accent-primary)`
- Only create SCSS module for complex animations that Tailwind can't handle
- If SCSS module needed, import theme: `@use '../../assets/styles/theme' as *;`
- Never mix global CSS with module CSS - keep modules scoped

#### 2.3 SCSS Module (if needed) (`{COMPONENT_NAME}.module.scss`)

```scss
@use '../../assets/styles/theme' as *;

// Only for complex animations/transitions not possible with Tailwind
.componentName {
  // Use CSS variables for colors
  background-color: var(--color-accent-primary, #{$color-accent-primary});

  // Complex animations
  &[data-state='open'] {
    // ...
  }
}
```

### Step 3: Create Sitecore Template YML Files

Generate unique GUIDs for each item using: `uuidgen | tr '[:upper:]' '[:lower:]'`

#### 3.1 Template Folder (`authoring/items/templates/cws/Page Content/{Display Name}.yml`)

```yaml
---
ID: "{GUID}"
Parent: "5ecb36e0-bd97-428b-acc4-bb261cf72556"
Template: "7ee0975b-0698-493e-b3a2-0b2ef33d0522"
Path: /sitecore/templates/Project/cws/Page Content/{Display Name}
Languages:
- Language: en
  Versions:
  - Version: 1
    Fields:
    - ID: "25bed78c-4957-4165-998a-ca1b52f67497"
      Hint: __Created
      Value: {TIMESTAMP}Z
```

#### 3.2 Data Template (`authoring/items/templates/cws/Page Content/{Display Name}/{COMPONENT_NAME}.yml`)

```yaml
---
ID: "{GUID}"
Parent: "{FOLDER_GUID}"
Template: "ab86861a-6030-46c5-b394-e8f99e8b87db"
Path: /sitecore/templates/Project/cws/Page Content/{Display Name}/{COMPONENT_NAME}
SharedFields:
- ID: "06d5295c-ed2f-4a54-9bf2-26228d113318"
  Hint: __Icon
  Value: Applications/16x16/preferences.png
- ID: "12c33f3f-86c5-43a5-aeb4-5598cec45116"
  Hint: __Base template
  Value: "{1930BBEB-7805-471A-A3BE-4858AC7CF696}"
Languages:
- Language: en
  Versions:
  - Version: 1
    Fields:
    - ID: "25bed78c-4957-4165-998a-ca1b52f67497"
      Hint: __Created
      Value: {TIMESTAMP}Z
```

#### 3.3 Section (`authoring/items/templates/cws/Page Content/{Display Name}/{COMPONENT_NAME}/{Section Name}.yml`)

```yaml
---
ID: "{GUID}"
Parent: "{TEMPLATE_GUID}"
Template: "e269fbb5-3750-427a-9149-7aa950b49301"
Path: /sitecore/templates/Project/cws/Page Content/{Display Name}/{COMPONENT_NAME}/{Section Name}
Languages:
- Language: en
  Versions:
  - Version: 1
```

#### 3.4 Field (`authoring/items/templates/cws/Page Content/{Display Name}/{COMPONENT_NAME}/{Section Name}/{FieldName}.yml`)

**Field Types:**
- Single-Line Text: `Type: "Single-Line Text"`
- Multi-Line Text: `Type: "Multi-Line Text"`
- Rich Text: `Type: "Rich Text"`
- Image: `Type: "Image"`
- General Link: `Type: "General Link"`
- Checkbox: `Type: "Checkbox"`
- Multilist: `Type: "Multilist"` with Source query

```yaml
---
ID: "{GUID}"
Parent: "{SECTION_GUID}"
Template: "455a3e98-a627-4b40-8035-e683a0331ac7"
Path: /sitecore/templates/Project/cws/Page Content/{Display Name}/{COMPONENT_NAME}/{Section Name}/{FieldName}
SharedFields:
- ID: "ab162cc0-dc80-4abf-8871-998ee5d7ba32"
  Hint: Type
  Value: "Single-Line Text"
- ID: "ba3f86a2-4a1c-4d78-b63d-91c2779c1b5e"
  Hint: __Sortorder
  Value: 100
Languages:
- Language: en
  Versions:
  - Version: 1
```

### Step 4: Create Rendering YML File

Create `authoring/items/renderings/cws/Page Content/{COMPONENT_NAME}.yml`:

```yaml
---
ID: "{GUID}"
Parent: "b07340a7-3b23-4d53-97ce-b5014882f014"
Template: "04646a89-996f-4ee7-878a-ffdbf1f0ef0d"
Path: /sitecore/layout/Renderings/Project/cws/Page Content/{COMPONENT_NAME}
SharedFields:
- ID: "037fe404-dd19-4bf7-8e30-4dadf68b27b0"
  Hint: componentName
  Value: {COMPONENT_NAME}
- ID: "1a7c85e5-dc0b-490d-9187-bb1dbcb4c72f"
  Hint: Datasource Template
  Value: /sitecore/templates/Project/cws/Page Content/{Display Name}/{COMPONENT_NAME}
- ID: "a77e8568-1ab3-44f1-a664-b7c37ec7810d"
  Hint: Parameters Template
  Value: "{5E4ED9BD-D6DB-415A-A911-717CDED10E6E}"
- ID: "b5b27af1-25ef-405c-87ce-369b3a004016"
  Hint: Datasource Location
  Value: /sitecore/content/cws/workwear/Data/{COMPONENT_NAME}s
- ID: "e829c217-5e94-4306-9c48-2634b094fdc2"
  Hint: OtherProperties
  Value: IsRenderingsWithDynamicPlaceholders=true
Languages:
- Language: en
  Versions:
  - Version: 1
```

### Step 5: Update Component Map

Edit `cws-xm-cloud-app/.sitecore/component-map.ts`:

```typescript
import {COMPONENT_NAME} from '@components/{COMPONENT_NAME}/{COMPONENT_NAME}';

// Add to componentMap
['{COMPONENT_NAME}', {COMPONENT_NAME} as NextjsContentSdkComponent],
```

### Step 6: Push to Sitecore

```bash
cd authoring
dotnet sitecore ser push -n default
```

### Step 7: Create Example Datasource Items (Required for Testing)

After pushing templates and renderings, create example datasource items using Sitecore serialization. This allows the component to be tested immediately.

#### 7.1 Create Data Folder (if not exists)

Create `authoring/items/site-content-data/Data/{COMPONENT_NAME}s.yml`:

```yaml
---
ID: "{GUID}"
Parent: "210a6a95-4d7a-49f4-b3e1-c429a09297f4"
Template: "a87a00b1-e6db-45ab-8b54-636fec3b5523"
Path: /sitecore/content/cws/workwear/Data/{COMPONENT_NAME}s
Languages:
- Language: en
  Versions:
  - Version: 1
    Fields:
    - ID: "25bed78c-4957-4165-998a-ca1b52f67497"
      Hint: __Created
      Value: {TIMESTAMP}Z
```

#### 7.2 Create Example Datasource Item

Create `authoring/items/site-content-data/Data/{COMPONENT_NAME}s/Sample {COMPONENT_NAME}.yml`:

```yaml
---
ID: "{GUID}"
Parent: "{FOLDER_GUID}"
Template: "{COMPONENT_TEMPLATE_GUID}"
Path: /sitecore/content/cws/workwear/Data/{COMPONENT_NAME}s/Sample {COMPONENT_NAME}
Languages:
- Language: en
  Versions:
  - Version: 1
    Fields:
    - ID: "{TITLE_FIELD_GUID}"
      Hint: Title
      Value: Sample {COMPONENT_NAME} Title
    - ID: "{CONTENT_FIELD_GUID}"
      Hint: Content
      Value: <p>Sample content for testing the {COMPONENT_NAME} component.</p>
    - ID: "25bed78c-4957-4165-998a-ca1b52f67497"
      Hint: __Created
      Value: {TIMESTAMP}Z
    - ID: "d9cf14b1-fa16-4ba6-9288-e8a174d4d522"
      Hint: __Updated
      Value: {TIMESTAMP}Z
```

#### 7.3 For Components with Child Items (e.g., FAQ items, slides)

Create a folder for child items and individual child item files:

**Child Items Folder** (`authoring/items/site-content-data/Data/{ChildItem}s.yml`):

```yaml
---
ID: "{GUID}"
Parent: "210a6a95-4d7a-49f4-b3e1-c429a09297f4"
Template: "a87a00b1-e6db-45ab-8b54-636fec3b5523"
Path: /sitecore/content/cws/workwear/Data/{ChildItem}s
Languages:
- Language: en
  Versions:
  - Version: 1
```

**Example Child Item** (`authoring/items/site-content-data/Data/{ChildItem}s/{ChildItem} 1.yml`):

```yaml
---
ID: "{GUID}"
Parent: "{CHILD_FOLDER_GUID}"
Template: "{CHILD_TEMPLATE_GUID}"
Path: /sitecore/content/cws/workwear/Data/{ChildItem}s/{ChildItem} 1
Languages:
- Language: en
  Versions:
  - Version: 1
    Fields:
    - ID: "{QUESTION_FIELD_GUID}"
      Hint: Question
      Value: "Sample question text?"
    - ID: "{ANSWER_FIELD_GUID}"
      Hint: Answer
      Value: <p>Sample answer text with detailed explanation.</p>
```

**Link Child Items in Parent Datasource** (Multilist field):

```yaml
- ID: "{MULTILIST_FIELD_GUID}"
  Hint: Items
  Value: |
    {CHILD_ITEM_1_GUID}
    {CHILD_ITEM_2_GUID}
    {CHILD_ITEM_3_GUID}
```

#### 7.4 Push Datasource Items

```bash
cd authoring
dotnet sitecore ser push -n default
```

#### 7.5 Verify in Sitecore

After pushing, verify the datasource exists:
```bash
dotnet sitecore ser pull -n site-content-data
```

### Step 8: Create Test Page (Optional)

If you need a dedicated test page:

1. Navigate to XM Cloud Pages or use Content Editor
2. Create test page: `/sitecore/content/cws/workwear/Home/tests/{component-name}-test`
3. Add the rendering to the test page's layout
4. Assign the datasource (`/sitecore/content/cws/workwear/Data/{COMPONENT_NAME}s/Sample {COMPONENT_NAME}`) to the rendering

**Alternative: Use Sitecore CLI to pull existing test page structure:**
```bash
dotnet sitecore ser pull -n site-home-data
```

## Sitecore Template GUIDs Reference

| Template Type | Template GUID |
|---------------|---------------|
| Template | `ab86861a-6030-46c5-b394-e8f99e8b87db` |
| Template Section | `e269fbb5-3750-427a-9149-7aa950b49301` |
| Template Field | `455a3e98-a627-4b40-8035-e683a0331ac7` |
| Rendering Folder | `7ee0975b-0698-493e-b3a2-0b2ef33d0522` |
| Json Rendering | `04646a89-996f-4ee7-878a-ffdbf1f0ef0d` |
| Standard Template (base) | `1930BBEB-7805-471A-A3BE-4858AC7CF696` |
| Default Parameters Template | `5E4ED9BD-D6DB-415A-A911-717CDED10E6E` |

## Parent GUIDs Reference

| Parent Type | Parent GUID |
|-------------|-------------|
| Page Content Templates Folder | `5ecb36e0-bd97-428b-acc4-bb261cf72556` |
| Page Content Renderings Folder | `b07340a7-3b23-4d53-97ce-b5014882f014` |
| Site Data Folder (workwear) | `210a6a95-4d7a-49f4-b3e1-c429a09297f4` |
| Folder Template | `a87a00b1-e6db-45ab-8b54-636fec3b5523` |

## Field Type Values

| Field Type | Value |
|------------|-------|
| Single-Line Text | `Single-Line Text` |
| Multi-Line Text | `Multi-Line Text` |
| Rich Text | `Rich Text` |
| Image | `Image` |
| General Link | `General Link` |
| Checkbox | `Checkbox` |
| Multilist | `Multilist` |
| Treelist | `Treelist` |

## Common Patterns

### Multilist Field Source Query
```yaml
- ID: "1eb8ae32-e190-44a6-968d-ed904c794ebf"
  Hint: Source
  Value: "query:/sitecore/content//*[@@templateid='{ITEM_TEMPLATE_GUID}']"
```

### Child Item Template Pattern

For components with repeating items (e.g., FAQ items, certificates):

1. Create a separate child item template
2. Create multilist field on parent template pointing to child items
3. In React component, iterate through `datasource.items?.results`

## Validation Checklist

- [ ] Component renders without errors in dev mode
- [ ] NoDataFallback shown when no datasource AND no datasource ID
- [ ] Component uses flexible field resolution pattern (handles multiple data shapes)
- [ ] Component uses `asTextField` and `pickCI` helpers for field normalization
- [ ] Component fetches from API if datasource ID present but fields empty
- [ ] All fields editable in XM Cloud Pages
- [ ] Styles work correctly (no CSS conflicts)
- [ ] Component registered in component-map.ts
- [ ] Template and rendering pushed to Sitecore
- [ ] **Example datasource items created and pushed** (required for testing)
- [ ] Test page created with sample content (optional but recommended)
- [ ] TypeScript types pass `npm run type-check`
- [ ] No SCSS/CSS global conflicts

## Troubleshooting

### "Accordion requires a datasource item assigned" Error

If you see this error after adding a component, it means the component cannot find its data. Check:

1. **Verify datasource exists in Sitecore:**
   ```bash
   cd authoring
   dotnet sitecore ser pull -n site-content-data
   ```
   Check that your datasource YML files are pulled with content.

2. **Verify component uses flexible field resolution:**
   The component must check multiple data paths:
   ```typescript
   const initialDs =
     fields?.data?.datasource ??
     fields?.datasource ??
     fields ??
     rendering?.fields ??
     {};
   ```

3. **Verify API fallback is implemented:**
   If the component has a datasource ID but fields are empty, it should fetch from `/api/sitecore-datasource`.

4. **Verify the rendering's Datasource Location:**
   In the rendering YML, ensure `Datasource Location` points to the correct path:
   ```yaml
   - ID: "b5b27af1-25ef-405c-87ce-369b3a004016"
     Hint: Datasource Location
     Value: /sitecore/content/cws/workwear/Data/{COMPONENT_NAME}s
   ```

### Field Values Not Rendering

If fields appear empty:

1. **Check field name casing:** Use `pickCI` helper to handle both `title` and `Title`
2. **Check field format:** Use `asTextField` helper to normalize `jsonValue` wrapped and direct formats
3. **Check if child items are linked:** For multilist fields, ensure child item GUIDs are in the parent datasource

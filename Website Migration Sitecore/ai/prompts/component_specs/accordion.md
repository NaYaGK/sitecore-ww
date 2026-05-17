# Requirements

## Name
Accordion

## Description
Expandable FAQ container used to present grouped questions and answers. Authors can supply an optional intro with subtitle, then curate individual accordion items that reveal detailed answers on click. Component supports lazy loading and can reveal additional items with a “Load more” control.

## Fields

### Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Headline displayed above the accordion; keep concise (e.g., “Frequently asked questions”).
- **Example Value**: `Frequently asked questions`

### Subtitle
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional sub-heading shown under the main title to frame the content.
- **Example Value**: `Answers about our rental and laundry service`

### Introduction Text
- **Field Type**: Rich Text
- **Required**: No
- **Repeating**: No
- **Notes**: Brief descriptive paragraph preceding the accordion list; supports bold text and inline links.
- **Example Value**: `<p>Find quick answers about delivery intervals, textile care, and service options.</p>`

### Accordion Items
- **Field Type**: Treelist (Accordion Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Ordered list of FAQ entries rendered in the accordion; first item loads expanded by default.
- **Example Value**: Service Process, Delivery Cycle, Textile Care

#### Accordion Item Fields:
- **Question**: Single-Line Text - Title displayed on the accordion trigger.
- **Answer**: Rich Text - Content revealed when the panel expands; supports lists and inline links.
- **Anchor ID**: Single-Line Text - Optional anchor for deep-linking directly to the FAQ entry.

### Load More Button Text
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Overrides the default “Load more” label used when the component hides items beyond the initial set.
- **Example Value**: `Show more questions`

### Load More Enabled
- **Field Type**: Checkbox
- **Required**: No
- **Repeating**: No
- **Notes**: When checked, only the first three items render initially; remaining items appear after clicking the button.
- **Example Value**: Checked

### Background Theme
- **Field Type**: Droplist
- **Required**: No
- **Repeating**: No
- **Notes**: Selects alternate background shading (e.g., `white`, `light-grey`, `yellow`) to match adjacent sections.
- **Example Value**: `Light-grey`

## Example Reference
* **URL**: https://www.cws.com/en/workwear/products
* **Element**: `<div class="paragraph paragraph--type--faq lazy-load workwear lazy-inst-1">`

## Notes
- Component lazy-loads content to improve performance; ensure important FAQs appear in the first three slots.
- Only one accordion panel opens at a time; expanding a new item automatically collapses the previous one.
- Provide concise questions and direct answers to maintain scannability, especially on mobile devices.

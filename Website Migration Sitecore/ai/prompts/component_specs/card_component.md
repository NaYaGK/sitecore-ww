# Requirements

## Name
Card Component

## Description
Reusable content card used across grids, sliders, and column layouts. Presents an icon or image, concise title, rich text body, and optional link. Designed for maximum flexibility so other components can reference it as a datasource template.

## Fields

### Icon
- **Field Type**: Image
- **Required**: No
- **Repeating**: No
- **Notes**: Optional icon displayed above the title; upload SVG or transparent PNG (64×64px).
- **Example Value**: `media library/Icons/washer.svg`

### Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Card headline; keep under 60 characters.
- **Example Value**: `All-inclusive service`

### Body Copy
- **Field Type**: Rich Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Supporting text supporting up to two short paragraphs or bullet list.
- **Example Value**: `<p>We collect, wash, repair, and deliver your garments on a schedule tailored to your needs.</p>`

### CTA Text
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional label for the card link; defaults to “Learn more” when blank.
- **Example Value**: `Explore rental service`

### CTA Link
- **Field Type**: General Link
- **Required**: No
- **Repeating**: No
- **Notes**: Destination URL for the CTA. If empty, the card renders without a footer link.
- **Example Value**: `/en/workwear/service`

## Example Reference
* **URL**: https://www.cws.com/en/healthcare
* **Element**: `<div class="paragraph paragraph--type--card">`

## Notes
- Card markup adapts to various host components, inheriting their layout and hover styling.
- When used in sliders or masonry grids, keep copy lengths consistent to maintain alignment.
- Icon field can be repurposed for small photos if needed, but maintain aspect ratio for visual harmony.


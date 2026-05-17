# Requirements

## Name
IndustryCard

## Description
Promotional card that highlights a single industry segment within the “Workwear for your industry” grid. Each card presents an image, industry title, and a “Discover it” style call-to-action, all linked to the relevant sector landing page. Cards display in a three-column layout on desktop, collapsing to fewer columns on smaller breakpoints, and feature a subtle color band behind the text/CTA area.

## Fields

### Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Shown as the card heading and link text; keep under ~40 characters to avoid wrapping issues.
- **Example Value**: “Construction industry”

### Destination Link
- **Field Type**: General Link
- **Required**: Yes
- **Repeating**: No
- **Notes**: Entire card (image, title, CTA) links to this URL. Supports internal Sitecore items or external URLs. Ensure target page exists.
- **Example Value**: `/en/workwear/sectors/construction`

### Image
- **Field Type**: Image
- **Required**: Yes
- **Repeating**: No
- **Notes**: Landscape imagery cropped to ~600×400; object-fit cover is applied. Provide descriptive alternate text for accessibility.
- **Example Value**: Photograph of workers wearing CWS workwear on site.

### CTA Text
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Short action phrase displayed next to an inline arrow (e.g., “Discover it”). Defaults to localized copy if left blank.
- **Example Value**: “Discover it”

### Theme Tag
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional style token (e.g., “workwear”) that maps to a CSS class controlling the header background color. Leave empty for default styling.
- **Example Value**: “workwear”

## Example Reference
* **URL**: https://www.cws.com/en/workwear/sectors
* **Element**: <div class="paragraph paragraph--type--teaser has-image">

## Notes
- Cards render inside a multi-column grid (`.teasers-col.three-col`) that becomes two/one columns responsively; ensure cards adapt to container width.
- The image link wraps only the media; title and CTA sit in a colored header band that also links to the same destination.
- Hover states slightly lift or highlight the CTA area; maintain focus styles for keyboard navigation.
- When localized, ensure CTA and title lengths remain balanced to avoid overflow in the narrow mobile layout.

# Requirements

## Name
Link Component

## Description
Standalone inline link styled as a text CTA with arrow icon. Commonly used beneath body copy to direct users to related resources without the visual weight of a full button. Supports optional analytics tagging.

## Fields

### Link Text
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Visible label for the link.
- **Example Value**: `Discover our hygiene services`

### Destination
- **Field Type**: General Link
- **Required**: Yes
- **Repeating**: No
- **Notes**: Target URL; supports internal and external links.
- **Example Value**: `/en/healthcare/services`

### Open In New Tab
- **Field Type**: Checkbox
- **Required**: No
- **Repeating**: No
- **Notes**: When checked, adds `target="_blank"` for external destinations.
- **Example Value**: Checked

### Tracking ID
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Custom analytics identifier appended as data attribute.
- **Example Value**: `cta-hygiene-overview`

## Example Reference
* **URL**: https://www.cws.com/en/arbeitskleidung/ci-kleidung
* **Element**: `<div class="paragraph paragraph--type--links">`

## Notes
- Renders inline within a wrapper so it can align left or centre depending on container.
- Keep link text short; component automatically appends the chevron glyph.
- Ensure tracking IDs follow analytics naming conventions for easy reporting.


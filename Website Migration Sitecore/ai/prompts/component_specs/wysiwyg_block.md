# Requirements

## Name
WYSIWYG Block

## Description
Flexible rich-text section used for body copy, inline imagery, and simple content embeds. Renders a full-width text block with default typography and supports headings, lists, links, and inline images defined by authors. Frequently used to add narrative context or supplementary information between structured components.

## Fields

### Content
- **Field Type**: Rich Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Supports headings (H2–H4), paragraphs, inline links, images, and tables; text is wrapped in the standard article styling.
- **Example Value**: `<p>Our rental service keeps your team equipped with hygienically prepared garments, delivered on schedule.</p>`

### Anchor ID
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional HTML anchor inserted on the wrapping section for jump links; restrict to lowercase alphanumeric with hyphens.
- **Example Value**: `service-overview`

## Example Reference
* **URL**: https://www.cws.com/en/workwear
* **Element**: `<div class="paragraph paragraph--type--wysiwyg-text">`

## Notes
- Inherits default typography; refrain from pasting inline styles or deprecated HTML to maintain consistency.
- Component spans full width but text column is constrained; use multiple instances to alternate with media-led components.
- Embedded links should open in the same tab unless referencing external resources that require a new window.


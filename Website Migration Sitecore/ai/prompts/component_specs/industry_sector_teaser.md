# Requirements

## Name
Industry Sector Teaser

## Description
Individual card representing a single industry within the teaser grid. Displays an image, sector title, and CTA text that links to the detailed sector landing page. Cards support a subtle hover lift and inherit brand colour accents.

## Fields

### Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Industry name displayed prominently on the card.
- **Example Value**: `Construction`

### Image
- **Field Type**: Image
- **Required**: Yes
- **Repeating**: No
- **Notes**: Landscape image (min 1200×750) illustrating the industry; use imagery with clear focal point.
- **Example Value**: `media library/Industries/construction-team.jpg`

### CTA Text
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Call-to-action label shown under the title.
- **Example Value**: `Discover it`

### CTA Link
- **Field Type**: General Link
- **Required**: Yes
- **Repeating**: No
- **Notes**: Destination sector page; supports internal items and external URLs.
- **Example Value**: `/en/workwear/sectors/construction`

### Theme Tag
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional style token (e.g., `workwear`, `hygiene`) controlling background accent.
- **Example Value**: `workwear`

## Example Reference
* **URL**: https://www.cws.com/en/workwear/sectors
* **Element**: `<div class="teasers-col three-col">`

## Notes
- Cards occupy equal height and align within a masonry grid; keep CTA text lengths consistent.
- Entire card is clickable, combining image, title, and CTA to the same destination.
- Provide descriptive alt text and ensure imagery works when cropped at various breakpoints.


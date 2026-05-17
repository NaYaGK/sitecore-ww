# Requirements

## Name
Image component

## Description
Full-width image block used to break up page content with a single impactful visual. Supports captioning and optional link to a gallery or download. Image scales responsively to the viewport width while preserving aspect ratio.

## Fields

### Image
- **Field Type**: Image
- **Required**: Yes
- **Repeating**: No
- **Notes**: Upload high-resolution landscape image (min 1920×1080); component auto-generates responsive sizes.
- **Example Value**: `media library/Heroes/elderly-care-service.jpg`

### Alt Text
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Accessible description read by screen readers; defaults to media alt text if blank.
- **Example Value**: `CWS service technician delivering freshly laundered garments`

### Caption
- **Field Type**: Multi-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional caption displayed below the image in smaller text.
- **Example Value**: `Deliveries are scheduled weekly to keep your staff equipped.`

### Link
- **Field Type**: General Link
- **Required**: No
- **Repeating**: No
- **Notes**: Optional link wrapping the image; use sparingly to avoid unexpected navigation.
- **Example Value**: `/en/healthcare/service`

## Example Reference
* **URL**: https://www.cws.com/en/healthcare/elderly-care/residens-service
* **Element**: `<div class="paragraph full paragraph--type--image-full-width">`

## Notes
- Image stretches to full browser width; ensure key focal points remain within safe centre area for smaller screens.
- Lazy loading is enabled by default; large images should be optimised for web to maintain performance.
- When linking the image, include descriptive alt text indicating the action (“Learn more about…”).


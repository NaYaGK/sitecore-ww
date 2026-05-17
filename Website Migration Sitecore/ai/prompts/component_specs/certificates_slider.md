# Requirements

## Name
Certificates Slider

## Description
Carousel showcasing sustainability and quality certificates relevant to the solution area. Each slide features a certificate logo, title, and supporting text, with optional CTA leading to detailed documentation. Component auto-scrolls on desktop and supports swipe gestures on touch devices.

## Fields

### Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Heading displayed above the slider; keep concise.
- **Example Value**: `Certified sustainability partners`

### Certificates
- **Field Type**: Treelist (Certificate Slide)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Ordered list of certificate slides; three to six slides recommended for optimal loop experience.
- **Example Value**: OEKO-TEX®, ISO 9001, wear2wear™

#### Certificate Slide Fields:
- **Title**: Single-Line Text - Certificate or partner name displayed prominently.
- **Description**: Rich Text - Short explanation (max 60 words) describing the certification.
- **Logo**: Image - Transparent PNG/SVG logo sized to 160×160px.
- **CTA Text**: Single-Line Text - Optional text link such as “View certificate”.
- **CTA Link**: General Link - Destination for additional information or downloadable proof.

### Section CTA
- **Field Type**: General Link
- **Required**: No
- **Repeating**: No
- **Notes**: Optional button displayed beneath the carousel linking to a full list of certificates.
- **Example Value**: `/en/workwear/certificates`

### Auto Play
- **Field Type**: Checkbox
- **Required**: No
- **Repeating**: No
- **Notes**: Enables automatic slide rotation when checked; defaults to manual navigation.
- **Example Value**: Checked

## Example Reference
* **URL**: https://www.cws.com/en/workwear
* **Element**: `<div class="paragraph paragraph--type--certificates certificates-inst-1" data-once="certificatesSlider">`

## Notes
- Slider displays navigation arrows and pagination dots on desktop; on mobile it converts to a swipeable deck.
- Maintain consistent logo sizing to avoid layout shifts between slides.
- When autoplay is active, ensure focus management allows keyboard users to pause via arrow navigation.


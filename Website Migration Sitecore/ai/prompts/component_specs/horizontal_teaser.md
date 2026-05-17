# Requirements

## Name
Horizontal Teaser

## Description
Two-column promotional band pairing imagery with text to spotlight campaigns, partnerships, or service highlights. Desktop layout positions image and text side by side with optional CTA; tablet and mobile stack the content while preserving visual hierarchy. Supports left/right image placement for alternating storytelling.

## Fields

### Eyebrow
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Small overline shown above the main headline; use for category or partnership labels.
- **Example Value**: `Partnership`

### Headline
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Primary statement displayed in large type; keep under 80 characters.
- **Example Value**: `wear2wear™ closes the textile loop`

### Description
- **Field Type**: Rich Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Supporting copy (one or two short paragraphs) explaining the teaser content.
- **Example Value**: `<p>Discover how our cooperative turns worn garments into new high-performance textiles.</p>`

### Image
- **Field Type**: Image
- **Required**: Yes
- **Repeating**: No
- **Notes**: 4:3 or 16:9 image cropped to align with viewport height; upload at least 1600px wide for retina displays.
- **Example Value**: `media library/Teasers/wear2wear-machine.jpg`

### Image Position Left
- **Field Type**: Checkbox
- **Required**: No
- **Repeating**: No
- **Notes**: When checked, image renders on the left and text on the right; defaults to image on the right.
- **Example Value**: Checked

### Primary CTA
- **Field Type**: General Link
- **Required**: No
- **Repeating**: No
- **Notes**: Button displayed beneath the description; use to link to campaign landing pages.
- **Example Value**: `/en/workwear/sustainability/wear2wear`

### Secondary CTA
- **Field Type**: General Link
- **Required**: No
- **Repeating**: No
- **Notes**: Optional text link rendered inline next to the primary CTA; ideal for related resources.
- **Example Value**: `/en/workwear/recycling`

## Example Reference
* **URL**: https://www.cws.com/en/workwear
* **Element**: `<div class="paragraph paragraph--type--horizontal-teasers">`

## Notes
- Ensure imagery contains sufficient negative space so text overlays do not obscure critical content on narrow screens.
- Component uses lazy loading for images; provide meaningful alt text for accessibility.
- For alternating layouts, place consecutive teasers with opposing image positions to create visual rhythm.


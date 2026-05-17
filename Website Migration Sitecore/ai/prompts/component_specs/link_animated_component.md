# Requirements

## Name
Link Animated Component

## Description
Animated highlight module combining background imagery with animated hotspots and supporting copy. Used to illustrate how smart lockers or service components work, with the animation cycling through key benefits. Includes CTA linking to detailed solution pages.

## Fields

### Eyebrow
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Small label displayed above the headline (e.g., solution category).
- **Example Value**: `Smart lockers`

### Headline
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Main message shown alongside the animated visual.
- **Example Value**: `Digital locker solutions for modern workplaces`

### Description
- **Field Type**: Rich Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Supporting copy describing the feature; can include bullet list.
- **Example Value**: `<p>Automate garment pick-up, returns, and reporting with RFID-enabled lockers.</p>`

### Background Image
- **Field Type**: Image
- **Required**: Yes
- **Repeating**: No
- **Notes**: Large illustration or photo used in the animated area; 1920×1080 recommended.
- **Example Value**: `media library/Highlights/smart-locker-hero.png`

### Animation Steps
- **Field Type**: Treelist (Highlight Step Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Ordered steps referenced by the animation to reveal tooltips or highlights.
- **Example Value**: `User badges in`, `Garment dispensed`, `Usage analytics`

#### Highlight Step Item Fields:
- **Step Title**: Single-Line Text - Label displayed in the UI control.
- **Tooltip Copy**: Rich Text - Text shown when the step is active.
- **Hotspot Position**: Single-Line Text - Coordinates or CSS class for hotspot placement (e.g., `top-30 left-60`).
- **Icon**: Image - Optional icon displayed with the tooltip.
- **Link**: General Link - Optional deep link when the step is clicked.

### CTA Link
- **Field Type**: General Link
- **Required**: Yes
- **Repeating**: No
- **Notes**: Primary button directing users to the detailed solution page.
- **Example Value**: `/en/workwear/additional-solutions/smartlockers`

### CTA Text
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Label for the CTA button.
- **Example Value**: `Learn more`

## Example Reference
* **URL**: https://www.cws.com/en/workwear/additional-solutions/smartlockers
* **Element**: `<div class="paragraph paragraph--type--highlight-component highlight-component-image-1">`

## Notes
- Animation is driven by data attributes generated from the Highlight Step items; ensure hotspot coordinates are valid percentages.
- Component auto-plays through steps but provides controls for manual navigation.
- Provide fallback alt text and accessible descriptions for each step so screen-reader users can follow the sequence.


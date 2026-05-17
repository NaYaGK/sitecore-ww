# Requirements

## Name
Hero Banner

## Description
Full-width hero module that opens solution-area and campaign pages. Displays a large background image, bold headline, supporting copy, and optional call-to-action buttons. Component can surface a form teaser, show a scrolling indicator, and adapt layout alignment to emphasize imagery or messaging.

## Fields

### Headline
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Main H1-style statement rendered in the hero content area; keep under ~70 characters for readability.
- **Example Value**: `Workwear solutions for every industry`

### Supporting Copy
- **Field Type**: Rich Text
- **Required**: No
- **Repeating**: No
- **Notes**: Short descriptive paragraph beneath the headline; supports bold and inline links.
- **Example Value**: `Discover our rental service, repair workflows, and textile recycling initiatives.`

### Background Image
- **Field Type**: Image
- **Required**: Yes
- **Repeating**: No
- **Notes**: 16:9 or 3:2 landscape image that fills the hero background; upload a 2400px-wide asset to preserve sharpness.
- **Example Value**: `media library/Heroes/workwear-team.jpg`

### Secondary Visual
- **Field Type**: Image
- **Required**: No
- **Repeating**: No
- **Notes**: Optional foreground or teaser image displayed on layouts where content aligns left; supports transparent PNGs.
- **Example Value**: `media library/Heroes/locker-system.png`

### Primary CTA
- **Field Type**: General Link
- **Required**: No
- **Repeating**: No
- **Notes**: Prominent button placed directly under the supporting copy; use to drive form submissions or key page navigation.
- **Example Value**: `/en/workwear/contact`

### Secondary CTA
- **Field Type**: General Link
- **Required**: No
- **Repeating**: No
- **Notes**: Optional ghost-style button rendered next to the primary CTA; ideal for secondary messaging.
- **Example Value**: `/en/workwear/service-overview`

### Scroll Arrow Enabled
- **Field Type**: Checkbox
- **Required**: No
- **Repeating**: No
- **Notes**: Toggles the animated “scroll down” indicator anchored to the bottom of the hero.
- **Example Value**: Checked

### Display Lead Form
- **Field Type**: Checkbox
- **Required**: No
- **Repeating**: No
- **Notes**: Reveals a button that opens a modal lead form; ensure a form is referenced when enabled.
- **Example Value**: Checked

### Lead Form
- **Field Type**: Droplink
- **Required**: Conditional
- **Repeating**: No
- **Notes**: Select the Sitecore form item launched when “Display Lead Form” is enabled; leave blank otherwise.
- **Example Value**: `/sitecore/forms/CWS/Contact/RequestConsultation`

### Solution Area Tag
- **Field Type**: Droplist
- **Required**: No
- **Repeating**: No
- **Notes**: Optional taxonomy value displayed as a badge above the headline; drives styling variations.
- **Example Value**: `Workwear`

### Alignment
- **Field Type**: Droplist
- **Required**: No
- **Repeating**: No
- **Notes**: Controls whether the copy aligns left, center, or right; options map to CSS classes such as `align-left`, `align-center`.
- **Example Value**: `Left`

## Example Reference
* **URL**: https://www.cws.com/en/workwear
* **Element**: `<div id="block-heroblock" class="block block-cws-solution-area">`

## Notes
- Hero occupies full viewport height on desktop and compresses to a 3:4 aspect ratio on mobile while keeping CTAs visible.
- Images load lazily with background overlays to ensure text contrast; provide imagery dark enough for WCAG-compliant text color.
- When a form CTA is configured, the component opens a modal overlay using shared dialog styling—verify that selected forms are responsive.


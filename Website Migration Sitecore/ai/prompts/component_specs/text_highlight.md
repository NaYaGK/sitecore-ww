# Requirements

## Name
Text Highlight

## Description
Prominent text block used to emphasise core messaging within a landing page sequence. Renders a bold headline followed by multi-paragraph rich text, often centred within generous white space. Ideal for storytelling moments or mission statements that need visual weight.

## Fields

### Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: H2-styled heading; keep concise to retain a single line on desktop.
- **Example Value**: `Sustainable workwear powered by circular services`

### Content
- **Field Type**: Rich Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Rich body copy supporting the headline; may include inline links, bold text, and short lists.
- **Example Value**: `<p>From fibre selection to recycling, we manage your garments responsibly and transparently.</p>`

### Eyebrow Label
- **Field Type**: Single-Line Text
- **Required**: No
- **Repeating**: No
- **Notes**: Optional overline displayed above the title in small caps.
- **Example Value**: `Our promise`

### Theme
- **Field Type**: Droplist
- **Required**: No
- **Repeating**: No
- **Notes**: Selects background highlight variant (`light`, `grey`, `red`); leave blank for default white background.
- **Example Value**: `Light`

## Example Reference
* **URL**: https://www.cws.com/en/workwear
* **Element**: `<div class="paragraph paragraph--type--text-highlight">`

## Notes
- Component is full-width but text column is centred and constrained—avoid embedding large tables or media.
- For accessibility, ensure contrast ratio remains compliant when selecting coloured backgrounds.
- Use multiple instances sparingly; reserve for key narrative beats within the page.


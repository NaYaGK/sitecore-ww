# Requirements

## Name
Areas Component

## Description
Circular donut-style component highlighting key solution areas around a central graphic. Surrounding cards describe each area with icon, title, and short copy, while the central image reinforces the theme. Often used on healthcare landing pages to depict the breadth of services.

## Fields

### Title
- **Field Type**: Single-Line Text
- **Required**: Yes
- **Repeating**: No
- **Notes**: Heading displayed above the donut illustration.
- **Example Value**: `Our healthcare expertise`

### Center Image
- **Field Type**: Image
- **Required**: Yes
- **Repeating**: No
- **Notes**: Circular illustration or photograph placed in the middle of the component; 800×800px recommended.
- **Example Value**: `media library/Illustrations/healthcare-donut.png`

### Area Cards
- **Field Type**: Treelist (Area Card Item)
- **Required**: Yes
- **Repeating**: Yes
- **Notes**: Collection of cards positioned around the donut; order controls clockwise arrangement.
- **Example Value**: `Patient care`, `Facility hygiene`, `Digital services`

#### Area Card Item Fields:
- **Icon**: Image - Small icon (48×48px) displayed above the title.
- **Title**: Single-Line Text - Name of the area.
- **Description**: Rich Text - 1–2 sentence overview of the service area.
- **CTA Text**: Single-Line Text - Optional button label.
- **CTA Link**: General Link - Destination for more information.

## Example Reference
* **URL**: https://www.cws.com/en/healthcare
* **Element**: `<div class="paragraph paragraph--type--solution-offerings-donut doughnut-inst-1">`

## Notes
- Cards animate into view as users scroll; ensure copy lengths are balanced to maintain visual harmony.
- On mobile the donut collapses into a vertical list—central image appears first followed by cards.
- Icons and titles can inherit accent colours based on site theme; keep icon backgrounds transparent.

